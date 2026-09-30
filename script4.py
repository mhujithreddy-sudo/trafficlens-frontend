import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix PingPage stats object mapping
content = re.sub(
    r'const stats = result\?\.stats \|\| result\?\.statistics \|\| result \|\| \{\};',
    r'const stats = result?.data?.statistics || result?.stats || result?.statistics || result || {};',
    content
)

# Fix PingPage stat fields mapping
content = re.sub(
    r'const min = stats\.min \?\? stats\.min_rtt',
    r'const min = stats.min_ms ?? stats.min ?? stats.min_rtt',
    content
)
content = re.sub(
    r'const max = stats\.max \?\? stats\.max_rtt',
    r'const max = stats.max_ms ?? stats.max ?? stats.max_rtt',
    content
)
content = re.sub(
    r'const avg = stats\.average \?\? stats\.avg \?\? stats\.avg_rtt',
    r'const avg = stats.avg_ms ?? stats.average ?? stats.avg ?? stats.avg_rtt',
    content
)
content = re.sub(
    r'const loss = stats\.packet_loss \?\? stats\.loss',
    r'const loss = stats.packet_loss_percent ?? stats.packet_loss ?? stats.loss',
    content
)

# Fix TraceroutePage hops mapping
content = re.sub(
    r'const liveHops = result\?\.hops \|\| result\?\.route \|\| result\?\.results \|\| \[\];',
    r'const liveHops = result?.data?.hops || result?.hops || result?.route || result?.results || [];',
    content
)
# Traceroute hop latency parsing: h.rtt_ms doesn't exist, it's h.times_ms which is an array!
# "times_ms": [ 0.049, 0.036, 0.022 ]
# I will map h.rtt to the average of times_ms or the first element
content = re.sub(
    r'\{h\.rtt \?\? h\.rtt_ms \?\? \'\-\'\}',
    r'{h.times_ms ? (h.times_ms.reduce((a, b) => a + b, 0) / h.times_ms.length).toFixed(1) + " ms" : (h.rtt ?? h.rtt_ms ?? "-")}',
    content
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE")
