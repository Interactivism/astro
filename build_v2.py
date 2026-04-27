#!/usr/bin/env python3
"""
Create interactivism-static-v2/ — same site with DM Serif Display + DM Sans.
Asset paths are rewritten to absolute GitHub Pages URLs so no files are duplicated.
"""

import os
import re
import shutil
from pathlib import Path
from bs4 import BeautifulSoup

SRC  = Path("interactivism-static")
DEST = Path("interactivism-static-v2")
BASE_URL    = "https://interactivism.github.io/refresh/interactivism-static"
BASE_URL_V2 = "https://interactivism.github.io/refresh/interactivism-static-v2"

DM_CSS = """
<style id="dm-font-preview">
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap');

  /* ── h1, h2 → DM Serif Display ────────────────────────── */
  h1, h2,
  .Slide-title,
  .Hero-headline h3,
  .Error h1,
  .Post-single h1,
  .Contact h1,
  [class*="headline"], [class*="Headline"] {
    font-family: 'DM Serif Display', serif !important;
    font-weight: 400 !important;
  }

  /* ── h3 → Source Sans 3 Bold ───────────────────────────── */
  h3, h4, h5, h6 {
    font-family: 'Source Sans 3', sans-serif !important;
    font-weight: 700 !important;
  }

  /* ── Body / UI / Labels → Source Sans 3 ───────────────── */
  body, p, a, li, dt, dd, td, th, blockquote, figcaption,
  input, textarea, select, button, label,
  .Nav, .Nav-item, .Site-navigation a,
  .Button-primary, .Button-secondary, .Button-tertiary,
  .Button-tag, .Button-tag--linked a,
  .Content-header, .Content--small, .Content--small-alt, .Content--large,
  .Page-content p, .Page-content ul,
  .Post-single .Post-content p, .Post-single .Post-content ul,
  .Slide-description, .Slide-caption, .Slide-subtitle,
  .Section-subheading, .Page-subtitle,
  .Card, .Card p, .Card-meta, .Card-footer,
  .Feature-description,
  .Footer, .Footer a, .Site-copyright,
  .Header-title, .Header-subTitle,
  .Marquee-description, .Marquee-subtext,
  .Notice, .Event-meta, .Contact-details {
    font-family: 'Source Sans 3', sans-serif !important;
  }
</style>
"""

def abs_url(rel: str, page_path: Path, v2: bool = False) -> str:
    """Resolve a relative URL to an absolute GitHub Pages URL.
    v2=True  → points to interactivism-static-v2 (for page links)
    v2=False → points to interactivism-static   (for assets)
    """
    if rel.startswith(("http", "//", "data:", "#", "mailto:")):
        return rel
    page_dir = page_path.parent.relative_to(SRC)
    resolved = (SRC / page_dir / rel).resolve().relative_to(SRC.resolve())
    base = BASE_URL_V2 if v2 else BASE_URL
    return f"{base}/{resolved}"

def rewrite_attrs(soup, page_path, tag, attr):
    for el in soup.find_all(tag, **{attr: True}):
        val = el[attr]
        if val and not val.startswith(("http", "//", "data:", "#", "mailto:")):
            el[attr] = abs_url(val, page_path)

def process_html(src_file: Path, dest_file: Path):
    with open(src_file, encoding="utf-8", errors="replace") as f:
        html = f.read()

    soup = BeautifulSoup(html, "lxml")

    # Rewrite asset references to absolute URLs
    rewrite_attrs(soup, src_file, "link",   "href")
    rewrite_attrs(soup, src_file, "script", "src")
    rewrite_attrs(soup, src_file, "img",    "src")
    rewrite_attrs(soup, src_file, "source", "src")
    rewrite_attrs(soup, src_file, "source", "srcset")

    # Rewrite srcset attributes (space-separated entries)
    for img in soup.find_all(srcset=True):
        parts = img["srcset"].split(",")
        new_parts = []
        for part in parts:
            tokens = part.strip().split()
            if tokens and not tokens[0].startswith(("http", "//", "data:")):
                tokens[0] = abs_url(tokens[0], src_file)
            new_parts.append(" ".join(tokens))
        img["srcset"] = ", ".join(new_parts)

    # Rewrite internal page links → v2
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href and not href.startswith(("http", "//", "#", "mailto:", "tel:")):
            a["href"] = abs_url(href, src_file, v2=True)

    # Inject DM font CSS just before </head>
    head = soup.find("head")
    if head:
        head.append(BeautifulSoup(DM_CSS, "lxml").find("style"))

    # Remove Playfair Display + Source Sans Pro Google Fonts imports
    # (they're still in the compiled CSS; the !important overrides win anyway)

    dest_file.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_file, "w", encoding="utf-8") as f:
        f.write(str(soup))

def main():
    if DEST.exists():
        shutil.rmtree(DEST)
    DEST.mkdir()

    html_files = list(SRC.rglob("*.html"))
    print(f"Processing {len(html_files)} pages...")

    for i, src in enumerate(html_files, 1):
        rel = src.relative_to(SRC)
        dest = DEST / rel
        process_html(src, dest)
        if i % 20 == 0:
            print(f"  {i}/{len(html_files)}")

    print(f"Done. Output: {DEST}/")
    print(f"Preview: {BASE_URL.replace('interactivism-static', 'interactivism-static-v2')}/")

if __name__ == "__main__":
    main()
