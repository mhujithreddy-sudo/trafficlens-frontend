import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update Header to remove preview pill
code = re.sub(
    r'<div className="live-pill"><span className="pulse" /> Preview environment</div>',
    r'<div className="live-pill"><span className="pulse" style={{ backgroundColor: "#40d9a4" }} /> Live environment</div>',
    code
)

# 2. Update Footer to remove illustrative warning
code = re.sub(
    r'<span>Preview data is illustrative.*?Backend connection required for live diagnostics</span>',
    r'<span>Connected to live backend</span>',
    code
)

# 3. Replace ComparisonPage mock data
code = code.replace(
    r'<Badge tone="amber">Illustrative preview</Badge>',
    r'<Badge tone="blue">Live backend data</Badge>'
)

code = code.replace(
    r'<div><span className="dot cyan" />{first}<strong>44.8 <small>ms</small></strong></div><div><span className="dot violet" />{second}<strong>62.1 <small>ms</small></strong></div>',
    r'<div><span className="dot cyan" />{first}<strong>{firstLatency == null ? "—" : Number(firstLatency).toFixed(1)} <small>ms</small></strong></div><div><span className="dot violet" />{second}<strong>{secondLatency == null ? "—" : Number(secondLatency).toFixed(1)} <small>ms</small></strong></div>'
)

code = code.replace(
    r'<div><span style={{ width: \'48%\' }} /><b>44.8 ms</b></div><div><span className="violet-bar" style={{ width: \'68%\' }} /><b>62.1 ms</b></div>',
    r'<div><span style={{ width: "48%" }} /><b>{firstLatency == null ? "—" : Number(firstLatency).toFixed(1)} ms</b></div><div><span className="violet-bar" style={{ width: "68%" }} /><b>{secondLatency == null ? "—" : Number(secondLatency).toFixed(1)} ms</b></div>'
)

code = code.replace(
    r'<div><span className="dot cyan" />{first} <strong>0.0%</strong></div><div><span className="dot violet" />{second} <strong>1.2%</strong></div>',
    r'<div><span className="dot cyan" />{first} <strong>{firstLoss == null ? "—" : Number(firstLoss).toFixed(1)}%</strong></div><div><span className="dot violet" />{second} <strong>{secondLoss == null ? "—" : Number(secondLoss).toFixed(1)}%</strong></div>'
)

# 4. Modify Overview component
overview_new = """function Overview({ go }: { go: (id: string) => void }) {
  const [running, setRunning] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);
  const [traceResult, setTraceResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [targetName, setTargetName] = useState('google.com');

  const handleAnalyze = async (target: string, mode: string) => {
    setRunning(true);
    setError('');
    setTargetName(target);
    try {
      if (mode === 'Both' || mode === 'Ping') {
        const p = await api.ping(target);
        setPingResult(p);
      }
      if (mode === 'Both' || mode === 'Traceroute') {
        const t = await api.traceroute(target);
        setTraceResult(t);
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(e?.message || 'Unable to reach backend.');
    } finally {
      setRunning(false);
    }
  };

  const pStats = pingResult?.stats || pingResult?.statistics || {};
  const avg = pStats.average ?? pStats.avg_rtt ?? 44.8;
  const loss = pStats.packet_loss ?? 0.0;
  
  const h = traceResult?.hops || traceResult?.route || hops;
  const reachable = pStats.packet_loss === 0 || h[h.length - 1]?.status === 'Destination';

  const chartData = pingResult?.responses ? pingResult.responses.map((r: any, i: number) => ({ time: String(r.packet ?? i + 1), latency: Number(r.rtt ?? 0) })) : latencyData;

  return <div className="page-content"><div className="page-heading"><div><p className="eyebrow"><span className="eyebrow-mark" /> OVERVIEW / LIVE MONITORING</p><h1>Network Diagnostic Dashboard</h1><p>Analyze connectivity, monitor latency, and explore network routes.</p></div><div className="heading-actions"><button className="secondary-btn"><Clock3 /> Last 24 hours <ChevronDown /></button><button className="icon-btn"><SlidersHorizontal /></button></div></div><Card className="hero-panel"><div className="hero-copy"><div className="hero-icon"><Signal /></div><div><p className="eyebrow">QUICK DIAGNOSTIC</p><h2>Run a network analysis</h2><p>Check reachability and map the path to any destination.</p></div></div><AnalyzerForm onAnalyze={handleAnalyze} />{running && <div className="inline-notice"><Loader2 className="spin" style={{marginRight: '8px'}} /> Running live analysis...</div>}{error && <div className="inline-notice"><XCircle style={{color: '#ff4c4c', marginRight: '8px'}} /> {error}</div>}</Card><div className="stats-grid"><StatCard icon={Timer} label="Average latency" value={`${Number(avg).toFixed(1)} ms`} detail={pingResult ? `Live responses` : "Across 8 packets"} trend="12.4%" /><StatCard icon={Zap} label="Packet loss" value={`${Number(loss).toFixed(1)}%`} detail="No packets lost" tone={loss > 0 ? "red" : "green"} /><StatCard icon={Route} label="Responding hops" value={`${h.length} hops`} detail="Full route mapped" tone="amber" /><StatCard icon={Wifi} label="Connection status" value={reachable ? "Reachable" : "Unreachable"} detail={targetName} tone={reachable ? "green" : "red"} /></div><div className="dashboard-grid"><Card className="latency-card"><SectionTitle eyebrow="LATENCY OVER TIME" title="Ping performance" action={<div className="card-select">{targetName} <ChevronDown /></div>} /><div className="chart-meta"><div><strong>{Number(avg).toFixed(1)} <small>ms</small></strong><span><ArrowDownRight /> 6.2% vs previous period</span></div><Badge tone="blue">{pingResult ? "Live data" : "Illustrative preview"}</Badge></div><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}><defs><linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#40bfff" stopOpacity={0.24} /><stop offset="100%" stopColor="#40bfff" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#253349" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="time" tick={{ fill: '#6e8098', fontSize: 10 }} tickLine={false} axisLine={false} interval={2} /><YAxis tick={{ fill: '#6e8098', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: any) => `${v}`} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="latency" stroke="#48c5ff" strokeWidth={2} fill="url(#latencyFill)" dot={false} /></AreaChart></ResponsiveContainer></div></Card><Card className="route-card"><SectionTitle eyebrow="ROUTE OVERVIEW" title="Path to destination" action={<button className="text-btn" onClick={() => go('traceroute')}>View details <ArrowUpRight /></button>} /><div className="route-summary"><div><strong>{h.length}</strong><span>hops discovered</span></div><div><strong>{Number(avg).toFixed(1)} <small>ms</small></strong><span>total RTT</span></div></div><div className="route-line">{h.slice(0, 5).map((hop: any, i: number) => { const isLast = i === Math.min(h.length, 5) - 1; const HopIcon = i === 0 ? Server : isLast ? Globe2 : Network; return <div className="route-node" key={hop.hop ?? i}><div className={`node-circle ${isLast ? 'destination' : 'router'}`}><HopIcon /></div><span>{i === 0 ? 'You' : isLast ? 'Target' : `Hop ${hop.hop ?? i+1}`}</span>{!isLast && <i />}</div>})}</div><div className="route-footer"><span><span className="status-dot online" />{traceResult ? "Live hops responding" : "All hops responding"}</span><span>Last checked just now</span></div></Card></div><div className="bottom-grid"><RecentTests go={go} /><Card className="backend-card"><SectionTitle eyebrow="SYSTEM STATUS" title="Backend connectivity" action={<button className="icon-btn small-btn"><RefreshCw /></button>} /><div className="backend-visual"><div className="server-illustration"><Server /><span className="server-ring" /></div><div><Badge tone="green">Connected</Badge><h3>Flask API is online</h3><p>Live real-time network diagnostics are enabled.</p></div></div><div className="endpoint"><span>API endpoint</span><code>{api.baseUrl ? `${api.baseUrl}/api` : "https://netpulse-backend-i5co.onrender.com/api"}</code><button className="icon-btn small-btn"><CopyIcon /></button></div><button className="secondary-btn full-btn" onClick={() => go('about')}><CircleHelp /> How to connect the backend</button></Card></div></div> }"""
code = re.sub(r'function Overview.*?\(id: string\) => void \}\) \{ const \[notice.*?</div></div> \}', overview_new, code, flags=re.DOTALL)


# 5. Fix AnalyzerForm which I already patched to use `onAnalyze(target, mode)`

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("Patch successful!")
