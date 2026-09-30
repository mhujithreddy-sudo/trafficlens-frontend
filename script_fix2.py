import re

with open('app/page.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Replace any weird dash characters
content = content.replace('?"', '-')
content = content.replace('?"', '-')

start_idx = content.find('const rawOutput =')
end_idx = content.find('const points = rows.map')
if start_idx != -1 and end_idx != -1:
    correct_ping_parse = '''
    const rawOutput = result?.data?.raw_output || "";
    let parsedRows: any[] = [];
    if (rawOutput) {
      const lines = rawOutput.split("\\n");
      let packetIndex = 1;
      for (const line of lines) {
        const linuxMatch = line.match(/from (.*?): icmp_[sr]eq=(\\d+) ttl=(\\d+) time=([\\d.]+)/i);
        const winMatch = line.match(/Reply from (.*?): bytes=\\d+ time[=<]([\\d.]+)ms TTL=(\\d+)/i);
        if (linuxMatch) {
          parsedRows.push({ packet: parseInt(linuxMatch[2]), ip: linuxMatch[1], rtt: parseFloat(linuxMatch[4]), ttl: parseInt(linuxMatch[3]), status: 'Received' });
        } else if (winMatch) {
          parsedRows.push({ packet: packetIndex++, ip: winMatch[1], rtt: parseFloat(winMatch[2]), ttl: parseInt(winMatch[3]), status: 'Received' });
        }
      }
    }
    const rows = parsedRows.length > 0 ? parsedRows : (result?.data?.responses || result?.data?.results || []);
    '''
    content = content[:start_idx] + correct_ping_parse.strip() + '\n  ' + content[end_idx:]

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("DONE PING")
