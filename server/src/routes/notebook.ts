import { FastifyInstance } from 'fastify'
import prisma from '../services/db.js'
import { authenticate } from '../middleware/auth.js'

export default async function notebookRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // Get all entries
  app.get('/', async (request) => {
    const { userId } = (request as any).user
    const query = request.query as any

    const entries = await prisma.notebook.findMany({
      where: {
        userId,
        ...(query.type && { type: query.type }),
      },
      orderBy: { date: 'desc' },
      take: query.limit ? parseInt(query.limit) : 30,
    })
    return { entries }
  })

  // Create entry
  app.post('/', async (request) => {
    const { userId } = (request as any).user
    const body = request.body as any

    const entry = await prisma.notebook.create({
      data: {
        userId,
        title: body.title || 'Untitled',
        content: body.content,
        type: body.type || 'FREE',
        mood: body.mood || 3,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        date: body.date ? new Date(body.date) : new Date(),
      },
    })
    return { entry }
  })

  // Update entry
  app.put('/:id', async (request, reply) => {
    const { userId } = (request as any).user
    const { id } = request.params as { id: string }
    const body = request.body as any

    const existing = await prisma.notebook.findFirst({ where: { id, userId } })
    if (!existing) return reply.status(404).send({ error: 'Entry not found' })

    const entry = await prisma.notebook.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        type: body.type,
        mood: body.mood,
        tags: body.tags ? JSON.stringify(body.tags) : null,
      },
    })
    return { entry }
  })

  // Delete entry
  app.delete('/:id', async (request, reply) => {
    const { userId } = (request as any).user
    const { id } = request.params as { id: string }

    const existing = await prisma.notebook.findFirst({ where: { id, userId } })
    if (!existing) return reply.status(404).send({ error: 'Entry not found' })

    await prisma.notebook.delete({ where: { id } })
    return { success: true }
  })
}
