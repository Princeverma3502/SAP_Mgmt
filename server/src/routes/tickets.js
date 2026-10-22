import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import {
  ticketCreateSchema,
  ticketQuerySchema,
  ticketIdSchema,
  ticketUpdateSchema,
  triageInputSchema,
} from '../ai/schemas.js'
import { triageTicket } from '../ai/service.js'
import { HttpError } from '../lib/http-error.js'
import { prisma } from '../lib/prisma.js'

export const ticketsRouter = Router()

const demoUser = {
  name: 'Sanjay Kumar',
  email: 'sanjay.kumar@northstar.example',
  role: 'ADMIN',
  department: 'IT Operations',
}

const slaHoursByPriority = { CRITICAL: 4, HIGH: 12, MEDIUM: 24, LOW: 48 }
const ticketSelect = {
  createdBy: { select: { id: true, name: true, email: true, department: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
}

ticketsRouter.get('/', async (req, res) => {
  const filters = ticketQuerySchema.parse(req.query)
  const tickets = await prisma.ticket.findMany({
    where: {
      status: filters.status,
      category: filters.category,
      priority: filters.priority,
    },
    include: ticketSelect,
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
  })
  res.json({ data: tickets })
})

ticketsRouter.get('/:ticketId', async (req, res) => {
  const ticketId = ticketIdSchema.parse(req.params.ticketId)
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: ticketSelect,
  })
  if (!ticket) throw new HttpError(404, 'Ticket not found.')
  res.json({ data: ticket })
})

ticketsRouter.post('/', async (req, res) => {
  const input = ticketCreateSchema.parse(req.body)
  const ai = input.category && input.priority
    ? null
    : await triageTicket(triageInputSchema.parse(input))
  const category = input.category || ai.category
  const priority = input.priority || ai.priority
  const user = await prisma.user.upsert({
    where: { email: demoUser.email },
    update: {},
    create: demoUser,
  })
  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: `INC-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      title: input.title,
      description: input.description,
      category,
      priority,
      slaTargetHours: input.slaTargetHours || ai?.slaTargetHours || slaHoursByPriority[priority],
      aiConfidence: input.aiConfidence ?? ai?.aiConfidence,
      aiTriageSummary: input.aiTriageSummary ?? ai?.aiTriageSummary,
      createdById: user.id,
    },
    include: ticketSelect,
  })
  res.status(201).json({ data: ticket })
})

ticketsRouter.patch('/:ticketId', async (req, res) => {
  const ticketId = ticketIdSchema.parse(req.params.ticketId)
  const input = ticketUpdateSchema.parse(req.body)
  if (input.status === 'RESOLVED') {
    const existing = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { resolutionNote: true },
    })
    if (!existing) throw new HttpError(404, 'Ticket not found.')
    if (!(input.resolutionNote ?? existing.resolutionNote)?.trim()) {
      throw new HttpError(400, 'Add a resolution note before resolving the ticket.')
    }
  }
  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: input,
    include: ticketSelect,
  }).catch((error) => {
    if (error.code === 'P2025') throw new HttpError(404, 'Ticket not found.')
    throw error
  })
  res.json({ data: ticket })
})
