import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'quantflow-t2r-dev-secret-not-for-production'

export interface JWTPayload {
  userId: string
  email: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const header = request.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'No token provided' })
    }
    const token = header.split(' ')[1]
    const payload = verifyToken(token)
    ;(request as any).user = payload
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' })
  }
}
