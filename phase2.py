#!/usr/bin/env python3
"""
Phase 2: Download all CDN assets and rewrite HTML/CSS to use local paths.
Run from ~/refresh after Phase 1 is complete.

Usage:
    python3 -u phase2.py
"""

import json
import os
import re
import time
import urllib.parse
from pathlib import Path
from typing import Optional, Dict, Set, List
from collections import defaultdict

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

STATIC_DIR = Path("interactivism-static")
ASSETS_DIR = STATIC_DIR / "assets"
CDN_DIR    = ASSETS_DIR / "cdn"          # mirrors closte.com path structure

CLOSTE_HOST = "cdn-605d8764c1ac1905d046e8cc.closte.com"

REQUEST_DELAY = 0.3   # seconds between downloads

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "*/*",
    "Referer": "https://interactivism.com/",
}

# Hosts to keep pointing at the live CDN (tracking / API-key-bound)
KEEP_AS_CDN_HOSTS = {
    "www.googletagmanager.com",
    "www.google.com",          # recaptcha
    "maps.googleapis.com",
    "www.google-analytics.com",
    "ssl.google-analytics.com",
    "stats.g.doubleclick.net",
    "connect.facebook.net",
    "platform.twitter.com",
}

# Tracking pixels / beacons — remove from HTML entirely
REMOVE_HOSTS = {
    "dc.ads.linkedin.com",
    "www.facebook.com",
}

# Self-hostable third-party libraries
FONTAWESOME_CSS_URL = "https://use.fontawesome.com/releases/v5.15.4/css/all.min.css"
FONTAWESOME_CSS_LOCAL = ASSETS_DIR / "css" / "fontawesome-all.min.css"

JQUERY_URL = "https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"
JQUERY_LOCAL = ASSETS_DIR / "js" / "jquery.min.js"

SLICK_CSS_URL = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"
SLICK_CSS_LOCAL = ASSETS_DIR / "css" / "slick.css"

DATATABLES_CSS_URL = "https://cdn.datatables.net/1.12.1/css/jquery.dataTables.min.css"
DATATABLES_CSS_LOCAL = ASSETS_DIR / "css" / "jquery.dataTables.min.css"

DATATABLES_RESP_URL = "https://cdn.datatables.net/responsive/2.3.0/css/responsive.dataTables.min.css"
DATATABLES_RESP_LOCAL = ASSETS_DIR / "css" / "responsive.dataTables.min.css"

# Maps original URL patterns → (local_path, canonical_download_url)
EXPLICIT_LIB_MAP: Dict[str, tuple] = {}   # populated in build_lib_map()

session = requests.Session()
session.headers.update(HEADERS)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_lib_map():
    """Populate explicit library URL → local path mappings."""
    entries = [
        (FONTAWESOME_CSS_URL,   FONTAWESOME_CSS_LOCAL),
        (JQUERY_URL,            JQUERY_LOCAL),
        (SLICK_CSS_URL,         SLICK_CSS_LOCAL),
        (DATATABLES_CSS_URL,    DATATABLES_CSS_LOCAL),
        (DATATABLES_RESP_URL,   DATATABLES_RESP_LOCAL),
    ]
    # Also match the versioned ?ver=... variants and // protocol-relative
    for url, local in entries:
        EXPLICIT_LIB_MAP[strip_query(url)] = (local, url)
        EXPLICIT_LIB_MAP["https:" + url[6:] if url.startswith("https") else url] = (local, url)


def strip_query(url: str) -> str:
    p = urllib.parse.urlparse(url)
    return urllib.parse.urlunparse(p._replace(query="", fragment=""))


def normalise(url: str, base: str = "https://interactivism.com") -> Optional[str]:
    url = url.strip()
    if not url or url.startswith("data:"):
        return None
    if url.startswith("//"):
        url = "https:" + url
    return urllib.parse.urljoin(base, url)


def host_of(url: str) -> str:
    return urllib.parse.urlparse(url).netloc.lower()


def is_closte(url: str) -> bool:
    return CLOSTE_HOST in host_of(url)


def closte_to_local(url: str) -> Path:
    path = urllib.parse.urlparse(url).path
    return CDN_DIR / path.lstrip("/")


def url_to_local(url: str) -> Optional[Path]:
    """Return the local Path for any self-hostable URL, None if keep-as-CDN."""
    canon = strip_query(url)
    if canon in EXPLICIT_LIB_MAP:
        return EXPLICIT_LIB_MAP[canon][0]

    h = host_of(url)
    if is_closte(url):
        return closte_to_local(url)
    if h in KEEP_AS_CDN_HOSTS or any(k in h for k in KEEP_AS_CDN_HOSTS):
        return None
    if "fontawesome.com" in h:
        p = urllib.parse.urlparse(url).path
        if p.endswith(".css"):
            return FONTAWESOME_CSS_LOCAL
        return ASSETS_DIR / "webfonts" / Path(p).name
    if "datatables.net" in h:
        return ASSETS_DIR / "css" / Path(urllib.parse.urlparse(url).path).name
    if "jsdelivr.net" in h and "slick" in url:
        p = urllib.parse.urlparse(url).path
        if p.endswith(".css"):
            return SLICK_CSS_LOCAL
        return ASSETS_DIR / "css" / "slick-fonts" / Path(p).name
    if "googleapis.com" in h and "jquery" in url.lower():
        return JQUERY_LOCAL
    # Unknown external — keep as-is
    return None


def rel(from_file: Path, to_file: Path) -> str:
    return os.path.relpath(to_file, from_file.parent)


# ---------------------------------------------------------------------------
# Network
# ---------------------------------------------------------------------------

def fetch_bytes(url: str) -> Optional[bytes]:
    try:
        r = session.get(url, timeout=30, allow_redirects=True)
        if r.status_code == 200:
            return r.content
        print(f"  WARN {r.status_code}: {url[:90]}")
        return None
    except Exception as e:
        print(f"  ERROR {e}: {url[:90]}")
        return None


def download(url: str, local: Path, label: str = "") -> bool:
    if local.exists():
        return True
    local.parent.mkdir(parents=True, exist_ok=True)
    data = fetch_bytes(url)
    if data:
        local.write_bytes(data)
        if label:
            print(f"    {label}")
        return True
    return False


# ---------------------------------------------------------------------------
# Phase 2 processor
# ---------------------------------------------------------------------------

class Phase2:
    def __init__(self):
        # canonical (no-query) URL → local Path
        self.url_map: Dict[str, Path] = {}
        # canonical URL → download URL (with ?ver=)
        self.to_download: Dict[str, str] = {}
        self.failed: List[str] = []

    # ------------------------------------------------------------------
    # Step 1: Scan all HTML files and collect every external asset URL
    # ------------------------------------------------------------------

    def scan(self):
        print("\n=== Step 1: Scanning HTML files ===")
        html_files = sorted(STATIC_DIR.rglob("*.html"))
        print(f"  {len(html_files)} HTML files found")

        for f in html_files:
            self._scan_html(f)

        # Register explicit library mappings
        for url, (local, dl_url) in EXPLICIT_LIB_MAP.items():
            canon = strip_query(url)
            if canon not in self.url_map:
                self.url_map[canon] = local
                self.to_download[canon] = dl_url

        print(f"  {len(self.to_download)} unique assets queued for download")

    def _scan_html(self, html_file: Path):
        html = html_file.read_text(errors="replace")
        soup = BeautifulSoup(html, "lxml")
        raw_urls: Set[str] = set()

        # Collect from standard tags
        for tag in soup.find_all(True):
            for attr in ("href", "src", "data-src", "data-lazy-src", "data-bg"):
                v = tag.get(attr, "")
                if v and not v.startswith((".", "/", "#", "index")):
                    raw_urls.add(v)
            for sa in ("srcset", "data-srcset"):
                v = tag.get(sa, "")
                if v:
                    for entry in v.split(","):
                        p = entry.strip().split()
                        if p:
                            raw_urls.add(p[0])

        # Inline style url()
        for tag in soup.find_all(style=True):
            for m in re.finditer(r"url\(['\"]?([^)'\"]+)['\"]?\)", tag["style"]):
                raw_urls.add(m.group(1))

        # Inline <style> blocks
        for tag in soup.find_all("style"):
            if tag.string:
                for m in re.finditer(r"url\(['\"]?([^)'\"]+)['\"]?\)", tag.string):
                    raw_urls.add(m.group(1))

        for raw in raw_urls:
            url = normalise(raw)
            if not url:
                continue
            h = host_of(url)
            if not h or "interactivism.com" in h:
                continue
            if h in KEEP_AS_CDN_HOSTS or h in REMOVE_HOSTS:
                continue

            local = url_to_local(url)
            if local is None:
                continue

            canon = strip_query(url)
            if canon not in self.url_map:
                self.url_map[canon] = local
                self.to_download[canon] = url

    # ------------------------------------------------------------------
    # Step 2: Download all queued assets
    # ------------------------------------------------------------------

    def download_all(self):
        print(f"\n=== Step 2: Downloading {len(self.to_download)} assets ===")
        items = sorted(self.to_download.items())
        total = len(items)
        for i, (canon, dl_url) in enumerate(items, 1):
            local = self.url_map[canon]
            if local.exists():
                continue
            print(f"  [{i}/{total}] {dl_url[:90]}")
            if not download(dl_url, local):
                self.failed.append(dl_url)
            time.sleep(REQUEST_DELAY)

        # Now do secondary downloads: fonts referenced inside CSS
        self._download_fontawesome_fonts()
        self._download_slick_fonts()
        self._download_closte_css_assets()

    def _download_fontawesome_fonts(self):
        if not FONTAWESOME_CSS_LOCAL.exists():
            return
        print("\n  FontAwesome fonts...")
        css = FONTAWESOME_CSS_LOCAL.read_text(errors="replace")
        fa_base = "https://use.fontawesome.com/releases/v5.15.4/"
        for m in re.finditer(r"url\(['\"]?(\.\./webfonts/[^)'\"?#]+)['\"]?\)", css):
            rel_path = m.group(1)             # ../webfonts/fa-brands-400.woff2
            fname = Path(rel_path).name
            font_url = fa_base + "webfonts/" + fname
            local = ASSETS_DIR / "webfonts" / fname
            if download(font_url, local, fname):
                pass
            time.sleep(0.1)

    def _download_slick_fonts(self):
        if not SLICK_CSS_LOCAL.exists():
            return
        print("\n  Slick carousel fonts...")
        css = SLICK_CSS_LOCAL.read_text(errors="replace")
        base = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/"
        for m in re.finditer(r"url\(['\"]?(\.?/?fonts/[^)'\"?#]+)['\"]?\)", css):
            rel_path = m.group(1)
            fname = Path(rel_path).name
            font_url = base + "fonts/" + fname
            local = ASSETS_DIR / "css" / "slick-fonts" / fname
            if download(font_url, local, fname):
                pass
            time.sleep(0.1)

    def _download_closte_css_assets(self):
        """Download any fonts/images referenced inside closte.com CSS files."""
        for css_file in CDN_DIR.rglob("*.css"):
            css_text = css_file.read_text(errors="replace")
            # Build the hypothetical source URL for this CSS file
            rel_to_cdn = css_file.relative_to(CDN_DIR)
            css_url = f"https://{CLOSTE_HOST}/{rel_to_cdn}"
            for m in re.finditer(r"url\(['\"]?([^)'\"]+)['\"]?\)", css_text):
                raw = m.group(1).strip()
                if raw.startswith("data:"):
                    continue
                abs_url = urllib.parse.urljoin(css_url, raw)
                if not is_closte(abs_url):
                    continue
                local = closte_to_local(abs_url)
                if not local.exists():
                    download(abs_url, local)
                    time.sleep(0.1)

    # ------------------------------------------------------------------
    # Step 3: Rewrite all HTML files
    # ------------------------------------------------------------------

    def rewrite_html(self):
        print("\n=== Step 3: Rewriting HTML files ===")
        for html_file in sorted(STATIC_DIR.rglob("*.html")):
            self._rewrite_html_file(html_file)
            print(f"  {html_file.relative_to(STATIC_DIR)}")

    def _rewrite_html_file(self, html_file: Path):
        content = html_file.read_text(errors="replace")
        soup = BeautifulSoup(content, "lxml")

        def local_rel_for(raw_url: str) -> Optional[str]:
            url = normalise(raw_url)
            if not url:
                return None
            canon = strip_query(url)
            if canon in self.url_map:
                local = self.url_map[canon]
                if local.exists():
                    return rel(html_file, local)
            return None

        # <link href>
        for tag in soup.find_all("link", href=True):
            new = local_rel_for(tag["href"])
            if new:
                tag["href"] = new
                # Async CSS loaded with rel="preload" — also set rel to stylesheet
                if tag.get("rel") and "preload" in tag.get("rel", []):
                    tag["rel"] = ["stylesheet"]
                    for attr in ("as", "onload", "data-asynced", "data-optimized"):
                        if tag.has_attr(attr):
                            del tag[attr]

        # <script src>
        for tag in soup.find_all("script", src=True):
            url = normalise(tag["src"]) or ""
            h = host_of(url)
            if h in REMOVE_HOSTS:
                tag.decompose()
                continue
            new = local_rel_for(tag["src"])
            if new:
                tag["src"] = new

        # <img src / data-src / srcset / data-srcset>
        for tag in soup.find_all("img"):
            url = normalise(tag.get("src", "")) or ""
            if host_of(url) in REMOVE_HOSTS:
                tag.decompose()
                continue
            for attr in ("src", "data-src", "data-lazy-src"):
                if tag.get(attr):
                    new = local_rel_for(tag[attr])
                    if new:
                        tag[attr] = new
            for sa in ("srcset", "data-srcset"):
                if tag.get(sa):
                    tag[sa] = self._rewrite_srcset(tag[sa], html_file)

        # <source>
        for tag in soup.find_all("source"):
            for attr in ("src",):
                if tag.get(attr):
                    new = local_rel_for(tag[attr])
                    if new:
                        tag[attr] = new
            if tag.get("srcset"):
                tag["srcset"] = self._rewrite_srcset(tag["srcset"], html_file)

        # Inline style url()
        for tag in soup.find_all(style=True):
            tag["style"] = self._rewrite_css_text(tag["style"], html_file)

        # Inline <style> blocks
        for tag in soup.find_all("style"):
            if tag.string:
                tag.string = self._rewrite_css_text(tag.string, html_file)

        html_file.write_text(str(soup), encoding="utf-8")

    def _rewrite_srcset(self, srcset: str, html_file: Path) -> str:
        parts = []
        for entry in srcset.split(","):
            entry = entry.strip()
            if not entry:
                continue
            pieces = entry.split()
            if pieces:
                url = normalise(pieces[0])
                if url:
                    canon = strip_query(url)
                    if canon in self.url_map and self.url_map[canon].exists():
                        pieces[0] = rel(html_file, self.url_map[canon])
            parts.append(" ".join(pieces))
        return ", ".join(parts)

    def _rewrite_css_text(self, css: str, context_file: Path) -> str:
        def replace(m):
            raw = m.group(1).strip("'\"")
            if raw.startswith("data:"):
                return m.group(0)
            url = normalise(raw)
            if not url:
                return m.group(0)
            canon = strip_query(url)
            if canon in self.url_map and self.url_map[canon].exists():
                return f"url({rel(context_file, self.url_map[canon])})"
            return m.group(0)
        return re.sub(r"url\(([^)]+)\)", replace, css)

    # ------------------------------------------------------------------
    # Step 4: Rewrite downloaded CSS files
    # ------------------------------------------------------------------

    def rewrite_css(self):
        print("\n=== Step 4: Rewriting CSS url() references ===")

        # Rewrite LiteSpeed CSS (closte.com)
        for css_file in CDN_DIR.rglob("*.css"):
            css_url = f"https://{CLOSTE_HOST}/{css_file.relative_to(CDN_DIR)}"
            self._rewrite_css_file(css_file, css_url)

        # Rewrite slick CSS — font paths are ./fonts/ → slick-fonts/
        if SLICK_CSS_LOCAL.exists():
            css = SLICK_CSS_LOCAL.read_text(errors="replace")
            slick_fonts_dir = ASSETS_DIR / "css" / "slick-fonts"
            if slick_fonts_dir.exists():
                def fix_slick(m):
                    raw = m.group(1).strip("'\"")
                    fname = Path(raw).name
                    local = slick_fonts_dir / fname
                    if local.exists():
                        return f"url(slick-fonts/{fname})"
                    return m.group(0)
                css = re.sub(r"url\(([^)]+)\)", fix_slick, css)
                SLICK_CSS_LOCAL.write_text(css)
                print(f"  slick.css")

    def _rewrite_css_file(self, css_file: Path, css_url: str):
        css = css_file.read_text(errors="replace")
        changed = False

        def replace(m):
            nonlocal changed
            raw = m.group(1).strip("'\"")
            if raw.startswith("data:"):
                return m.group(0)
            abs_url = urllib.parse.urljoin(css_url, raw)
            if not is_closte(abs_url):
                return m.group(0)
            local = closte_to_local(abs_url)
            if local.exists():
                changed = True
                return f"url({os.path.relpath(local, css_file.parent)})"
            return m.group(0)

        new_css = re.sub(r"url\(([^)]+)\)", replace, css)
        if changed:
            css_file.write_text(new_css)
            print(f"  {css_file.name}")

    # ------------------------------------------------------------------
    # Step 5: Report
    # ------------------------------------------------------------------

    def report(self):
        print("\n" + "="*60)
        print("PHASE 2 REPORT")
        print("="*60)

        cdn_files   = list(CDN_DIR.rglob("*")) if CDN_DIR.exists() else []
        css_files   = list((ASSETS_DIR / "css").rglob("*.css")) if (ASSETS_DIR / "css").exists() else []
        js_files    = list((ASSETS_DIR / "js").rglob("*.js")) if (ASSETS_DIR / "js").exists() else []
        font_files  = list((ASSETS_DIR / "webfonts").rglob("*")) if (ASSETS_DIR / "webfonts").exists() else []
        slick_fonts = list((ASSETS_DIR / "css" / "slick-fonts").rglob("*")) if (ASSETS_DIR / "css" / "slick-fonts").exists() else []

        images = [f for f in cdn_files if f.suffix.lower() in {".jpg",".jpeg",".png",".gif",".webp",".avif",".svg",".ico"} and f.is_file()]
        js_cdn = [f for f in cdn_files if f.suffix.lower() == ".js" and f.is_file()]
        css_cdn = [f for f in cdn_files if f.suffix.lower() == ".css" and f.is_file()]

        print(f"  Pages rewritten       : {len(list(STATIC_DIR.rglob('*.html')))}")
        print(f"  CDN images            : {len(images)}")
        print(f"  CDN JS bundles        : {len(js_cdn)}")
        print(f"  CDN CSS bundles       : {len(css_cdn)}")
        print(f"  Third-party CSS       : {len(css_files)}")
        print(f"  Third-party JS        : {len(js_files)}")
        print(f"  FontAwesome fonts     : {len(font_files)}")
        print(f"  Slick fonts           : {len(slick_fonts)}")
        print(f"  Failed downloads      : {len(self.failed)}")

        if self.failed:
            print("\n  Failed URLs (up to 20):")
            for u in self.failed[:20]:
                print(f"    {u}")

        print(f"\n  External deps kept as CDN:")
        print(f"    - Google Tag Manager / Analytics (tracking)")
        print(f"    - Google Maps API (requires API key)")
        print(f"    - Google reCAPTCHA (contact form removed)")
        print(f"  Removed:")
        print(f"    - LinkedIn tracking pixel")

        print(f"\n  Output: {STATIC_DIR.resolve()}")

    # ------------------------------------------------------------------
    # Entry point
    # ------------------------------------------------------------------

    def run(self):
        for d in [CDN_DIR, ASSETS_DIR/"css", ASSETS_DIR/"js",
                  ASSETS_DIR/"webfonts", ASSETS_DIR/"css"/"slick-fonts"]:
            d.mkdir(parents=True, exist_ok=True)

        build_lib_map()
        self.scan()
        self.download_all()
        self.rewrite_html()
        self.rewrite_css()
        self.report()


if __name__ == "__main__":
    print("Phase 2: CDN asset download + HTML rewrite")
    print(f"Static dir : {STATIC_DIR.resolve()}")
    Phase2().run()
    print("\nDone. Commit and push:")
    print("  git add interactivism-static/")
    print("  git commit -m 'feat: Phase 2 — assets self-hosted, HTML rewritten'")
    print("  git push")
