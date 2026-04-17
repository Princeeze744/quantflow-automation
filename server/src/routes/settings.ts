import { FastifyInstance } from 'fastify'
import prisma from '../services/db.js'
import { authenticate } from '../middleware/auth.js'

export default async function settingsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // Get settings
  app.get('/', async (request) => {
    const { userId } = (request as any).user

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, displayName: true,
        broker: true, accountCurrency: true,
        startingBalance: true, timezone: true,
      },
    })

    const riskSettings = await prisma.riskSettings.findUnique({
      where: { userId },
    })

    const rules = await prisma.tradingRule.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    })

    const tags = await prisma.tag.findMany({ where: { userId } })

    return { user, riskSettings, rules, tags }
  })

  // Get profile
  app.get('/profile', async (request) => {
    const { userId } = (request as any).user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, displayName: true,
        broker: true, accountCurrency: true,
        startingBalance: true, timezone: true,
      },
    })
    return { user }
  })

  // Update profile
  app.put('/profile', async (request) => {
    const { userId } = (request as any).user
    const body = request.body as any

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: body.displayName,
        broker: body.broker,
        accountCurrency: body.accountCurrency,
        startingBalance: body.startingBalance,
        timezone: body.timezone,
      },
    })

    return { user }
  })

  // Update risk settings
  app.put('/risk', async (request) => {
    const { userId } = (request as any).user
    const body = request.body as any

    const settings = await prisma.riskSettings.upsert({
      where: { userId },
      update: body,
      create: { userId, ...body },
    })

    return { settings }
  })

  // Add trading rule
  app.post('/rules', async (request) => {
    const { userId } = (request as any).user
    const { text, category } = request.body as { text: string; category?: string }

    const count = await prisma.tradingRule.count({ where: { userId } })

    const rule = await prisma.tradingRule.create({
      data: { userId, text, category: category || 'PRE_TRADE', sortOrder: count },
    })

    return { rule }
  })

  // Delete trading rule
  app.delete('/rules/:id', async (request, reply) => {
    const { userId } = (request as any).user
    const { id } = request.params as { id: string }

    const rule = await prisma.tradingRule.findFirst({ where: { id, userId } })
    if (!rule) return reply.status(404).send({ error: 'Rule not found' })

    await prisma.tradingRule.delete({ where: { id } })
    return { success: true }
  })
}

