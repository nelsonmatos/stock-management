export default async function localizacoesRoutes(fastify) {
  const prisma = fastify.prisma

  fastify.get('/localizacoes', async (request, reply) => {
    const localizacoes = await prisma.localizacao.findMany({
      where: { ativa: true },
      include: {
        stocks: true
      },
      orderBy: { codigo: 'asc' }
    })

    return localizacoes.map(l => ({
      ...l,
      totalArtigos: l.stocks.length,
      totalQuantidade: l.stocks.reduce((s, sl) => s + sl.quantidade, 0)
    }))
  })
}
