export default async function movimentosRoutes(fastify) {
  const prisma = fastify.prisma

  fastify.get('/movimentos', async (request) => {
    const { tipo, artigoId, localizacaoId, dataInicio, dataFim } = request.query
    const where = {}
    if (tipo) where.tipo = tipo
    if (artigoId) where.artigoId = artigoId
    if (localizacaoId) where.localizacaoId = localizacaoId
    if (dataInicio || dataFim) {
      where.createdAt = {}
      if (dataInicio) where.createdAt.gte = new Date(dataInicio)
      if (dataFim) {
        const end = new Date(dataFim)
        end.setDate(end.getDate() + 1)
        where.createdAt.lt = end
      }
    }

    const movimentos = await prisma.movimento.findMany({
      where,
      include: {
        artigo: true,
        lote: true,
        localizacao: true,
        localizacaoDestino: true
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    })

    return movimentos
  })

  fastify.post('/movimentos', async (request, reply) => {
    const { tipo, artigoId, loteId, localizacaoId, quantidade, precoUnitario, referencia, motivo, utilizador, observacoes } = request.body

    if (!['ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'AJUSTE', 'ABATE', 'DEVOLUCAO'].includes(tipo)) {
      return reply.code(400).send({ error: 'Tipo de movimento inválido' })
    }

    if (!artigoId || !localizacaoId || !quantidade || !utilizador) {
      return reply.code(400).send({ error: 'Campos obrigatórios em falta' })
    }

    const preco = precoUnitario || 0
    const valor = quantidade * preco

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create movement
        const movimento = await tx.movimento.create({
          data: {
            tipo,
            artigoId,
            loteId: loteId || null,
            localizacaoId,
            quantidade,
            precoUnitario: preco,
            valorTotal: valor,
            referencia: referencia || null,
            motivo: motivo || null,
            utilizador,
            observacoes: observacoes || null
          },
          include: { artigo: true, lote: true, localizacao: true, localizacaoDestino: true }
        })

        // Update StockLocalizacao
        const isExit = ['SAIDA', 'ABATE'].includes(tipo)
        const isEntry = ['ENTRADA', 'DEVOLUCAO'].includes(tipo)
        const delta = isEntry ? quantidade : isExit ? -quantidade : 0

        if (delta !== 0) {
          const existing = await tx.stockLocalizacao.findUnique({
            where: { artigoId_localizacaoId: { artigoId, localizacaoId } }
          })

          if (existing) {
            await tx.stockLocalizacao.update({
              where: { artigoId_localizacaoId: { artigoId, localizacaoId } },
              data: { quantidade: { increment: delta } }
            })
          } else if (isEntry) {
            await tx.stockLocalizacao.create({
              data: { artigoId, localizacaoId, quantidade }
            })
          }
        }

        // Update Lote quantidadeActual if lote specified
        if (loteId) {
          const delta2 = ['ENTRADA', 'DEVOLUCAO'].includes(tipo) ? quantidade : ['SAIDA', 'ABATE'].includes(tipo) ? -quantidade : 0
          if (delta2 !== 0) {
            await tx.lote.update({
              where: { id: loteId },
              data: { quantidadeActual: { increment: delta2 } }
            })
          }
        }

        return movimento
      })

      return reply.code(201).send(result)
    } catch (err) {
      throw err
    }
  })

  fastify.post('/movimentos/:id/cancelar', async (request, reply) => {
    const { id } = request.params
    const { motivoCancelamento, utilizador } = request.body

    if (!motivoCancelamento || !utilizador) {
      return reply.code(400).send({ error: 'Motivo e utilizador são obrigatórios' })
    }

    const movimento = await prisma.movimento.findUnique({
      where: { id },
      include: { artigo: true, lote: true, localizacao: true, localizacaoDestino: true }
    })

    if (!movimento) return reply.code(404).send({ error: 'Movimento não encontrado' })
    if (movimento.cancelado) return reply.code(400).send({ error: 'Movimento já está cancelado' })

    await prisma.$transaction(async (tx) => {
      // 1. Marcar movimento original como cancelado
      await tx.movimento.update({
        where: { id },
        data: {
          cancelado:          true,
          motivoCancelamento,
          canceladoPor:       utilizador,
          canceladoEm:        new Date()
        }
      })

      // 2. Calcular delta de compensação (inverso do original)
      const tiposEntrada  = ['ENTRADA', 'DEVOLUCAO']
      const tiposSaida    = ['SAIDA', 'ABATE']

      const deltaOriginal = tiposEntrada.includes(movimento.tipo) ? movimento.quantidade
                          : tiposSaida.includes(movimento.tipo)   ? -movimento.quantidade
                          : 0 // TRANSFERENCIA, AJUSTE tratados em separado

      if (deltaOriginal !== 0) {
        // Reverter stock na localização
        await tx.stockLocalizacao.updateMany({
          where: { artigoId: movimento.artigoId, localizacaoId: movimento.localizacaoId },
          data: { quantidade: { increment: -deltaOriginal } }
        })

        // Reverter lote se aplicável
        if (movimento.loteId) {
          await tx.lote.update({
            where: { id: movimento.loteId },
            data: { quantidadeActual: { increment: -deltaOriginal } }
          })
        }
      }

      // TRANSFERENCIA: reverter stock em ambas as localizações
      if (movimento.tipo === 'TRANSFERENCIA' && movimento.localizacaoDestinoId) {
        await tx.stockLocalizacao.updateMany({
          where: { artigoId: movimento.artigoId, localizacaoId: movimento.localizacaoId },
          data: { quantidade: { increment: movimento.quantidade } }
        })
        await tx.stockLocalizacao.updateMany({
          where: { artigoId: movimento.artigoId, localizacaoId: movimento.localizacaoDestinoId },
          data: { quantidade: { increment: -movimento.quantidade } }
        })
      }

      // 3. Criar movimento de compensação (ANULACAO) para audit trail
      await tx.movimento.create({
        data: {
          tipo:             'ANULACAO',
          artigoId:         movimento.artigoId,
          loteId:           movimento.loteId,
          localizacaoId:    movimento.localizacaoId,
          localizacaoDestinoId: movimento.localizacaoDestinoId,
          quantidade:       movimento.quantidade,
          precoUnitario:    movimento.precoUnitario,
          valorTotal:       movimento.valorTotal,
          referencia:       movimento.referencia,
          motivo:           `Anulação do movimento ${id}: ${motivoCancelamento}`,
          utilizador,
          movimentoOrigemId: id
        }
      })

      // 4. Se ligado a encomenda, reverter quantidadeRecebida na linha
      if (movimento.referencia && /^ENC-/.test(movimento.referencia)) {
        const encomenda = await tx.encomenda.findUnique({
          where: { numero: movimento.referencia },
          include: { linhas: true }
        })
        if (encomenda) {
          const linha = encomenda.linhas.find(l => l.artigoId === movimento.artigoId)
          if (linha) {
            const novaQtdRecebida = Math.max(0, linha.quantidadeRecebida - movimento.quantidade)
            await tx.linhaEncomenda.update({
              where: { id: linha.id },
              data: { quantidadeRecebida: novaQtdRecebida }
            })
          }

          // Recalcular estado da encomenda
          const linhasActualizadas = await tx.linhaEncomenda.findMany({ where: { encomendaId: encomenda.id } })
          const todasCompletas  = linhasActualizadas.every(l => l.quantidadeRecebida >= l.quantidadeEncomendada)
          const algumaRecebida  = linhasActualizadas.some(l => l.quantidadeRecebida > 0)
          const novoEstado      = todasCompletas ? 'COMPLETA' : algumaRecebida ? 'PARCIAL' : 'PENDENTE'

          await tx.encomenda.update({
            where: { id: encomenda.id },
            data: { estado: novoEstado, dataEntregaReal: todasCompletas ? new Date() : null }
          })
        }
      }
    })

    return { success: true }
  })
}
