'use client'

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, BookOpen,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3,
  Cpu, Database, ExternalLink, Globe2, History, Info, Layers3, LayoutDashboard,
  Loader2, Menu, Network, Pause, Play, Plus, Radio, RefreshCw, Route, Search,
  Server, Settings2, ShieldCheck, Signal, SlidersHorizontal, Sparkles, StopCircle,
  Timer, Trash2, TrendingUp, Wifi, XCircle, Zap, X
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import {
  api, NetworkResponse, BandwidthResponse, DevicesResponse, ServicesResponse,
  HistoryResponse, DeviceItem, DeviceDetailResponse, ServiceItem, HistoryRecord,
  TrafficRecordItem, TrafficResponse, TrafficSummaryResponse, AnalyticsOverviewResponse,
  TimelineResponse, TimelinePoint, TopDeviceItem, TopServiceItem, AlertItem,
  AlertsResponse, SettingsResponse
} from '@/lib/api'

// Navigation items
const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'devices', label: 'Devices & Interfaces', icon: Wifi },
  { id: 'services', label: 'Services & Protocols', icon: Layers3 },
  { id: 'traffic', label: 'Traffic Details', icon: Route },
  { id: 'history', label: 'Traffic History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings2 },
  { id: 'about', label: 'About Project', icon: BookOpen },
]

// Mini sparkline SVG component
function MiniChart({ color = '#48c5ff' }: { color?: string }) {
  return (
    <svg viewBox="0 0 160 45" className="mini-chart" aria-hidden="true">
      <path
        d="M0 34 C18 28, 21 35, 36 24 S57 29, 68 19 S89 25, 103 14 S126 18, 143 8 S151 12, 160 4"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  )
}

function Card({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return <section className={`card ${className}`} style={style}>{children}</section>
}

function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Badge({
  children,
  tone = 'blue'
}: {
  children: React.ReactNode
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate'
}) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {children}
    </span>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  trend,
  tone = 'blue'
}: {
  icon: any
  label: string
  value: string
  detail: string
  trend?: string
  tone?: string
}) {
  const chartColor = tone === 'green' ? '#40d9a4' : tone === 'amber' ? '#f7b955' : tone === 'red' ? '#ee6f7b' : '#48c5ff'
  return (
    <Card className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon /></div>
      <div className="stat-copy">
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
      {trend && (
        <div className="stat-trend">
          <ArrowUpRight />{trend}
        </div>
      )}
      <MiniChart color={chartColor} />
    </Card>
  )
}

function Header({ page, onMenu, onRefresh }: { page: string; onMenu: () => void; onRefresh: () => void }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu} aria-label="Open navigation">
        <Menu />
      </button>
      <div className="crumb">
        <span>TrafficLens</span>
        <ChevronRight />
        <strong>{page}</strong>
      </div>
      <div className="top-actions">
        <div className="live-pill">
          <span className="pulse" style={{ backgroundColor: '#40d9a4' }} />
          Live Telemetry
        </div>
        <button className="icon-btn" aria-label="Refresh Data" onClick={onRefresh} title="Refresh Data">
          <RefreshCw />
        </button>
        <div className="avatar" title="Student Administrator">TL</div>
      </div>
    </header>
  )
}

function Sidebar({
  active,
  setActive,
  collapsed,
  setCollapsed,
  mobileOpen,
  backendOnline
}: {
  active: string
  setActive: (id: string) => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  backendOnline: boolean
}) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Network /></div>
        {!collapsed && (
          <div>
            <strong>TrafficLens</strong>
            <span>Network Traffic Monitor</span>
          </div>
        )}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Collapse sidebar"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      <div className="sidebar-label">{!collapsed && 'MONITORING'}</div>
      <nav>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={active === id ? 'nav-item active' : 'nav-item'}
            onClick={() => setActive(id)}
            title={collapsed ? label : undefined}
          >
            <Icon />
            {!collapsed && <span>{label}</span>}
            {active === id && !collapsed && <span className="nav-active-dot" />}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-bottom">
          <div className="backend-status">
            <div className="status-heading">
              <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
              API CONNECTION
            </div>
            <strong>{backendOnline ? 'FastAPI backend online' : 'Backend offline'}</strong>
            <p>
              {backendOnline
                ? 'psutil & Scapy real-time metrics streaming.'
                : 'Ensure TrafficLens FastAPI backend is running on port 8000.'}
            </p>
            <span className="backend-endpoint" style={{ fontSize: '10px', color: '#62819d', wordBreak: 'break-all' }}>
              {api.baseUrl ? `${api.baseUrl}/api/health` : 'NEXT_PUBLIC_API_URL not set'}
            </span>
            <button
              onClick={() => window.open(api.healthUrl, '_blank')}
              disabled={!api.baseUrl}
              style={{ marginTop: '8px' }}
            >
              <ExternalLink /> Open /api/health
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="avatar small">TL</div>
            <div>
              <strong>Computer Networks</strong>
              <span>B.Tech PBL Project</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      {payload.map((item: any, i: number) => (
        <strong key={i} style={{ color: item.color || '#48c5ff', marginTop: '2px' }}>
          {item.name}: {item.value} KB/s
        </strong>
      ))}
    </div>
  )
}

// ==============================================================================
// 1. OVERVIEW PAGE
// ==============================================================================

function OverviewPage({
  network,
  bandwidth,
  overview,
  topDevices,
  topServices,
  devices,
  services,
  alerts,
  history,
  timelinePoints,
  timelineRange,
  setTimelineRange,
  backendOnline,
  loading,
  error,
  go
}: {
  network: NetworkResponse | null
  bandwidth: BandwidthResponse | null
  overview: AnalyticsOverviewResponse | null
  topDevices: TopDeviceItem[]
  topServices: TopServiceItem[]
  devices: DeviceItem[]
  services: ServiceItem[]
  alerts: AlertItem[]
  history: HistoryRecord[]
  timelinePoints: TimelinePoint[]
  timelineRange: string
  setTimelineRange: (r: string) => void
  backendOnline: boolean
  loading: boolean
  error: string
  go: (id: string) => void
}) {
  const chartData = useMemo(() => {
    if (timelinePoints && timelinePoints.length > 0) {
      return timelinePoints.map((p) => ({
        time: p.time,
        download: parseFloat(((p.download_bytes || 0) / 1024).toFixed(2)),
        upload: parseFloat(((p.upload_bytes || 0) / 1024).toFixed(2)),
        total: parseFloat((((p.download_bytes || 0) + (p.upload_bytes || 0)) / 1024).toFixed(2)),
      }))
    }
    if (!history || history.length === 0) return []
    return history.map((h) => ({
      time: h.time || (h.timestamp ? h.timestamp.split('T')[1]?.slice(0, 8) : ''),
      download: parseFloat((h.download / 1024).toFixed(2)),
      upload: parseFloat((h.upload / 1024).toFixed(2)),
      total: parseFloat((h.total / 1024).toFixed(2))
    }))
  }, [timelinePoints, history])

  const topDevicesDisplay = useMemo(() => {
    if (topDevices && topDevices.length > 0) return topDevices.slice(0, 5)
    return devices.slice(0, 5).map(d => ({
      device: d.device_name,
      ip_address: d.ip_address,
      mac_address: d.mac_address,
      download_bytes: d.download_usage || 0,
      upload_bytes: d.upload_usage || 0,
      total_bytes: d.total_usage || 0,
      total_bytes_formatted: d.total_usage_formatted || '0 B',
      percentage: 0
    }))
  }, [topDevices, devices])

  const topServicesDisplay = useMemo(() => {
    if (topServices && topServices.length > 0) return topServices.slice(0, 5)
    return services.slice(0, 5).map(s => ({
      service: s.service,
      protocol: s.protocol,
      download_bytes: s.download_bytes || 0,
      upload_bytes: s.upload_bytes || 0,
      total_bytes: s.total_bytes || s.connection_count * 1024,
      total_bytes_formatted: s.total_bytes_formatted || `${s.connection_count} conns`,
      percentage: 0
    }))
  }, [topServices, services])

  const totalSockets = useMemo(() => {
    return services.reduce((acc, s) => acc + s.connection_count, 0)
  }, [services])

  const trafficLevel = overview?.traffic_level || bandwidth?.traffic_level || 'LOW'
  const trafficLevelTone = trafficLevel === 'HIGH' ? 'red' : trafficLevel === 'MEDIUM' ? 'amber' : 'green'

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" /> REAL-TIME MONITORING</p>
          <h1>Network Traffic Dashboard</h1>
          <p>Live bandwidth metrics, system socket monitoring, and interface telemetry.</p>
        </div>
        <div className="heading-actions">
          <Badge tone={backendOnline ? 'green' : 'red'}>
            {backendOnline ? 'Backend Online' : 'Backend Disconnected'}
          </Badge>
          {overview?.network_load && (
            <Badge tone={overview.network_load === 'Heavy' ? 'red' : overview.network_load === 'Moderate' ? 'amber' : 'blue'}>
              Load: {overview.network_load}
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="inline-notice" style={{ borderColor: '#80343f', background: '#2b1419', color: '#ff9ba7', marginBottom: '16px' }}>
          <AlertTriangle />
          <span>{error}</span>
          <button onClick={() => window.location.reload()} style={{ color: '#fff', textDecoration: 'underline' }}>
            Retry
          </button>
        </div>
      )}

      {/* Active Alerts Banner if Anomaly Triggered */}
      {alerts && alerts.length > 0 && (
        <div className="inline-notice" style={{ borderColor: '#8a6d2b', background: '#261e12', color: '#f7d382', marginBottom: '16px' }}>
          <AlertTriangle />
          <span>
            <strong>Recent Alert:</strong> {alerts[0].message} ({alerts[0].timestamp ? alerts[0].timestamp.split('T')[1]?.slice(0, 8) : 'Just now'})
          </span>
          <button onClick={() => go('settings')} style={{ color: '#54c9f4', textDecoration: 'underline', marginLeft: 'auto' }}>
            View in Settings
          </button>
        </div>
      )}

      {/* Hero Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={ArrowDownRight}
          label="Download Speed"
          value={overview?.current_download_rate || bandwidth?.download_speed_formatted || network?.download_speed_formatted || '0.00 B/s'}
          detail={`Cumulative: ${overview?.download_bytes_formatted || bandwidth?.download_bytes_formatted || network?.download_bytes_formatted || '0 B'}`}
          tone="blue"
        />
        <StatCard
          icon={ArrowUpRight}
          label="Upload Speed"
          value={overview?.current_upload_rate || bandwidth?.upload_speed_formatted || network?.upload_speed_formatted || '0.00 B/s'}
          detail={`Cumulative: ${overview?.upload_bytes_formatted || bandwidth?.upload_bytes_formatted || network?.upload_bytes_formatted || '0 B'}`}
          tone="green"
        />
        <StatCard
          icon={Activity}
          label="Total Bandwidth Rate"
          value={bandwidth?.total_speed_formatted || network?.total_speed_formatted || '0.00 B/s'}
          detail={`Traffic Level: ${trafficLevel} • Peak: ${(overview?.peak_download_mbps || 0).toFixed(2)} Mb/s`}
          tone={trafficLevelTone}
        />
        <StatCard
          icon={Radio}
          label="Active Sockets & Nodes"
          value={String(totalSockets || (loading ? '—' : '0'))}
          detail={`${overview?.active_devices || devices.length} devices • ${services.length} active services`}
          tone="slate"
        />
      </div>

      {/* Live Chart & Services Grid */}
      <div className="dashboard-grid">
        <Card className="latency-card">
          <SectionTitle
            eyebrow="BANDWIDTH OVER TIME (KB/S)"
            title="Real-Time Traffic Graph"
            action={
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <select
                  value={timelineRange}
                  onChange={(e) => setTimelineRange(e.target.value)}
                  style={{
                    background: '#0d1d2e',
                    color: '#8da4bd',
                    border: '1px solid #1f344d',
                    borderRadius: '5px',
                    fontSize: '10px',
                    padding: '2px 6px'
                  }}
                >
                  <option value="1h">1 Hour</option>
                  <option value="6h">6 Hours</option>
                  <option value="24h">24 Hours</option>
                </select>
                <Badge tone={chartData.length > 0 ? 'blue' : 'amber'}>
                  {chartData.length > 0 ? 'Live Telemetry' : 'Collecting data...'}
                </Badge>
              </div>
            }
          />
          <div className="chart-meta">
            <div>
              <strong>
                {bandwidth ? bandwidth.total_mbps.toFixed(2) : (network ? (network.total_speed / 1024).toFixed(2) : '0.00')}{' '}
                <small>{bandwidth ? 'Mbps' : 'KB/s'}</small>
              </strong>
              <span>
                <ArrowDownRight /> {bandwidth?.download_speed_formatted || network?.download_speed_formatted || '0 B/s'} down •{' '}
                <ArrowUpRight /> {bandwidth?.upload_speed_formatted || network?.upload_speed_formatted || '0 B/s'} up
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#748ba3' }}>
              {chartData.length} records in buffer • Interface: {bandwidth?.active_interface || 'Default'}
            </span>
          </div>

          <div className="chart-box">
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6e8098' }}>
                {loading ? 'Collecting initial network samples...' : 'Awaiting telemetry from FastAPI backend...'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="downFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="upFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e2e42" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: '#6e8098', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={25} />
                  <YAxis tick={{ fill: '#6e8098', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: any) => `${v}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" name="Download" dataKey="download" stroke="#38bdf8" strokeWidth={2} fill="url(#downFill)" dot={false} isAnimationActive={false} />
                  <Area type="monotone" name="Upload" dataKey="upload" stroke="#34d399" strokeWidth={2} fill="url(#upFill)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Top Services Preview */}
        <Card className="route-card">
          <SectionTitle
            eyebrow="ACTIVE SERVICES"
            title="Top Network Consumers"
            action={<button className="text-btn" onClick={() => go('services')}>View all <ArrowUpRight /></button>}
          />
          <div className="table-wrap" style={{ padding: '8px 18px' }}>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Proto</th>
                  <th>Traffic Share</th>
                  <th>Usage</th>
                </tr>
              </thead>
              <tbody>
                {topServicesDisplay.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted-cell" style={{ textAlign: 'center', padding: '24px 0' }}>
                      {loading ? 'Inspecting active sockets...' : 'No active network services found.'}
                    </td>
                  </tr>
                ) : (
                  topServicesDisplay.map((s, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: '#e8f0fa' }}>{s.service}</strong></td>
                      <td><span className="mono">{s.protocol}</span></td>
                      <td>
                        {s.percentage > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ flex: 1, height: '4px', background: '#1c2d42', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${s.percentage}%`, height: '100%', background: '#48c5ff' }} />
                            </div>
                            <span style={{ fontSize: '9px', color: '#748ba3' }}>{s.percentage}%</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '10px', color: '#748ba3' }}>Active</span>
                        )}
                      </td>
                      <td className="result-text">{s.total_bytes_formatted}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Interfaces & Device Snapshot */}
      <Card className="recent-card" style={{ marginTop: '16px' }}>
        <SectionTitle
          eyebrow="NETWORK INTERFACES & TOP DEVICES"
          title="Hardware Adapters & Data Usage"
          action={<button className="text-btn" onClick={() => go('devices')}>Manage devices <ArrowUpRight /></button>}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Device / Interface</th>
                <th>IP Address</th>
                <th>MAC Address</th>
                <th>Share %</th>
                <th>Total Usage</th>
              </tr>
            </thead>
            <tbody>
              {topDevicesDisplay.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted-cell" style={{ textAlign: 'center', padding: '24px 0' }}>
                    {loading ? 'Scanning local network interfaces...' : 'No network interfaces detected.'}
                  </td>
                </tr>
              ) : (
                topDevicesDisplay.map((d, i) => (
                  <tr key={i}>
                    <td><strong style={{ color: '#dceaf7' }}>{d.device}</strong></td>
                    <td className="mono">{d.ip_address || '—'}</td>
                    <td className="mono">{d.mac_address || '—'}</td>
                    <td>
                      {d.percentage > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px' }}>
                          <div style={{ flex: 1, height: '4px', background: '#1c2d42', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${d.percentage}%`, height: '100%', background: '#34d399' }} />
                          </div>
                          <span style={{ fontSize: '9px', color: '#748ba3' }}>{d.percentage}%</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '10px', color: '#748ba3' }}>—</span>
                      )}
                    </td>
                    <td><strong style={{ color: '#48c5ff' }}>{d.total_bytes_formatted}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ==============================================================================
// 2. DEVICES & INTERFACES PAGE (WITH MODAL INSPECTION)
// ==============================================================================

function DevicesPage({
  devices,
  loading,
  error,
  onRefresh
}: {
  devices: DeviceItem[]
  loading: boolean
  error: string
  onRefresh: () => void
}) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null)
  const [deviceDetail, setDeviceDetail] = useState<DeviceDetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const handleInspectDevice = async (device: DeviceItem) => {
    setSelectedDevice(device)
    if (device.id) {
      setDetailLoading(true)
      try {
        const detail = await api.getDevice(device.id)
        setDeviceDetail(detail)
      } catch {
        setDeviceDetail(null)
      } finally {
        setDetailLoading(false)
      }
    } else {
      setDeviceDetail(null)
    }
  }

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      const matchSearch =
        d.device_name.toLowerCase().includes(search.toLowerCase()) ||
        d.ip_address.toLowerCase().includes(search.toLowerCase()) ||
        d.mac_address.toLowerCase().includes(search.toLowerCase())
      const matchFilter =
        filter === 'All' ||
        (filter === 'Hardware NIC' && d.device_type === 'interface') ||
        (filter === 'LAN Neighbors' && d.device_type === 'lan_neighbor')
      return matchSearch && matchFilter
    })
  }, [devices, search, filter])

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" /> HARDWARE & SUBNET TELEMETRY</p>
          <h1>Devices & Network Interfaces</h1>
          <p>Real hardware-level network interface counters and detected local subnet nodes.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-btn" onClick={onRefresh}>
            <RefreshCw /> Refresh List
          </button>
        </div>
      </div>

      {error && (
        <div className="inline-notice" style={{ borderColor: '#80343f', background: '#2b1419', color: '#ff9ba7', marginBottom: '16px' }}>
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="history-card" style={{ marginBottom: '18px' }}>
        <div className="filter-bar">
          <div className="search-wrap">
            <Search />
            <input
              placeholder="Search by interface name, IP, or MAC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label className="filter-btn">
            <SlidersHorizontal />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              <option>Hardware NIC</option>
              <option>LAN Neighbors</option>
            </select>
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Device / Interface Name</th>
                <th>Category</th>
                <th>IP Address</th>
                <th>MAC Address</th>
                <th>Link Status</th>
                <th>Link Speed</th>
                <th>Download</th>
                <th>Upload</th>
                <th>Total Usage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="muted-cell" style={{ textAlign: 'center', padding: '30px 0' }}>
                    {loading ? 'Loading devices from backend...' : 'No matching network devices or interfaces found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="table-target">
                        <Wifi /> {d.device_name}
                      </span>
                    </td>
                    <td>{d.device_type === 'interface' ? 'Hardware Adapter' : 'LAN Node (ARP)'}</td>
                    <td className="mono">{d.ip_address}</td>
                    <td className="mono">{d.mac_address}</td>
                    <td>
                      <Badge tone={d.status === 'online' ? 'green' : d.status === 'detected' ? 'blue' : 'slate'}>
                        {d.status}
                      </Badge>
                    </td>
                    <td>{d.speed_mbps ? `${d.speed_mbps} Mbps` : '—'}</td>
                    <td>{d.download_usage_formatted}</td>
                    <td>{d.upload_usage_formatted}</td>
                    <td><strong style={{ color: '#48c5ff' }}>{d.total_usage_formatted}</strong></td>
                    <td>
                      <button
                        className="text-btn"
                        onClick={() => handleInspectDevice(d)}
                        title="Inspect Device Telemetry"
                      >
                        Inspect <ArrowUpRight />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Academic PBL Limitation Note */}
      <Card style={{ padding: '18px 22px', borderLeft: '4px solid #f7b955' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '13px', color: '#f7b955', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} /> Computer Networks PBL Scope & Technical Limitation Note
        </h3>
        <p style={{ margin: 0, color: '#90a4ba', fontSize: '11px', lineHeight: '1.6' }}>
          Under standard operating system architectures without elevated raw promiscuous capture or router SNMP access,
          an individual host machine measures hardware I/O byte counters for its own network interfaces.
          Neighbouring LAN devices discovered through the ARP cache table are visualized for network topology mapping.
        </p>
      </Card>

      {/* Device Inspection Modal */}
      {selectedDevice && (
        <div className="modal-backdrop" onClick={() => setSelectedDevice(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDevice(null)}>
              <X />
            </button>
            <p className="eyebrow"><span className="eyebrow-mark" /> DEVICE TELEMETRY</p>
            <h2>{selectedDevice.device_name}</h2>

            <div className="detail-grid">
              <div>
                <span>IP Address</span>
                <strong>{selectedDevice.ip_address}</strong>
              </div>
              <div>
                <span>MAC Address</span>
                <strong>{selectedDevice.mac_address}</strong>
              </div>
              <div>
                <span>Device Type</span>
                <strong>{selectedDevice.device_type === 'interface' ? 'Hardware Adapter' : 'LAN Neighbor'}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{selectedDevice.status}</strong>
              </div>
              <div>
                <span>Download Total</span>
                <strong style={{ color: '#38bdf8' }}>{selectedDevice.download_usage_formatted}</strong>
              </div>
              <div>
                <span>Upload Total</span>
                <strong style={{ color: '#34d399' }}>{selectedDevice.upload_usage_formatted}</strong>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '13px', margin: '0 0 10px', color: '#dceaf7' }}>
                Recent Traffic Flows Associated With Device
              </h3>
              {detailLoading ? (
                <p style={{ color: '#6e8098', fontSize: '11px' }}>Loading flow records from database...</p>
              ) : deviceDetail && deviceDetail.recent_traffic && deviceDetail.recent_traffic.length > 0 ? (
                <div className="table-wrap" style={{ maxHeight: '180px', overflowY: 'auto', padding: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Dest IP</th>
                        <th>Proto</th>
                        <th>Service</th>
                        <th>Bytes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deviceDetail.recent_traffic.slice(0, 5).map((t, i) => (
                        <tr key={i}>
                          <td className="mono">{t.timestamp ? t.timestamp.split('T')[1]?.slice(0, 8) : '—'}</td>
                          <td className="mono">{t.destination_ip}</td>
                          <td><span className="mono">{t.protocol}</span></td>
                          <td>{t.service}</td>
                          <td className="result-text">{t.bytes} B</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#6e8098', fontSize: '11px', margin: 0 }}>
                  No recent traffic records found for this specific device in the database.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==============================================================================
// 3. SERVICES & PROTOCOLS PAGE
// ==============================================================================

function ServicesPage({
  services,
  topServices,
  loading,
  error,
  onRefresh
}: {
  services: ServiceItem[]
  topServices: TopServiceItem[]
  loading: boolean
  error: string
  onRefresh: () => void
}) {
  const [filterProto, setFilterProto] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.service.toLowerCase().includes(search.toLowerCase()) ||
        s.local_address.toLowerCase().includes(search.toLowerCase()) ||
        s.remote_address.toLowerCase().includes(search.toLowerCase())
      const matchProto = filterProto === 'All' || s.protocol === filterProto
      return matchSearch && matchProto
    })
  }, [services, search, filterProto])

  const totalConns = useMemo(() => services.reduce((acc, s) => acc + s.connection_count, 0), [services])
  const tcpCount = useMemo(() => services.filter((s) => s.protocol === 'TCP').reduce((acc, s) => acc + s.connection_count, 0), [services])
  const udpCount = useMemo(() => services.filter((s) => s.protocol === 'UDP').reduce((acc, s) => acc + s.connection_count, 0), [services])

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" /> ACTIVE NETWORK PROTOCOLS</p>
          <h1>Services & Network Connections</h1>
          <p>Inspection of active TCP/UDP sockets, connected endpoints, and running applications.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-btn" onClick={onRefresh}>
            <RefreshCw /> Refresh Sockets
          </button>
        </div>
      </div>

      {error && (
        <div className="inline-notice" style={{ borderColor: '#80343f', background: '#2b1419', color: '#ff9ba7', marginBottom: '16px' }}>
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Protocol Summary Cards */}
      <div className="stats-grid">
        <StatCard
          icon={Server}
          label="Total Active Sockets"
          value={String(totalConns)}
          detail={`${services.length} registered services`}
          tone="blue"
        />
        <StatCard
          icon={Layers3}
          label="TCP Connections"
          value={String(tcpCount)}
          detail="Connection-oriented (HTTP, SSH, HTTPS)"
          tone="green"
        />
        <StatCard
          icon={Radio}
          label="UDP Datagram Sockets"
          value={String(udpCount)}
          detail="Connectionless (DNS, NTP, WebRTC)"
          tone="amber"
        />
        <StatCard
          icon={Cpu}
          label="Primary Application"
          value={services[0]?.service || 'None'}
          detail={services[0] ? `${services[0].connection_count} active sockets` : 'Scanning...'}
          tone="slate"
        />
      </div>

      {/* Top Services Bandwidth Leaderboard if available */}
      {topServices && topServices.length > 0 && (
        <Card style={{ marginBottom: '18px', padding: '16px 20px' }}>
          <SectionTitle eyebrow="BANDWIDTH SHARE" title="Top Network Bandwidth Consumers" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '12px' }}>
            {topServices.slice(0, 4).map((s, idx) => (
              <div key={idx} style={{ padding: '12px', background: '#0a1625', border: '1px solid #1c2e42', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#e8f0fa', fontSize: '12px' }}>{s.service}</strong>
                  <span className="mono" style={{ fontSize: '10px', color: '#65d0f4' }}>{s.protocol}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#88a0b9', marginBottom: '6px' }}>
                  <span>Usage: {s.total_bytes_formatted}</span>
                  <span>{s.percentage}%</span>
                </div>
                <div style={{ height: '4px', background: '#1c2d42', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${s.percentage}%`, height: '100%', background: '#48c5ff' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="history-card">
        <div className="filter-bar">
          <div className="search-wrap">
            <Search />
            <input
              placeholder="Search service name, local address, or remote host..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label className="filter-btn">
            <SlidersHorizontal />
            <select value={filterProto} onChange={(e) => setFilterProto(e.target.value)}>
              <option>All</option>
              <option>TCP</option>
              <option>UDP</option>
            </select>
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Application / Service</th>
                <th>Protocol</th>
                <th>Connection Count</th>
                <th>Primary State</th>
                <th>Sample Local Endpoint</th>
                <th>Remote Destination</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted-cell" style={{ textAlign: 'center', padding: '30px 0' }}>
                    {loading ? 'Inspecting system socket table...' : 'No matching network services found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: '#e8f0fa' }}>{s.service}</strong>
                    </td>
                    <td>
                      <span className="mono">{s.protocol}</span>
                    </td>
                    <td className="result-text">{s.connection_count}</td>
                    <td>
                      <Badge tone={s.status === 'ESTABLISHED' ? 'green' : s.status === 'LISTEN' ? 'blue' : 'amber'}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="mono">{s.local_address}</td>
                    <td className="mono" style={{ color: '#88a0b9' }}>{s.remote_address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ==============================================================================
// 4. TRAFFIC DETAILS PAGE (DEEP PACKET INSPECTION & SUMMARY)
// ==============================================================================

function TrafficPage({
  trafficRecords,
  trafficSummary,
  loading,
  error,
  onRefresh
}: {
  trafficRecords: TrafficRecordItem[]
  trafficSummary: TrafficSummaryResponse | null
  loading: boolean
  error: string
  onRefresh: () => void
}) {
  const [filterProto, setFilterProto] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 15

  const filtered = useMemo(() => {
    return trafficRecords.filter((t) => {
      const matchProto = filterProto === 'All' || t.protocol.toUpperCase() === filterProto.toUpperCase()
      const matchSearch =
        (t.source_ip && t.source_ip.includes(search)) ||
        (t.destination_ip && t.destination_ip.includes(search)) ||
        (t.service && t.service.toLowerCase().includes(search.toLowerCase())) ||
        (t.protocol && t.protocol.toLowerCase().includes(search.toLowerCase()))
      return matchProto && matchSearch
    })
  }, [trafficRecords, filterProto, search])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" /> PACKET-LEVEL INSPECTION</p>
          <h1>Traffic Details & Packet Flows</h1>
          <p>Real-time packet capture, protocol breakdown, and network endpoint communication logs.</p>
        </div>
        <div className="heading-actions">
          <Badge tone={trafficSummary?.packet_capture_available ? 'green' : 'blue'}>
            {trafficSummary?.packet_capture_available ? 'Scapy Npcap Active' : 'Socket Telemetry Engine'}
          </Badge>
          <button className="secondary-btn" onClick={onRefresh}>
            <RefreshCw /> Refresh Flows
          </button>
        </div>
      </div>

      {error && (
        <div className="inline-notice" style={{ borderColor: '#80343f', background: '#2b1419', color: '#ff9ba7', marginBottom: '16px' }}>
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Traffic Summary Cards */}
      <div className="stats-grid">
        <StatCard
          icon={Activity}
          label="Total Captured Packets"
          value={String(trafficSummary?.total_packets || trafficRecords.reduce((acc, t) => acc + (t.packet_count || 1), 0))}
          detail="Packets captured by monitor engine"
          tone="blue"
        />
        <StatCard
          icon={Database}
          label="Cumulative Volume"
          value={trafficSummary?.total_bytes_formatted || '0 B'}
          detail="Bytes inspected across interfaces"
          tone="green"
        />
        <StatCard
          icon={Layers3}
          label="Protocol Distribution"
          value={`${trafficSummary?.tcp_packets || 0} TCP`}
          detail={`${trafficSummary?.udp_packets || 0} UDP • ${trafficSummary?.icmp_packets || 0} ICMP`}
          tone="amber"
        />
        <StatCard
          icon={ShieldCheck}
          label="Engine Driver"
          value={trafficSummary?.packet_capture_available ? 'Promiscuous' : 'Host Socket'}
          detail="Windows telemetry adapter"
          tone="slate"
        />
      </div>

      {/* Protocol Summary Breakdown Card */}
      {trafficSummary && (
        <Card style={{ marginBottom: '18px', padding: '18px 22px' }}>
          <SectionTitle eyebrow="PROTOCOL ANALYTICS" title="Layer 4 Protocol Distribution" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '12px' }}>
            <div style={{ padding: '12px', background: '#0a1625', border: '1px solid #1c2e42', borderRadius: '8px' }}>
              <span style={{ fontSize: '10px', color: '#88a0b9' }}>TCP PACKETS</span>
              <strong style={{ display: 'block', fontSize: '18px', color: '#38bdf8', marginTop: '4px' }}>
                {trafficSummary.tcp_packets}
              </strong>
              <span style={{ fontSize: '10px', color: '#557291' }}>
                {trafficSummary.total_packets > 0 ? `${((trafficSummary.tcp_packets / trafficSummary.total_packets) * 100).toFixed(1)}% of total` : '0%'}
              </span>
            </div>
            <div style={{ padding: '12px', background: '#0a1625', border: '1px solid #1c2e42', borderRadius: '8px' }}>
              <span style={{ fontSize: '10px', color: '#88a0b9' }}>UDP DATAGRAMS</span>
              <strong style={{ display: 'block', fontSize: '18px', color: '#34d399', marginTop: '4px' }}>
                {trafficSummary.udp_packets}
              </strong>
              <span style={{ fontSize: '10px', color: '#557291' }}>
                {trafficSummary.total_packets > 0 ? `${((trafficSummary.udp_packets / trafficSummary.total_packets) * 100).toFixed(1)}% of total` : '0%'}
              </span>
            </div>
            <div style={{ padding: '12px', background: '#0a1625', border: '1px solid #1c2e42', borderRadius: '8px' }}>
              <span style={{ fontSize: '10px', color: '#88a0b9' }}>ICMP PACKETS</span>
              <strong style={{ display: 'block', fontSize: '18px', color: '#f7b955', marginTop: '4px' }}>
                {trafficSummary.icmp_packets}
              </strong>
              <span style={{ fontSize: '10px', color: '#557291' }}>
                {trafficSummary.total_packets > 0 ? `${((trafficSummary.icmp_packets / trafficSummary.total_packets) * 100).toFixed(1)}% of total` : '0%'}
              </span>
            </div>
            <div style={{ padding: '12px', background: '#0a1625', border: '1px solid #1c2e42', borderRadius: '8px' }}>
              <span style={{ fontSize: '10px', color: '#88a0b9' }}>OTHER / RAW</span>
              <strong style={{ display: 'block', fontSize: '18px', color: '#90a4ba', marginTop: '4px' }}>
                {trafficSummary.other_packets}
              </strong>
              <span style={{ fontSize: '10px', color: '#557291' }}>
                {trafficSummary.total_packets > 0 ? `${((trafficSummary.other_packets / trafficSummary.total_packets) * 100).toFixed(1)}% of total` : '0%'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Traffic Flow Records Table */}
      <Card className="history-card">
        <div className="filter-bar">
          <div className="search-wrap">
            <Search />
            <input
              placeholder="Search flows by IP, port, or service name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <label className="filter-btn">
            <SlidersHorizontal />
            <select value={filterProto} onChange={(e) => { setFilterProto(e.target.value); setPage(1) }}>
              <option>All</option>
              <option>TCP</option>
              <option>UDP</option>
              <option>ICMP</option>
            </select>
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source Address</th>
                <th>Destination Address</th>
                <th>Protocol</th>
                <th>Inferred Service</th>
                <th>Packets</th>
                <th>Data Size</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted-cell" style={{ textAlign: 'center', padding: '30px 0' }}>
                    {loading ? 'Capturing network flows...' : 'No matching traffic flow records captured yet.'}
                  </td>
                </tr>
              ) : (
                paginated.map((t, idx) => (
                  <tr key={idx}>
                    <td className="mono" style={{ color: '#7a91a9' }}>
                      {t.timestamp ? (t.timestamp.includes('T') ? t.timestamp.split('T')[1]?.slice(0, 8) : t.timestamp) : '—'}
                    </td>
                    <td className="mono">
                      {t.source_ip}{t.source_port ? `:${t.source_port}` : ''}
                    </td>
                    <td className="mono" style={{ color: '#88a0b9' }}>
                      {t.destination_ip}{t.destination_port ? `:${t.destination_port}` : ''}
                    </td>
                    <td>
                      <span className="mono">{t.protocol}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#e8f0fa' }}>{t.service}</strong>
                    </td>
                    <td>{t.packet_count || 1}</td>
                    <td>
                      <strong style={{ color: '#48c5ff' }}>{t.bytes_formatted || `${t.bytes} B`}</strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            Showing {paginated.length} of {filtered.length} flow records • Page {page} of {totalPages}
          </span>
          <div>
            <button
              className="icon-btn small-btn"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft />
            </button>
            <button className="page-number active">{page}</button>
            <button
              className="icon-btn small-btn"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ==============================================================================
// 5. TRAFFIC HISTORY PAGE (WITH TAB FILTERING: BANDWIDTH, TRAFFIC, DEVICES)
// ==============================================================================

function HistoryPage({
  history,
  loading,
  error,
  onRefresh
}: {
  history: HistoryRecord[]
  loading: boolean
  error: string
  onRefresh: () => void
}) {
  const [historyTab, setHistoryTab] = useState<'bandwidth' | 'traffic' | 'devices'>('bandwidth')
  const [trafficHistory, setTrafficHistory] = useState<any[]>([])
  const [deviceHistory, setDeviceHistory] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 15

  const loadSubHistory = useCallback(async () => {
    if (historyTab === 'traffic') {
      try {
        const res = await api.getHistoryTraffic(100)
        setTrafficHistory(res.records || [])
      } catch {
        setTrafficHistory([])
      }
    } else if (historyTab === 'devices') {
      try {
        const res = await api.getHistoryDevices(100)
        setDeviceHistory(res.records || [])
      } catch {
        setDeviceHistory([])
      }
    }
  }, [historyTab])

  useEffect(() => {
    loadSubHistory()
  }, [loadSubHistory])

  // Filtered dataset depending on active tab
  const filtered = useMemo(() => {
    if (historyTab === 'bandwidth') {
      return history.filter((h) => {
        const match =
          (h.time && h.time.includes(search)) ||
          (h.timestamp && h.timestamp.includes(search)) ||
          (h.download_formatted && h.download_formatted.toLowerCase().includes(search.toLowerCase())) ||
          (h.upload_formatted && h.upload_formatted.toLowerCase().includes(search.toLowerCase()))
        return match
      })
    } else if (historyTab === 'traffic') {
      return trafficHistory.filter((t) => {
        const match =
          (t.source_ip && t.source_ip.includes(search)) ||
          (t.destination_ip && t.destination_ip.includes(search)) ||
          (t.service && t.service.toLowerCase().includes(search.toLowerCase())) ||
          (t.protocol && t.protocol.toLowerCase().includes(search.toLowerCase()))
        return match
      })
    } else {
      return deviceHistory.filter((d) => {
        const match =
          (d.hostname && d.hostname.toLowerCase().includes(search.toLowerCase())) ||
          (d.ip_address && d.ip_address.includes(search)) ||
          (d.mac_address && d.mac_address.toLowerCase().includes(search.toLowerCase()))
        return match
      })
    }
  }, [historyTab, history, trafficHistory, deviceHistory, search])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" /> TIME-SERIES TELEMETRY</p>
          <h1>Traffic & Network History</h1>
          <p>Stored historical bandwidth samples, traffic flows, and device discovery logs.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-btn" onClick={() => { onRefresh(); loadSubHistory() }}>
            <RefreshCw /> Refresh History
          </button>
        </div>
      </div>

      {error && (
        <div className="inline-notice" style={{ borderColor: '#80343f', background: '#2b1419', color: '#ff9ba7', marginBottom: '16px' }}>
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* History Log Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={historyTab === 'bandwidth' ? 'primary-btn' : 'secondary-btn'}
          onClick={() => { setHistoryTab('bandwidth'); setPage(1) }}
        >
          <Activity size={14} /> Bandwidth Log
        </button>
        <button
          className={historyTab === 'traffic' ? 'primary-btn' : 'secondary-btn'}
          onClick={() => { setHistoryTab('traffic'); setPage(1) }}
        >
          <Route size={14} /> Traffic Flows
        </button>
        <button
          className={historyTab === 'devices' ? 'primary-btn' : 'secondary-btn'}
          onClick={() => { setHistoryTab('devices'); setPage(1) }}
        >
          <Wifi size={14} /> Device Discoveries
        </button>
      </div>

      <Card className="history-card">
        <div className="filter-bar">
          <div className="search-wrap">
            <Search />
            <input
              placeholder={`Search ${historyTab} history...`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Badge tone="blue">{filtered.length} total records</Badge>
        </div>

        <div className="table-wrap">
          {historyTab === 'bandwidth' && (
            <table>
              <thead>
                <tr>
                  <th>Sample Time</th>
                  <th>ISO Timestamp</th>
                  <th>Download Speed</th>
                  <th>Upload Speed</th>
                  <th>Combined Bandwidth</th>
                  <th>Cumulative MB</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted-cell" style={{ textAlign: 'center', padding: '30px 0' }}>
                      {loading ? 'Streaming history records...' : 'No bandwidth history records captured yet.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((h: HistoryRecord, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="table-target">
                          <Clock3 /> {h.time}
                        </span>
                      </td>
                      <td className="mono" style={{ color: '#7a91a9' }}>{h.timestamp}</td>
                      <td style={{ color: '#38bdf8' }}>{h.download_formatted}</td>
                      <td style={{ color: '#34d399' }}>{h.upload_formatted}</td>
                      <td><strong style={{ color: '#f7b955' }}>{h.total_formatted}</strong></td>
                      <td className="mono">
                        {h.bytes_recv_total ? `${(h.bytes_recv_total / (1024 * 1024)).toFixed(1)} MB` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {historyTab === 'traffic' && (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Source IP</th>
                  <th>Destination IP</th>
                  <th>Protocol</th>
                  <th>Service</th>
                  <th>Bytes</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted-cell" style={{ textAlign: 'center', padding: '30px 0' }}>
                      No traffic history flows stored in database yet.
                    </td>
                  </tr>
                ) : (
                  paginated.map((t: any, idx) => (
                    <tr key={idx}>
                      <td className="mono">{t.timestamp ? t.timestamp.split('T')[1]?.slice(0, 8) : '—'}</td>
                      <td className="mono">{t.source_ip}</td>
                      <td className="mono" style={{ color: '#88a0b9' }}>{t.destination_ip}</td>
                      <td><span className="mono">{t.protocol}</span></td>
                      <td><strong style={{ color: '#e8f0fa' }}>{t.service}</strong></td>
                      <td className="result-text">{t.bytes ? `${t.bytes} B` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {historyTab === 'devices' && (
            <table>
              <thead>
                <tr>
                  <th>First Seen</th>
                  <th>Last Seen</th>
                  <th>Device / Hostname</th>
                  <th>IP Address</th>
                  <th>MAC Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted-cell" style={{ textAlign: 'center', padding: '30px 0' }}>
                      No device discovery history stored in database yet.
                    </td>
                  </tr>
                ) : (
                  paginated.map((d: any, idx) => (
                    <tr key={idx}>
                      <td className="mono">{d.first_seen ? d.first_seen.split('T')[0] : '—'}</td>
                      <td className="mono">{d.last_seen ? d.last_seen.split('T')[1]?.slice(0, 8) : '—'}</td>
                      <td><strong style={{ color: '#dceaf7' }}>{d.hostname || d.ip_address}</strong></td>
                      <td className="mono">{d.ip_address}</td>
                      <td className="mono">{d.mac_address}</td>
                      <td><Badge tone="green">{d.status || 'online'}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination">
          <span>
            Showing {paginated.length} of {filtered.length} records • Page {page} of {totalPages}
          </span>
          <div>
            <button
              className="icon-btn small-btn"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft />
            </button>
            <button className="page-number active">{page}</button>
            <button
              className="icon-btn small-btn"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ==============================================================================
// 6. SETTINGS PAGE (BACKEND CONFIGURATION & ALERTS)
// ==============================================================================

function SettingsPage({
  settings,
  alerts,
  loading,
  onSave,
  onRefresh
}: {
  settings: SettingsResponse | null
  alerts: AlertItem[]
  loading: boolean
  onSave: (data: Partial<SettingsResponse>) => Promise<void>
  onRefresh: () => void
}) {
  const [interval, setIntervalVal] = useState<number>(settings?.sample_interval_seconds || 1)
  const [retention, setRetention] = useState<number>(settings?.history_retention_hours || 48)
  const [alertThreshold, setAlertThreshold] = useState<number>(settings?.bandwidth_alert_threshold_mbps || 50)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (settings) {
      setIntervalVal(settings.sample_interval_seconds)
      setRetention(settings.history_retention_hours)
      setAlertThreshold(settings.bandwidth_alert_threshold_mbps)
    }
  }, [settings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveMessage('')
    try {
      await onSave({
        sample_interval_seconds: Number(interval),
        history_retention_hours: Number(retention),
        bandwidth_alert_threshold_mbps: Number(alertThreshold)
      })
      setSaveMessage('Settings updated successfully in FastAPI backend!')
      setTimeout(() => setSaveMessage(''), 4000)
    } catch (err: any) {
      setSaveMessage(`Failed to save settings: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" /> SYSTEM CONFIGURATION</p>
          <h1>Settings & Telemetry Thresholds</h1>
          <p>Configure background sampling frequency, anomaly alert triggers, and inspect active warnings.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-btn" onClick={onRefresh}>
            <RefreshCw /> Refresh Settings
          </button>
        </div>
      </div>

      {saveMessage && (
        <div
          className="inline-notice"
          style={{
            borderColor: saveMessage.includes('Failed') ? '#80343f' : '#245b4c',
            background: saveMessage.includes('Failed') ? '#2b1419' : '#12352f',
            color: saveMessage.includes('Failed') ? '#ff9ba7' : '#56d5a8',
            marginBottom: '16px'
          }}
        >
          <CheckCircle2 />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Settings Form */}
        <Card style={{ padding: '22px' }}>
          <SectionTitle eyebrow="RUNTIME THRESHOLDS" title="Telemetry Sampling & Alert Triggers" />
          <form onSubmit={handleSave} style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="field">
              <label>SAMPLE INTERVAL (SECONDS)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={interval}
                onChange={(e) => setIntervalVal(Number(e.target.value))}
                required
              />
              <span style={{ fontSize: '10px', color: '#6e839d' }}>Frequency of psutil network delta calculations.</span>
            </div>

            <div className="field">
              <label>BANDWIDTH ALERT SPIKE THRESHOLD (MBPS)</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                required
              />
              <span style={{ fontSize: '10px', color: '#6e839d' }}>Rate above which an anomaly alert record is generated.</span>
            </div>

            <div className="field">
              <label>DATABASE HISTORY RETENTION (HOURS)</label>
              <input
                type="number"
                min="1"
                max="720"
                value={retention}
                onChange={(e) => setRetention(Number(e.target.value))}
                required
              />
              <span style={{ fontSize: '10px', color: '#6e839d' }}>Duration before old bandwidth samples are pruned.</span>
            </div>

            <button type="submit" className="primary-btn" disabled={saving} style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              {saving ? <Loader2 className="spin" /> : <Settings2 />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </Card>

        {/* Runtime Environment Info */}
        <Card style={{ padding: '22px' }}>
          <SectionTitle eyebrow="SERVER STATUS" title="Backend Environment" />
          <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="endpoint">
              <span>Application:</span>
              <code>{settings?.app_name || 'TrafficLens'}</code>
            </div>
            <div className="endpoint">
              <span>Environment:</span>
              <code>{settings?.app_env || 'Development'}</code>
            </div>
            <div className="endpoint">
              <span>Monitoring Mode:</span>
              <code>{settings?.monitoring_mode || 'psutil + Scapy'}</code>
            </div>
            <div className="endpoint">
              <span>Packet Capture Driver:</span>
              <code>{settings?.packet_capture_available ? 'Available (Npcap)' : 'Socket Telemetry Fallback'}</code>
            </div>
            <div className="endpoint">
              <span>Low / Med Thresholds:</span>
              <code>{settings?.traffic_level_low_mbps} / {settings?.traffic_level_medium_mbps} Mbps</code>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Alerts List */}
      <Card className="recent-card" style={{ marginTop: '18px' }}>
        <SectionTitle eyebrow="TELEMETRY ALERTS" title="Active Anomaly & Traffic Spike Notifications" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Alert Timestamp</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Alert Notification Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted-cell" style={{ textAlign: 'center', padding: '28px 0' }}>
                    {loading ? 'Checking for system alerts...' : 'No anomalous spikes or alerts detected. Network operating normally.'}
                  </td>
                </tr>
              ) : (
                alerts.map((a, i) => (
                  <tr key={i}>
                    <td className="mono">{a.timestamp ? a.timestamp.split('T')[1]?.slice(0, 8) : '—'}</td>
                    <td><span className="mono">{a.type}</span></td>
                    <td>
                      <Badge tone={a.severity === 'critical' ? 'red' : a.severity === 'warning' ? 'amber' : 'blue'}>
                        {a.severity}
                      </Badge>
                    </td>
                    <td><strong style={{ color: '#dceaf7' }}>{a.message}</strong></td>
                    <td>
                      <Badge tone={a.resolved ? 'slate' : 'green'}>
                        {a.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ==============================================================================
// 7. ABOUT PROJECT PAGE
// ==============================================================================

function AboutPage() {
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" /> PROJECT DOCUMENTATION</p>
          <h1>About TrafficLens</h1>
          <p>Computer Networks Project-Based Learning (PBL) System Overview.</p>
        </div>
      </div>

      <div className="about-grid">
        <Card className="abstract-card">
          <div className="project-badge">
            <Network /> Computer Networks PBL
          </div>
          <h2>Network Traffic Monitor</h2>
          <p className="lead">
            TrafficLens is a lightweight network telemetry platform that visualizes real-time bandwidth consumption,
            inspects operating system sockets, and analyzes network traffic across physical hardware adapters.
          </p>
          <div className="about-chips">
            <span>Next.js 16</span>
            <span>FastAPI 0.115</span>
            <span>psutil</span>
            <span>Scapy</span>
            <span>TCP/UDP</span>
            <span>SQLite</span>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="LEARNING OBJECTIVES" title="Core Networking Concepts" />
          <div className="objective-list">
            <div>
              <CheckCircle2 />
              <span>Real-time bandwidth measurement (Delta calculation over time)</span>
            </div>
            <div>
              <CheckCircle2 />
              <span>Network interface abstraction & hardware byte accounting</span>
            </div>
            <div>
              <CheckCircle2 />
              <span>Transport layer socket inspection (TCP state machines & UDP datagrams)</span>
            </div>
            <div>
              <CheckCircle2 />
              <span>Decoupled Client-Server architecture via REST & CORS</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="concepts-card">
        <SectionTitle eyebrow="THEORY BEHIND THE MONITOR" title="Key Computer Networks Concepts" />
        <div className="concept-grid">
          <div>
            <div className="concept-icon"><Activity /></div>
            <h3>Bandwidth Rate</h3>
            <p>Calculated as ΔBytes / Δt between periodic ticks of OS network I/O counters.</p>
          </div>
          <div>
            <div className="concept-icon"><Layers3 /></div>
            <h3>Transport Sockets</h3>
            <p>Maps active TCP connections across ESTABLISHED, LISTEN, and TIME_WAIT states and UDP endpoints.</p>
          </div>
          <div>
            <div className="concept-icon"><Wifi /></div>
            <h3>Network Interfaces</h3>
            <p>Hardware NICs (Wi-Fi 802.11, Ethernet 802.3) track packets sent/received independently at Layer 2/3.</p>
          </div>
          <div>
            <div className="concept-icon"><Server /></div>
            <h3>RESTful Telemetry</h3>
            <p>Decoupled communication where JSON endpoints allow Next.js frontends to consume real system metrics.</p>
          </div>
        </div>
      </Card>

      <Card className="architecture-card">
        <SectionTitle eyebrow="ARCHITECTURE" title="End-to-End System Flow" />
        <div className="architecture">
          <div className="arch-box browser">
            <LayoutDashboard />
            <strong>Next.js Frontend</strong>
            <span>React 19 + Recharts</span>
          </div>
          <div className="arch-arrow">
            <ArrowUpRight />
            <span>REST / JSON</span>
          </div>
          <div className="arch-box api">
            <Server />
            <strong>FastAPI Backend</strong>
            <span>Python 3.12+ / Uvicorn</span>
          </div>
          <div className="arch-arrow">
            <ArrowUpRight />
            <span>psutil / Scapy</span>
          </div>
          <div className="arch-box system">
            <Cpu />
            <strong>Network Drivers</strong>
            <span>Hardware NICs & Sockets</span>
          </div>
        </div>
        <div className="endpoint-list">
          <code>GET /api/health</code>
          <code>GET /api/network</code>
          <code>GET /api/bandwidth</code>
          <code>GET /api/devices</code>
          <code>GET /api/services</code>
          <code>GET /api/traffic</code>
          <code>GET /api/analytics/overview</code>
          <code>GET /api/history</code>
          <code>GET /api/settings</code>
        </div>
      </Card>
    </div>
  )
}

// ==============================================================================
// MAIN APP COMPONENT WITH LIVE TELEMETRY POLLING & STATE HANDLING
// ==============================================================================

export default function TrafficLensApp() {
  const [active, setActive] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Real-time API states
  const [network, setNetwork] = useState<NetworkResponse | null>(null)
  const [bandwidth, setBandwidth] = useState<BandwidthResponse | null>(null)
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null)
  const [topDevices, setTopDevices] = useState<TopDeviceItem[]>([])
  const [topServices, setTopServices] = useState<TopServiceItem[]>([])
  const [devices, setDevices] = useState<DeviceItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [trafficRecords, setTrafficRecords] = useState<TrafficRecordItem[]>([])
  const [trafficSummary, setTrafficSummary] = useState<TrafficSummaryResponse | null>(null)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [settings, setSettings] = useState<SettingsResponse | null>(null)
  const [timelinePoints, setTimelinePoints] = useState<TimelinePoint[]>([])
  const [timelineRange, setTimelineRange] = useState<string>('1h')

  const [backendOnline, setBackendOnline] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  // Polling references
  const isMounted = useRef(true)

  // 1. Health check
  const checkHealth = useCallback(async () => {
    try {
      const data = await api.getHealth()
      if (isMounted.current) {
        setBackendOnline(data?.status === 'online' || data?.status === 'ok')
      }
    } catch {
      if (isMounted.current) {
        setBackendOnline(false)
      }
    }
  }, [])

  // 2. High-frequency telemetry polling (every 3 seconds)
  const fetchFastMetrics = useCallback(async () => {
    try {
      const [netData, bwData, histData, ovData, alertsData] = await Promise.all([
        api.getNetwork().catch(() => null),
        api.getBandwidth().catch(() => null),
        api.getHistory().catch(() => null),
        api.getAnalyticsOverview().catch(() => null),
        api.getAlerts(10).catch(() => null),
      ])
      if (!isMounted.current) return

      if (netData) {
        setNetwork(netData)
        setBackendOnline(true)
        setError('')
      }
      if (bwData) setBandwidth(bwData)
      if (ovData) setOverview(ovData)
      if (histData && Array.isArray(histData.history)) setHistory(histData.history)
      if (alertsData && Array.isArray(alertsData.alerts)) setAlerts(alertsData.alerts)
    } catch {
      if (isMounted.current) {
        setBackendOnline(false)
        setError('Unable to connect to TrafficLens backend. Please ensure the backend server is running.')
      }
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  // 3. Lower-frequency telemetry polling (every 10 seconds)
  const fetchSlowMetrics = useCallback(async () => {
    try {
      const [devData, srvData, topDevData, topSrvData, trafData, trafSumData, settsData] = await Promise.all([
        api.getDevices().catch(() => null),
        api.getServices().catch(() => null),
        api.getTopDevices(10).catch(() => null),
        api.getTopServices(10).catch(() => null),
        api.getTraffic({ limit: 50 }).catch(() => null),
        api.getTrafficSummary().catch(() => null),
        api.getSettings().catch(() => null),
      ])
      if (!isMounted.current) return

      if (devData && Array.isArray(devData.devices)) setDevices(devData.devices)
      if (srvData && Array.isArray(srvData.services)) setServices(srvData.services)
      if (Array.isArray(topDevData)) setTopDevices(topDevData)
      if (Array.isArray(topSrvData)) setTopServices(topSrvData)
      if (trafData && Array.isArray(trafData.records)) setTrafficRecords(trafData.records)
      if (trafSumData) setTrafficSummary(trafSumData)
      if (settsData) setSettings(settsData)
    } catch {
      // Handled by fast metrics error
    }
  }, [])

  // 4. Timeline data fetching when range changes
  const fetchTimeline = useCallback(async (range: string) => {
    try {
      const data = await api.getAnalyticsTimeline(range)
      if (isMounted.current && data && Array.isArray(data.points)) {
        setTimelinePoints(data.points)
      }
    } catch {
      // Fallback to rolling history
    }
  }, [])

  useEffect(() => {
    fetchTimeline(timelineRange)
  }, [timelineRange, fetchTimeline])

  // Lifecycle & interval registration
  useEffect(() => {
    isMounted.current = true

    // Initial triggers
    checkHealth()
    fetchFastMetrics()
    fetchSlowMetrics()

    // Polling schedules
    const healthInterval = setInterval(checkHealth, 8000)
    const fastInterval = setInterval(fetchFastMetrics, 3000)
    const slowInterval = setInterval(fetchSlowMetrics, 10000)

    return () => {
      isMounted.current = false
      clearInterval(healthInterval)
      clearInterval(fastInterval)
      clearInterval(slowInterval)
    }
  }, [checkHealth, fetchFastMetrics, fetchSlowMetrics])

  const handleManualRefresh = () => {
    checkHealth()
    fetchFastMetrics()
    fetchSlowMetrics()
    fetchTimeline(timelineRange)
  }

  const handleSaveSettings = async (updateData: Partial<SettingsResponse>) => {
    const updated = await api.updateSettings(updateData)
    setSettings(updated)
  }

  const pageTitle = navItems.find((item) => item.id === active)?.label || 'Overview'

  const renderedContent = useMemo(() => {
    switch (active) {
      case 'devices':
        return <DevicesPage devices={devices} loading={loading} error={error} onRefresh={fetchSlowMetrics} />
      case 'services':
        return <ServicesPage services={services} topServices={topServices} loading={loading} error={error} onRefresh={fetchSlowMetrics} />
      case 'traffic':
        return (
          <TrafficPage
            trafficRecords={trafficRecords}
            trafficSummary={trafficSummary}
            loading={loading}
            error={error}
            onRefresh={fetchSlowMetrics}
          />
        )
      case 'history':
        return <HistoryPage history={history} loading={loading} error={error} onRefresh={fetchFastMetrics} />
      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            alerts={alerts}
            loading={loading}
            onSave={handleSaveSettings}
            onRefresh={fetchSlowMetrics}
          />
        )
      case 'about':
        return <AboutPage />
      default:
        return (
          <OverviewPage
            network={network}
            bandwidth={bandwidth}
            overview={overview}
            topDevices={topDevices}
            topServices={topServices}
            devices={devices}
            services={services}
            alerts={alerts}
            history={history}
            timelinePoints={timelinePoints}
            timelineRange={timelineRange}
            setTimelineRange={setTimelineRange}
            backendOnline={backendOnline}
            loading={loading}
            error={error}
            go={setActive}
          />
        )
    }
  }, [
    active, network, bandwidth, overview, topDevices, topServices, devices,
    services, alerts, history, timelinePoints, timelineRange, backendOnline,
    loading, error, trafficRecords, trafficSummary, settings, fetchSlowMetrics, fetchFastMetrics
  ])

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={(id) => { setActive(id); setMobileOpen(false) }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        backendOnline={backendOnline}
      />

      <div
        className={`mobile-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className="main-shell">
        <Header page={pageTitle} onMenu={() => setMobileOpen(true)} onRefresh={handleManualRefresh} />
        {renderedContent}
        <footer className="app-footer">
          <span>
            <ShieldCheck /> TrafficLens • Computer Networks PBL
          </span>
          <span>
            {backendOnline ? 'Connected to live FastAPI backend' : 'Backend offline • Waiting for connection'}
          </span>
        </footer>
      </div>
    </div>
  )
}
