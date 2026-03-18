export default async function lotesRoutes(fastify) {
  const prisma = fastify.prisma

  fastify.get('/lotes', async (request, reply) => {
    const { estado, artigoId, aVencer } = request.query
    const where = {}
    if (estado) where.estado = estado
    if (artigoId) where.artigoId = artigoId
    if (aVencer) {
      const days = parseInt(aVencer)
      const future = new Date(Date.now() + days * 86400000)
      where.dataValidade = { gte: new Date(), lte: future }
      where.estado = 'ACTIVO'
    }

    const lotes = await prisma.lote.findMany({
      where,
      include: {
        artigo: true,
        fornecedor: true
      },
      orderBy: { dataValidade: 'asc' }
    })

    return lotes.map(l => ({
      ...l,
      diasAteValidade: Math.ceil((new Date(l.dataValidade) - new Date()) / 86400000)
    }))
  })

  fastify.get('/lotes/:id', async (request, reply) => {
    const { id } = request.params
    const lote = await prisma.lote.findUnique({
      where: { id },
      include: {
        artigo: true,
        fornecedor: true,
        movimentos: {
          orderBy: { createdAt: 'asc' },
          include: { localizacao: true, localizacaoDestino: true }
        }
      }
    })
    if (!lote) return reply.code(404).send({ error: 'Lote não encontrado' })
    return {
      ...lote,
      diasAteValidade: Math.ceil((new Date(lote.dataValidade) - new Date()) / 86400000)
    }
  })

  fastify.put('/lotes/:id/estado', async (request, reply) => {
    const { id } = request.params
    const { estado, motivo } = request.body
    const validEstados = ['ACTIVO', 'BLOQUEADO', 'QUARENTENA', 'EXPIRADO', 'RECOLHIDO']
    if (!validEstados.includes(estado)) {
      return reply.code(400).send({ error: 'Estado inválido' })
    }
    try {
      const lote = await prisma.lote.update({
        where: { id },
        data: { estado }
      })
      return lote
    } catch (err) {
      if (err.code === 'P2025') return reply.code(404).send({ error: 'Lote não encontrado' })
      throw err
    }
  })
}
