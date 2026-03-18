import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'
const PORT = parseInt(process.env.PORT || '3001', 10)

const prisma = new PrismaClient()
const fastify = Fastify({ logger: true })

// CORS only needed in dev (in prod the frontend is served from same origin)
if (!isProd) {
  await fastify.register(cors, { origin: true })
}

fastify.decorate('prisma', prisma)

import dashboardRoutes from './routes/dashboard.js'
import artigosRoutes from './routes/artigos.js'
import lotesRoutes from './routes/lotes.js'
import stockRoutes from './routes/stock.js'
import movimentosRoutes from './routes/movimentos.js'
import localizacoesRoutes from './routes/localizacoes.js'
import encomendasRoutes from './routes/encomendas.js'
import alertasRoutes from './routes/alertas.js'

fastify.register(dashboardRoutes, { prefix: '/api' })
fastify.register(artigosRoutes, { prefix: '/api' })
fastify.register(lotesRoutes, { prefix: '/api' })
fastify.register(stockRoutes, { prefix: '/api' })
fastify.register(movimentosRoutes, { prefix: '/api' })
fastify.register(localizacoesRoutes, { prefix: '/api' })
fastify.register(encomendasRoutes, { prefix: '/api' })
fastify.register(alertasRoutes, { prefix: '/api' })

// In production: serve the built Vue SPA
if (isProd) {
  const distPath = path.join(__dirname, '../../frontend/dist')
  await fastify.register(fastifyStatic, { root: distPath, prefix: '/' })

  // SPA fallback — serve index.html for all non-API routes
  fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api')) {
      return reply.code(404).send({ error: 'Not found' })
    }
    return reply.sendFile('index.html')
  })
}

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
