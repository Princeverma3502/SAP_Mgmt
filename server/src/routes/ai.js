import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/http-error.js'
import {
  ticketIdSchema,
  triageInputSchema,
  uatInputSchema,
} from '../ai/schemas.js'
import {
  suggestResolution,
  summarizeForUat,
  triageTicket,
} from '../ai/service.js'

export const aiRouter = Router()

aiRouter.post('/triage', async (req, res) => {
  const input = triageInputSchema.parse(req.body)
  const result = await triageTicket(input)
  res.json({ data: result })
})

aiRouter.get('/tickets/:ticketId/resolution', async (req, res) => {
  const ticketId = ticketIdSchema.parse(req.params.ticketId)
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, category: true, title: true, description: true },
  })
  if (!ticket) throw new HttpError(404, 'Ticket not found.')

  const priorTickets = await prisma.ticket.findMany({
    where: {
      category: ticket.category,
      resolutionNote: { not: null },
      status: { in: ['RESOLVED', 'CLOSED'] },
      id: { not: ticket.id },
    },
    select: { title: true, resolutionNote: true },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  })
  const suggestions = await suggestResolution(ticket, priorTickets)
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { aiSuggestedFix: JSON.stringify(suggestions) },
  })
  res.json({ data: suggestions })
})

aiRouter.post('/uat-summary', async (req, res) => {
  const { notes } = uatInputSchema.parse(req.body)
  const result = await summarizeForUat(notes)
  res.json({ data: result })
})
