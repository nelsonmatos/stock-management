export default async function dashboardRoutes(fastify) {
  fastify.get('/dashboard', async (request, reply) => {
    const prisma = fastify.prisma
    const now = new Date()
    const in30Days = new Date(Date.now() + 30 * 86400000)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 86400000)

    // Total valor stock
    const stockLocalizacoes = await prisma.stockLocalizacao.findMany({
      include: { artigo: true }
    })
    const totalValorStock = stockLocalizacoes.reduce((sum, sl) => {
      return sum + sl.quantidade * sl.artigo.precoMedioPonderado
    }, 0)

    // Total artigos ativos
    const totalArtigos = await prisma.artigo.count({ where: { ativo: true } })

    // Total lotes ativos
    const totalLotes = await prisma.lote.count({ where: { estado: 'ACTIVO' } })

    // Artigos abaixo do minimo
    const allArtigos = await prisma.artigo.findMany({
      where: { ativo: true },
      include: { stockLocalizacoes: true }
    })

    const artigosAbaixoMinimo = []
    for (const artigo of allArtigos) {
      const totalStock = artigo.stockLocalizacoes.reduce((s, sl) => s + sl.quantidade, 0)
      if (totalStock < artigo.stockMinimo) {
        artigosAbaixoMinimo.push({
          id: artigo.id,
          codigo: artigo.codigo,
          descricao: artigo.descricao,
          stockActual: totalStock,
          stockMinimo: artigo.stockMinimo,
          deficit: artigo.stockMinimo - totalStock
        })
      }
    }
    artigosAbaixoMinimo.sort((a, b) => b.deficit - a.deficit)

    // Lotes a vencer em 30 dias
    const lotesAVencer30 = await prisma.lote.count({
      where: {
        dataValidade: { gte: now, lte: in30Days },
        estado: 'ACTIVO'
      }
    })

    // Lotes expirados
    const lotesExpirados = await prisma.lote.count({
      where: {
        dataValidade: { lt: now },
        estado: 'ACTIVO'
      }
    })

    // Encomendas pendentes
    const encomendasPendentes = await prisma.encomenda.count({
      where: { estado: { in: ['PENDENTE', 'PARCIAL'] } }
    })

    // Movimentos hoje
    const movimentosHoje = await prisma.movimento.count({
      where: { createdAt: { gte: todayStart, lt: todayEnd } }
    })

    // Consumo mensal - last 6 months
    const consumoMensal = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const movs = await prisma.movimento.findMany({
        where: {
          tipo: 'SAIDA',
          createdAt: { gte: d, lt: dEnd }
        }
      })
      const valor = movs.reduce((s, m) => s + m.valorTotal, 0)
      consumoMensal.push({
        mes: d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' }),
        valor: Math.round(valor * 100) / 100
      })
    }

    // Top artigos por consumo last 30 days
    const last30 = new Date(Date.now() - 30 * 86400000)
    const movimentosLast30 = await prisma.movimento.findMany({
      where: { tipo: 'SAIDA', createdAt: { gte: last30 } },
      include: { artigo: true }
    })

    const consumoPorArtigo = {}
    for (const mov of movimentosLast30) {
      if (!consumoPorArtigo[mov.artigoId]) {
        consumoPorArtigo[mov.artigoId] = {
          id: mov.artigoId,
          codigo: mov.artigo.codigo,
          descricao: mov.artigo.descricao,
          quantidade: 0,
          valor: 0
        }
      }
      consumoPorArtigo[mov.artigoId].quantidade += mov.quantidade
      consumoPorArtigo[mov.artigoId].valor += mov.valorTotal
    }

    const topArtigosPorConsumo = Object.values(consumoPorArtigo)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)

    // Stock por família
    const stockPorFamilia = {}
    for (const sl of stockLocalizacoes) {
      const familia = sl.artigo.familia
      if (!stockPorFamilia[familia]) stockPorFamilia[familia] = 0
      stockPorFamilia[familia] += sl.quantidade * sl.artigo.precoMedioPonderado
    }
    const stockPorFamiliaArr = Object.entries(stockPorFamilia)
      .map(([familia, valor]) => ({ familia, valor: Math.round(valor * 100) / 100 }))
      .sort((a, b) => b.valor - a.valor)

    return {
      totalValorStock: Math.round(totalValorStock * 100) / 100,
      totalArtigos,
      totalLotes,
      artigosAbaixoMinimo: {
        count: artigosAbaixoMinimo.length,
        top5: artigosAbaixoMinimo.slice(0, 5)
      },
      lotesAVencer30,
      lotesExpirados,
      encomendasPendentes,
      movimentosHoje,
      consumoMensal,
      topArtigosPorConsumo,
      stockPorFamilia: stockPorFamiliaArr
    }
  })
}
