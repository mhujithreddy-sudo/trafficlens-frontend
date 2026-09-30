import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix Overview component parsing
code = code.replace(
    r'const pStats = pingResult?.stats || pingResult?.statistics || {};',
    r'const pStats = pingResult?.data?.statistics || {};'
)
code = code.replace(
    r'const avg = pStats.average ?? pStats.avg_rtt ?? 44.8;',
    r'const avg = pStats.avg_ms ?? 44.8;'
)
code = code.replace(
    r'const loss = pStats.packet_loss ?? 0.0;',
    r'const loss = pStats.packet_loss_percent ?? 0.0;'
)
code = code.replace(
    r'const h = traceResult?.hops || traceResult?.route || hops;',
    r'const h = traceResult?.data?.hops || hops;'
)
code = code.replace(
    r'const chartData = pingResult?.responses ? pingResult.responses.map((r: any, i: number) => ({ time: String(r.packet ?? i + 1), latency: Number(r.rtt ?? 0) })) : latencyData;',
    r'const chartData = pingResult?.data?.statistics ? [{time: "Ping", latency: pingResult.data.statistics.avg_ms ?? 0}] : latencyData;'
)
code = code.replace(
    r'const reachable = pStats.packet_loss === 0 || h[h.length - 1]?.status === \'Destination\';',
    r'const reachable = pStats.packet_loss_percent === 0 || h[h.length - 1]?.status === \'Destination\';'
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

# Fix Sidebar health check to retry if it fails. No comments!
sidebar_fix = r'''useEffect(() => { let cancelled = false; const checkHealth = () => { api.health().then((data: any) => { if (!cancelled) setBackendOnline(data?.success === true) }).catch(() => { if (!cancelled) setBackendOnline(false) }); }; checkHealth(); const interval = setInterval(checkHealth, 10000); return () => { cancelled = true; clearInterval(interval); } }, []);'''

code = re.sub(
    r'useEffect\(\(\) => \{ let cancelled = false; api\.health\(\)\.then\(\(data: any\) => \{ if \(\!cancelled\) setBackendOnline\(data\?\.success === true\) \}\)\.catch\(\(\) => \{ if \(\!cancelled\) setBackendOnline\(false\) \}\); return \(\) => \{ cancelled = true \} \}, \[\]\);',
    sidebar_fix,
    code
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fix applied.")
