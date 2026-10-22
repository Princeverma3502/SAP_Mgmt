const categoryLabels = {
  SAP_ENTERPRISE: 'SAP Enterprise',
  HARDWARE: 'Hardware',
  NETWORK_VPN: 'Network & VPN',
  SOFTWARE_ACCESS: 'Software & Access',
}

const statusLabels = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  PENDING_UAT: 'Pending UAT',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

const categoryValues = Object.fromEntries(
  Object.entries(categoryLabels).map(([value, label]) => [label, value]),
)

const colors = {
  SAP_ENTERPRISE: 'violet',
  HARDWARE: 'amber',
  NETWORK_VPN: 'blue',
  SOFTWARE_ACCESS: 'green',
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('The API is unreachable. Start the API with `npm run dev:api`.')
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || `The API request failed (${response.status}).`)
  }
  return payload.data
}

export function getTickets() {
  return request('/tickets?limit=100')
}

export function createTicket(ticket) {
  return request('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticket),
  })
}

export function getTriage(ticket) {
  return request('/ai/triage', {
    method: 'POST',
    body: JSON.stringify(ticket),
  })
}

export function getResolution(ticketId) {
  return request(`/ai/tickets/${encodeURIComponent(ticketId)}/resolution`)
}

export function getUatSummary(notes) {
  return request('/ai/uat-summary', {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}

export function updateTicket(ticketId, changes) {
  return request(`/tickets/${encodeURIComponent(ticketId)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  })
}

export function toApiTicket(ticket) {
  return {
    title: ticket.title,
    description: ticket.detail,
    category: categoryValues[ticket.category],
    priority: ticket.priority.toUpperCase(),
    slaTargetHours: ticket.slaTargetHours,
    aiConfidence: ticket.aiConfidence,
    aiTriageSummary: ticket.aiTriageSummary,
  }
}

export function fromApiTicket(ticket) {
  const createdAt = new Date(ticket.createdAt)
  const ageMinutes = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60_000))
  const age = ageMinutes < 60
    ? `${ageMinutes} min ago`
    : `${Math.floor(ageMinutes / 60)} hours ago`
  const remainingMs = createdAt.getTime() + ticket.slaTargetHours * 60 * 60 * 1000 - Date.now()
  const sla = ['RESOLVED', 'CLOSED'].includes(ticket.status)
    ? 'Met'
    : remainingMs <= 0
      ? 'Breached'
      : remainingMs < 60 * 60 * 1000
        ? `${Math.ceil(remainingMs / 60_000)}m`
        : `${Math.floor(remainingMs / (60 * 60 * 1000))}h ${Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000))}m`

  return {
    apiId: ticket.id,
    id: ticket.ticketNumber,
    title: ticket.title,
    detail: ticket.description,
    category: categoryLabels[ticket.category],
    priority: ticket.priority[0] + ticket.priority.slice(1).toLowerCase(),
    status: statusLabels[ticket.status],
    requester: ticket.createdBy.name,
    initials: ticket.createdBy.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    department: ticket.createdBy.department,
    age,
    color: colors[ticket.category],
    sla,
    resolutionNote: ticket.resolutionNote,
    aiConfidence: ticket.aiConfidence,
    aiTriageSummary: ticket.aiTriageSummary,
    slaTargetHours: ticket.slaTargetHours,
  }
}

export function categoryLabelToApi(label) {
  return categoryValues[label]
}

export function categoryApiToLabel(category) {
  return categoryLabels[category]
}

export function statusApiToLabel(status) {
  return statusLabels[status]
}

export function statusLabelToApi(label) {
  return Object.entries(statusLabels).find(([, value]) => value === label)?.[0]
}
