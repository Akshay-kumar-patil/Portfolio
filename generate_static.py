"""
Build script: generates static/profile.json and index.html for Netlify deployment.
Run: python generate_static.py
"""
import json, os

# 1. Generate static/profile.json from portfolio_data.py
from portfolio_data import PORTFOLIO
os.makedirs("static", exist_ok=True)
with open("static/profile.json", "w", encoding="utf-8") as f:
    json.dump(PORTFOLIO, f, ensure_ascii=False, indent=2)
print("✓ Created static/profile.json")

# 2. Generate root index.html from templates/index.html
template = open("templates/index.html", "r", encoding="utf-8").read()
# Replace server-side template placeholder with the desktop bg
static_html = template.replace("{{SCENE_BG_URL}}", "/static/img/opening-ghibli.png")
# Update API path to point to the static JSON
static_html = static_html.replace(
    '"/api/profile.json"', '"/static/profile.json"'
).replace(
    "'/api/profile.json'", "'/static/profile.json'"
)
with open("index.html", "w", encoding="utf-8") as f:
    f.write(static_html)
print("✓ Created index.html")
print("\nReady for Netlify. Commit index.html and static/profile.json and push.")
