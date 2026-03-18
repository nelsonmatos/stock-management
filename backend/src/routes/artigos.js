export default async function artigosRoutes(fastify) {
  const prisma = fastify.prisma

  fastify.get('/artigos', async (request, reply) => {
    const { search, familia, tipo, ativo } = request.query
    const where = {}
    if (search) {
      where.OR = [
        { descricao: { contains: search } },
        { codigo: { contains: search } },
        { dci: { contains: search } }
      ]
    }
    if (familia) where.familia = familia
    if (tipo) where.tipo = tipo
    if (ativo !== undefined) where.ativo = ativo === 'true'

    const artigos = await prisma.artigo.findMany({
      where,
      include: {
        stockLocalizacoes: {
          include: { localizacao: true }
        }
      },
      orderBy: { descricao: 'asc' }
    })

    return artigos.map(a => ({
      ...a,
      stockTotal: a.stockLocalizacoes.reduce((s, sl) => s + sl.quantidade, 0),
      valorTotal: a.stockLocalizacoes.reduce((s, sl) => s + sl.quantidade * a.precoMedioPonderado, 0)
    }))
  })

  fastify.get('/artigos/:id', async (request, reply) => {
    const { id } = request.params
    const artigo = await prisma.artigo.findUnique({
      where: { id },
      include: {
        stockLocalizacoes: { include: { localizacao: true } },
        lotes: { include: { fornecedor: true } },
        movimentos: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { localizacao: true, lote: true }
        }
      }
    })
    if (!artigo) return reply.code(404).send({ error: 'Artigo não encontrado' })
    return {
      ...artigo,
      stockTotal: artigo.stockLocalizacoes.reduce((s, sl) => s + sl.quantidade, 0)
    }
  })

  fastify.post('/artigos', async (request, reply) => {
    const data = request.body
    try {
      const artigo = await prisma.artigo.create({ data })
      return reply.code(201).send(artigo)
    } catch (err) {
      if (err.code === 'P2002') {
        return reply.code(400).send({ error: 'Código já existe' })
      }
      throw err
    }
  })

  fastify.put('/artigos/:id', async (request, reply) => {
    const { id } = request.params
    const data = request.body
    try {
      const artigo = await prisma.artigo.update({ where: { id }, data })
      return artigo
    } catch (err) {
      if (err.code === 'P2025') return reply.code(404).send({ error: 'Artigo não encontrado' })
      throw err
    }
  })
}
