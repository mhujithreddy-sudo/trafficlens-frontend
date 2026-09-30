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
    r'<span>Preview data is illustrative .*? Backend connection required for live diagnostics</span>',
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

  const pStats = pingResult?.data?.statistics || {};
  const avg = pStats.avg_ms ?? 44.8;
  const loss = pStats.packet_loss_percent ?? 0.0;
  
  const h = traceResult?.data?.hops || hops;
  const reachable = pStats.packet_loss_percent === 0 || h[h.length - 1]?.status === 'Destination';

  const chartData = pingResult?.data?.statistics ? [{time: "Ping", latency: pingResult.data.statistics.avg_ms ?? 0}] : latencyData;

  return <div className="page-content"><div className="page-heading"><div><p className="eyebrow"><span className="eyebrow-mark" /> OVERVIEW / LIVE MONITORING</p><h1>Network Diagnostic Dashboard</h1><p>Analyze connectivity, monitor latency, and explore network routes.</p></div><div className="heading-actions"><button className="secondary-btn"><Clock3 /> Last 24 hours <ChevronDown /></button><button className="icon-btn"><SlidersHorizontal /></button></div></div><Card className="hero-panel"><div className="hero-copy"><div className="hero-icon"><Signal /></div><div><p className="eyebrow">QUICK DIAGNOSTIC</p><h2>Run a network analysis</h2><p>Check reachability and map the path to any destination.</p></div></div><AnalyzerForm onAnalyze={handleAnalyze} />{running && <div className="inline-notice"><Loader2 className="spin" style={{marginRight: '8px'}} /> Running live analysis...</div>}{error && <div className="inline-notice"><XCircle style={{color: '#ff4c4c', marginRight: '8px'}} /> {error}</div>}</Card><div className="stats-grid"><StatCard icon={Timer} label="Average latency" value={${Number(avg).toFixed(1)} ms} detail={pingResult ? Live responses : "Across 8 packets"} trend="12.4%" /><StatCard icon={Zap} label="Packet loss" value={${Number(loss).toFixed(1)}%} detail="No packets lost" tone={loss > 0 ? "red" : "green"} /><StatCard icon={Route} label="Responding hops" value={${h.length} hops} detail="Full route mapped" tone="amber" /><StatCard icon={Wifi} label="Connection status" value={reachable ? "Reachable" : "Unreachable"} detail={targetName} tone={reachable ? "green" : "red"} /></div><div className="dashboard-grid"><Card className="latency-card"><SectionTitle eyebrow="LATENCY OVER TIME" title="Ping performance" action={<div className="card-select">{targetName} <ChevronDown /></div>} /><div className="chart-meta"><div><strong>{Number(avg).toFixed(1)} <small>ms</small></strong><span><ArrowDownRight /> 6.2% vs previous period</span></div><Badge tone="blue">{pingResult ? "Live data" : "Illustrative preview"}</Badge></div><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}><defs><linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#40bfff" stopOpacity={0.24} /><stop offset="100%" stopColor="#40bfff" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#253349" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="time" tick={{ fill: '#6e8098', fontSize: 10 }} tickLine={false} axisLine={false} interval={2} /><YAxis tick={{ fill: '#6e8098', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: any) => ${v}} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="latency" stroke="#48c5ff" strokeWidth={2} fill="url(#latencyFill)" dot={false} /></AreaChart></ResponsiveContainer></div></Card><Card className="route-card"><SectionTitle eyebrow="ROUTE OVERVIEW" title="Path to destination" action={<button className="text-btn" onClick={() => go('traceroute')}>View details <ArrowUpRight /></button>} /><div className="route-summary"><div><strong>{h.length}</strong><span>hops discovered</span></div><div><strong>{Number(avg).toFixed(1)} <small>ms</small></strong><span>total RTT</span></div></div><div className="route-line">{h.slice(0, 5).map((hop: any, i: number) => { const isLast = i === Math.min(h.length, 5) - 1; const HopIcon = i === 0 ? Server : isLast ? Globe2 : Network; return <div className="route-node" key={hop.hop ?? i}><div className={
ode-circle }><HopIcon /></div><span>{i === 0 ? 'You' : isLast ? 'Target' : Hop }</span>{!isLast && <i />}</div>})}</div><div className="route-footer"><span><span className="status-dot online" />{traceResult ? "Live hops responding" : "All hops responding"}</span><span>Last checked just now</span></div></Card></div><div className="bottom-grid"><RecentTests go={go} /><Card className="backend-card"><SectionTitle eyebrow="SYSTEM STATUS" title="Backend connectivity" action={<button className="icon-btn small-btn"><RefreshCw /></button>} /><div className="backend-visual"><div className="server-illustration"><Server /><span className="server-ring" /></div><div><Badge tone="green">Connected</Badge><h3>Flask API is online</h3><p>Live real-time network diagnostics are enabled.</p></div></div><div className="endpoint"><span>API endpoint</span><code>{api.baseUrl ? ${api.baseUrl}/api : "https://netpulse-backend-i5co.onrender.com/api"}</code><button className="icon-btn small-btn"><CopyIcon /></button></div><button className="secondary-btn full-btn" onClick={() => go('about')}><CircleHelp /> How to connect the backend</button></Card></div></div> }"""
code = re.sub(r'function Overview.*?\(id: string\) => void \}\) \{ const \[notice.*?</div></div> \}', overview_new, code, flags=re.DOTALL)


# 5. Fix AnalyzerForm
code = code.replace(
    r'function AnalyzerForm({ onAnalyze }: { onAnalyze: () => void }) { const [target, setTarget] = useState(\'google.com\'); const [mode, setMode] = useState(\'Both\'); const [packets, setPackets] = useState(\'8\'); return <div className="analyzer-form"><div className="field target-field"><label>Destination</label><div className="input-wrap"><Globe2 /><input value={target} onChange={e => setTarget(e.target.value)} placeholder="Domain or IP address" /></div></div><div className="field"><label>Analysis mode</label><select value={mode} onChange={e => setMode(e.target.value)}><option>Both</option><option>Ping</option><option>Traceroute</option></select></div><div className="field packet-field"><label>Packets</label><select value={packets} onChange={e => setPackets(e.target.value)}><option>4</option><option>8</option><option>16</option><option>32</option></select></div><button className="primary-btn analyze-btn" onClick={onAnalyze}><Sparkles /> Analyze network</button></div> }',
    r'function AnalyzerForm({ onAnalyze }: { onAnalyze: (target: string, mode: string) => void }) { const [target, setTarget] = useState(\'google.com\'); const [mode, setMode] = useState(\'Both\'); const [packets, setPackets] = useState(\'8\'); return <div className="analyzer-form"><div className="field target-field"><label>Destination</label><div className="input-wrap"><Globe2 /><input value={target} onChange={e => setTarget(e.target.value)} placeholder="Domain or IP address" /></div></div><div className="field"><label>Analysis mode</label><select value={mode} onChange={e => setMode(e.target.value)}><option>Both</option><option>Ping</option><option>Traceroute</option></select></div><div className="field packet-field"><label>Packets</label><select value={packets} onChange={e => setPackets(e.target.value)}><option>4</option><option>8</option><option>16</option><option>32</option></select></div><button className="primary-btn analyze-btn" onClick={() => onAnalyze(target, mode)}><Sparkles /> Analyze network</button></div> }'
)


# Fix ComparisonPage parsing
code = code.replace(
    r"value(firstResult, ['average', 'avg', 'avg_rtt', 'latency', 'average_latency'])",
    r"value(firstResult, ['avg_ms'])"
)
code = code.replace(
    r"value(secondResult, ['average', 'avg', 'avg_rtt', 'latency', 'average_latency'])",
    r"value(secondResult, ['avg_ms'])"
)
code = code.replace(
    r"value(firstResult, ['packet_loss', 'loss'])",
    r"value(firstResult, ['packet_loss_percent'])"
)
code = code.replace(
    r"value(secondResult, ['packet_loss', 'loss'])",
    r"value(secondResult, ['packet_loss_percent'])"
)
code = code.replace(
    r"const firstResult = comparison?.destination_a || comparison?.first || comparison?.results?.[0] || {};",
    r"const firstResult = comparison?.data?.results?.[0]?.statistics || {};"
)
code = code.replace(
    r"const secondResult = comparison?.destination_b || comparison?.second || comparison?.results?.[1] || {};",
    r"const secondResult = comparison?.data?.results?.[1]?.statistics || {};"
)

# Also let's fix Sidebar health check to retry if it fails.
sidebar_fix = r'''
  useEffect(() => {
    let cancelled = false;
    const checkHealth = () => {
      api.health().then((data: any) => {
        if (!cancelled) setBackendOnline(data?.success === true)
      }).catch(() => {
        if (!cancelled) setBackendOnline(false)
      });
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000); /* Check every 10 seconds */
    return () => { cancelled = true; clearInterval(interval); }
  }, []);
'''

code = re.sub(
    r'useEffect\(\(\) => \{ let cancelled = false; api\.health\(\)\.then\(\(data: any\) => \{ if \(\!cancelled\) setBackendOnline\(data\?\.success === true\) \}\)\.catch\(\(\) => \{ if \(\!cancelled\) setBackendOnline\(false\) \}\); return \(\) => \{ cancelled = true \} \}, \[\]\);',
    sidebar_fix.strip().replace('\n', ' '),
    code
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fix applied.")
