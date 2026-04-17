import { FastifyInstance } from 'fastify'
import prisma from '../services/db.js'
import { authenticate } from '../middleware/auth.js'

export default async function playbookRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // Get all playbooks
  app.get('/', async (request) => {
    const { userId } = (request as any).user
    const playbooks = await prisma.playbook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return { playbooks }
  })

  // Create playbook
  app.post('/', async (request) => {
    const { userId } = (request as any).user
    const body = request.body as any

    const playbook = await prisma.playbook.create({
      data: {
        userId,
        name: body.name,
        description: body.description || null,
        setupType: body.setupType,
        timeframe: body.timeframe || null,
        entryRules: JSON.stringify(body.entryRules || []),
        exitRules: JSON.stringify(body.exitRules || []),
        confluences: JSON.stringify(body.confluences || []),
        riskPerTrade: body.riskPerTrade || 1.0,
        minRR: body.minRR || 1.5,
        idealSessions: JSON.stringify(body.idealSessions || []),
        idealPairs: JSON.stringify(body.idealPairs || []),
        notes: body.notes || null,
        color: body.color || '#7C5CFC',
      },
    })

    return { playbook }
  })

  // Update playbook
  app.put('/:id', async (request, reply) => {
    const { userId } = (request as any).user
    const { id } = request.params as { id: string }
    const body = request.body as any

    const existing = await prisma.playbook.findFirst({ where: { id, userId } })
    if (!existing) return reply.status(404).send({ error: 'Playbook not found' })

    const data: any = {}
    if (body.name !== undefined) data.name = body.name
    if (body.description !== undefined) data.description = body.description
    if (body.setupType !== undefined) data.setupType = body.setupType
    if (body.timeframe !== undefined) data.timeframe = body.timeframe
    if (body.entryRules !== undefined) data.entryRules = JSON.stringify(body.entryRules)
    if (body.exitRules !== undefined) data.exitRules = JSON.stringify(body.exitRules)
    if (body.confluences !== undefined) data.confluences = JSON.stringify(body.confluences)
    if (body.riskPerTrade !== undefined) data.riskPerTrade = body.riskPerTrade
    if (body.minRR !== undefined) data.minRR = body.minRR
    if (body.idealSessions !== undefined) data.idealSessions = JSON.stringify(body.idealSessions)
    if (body.idealPairs !== undefined) data.idealPairs = JSON.stringify(body.idealPairs)
    if (body.notes !== undefined) data.notes = body.notes
    if (body.color !== undefined) data.color = body.color
    if (body.isActive !== undefined) data.isActive = body.isActive

    const playbook = await prisma.playbook.update({ where: { id }, data })
    return { playbook }
  })

  // Delete playbook
  app.delete('/:id', async (request, reply) => {
    const { userId } = (request as any).user
    const { id } = request.params as { id: string }

    const existing = await prisma.playbook.findFirst({ where: { id, userId } })
    if (!existing) return reply.status(404).send({ error: 'Playbook not found' })

    await prisma.playbook.delete({ where: { id } })
    return { success: true }
  })
}
