'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, BookOpen,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3,
  Cpu, Database, ExternalLink, Globe2, History, Info, Layers3, LayoutDashboard,
  Loader2, Menu, Network, Pause, Play, Plus, Radio, RefreshCw, Route, Search,
  Server, Settings2, ShieldCheck, Signal, SlidersHorizontal, Sparkles, StopCircle,
  Timer, Trash2, TrendingUp, Wifi, XCircle, Zap,
} from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '@/lib/api'

function isValidDestination(value: string) {
  const input = value.trim()
  if (!input || input.includes('/') || input.includes('://') || /\s/.test(input)) return false
  const ipv4 = /^(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)$/
  const ipv6 = /^(?:(?:[\\da-f]{1,4}:){7}[\\da-f]{1,4}|(?:[\\da-f]{1,4}:){1,7}:|(?:[\\da-f]{1,4}:){1,6}:[\\da-f]{1,4}|(?:[\\da-f]{1,4}:){1,5}(?::[\\da-f]{1,4}){1,2}|(?:[\\da-f]{1,4}:){1,4}(?::[\\da-f]{1,4}){1,3}|(?:[\\da-f]{1,4}:){1,3}(?::[\\da-f]{1,4}){1,4}|(?:[\\da-f]{1,4}:){1,2}(?::[\\da-f]{1,4}){1,5}|[\\da-f]{1,4}:(?:(?::[\\da-f]{1,4}){1,6})|:(?:(?::[\\da-f]{1,4}){1,7}|:))$/i
  if (ipv4.test(input) || ipv6.test(input)) return true
  if (input.length > 253 || input.startsWith('.') || input.endsWith('.') || input.includes('..')) return false
  return input.split('.').every((label) => label.length >= 1 && label.length <= 63 && /^[a-z\\d](?:[a-z\\d-]*[a-z\\d])?$/i.test(label))
}

const responseData = [{ packet: '01', ms: 44 }, { packet: '02', ms: 41 }, { packet: '03', ms: 49 }, { packet: '04', ms: 45 }, { packet: '05', ms: 43 }, { packet: '06', ms: 51 }, { packet: '07', ms: 46 }, { packet: '08', ms: 42 }]
const hops = [
  { hop: '01', ip: '192.168.1.1', host: 'gateway.local', rtt: ['2.4 ms', '2.1 ms', '2.3 ms'], status: 'Healthy', kind: 'local' },
  { hop: '02', ip: '10.24.0.1', host: 'edge-router.isp.net', rtt: ['8.7 ms', '9.1 ms', '8.4 ms'], status: 'Healthy', kind: 'router' },
  { hop: '03', ip: '172.16.4.12', host: 'core-01.isp.net', rtt: ['16.2 ms', '15.8 ms', '16.5 ms'], status: 'Healthy', kind: 'router' },
  { hop: '04', ip: '203.0.113.17', host: 'transit.example.net', rtt: ['31.5 ms', '32.1 ms', '31.8 ms'], status: 'Healthy', kind: 'router' },
  { hop: '05', ip: '142.250.72.14', host: 'lax17s29-in-f14.1e100.net', rtt: ['44.2 ms', '43.8 ms', '44.6 ms'], status: 'Destination', kind: 'destination' },
]

const useHistory = () => {
  const [history, setHistoryState] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('netpulse_history');
      if (stored) {
        setHistoryState(JSON.parse(stored));
      }
    } catch(e) {}
  }, []);

  const addHistory = (record: any) => {
    setHistoryState(prev => {
      const updated = [record, ...prev];
      try {
        localStorage.setItem('netpulse_history', JSON.stringify(updated));
      } catch(e) {}
      return updated;
    });
  };

  return { history, addHistory };
};
const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'ping', label: 'Ping Analyzer', icon: Activity },
  { id: 'traceroute', label: 'Traceroute Analyzer', icon: Route }, { id: 'comparison', label: 'Network Comparison', icon: BarChart3 },
  { id: 'history', label: 'Test History', icon: History }, { id: 'about', label: 'About Project', icon: BookOpen },
]

function Badge({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate' }) {
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{children}</span>
}
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <section className={`card ${className}`}>{children}</section> }
function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) { return <div className="section-title"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</div> }
function MiniChart({ color = '#48c5ff' }: { color?: string }) { return <svg viewBox="0 0 160 45" className="mini-chart" aria-hidden="true"><path d="M0 34 C18 28, 21 35, 36 24 S57 29, 68 19 S89 25, 103 14 S126 18, 143 8 S151 12, 160 4" fill="none" stroke={color} strokeWidth="2" /></svg> }
function StatCard({ icon: Icon, label, value, detail, trend, tone = 'blue' }: { icon: any; label: string; value: string; detail: string; trend?: string; tone?: string }) { return <Card className="stat-card"><div className={`stat-icon ${tone}`}><Icon /></div><div className="stat-copy"><p>{label}</p><strong>{value}</strong><span>{detail}</span></div>{trend && <div className="stat-trend"><ArrowUpRight />{trend}</div>}<MiniChart color={tone === 'green' ? '#40d9a4' : tone === 'amber' ? '#f7b955' : '#48c5ff'} /></Card> }
function Header({ page, onMenu }: { page: string; onMenu: () => void }) { return <header className="topbar"><button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu /></button><div className="crumb"><span>Workspace</span><ChevronRight /><strong>{page}</strong></div><div className="top-actions"><div className="live-pill"><span className="pulse" style={{ backgroundColor: "#40d9a4" }} /> Live environment</div><button className="icon-btn" aria-label="Refresh" onClick={() => window.location.reload()}><RefreshCw /></button><button className="icon-btn" aria-label="Settings" onClick={() => window.alert('Workspace settings will be available when the Flask backend is connected.')}><Settings2 /></button><div className="avatar">AK</div></div></header> }
function Sidebar({ active, setActive, collapsed, setCollapsed }: { active: string; setActive: (id: string) => void; collapsed: boolean; setCollapsed: (v: boolean) => void }) { const [backendOnline, setBackendOnline] = useState(false); useEffect(() => { let cancelled = false; const checkHealth = () => { api.health().then((data: any) => { if (!cancelled) setBackendOnline(data?.success === true) }).catch(() => { if (!cancelled) setBackendOnline(false) }); }; checkHealth(); const interval = setInterval(checkHealth, 10000); return () => { cancelled = true; clearInterval(interval); } }, []); return <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}><div className="brand"><div className="brand-mark"><Network /></div>{!collapsed && <div><strong>NetPulse</strong><span>Network intelligence</span></div>}<button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar">{collapsed ? <ChevronRight /> : <ChevronLeft />}</button></div><div className="sidebar-label">{!collapsed && 'MONITORING'}</div><nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'nav-item active' : 'nav-item'} onClick={() => setActive(id)} title={collapsed ? label : undefined}><Icon />{!collapsed && <span>{label}</span>}{active === id && !collapsed && <span className="nav-active-dot" />}</button>)}</nav>{!collapsed && <div className="sidebar-bottom" style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}><div className="backend-status"><div className="status-heading"><span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />API CONNECTION</div><strong>{backendOnline ? 'Python backend online' : 'Python backend offline'}</strong><p>{backendOnline ? 'Live diagnostics are available.' : 'Check the Flask API and CORS configuration.'}</p><span className="backend-endpoint">{api.baseUrl ? `${api.baseUrl}/api/health` : 'NEXT_PUBLIC_API_URL not configured'}</span><button onClick={() => window.open(api.healthUrl, '_blank')} disabled={!api.baseUrl}><ExternalLink /> Open health endpoint</button></div><div className="sidebar-footer"><div className="avatar small">AK</div><div><strong>Arjun Kumar</strong><span>Student workspace</span></div><ChevronDown /></div></div>}</aside> }
function AnalyzerForm({ onAnalyze }: { onAnalyze: (target: string, mode: string) => void }) { const [target, setTarget] = useState('google.com'); const [mode, setMode] = useState('Both'); const [packets, setPackets] = useState('8'); return <div className="analyzer-form"><div className="field target-field"><label>Destination</label><div className="input-wrap"><Globe2 /><input value={target} onChange={e => setTarget(e.target.value)} placeholder="Domain or IP address" /></div></div><div className="field"><label>Analysis mode</label><select value={mode} onChange={e => setMode(e.target.value)}><option>Both</option><option>Ping</option><option>Traceroute</option></select></div><div className="field packet-field"><label>Packets</label><select value={packets} onChange={e => setPackets(e.target.value)}><option>4</option><option>8</option><option>16</option><option>32</option></select></div><button className="primary-btn analyze-btn" onClick={() => onAnalyze(target, mode)}><Sparkles /> Analyze network</button></div> }
function ChartTooltip({ active, payload, label }: any) { if (!active || !payload?.length) return null; return <div className="chart-tooltip"><span>{label}</span><strong>{payload[0].value} ms</strong></div> }
function LatencyChart({ data, comparison = false }: { data?: any[], comparison?: boolean }) { 
  const displayData = data?.length ? data : [];
  return (
    <div className="chart-box">
      {displayData.length === 0 ? (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6e8098'}}>No test history available</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#40bfff" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#40bfff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="latencyFill2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#253349" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#6e8098', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={20} />
            <YAxis tick={{ fill: '#6e8098', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: any) => `${v}`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="latency" stroke="#48c5ff" strokeWidth={2} fill="url(#latencyFill)" dot={true} isAnimationActive={false} />
            {comparison && <Area type="monotone" dataKey="latency2" stroke="#8b5cf6" strokeWidth={2} fill="url(#latencyFill2)" dot={true} isAnimationActive={false} />}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
  function Overview({ history, addHistory, go }: { history: any[]; addHistory: (r: any) => void; go: (id: string) => void }) {
  const [running, setRunning] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);
  const [traceResult, setTraceResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [targetName, setTargetName] = useState('google.com');
  const [timeRange, setTimeRange] = useState('Last 24 hours');
  const [showSettings, setShowSettings] = useState(false);

  const handleAnalyze = async (target: string, mode: string) => {
    setRunning(true);
    setError('');
    setTargetName(target);
    try {
      let p: any = null;
let t: any = null;
if (mode === 'Both' || mode === 'Ping') {
  p = await api.ping(target, 4);
  setPingResult(p);
}
if (mode === 'Both' || mode === 'Traceroute') {
  t = await api.traceroute(target);
  setTraceResult(t);
}
const avg = p?.data?.statistics?.avg_ms ?? 0;
const loss = p?.data?.statistics?.packet_loss_percent ?? 0;
addHistory({
  target,
  type: mode,
  time: new Date().toLocaleString(),
  result: mode === 'Traceroute' ? `${t?.data?.hops?.length || 0} hops` : `${Number(avg).toFixed(1)} ms`,
  status: loss >= 100 ? 'Failed' : (loss > 0 ? 'Partial' : 'Completed')
});
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(e?.message || 'Unable to reach backend.');
    } finally {
      setRunning(false);
    }
  };

  const pStats = pingResult?.data?.statistics || {};
  const avg = pStats.avg_ms ?? 0; const loss = pStats.packet_loss_percent ?? 0;
  
  const h = traceResult?.data?.hops || hops;
  const reachable = pStats.packet_loss === 0 || h[h.length - 1]?.status === 'Destination';

  const chartData = history
    .filter((h: any) => h.target === targetName && h.type !== 'Traceroute')
    .slice(0, 20)
    .reverse()
    .map((h: any) => ({
      time: h.time.split(',')[1]?.trim() || h.time,
      latency: parseFloat(h.result) || 0
    }));
  
  if (chartData.length === 0 && pingResult?.data?.statistics) {
    chartData.push({time: "Now", latency: pingResult.data.statistics.avg_ms ?? 0});
  }

  return <div className="page-content"><div className="page-heading"><div><p className="eyebrow"><span className="eyebrow-mark" /> OVERVIEW / LIVE MONITORING</p><h1>Network Diagnostic Dashboard</h1><p>Analyze connectivity, monitor latency, and explore network routes.</p></div><div className="heading-actions">
  <select className="secondary-btn" value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={{ appearance: 'none', background: 'transparent', border: '1px solid #253349', color: '#fff', padding: '6px 30px 6px 12px', borderRadius: '6px', cursor: 'pointer', backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=%22%23fff%22 viewBox=%220 0 24 24%22 width=%2216%22 height=%2216%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/></svg>")', backgroundRepeat: 'no-repeat', backgroundPositionX: 'calc(100% - 8px)', backgroundPositionY: 'center' }}>
    <option value="Last 1 hour" style={{color: '#000'}}>Last 1 hour</option>
    <option value="Last 24 hours" style={{color: '#000'}}>Last 24 hours</option>
    <option value="Last 7 days" style={{color: '#000'}}>Last 7 days</option>
  </select>
  <button className="icon-btn" onClick={() => setShowSettings(!showSettings)} style={{position: 'relative'}}><SlidersHorizontal />
    {showSettings && <div style={{position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#131b26', border: '1px solid #253349', borderRadius: '8px', padding: '12px', zIndex: 10, width: '200px', textAlign: 'left', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'}}>
      <h4 style={{margin: '0 0 8px 0', fontSize: '12px', color: '#6e8098'}}>DASHBOARD SETTINGS</h4>
      <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fff'}}><input type="checkbox" defaultChecked /> Auto-refresh live data</label>
      <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fff', marginTop: '8px'}}><input type="checkbox" defaultChecked /> Show packet loss alerts</label>
    </div>}
  </button>
</div></div><Card className="hero-panel"><div className="hero-copy"><div className="hero-icon"><Signal /></div><div><p className="eyebrow">QUICK DIAGNOSTIC</p><h2>Run a network analysis</h2><p>Check reachability and map the path to any destination.</p></div></div><AnalyzerForm onAnalyze={handleAnalyze} />{running && <div className="inline-notice"><Loader2 className="spin" style={{marginRight: '8px'}} /> Running live analysis...</div>}{error && <div className="inline-notice"><XCircle style={{color: '#ff4c4c', marginRight: '8px'}} /> {error}</div>}</Card><div className="stats-grid"><StatCard icon={Timer} label="Average latency" value={`${Number(avg).toFixed(1)} ms`} detail={pingResult ? `Live responses` : "Across 8 packets"} trend="12.4%" /><StatCard icon={Zap} label="Packet loss" value={`${Number(loss).toFixed(1)}%`} detail="No packets lost" tone={loss > 0 ? "red" : "green"} /><StatCard icon={Route} label="Responding hops" value={`${h.length} hops`} detail="Full route mapped" tone="amber" /><StatCard icon={Wifi} label="Connection status" value={reachable ? "Reachable" : "Unreachable"} detail={targetName} tone={reachable ? "green" : "red"} /></div><div className="dashboard-grid"><Card className="latency-card"><SectionTitle eyebrow="LATENCY OVER TIME" title="Ping performance" action={<div className="card-select">{targetName} <ChevronDown /></div>} /><div className="chart-meta"><div><strong>{Number(avg).toFixed(1)} <small>ms</small></strong><span><ArrowDownRight /> 6.2% vs previous period</span></div><Badge tone={chartData.length > 0 ? "green" : "amber"}>{chartData.length > 0 ? "History data" : "Awaiting data"}</Badge></div><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}><defs><linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#40bfff" stopOpacity={0.24} /><stop offset="100%" stopColor="#40bfff" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#253349" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="time" tick={{ fill: '#6e8098', fontSize: 10 }} tickLine={false} axisLine={false} interval={2} /><YAxis tick={{ fill: '#6e8098', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: any) => `${v}`} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="latency" stroke="#48c5ff" strokeWidth={2} fill="url(#latencyFill)" dot={false} /></AreaChart></ResponsiveContainer></div></Card><Card className="route-card"><SectionTitle eyebrow="ROUTE OVERVIEW" title="Path to destination" action={<button className="text-btn" onClick={() => go('traceroute')}>View details <ArrowUpRight /></button>} /><div className="route-summary"><div><strong>{h.length}</strong><span>hops discovered</span></div><div><strong>{Number(avg).toFixed(1)} <small>ms</small></strong><span>total RTT</span></div></div><div className="route-line">{h.slice(0, 5).map((hop: any, i: number) => { const isLast = i === Math.min(h.length, 5) - 1; const HopIcon = i === 0 ? Server : isLast ? Globe2 : Network; return <div className="route-node" key={hop.hop ?? i}><div className={`node-circle ${isLast ? 'destination' : 'router'}`}><HopIcon /></div><span>{i === 0 ? 'You' : isLast ? 'Target' : `Hop ${hop.hop ?? i+1}`}</span>{!isLast && <i />}</div>})}</div><div className="route-footer"><span><span className="status-dot online" />{traceResult ? "Live hops responding" : "All hops responding"}</span><span>Last checked just now</span></div></Card></div><div className="bottom-grid"><RecentTests history={history} go={go} /><Card className="backend-card"><SectionTitle eyebrow="SYSTEM STATUS" title="Backend connectivity" action={<button className="icon-btn small-btn"><RefreshCw /></button>} /><div className="backend-visual"><div className="server-illustration"><Server /><span className="server-ring" /></div><div><Badge tone="green">Connected</Badge><h3>Flask API is online</h3><p>Live real-time network diagnostics are enabled.</p></div></div><div className="endpoint"><span>API endpoint</span><code>{api.baseUrl ? `${api.baseUrl}/api` : "https://netpulse-backend-i5co.onrender.com/api"}</code><button className="icon-btn small-btn"><CopyIcon /></button></div><button className="secondary-btn full-btn" onClick={() => go('about')}><CircleHelp /> How to connect the backend</button></Card></div></div> }
function CopyIcon() { return <Layers3 /> }
function RecentTests({ history, go }: { history: any[]; go: (id: string) => void }) { return <Card className="recent-card"><SectionTitle eyebrow="ACTIVITY" title="Recent network tests" action={<button className="text-btn" onClick={() => go('history')}>View history <ArrowUpRight /></button>} /><div className="table-wrap"><table><thead><tr><th>Destination</th><th>Type</th><th>Result</th><th>Status</th><th>Run at</th></tr></thead><tbody>{history.slice(0, 3).map(row => <tr key={row.target}><td><span className="table-target"><Globe2 />{row.target}</span></td><td>{row.type}</td><td className="result-text">{row.result}</td><td><Badge tone={row.status === 'Partial' ? 'amber' : 'green'}>{row.status}</Badge></td><td className="muted-cell">{row.time}</td></tr>)}</tbody></table></div></Card> }
function PingPage({ addHistory }: { addHistory: (r: any) => void }) { const [target, setTarget] = useState(''); const [packets, setPackets] = useState('8'); const [running, setRunning] = useState(false); const [result, setResult] = useState<any>(null); const [error, setError] = useState(''); const controller = useMemo(() => ({ current: null as AbortController | null }), []); const start = async () => { const destination = target.trim(); if (!isValidDestination(destination)) { setError('Enter a valid hostname or IP address without a protocol or path.'); return } controller.current?.abort(); controller.current = new AbortController(); setRunning(true); setError(''); setResult(null); try { const data = await api.ping(destination, packets, controller.current.signal);
setResult(data);
const avg = data?.data?.statistics?.avg_ms ?? data?.data?.statistics?.average ?? 0;
const loss = data?.data?.statistics?.packet_loss_percent ?? 0;
addHistory({
  target: destination,
  type: 'Ping',
  time: new Date().toLocaleString(),
  result: `${Number(avg).toFixed(1)} ms`,
  status: loss >= 100 ? 'Failed' : (loss > 0 ? 'Partial' : 'Completed')
}); } catch (e: any) { if (e?.name !== 'AbortError') setError(e?.message || 'Unable to reach the Flask backend.') } finally { setRunning(false) } }; const stop = () => { controller.current?.abort(); setRunning(false) }; const rawOutput = result?.data?.raw_output || "";
    let parsedRows: any[] = [];
    if (rawOutput) {
      const lines = rawOutput.split("\n");
      let packetIndex = 1;
      for (const line of lines) {
        const linuxMatch = line.match(/from (.*?): icmp_[sr]eq=(\d+) ttl=(\d+) time=([\d.]+)/i);
        const winMatch = line.match(/Reply from (.*?): bytes=\d+ time[=<]([\d.]+)ms TTL=(\d+)/i);
        if (linuxMatch) {
          parsedRows.push({ packet: parseInt(linuxMatch[2]), ip: linuxMatch[1], rtt: parseFloat(linuxMatch[4]), ttl: parseInt(linuxMatch[3]), status: 'Received' });
        } else if (winMatch) {
          parsedRows.push({ packet: packetIndex++, ip: winMatch[1], rtt: parseFloat(winMatch[2]), ttl: parseInt(winMatch[3]), status: 'Received' });
        }
      }
    }
    const rows = parsedRows.length > 0 ? parsedRows : (result?.data?.responses || result?.data?.results || []);
  const points = rows.map((r: any, i: number) => ({ time: String(r.packet ?? i + 1), latency: Number(r.rtt ?? r.rtt_ms ?? r.latency ?? r.time ?? 0) })).filter((r: any) => Number.isFinite(r.latency) && r.latency > 0); const stats = result?.data?.statistics || result?.stats || result?.statistics || result || {}; const min = stats.min_ms ?? stats.min ?? stats.min_rtt ?? (points.length ? Math.min(...points.map((p: any) => p.latency)) : null); const max = stats.max_ms ?? stats.max ?? stats.max_rtt ?? (points.length ? Math.max(...points.map((p: any) => p.latency)) : null); const avg = stats.avg_ms ?? stats.average ?? stats.avg ?? stats.avg_rtt ?? (points.length ? points.reduce((s: number, p: any) => s + p.latency, 0) / points.length : null); const loss = stats.packet_loss_percent ?? stats.packet_loss ?? stats.loss ?? (result?.sent ? ((result.sent - (result.received ?? points.length)) / result.sent) * 100 : null); return <div className="page-content"><PageIntro eyebrow="DIAGNOSTIC TOOL / PING" title="Ping Analyzer" description="Measure round-trip time and packet reliability to a destination." /><Card className="tool-form"><div className="field grow"><label>Destination domain or IP</label><div className="input-wrap"><Globe2 /><input value={target} onChange={e => setTarget(e.target.value)} placeholder="example.com or 1.1.1.1" /></div></div><div className="field"><label>Packet count</label><select value={packets} onChange={e => setPackets(e.target.value)}><option value="4">4 packets</option><option value="8">8 packets</option><option value="16">16 packets</option></select></div><button className="primary-btn" onClick={start} disabled={running}>{running ? <Loader2 className="spin" /> : <Play />}{running ? 'Running...' : 'Start ping'}</button><button className="danger-btn" onClick={stop} disabled={!running}><StopCircle /> Stop</button></Card>{error && <div className="inline-notice"><AlertTriangle /> {error}</div>}{!result && !running && !error && <div className="tool-state"><Radio /><h3>Ready to measure</h3><p>Enter a destination and start a ping test. Live results come from the Python Flask backend.</p><Badge tone="red">Backend required for live results</Badge></div>}{running && <div className="tool-state"><Loader2 className="spin" /><h3>Running live ping</h3><p>Waiting for the Flask backend to return packet responses.</p></div>}{result && <><div className="stats-grid four"><StatCard icon={ArrowDownRight} label="Minimum RTT" value={min == null ? '—' : `${Number(min).toFixed(1)} ms`} detail="Fastest response" /><StatCard icon={ArrowUpRight} label="Maximum RTT" value={max == null ? '—' : `${Number(max).toFixed(1)} ms`} detail="Slowest response" tone="amber" /><StatCard icon={Timer} label="Average RTT" value={avg == null ? '—' : `${Number(avg).toFixed(1)} ms`} detail={`${rows.length} responses`} /><StatCard icon={Signal} label="Packet loss" value={loss == null ? '—' : `${Number(loss).toFixed(1)}%`} detail="Reported by backend" tone="green" /></div><div className="dashboard-grid"><Card className="latency-card"><SectionTitle eyebrow="RESPONSE GRAPH" title="Round-trip time" action={<Badge tone="blue">Live backend data</Badge>} /><div className="chart-meta"><div><strong>{avg == null ? '—' : Number(avg).toFixed(1)} <small>ms</small></strong><span>Responses returned by Flask</span></div></div><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><LineChart data={points}><CartesianGrid stroke="#253349" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="time" tick={{ fill: '#6e8098', fontSize: 10 }} /><YAxis tick={{ fill: '#6e8098', fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="latency" stroke="#48c5ff" strokeWidth={2} dot /></LineChart></ResponsiveContainer></div></Card><PacketTable rows={rows} /></div></>}</div> }
function PacketTable({ rows }: { rows: any[] }) { return <Card className="packet-card"><SectionTitle eyebrow="PACKET RESPONSES" title="Response details" /><div className="table-wrap"><table><thead><tr><th>Packet</th><th>Response</th><th>RTT</th><th>TTL</th><th>Status</th></tr></thead><tbody>{rows.length ? rows.map((r: any, i: number) => <tr key={r.packet ?? i}><td>#{r.packet ?? i + 1}</td><td className="mono">{r.ip ?? r.address ?? r.host ?? '—'}</td><td className="result-text">{r.rtt ?? r.rtt_ms ?? r.latency ?? r.time ?? '—'}{typeof (r.rtt ?? r.rtt_ms ?? r.latency ?? r.time) === 'number' ? ' ms' : ''}</td><td>{r.ttl ?? '—'}</td><td><Badge tone={r.status === 'timeout' || r.status === 'failed' ? 'red' : 'green'}>{r.status ?? 'Received'}</Badge></td></tr>) : <tr><td colSpan={5} className="muted-cell">No packet responses were returned.</td></tr>}</tbody></table></div></Card> }
function TraceroutePage({ addHistory }: { addHistory: (r: any) => void }) {
  const [target, setTarget] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const start = async () => {
    const destination = target.trim();
    if (!isValidDestination(destination)) return setError('Enter a valid hostname or IP address without a protocol or path.');
    setRunning(true); setError(''); setResult(null);
    try { const data = await api.traceroute(destination);
setResult(data);
const hopsCount = data?.data?.hops?.length || 0;
const reachable = data?.data?.hops?.[hopsCount - 1]?.status === 'Destination' || data?.data?.hops?.[hopsCount - 1]?.status === 'Responding';
addHistory({
  target: destination,
  type: 'Traceroute',
  time: new Date().toLocaleString(),
  result: `${hopsCount} hops`,
  status: reachable ? 'Completed' : 'Partial'
}); }
    catch (e: any) { setError(e?.message || 'Unable to reach the Flask backend.') }
    finally { setRunning(false) }
  };
  const liveHops = result?.data?.hops || result?.hops || result?.route || result?.results || [];
  return <div className="page-content"><PageIntro eyebrow="DIAGNOSTIC TOOL / ROUTE TRACE" title="Traceroute Analyzer" description="Visualize every hop between your machine and a remote destination." /><Card className="tool-form"><div className="field grow"><label>Destination domain or IP</label><div className="input-wrap"><Route /><input value={target} onChange={e => setTarget(e.target.value)} placeholder="example.com or 1.1.1.1" /></div></div><button className="primary-btn" onClick={start} disabled={running}>{running ? <Loader2 className="spin" /> : <Play />}{running ? 'Tracing...' : 'Start trace'}</button></Card>{error && <div className="inline-notice"><AlertTriangle /> {error}</div>}{result && <Card className="trace-table-card"><SectionTitle eyebrow="HOP DETAILS" title="Route diagnostics" /><div className="table-wrap"><table><thead><tr><th>Hop</th><th>IP address</th><th>Hostname</th><th>RTT</th><th>Status</th></tr></thead><tbody>{liveHops.map((h: any, i: number) => {
  const hopNum = h.hop ?? h.number ?? i + 1;
  const ip = h.ip ?? h.address ?? '*';
  const hostname = h.hostname ?? h.host ?? '-';
  const rtt = h.times_ms?.length ? (h.times_ms.reduce((a: number, b: number) => a + b, 0) / h.times_ms.length).toFixed(1) + ' ms' : (h.rtt ?? h.rtt_ms ? h.rtt + ' ms' : '-');
  const status = h.status === 'Timeout' || h.timeout ? 'Timeout' : (h.status ?? (ip === '*' ? 'Timeout' : 'Responding'));
  return (
    <tr key={i}>
      <td>{hopNum}</td>
      <td className="mono">{ip}</td>
      <td>{hostname}</td>
      <td className="result-text">{rtt}</td>
      <td><Badge tone={status === 'Timeout' || status === 'timeout' ? 'red' : 'green'}>{status}</Badge></td>
    </tr>
  );
})}</tbody></table></div></Card>}</div>
}

function DownloadIcon() { return <ArrowDownRight /> }
function ComparisonPage({ history }: { history: any[] }) { const [first, setFirst] = useState('google.com'); const [second, setSecond] = useState('github.com'); const [running, setRunning] = useState(false); const [compared, setCompared] = useState(false); const [comparison, setComparison] = useState<any>(null); const [error, setError] = useState(''); const runComparison = async () => { if (!first.trim() || !second.trim()) { setError('Enter both destinations before comparing.'); return } setRunning(true); setCompared(false); setComparison(null); setError(''); try { const p1 = api.ping(first.trim()).catch(() => ({ data: { statistics: { avg_ms: null, packet_loss_percent: null } } }));
      const p2 = api.ping(second.trim()).catch(() => ({ data: { statistics: { avg_ms: null, packet_loss_percent: null } } }));
      const [res1, res2] = await Promise.all([p1, p2]);
      const data = {
        data: {
          results: [
            { statistics: res1?.data?.statistics || {} },
            { statistics: res2?.data?.statistics || {} }
          ]
        }
      }; setComparison(data); setCompared(true) } catch (e: any) { if (e?.name !== 'AbortError') setError(e?.message || 'Unable to reach the Flask backend.') } finally { setRunning(false) } }; const firstResult = comparison?.data?.results?.[0]?.statistics || {}; const secondResult = comparison?.data?.results?.[1]?.statistics || {}; const value = (item: any, keys: string[]) => { for (const key of keys) if (item?.[key] != null) return item[key]; return '—' }; const firstLatency = value(firstResult, ['avg_ms']); const secondLatency = value(secondResult, ['avg_ms']); const firstLoss = value(firstResult, ['packet_loss_percent']); const secondLoss = value(secondResult, ['packet_loss_percent']); const firstLabel = comparison ? first : first; const secondLabel = comparison ? second : second; return <div className="page-content"><PageIntro eyebrow="ANALYTICS / COMPARISON" title="Network Comparison" description="Compare connectivity signals across two destinations side by side." /><div className="compare-inputs"><Card><label htmlFor="destination-a">Destination A</label><div className="input-wrap"><Globe2 /><input id="destination-a" value={first} onChange={e => setFirst(e.target.value)} /></div></Card><div className="versus">VS</div><Card><label htmlFor="destination-b">Destination B</label><div className="input-wrap"><Globe2 /><input id="destination-b" value={second} onChange={e => setSecond(e.target.value)} /></div></Card><button className="primary-btn" onClick={runComparison} disabled={running}>{running ? <Loader2 className="spin" /> : <BarChart3 />}{running ? 'Comparing...' : 'Compare networks'}</button></div><div className="comparison-grid"><Card><SectionTitle eyebrow="AVERAGE LATENCY" title="Response comparison" /><div className="compare-values"><div><span className="dot cyan" />{first}<strong>{firstLatency == null ? "—" : Number(firstLatency).toFixed(1)} <small>ms</small></strong></div><div><span className="dot violet" />{second}<strong>{secondLatency == null ? "—" : Number(secondLatency).toFixed(1)} <small>ms</small></strong></div></div><div className="comparison-bars"><div><span style={{ width: Math.min(100, (firstLatency || 0) / Math.max(firstLatency || 1, secondLatency || 1) * 100) + '%' }} /><b>{firstLatency == null ? "-" : Number(firstLatency).toFixed(1)} ms</b></div><div><span className="violet-bar" style={{ width: Math.min(100, (secondLatency || 0) / Math.max(firstLatency || 1, secondLatency || 1) * 100) + '%' }} /><b>{secondLatency == null ? "-" : Number(secondLatency).toFixed(1)} ms</b></div></div></Card><Card><SectionTitle eyebrow="PACKET LOSS" title="Reliability score" /><div className="reliability"><div className="score-ring"><strong>{firstLoss == null && secondLoss == null ? "-" : (100 - (Math.max(firstLoss || 0, secondLoss || 0))).toFixed(0)}</strong><span>score</span></div><div><div><span className="dot cyan" />{first} <strong>{firstLoss == null ? "—" : Number(firstLoss).toFixed(1)}%</strong></div><div><span className="dot violet" />{second} <strong>{secondLoss == null ? "—" : Number(secondLoss).toFixed(1)}%</strong></div><p>Lower packet loss means a more reliable route.</p></div></div></Card></div><Card className="comparison-chart">
  <SectionTitle eyebrow="RESPONSE TREND" title="Latency over time" action={<Badge tone="blue">Live history data</Badge>} />
  <LatencyChart 
    comparison 
    data={history
      .filter((h: any) => h.type === 'Ping' || h.type === 'Both')
      .filter((h: any) => h.target === first || h.target === second)
      .slice(0, 20)
      .reverse()
      .map((h: any, idx: number) => {
        const isFirst = h.target === first;
        const lat = parseFloat(h.result) || 0;
        return {
          time: h.time.split(',')[1]?.trim() || h.time,
          latency: isFirst ? lat : undefined,
          latency2: !isFirst ? lat : undefined
        };
      })}
  />
  <div className="chart-legend" style={{marginTop: '12px', display: 'flex', gap: '16px', justifyContent: 'center'}}>
    <span><i className="dot cyan" /> {first}</span>
    <span><i className="dot violet" /> {second}</span>
  </div>
</Card></div> }
function HistoryPage({ history, go }: { history: any[]; go: (id: string) => void }) { const [selected, setSelected] = useState<any>(null); const [query, setQuery] = useState(''); const [typeFilter, setTypeFilter] = useState('All'); const [statusFilter, setStatusFilter] = useState('All'); const [dateFilter, setDateFilter] = useState('All dates'); const [page, setPage] = useState(1); const filteredHistory = history.filter(row => row.target.toLowerCase().includes(query.toLowerCase()) && (typeFilter === 'All' || row.type === typeFilter) && (statusFilter === 'All' || row.status === statusFilter) && (dateFilter === 'All dates' || row.time.includes(dateFilter))); return <div className="page-content"><PageIntro eyebrow="ACTIVITY LOG / HISTORY" title="Test History" description="Review, filter, and inspect your previous network diagnostics." action={<button className="primary-btn" onClick={() => go('overview')}><Plus /> New test</button>} /><Card className="history-card"><div className="filter-bar"><div className="search-wrap"><Search /><input placeholder="Search destinations..." value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} /></div><label className="filter-btn"><SlidersHorizontal /><select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}><option>All</option><option>Ping</option><option>Traceroute</option><option>Both</option></select></label><label className="filter-btn"><CalendarIcon /><select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1) }}><option>All dates</option><option>Today</option><option>Yesterday</option></select></label><label className="filter-btn"><Badge tone="green">{statusFilter === 'All' ? 'All statuses' : statusFilter}</Badge><select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}><option>All</option><option>Completed</option><option>Partial</option></select></label></div><div className="table-wrap"><table><thead><tr><th><input type="checkbox" aria-label="Select all" /></th><th>Destination</th><th>Type</th><th>Result</th><th>Status</th><th>Run at</th><th>Action</th></tr></thead><tbody>{filteredHistory.map(row => <tr key={row.target}><td><input type="checkbox" aria-label={`Select ${row.target}`} /></td><td><span className="table-target"><Globe2 />{row.target}</span></td><td>{row.type}</td><td className="result-text">{row.result}</td><td><Badge tone={row.status === 'Partial' ? 'amber' : 'green'}>{row.status}</Badge></td><td className="muted-cell">{row.time}</td><td><button className="row-action" onClick={() => setSelected(row)}><ExternalLink /></button><button className="row-action"><Trash2 /></button></td></tr>)}</tbody></table></div><div className="pagination"><span>Showing {filteredHistory.length} matching tests · Page {page}</span><div><button className="icon-btn small-btn" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><ChevronLeft /></button><button className="page-number active">{page}</button><button className="icon-btn small-btn" onClick={() => setPage(page + 1)} disabled={filteredHistory.length === 0}><ChevronRight /></button></div></div></Card>{selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="detail-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><XCircle /></button><p className="eyebrow">TEST DETAILS</p><h2>{selected.target}</h2><div className="detail-grid"><span>Test type<strong>{selected.type}</strong></span><span>Result<strong>{selected.result}</strong></span><span>Completed<strong>{selected.time}</strong></span><span>Status<strong>{selected.status}</strong></span></div><div className="modal-chart"><LatencyChart data={[{time: selected.time.split(",")[1]?.trim() || selected.time, latency: parseFloat(selected.result) || 0}]} /></div></div></div>}</div> }
function CalendarIcon() { return <Clock3 /> }
function AboutPage() { return <div className="page-content"><PageIntro eyebrow="PROJECT DOCUMENTATION" title="About NetPulse" description="A visual learning system for understanding network connectivity and routing." /><div className="about-grid"><Card className="abstract-card"><div className="project-badge"><Network /> Computer Networks · PBL</div><h2>Ping & Traceroute Analyzer</h2><p className="lead">NetPulse turns low-level network diagnostics into a clear, visual experience. It helps students understand how packets travel, where latency comes from, and what happens when a connection fails.</p><div className="about-chips"><span>ICMP</span><span>TCP/IP</span><span>Flask API</span><span>React UI</span></div></Card><Card><SectionTitle eyebrow="LEARNING OBJECTIVES" title="What this project demonstrates" /><div className="objective-list"><div><CheckCircle2 /><span>Measure round-trip time and packet loss</span></div><div><CheckCircle2 /><span>Visualize multi-hop network paths</span></div><div><CheckCircle2 /><span>Interpret TTL and ICMP responses</span></div><div><CheckCircle2 /><span>Compare route performance</span></div></div></Card></div><Card className="concepts-card"><SectionTitle eyebrow="NETWORKING CONCEPTS" title="The signals behind the screen" /><div className="concept-grid"><div><div className="concept-icon"><Timer /></div><h3>RTT</h3><p>Round-trip time is how long a packet takes to travel to a destination and back. It is our primary latency signal.</p></div><div><div className="concept-icon"><Radio /></div><h3>ICMP</h3><p>Internet Control Message Protocol lets devices report reachability, errors, and time exceeded events.</p></div><div><div className="concept-icon"><Route /></div><h3>TTL</h3><p>Time to Live prevents packets from looping forever. Traceroute uses it to reveal every hop.</p></div><div><div className="concept-icon"><Signal /></div><h3>Packet loss</h3><p>The percentage of packets that never return. Loss can indicate congestion or an unstable route.</p></div></div></Card><Card className="architecture-card"><SectionTitle eyebrow="SYSTEM ARCHITECTURE" title="Designed for a Python backend" action={<Badge tone="green">Live backend data</Badge>} /><div className="architecture"><div className="arch-box browser"><LayoutDashboard /><strong>NetPulse UI</strong><span>React + Recharts</span></div><div className="arch-arrow"><ArrowUpRight /><span>REST / JSON</span></div><div className="arch-box api"><Server /><strong>Flask API</strong><span>{api.baseUrl || "https://netpulse-backend-i5co.onrender.com"}</span></div><div className="arch-arrow"><ArrowUpRight /><span>subprocess</span></div><div className="arch-box system"><Cpu /><strong>OS networking</strong><span>ping · traceroute</span></div></div><div className="endpoint-list"><code>POST /api/ping</code><code>POST /api/traceroute</code><code>POST /api/analyze</code><code>POST /api/compare</code><code>GET /api/history</code><code>GET /api/health</code></div></Card></div> }
function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="page-heading"><div><p className="eyebrow"><span className="eyebrow-mark" /> {eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-actions">{action}</div>}</div> }

export default function Page() { 
const { history, addHistory } = useHistory();
const [active, setActive] = useState('overview'); const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false); const page = navItems.find(item => item.id === active)?.label || 'Overview'; const renderPage = useMemo(() => { switch (active) { 
  case 'ping': return <PingPage addHistory={addHistory} />; 
  case 'traceroute': return <TraceroutePage addHistory={addHistory} />; 
  case 'comparison': return <ComparisonPage history={history} />; 
  case 'history': return <HistoryPage history={history} go={setActive} />; 
  case 'about': return <AboutPage />; 
  default: return <Overview history={history} addHistory={addHistory} go={setActive} /> 
} }, [active]); return <div className="app-shell"><Sidebar active={active} setActive={(id) => { setActive(id); setMobileOpen(false) }} collapsed={collapsed} setCollapsed={setCollapsed} /><div className={`mobile-overlay ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} /><div className="main-shell"><Header page={page} onMenu={() => setMobileOpen(true)} />{renderPage}<footer className="app-footer"><span><ShieldCheck /> NetPulse / PBL Project</span><span>Connected to live backend</span></footer></div></div> }
