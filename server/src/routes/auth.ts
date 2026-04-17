import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import prisma from '../services/db.js'
import { generateToken, authenticate } from '../middleware/auth.js'
import crypto from 'crypto'

// Track failed login attempts in memory (resets on server restart)
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>()

function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(email) && email.length < 255
}

function validatePassword(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) return { valid: false, reason: 'Password must be at least 8 characters' }
  if (password.length > 128) return { valid: false, reason: 'Password too long (max 128 characters)' }
  if (!/[a-zA-Z]/.test(password)) return { valid: false, reason: 'Password must contain letters' }
  if (!/[0-9]/.test(password)) return { valid: false, reason: 'Password must contain at least one number' }
  const weakPasswords = ['password', '12345678', 'qwerty123', 'password123', 'abc12345', 'letmein1']
  if (weakPasswords.includes(password.toLowerCase())) return { valid: false, reason: 'Password is too common' }
  return { valid: true }
}

export default async function authRoutes(app: FastifyInstance) {
  // Register
  app.post('/register', async (request, reply) => {
    const { email, password, displayName } = request.body as any

    if (!email || !isValidEmail(email)) {
      return reply.status(400).send({ error: 'Invalid email address' })
    }

    const passCheck = validatePassword(password)
    if (!passCheck.valid) {
      return reply.status(400).send({ error: passCheck.reason })
    }

    if (!displayName || displayName.length < 2 || displayName.length > 50) {
      return reply.status(400).send({ error: 'Display name must be 2-50 characters' })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return reply.status(400).send({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: passwordHash,
        displayName: displayName.replace(/<[^>]*>/g, '').trim(),

      },
    })

    const token = generateToken({ userId: user.id, email: user.email })
    return reply.status(201).send({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    })
  })

  // Login with rate limiting
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body as any

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password required' })
    }

    const emailKey = email.toLowerCase()
    const now = Date.now()

    // Check if locked out
    const attemptData = failedAttempts.get(emailKey)
    if (attemptData && attemptData.lockedUntil > now) {
      const waitMin = Math.ceil((attemptData.lockedUntil - now) / 60000)
      return reply.status(429).send({ error: `Too many failed attempts. Try again in ${waitMin} minute(s).` })
    }

    const user = await prisma.user.findUnique({ where: { email: emailKey } })
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      // Track failed attempt
      const current = failedAttempts.get(emailKey) || { count: 0, lockedUntil: 0 }
      current.count++
      // Lock for 15 minutes after 5 failed attempts
      if (current.count >= 5) {
        current.lockedUntil = now + 15 * 60 * 1000
        current.count = 0
      }
      failedAttempts.set(emailKey, current)
      const remaining = 5 - current.count
      return reply.status(401).send({
        error: `Invalid credentials${remaining > 0 && remaining < 5 ? ` (${remaining} attempts remaining)` : ''}`
      })
    }

    // Success — clear failed attempts
    failedAttempts.delete(emailKey)

    const token = generateToken({ userId: user.id, email: user.email })
    return reply.send({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    })
  })

  // Forgot Password — generates a reset token
  app.post('/forgot-password', async (request, reply) => {
    const { email } = request.body as any

    if (!email || !isValidEmail(email)) {
      return reply.status(400).send({ error: 'Invalid email' })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return reply.send({
        success: true,
        message: 'If the email exists, a reset link will be sent.',
      })
    }

    // Generate reset token (valid 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        
      },
    })

    // In production: send email with link: https://quantflow.app/reset-password?token=RESET_TOKEN
    // For now, return the token (for testing) — in prod this would ONLY go via email
    return reply.send({
      success: true,
      message: 'Reset link generated. Check your email.',
      // Remove this in production — only for testing:
      devResetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    })
  })

  // Reset Password
  app.post('/reset-password', async (request, reply) => {
    const { token, newPassword } = request.body as any

    if (!token || !newPassword) {
      return reply.status(400).send({ error: 'Token and new password required' })
    }

    const passCheck = validatePassword(newPassword)
    if (!passCheck.valid) {
      return reply.status(400).send({ error: passCheck.reason })
    }

    const user = await prisma.user.findFirst({
      where: {
        
      },
    })

    if (!user) {
      return reply.status(400).send({ error: 'Invalid or expired reset token' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        
      },
    })

    return reply.send({ success: true, message: 'Password reset successfully' })
  })

  // Get current user
  app.get('/me', { preHandler: authenticate }, async (request) => {
    const { userId } = (request as any).user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, timezone: true, createdAt: true },
    })
    return { user }
  })
}







