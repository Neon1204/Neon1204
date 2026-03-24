#!/usr/bin/env python3
import urllib.request, json, sys

username = "Neon1204"
url = f"https://github-contributions-api.j.gr/wc/{username}"

try:
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = json.loads(resp.read().decode())
except Exception as e:
    print(f"API error: {e}", file=sys.stderr)
    # Generate placeholder
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="130">
<rect width="600" height="130" fill="white"/>
<text x="20" y="30" font-size="14">Contribution Snake</text>
<text x="20" y="50" font-size="10">API unavailable, using placeholder</text>
</svg>'''
    with open("github-contribution-grid-snake.svg", "w") as f:
        f.write(svg)
    sys.exit(0)

weeks_data = []
for m_name, m_data in data.get("contributions", {}).items():
    for w in m_data.get("weeks", []):
        weeks_data.append(w)

weeks_data = weeks_data[-52:] if len(weeks_data) > 52 else weeks_data
counts = [d["count"] for w in weeks_data for d in w["days"]]
max_val = max(counts) if counts else 1

cell, gap = 11, 2
w_count = len(weeks_data)
svg_w = w_count * (cell + gap) + 20
svg_h = 7 * (cell + gap) + 40
months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{svg_w}" height="{svg_h}"><rect width="{svg_w}" height="{svg_h}" fill="white"/>'

# Month labels
x = 20
last_m = -1
for wi, week in enumerate(weeks_data):
    for d in week["days"]:
        if d.get("date"):
            m = int(d["date"].split("-")[1])
            if m != last_m:
                svg += f'<text x="{x}" y="11" font-size="9">{months[m-1]}</text>'
                last_m = m
                break
    x += cell + gap

# Contribution squares
for wi, week in enumerate(weeks_data):
    for di, d in enumerate(week["days"]):
        if not d.get("date"):
            continue
        lvl = d["count"] / max_val if max_val > 0 else 0
        color = "#ebedf0" if lvl == 0 else "#9be9a8" if lvl < 0.25 else "#40c463" if lvl < 0.5 else "#30a14e" if lvl < 0.75 else "#216e39"
        px = 20 + wi * (cell + gap)
        py = 20 + di * (cell + gap)
        svg += f'<rect x="{px}" y="{py}" width="{cell}" height="{cell}" fill="{color}" rx="1"/>'

svg += f'<text x="20" y="{svg_h-5}" font-size="8" fill="#666">@{username}</text></svg>'

with open("github-contribution-grid-snake.svg", "w") as f:
    f.write(svg)
print("SVG generated")
