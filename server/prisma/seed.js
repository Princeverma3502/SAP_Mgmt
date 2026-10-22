import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const demoUser = {
  id: 'aef24f42-21db-4bb3-96a0-d8f5e1a0c101',
  name: 'Sanjay Kumar',
  email: 'sanjay.kumar@northstar.example',
  role: 'ADMIN',
  department: 'IT Operations',
}

const tickets = [
  {
    ticketNumber: 'INC-2026-104',
    title: 'Goods receipt blocked in MIGO',
    description: 'Period 03/2026 is not open for company code 1000.',
    category: 'SAP_ENTERPRISE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    aiConfidence: 0.96,
    aiTriageSummary: 'SAP goods receipt is blocked by a posting period configuration.',
    aiSuggestedFix: 'Verify the posting period for company code 1000 and coordinate with Finance.',
    slaTargetHours: 12,
    resolutionNote: null,
    ageHours: 1,
  },
  {
    ticketNumber: 'INC-2026-103',
    title: 'VPN disconnects on plant floor',
    description: 'Connection drops every few minutes near assembly line 4.',
    category: 'NETWORK_VPN',
    priority: 'CRITICAL',
    status: 'ASSIGNED',
    aiConfidence: 0.91,
    aiTriageSummary: 'Repeated loss of plant connectivity has production impact.',
    slaTargetHours: 4,
    resolutionNote: null,
    ageHours: 2,
  },
  {
    ticketNumber: 'INC-2026-102',
    title: 'Laptop battery replacement',
    description: 'Battery health is below 30%; the device shuts down unexpectedly.',
    category: 'HARDWARE',
    priority: 'MEDIUM',
    status: 'PENDING_UAT',
    aiConfidence: 0.98,
    aiTriageSummary: 'The device battery is degraded and needs replacement.',
    slaTargetHours: 24,
    resolutionNote: 'Battery replaced and charging cycle completed. Confirm device stays on battery power.',
    ageHours: 8,
  },
  {
    ticketNumber: 'INC-2026-101',
    title: 'Request access to SAP Fiori launchpad',
    description: 'Need procurement approver access for the new business unit.',
    category: 'SOFTWARE_ACCESS',
    priority: 'LOW',
    status: 'RESOLVED',
    aiConfidence: 0.89,
    aiTriageSummary: 'The request is for a business application role change.',
    slaTargetHours: 48,
    resolutionNote: 'Procurement approver role assigned after manager approval. User confirmed Fiori access.',
    ageHours: 20,
  },
  {
    ticketNumber: 'INC-2026-100',
    title: 'Printer offline in warehouse B',
    description: 'Zebra label printer is unavailable from the shipping desk.',
    category: 'HARDWARE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    aiConfidence: 0.93,
    aiTriageSummary: 'A warehouse label printer is unavailable and may affect shipping operations.',
    slaTargetHours: 12,
    resolutionNote: null,
    ageHours: 26,
  },
]

async function main() {
  const user = await prisma.user.upsert({
    where: { email: demoUser.email },
    update: { name: demoUser.name, role: demoUser.role, department: demoUser.department },
    create: demoUser,
  })

  for (const { ageHours, ...ticket } of tickets) {
    await prisma.ticket.upsert({
      where: { ticketNumber: ticket.ticketNumber },
      update: { ...ticket, createdById: user.id },
      create: {
        ...ticket,
        createdById: user.id,
        createdAt: new Date(Date.now() - ageHours * 60 * 60 * 1000),
      },
    })
  }

  console.log(`Seeded ${tickets.length} sample tickets for ${user.email}.`)
}

main()
  .catch((error) => {
    console.error('Database seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
