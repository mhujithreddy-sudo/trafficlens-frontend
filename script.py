import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix HistoryPage
content = content.replace(
    'function HistoryPage() {',
    'function HistoryPage({ go }: { go: (id: string) => void }) {'
)
content = content.replace(
    '<button className="primary-btn"><Plus /> New test</button>',
    '<button className="primary-btn" onClick={() => go(\'overview\')}><Plus /> New test</button>'
)

content = content.replace(
    "case 'history': return <HistoryPage />;",
    "case 'history': return <HistoryPage go={setActive} />;"
)

# 2. Fix PingPage
ping_parse = '''
    const rawOutput = result?.data?.raw_output || "";
    let parsedRows = [];
    if (rawOutput) {
      const lines = rawOutput.split("\\n");
      let packetIndex = 1;
      for (const line of lines) {
        const match = line.match(/from (.*?): icmp_seq=(\\d+) ttl=(\\d+) time=([\\d.]+)/);
        const winMatch = line.match(/Reply from (.*?): bytes=\\d+ time=([\\d.]+)ms TTL=(\\d+)/);
        const winMatch2 = line.match(/Reply from (.*?): bytes=\\d+ time<([\\d.]+)ms TTL=(\\d+)/);
        if (match) {
          parsedRows.push({ packet: parseInt(match[2]), ip: match[1], rtt: parseFloat(match[4]), ttl: parseInt(match[3]), status: 'Received' });
        } else if (winMatch) {
          parsedRows.push({ packet: packetIndex++, ip: winMatch[1], rtt: parseFloat(winMatch[2]), ttl: parseInt(winMatch[3]), status: 'Received' });
        } else if (winMatch2) {
          parsedRows.push({ packet: packetIndex++, ip: winMatch2[1], rtt: parseFloat(winMatch2[2]), ttl: parseInt(winMatch2[3]), status: 'Received' });
        }
      }
    }
    const rows = parsedRows.length > 0 ? parsedRows : (result?.data?.responses || result?.data?.results || []);
'''
content = content.replace(
    'const rows = result?.data?.responses || result?.data?.results || [];',
    ping_parse.strip()
)

# 3. Fix ComparisonPage API
compare_logic = '''
      const p1 = api.ping(first.trim()).catch(() => ({ data: { statistics: { avg_ms: null, packet_loss_percent: null } } }));
      const p2 = api.ping(second.trim()).catch(() => ({ data: { statistics: { avg_ms: null, packet_loss_percent: null } } }));
      const [res1, res2] = await Promise.all([p1, p2]);
      const data = {
        data: {
          results: [
            { statistics: res1?.data?.statistics || {} },
            { statistics: res2?.data?.statistics || {} }
          ]
        }
      };
'''
content = re.sub(
    r'const data = await api\.compare\(\{[^}]+\}\);',
    lambda m: compare_logic.strip(),
    content
)

# Fix corrupted dash characters
content = content.replace('?"', '-')

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE")
