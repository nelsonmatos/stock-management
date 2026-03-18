export default async function alertasRoutes(fastify) {
  const prisma = fastify.prisma

  fastify.get('/alertas', async (request, reply) => {
    const now = new Date()
    const in30Days = new Date(Date.now() + 30 * 86400000)

    // Stock abaixo do mínimo
    const allArtigos = await prisma.artigo.findMany({
      where: { ativo: true },
      include: { stockLocalizacoes: true }
    })

    const stockMinimo = []
    for (const artigo of allArtigos) {
      const totalStock = artigo.stockLocalizacoes.reduce((s, sl) => s + sl.quantidade, 0)
      if (totalStock < artigo.stockMinimo) {
        stockMinimo.push({
          id: artigo.id,
          codigo: artigo.codigo,
          descricao: artigo.descricao,
          familia: artigo.familia,
          tipo: artigo.tipo,
          stockActual: totalStock,
          stockMinimo: artigo.stockMinimo,
          pontoEncomenda: artigo.pontoEncomenda,
          deficit: artigo.stockMinimo - totalStock,
          unidadeMedida: artigo.unidadeMedida
        })
      }
    }
    stockMinimo.sort((a, b) => b.deficit - a.deficit)

    // Lotes a vencer em 30 dias
    const lotesAVencer = await prisma.lote.findMany({
      where: {
        dataValidade: { gte: now, lte: in30Days },
        estado: 'ACTIVO'
      },
      include: { artigo: true, fornecedor: true },
      orderBy: { dataValidade: 'asc' }
    })

    const aVencer = lotesAVencer.map(l => ({
      ...l,
      diasAteValidade: Math.ceil((new Date(l.dataValidade) - now) / 86400000)
    }))

    // Lotes expirados
    const lotesExpRaw = await prisma.lote.findMany({
      where: {
        dataValidade: { lt: now },
        estado: 'ACTIVO'
      },
      include: { artigo: true, fornecedor: true },
      orderBy: { dataValidade: 'asc' }
    })

    const expirados = lotesExpRaw.map(l => ({
      ...l,
      diasExpirado: Math.ceil((now - new Date(l.dataValidade)) / 86400000)
    }))

    // Encomendas em atraso
    const encomendasAtrasadas = await prisma.encomenda.findMany({
      where: {
        dataEntregaPrevista: { lt: now },
        estado: { in: ['PENDENTE', 'PARCIAL'] }
      },
      include: { fornecedor: true },
      orderBy: { dataEntregaPrevista: 'asc' }
    })

    const encomendasAtraso = encomendasAtrasadas.map(e => ({
      ...e,
      diasAtraso: Math.ceil((now - new Date(e.dataEntregaPrevista)) / 86400000)
    }))

    return {
      stockMinimo,
      aVencer,
      expirados,
      encomendasAtraso,
      totalAlertas: stockMinimo.length + aVencer.length + expirados.length + encomendasAtraso.length
    }
  })
}
