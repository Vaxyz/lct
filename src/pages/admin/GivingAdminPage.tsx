import { useMemo, useState } from 'react'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGivingAnalyticsQuery, useGivingTransactionsQuery } from '../../features/giving/givingApi'

const today = () => new Date().toISOString().slice(0, 10)
const thirtyDaysAgo = () => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - 29)
  return date.toISOString().slice(0, 10)
}
const money = (value: number) => `₦${Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function GivingAdminPage() {
  const [from, setFrom] = useState(thirtyDaysAgo)
  const [to, setTo] = useState(today)
  const validRange = from <= to
  const args = useMemo(() => ({ from, to }), [from, to])
  const { data: analytics, isLoading, isFetching, isError, refetch } = useGivingAnalyticsQuery(args, { skip: !validRange })
  const { data: transactions = [] } = useGivingTransactionsQuery()
  const filteredTransactions = transactions.filter(t => {
    const date = t.createdAt ? new Date(t.createdAt).toISOString().slice(0, 10) : ''
    return date >= from && date <= to
  })

  const exportCsv = () => {
    const rows = [
      ['Date', 'Reference', 'Provider', 'Fund ID', 'Amount', 'Currency', 'Status', 'Donor', 'Anonymous'],
      ...filteredTransactions.map(t => [t.createdAt?.slice(0, 10) || '', t.reference, t.provider, t.fundId, String(t.amount), t.currency, t.status, t.anonymous ? '' : t.donorName, String(t.anonymous)]),
    ]
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `lct-giving-${from}-to-${to}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return <div className="page">
    <div className="mb-6"><Link className="back" to="/dashboard"><ArrowLeft size={16}/> Back to dashboard</Link></div>
    <div className="hero compact"><span className="eyebrow">FINANCE · V9-B</span><h1>Giving analytics</h1><p>Giving performance based on existing transaction records. Successful totals include transactions currently marked SUCCESS.</p></div>

    <section className="card mb-6" aria-label="Report date range">
      <div className="flex flex-wrap items-end gap-4">
        <label className="grid gap-1">From date<input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} /></label>
        <label className="grid gap-1">To date<input type="date" value={to} min={from} max={today()} onChange={e => setTo(e.target.value)} /></label>
        <button type="button" className="button" onClick={() => void refetch()} disabled={!validRange || isFetching}><RefreshCw size={16}/> Refresh</button>
        <button type="button" className="button" onClick={exportCsv}><Download size={16}/> Export CSV</button>
      </div>
      {!validRange && <p className="error mt-3">The start date must be on or before the end date.</p>}
    </section>

    {isError && <p className="error">Unable to load giving analytics. Check that your account has the GIVING_REPORT_VIEW permission and that the backend is running.</p>}
    {(isLoading || isFetching) && <p>Loading giving analytics…</p>}
    {analytics && <>
      <div className="cards">
        <div className="card"><span className="badge">Successful giving</span><h2>{money(analytics.successfulAmount)}</h2><p>{analytics.successfulTransactions} successful transactions</p></div>
        <div className="card"><span className="badge">All transactions</span><h2>{analytics.totalTransactions.toLocaleString()}</h2><p>In selected period</p></div>
        <div className="card"><span className="badge">Pending</span><h2>{analytics.pendingTransactions.toLocaleString()}</h2><p>Awaiting final status</p></div>
        <div className="card"><span className="badge">Failed</span><h2>{analytics.failedTransactions.toLocaleString()}</h2><p>Marked as failed</p></div>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <section className="card"><h2>Giving by day</h2><p className="text-sm text-muted">Successful amounts; dates are UTC.</p>
          {analytics.daily.length === 0 ? <p>No transactions in this period.</p> : <div className="admin-list">{analytics.daily.map(day => <div className="admin-row" key={day.date}><div><strong>{day.date}</strong><small>{day.successfulTransactions} successful / {day.transactions} total</small></div><strong>{money(day.successfulAmount)}</strong></div>)}</div>}
        </section>
        <section className="card"><h2>By payment provider</h2>
          {analytics.providers.length === 0 ? <p>No provider activity in this period.</p> : <div className="admin-list">{analytics.providers.map(provider => <div className="admin-row" key={provider.provider}><div><strong>{provider.provider}</strong><small>{provider.successfulTransactions} successful / {provider.transactions} total</small></div><strong>{money(provider.successfulAmount)}</strong></div>)}</div>}
        </section>
        <section className="card"><h2>By giving fund</h2>
          {analytics.funds.length === 0 ? <p>No fund activity in this period.</p> : <div className="admin-list">{analytics.funds.map(fund => <div className="admin-row" key={fund.fundName}><div><strong>{fund.fundName}</strong><small>{fund.successfulTransactions} successful / {fund.transactions} total</small></div><strong>{money(fund.successfulAmount)}</strong></div>)}</div>}
        </section>
        <section className="card"><h2>Transaction status</h2><div className="admin-list">
          <div className="admin-row"><strong>Successful</strong><strong>{analytics.successfulTransactions}</strong></div>
          <div className="admin-row"><strong>Pending</strong><strong>{analytics.pendingTransactions}</strong></div>
          <div className="admin-row"><strong>Failed</strong><strong>{analytics.failedTransactions}</strong></div>
        </div></section>
      </div>
    </>}

    <section className="admin-list mt-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2>Transactions in selected period</h2><span>{filteredTransactions.length} records</span></div>
      {filteredTransactions.map(t => <div className="admin-row" key={t.id}><div><strong>{money(t.amount)} · {t.provider}</strong><small>{t.anonymous ? 'Anonymous donor' : t.donorName} · {t.reference} · {t.createdAt?.slice(0, 10) || 'Date unavailable'}</small></div><span className={t.status === 'SUCCESS' ? 'success' : 'badge'}>{t.status}</span></div>)}
      {!filteredTransactions.length && <p>No transactions found for this date range.</p>}
    </section>
  </div>
}
