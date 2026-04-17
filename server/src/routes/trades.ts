import { FastifyInstance } from 'fastify'
import { sanitize } from '../utils/sanitize.js'
import prisma from '../services/db.js'
import { authenticate } from '../middleware/auth.js'

export default async function tradeRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/', async (request) => {
    const { userId } = (request as any).user
    const query = request.query as any
    const trades = await prisma.trade.findMany({
      where: {
        userId,
        ...(query.pair && { pair: query.pair }),
        ...(query.status && { status: query.status }),
        ...(query.session && { session: query.session }),
      },
      include: { psychology: true, tradeTags: { include: { tag: true } } },
      orderBy: { entryTime: 'desc' },
      take: query.limit ? parseInt(query.limit) : 50,
    })
    return { trades }
  })

  app.get('/:id', async (request, reply) => {
    const { userId } = (request as any).user
    const { id } = request.params as { id: string }
    const trade = await prisma.trade.findFirst({
      where: { id, userId },
      include: { psychology: true, tradeTags: { include: { tag: true } } },
    })
    if (!trade) return reply.status(404).send({ error: 'Trade not found' })
    return { trade }
  })

  app.post('/', async (request) => {
    const { userId } = (request as any).user
    const body = request.body as any

    // Input validation
    if (!body.pair || typeof body.pair !== 'string' || body.pair.length > 20) {
      return reply.status(400).send({ error: 'Invalid pair' })
    }
    if (!['LONG', 'SHORT'].includes(body.direction)) {
      return reply.status(400).send({ error: 'Direction must be LONG or SHORT' })
    }
    if (!body.entryPrice || body.entryPrice <= 0) {
      return reply.status(400).send({ error: 'Entry price must be positive' })
    }
    if (!body.lotSize || body.lotSize <= 0) {
      return reply.status(400).send({ error: 'Lot size must be positive' })
    }
    if (body.exitPrice !== null && body.exitPrice !== undefined && body.exitPrice < 0) {
      return reply.status(400).send({ error: 'Exit price cannot be negative' })
    }
    if (body.entryTime && new Date(body.entryTime) > new Date()) {
      return reply.status(400).send({ error: 'Entry time cannot be in the future' })
    }

    let pnlPips = null
    let pnlDollars = null
    let rrActual = null
    let holdDurationMin = null

    if (body.exitPrice && body.entryPrice) {
      const pipMultiplier = body.pair.includes('JPY') ? 100 : 10000
      const rawPips = (body.exitPrice - body.entryPrice) * pipMultiplier
      pnlPips = body.direction === 'LONG' ? rawPips : -rawPips
      pnlDollars = pnlPips * body.lotSize * (body.pair.includes('JPY') ? 100 : 10)
    }

    if (body.stopLoss && body.entryPrice && body.exitPrice) {
      const slDistance = Math.abs(body.entryPrice - body.stopLoss)
      const tradeDistance = Math.abs(body.exitPrice - body.entryPrice)
      if (slDistance > 0) {
        const rr = tradeDistance / slDistance
        rrActual = pnlDollars && pnlDollars >= 0 ? rr : -rr
      }
    }

    if (body.exitTime && body.entryTime) {
      holdDurationMin = Math.round((new Date(body.exitTime).getTime() - new Date(body.entryTime).getTime()) / 60000)
    }

    const entryHour = new Date(body.entryTime).getUTCHours()
    let session = 'LONDON'
    if (entryHour >= 21 || entryHour < 6) session = 'SYDNEY'
    else if (entryHour >= 0 && entryHour < 9) session = 'TOKYO'
    else if (entryHour >= 7 && entryHour < 16) session = 'LONDON'
    if (entryHour >= 13 && entryHour < 16) session = 'OVERLAP'
    if (entryHour >= 13 && entryHour < 22) session = 'NEWYORK'

    const trade = await prisma.trade.create({
      data: {
        userId,
        pair: sanitize(body.pair), direction: sanitize(body.direction),
        entryPrice: body.entryPrice, exitPrice: body.exitPrice || null,
        stopLoss: body.stopLoss || null, takeProfit: body.takeProfit || null,
        lotSize: body.lotSize, commission: body.commission || 0,
        swap: body.swap || 0, spreadAtEntry: body.spreadAtEntry || 0,
        pnlDollars, pnlPips, rrPlanned: body.rrPlanned || null,
        rrActual, riskPercent: body.riskPercent || null,
        holdDurationMin, session: body.session || session,
        entryTime: new Date(body.entryTime),
        exitTime: body.exitTime ? new Date(body.exitTime) : null,
        status: body.exitPrice ? 'CLOSED' : 'OPEN',
        source: body.source || 'MANUAL',
        psychology: body.psychology ? {
          create: {
            preMood: body.psychology.preMood || 3,
            preConfidence: body.psychology.preConfidence || 3,
            preEnergy: body.psychology.preEnergy || 3,
            preFocus: body.psychology.preFocus || 3,
            postEmotion: body.psychology.postEmotion || null,
            revengeFlag: body.psychology.revengeFlag || false,
            fomoFlag: body.psychology.fomoFlag || false,
            reflectionText: body.psychology.reflectionText || null,
            lessonLearned: body.psychology.lessonLearned || null,
            grade: body.psychology.grade || null,
          },
        } : undefined,
      },
      include: { psychology: true, tradeTags: { include: { tag: true } } },
    })

    if (body.tagIds && body.tagIds.length > 0) {
      await prisma.tradeTag.createMany({
        data: body.tagIds.map((tagId: string) => ({ tradeId: trade.id, tagId })),
      })
    }
    return { trade }
  })

  // Update trade
  app.put('/:id', async (request, reply) => {
    const { userId } = (request as any).user
    const { id } = request.params as { id: string }
    const body = request.body as any

    const existing = await prisma.trade.findFirst({ where: { id, userId } })
    if (!existing) return reply.status(404).send({ error: 'Trade not found' })

    const data: any = {}
    if (body.pair !== undefined) data.pair = body.pair
    if (body.direction !== undefined) data.direction = body.direction
    if (body.entryPrice !== undefined) data.entryPrice = body.entryPrice
    if (body.exitPrice !== undefined) data.exitPrice = body.exitPrice
    if (body.stopLoss !== undefined) data.stopLoss = body.stopLoss
    if (body.takeProfit !== undefined) data.takeProfit = body.takeProfit
    if (body.lotSize !== undefined) data.lotSize = body.lotSize
    if (body.riskPercent !== undefined) data.riskPercent = body.riskPercent
    if (body.entryTime !== undefined) data.entryTime = new Date(body.entryTime)
    if (body.exitTime !== undefined) data.exitTime = body.exitTime ? new Date(body.exitTime) : null
    if (body.pnlDollars !== undefined) data.pnlDollars = body.pnlDollars
    if (body.pnlPips !== undefined) data.pnlPips = body.pnlPips
    if (body.rrActual !== undefined) data.rrActual = body.rrActual
    if (body.holdDurationMin !== undefined) data.holdDurationMin = body.holdDurationMin
    if (body.session !== undefined) data.session = body.session
    if (body.status !== undefined) data.status = body.status

    const trade = await prisma.trade.update({
      where: { id }, data,
      include: { psychology: true, tradeTags: { include: { tag: true } } },
    })
    return { trade }
  })

  // Update psychology
  app.put('/:id/psychology', async (request, reply) => {
    const { userId } = (request as any).user
    const { id } = request.params as { id: string }
    const body = request.body as any

    const existing = await prisma.trade.findFirst({ where: { id, userId }, include: { psychology: true } })
    if (!existing) return reply.status(404).send({ error: 'Trade not found' })

    if (existing.psychology) {
      await prisma.tradePsychology.update({
        where: { tradeId: id },
        data: {
          preMood: body.preMood, preConfidence: body.preConfidence,
          preEnergy: body.preEnergy, preFocus: body.preFocus,
          revengeFlag: body.revengeFlag, fomoFlag: body.fomoFlag,
          reflectionText: body.reflectionText, grade: body.grade,
        },
      })
    } else {
      await prisma.tradePsychology.create({
        data: {
          tradeId: id,
          preMood: body.preMood || 3, preConfidence: body.preConfidence || 3,
          preEnergy: body.preEnergy || 3, preFocus: body.preFocus || 3,
          revengeFlag: body.revengeFlag || false, fomoFlag: body.fomoFlag || false,
          reflectionText: body.reflectionText || null, grade: body.grade || null,
        },
      })
    }
    return { success: true }
  })

  app.delete('/:id', async (request, reply) => {
    const { userId } = (request as any).user
    const { id } = request.params as { id: string }
    const existing = await prisma.trade.findFirst({ where: { id, userId } })
    if (!existing) return reply.status(404).send({ error: 'Trade not found' })
    await prisma.trade.delete({ where: { id } })
    return { success: true }
  })

  app.get('/tags/all', async (request) => {
    const { userId } = (request as any).user
    const tags = await prisma.tag.findMany({ where: { userId } })
    return { tags }
  })
}


