import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import authRoutes from './routes/auth.js'
import tradeRoutes from './routes/trades.js'
import analyticsRoutes from './routes/analytics.js'
import settingsRoutes from './routes/settings.js'
import importRoutes from './routes/import.js'
import playbookRoutes from './routes/playbooks.js'
import notebookRoutes from './routes/notebook.js'

const app = Fastify({ logger: true, bodyLimit: 5 * 1024 * 1024 }) // 5MB body limit

await app.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://quantflow.vercel.app']
    : 'http://localhost:3000',
  credentials: true,
})

// Global rate limit — 100 requests per minute per IP
await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    error: 'Too many requests. Please slow down.',
    code: 429,
  }),
})

// Security headers middleware
app.addHook('onSend', async (_req, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff')
  reply.header('X-Frame-Options', 'DENY')
  reply.header('X-XSS-Protection', '1; mode=block')
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
})

// Stricter rate limit on auth endpoints — 5 attempts per 15 minutes
await app.register(async (scope) => {
  await scope.register(rateLimit, {
    max: 5,
    timeWindow: '15 minutes',
    errorResponseBuilder: () => ({
      error: 'Too many authentication attempts. Please wait 15 minutes.',
      code: 429,
    }),
  })
  await scope.register(authRoutes)
}, { prefix: '/api/auth' })

await app.register(tradeRoutes, { prefix: '/api/trades' })
await app.register(analyticsRoutes, { prefix: '/api/analytics' })
await app.register(settingsRoutes, { prefix: '/api/settings' })
await app.register(importRoutes, { prefix: '/api/import' })
await app.register(playbookRoutes, { prefix: '/api/playbooks' })
await app.register(notebookRoutes, { prefix: '/api/notebook' })

app.get('/api/health', async () => {
  return { status: 'ok', name: 'Quantflow API', version: '1.1.0', security: 'hardened' }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000
    await app.listen({ port, host: '0.0.0.0' })
    console.log('\n🚀 Quantflow API running on http://localhost:' + port)
    console.log('🔒 Security: rate limiting, security headers, strong passwords')
    console.log('📊 Powered by Trade2Retire Academy\n')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
