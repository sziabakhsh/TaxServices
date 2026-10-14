import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/http/api'
import './FinancialReportsPage.css'

type Row = { id: string; clientId: string; clientName: string; invoiceNumber: string; status: number; issueDate: string; dueDate: string; totalAmount: number; paidAmount: number; outstandingAmount: number; isOverdue: boolean }
type Report = { totalInvoiced: number; totalCollected: number; outstandingBalance: number; overdueBalance: number; paidInvoices: number; invoices: Row[]; monthlyCollections: {month: string; amount: number}[] }
const money = (value: number) => new Intl.NumberFormat('en-CA', {style: 'currency', currency: 'CAD'}).format(value)
const statuses: Record<number,string> = {1:'Draft',2:'Issued',3:'Paid',4:'Overdue',5:'Cancelled'}
const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

export default function FinancialReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState('all')
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    api.get<Report>('/financial-reports', { params: {from: from || undefined, to: to || undefined, clientId: clientId || undefined}, signal: controller.signal })
      .then(({data}) => setReport(data))
      .catch(e => { if (e.code !== 'ERR_CANCELED') setError('Unable to load financial reports. Check the filters and try again.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [from,to,clientId])
  const rows = useMemo(() => (report?.invoices ?? []).filter(i => status === 'all' || (status === 'overdue' ? i.isOverdue : status === 'outstanding' ? i.outstandingAmount > 0 : status === 'paid' ? i.status === 3 : i.status === Number(status))), [report,status])
  function exportCsv() {
    const header = ['Invoice','Client','Status','Issue Date','Due Date','Total CAD','Paid CAD','Outstanding CAD','Overdue']
    const data = rows.map(i => [i.invoiceNumber,i.clientName,statuses[i.status],i.issueDate.slice(0,10),i.dueDate.slice(0,10),i.totalAmount,i.paidAmount,i.outstandingAmount,i.isOverdue])
    const csv = '\uFEFF' + [header,...data].map(line => line.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8;'}))
    const a = document.createElement('a'); a.href=url; a.download='financial-reports.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return <main className="financial-reports">
    <div className="financial-reports__heading"><div><h1>Financial Reports</h1><p>Collections, paid invoices and outstanding balances (CAD).</p></div><button type="button" disabled={!report || loading} onClick={exportCsv}>Export CSV</button></div>
    <div className="financial-reports__filters">
      <label>From <input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label>
      <label>To <input type="date" value={to} onChange={e=>setTo(e.target.value)} /></label>
      <label>Client ID <input placeholder="Optional client GUID" value={clientId} onChange={e=>setClientId(e.target.value)} /></label>
      <label>Invoice status <select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All</option><option value="paid">Paid</option><option value="outstanding">Outstanding</option><option value="overdue">Overdue</option><option value="2">Issued</option><option value="1">Draft</option><option value="5">Cancelled</option></select></label>
    </div>
    {loading && <p role="status">Loading reports...</p>}{error && <p role="alert">{error}</p>}
    {report && !loading && <>
      <div className="financial-reports__cards">{[['Total invoiced',report.totalInvoiced],['Collected',report.totalCollected],['Outstanding',report.outstandingBalance],['Overdue',report.overdueBalance]].map(([name,value])=><section key={name} className="financial-reports__card"><span>{name}</span><strong>{money(Number(value))}</strong></section>)}</div>
      <section><h2>Monthly collections</h2><div className="financial-reports__months">{report.monthlyCollections.length === 0 ? <p>No successful payments in this period.</p> : report.monthlyCollections.map(m=><div key={m.month}><span>{m.month}</span><div className="financial-reports__bar"><div style={{width: `${Math.max(1, 100*m.amount/Math.max(...report.monthlyCollections.map(x=>x.amount),1))}%`}} /></div><strong>{money(m.amount)}</strong></div>)}</div></section>
      <section><h2>Invoices ({rows.length})</h2><div className="financial-reports__table-wrap"><table><thead><tr><th>Invoice</th><th>Client</th><th>Status</th><th>Issued</th><th>Due</th><th>Total</th><th>Paid</th><th>Outstanding</th></tr></thead><tbody>{rows.map(i=><tr key={i.id}><td><Link to={`/staff/invoices/${i.id}`}>{i.invoiceNumber}</Link></td><td>{i.clientName}</td><td>{i.isOverdue ? 'Overdue' : statuses[i.status]}</td><td>{i.issueDate.slice(0,10)}</td><td>{i.dueDate.slice(0,10)}</td><td>{money(i.totalAmount)}</td><td>{money(i.paidAmount)}</td><td>{money(i.outstandingAmount)}</td></tr>)}</tbody></table>{rows.length===0 && <p>No invoices match these filters.</p>}</div></section>
    </>}
    <p className="financial-reports__note">Invoice totals are filtered by issue date; collections by payment date. Outstanding balances are based on invoices issued in the selected period. Refunded transactions require separate net-revenue reporting.</p>
  </main>
}
