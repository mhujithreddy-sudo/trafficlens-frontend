import re
with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. Fix Ping Analyzer Table (Extract proper packets) ---
# Previous ping_parse logic was good, let's just make sure it's injected correctly.
ping_parse = '''
    const rawOutput = result?.data?.raw_output || "";
    let parsedRows = [];
    if (rawOutput) {
      const lines = rawOutput.split("\\n");
      let packetIndex = 1;
      for (const line of lines) {
        // Linux: 64 bytes from hostname (1.1.1.1): icmp_seq=1 ttl=115 time=7.00 ms
        // Windows: Reply from 1.1.1.1: bytes=32 time=7ms TTL=115
        const linuxMatch = line.match(/from (.*?): icmp_[sr]eq=(\\d+) ttl=(\\d+) time=([\\d.]+)/i);
        const winMatch = line.match(/Reply from (.*?): bytes=\\d+ time[=<]([\\d.]+)ms TTL=(\\d+)/i);
        
        if (linuxMatch) {
          parsedRows.push({ packet: parseInt(linuxMatch[2]), ip: linuxMatch[1], rtt: parseFloat(linuxMatch[4]), ttl: parseInt(linuxMatch[3]), status: 'Received' });
        } else if (winMatch) {
          parsedRows.push({ packet: packetIndex++, ip: winMatch[1], rtt: parseFloat(winMatch[2]), ttl: parseInt(winMatch[3]), status: 'Received' });
        } else if (line.includes("Request timeout") || line.includes("100% packet loss")) {
          // just ignore or add timeout rows if we want, but usually it's fine
        }
      }
    }
    const rows = parsedRows.length > 0 ? parsedRows : [];
'''
# Replace whatever is currently assigning rows
content = re.sub(
    r'const rows = .*?;\s*const points =',
    lambda m: ping_parse.strip() + '\nconst points =',
    content,
    flags=re.DOTALL
)

# --- 2. Fix Overview Time Filter & Settings Filter ---
# We need to add state to Overview and update the buttons.
overview_state = '''
function Overview({ go }: { go: (id: string) => void }) {
  const [running, setRunning] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);
  const [traceResult, setTraceResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [targetName, setTargetName] = useState('google.com');
  const [timeRange, setTimeRange] = useState('Last 24 hours');
  const [showSettings, setShowSettings] = useState(false);
'''
content = re.sub(
    r'function Overview\(\{ go \}: \{ go: \(id: string\) => void \}\) \{\s*const \[running, setRunning\] = useState\(false\);\s*const \[pingResult, setPingResult\] = useState<any>\(null\);\s*const \[traceResult, setTraceResult\] = useState<any>\(null\);\s*const \[error, setError\] = useState\(\'\'\);\s*const \[targetName, setTargetName\] = useState\(\'google.com\'\);',
    overview_state.strip(),
    content
)

# Replace Overview dropdowns
overview_dropdowns = '''
<div className="heading-actions">
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
</div>
'''
content = re.sub(
    r'<div className="heading-actions"><button className="secondary-btn"><Clock3 /> Last 24 hours <ChevronDown /></button><button className="icon-btn"><SlidersHorizontal /></button></div>',
    overview_dropdowns.strip(),
    content
)

# Fix Overview fallback logic
content = re.sub(
    r'const avg = pStats\.avg_ms \?\? 44\.8;\s*const loss = pStats\.packet_loss_percent \?\? 0\.0;',
    r'const avg = pStats.avg_ms ?? 0; const loss = pStats.packet_loss_percent ?? 0;',
    content
)
content = re.sub(
    r'<Badge tone="blue">\{pingResult \? "Live data" : "Illustrative preview"\}</Badge>',
    r'<Badge tone={pingResult ? "green" : "amber"}>{pingResult ? "Live data" : "Awaiting data"}</Badge>',
    content
)
content = re.sub(
    r'\{pingResult \? "Live data" : "Illustrative preview"\}',
    r'pingResult ? "Live data" : "Awaiting data"',
    content
)

# --- 4. Fix HistoryPage Date Filter ---
# We need to add state and filter logic.
content = re.sub(
    r'const \[statusFilter, setStatusFilter\] = useState\(\'All\'\);\s*const \[page, setPage\] = useState\(1\);\s*const filteredHistory = history\.filter\(row => row\.target\.toLowerCase\(\)\.includes\(query\.toLowerCase\(\)\) && \(typeFilter === \'All\' \|\| row\.type === typeFilter\) && \(statusFilter === \'All\' \|\| row\.status === statusFilter\)\);',
    r"const [statusFilter, setStatusFilter] = useState('All'); const [dateFilter, setDateFilter] = useState('All dates'); const [page, setPage] = useState(1); const filteredHistory = history.filter(row => row.target.toLowerCase().includes(query.toLowerCase()) && (typeFilter === 'All' || row.type === typeFilter) && (statusFilter === 'All' || row.status === statusFilter) && (dateFilter === 'All dates' || row.time.includes(dateFilter)));",
    content
)
content = re.sub(
    r'<select defaultValue="All dates">',
    r'<select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1) }}>',
    content
)


with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE")
