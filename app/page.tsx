'use client'

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, BookOpen,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3,
  Cpu, Database, ExternalLink, Globe2, History, Info, Layers3, LayoutDashboard,
  Loader2, Menu, Network, Pause, Play, Plus, Radio, RefreshCw, Route, Search,
  Server, Settings2, ShieldCheck, Signal, SlidersHorizontal, Sparkles, StopCircle,
  Timer, Trash2, TrendingUp, Wifi, XCircle, Zap
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import {
  api, NetworkResponse, DevicesResponse, ServicesResponse,
  HistoryResponse, DeviceItem, ServiceItem, HistoryRecord
} from '@/lib/api'

// Navigation items
const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'devices', label: 'Devices & Interfaces', icon: Wifi },
  { id: 'services', label: 'Services & Protocols', icon: Layers3 },
  { id: 'history', label: 'Traffic History', icon: History },
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

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
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
  backendOnline
}: {
  active: string
  setActive: (id: string) => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  backendOnline: boolean
}) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
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
            <strong>{backendOnline ? 'Python backend online' : 'Python backend offline'}</strong>
            <p>
              {backendOnline
                ? 'psutil real-time metrics streaming.'
                : 'Ensure Flask server runs at http://127.0.0.1:5000.'}
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
  history,
  devices,
  services,
  backendOnline,
  loading,
  error,
  go
}: {
  network: NetworkResponse | null
  history: HistoryRecord[]
  devices: DeviceItem[]
  services: ServiceItem[]
  backendOnline: boolean
  loading: boolean
  error: string
  go: (id: string) => void
}) {
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return []
    return history.map((h) => ({
      time: h.time || (h.timestamp ? h.timestamp.split('T')[1]?.slice(0, 8) : ''),
      download: parseFloat((h.download / 1024).toFixed(2)),
      upload: parseFloat((h.upload / 1024).toFixed(2)),
      total: parseFloat((h.total / 1024).toFixed(2))
    }))
  }, [history])

  const topServices = useMemo(() => services.slice(0, 5), [services])
  const topDevices = useMemo(() => devices.slice(0, 4), [devices])

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
            {backendOnline ? 'Backend Online (Port 5000)' : 'Backend Disconnected'}
          </Badge>
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

      {/* Hero Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={ArrowDownRight}
          label="Download Speed"
          value={network?.download_speed_formatted || '0.00 B/s'}
          detail={`Cumulative: ${network?.download_bytes_formatted || '0 B'}`}
          tone="blue"
        />
        <StatCard
          icon={ArrowUpRight}
          label="Upload Speed"
          value={network?.upload_speed_formatted || '0.00 B/s'}
          detail={`Cumulative: ${network?.upload_bytes_formatted || '0 B'}`}
          tone="green"
        />
        <StatCard
          icon={Activity}
          label="Total Bandwidth Rate"
          value={network?.total_speed_formatted || '0.00 B/s'}
          detail={`Total: ${network?.total_bytes_formatted || '0 B'}`}
          tone="amber"
        />
        <StatCard
          icon={Radio}
          label="Active TCP/UDP Sockets"
          value={String(services.reduce((acc, s) => acc + s.connection_count, 0) || (loading ? '—' : '0'))}
          detail={`${services.length} active application services`}
          tone="slate"
        />
      </div>

      {/* Live Chart & Services Grid */}
      <div className="dashboard-grid">
        <Card className="latency-card">
          <SectionTitle
            eyebrow="BANDWIDTH OVER TIME (KB/S)"
            title="Real-Time Traffic Graph"
            action={<Badge tone={chartData.length > 0 ? 'blue' : 'amber'}>{chartData.length > 0 ? 'Live psutil feed' : 'Collecting data...'}</Badge>}
          />
          <div className="chart-meta">
            <div>
              <strong>
                {network ? (network.total_speed / 1024).toFixed(2) : '0.00'} <small>KB/s</small>
              </strong>
              <span>
                <ArrowDownRight /> {network?.download_speed_formatted || '0 B/s'} down • <ArrowUpRight /> {network?.upload_speed_formatted || '0 B/s'} up
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#748ba3' }}>
              {chartData.length} records in buffer
            </span>
          </div>

          <div className="chart-box">
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6e8098' }}>
                {loading ? 'Collecting initial network samples...' : 'Awaiting data from Flask backend...'}
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
                  <th>Conns</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topServices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted-cell" style={{ textAlign: 'center', padding: '24px 0' }}>
                      {loading ? 'Inspecting active sockets...' : 'No active network services found.'}
                    </td>
                  </tr>
                ) : (
                  topServices.map((s, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: '#e8f0fa' }}>{s.service}</strong></td>
                      <td><span className="mono">{s.protocol}</span></td>
                      <td className="result-text">{s.connection_count}</td>
                      <td>
                        <Badge tone={s.status === 'ESTABLISHED' ? 'green' : s.status === 'LISTEN' ? 'blue' : 'amber'}>
                          {s.status}
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

      {/* Interfaces & Device Snapshot */}
      <Card className="recent-card" style={{ marginTop: '16px' }}>
        <SectionTitle
          eyebrow="NETWORK INTERFACES"
          title="Hardware Adapters & Byte Counters"
          action={<button className="text-btn" onClick={() => go('devices')}>Manage devices <ArrowUpRight /></button>}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Device / Interface</th>
                <th>Type</th>
                <th>IP Address</th>
                <th>MAC Address</th>
                <th>Status</th>
                <th>Download Usage</th>
                <th>Upload Usage</th>
                <th>Total Traffic</th>
              </tr>
            </thead>
            <tbody>
              {topDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="muted-cell" style={{ textAlign: 'center', padding: '24px 0' }}>
                    {loading ? 'Scanning local network interfaces...' : 'No network interfaces detected.'}
                  </td>
                </tr>
              ) : (
                topDevices.map((d, i) => (
                  <tr key={i}>
                    <td><strong style={{ color: '#dceaf7' }}>{d.device_name}</strong></td>
                    <td>{d.device_type === 'interface' ? 'Hardware NIC' : 'LAN Node'}</td>
                    <td className="mono">{d.ip_address}</td>
                    <td className="mono">{d.mac_address}</td>
                    <td><Badge tone={d.status === 'online' ? 'green' : 'slate'}>{d.status}</Badge></td>
                    <td>{d.download_usage_formatted}</td>
                    <td>{d.upload_usage_formatted}</td>
                    <td><strong style={{ color: '#48c5ff' }}>{d.total_usage_formatted}</strong></td>
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
// 2. DEVICES & INTERFACES PAGE
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
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="muted-cell" style={{ textAlign: 'center', padding: '30px 0' }}>
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
          Under standard operating system architectures without privileged packet sniffing or router-level SNMP access,
          an individual host machine can only measure exact byte counters for its own hardware network interfaces (Wi-Fi, Ethernet).
          Neighbouring LAN devices detected via ARP cache are displayed above for network topology awareness, with traffic accounting
          transparently marked as requiring router port mirroring or promiscuous capture.
        </p>
      </Card>
    </div>
  )
}

// ==============================================================================
// 3. SERVICES & PROTOCOLS PAGE
// ==============================================================================

function ServicesPage({
  services,
  loading,
  error,
  onRefresh
}: {
  services: ServiceItem[]
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
// 4. TRAFFIC HISTORY PAGE
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
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 15

  const filtered = useMemo(() => {
    return history.filter((h) => {
      const matchSearch =
        (h.time && h.time.includes(search)) ||
        (h.timestamp && h.timestamp.includes(search)) ||
        h.download_formatted.toLowerCase().includes(search.toLowerCase()) ||
        h.upload_formatted.toLowerCase().includes(search.toLowerCase())
      return matchSearch
    })
  }, [history, search])

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
          <h1>Traffic History Log</h1>
          <p>Rolling in-memory bandwidth measurement records captured by the Flask backend.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-btn" onClick={onRefresh}>
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

      <Card className="history-card">
        <div className="filter-bar">
          <div className="search-wrap">
            <Search />
            <input
              placeholder="Search history by timestamp or speed..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Badge tone="blue">{filtered.length} total samples</Badge>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sample Time</th>
                <th>ISO Timestamp</th>
                <th>Download Speed</th>
                <th>Upload Speed</th>
                <th>Combined Bandwidth</th>
                <th>Raw Bytes Total</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted-cell" style={{ textAlign: 'center', padding: '30px 0' }}>
                    {loading ? 'Streaming history records...' : 'No history records captured yet.'}
                  </td>
                </tr>
              ) : (
                paginated.map((h, idx) => (
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
// 5. ABOUT PROJECT PAGE
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
            <span>Flask 3.1</span>
            <span>psutil</span>
            <span>TCP/UDP</span>
            <span>REST API</span>
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
            <p>Calculated as \( \Delta \text{Bytes} / \Delta t \) between periodic ticks of OS network I/O counters.</p>
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
            <p>Decoupled communication where JSON endpoints allow Vercel frontends to consume real system metrics.</p>
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
            <strong>Flask Backend</strong>
            <span>Port 5000</span>
          </div>
          <div className="arch-arrow">
            <ArrowUpRight />
            <span>psutil / OS</span>
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
          <code>GET /api/devices</code>
          <code>GET /api/services</code>
          <code>GET /api/history</code>
        </div>
      </Card>
    </div>
  )
}

// ==============================================================================
// MAIN APP COMPONENT WITH LIVE POLLING & ERROR HANDLING
// ==============================================================================

export default function TrafficLensApp() {
  const [active, setActive] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Real-time API states
  const [network, setNetwork] = useState<NetworkResponse | null>(null)
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [devices, setDevices] = useState<DeviceItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [backendOnline, setBackendOnline] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  // Polling references
  const isMounted = useRef(true)

  // 1. Fetch Health
  const checkHealth = useCallback(async () => {
    try {
      const data = await api.getHealth()
      if (isMounted.current) {
        setBackendOnline(data?.status === 'ok')
      }
    } catch {
      if (isMounted.current) {
        setBackendOnline(false)
      }
    }
  }, [])

  // 2. Fetch Network Stats & History (every 3 seconds)
  const fetchNetworkAndHistory = useCallback(async () => {
    try {
      const [netData, histData] = await Promise.all([
        api.getNetwork().catch(() => null),
        api.getHistory().catch(() => null)
      ])
      if (!isMounted.current) return

      if (netData) {
        setNetwork(netData)
        setBackendOnline(true)
        setError('')
      }
      if (histData && Array.isArray(histData.history)) {
        setHistory(histData.history)
      }
    } catch (e: any) {
      if (isMounted.current) {
        setBackendOnline(false)
        setError('Unable to connect to TrafficLens backend. Please make sure the backend server is running.')
      }
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  // 3. Fetch Devices & Services (every 10 seconds)
  const fetchDevicesAndServices = useCallback(async () => {
    try {
      const [devData, srvData] = await Promise.all([
        api.getDevices().catch(() => null),
        api.getServices().catch(() => null)
      ])
      if (!isMounted.current) return

      if (devData && Array.isArray(devData.devices)) {
        setDevices(devData.devices)
      }
      if (srvData && Array.isArray(srvData.services)) {
        setServices(srvData.services)
      }
    } catch {
      // Ignored; handled by health/network check
    }
  }, [])

  // Initial load and periodic polling setup
  useEffect(() => {
    isMounted.current = true

    // Initial fetch
    checkHealth()
    fetchNetworkAndHistory()
    fetchDevicesAndServices()

    // Polling intervals with proper cleanup
    const healthInterval = setInterval(checkHealth, 8000)
    const fastInterval = setInterval(fetchNetworkAndHistory, 3000)
    const slowInterval = setInterval(fetchDevicesAndServices, 10000)

    return () => {
      isMounted.current = false
      clearInterval(healthInterval)
      clearInterval(fastInterval)
      clearInterval(slowInterval)
    }
  }, [checkHealth, fetchNetworkAndHistory, fetchDevicesAndServices])

  const handleManualRefresh = () => {
    checkHealth()
    fetchNetworkAndHistory()
    fetchDevicesAndServices()
  }

  const pageTitle = navItems.find((item) => item.id === active)?.label || 'Overview'

  const renderedContent = useMemo(() => {
    switch (active) {
      case 'devices':
        return <DevicesPage devices={devices} loading={loading} error={error} onRefresh={fetchDevicesAndServices} />
      case 'services':
        return <ServicesPage services={services} loading={loading} error={error} onRefresh={fetchDevicesAndServices} />
      case 'history':
        return <HistoryPage history={history} loading={loading} error={error} onRefresh={fetchNetworkAndHistory} />
      case 'about':
        return <AboutPage />
      default:
        return (
          <OverviewPage
            network={network}
            history={history}
            devices={devices}
            services={services}
            backendOnline={backendOnline}
            loading={loading}
            error={error}
            go={setActive}
          />
        )
    }
  }, [active, network, history, devices, services, backendOnline, loading, error, fetchDevicesAndServices, fetchNetworkAndHistory])

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={(id) => { setActive(id); setMobileOpen(false) }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
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
            {backendOnline ? 'Connected to live Flask backend' : 'Backend offline • Waiting for connection'}
          </span>
        </footer>
      </div>
    </div>
  )
}
