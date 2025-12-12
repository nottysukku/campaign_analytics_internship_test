import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000/campaigns'

function App() {
  const [campaigns, setCampaigns] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadCampaigns() {
      try {
        setLoading(true)
        setError('')
        const response = await fetch(API_URL, { signal: controller.signal })
        if (!response.ok) throw new Error('Failed to load campaigns')
        const data = await response.json()
        setCampaigns(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    loadCampaigns()
    return () => controller.abort()
  }, [])

  const filteredCampaigns = useMemo(() => {
    if (statusFilter === 'All') return campaigns
    return campaigns.filter((c) => c.status === statusFilter)
  }, [campaigns, statusFilter])

  const getRowDelay = (index) => `${index * 0.05}s`

  const totals = useMemo(() => {
    const clicks = filteredCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)
    const cost = filteredCampaigns.reduce((sum, c) => sum + (c.cost || 0), 0)
    const impressions = filteredCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0)
    return { clicks, cost, impressions }
  }, [filteredCampaigns])

  return (
    <div className="page">
      <header className="page__header animate-fade-in">
        <div className="animate-slide-down" style={{ animationDelay: '0.1s' }}>
          <p className="eyebrow">Campaign Analytics</p>
          <h1>Grippi Dashboard (lite)</h1>
          <p className="subhead">Mock data served from FastAPI + SQLite</p>
        </div>
        <div className="filter animate-slide-down" style={{ animationDelay: '0.2s' }}>
          <label htmlFor="status" className="filter__label">
            Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter__select filter__select--animated"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
          </select>
        </div>
      </header>

      <section className="summary animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="summary__tile animate-scale-up" style={{ animationDelay: '0.35s' }}>
          <p className="summary__label">Clicks</p>
          <p className="summary__value">{totals.clicks.toLocaleString()}</p>
        </div>
        <div className="summary__tile animate-scale-up" style={{ animationDelay: '0.4s' }}>
          <p className="summary__label">Cost</p>
          <p className="summary__value">${totals.cost.toFixed(2)}</p>
        </div>
        <div className="summary__tile animate-scale-up" style={{ animationDelay: '0.45s' }}>
          <p className="summary__label">Impressions</p>
          <p className="summary__value">{totals.impressions.toLocaleString()}</p>
        </div>
      </section>

      <section className="card animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="card__header">
          <h2>Campaigns</h2>
          {loading && <span className="badge badge--muted animate-pulse">Loading...</span>}
          {error && <span className="badge badge--error animate-shake">{error}</span>}
        </div>

        <div className="table__wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Status</th>
                <th>Clicks</th>
                <th>Cost</th>
                <th>Impressions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign, idx) => (
                <tr key={campaign.id} className="table__row animate-slide-up" style={{ animationDelay: getRowDelay(idx) }}>
                  <td>
                    <div className="campaign-name">{campaign.name}</div>
                    <div className="campaign-id">ID: {campaign.id}</div>
                  </td>
                  <td>
                    <span
                      className={
                        campaign.status === 'Active'
                          ? 'badge badge--success animate-pulse-subtle'
                          : 'badge badge--muted'
                      }
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td>{campaign.clicks?.toLocaleString() ?? '-'}</td>
                  <td>${campaign.cost?.toFixed(2) ?? '0.00'}</td>
                  <td>{campaign.impressions?.toLocaleString() ?? '-'}</td>
                </tr>
              ))}
              {!loading && !error && filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No campaigns match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default App
