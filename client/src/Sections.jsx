import { useState } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Computer,
  FileText,
  HardDrive,
  LifeBuoy,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  Wifi,
} from 'lucide-react'

const assets = [
  { tag: 'AST-0241', name: 'ThinkPad T14 Gen 4', type: 'Laptop', serial: 'PF4K8D2Q', assigned: 'Ananya Rao', department: 'Supply Chain', location: 'Pune · Plant 1', status: 'In use', icon: Computer, color: 'blue', warranty: 'Aug 2027' },
  { tag: 'AST-0239', name: 'MacBook Pro 14″', type: 'Laptop', serial: 'C02Z91X5', assigned: 'Sanjay Kumar', department: 'IT Operations', location: 'Mumbai · HQ', status: 'In use', icon: Computer, color: 'violet', warranty: 'Jan 2028' },
  { tag: 'AST-0234', name: 'Zebra ZT411', type: 'Label printer', serial: 'ZBR4100921', assigned: 'Warehouse B', department: 'Logistics', location: 'Pune · Plant 1', status: 'Maintenance', icon: FileText, color: 'amber', warranty: 'Mar 2027' },
  { tag: 'AST-0227', name: 'Dell UltraSharp U2723QE', type: 'Monitor', serial: 'CN0MWJ1R', assigned: 'Rohit Nair', department: 'Manufacturing', location: 'Pune · Plant 1', status: 'In use', icon: Computer, color: 'green', warranty: 'Nov 2026' },
  { tag: 'AST-0218', name: 'Cisco Catalyst 9300', type: 'Network switch', serial: 'FCW2445L0AB', assigned: 'IT Infrastructure', department: 'IT Operations', location: 'Mumbai · Data center', status: 'In use', icon: Network, color: 'blue', warranty: 'Jun 2028' },
  { tag: 'AST-0206', name: 'HP EliteBook 840 G9', type: 'Laptop', serial: '5CG3018KQW', assigned: 'Meera Shah', department: 'Finance', location: 'Mumbai · HQ', status: 'Needs review', icon: Computer, color: 'rose', warranty: 'Expired' },
]

const articles = [
  { id: 'KB-014', title: 'Resolve a closed posting period in SAP MIGO', category: 'SAP Enterprise', read: '4 min read', updated: 'Updated 2 days ago', icon: HardDrive, color: 'violet', tags: ['SAP', 'MIGO', 'Goods receipt'], summary: 'A posting period error usually means the posting date falls outside the open periods for the company code. Confirm the posting date and coordinate with Finance before changing period settings.', steps: ['Record the company code, plant, and posting date shown in the error.', 'In SAP, authorized Finance staff can review open periods with the approved accounting-period process.', 'Retry the goods receipt using an approved posting date after Finance confirms the period.', 'If the period should already be open, route the issue to the SAP Finance support team; do not change production configuration without approval.'] },
  { id: 'KB-011', title: 'Troubleshoot intermittent plant VPN connections', category: 'Network & VPN', read: '6 min read', updated: 'Updated 1 week ago', icon: Wifi, color: 'blue', tags: ['VPN', 'Plant network', 'Connectivity'], summary: 'Frequent disconnects can be caused by coverage gaps, device power-saving settings, or a tunnel timeout. First identify whether the issue affects one device or an entire area.', steps: ['Note the device, location, time of disconnect, and any VPN error code.', 'Check whether nearby colleagues can connect from the same location.', 'Restart the approved VPN client and check for pending client updates.', 'If several users in one area are affected, contact Network Operations with the location and timestamps.'] },
  { id: 'KB-008', title: 'Request SAP Fiori role access the right way', category: 'Software & Access', read: '3 min read', updated: 'Updated 3 weeks ago', icon: ShieldCheck, color: 'green', tags: ['Fiori', 'Access', 'Approvals'], summary: 'SAP access is granted through an approved role request so that business approvals and segregation-of-duties checks are completed before provisioning.', steps: ['Name the Fiori application and the business tasks you need to perform.', 'Submit the access request through the organization’s approved access process.', 'Include your manager and business-role owner for approval.', 'Never share an account or ask support to bypass access approvals.'] },
  { id: 'KB-006', title: 'Replace a laptop battery safely', category: 'Hardware', read: '5 min read', updated: 'Updated 1 month ago', icon: Computer, color: 'amber', tags: ['Laptop', 'Battery', 'Hardware'], summary: 'A battery that drains rapidly or causes unexpected shutdowns may need a health check or replacement. Follow the device-support process to preserve data and warranty coverage.', steps: ['Save your work and record the asset tag and battery-health warning.', 'Connect the device to its approved power adapter and back up important files.', 'Open a hardware ticket with the asset tag and any diagnostic warning.', 'Use only an IT-approved replacement; do not open or puncture a swollen battery.'] },
  { id: 'KB-004', title: 'Reconnect a warehouse label printer', category: 'Hardware', read: '4 min read', updated: 'Updated 1 month ago', icon: FileText, color: 'amber', tags: ['Printer', 'Warehouse', 'Labels'], summary: 'If a label printer is offline, check its power and network connection before asking support to inspect the queue or device configuration.', steps: ['Confirm the printer is powered on and check its display for an error.', 'Verify the network cable is connected; do not reset network settings.', 'Check that the correct warehouse printer is selected in the shipping workflow.', 'Open a support ticket with the printer asset tag and a photo or error message.'] },
  { id: 'KB-002', title: 'Get help with a shared drive access error', category: 'Software & Access', read: '3 min read', updated: 'Updated 2 months ago', icon: LifeBuoy, color: 'green', tags: ['Shared drive', 'Permissions', 'Access'], summary: 'Shared-drive access depends on approved group membership and the correct network connection. An access-denied error should be reviewed by the folder owner and IT.', steps: ['Copy the exact folder path and note the time of the error.', 'Check that you are signed in with your organization account and connected to the approved network or VPN.', 'Ask the folder owner to confirm the access request and required business approval.', 'Submit a support ticket if access is still denied; never use another person’s account.'] },
]

export function AssetsPage() {
  const [search, setSearch] = useState('')
  const filteredAssets = assets.filter((asset) =>
    `${asset.tag} ${asset.name} ${asset.assigned} ${asset.department} ${asset.location} ${asset.serial}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="section-page">
      <div className="section-intro-row">
        <div><span className="section-overline">INVENTORY MANAGEMENT</span><h2>Keep every asset accounted for.</h2><p>A clear picture of the devices and infrastructure supporting your teams.</p></div>
        <button className="button button-primary" onClick={() => window.alert('Asset registration will be available when the asset API is connected.')}><Computer size={16} /> Add asset</button>
      </div>
      <div className="asset-summary-grid">
        <SummaryCard label="Total assets" value="248" detail="Across 5 locations" icon={Computer} color="violet" />
        <SummaryCard label="In use" value="219" detail="88% of your inventory" icon={Check} color="green" />
        <SummaryCard label="In maintenance" value="12" detail="4 currently in progress" icon={Wrench} color="amber" />
        <SummaryCard label="Warranty expiring" value="17" detail="Within the next 90 days" icon={Clock3} color="blue" />
      </div>
      <section className="card section-data-card">
        <div className="section-data-heading"><div><h2>Registered assets <span className="ticket-count">{filteredAssets.length}</span></h2><p>Hardware inventory · demo data</p></div><button className="button button-quiet" onClick={() => window.print()}><ArrowDownToLine size={14} /> Export list</button></div>
        <div className="asset-tools"><label className="section-search"><Search size={15} /><input aria-label="Search assets" placeholder="Search by name, tag, or assignee…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><span><i className="asset-demo-dot" /> Sample inventory</span></div>
        <div className="table-scroll"><table className="assets-table">
          <thead><tr><th>ASSET</th><th>ASSIGNED TO</th><th>LOCATION</th><th>STATUS</th><th>WARRANTY</th><th>ASSET TAG</th></tr></thead>
          <tbody>{filteredAssets.length ? filteredAssets.map((asset) => <tr key={asset.tag}>
            <td><div className="asset-name-cell"><span className={`asset-icon ${asset.color}`}><asset.icon size={16} /></span><span><strong>{asset.name}</strong><small>{asset.type} · S/N {asset.serial}</small></span></div></td>
            <td><div className="asset-assigned"><strong>{asset.assigned}</strong><small>{asset.department}</small></div></td>
            <td>{asset.location}</td>
            <td><span className={`asset-status ${asset.status.toLowerCase().replaceAll(' ', '-')}`}><i />{asset.status}</span></td>
            <td className={asset.warranty === 'Expired' ? 'warranty-expired' : ''}>{asset.warranty}</td>
            <td><span className="asset-tag">{asset.tag}</span></td>
          </tr>) : <tr><td colSpan="6"><div className="empty-state"><Search size={19} /><strong>No assets found</strong><span>Try another name, asset tag, or assignee.</span></div></td></tr>}</tbody>
        </table></div>
        <div className="section-card-footer"><span>Showing <strong>{filteredAssets.length}</strong> sample assets. Connect the database for live asset inventory.</span></div>
      </section>
    </div>
  )
}

function SummaryCard({ label, value, detail, icon: Icon, color }) {
  return <article className="card asset-summary-card"><span className={`asset-summary-icon ${color}`}><Icon size={17} /></span><span className="asset-summary-label">{label}</span><strong>{value}</strong><span className="asset-summary-detail">{detail}</span></article>
}

export function KnowledgeBasePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All articles')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const categories = ['All articles', 'SAP Enterprise', 'Hardware', 'Network & VPN', 'Software & Access']
  const filteredArticles = articles.filter((article) => {
    const matchesCategory = category === 'All articles' || article.category === category
    const matchesSearch = `${article.title} ${article.category} ${article.tags.join(' ')} ${article.summary}`.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="section-page">
      <div className="kb-hero">
        <div className="kb-hero-content"><span className="section-overline">NORTHSTAR SUPPORT LIBRARY</span><h2>Find an answer. Get back to work.</h2><p>Practical, team-reviewed guides for the tools and systems your teams use every day.</p>
          <label className="kb-search"><Search size={17} /><input aria-label="Search knowledge articles" placeholder="Search SAP, VPN, access, hardware…" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>↵</kbd></label>
        </div><div className="kb-hero-art"><div className="kb-art-card"><BookOpen size={24} /><span>Helpful answers</span><strong>Right when you need them.</strong></div><span className="kb-art-spark"><Sparkles size={18} /></span></div>
      </div>
      <div className="kb-content-heading"><div><span className="section-overline">SUPPORT ARTICLES</span><h2>Browse the knowledge base <span className="ticket-count">{filteredArticles.length}</span></h2></div><span className="knowledge-demo"><i /> Curated demo guides</span></div>
      <div className="kb-category-tabs" role="tablist" aria-label="Filter knowledge articles">{categories.map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="kb-layout">
        <div className="kb-article-list">
          {filteredArticles.map((article) => <button className="card kb-article-card" key={article.id} onClick={() => setSelectedArticle(article)}>
            <span className={`kb-article-icon ${article.color}`}><article.icon size={17} /></span>
            <span className="kb-article-body"><span className="kb-article-meta">{article.category} <i /> {article.read}</span><strong>{article.title}</strong><span className="kb-article-summary">{article.summary}</span><span className="kb-article-footer">{article.tags.map((tag) => <span key={tag}>{tag}</span>)}<small>{article.updated}</small></span></span>
            <ArrowRight className="kb-article-arrow" size={16} />
          </button>)}
          {!filteredArticles.length && <div className="card kb-empty"><Search size={20} /><strong>No matching guides</strong><span>Try another phrase or category.</span></div>}
        </div>
        <aside className="card kb-sidebar-card"><div className="kb-aside-icon"><Sparkles size={17} /></div><span className="section-overline">AI KNOWLEDGE ASSISTANT</span><h3>Need a little more help?</h3><p>Start with a guide, then share the related ticket with your support engineer for tailored next steps.</p><button onClick={() => setCategory('SAP Enterprise')}>Explore SAP guides <ArrowRight size={14} /></button><div className="kb-aside-note"><ShieldCheck size={14} />Guides are starting points. Follow approved company processes for production changes and access.</div></aside>
      </div>
      {selectedArticle && <ArticleDialog article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </div>
  )
}

function ArticleDialog({ article, onClose }) {
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><article className="modal article-modal" role="dialog" aria-modal="true" aria-labelledby="article-title" onClick={(event) => event.stopPropagation()}>
    <div className="modal-header"><div><span className={`kb-article-icon ${article.color}`}><article.icon size={17} /></span><div><span className="kb-article-meta">{article.category} <i /> {article.read}</span><h2 id="article-title">{article.title}</h2></div></div><button className="icon-button" aria-label="Close article" onClick={onClose}>×</button></div>
    <div className="article-content"><p>{article.summary}</p><h3>Recommended steps</h3><ol>{article.steps.map((step, index) => <li key={`${index}-${step}`}><span>{index + 1}</span>{step}</li>)}</ol><div className="article-caution"><ShieldCheck size={15} />Follow your organization’s approval and change-management process for production systems.</div><span className="article-updated">{article.id} · {article.updated}</span></div>
    <div className="article-actions"><button className="button button-quiet" onClick={onClose}>Back to guides <ChevronRight size={14} /></button></div>
  </article></div>
}
