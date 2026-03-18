export default async function stockRoutes(fastify) {
  const prisma = fastify.prisma

  fastify.get('/stock', async (request, reply) => {
    const { localizacaoId, familia, search } = request.query
    const where = {}
    if (localizacaoId) where.localizacaoId = localizacaoId
    if (familia || search) {
      where.artigo = {}
      if (familia) where.artigo.familia = familia
      if (search) {
        where.artigo.OR = [
          { descricao: { contains: search } },
          { codigo: { contains: search } }
        ]
      }
    }

    const stocks = await prisma.stockLocalizacao.findMany({
      where,
      include: {
        artigo: true,
        localizacao: true
      },
      orderBy: [{ artigo: { descricao: 'asc' } }]
    })

    return stocks.map(s => ({
      ...s,
      valorTotal: s.quantidade * s.artigo.precoMedioPonderado,
      estadoStock: s.quantidade <= 0 ? 'RUPTURA' :
                   s.quantidade < s.artigo.stockMinimo ? 'CRITICO' :
                   s.quantidade < s.artigo.pontoEncomenda ? 'ALERTA' : 'OK'
    }))
  })

  fastify.get('/stock/resumo', async (request, reply) => {
    const artigos = await prisma.artigo.findMany({
      where: { ativo: true },
      include: {
        stockLocalizacoes: { include: { localizacao: true } }
      },
      orderBy: { descricao: 'asc' }
    })

    return artigos.map(a => {
      const stockTotal = a.stockLocalizacoes.reduce((s, sl) => s + sl.quantidade, 0)
      const valorTotal = stockTotal * a.precoMedioPonderado
      const estado = stockTotal <= 0 ? 'RUPTURA' :
                     stockTotal < a.stockMinimo ? 'CRITICO' :
                     stockTotal < a.pontoEncomenda ? 'ALERTA' : 'OK'
      return {
        id: a.id,
        codigo: a.codigo,
        descricao: a.descricao,
        familia: a.familia,
        tipo: a.tipo,
        unidadeMedida: a.unidadeMedida,
        stockTotal,
        stockMinimo: a.stockMinimo,
        stockMaximo: a.stockMaximo,
        pontoEncomenda: a.pontoEncomenda,
        precoMedioPonderado: a.precoMedioPonderado,
        valorTotal,
        estado,
        stockPorLocalizacao: a.stockLocalizacoes.map(sl => ({
          localizacaoId: sl.localizacaoId,
          localizacao: sl.localizacao,
          quantidade: sl.quantidade
        }))
      }
    })
  })
}
