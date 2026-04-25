# Phase 1 — Crawl Instructions

The Claude Code sandbox cannot reach interactivism.com (egress gateway restriction).
Run the crawler locally, then push the output so Claude can continue with Phase 2.

## Steps

```bash
# 1. Clone / pull the branch
git clone https://github.com/interactivism/refresh.git
cd refresh
git checkout claude/clone-interactivism-website-E6Ch6

# 2. Install dependencies (Python 3.9+)
pip install -r requirements.txt

# 3. Run the crawler  (~5–10 min depending on connection)
python3 crawl.py

# 4. Review the report
cat interactivism-static/crawl_report.json | python3 -m json.tool | head -60

# 5. Commit and push everything
git add interactivism-static/ crawl_report.json
git commit -m "feat: Phase 1 crawl output — $(date +%F)"
git push -u origin claude/clone-interactivism-website-E6Ch6
```

Once pushed, return to the Claude Code session and say **"Phase 1 complete — continue with Phase 2"**.
Claude will read the crawl report and the saved HTML, then rewrite all pages and assets into
the final static site.

## What the crawler does

| Step | Description |
|------|-------------|
| Depth-0 | Homepage |
| Depth-1 | All pages linked from the homepage |
| Depth-2 | All pages linked from depth-1 pages |
| Excluded | `/work/category/*`, `/work/tag/*`, `/blog/category/*`, `/blog/tag/*`, `/tag/*` |
| Assets | CSS, JS, images (including wp-content), fonts, SVGs, icons |
| Forms | Replaced with static placeholder text |
| URL rewriting | All internal links → relative local paths |
| Report | `interactivism-static/crawl_report.json` |

## Expected output structure

```
interactivism-static/
  index.html
  work/index.html
  work/<slug>/index.html  (one per case study)
  services/index.html
  services/<slug>/index.html
  blog/index.html
  blog/<slug>/index.html
  team/index.html
  team_members/<name>/index.html
  clients/index.html
  contact/index.html
  reviews/index.html
  cookie-policy/index.html
  assets/
    css/
    js/
    images/
    fonts/
    icons/
  crawl_report.json
```
