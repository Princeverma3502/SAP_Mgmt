import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { ZodError } from 'zod'
import { aiRouter } from './routes/ai.js'
import { ticketsRouter } from './routes/tickets.js'
import { HttpError } from './lib/http-error.js'

export const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}))
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'eam-ticketing-api' })
})

function requireDatabase(_req, res, next) {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'Database is not configured. Set DATABASE_URL in server/.env.' })
  }
  return next()
}

const aiRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'AI request limit reached. Please try again shortly.' },
})

app.use('/api/ai', aiRateLimit)
app.use('/api/ai/tickets', requireDatabase)
app.use('/api/ai', aiRouter)
app.use('/api/tickets', requireDatabase, ticketsRouter)
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' })
})

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' })
  }
  if (error.status === 413) {
    return res.status(413).json({ error: 'Request body is too large.' })
  }
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Invalid request.',
      details: error.issues.map(({ path, message }) => ({ field: path.join('.'), message })),
    })
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message })
  }
  if (error.code === 'P2002') {
    return res.status(409).json({ error: 'A ticket with this identifier already exists. Retry the request.' })
  }
  console.error('Unhandled API error:', error)
  return res.status(500).json({ error: 'An unexpected server error occurred.' })
})
