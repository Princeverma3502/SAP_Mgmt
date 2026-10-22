import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, BookOpen,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Command,
  Computer, FilePlus2, Filter, LayoutDashboard, LifeBuoy, Menu, MoreHorizontal,
  Network, Plus, Search, Settings2, ShieldCheck, Sparkles, TicketCheck, X,
} from 'lucide-react'
import {
  createTicket as createTicketRequest,
  fromApiTicket,
  getResolution,
  getTriage,
  getTickets,
  getUatSummary,
  toApiTicket,
  updateTicket,
  categoryApiToLabel,
  statusLabelToApi,
} from './api.js'
import { AssetsPage, KnowledgeBasePage } from './Sections.jsx'

const seedTickets = [
  { id: 'INC-2026-104', title: 'Goods receipt blocked in MIGO', detail: 'Period 03/2026 is not open for company code 1000.', category: 'SAP Enterprise', priority: 'High', status: 'In progress', requester: 'Ananya Rao', initials: 'AR', department: 'Supply Chain', age: '18 min ago', color: 'violet', sla: '1h 42m' },
  { id: 'INC-2026-103', title: 'VPN disconnects on plant floor', detail: 'Connection drops every few minutes near assembly line 4.', category: 'Network & VPN', priority: 'Critical', status: 'Assigned', requester: 'Rohit Nair', initials: 'RN', department: 'Manufacturing', age: '42 min ago', color: 'blue', sla: '28m' },
  { id: 'INC-2026-102', title: 'Laptop battery replacement', detail: 'Battery health has dropped below 30%; device shuts down unexpectedly.', category: 'Hardware', priority: 'Medium', status: 'Pending UAT', requester: 'Meera Shah', initials: 'MS', department: 'Finance', age: '2 hours ago', color: 'amber', sla: '6h 12m' },
  { id: 'INC-2026-101', title: 'Request access to SAP Fiori launchpad', detail: 'Need procurement approver access for the new business unit.', category: 'Software & Access', priority: 'Low', status: 'Resolved', requester: 'Vikram Desai', initials: 'VD', department: 'Procurement', age: '4 hours ago', color: 'green', sla: 'Met' },
  { id: 'INC-2026-100', title: 'Printer offline in warehouse B', detail: 'Zebra label printer is unavailable from the shipping desk.', category: 'Hardware', priority: 'High', status: 'In progress', requester: 'Priya Menon', initials: 'PM', department: 'Warehouse', age: '5 hours ago', color: 'rose', sla: '3h 09m' },
  { id: 'INC-2026-099', title: 'Cannot connect to shared drive', detail: 'The finance shared folder returns an access denied message.', category: 'Software & Access', priority: 'Medium', status: 'New', requester: 'Arjun Pillai', initials: 'AP', department: 'Finance', age: '6 hours ago', color: 'cyan', sla: '18h 03m' },
]

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Tickets', icon: TicketCheck, count: '12' },
  { label: 'Assets', icon: Computer },
  { label: 'Knowledge base', icon: BookOpen },
]

const months = [
  { label: 'Jan', value: 44 }, { label: 'Feb', value: 62 }, { label: 'Mar', value: 48 },
  { label: 'Apr', value: 73 }, { label: 'May', value: 57 }, { label: 'Jun', value: 86 },
  { label: 'Jul', value: 65 }, { label: 'Aug', value: 77 }, { label: 'Sep', value: 58 },
  { label: 'Oct', value: 92 }, { label: 'Nov', value: 70 }, { label: 'Dec', value: 83 },
]

function App() {
  const [tickets, setTickets] = useState(seedTickets)
  const [page, setPage] = useState('Overview')
  const [statusFilter, setStatusFilter] = useState('All tickets')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [toast, setToast] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [apiMode, setApiMode] = useState('checking')
  const [apiMessage, setApiMessage] = useState('')

  useEffect(() => {
    let mounted = true
    getTickets().then((records) => {
      if (!mounted) return
      setTickets(records.map(fromApiTicket))
      setApiMode('live')
      setApiMessage('')
    }).catch((error) => {
      if (!mounted) return
      setApiMode('demo')
      setApiMessage(error.message)
    })
    return () => { mounted = false }
  }, [])

  const visibleTickets = useMemo(() => tickets.filter((ticket) => {
    const haystack = `${ticket.id} ${ticket.title} ${ticket.requester} ${ticket.category}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && (statusFilter === 'All tickets' || ticket.status === statusFilter)
  }), [tickets, search, statusFilter])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const createTicket = async (ticket) => {
    try {
      if (apiMode === 'live') {
        const record = await createTicketRequest({
          ...toApiTicket(ticket),
        })
        setTickets((existing) => [fromApiTicket(record), ...existing])
        notify('Ticket saved to the service desk')
      } else {
        setTickets((existing) => [ticket, ...existing])
        notify('Demo ticket created — not saved to the database')
      }
      setStatusFilter('All tickets')
      setPage('Tickets')
      setModalOpen(false)
    } catch (error) {
      notify(error.message)
    }
  }

  const saveTicketChanges = async (ticket, changes) => {
    try {
      if (apiMode === 'live' && ticket.apiId) {
        const updated = await updateTicket(ticket.apiId, {
          status: statusLabelToApi(changes.status),
          resolutionNote: changes.resolutionNote.trim() || null,
        })
        const mapped = fromApiTicket(updated)
        setTickets((existing) => existing.map((item) => item.apiId === ticket.apiId ? mapped : item))
        setSelectedTicket(mapped)
        notify('Ticket changes saved')
      } else {
        const updated = { ...ticket, ...changes }
        setTickets((existing) => existing.map((item) => item.id === ticket.id ? updated : item))
        setSelectedTicket(updated)
        notify('Demo ticket changes saved locally')
      }
    } catch (error) {
      notify(error.message)
      throw error
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Activity size={19} strokeWidth={2.6} /></div>
          <div className="brand-name">resolve<span>.</span><small>IT SERVICE DESK</small></div>
          <button className="icon-button sidebar-close" aria-label="Close menu" onClick={() => setMobileNavOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">N</div>
          <div className="workspace-info"><strong>Northstar Group</strong><span>Enterprise workspace</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>
        <nav className="side-nav" aria-label="Main navigation">
          <p className="nav-label">WORKSPACE</p>
          {navItems.map(({ label, icon: Icon, count }) => (
            <button key={label} onClick={() => { setPage(label); setMobileNavOpen(false) }} className={`nav-link ${page === label ? 'active' : ''}`}>
              <Icon size={17} strokeWidth={1.9} /><span>{label}</span>{count && <span className="nav-count">{count}</span>}
            </button>
          ))}
          <p className="nav-label nav-label-spaced">MANAGE</p>
          <button className="nav-link" onClick={() => notify('Reports are coming in the next release')}><BarChart3 size={17} /><span>Reports & analytics</span></button>
          <button className="nav-link" onClick={() => notify('Settings are coming in the next release')}><Settings2 size={17} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="ai-promo">
            <div className="ai-promo-icon"><Sparkles size={16} /></div>
            <strong>Meet your AI co-pilot</strong>
            <p>Resolve common issues faster with intelligent suggestions.</p>
            <button onClick={() => { setPage('Knowledge base'); notify('AI knowledge assistant coming soon') }}>Explore AI tools <ArrowRight size={14} /></button>
            <Sparkles className="promo-decoration" size={72} />
          </div>
          <button className="help-link" onClick={() => notify('Help center coming soon')}><CircleHelp size={16} /> Help center <ArrowUpRight size={13} /></button>
          <div className="profile">
            <div className="profile-avatar">SK</div>
            <div className="profile-info"><strong>Sanjay Kumar</strong><span>IT Administrator</span></div>
            <MoreHorizontal size={19} className="muted-icon" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{page}</strong></div>
          <div className="topbar-actions">
            <label className="global-search"><Search size={15} /><input aria-label="Search tickets" placeholder="Search anything..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd><Command size={11} /> K</kbd></label>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify('You’re all caught up')}><Bell size={18} /><i /></button>
            <div className="topbar-divider" />
            <button className="topbar-profile"><span className="profile-avatar small">SK</span><ChevronDown size={14} /></button>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="live-dot" /> YOUR SERVICE OPERATIONS</div>
              <h1>{page === 'Overview' ? 'Good morning, Sanjay' : page}</h1>
              <p>{page === 'Overview' ? 'Here’s what’s happening across your IT service desk today.' : page === 'Tickets' ? 'Track, prioritize, and resolve your team’s support requests.' : page === 'Assets' ? 'Keep your hardware and software inventory in sync.' : 'Answers and fixes, ready when you need them.'}</p>
            </div>
            <button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> New ticket</button>
          </section>
          <div className={`connection-banner ${apiMode}`}>
            <span className="connection-indicator" />
            {apiMode === 'checking' ? 'Connecting to the service desk…' : apiMode === 'live' ? 'Connected to live ticket data' : `Demo data · ${apiMessage}`}
          </div>

          {page === 'Overview' ? (
            <>
              <section className="metrics-grid" aria-label="Service desk metrics">
                <MetricCard icon={TicketCheck} label="Open tickets" value="24" change="+12.5%" trend="up" footnote="vs. last week" color="purple" />
                <MetricCard icon={Clock3} label="Avg. resolution time" value="3.2h" change="−18.4%" trend="down" footnote="vs. last week" color="blue" />
                <MetricCard icon={ShieldCheck} label="SLA compliance" value="96.8%" change="+2.4%" trend="up" footnote="vs. last month" color="green" />
                <MetricCard icon={Sparkles} label="AI assisted resolutions" value="68%" change="+8.2%" trend="up" footnote="this month" color="amber" />
              </section>
              <section className="analytics-grid">
                <div className="card volume-card">
                  <div className="card-heading"><div><h2>Ticket volume</h2><p>Requests received over time</p></div><button className="select-button" onClick={() => notify('Showing data for the last 12 months')}>Last 12 months <ChevronDown size={14} /></button></div>
                  <div className="chart-legend"><span><i className="legend-dot violet" /> Created</span><span><i className="legend-dot pale" /> Resolved</span><span className="chart-total">1,284 <small>total tickets</small></span></div>
                  <div className="chart">
                    <div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
                    <div className="chart-plot">
                      {[100, 75, 50, 25, 0].map((value) => <div className="chart-gridline" key={value}><span>{value}</span></div>)}
                      <div className="bars">{months.map((month, index) => <div className="bar-group" key={month.label}><div className="bar-pair"><span className="bar created" style={{ height: `${month.value}%` }} /><span className="bar resolved" style={{ height: `${Math.max(month.value - [6, 11, 7, 14, 9, 12, 5, 13, 8, 15, 9, 10][index], 15)}%` }} /></div><span className="bar-label">{month.label}</span></div>)}</div>
                    </div>
                  </div>
                </div>
                <div className="card sla-card">
                  <div className="card-heading"><div><h2>SLA overview</h2><p>Service level performance</p></div><button className="more-button" aria-label="More options" onClick={() => notify('SLA report opened')}><MoreHorizontal size={19} /></button></div>
                  <div className="sla-gauge-wrap"><div className="sla-gauge"><div><strong>96.8<span>%</span></strong><small>compliance</small></div></div></div>
                  <div className="sla-stats">
                    <div><span><i className="sla-dot met" /> Met this month</span><strong>1,204 <small>tickets</small></strong></div>
                    <div><span><i className="sla-dot breached" /> Breached</span><strong className="breach-text">40 <small>tickets</small></strong></div>
                  </div>
                  <button className="text-link" onClick={() => { setPage('Tickets'); setStatusFilter('All tickets') }}>View SLA report <ArrowRight size={14} /></button>
                </div>
              </section>
              <TicketTable tickets={visibleTickets.slice(0, 5)} statusFilter={statusFilter} setStatusFilter={setStatusFilter} search={search} onSelect={setSelectedTicket} onViewAll={() => { setPage('Tickets'); setStatusFilter('All tickets') }} />
              <section className="bottom-grid">
                <div className="card category-card">
                  <div className="card-heading"><div><h2>Tickets by category</h2><p>Distribution across your service desk</p></div><button className="more-button" aria-label="Category options"><MoreHorizontal size={19} /></button></div>
                  <div className="category-list">
                    <CategoryRow icon={Activity} label="SAP Enterprise" total="38%" count="48" color="violet" width="38%" />
                    <CategoryRow icon={Network} label="Network & VPN" total="27%" count="34" color="blue" width="27%" />
                    <CategoryRow icon={Computer} label="Hardware" total="21%" count="27" color="amber" width="21%" />
                    <CategoryRow icon={LifeBuoy} label="Software & Access" total="14%" count="18" color="green" width="14%" />
                  </div>
                </div>
                <div className="card activity-card">
                  <div className="card-heading"><div><h2>Recent activity</h2><p>Latest updates from your team</p></div><button className="text-link" onClick={() => notify('You’re viewing recent activity')}>View all <ArrowRight size={14} /></button></div>
                  <div className="activity-list">
                    <ActivityRow initials="ML" color="lavender" name="Maya Lee" action="resolved" ticket="INC-2026-097" time="12 min ago" />
                    <ActivityRow initials="AD" color="peach" name="Arun Das" action="assigned" ticket="INC-2026-103" time="34 min ago" />
                    <ActivityRow initials="SK" color="mint" name="Sanjay Kumar" action="added a note to" ticket="INC-2026-104" time="1 hour ago" />
                  </div>
                </div>
              </section>
            </>
          ) : page === 'Tickets' ? (
            <TicketTable tickets={visibleTickets} statusFilter={statusFilter} setStatusFilter={setStatusFilter} search={search} onSelect={setSelectedTicket} onViewAll={() => setStatusFilter('All tickets')} expanded />
          ) : page === 'Assets' ? (
            <AssetsPage />
          ) : (
            <KnowledgeBasePage />
          )}
          <footer className="page-footer"><span>© 2026 Resolve Service Desk</span><span><i className="footer-status" /> All systems operational</span><span>Built for Northstar Group</span></footer>
        </div>
      </main>

      {modalOpen && <NewTicketModal apiMode={apiMode} onClose={() => setModalOpen(false)} onCreate={createTicket} />}
      {selectedTicket && <TicketDetail ticket={selectedTicket} apiMode={apiMode} onClose={() => setSelectedTicket(null)} notify={notify} onSave={saveTicketChanges} />}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
      {mobileNavOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, change, trend, footnote, color }) {
  return <article className="card metric-card">
    <div className="metric-top"><span className={`metric-icon ${color}`}><Icon size={18} /></span><button className="more-button" aria-label={`${label} options`}><MoreHorizontal size={18} /></button></div>
    <span className="metric-label">{label}</span>
    <div className="metric-value-row"><strong>{value}</strong><span className={`metric-change ${trend}`}>{trend === 'down' ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{change}</span></div>
    <span className="metric-footnote">{footnote}</span>
  </article>
}

function TicketTable({ tickets, statusFilter, setStatusFilter, search, onSelect, onViewAll, expanded = false }) {
  const filters = ['All tickets', 'New', 'Assigned', 'In progress', 'Pending UAT', 'Resolved', 'Closed']
  return <section className={`card tickets-card ${expanded ? 'tickets-expanded' : ''}`}>
    <div className="card-heading tickets-heading">
      <div><h2>{expanded ? 'All tickets' : 'Recent tickets'} <span className="ticket-count">{tickets.length}</span></h2><p>{expanded ? 'Manage and track support requests across your team.' : 'Stay on top of the latest support requests.'}</p></div>
      {!expanded && <button className="text-link desktop-view-all" onClick={onViewAll}>View all tickets <ArrowRight size={14} /></button>}
    </div>
    <div className="table-tools">
      <div className="filter-tabs" role="tablist" aria-label="Filter tickets by status">
        {filters.map((filter) => <button key={filter} role="tab" aria-selected={statusFilter === filter} className={statusFilter === filter ? 'selected' : ''} onClick={() => setStatusFilter(filter)}>{filter}{filter === 'New' && <i className="tab-dot" />}</button>)}
      </div>
      <button className="filter-button" onClick={() => setStatusFilter(statusFilter === 'All tickets' ? 'New' : 'All tickets')}><Filter size={14} /> Filter</button>
    </div>
    <div className="table-scroll"><table>
      <thead><tr><th>Ticket</th><th>Category</th><th>Priority</th><th>Status</th><th>Requester</th><th>SLA</th><th /></tr></thead>
      <tbody>
        {tickets.length ? tickets.map((ticket) => <tr key={ticket.id} onClick={() => onSelect(ticket)} tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && onSelect(ticket)}>
          <td><div className="ticket-title">{ticket.title}<span>{ticket.id}</span></div></td>
          <td><span className="category-pill"><i className={`category-indicator ${ticket.color}`} />{ticket.category}</span></td>
          <td><span className={`priority ${ticket.priority.toLowerCase()}`}><i />{ticket.priority}</span></td>
          <td><StatusBadge status={ticket.status} /></td>
          <td><div className="requester"><span className={`requester-avatar ${ticket.color}`}>{ticket.initials}</span><span>{ticket.requester}</span></div></td>
          <td><span className={`sla-value ${ticket.sla === 'Met' ? 'sla-met' : ticket.priority === 'Critical' ? 'sla-urgent' : ''}`}>{ticket.sla}</span></td>
          <td><button className="row-more" aria-label={`More options for ${ticket.id}`} onClick={(event) => { event.stopPropagation(); onSelect(ticket) }}><MoreHorizontal size={17} /></button></td>
        </tr>) : <tr><td colSpan="7"><div className="empty-state"><Search size={19} /><strong>No tickets found</strong><span>{search ? 'Try changing your search or filters.' : 'There are no tickets in this view yet.'}</span></div></td></tr>}
      </tbody>
    </table></div>
    {expanded && <div className="table-pagination"><span>Showing <strong>{tickets.length ? 1 : 0}–{tickets.length}</strong> of <strong>{tickets.length}</strong> tickets</span><div><button className="pagination-button" aria-label="Previous page" disabled><ChevronLeft size={16} /></button><button className="pagination-button current">1</button><button className="pagination-button" aria-label="Next page" disabled><ChevronRight size={16} /></button></div></div>}
    {!expanded && <button className="mobile-view-all" onClick={onViewAll}>View all tickets <ArrowRight size={14} /></button>}
  </section>
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${status.toLowerCase().replaceAll(' ', '-')}`}><i />{status}</span>
}

function CategoryRow({ icon: Icon, label, total, count, color, width }) {
  return <div className="category-row"><span className={`category-icon ${color}`}><Icon size={15} /></span><span className="category-name">{label}</span><div className="category-progress"><span className={color} style={{ width }} /></div><span className="category-total">{total}</span><span className="category-count">{count}</span></div>
}

function ActivityRow({ initials, color, name, action, ticket, time }) {
  return <div className="activity-row"><span className={`activity-avatar ${color}`}>{initials}</span><div><p><strong>{name}</strong> {action} <a href="#tickets">{ticket}</a></p><span>{time}</span></div></div>
}

function NewTicketModal({ apiMode, onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [error, setError] = useState('')
  const [triage, setTriage] = useState(null)
  const [triageState, setTriageState] = useState('idle')
  const [saving, setSaving] = useState(false)
  const detectedCategory = useMemo(() => {
    const text = `${title} ${description}`.toLowerCase()
    if (/sap|fiori|migo|transaction|goods receipt|authorization/.test(text)) return 'SAP Enterprise'
    if (/vpn|network|wi-fi|wifi|connect|internet/.test(text)) return 'Network & VPN'
    if (/laptop|keyboard|monitor|printer|battery|hardware/.test(text)) return 'Hardware'
    if (/access|account|password|software|permission/.test(text)) return 'Software & Access'
    return ''
  }, [title, description])
  useEffect(() => {
    let current = true
    setTriage(null)
    if (apiMode !== 'live' || title.trim().length < 5 || description.trim().length < 10) {
      setTriageState(apiMode === 'live' ? 'idle' : 'demo')
      return () => { current = false }
    }
    setTriageState('loading')
    const timer = window.setTimeout(() => {
      getTriage({ title: title.trim(), description: description.trim() })
        .then((result) => {
          if (!current) return
          setTriage(result)
          setTriageState('ready')
        })
        .catch(() => {
          if (current) setTriageState('error')
        })
    }, 650)
    return () => {
      current = false
      window.clearTimeout(timer)
    }
  }, [apiMode, title, description])

  const submit = async (event) => {
    event.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Add a title and description to create your ticket.')
      return
    }
    const id = `INC-${new Date().getFullYear()}-${String(105 + Math.floor(Math.random() * 800)).padStart(3, '0')}`
    const suggestedCategory = triage ? categoryApiToLabel(triage.category) : detectedCategory
    const suggestedPriority = triage
      ? triage.priority[0] + triage.priority.slice(1).toLowerCase()
      : detectedCategory === 'Network & VPN' ? 'High' : 'Medium'
    const selectedPriority = priority || suggestedPriority
    const slaTargetHours = triage?.slaTargetHours
      || ({ Critical: 4, High: 12, Medium: 24, Low: 48 }[selectedPriority])
    setSaving(true)
    try {
      await onCreate({
        id, title: title.trim(), detail: description.trim(), category: category || suggestedCategory || 'Software & Access',
        priority: selectedPriority, status: 'New',
        requester: 'Sanjay Kumar', initials: 'SK', department: 'IT Operations', age: 'Just now',
        color: 'violet', sla: `${slaTargetHours}h`,
        aiConfidence: triage?.aiConfidence,
        aiTriageSummary: triage?.aiTriageSummary,
        slaTargetHours,
      })
    } finally {
      setSaving(false)
    }
  }
  const suggestedCategory = triage ? categoryApiToLabel(triage.category) : detectedCategory
  return <div className="modal-backdrop" role="presentation" onClick={onClose}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-ticket-title" onClick={(event) => event.stopPropagation()}>
      <div className="modal-header"><div><span className="modal-icon"><FilePlus2 size={18} /></span><div><h2 id="new-ticket-title">Create a ticket</h2><p>Tell us what’s going on and we’ll get right on it.</p></div></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button></div>
      <form onSubmit={submit} className="ticket-form">
        <label>Ticket title <span className="required">*</span><input autoFocus value={title} onChange={(event) => { setTitle(event.target.value); setError('') }} placeholder="e.g. Unable to post goods receipt in SAP" /></label>
        <label>Description <span className="required">*</span><textarea rows="4" value={description} onChange={(event) => { setDescription(event.target.value); setError('') }} placeholder="Share any details that could help us resolve this faster..." /></label>
        {(detectedCategory || title.length > 5) && <div className="triage-hint"><span><Sparkles size={14} /> AI triage {apiMode === 'live' ? 'result' : 'preview'} <small>{apiMode === 'live' ? 'LIVE' : 'DEMO'}</small></span><span className="suggestion-pill">{triageState === 'loading' ? 'Analyzing…' : suggestedCategory || (triageState === 'error' ? 'AI unavailable' : 'No category detected')}</span><span className="suggestion-confidence">{triage ? `${Math.round(triage.aiConfidence * 100)}% confidence` : apiMode === 'live' && triageState === 'error' ? 'Try again or choose manually' : ''}</span></div>}
        <div className="form-row">
          <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">AI suggested</option><option>SAP Enterprise</option><option>Hardware</option><option>Network & VPN</option><option>Software & Access</option></select></label>
          <label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="">AI suggested</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-footer"><span><ShieldCheck size={14} /> Your request is visible to IT support</span><div><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}><Plus size={16} /> {saving ? 'Saving…' : 'Submit ticket'}</button></div></div>
      </form>
    </section>
  </div>
}

function TicketDetail({ ticket, apiMode, onClose, notify, onSave }) {
  const diagnosis = ticket.category === 'SAP Enterprise'
    ? 'Likely caused by a posting period configuration that is not open for the current company code.'
    : ticket.category === 'Network & VPN'
      ? 'Intermittent connectivity may be related to local access point coverage or VPN tunnel timeouts.'
      : 'This request may require a review of device configuration and the associated service access policy.'
  const [suggestions, setSuggestions] = useState(null)
  const [resolutionNote, setResolutionNote] = useState(ticket.resolutionNote || '')
  const [aiLoading, setAiLoading] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [aiError, setAiError] = useState('')
  const [uatSummary, setUatSummary] = useState(null)
  const [uatLoading, setUatLoading] = useState(false)
  const [status, setStatus] = useState(ticket.status)

  const loadSuggestions = async () => {
    if (apiMode !== 'live' || !ticket.apiId) {
      notify('Connect the API and database to use live AI suggestions')
      return
    }
    setAiLoading(true)
    setAiError('')
    try {
      setSuggestions(await getResolution(ticket.apiId))
    } catch (error) {
      setAiError(error.message)
    } finally {
      setAiLoading(false)
    }
  }

  const copySuggestion = () => {
    const text = suggestions
      ? `${suggestions.possibleRootCause}\n\nRecommended steps:\n${suggestions.recommendedSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`
      : diagnosis
    setResolutionNote(text)
    notify(suggestions ? 'AI fix copied to resolution notes' : 'Demo suggestion copied to resolution notes')
  }

  const saveNote = async () => {
    setSavingNote(true)
    try {
      if (status === 'Resolved' && !resolutionNote.trim()) {
        notify('Add resolution notes before resolving this ticket')
        return
      }
      await onSave(ticket, { status, resolutionNote })
    } finally {
      setSavingNote(false)
    }
  }

  const summarizeForUat = async () => {
    if (apiMode !== 'live') {
      notify('Connect the API and database to use the UAT summarizer')
      return
    }
    if (resolutionNote.trim().length < 10) {
      notify('Add at least 10 characters of engineering notes first')
      return
    }
    setUatLoading(true)
    try {
      setUatSummary(await getUatSummary(resolutionNote))
    } catch (error) {
      notify(error.message)
    } finally {
      setUatLoading(false)
    }
  }

  return <div className="drawer-backdrop" onClick={onClose}>
    <aside className="ticket-drawer" role="dialog" aria-modal="true" aria-label={`Ticket ${ticket.id}`} onClick={(event) => event.stopPropagation()}>
      <div className="drawer-top"><span className="drawer-id">{ticket.id}</span><div><button className="icon-button" aria-label="More ticket options"><MoreHorizontal size={19} /></button><button className="icon-button" aria-label="Close ticket detail" onClick={onClose}><X size={18} /></button></div></div>
      <div className="drawer-content">
        <StatusBadge status={ticket.status} /><h2>{ticket.title}</h2><p className="drawer-description">{ticket.detail}</p>
        <div className="drawer-meta"><div><span>Priority</span><strong className={`priority ${ticket.priority.toLowerCase()}`}><i />{ticket.priority}</strong></div><div><span>Category</span><strong>{ticket.category}</strong></div><div><span>SLA remaining</span><strong className={ticket.priority === 'Critical' ? 'breach-text' : ''}>{ticket.sla}</strong></div></div>
        <div className="drawer-section"><h3>Requester</h3><div className="drawer-requester"><span className={`requester-avatar ${ticket.color}`}>{ticket.initials}</span><div><strong>{ticket.requester}</strong><span>{ticket.department} · {ticket.age}</span></div></div></div>
        <div className="drawer-section ai-diagnosis">
          <div className="ai-diagnosis-title"><span><Sparkles size={15} /> AI suggested diagnosis</span><span className="ai-label">{suggestions ? 'LIVE' : 'PREVIEW'}</span></div>
          {suggestions ? <><p><strong>Possible root cause</strong><br />{suggestions.possibleRootCause}</p><strong className="steps-label">Recommended steps</strong><ol className="suggested-steps">{suggestions.recommendedSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>{suggestions.sapTCode && <p className="tcode-hint">SAP transaction: <strong>{suggestions.sapTCode}</strong></p>}</> : <p>{diagnosis}</p>}
          {aiError && <p className="form-error">{aiError}</p>}
          <button className="text-link" onClick={loadSuggestions} disabled={aiLoading}>{aiLoading ? 'Generating suggestions…' : suggestions ? 'Refresh AI suggestions' : 'Generate AI troubleshooting'} <ArrowRight size={14} /></button>
          <button className="copy-fix-button" onClick={copySuggestion}><Check size={14} /> Copy Fix to Resolution Notes</button>
          <label className="resolution-label">Resolution notes<textarea value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} placeholder="Document the fix for the requester..." rows={4} /></label>
          <button className="button button-primary save-note-button" onClick={saveNote} disabled={savingNote}>{savingNote ? 'Saving…' : 'Save notes'}</button>
        </div>
        <div className="drawer-section uat-summary">
          <h3>End-user UAT summary</h3>
          <button className="button button-quiet" onClick={summarizeForUat} disabled={uatLoading}>{uatLoading ? 'Summarizing…' : 'Summarize for the requester'} <Sparkles size={13} /></button>
          {uatSummary && <ul>{uatSummary.summary.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>}
        </div>
        <div className="drawer-section"><h3>Activity</h3><div className="timeline-entry"><span className="timeline-mark"><Plus size={11} /></span><div><strong>Ticket created</strong><span>{ticket.age} · by {ticket.requester}</span></div></div></div>
      </div>
      <div className="drawer-actions">
        <label className="drawer-status-control">Update status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {['New', 'Assigned', 'In progress', 'Pending UAT', 'Resolved', 'Closed'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <button className="button button-primary" onClick={saveNote} disabled={savingNote}>{savingNote ? 'Saving…' : 'Save changes'} <Check size={14} /></button>
      </div>
    </aside>
  </div>
}

export default App
