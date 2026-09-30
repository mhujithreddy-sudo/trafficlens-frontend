import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix fake 44.8 ms and 62.1 ms comparison bars
content = re.sub(
    r'<div className="comparison-bars"><div><span style=\{\{ width: \'48%\' \}\} /><b>44\.8 ms</b></div><div><span className="violet-bar" style=\{\{ width: \'68%\' \}\} /><b>62\.1 ms</b></div></div>',
    r'<div className="comparison-bars"><div><span style={{ width: Math.min(100, (firstLatency || 0) / Math.max(firstLatency || 1, secondLatency || 1) * 100) + \'%\' }} /><b>{firstLatency == null ? "-" : Number(firstLatency).toFixed(1)} ms</b></div><div><span className="violet-bar" style={{ width: Math.min(100, (secondLatency || 0) / Math.max(firstLatency || 1, secondLatency || 1) * 100) + \'%\' }} /><b>{secondLatency == null ? "-" : Number(secondLatency).toFixed(1)} ms</b></div></div>',
    content
)

# Fix fake score ring
content = re.sub(
    r'<div className="score-ring"><strong>100</strong><span>score</span></div>',
    r'<div className="score-ring"><strong>{firstLoss == null && secondLoss == null ? "-" : (100 - (Math.max(firstLoss || 0, secondLoss || 0))).toFixed(0)}</strong><span>score</span></div>',
    content
)

# Remove "Preview results will appear" warning
content = re.sub(
    r'\{!compared && <div className="inline-notice"><Info /> Comparing requires the Python Flask backend\. Preview results will appear when the request completes\.</div>\}',
    r'',
    content
)

# Fix 'Frontend preview' in AboutPage
content = re.sub(
    r'<Badge tone="blue">Frontend preview</Badge>',
    r'<Badge tone="green">Live backend data</Badge>',
    content
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE")
