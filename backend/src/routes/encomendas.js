export default async function encomendasRoutes(fastify) {
  const prisma = fastify.prisma

  fastify.get('/encomendas', async (request, reply) => {
    const { estado } = request.query
    const where = {}
    if (estado) where.estado = estado

    const encomendas = await prisma.encomenda.findMany({
      where,
      include: {
        fornecedor: true,
        linhas: { include: { artigo: true } }
      },
      orderBy: { dataEncomenda: 'desc' }
    })

    return encomendas.map(e => ({
      ...e,
      totalLinhas: e.linhas.length,
      valorTotal: e.linhas.reduce((s, l) => s + l.quantidadeEncomendada * l.precoUnitario, 0),
      diasAtraso: e.dataEntregaPrevista && !e.dataEntregaReal && ['PENDENTE', 'PARCIAL'].includes(e.estado)
        ? Math.max(0, Math.ceil((new Date() - new Date(e.dataEntregaPrevista)) / 86400000))
        : 0
    }))
  })

  fastify.get('/encomendas/:id', async (request, reply) => {
    const { id } = request.params
    const encomenda = await prisma.encomenda.findUnique({
      where: { id },
      include: {
        fornecedor: true,
        linhas: { include: { artigo: true } }
      }
    })
    if (!encomenda) return reply.code(404).send({ error: 'Encomenda não encontrada' })
    return {
      ...encomenda,
      valorTotal: encomenda.linhas.reduce((s, l) => s + l.quantidadeEncomendada * l.precoUnitario, 0)
    }
  })

  fastify.post('/encomendas', async (request, reply) => {
    const { fornecedorId, dataEntregaPrevista, observacoes, linhas } = request.body

    if (!fornecedorId || !linhas || linhas.length === 0) {
      return reply.code(400).send({ error: 'Campos obrigatórios em falta' })
    }

    // Generate order number
    const count = await prisma.encomenda.count()
    const numero = `ENC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`

    const encomenda = await prisma.encomenda.create({
      data: {
        numero,
        fornecedorId,
        dataEntregaPrevista: dataEntregaPrevista ? new Date(dataEntregaPrevista) : null,
        observacoes,
        linhas: {
          create: linhas.map(l => ({
            artigoId: l.artigoId,
            quantidadeEncomendada: l.quantidadeEncomendada,
            precoUnitario: l.precoUnitario
          }))
        }
      },
      include: {
        fornecedor: true,
        linhas: { include: { artigo: true } }
      }
    })

    return reply.code(201).send(encomenda)
  })

  // POST /encomendas/:id/recepcao — dar entrada de stock a partir de uma encomenda
  fastify.post('/encomendas/:id/recepcao', async (request, reply) => {
    const { id } = request.params
    // linhas: [{ linhaId, quantidadeRecebida, localizacaoId, numeroLote, dataValidade, loteId }]
    const { linhas, utilizador } = request.body

    if (!linhas || linhas.length === 0 || !utilizador) {
      return reply.code(400).send({ error: 'Campos obrigatórios em falta' })
    }

    const encomenda = await prisma.encomenda.findUnique({
      where: { id },
      include: { linhas: { include: { artigo: true } } }
    })
    if (!encomenda) return reply.code(404).send({ error: 'Encomenda não encontrada' })
    if (encomenda.estado === 'COMPLETA' || encomenda.estado === 'CANCELADA') {
      return reply.code(400).send({ error: `Encomenda já está ${encomenda.estado}` })
    }

    await prisma.$transaction(async (tx) => {
      for (const recepcao of linhas) {
        if (!recepcao.quantidadeRecebida || recepcao.quantidadeRecebida <= 0) continue

        const linha = encomenda.linhas.find(l => l.id === recepcao.linhaId)
        if (!linha) continue

        const artigo = linha.artigo
        let loteId = recepcao.loteId || null

        // Criar ou reutilizar lote se artigo necessita de lote
        if (artigo.necessitaLote && recepcao.numeroLote && recepcao.dataValidade) {
          const loteExistente = await tx.lote.findFirst({
            where: { numeroLote: recepcao.numeroLote, artigoId: artigo.id }
          })
          if (loteExistente) {
            await tx.lote.update({
              where: { id: loteExistente.id },
              data: { quantidadeActual: { increment: recepcao.quantidadeRecebida } }
            })
            loteId = loteExistente.id
          } else {
            const novoLote = await tx.lote.create({
              data: {
                numeroLote:        recepcao.numeroLote,
                artigoId:          artigo.id,
                fornecedorId:      encomenda.fornecedorId || null,
                dataValidade:      new Date(recepcao.dataValidade),
                quantidadeInicial: recepcao.quantidadeRecebida,
                quantidadeActual:  recepcao.quantidadeRecebida,
                estado:            'ACTIVO'
              }
            })
            loteId = novoLote.id
          }
        }

        // Criar movimento de ENTRADA
        const valorTotal = recepcao.quantidadeRecebida * linha.precoUnitario
        await tx.movimento.create({
          data: {
            tipo:          'ENTRADA',
            artigoId:      artigo.id,
            loteId,
            localizacaoId: recepcao.localizacaoId,
            quantidade:    recepcao.quantidadeRecebida,
            precoUnitario: linha.precoUnitario,
            valorTotal,
            referencia:    encomenda.numero,
            motivo:        `Recepção de encomenda ${encomenda.numero}`,
            utilizador
          }
        })

        // Actualizar stock da localização
        const stockExistente = await tx.stockLocalizacao.findUnique({
          where: { artigoId_localizacaoId: { artigoId: artigo.id, localizacaoId: recepcao.localizacaoId } }
        })
        if (stockExistente) {
          await tx.stockLocalizacao.update({
            where: { artigoId_localizacaoId: { artigoId: artigo.id, localizacaoId: recepcao.localizacaoId } },
            data: { quantidade: { increment: recepcao.quantidadeRecebida } }
          })
        } else {
          await tx.stockLocalizacao.create({
            data: { artigoId: artigo.id, localizacaoId: recepcao.localizacaoId, quantidade: recepcao.quantidadeRecebida }
          })
        }

        // Actualizar preço médio ponderado do artigo
        const stockTotal = await tx.stockLocalizacao.findMany({ where: { artigoId: artigo.id } })
        const novaQtdTotal = stockTotal.reduce((s, sl) => s + sl.quantidade, 0)
        if (novaQtdTotal > 0) {
          const pmpAtual = artigo.precoMedioPonderado || linha.precoUnitario
          const qtdAnterior = novaQtdTotal - recepcao.quantidadeRecebida
          const novoPmp = ((qtdAnterior * pmpAtual) + (recepcao.quantidadeRecebida * linha.precoUnitario)) / novaQtdTotal
          await tx.artigo.update({
            where: { id: artigo.id },
            data: { precoMedioPonderado: Math.round(novoPmp * 10000) / 10000 }
          })
        }

        // Actualizar quantidade recebida na linha
        await tx.linhaEncomenda.update({
          where: { id: linha.id },
          data: { quantidadeRecebida: { increment: recepcao.quantidadeRecebida } }
        })
      }

      // Recalcular estado da encomenda
      const linhasActualizadas = await tx.linhaEncomenda.findMany({ where: { encomendaId: id } })
      const todasCompletas = linhasActualizadas.every(l => l.quantidadeRecebida >= l.quantidadeEncomendada)
      const algumaRecebida = linhasActualizadas.some(l => l.quantidadeRecebida > 0)
      const novoEstado = todasCompletas ? 'COMPLETA' : algumaRecebida ? 'PARCIAL' : 'PENDENTE'

      await tx.encomenda.update({
        where: { id },
        data: {
          estado: novoEstado,
          dataEntregaReal: todasCompletas ? new Date() : null
        }
      })
    })

    return reply.code(200).send({ success: true })
  })
}
