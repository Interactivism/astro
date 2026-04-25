#!/usr/bin/env python3
"""
crawl_services.py — fetch service sub-pages missing from the Phase 1 crawl.

Run from ~/refresh after Phase 2 is complete.
Usage:
    python3 -u crawl_services.py

What it does:
  1. Fetches 32 pages that were below the depth-2 limit (service sub-pages,
     /remote-ux-design-and-dev, /team_members/erik-wingren)
  2. Downloads any new assets not already in assets/cdn/
  3. Rewrites all asset URLs and interactivism.com links to local relative paths
  4. Strips WordPress metadata <link> tags (feed, xmlrpc, shortlinks, etc.)
  5. Saves each page as <slug>/index.html in the right directory
  6. Updates the existing 72 pages to link to the new local pages
"""

import os
import re
import time
import urllib.parse
from pathlib import Path
from typing import Optional, Dict, List

import requests
from bs4 import BeautifulSoup

# ── Configuration ────────────────────────────────────────────────────────────

BASE_URL    = "https://interactivism.com"
STATIC_DIR  = Path("interactivism-static")
ASSETS_DIR  = STATIC_DIR / "assets"
CDN_DIR     = ASSETS_DIR / "cdn"
CLOSTE_HOST = "cdn-605d8764c1ac1905d046e8cc.closte.com"
DELAY       = 0.5   # seconds between page fetches

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://interactivism.com/",
}

KEEP_CDN = {
    "www.googletagmanager.com", "www.google.com", "maps.googleapis.com",
    "www.google-analytics.com", "ssl.google-analytics.com", "stats.g.doubleclick.net",
    "connect.facebook.net", "platform.twitter.com",
}
REMOVE_HOSTS = {"dc.ads.linkedin.com"}

# Third-party libraries already self-hosted from Phase 2
FA_CSS      = ASSETS_DIR / "css" / "fontawesome-all.min.css"
JQUERY_JS   = ASSETS_DIR / "js" / "jquery.min.js"
SLICK_CSS   = ASSETS_DIR / "css" / "slick.css"
DT_CSS      = ASSETS_DIR / "css" / "jquery.dataTables.min.css"
DT_RESP_CSS = ASSETS_DIR / "css" / "responsive.dataTables.min.css"

# interactivism.com assets (not CDN) that were manually created in Phase 3
INTERACTIVISM_ASSETS: Dict[str, Path] = {
    "https://interactivism.com/wp-content/themes/inter-theme/img/icon-arrow-back.svg":
        CDN_DIR / "wp-content/themes/inter-theme/img/icon-arrow-back.svg",
    "https://www.interactivism.com/wp-content/themes/inter-theme/img/icon-arrow-back.svg":
        CDN_DIR / "wp-content/themes/inter-theme/img/icon-arrow-back.svg",
    "https://interactivism.com/wp-content/themes/inter-theme/img/icon-arrow-forward.svg":
        CDN_DIR / "wp-content/themes/inter-theme/img/icon-arrow-forward.svg",
    "https://www.interactivism.com/wp-content/themes/inter-theme/img/icon-arrow-forward.svg":
        CDN_DIR / "wp-content/themes/inter-theme/img/icon-arrow-forward.svg",
    "https://interactivism.com/wp-content/themes/inter-theme/favicons/manifest.json":
        CDN_DIR / "wp-content/themes/inter-theme/favicons/manifest.json",
    "https://www.interactivism.com/wp-content/themes/inter-theme/favicons/manifest.json":
        CDN_DIR / "wp-content/themes/inter-theme/favicons/manifest.json",
}

TARGET_PAGES = [
    # Service sub-pages (depth-3, missed by Phase 1)
    "/services/development/front-end-development/",
    "/services/development/full-stack-web-development/",
    "/services/development/mobile-app-development/",
    "/services/human-ai-experience/agentic-ai-design/",
    "/services/human-ai-experience/ai-data-visualization/",
    "/services/human-ai-experience/ai-product-strategy/",
    "/services/human-ai-experience/ai-prototyping/",
    "/services/human-ai-experience/conversational-interfaces/",
    "/services/human-ai-experience/explainability-trust-design/",
    "/services/human-ai-experience/human-in-the-loop-design/",
    "/services/human-ai-experience/responsible-ai-ux/",
    "/services/research/heuristic-evaluation/",
    "/services/research/site-app-analytics/",
    "/services/research/usability-testing/",
    "/services/research/user-research/",
    "/services/strategy-growth/digital-strategy/",
    "/services/strategy-growth/growth-strategy/",
    "/services/strategy-growth/product-strategy/",
    "/services/training/in-studio-workshops/",
    "/services/training/on-site-training/",
    "/services/training/public-presentations/",
    "/services/ux-design/data-visualization/",
    "/services/ux-design/emerging-technologies/",
    "/services/ux-design/identity-branding/",
    "/services/ux-design/information-architecture/",
    "/services/ux-design/interaction-design/",
    "/services/ux-design/prototyping/",
    "/services/ux-design/seo/",
    "/services/ux-design/user-interface-design/",
    # Other pages missing from the original crawl
    "/remote-ux-design-and-dev/",
    "/team_members/erik-wingren/",
]

# ── Session ──────────────────────────────────────────────────────────────────

session = requests.Session()
session.headers.update(HEADERS)

# ── Helpers ──────────────────────────────────────────────────────────────────

LIB_MAP: Dict[str, Path] = {}   # stripped URL → local path


def build_lib_map():
    entries = [
        ("https://use.fontawesome.com/releases/v5.15.4/css/all.min.css", FA_CSS),
        ("https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js", JQUERY_JS),
        ("https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css", SLICK_CSS),
        ("https://cdn.datatables.net/1.12.1/css/jquery.dataTables.min.css", DT_CSS),
        ("https://cdn.datatables.net/responsive/2.3.0/css/responsive.dataTables.min.css", DT_RESP_CSS),
    ]
    for url, local in entries:
        LIB_MAP[_strip_query(url)] = local


def _strip_query(url: str) -> str:
    p = urllib.parse.urlparse(url)
    return urllib.parse.urlunparse(p._replace(query="", fragment=""))


def _normalise(url: str, base: str = BASE_URL) -> Optional[str]:
    url = url.strip()
    if not url or url.startswith(("data:", "javascript:", "mailto:", "tel:", "#")):
        return None
    if url.startswith("//"):
        url = "https:" + url
    return urllib.parse.urljoin(base, url)


def _host(url: str) -> str:
    return urllib.parse.urlparse(url).netloc.lower()


def _closte_to_local(url: str) -> Path:
    return CDN_DIR / urllib.parse.urlparse(url).path.lstrip("/")


def _url_to_asset_local(url: str) -> Optional[Path]:
    """Return local Path for a self-hostable asset URL, None if keep as CDN."""
    canon = _strip_query(url)
    # Known interactivism.com assets
    if canon in INTERACTIVISM_ASSETS:
        return INTERACTIVISM_ASSETS[canon]
    # Third-party libs
    if canon in LIB_MAP:
        return LIB_MAP[canon]
    h = _host(url)
    if CLOSTE_HOST in url:
        return _closte_to_local(url)
    if h in KEEP_CDN:
        return None
    if "fontawesome.com" in h:
        p = urllib.parse.urlparse(url).path
        return FA_CSS if p.endswith(".css") else ASSETS_DIR / "webfonts" / Path(p).name
    if "datatables.net" in h:
        return ASSETS_DIR / "css" / Path(urllib.parse.urlparse(url).path).name
    if "jsdelivr.net" in h and "slick" in url:
        p = urllib.parse.urlparse(url).path
        return SLICK_CSS if p.endswith(".css") else ASSETS_DIR / "css" / "slick-fonts" / Path(p).name
    if "googleapis.com" in h and "jquery" in url.lower():
        return JQUERY_JS
    return None


def _page_to_local(path: str) -> Path:
    return STATIC_DIR / path.strip("/") / "index.html"


def _relpath(from_file: Path, to_file: Path) -> str:
    return os.path.relpath(to_file, from_file.parent)


def _is_wp_meta(tag) -> bool:
    """True for WordPress administrative/feed <link> tags to strip."""
    href = tag.get("href", "")
    rels = tag.get("rel", [])
    rel_str = " ".join(rels) if isinstance(rels, list) else str(rels)
    if any(x in href for x in ["/feed/", "?feed=", "/xmlrpc.php", "/wp-json/", "shortlink"]):
        return True
    if any(r in rel_str for r in ["EditURI", "wlwmanifest", "shortlink"]):
        return True
    if "alternate" in rel_str and any(x in href for x in ["feed", "json", "xml", "oembed"]):
        return True
    return False


def _fetch(url: str) -> Optional[bytes]:
    try:
        r = session.get(url, timeout=30, allow_redirects=True)
        if r.status_code == 200:
            return r.content
        print(f"  WARN {r.status_code}: {url}")
        return None
    except Exception as e:
        print(f"  ERROR {e}: {url}")
        return None


def _download(url: str, local: Path) -> bool:
    if local.exists():
        return True
    local.parent.mkdir(parents=True, exist_ok=True)
    data = _fetch(url)
    if data:
        local.write_bytes(data)
        return True
    return False


# ── Page map ─────────────────────────────────────────────────────────────────

def build_page_map() -> Dict[str, Path]:
    """Map canonical URL path → local index.html for all existing + new pages."""
    pmap: Dict[str, Path] = {}
    for hf in STATIC_DIR.rglob("*.html"):
        rel = hf.relative_to(STATIC_DIR)
        parts = rel.parts
        if parts[-1] == "index.html":
            path = "/" + "/".join(parts[:-1]) + ("/" if len(parts) > 1 else "")
        else:
            path = "/" + "/".join(parts)
        pmap[path] = hf
        pmap[path.rstrip("/")] = hf
    pmap["/"] = STATIC_DIR / "index.html"
    # Pre-add target pages (so cross-links work even before files are saved)
    for path in TARGET_PAGES:
        local = _page_to_local(path)
        pmap[path] = local
        pmap[path.rstrip("/")] = local
    return pmap


# ── Asset map ─────────────────────────────────────────────────────────────────

def build_asset_map() -> Dict[str, Path]:
    """Pre-populate from already-downloaded CDN files and known libs."""
    amap: Dict[str, Path] = {}
    for url, local in LIB_MAP.items():
        amap[url] = local
    for url, local in INTERACTIVISM_ASSETS.items():
        amap[_strip_query(url)] = local
    if CDN_DIR.exists():
        for f in CDN_DIR.rglob("*"):
            if f.is_file():
                rel = f.relative_to(CDN_DIR)
                canon = f"https://{CLOSTE_HOST}/{rel}"
                amap[canon] = f
    return amap


# ── Core: process one page ────────────────────────────────────────────────────

def process_page(
    path: str,
    page_map: Dict[str, Path],
    asset_map: Dict[str, Path],
) -> bool:
    local_file = _page_to_local(path)
    if local_file.exists():
        print(f"  SKIP (exists): {path}")
        return False

    url = BASE_URL + path
    print(f"\nFetching: {url}")
    data = _fetch(url)
    if not data:
        print(f"  FAILED — skipping")
        return False

    soup = BeautifulSoup(data, "lxml")

    # ── Collect asset URLs from this page ────────────────────────────────────
    raw_urls = set()
    for tag in soup.find_all(True):
        for attr in ("href", "src", "data-src", "data-lazy-src", "data-bg"):
            v = tag.get(attr, "")
            if v and not v.startswith(("data:", "#")):
                if v.startswith("//") or "://" in v:
                    raw_urls.add(v)
        for sa in ("srcset", "data-srcset"):
            v = tag.get(sa, "")
            if v:
                for entry in v.split(","):
                    parts = entry.strip().split()
                    if parts and (parts[0].startswith("//") or "://" in parts[0]):
                        raw_urls.add(parts[0])
    for tag in soup.find_all(style=True):
        for m in re.finditer(r"url\(['\"]?([^)'\"]+)['\"]?\)", tag["style"]):
            raw_urls.add(m.group(1))
    for tag in soup.find_all("style"):
        if tag.string:
            for m in re.finditer(r"url\(['\"]?([^)'\"]+)['\"]?\)", tag.string):
                raw_urls.add(m.group(1))

    # ── Download new assets ───────────────────────────────────────────────────
    for raw in raw_urls:
        abs_url = _normalise(raw)
        if not abs_url:
            continue
        h = _host(abs_url)
        if h in KEEP_CDN or h in REMOVE_HOSTS:
            continue
        local_asset = _url_to_asset_local(abs_url)
        if local_asset is None:
            continue
        canon = _strip_query(abs_url)
        if canon not in asset_map:
            asset_map[canon] = local_asset
        if not local_asset.exists():
            print(f"  DL {abs_url[:90]}")
            _download(abs_url, local_asset)
            time.sleep(0.1)

    # ── Helper: resolve asset URL → local relative path ──────────────────────
    def asset_rel(raw_url: str) -> Optional[str]:
        abs_url = _normalise(raw_url)
        if not abs_url:
            return None
        canon = _strip_query(abs_url)
        local = asset_map.get(canon)
        if local and local.exists():
            return _relpath(local_file, local)
        return None

    # ── Helper: resolve interactivism.com page link → local relative path ────
    def page_rel(href: str) -> Optional[str]:
        abs_url = _normalise(href)
        if not abs_url or "interactivism.com" not in abs_url:
            return None
        parsed = urllib.parse.urlparse(abs_url)
        for key in (parsed.path, parsed.path.rstrip("/")):
            target = page_map.get(key)
            if target:
                return _relpath(local_file, target)
        return None

    # ── Helper: rewrite url() in CSS text ────────────────────────────────────
    def rewrite_css_urls(css: str) -> str:
        def replace(m):
            raw = m.group(1).strip("'\"")
            if raw.startswith("data:"):
                return m.group(0)
            new = asset_rel(raw)
            return f"url({new})" if new else m.group(0)
        return re.sub(r"url\(([^)]+)\)", replace, css)

    # ── Rewrite <link href> ───────────────────────────────────────────────────
    for tag in soup.find_all("link", href=True):
        if is_wp_meta := _is_wp_meta(tag):
            tag.decompose()
            continue
        new = asset_rel(tag["href"])
        if new:
            tag["href"] = new
            if "preload" in (tag.get("rel") or []):
                tag["rel"] = ["stylesheet"]
                for attr in ("as", "onload", "data-asynced", "data-optimized"):
                    tag.attrs.pop(attr, None)

    # ── Rewrite <script src> ──────────────────────────────────────────────────
    for tag in soup.find_all("script", src=True):
        h = _host(_normalise(tag["src"]) or "")
        if h in REMOVE_HOSTS:
            tag.decompose()
            continue
        new = asset_rel(tag["src"])
        if new:
            tag["src"] = new

    # ── Rewrite <img> ─────────────────────────────────────────────────────────
    for tag in soup.find_all("img"):
        for attr in ("src", "data-src", "data-lazy-src"):
            if tag.get(attr):
                new = asset_rel(tag[attr])
                if new:
                    tag[attr] = new
        for sa in ("srcset", "data-srcset"):
            if tag.get(sa):
                new_parts = []
                for entry in tag[sa].split(","):
                    entry = entry.strip()
                    if not entry:
                        continue
                    pieces = entry.split()
                    if pieces:
                        nr = asset_rel(pieces[0])
                        if nr:
                            pieces[0] = nr
                    new_parts.append(" ".join(pieces))
                tag[sa] = ", ".join(new_parts)

    # ── Rewrite <source> ──────────────────────────────────────────────────────
    for tag in soup.find_all("source"):
        if tag.get("src"):
            new = asset_rel(tag["src"])
            if new:
                tag["src"] = new
        if tag.get("srcset"):
            new_parts = []
            for entry in tag["srcset"].split(","):
                entry = entry.strip()
                if not entry:
                    continue
                pieces = entry.split()
                if pieces:
                    nr = asset_rel(pieces[0])
                    if nr:
                        pieces[0] = nr
                new_parts.append(" ".join(pieces))
            tag["srcset"] = ", ".join(new_parts)

    # ── Rewrite <a href> (interactivism.com → local) ─────────────────────────
    for tag in soup.find_all("a", href=True):
        new = page_rel(tag["href"])
        if new:
            tag["href"] = new

    # ── Rewrite inline style url() ────────────────────────────────────────────
    for tag in soup.find_all(style=True):
        tag["style"] = rewrite_css_urls(tag["style"])
    for tag in soup.find_all("style"):
        if tag.string:
            tag.string = rewrite_css_urls(tag.string)

    # ── Save ──────────────────────────────────────────────────────────────────
    local_file.parent.mkdir(parents=True, exist_ok=True)
    local_file.write_text(str(soup), encoding="utf-8")
    print(f"  Saved → {local_file}")
    time.sleep(DELAY)
    return True


# ── Update existing pages to link to the new pages ───────────────────────────

def update_existing_pages(page_map: Dict[str, Path], new_page_paths: List[str]):
    """
    Scan all previously-existing pages and rewrite any remaining
    interactivism.com links that now have a local counterpart.
    """
    print("\n=== Updating existing pages ===")
    new_locals = {_page_to_local(p) for p in new_page_paths}
    updated = 0

    for hf in sorted(STATIC_DIR.rglob("*.html")):
        if hf in new_locals:
            continue  # skip pages we just created
        content = hf.read_text(errors="replace")
        if "interactivism.com" not in content:
            continue  # quick exit

        soup = BeautifulSoup(content, "lxml")
        changed = False

        for tag in soup.find_all("a", href=True):
            href = tag["href"]
            if "interactivism.com" not in href:
                continue
            abs_url = _normalise(href)
            if not abs_url:
                continue
            parsed = urllib.parse.urlparse(abs_url)
            for key in (parsed.path, parsed.path.rstrip("/")):
                target = page_map.get(key)
                if target and target.exists():
                    new_href = _relpath(hf, target)
                    if new_href != href:
                        tag["href"] = new_href
                        changed = True
                    break

        if changed:
            hf.write_text(str(soup), encoding="utf-8")
            updated += 1

    print(f"  {updated} existing pages updated with new local links")


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    print("crawl_services.py — fetching missing service sub-pages")
    print(f"Static dir : {STATIC_DIR.resolve()}\n")

    if not STATIC_DIR.exists():
        print("ERROR: interactivism-static/ not found.")
        print("Run from ~/refresh after Phase 2 is complete.")
        return

    build_lib_map()
    page_map  = build_page_map()
    asset_map = build_asset_map()

    print(f"Existing pages in map : {len(page_map)}")
    print(f"Pre-loaded assets     : {len(asset_map)}")
    print(f"Target pages to fetch : {len(TARGET_PAGES)}\n")

    saved = 0
    failed: List[str] = []
    for path in TARGET_PAGES:
        ok = process_page(path, page_map, asset_map)
        if ok:
            saved += 1
        elif not _page_to_local(path).exists():
            failed.append(path)

    update_existing_pages(page_map, TARGET_PAGES)

    print("\n" + "=" * 60)
    print(f"Pages saved    : {saved}")
    print(f"Already existed: {len(TARGET_PAGES) - saved - len(failed)}")
    print(f"Failed         : {len(failed)}")
    if failed:
        for p in failed:
            print(f"  {p}")
    print("=" * 60)
    print("\nNext steps:")
    print("  git -C . add interactivism-static/")
    print('  git -C . commit -m "feat: add service sub-pages and missing pages"')
    print("  git push")


if __name__ == "__main__":
    main()
