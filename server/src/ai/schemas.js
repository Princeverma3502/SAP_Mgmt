import { z } from 'zod'

export const assetCategories = ['SAP_ENTERPRISE', 'HARDWARE', 'NETWORK_VPN', 'SOFTWARE_ACCESS']
export const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
export const statuses = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_UAT', 'RESOLVED', 'CLOSED']

export const triageInputSchema = z.object({
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(10).max(5000),
})

export const triageOutputSchema = z.object({
  category: z.enum(assetCategories),
  priority: z.enum(priorities),
  slaTargetHours: z.union([z.literal(4), z.literal(12), z.literal(24), z.literal(48)]),
  aiConfidence: z.number().min(0).max(1),
  aiTriageSummary: z.string().min(1).max(300),
})

export const resolutionOutputSchema = z.object({
  possibleRootCause: z.string().min(1).max(1000),
  recommendedSteps: z.array(z.string().min(1).max(500)).min(1).max(8),
  sapTCode: z.string().max(30).nullable(),
})

export const uatOutputSchema = z.object({
  summary: z.array(z.string().min(1).max(300)).min(1).max(6),
})

export const ticketCreateSchema = z.object({
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(10).max(5000),
  category: z.enum(assetCategories).optional(),
  priority: z.enum(priorities).optional(),
  slaTargetHours: z.union([z.literal(4), z.literal(12), z.literal(24), z.literal(48)]).optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
  aiTriageSummary: z.string().trim().max(300).optional(),
})

export const ticketUpdateSchema = z.object({
  status: z.enum(statuses).optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  resolutionNote: z.string().trim().max(5000).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one update is required.')

export const ticketQuerySchema = z.object({
  status: z.enum(statuses).optional(),
  category: z.enum(assetCategories).optional(),
  priority: z.enum(priorities).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export const uatInputSchema = z.object({
  notes: z.string().trim().min(10).max(5000),
})

export const ticketIdSchema = z.string().uuid()
