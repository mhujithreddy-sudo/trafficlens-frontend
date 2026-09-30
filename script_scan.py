import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function PingPage" in line or "function Overview" in line or "const history = [" in line or "function HistoryPage" in line:
        print(f"Line {i}: {line.strip()[:150]}")
