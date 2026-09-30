import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix \'%\' to '%'
content = content.replace(r"\'%\'", r"'%'")

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE")
