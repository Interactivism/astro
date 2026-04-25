#!/usr/bin/env python3
"""
interactivism.com static site crawler — Phase 1
Run this script on a machine that can reach interactivism.com.
Output goes to ./interactivism-static/ in the current directory.

Usage:
    pip install requests beautifulsoup4 lxml
    python3 crawl.py

The script will:
  1. Crawl all pages up to depth 2 (excluding filtered paths)
  2. Download every asset: CSS, JS, images, fonts, SVGs
  3. Rewrite all internal URLs to relative local paths
  4. Produce interactivism-static/ ready to drop into the repo
  5. Write crawl_report.json with the full inventory
"""

import json
import os
import re
import sys
import time
import hashlib
import mimetypes
import urllib.parse
from pathlib import Path
from collections import defaultdict

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_URL = "https://interactivism.com"
MAX_DEPTH = 2
OUTPUT_DIR = Path("interactivism-static")
ASSETS_DIR = OUTPUT_DIR / "assets"

EXCLUDE_PATTERNS = [
    re.compile(r"^/work/category/"),
    re.compile(r"^/work/tag/"),
    re.compile(r"^/blog/category/"),
    re.compile(r"^/blog/tag/"),
    re.compile(r"^/tag/"),
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

REQUEST_DELAY = 0.5  # seconds between requests — be polite

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

session = requests.Session()
session.headers.update(HEADERS)


def normalise_url(url: str, base: str) -> str | None:
    """Resolve a URL relative to base, return None if it should be skipped."""
    url = url.strip()
    if not url or url.startswith(("mailto:", "tel:", "javascript:", "#")):
        return None
    resolved = urllib.parse.urljoin(base, url)
    parsed = urllib.parse.urlparse(resolved)
    # Strip fragment
    resolved = urllib.parse.urlunparse(parsed._replace(fragment=""))
    # Only follow same-domain links
    if parsed.netloc and parsed.netloc.replace("www.", "") != "interactivism.com".replace("www.", ""):
        return None
    return resolved


def is_excluded(path: str) -> bool:
    for pat in EXCLUDE_PATTERNS:
        if pat.match(path):
            return True
    return False


def url_to_local_path(url: str, is_page: bool = False) -> Path:
    """
    Convert a URL to a local file path inside OUTPUT_DIR.
    Pages become <slug>/index.html; assets go under assets/.
    """
    parsed = urllib.parse.urlparse(url)
    path = parsed.path.rstrip("/")

    if is_page:
        if path == "" or path == "/":
            return OUTPUT_DIR / "index.html"
        return OUTPUT_DIR / path.lstrip("/") / "index.html"

    # Assets — mirror original path under OUTPUT_DIR
    return OUTPUT_DIR / path.lstrip("/")


def asset_local_path(url: str) -> Path:
    """Determine local path for a non-page asset."""
    parsed = urllib.parse.urlparse(url)
    path = parsed.path

    # Classify by path prefix / extension
    ext = Path(path).suffix.lower()
    fname = Path(path).name

    if not fname:
        # generate a name from URL hash
        fname = hashlib.md5(url.encode()).hexdigest()[:12]

    font_exts = {".woff", ".woff2", ".ttf", ".otf", ".eot"}
    img_exts = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg", ".ico"}
    css_exts = {".css"}
    js_exts = {".js"}

    if ext in font_exts:
        return ASSETS_DIR / "fonts" / fname
    if ext in img_exts:
        # Preserve wp-content structure loosely
        if "wp-content" in path:
            rel = re.sub(r".*/wp-content/", "wp-content/", path)
            return ASSETS_DIR / "images" / rel
        return ASSETS_DIR / "images" / fname
    if ext in css_exts:
        return ASSETS_DIR / "css" / Path(path).name
    if ext in js_exts:
        return ASSETS_DIR / "js" / Path(path).name

    # Fallback: mirror full path
    return ASSETS_DIR / "misc" / path.lstrip("/")


def relative_path(from_file: Path, to_file: Path) -> str:
    """Return a relative URL from one local file to another."""
    try:
        return os.path.relpath(to_file, from_file.parent)
    except ValueError:
        return str(to_file)


def fetch(url: str, binary: bool = False) -> bytes | str | None:
    """Fetch a URL, return content or None on error."""
    try:
        resp = session.get(url, timeout=30, allow_redirects=True)
        if resp.status_code != 200:
            print(f"  WARN {resp.status_code}: {url}")
            return None
        return resp.content if binary else resp.text
    except Exception as exc:
        print(f"  ERROR fetching {url}: {exc}")
        return None


# ---------------------------------------------------------------------------
# Asset rewriting
# ---------------------------------------------------------------------------

def rewrite_css_urls(css_text: str, css_url: str, url_map: dict) -> str:
    """Rewrite url(...) references inside CSS to local relative paths."""
    def replace_url(m):
        raw = m.group(1).strip("'\"")
        abs_url = urllib.parse.urljoin(css_url, raw)
        if abs_url in url_map:
            # Return relative from css file's location
            css_local = asset_local_path(css_url)
            target_local = url_map[abs_url]
            return f"url({os.path.relpath(target_local, css_local.parent)})"
        return m.group(0)

    return re.sub(r"url\(([^)]+)\)", replace_url, css_text)


def rewrite_html_assets(soup: BeautifulSoup, page_local: Path, url_map: dict) -> BeautifulSoup:
    """Rewrite all asset/href references in an HTML page to local paths."""

    def local_rel(abs_url: str) -> str | None:
        if abs_url in url_map:
            return os.path.relpath(url_map[abs_url], page_local.parent)
        return None

    # <link rel="stylesheet" href="...">
    for tag in soup.find_all("link", href=True):
        abs_url = urllib.parse.urljoin(BASE_URL, tag["href"])
        rel = local_rel(abs_url)
        if rel:
            tag["href"] = rel

    # <script src="...">
    for tag in soup.find_all("script", src=True):
        abs_url = urllib.parse.urljoin(BASE_URL, tag["src"])
        rel = local_rel(abs_url)
        if rel:
            tag["src"] = rel

    # <img src="..."> and srcset
    for tag in soup.find_all("img"):
        if tag.get("src"):
            abs_url = urllib.parse.urljoin(BASE_URL, tag["src"])
            rel = local_rel(abs_url)
            if rel:
                tag["src"] = rel
        if tag.get("srcset"):
            tag["srcset"] = rewrite_srcset(tag["srcset"], page_local, url_map)
        if tag.get("data-src"):
            abs_url = urllib.parse.urljoin(BASE_URL, tag["data-src"])
            rel = local_rel(abs_url)
            if rel:
                tag["data-src"] = rel
        if tag.get("data-srcset"):
            tag["data-srcset"] = rewrite_srcset(tag["data-srcset"], page_local, url_map)

    # <source srcset="..."> in <picture>
    for tag in soup.find_all("source"):
        if tag.get("srcset"):
            tag["srcset"] = rewrite_srcset(tag["srcset"], page_local, url_map)
        if tag.get("src"):
            abs_url = urllib.parse.urljoin(BASE_URL, tag["src"])
            rel = local_rel(abs_url)
            if rel:
                tag["src"] = rel

    # <video> / <audio> src
    for tag in soup.find_all(["video", "audio"]):
        if tag.get("src"):
            abs_url = urllib.parse.urljoin(BASE_URL, tag["src"])
            rel = local_rel(abs_url)
            if rel:
                tag["src"] = rel

    # style="background-image: url(...)"
    for tag in soup.find_all(style=True):
        style = tag["style"]
        def _replace(m):
            raw = m.group(1).strip("'\"")
            abs_url = urllib.parse.urljoin(BASE_URL, raw)
            lrel = local_rel(abs_url)
            return f"url({lrel})" if lrel else m.group(0)
        tag["style"] = re.sub(r"url\(([^)]+)\)", _replace, style)

    # Internal page links — rewrite to relative local paths
    for tag in soup.find_all("a", href=True):
        href = tag["href"].strip()
        if href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        abs_url = normalise_url(href, BASE_URL)
        if abs_url and abs_url in url_map:
            tag["href"] = os.path.relpath(url_map[abs_url], page_local.parent)

    return soup


def rewrite_srcset(srcset: str, page_local: Path, url_map: dict) -> str:
    parts = []
    for entry in srcset.split(","):
        entry = entry.strip()
        if not entry:
            continue
        pieces = entry.split()
        if pieces:
            abs_url = urllib.parse.urljoin(BASE_URL, pieces[0])
            if abs_url in url_map:
                pieces[0] = os.path.relpath(url_map[abs_url], page_local.parent)
        parts.append(" ".join(pieces))
    return ", ".join(parts)


# ---------------------------------------------------------------------------
# Crawler
# ---------------------------------------------------------------------------

class Crawler:
    def __init__(self):
        self.visited_pages: dict[str, int] = {}   # url -> depth
        self.queued: list[tuple[str, int]] = []    # (url, depth)
        self.asset_urls: set[str] = set()          # all asset URLs found
        self.external_resources: list[dict] = []  # external/CDN resources
        self.page_html: dict[str, str] = {}        # url -> raw html
        self.url_map: dict[str, Path] = {}         # url -> local Path

    def enqueue(self, url: str, depth: int):
        parsed = urllib.parse.urlparse(url)
        if is_excluded(parsed.path):
            return
        if url in self.visited_pages:
            return
        if depth > MAX_DEPTH:
            return
        self.queued.append((url, depth))
        self.visited_pages[url] = depth  # mark as seen

    def collect_assets_from_html(self, html: str, page_url: str):
        soup = BeautifulSoup(html, "lxml")

        # CSS
        for tag in soup.find_all("link", rel=lambda r: r and "stylesheet" in r):
            href = tag.get("href", "")
            if href:
                abs_url = urllib.parse.urljoin(page_url, href)
                self._add_asset_or_external(abs_url, "css")

        # JS
        for tag in soup.find_all("script", src=True):
            abs_url = urllib.parse.urljoin(page_url, tag["src"])
            self._add_asset_or_external(abs_url, "js")

        # Images
        for tag in soup.find_all("img"):
            for attr in ("src", "data-src"):
                val = tag.get(attr, "")
                if val:
                    abs_url = urllib.parse.urljoin(page_url, val)
                    self._add_asset_or_external(abs_url, "image")
            for srcset_attr in ("srcset", "data-srcset"):
                val = tag.get(srcset_attr, "")
                if val:
                    for entry in val.split(","):
                        src = entry.strip().split()[0]
                        if src:
                            abs_url = urllib.parse.urljoin(page_url, src)
                            self._add_asset_or_external(abs_url, "image")

        # <source> in <picture>
        for tag in soup.find_all("source"):
            for attr in ("src", "srcset"):
                val = tag.get(attr, "")
                if val:
                    for entry in val.split(","):
                        src = entry.strip().split()[0]
                        if src:
                            abs_url = urllib.parse.urljoin(page_url, src)
                            self._add_asset_or_external(abs_url, "image")

        # Inline style background images
        for tag in soup.find_all(style=True):
            for m in re.finditer(r"url\(['\"]?([^)'\"]+)['\"]?\)", tag["style"]):
                url = urllib.parse.urljoin(page_url, m.group(1))
                self._add_asset_or_external(url, "image")

        # favicon / icons in <link>
        for tag in soup.find_all("link"):
            rel = " ".join(tag.get("rel", []))
            if any(x in rel for x in ("icon", "apple-touch-icon", "shortcut")):
                href = tag.get("href", "")
                if href:
                    abs_url = urllib.parse.urljoin(page_url, href)
                    self._add_asset_or_external(abs_url, "icon")

        # Discover internal page links
        for tag in soup.find_all("a", href=True):
            href = tag["href"].strip()
            abs_url = normalise_url(href, page_url)
            if abs_url:
                parsed = urllib.parse.urlparse(abs_url)
                # Only HTML pages (no file extensions or .html)
                path = parsed.path
                ext = Path(path).suffix.lower()
                if ext in ("", ".html", ".htm", ".php"):
                    depth = self.visited_pages.get(page_url, 0)
                    self.enqueue(abs_url, depth + 1)

    def _add_asset_or_external(self, url: str, kind: str):
        parsed = urllib.parse.urlparse(url)
        host = parsed.netloc.replace("www.", "")
        if host and host != "interactivism.com":
            # External / CDN resource
            self.external_resources.append({"url": url, "kind": kind})
            return
        if url.startswith("data:"):
            return
        self.asset_urls.add(url)

    def crawl_pages(self):
        print(f"\n{'='*60}")
        print("PHASE 1a: Crawling pages")
        print(f"{'='*60}")
        self.enqueue(BASE_URL + "/", 0)

        while self.queued:
            url, depth = self.queued.pop(0)
            print(f"  [depth {depth}] {url}")
            html = fetch(url)
            if html is None:
                continue
            self.page_html[url] = html
            # Register page in url_map
            self.url_map[url] = url_to_local_path(url, is_page=True)
            if depth < MAX_DEPTH:
                self.collect_assets_from_html(html, url)
            time.sleep(REQUEST_DELAY)

        print(f"\nPages crawled: {len(self.page_html)}")

    def download_assets(self):
        print(f"\n{'='*60}")
        print("PHASE 1b: Downloading assets")
        print(f"{'='*60}")

        # Also extract assets from CSS files (fonts, bg images)
        css_urls = {u for u in self.asset_urls if u.endswith(".css")}
        for css_url in list(css_urls):
            css_text = fetch(css_url)
            if css_text:
                for m in re.finditer(r"url\(['\"]?([^)'\"]+)['\"]?\)", css_text):
                    raw = m.group(1).strip()
                    if raw.startswith("data:"):
                        continue
                    abs_url = urllib.parse.urljoin(css_url, raw)
                    parsed = urllib.parse.urlparse(abs_url)
                    host = parsed.netloc.replace("www.", "")
                    if not host or host == "interactivism.com":
                        self.asset_urls.add(abs_url)
                    else:
                        self.external_resources.append({"url": abs_url, "kind": "font/image-in-css"})

        total = len(self.asset_urls)
        for i, url in enumerate(sorted(self.asset_urls), 1):
            local = asset_local_path(url)
            self.url_map[url] = local
            if local.exists():
                print(f"  [{i}/{total}] skip (exists): {local.name}")
                continue
            print(f"  [{i}/{total}] {url}")
            local.parent.mkdir(parents=True, exist_ok=True)
            data = fetch(url, binary=True)
            if data:
                local.write_bytes(data)

                # If it's a CSS file, also rewrite its internal url() references
                # (we do a second pass later after all assets are registered)
            time.sleep(REQUEST_DELAY * 0.5)

        # Second pass: rewrite url() inside CSS
        for url in css_urls:
            local = self.url_map.get(url)
            if local and local.exists() and local.suffix == ".css":
                css_text = local.read_text(errors="replace")
                rewritten = rewrite_css_urls(css_text, url, self.url_map)
                local.write_text(rewritten)

        print(f"\nAssets downloaded: {total}")

    def save_pages(self):
        print(f"\n{'='*60}")
        print("PHASE 1c: Saving & rewriting pages")
        print(f"{'='*60}")

        for url, html in self.page_html.items():
            local = self.url_map[url]
            local.parent.mkdir(parents=True, exist_ok=True)

            soup = BeautifulSoup(html, "lxml")

            # Remove WordPress admin bar, login notices, dynamic nonces
            for tag in soup.find_all(id=["wpadminbar", "wp-toolbar"]):
                tag.decompose()

            # Replace contact forms with static placeholder
            for form in soup.find_all("form"):
                placeholder = soup.new_tag("div", attrs={"class": "static-form-placeholder"})
                placeholder.string = (
                    "[Contact form — requires a backend. "
                    "This is a static clone; form submissions are not functional.]"
                )
                form.replace_with(placeholder)

            # Rewrite asset URLs
            soup = rewrite_html_assets(soup, local, self.url_map)

            # Remove canonical / og:url that point back to live site?
            # (keep them for reference but add a comment)
            for tag in soup.find_all("link", rel="canonical"):
                tag["data-original-canonical"] = tag.get("href", "")

            # Save
            local.write_text(str(soup), encoding="utf-8")
            print(f"  Saved: {local}")

    def run(self):
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        (ASSETS_DIR / "css").mkdir(parents=True, exist_ok=True)
        (ASSETS_DIR / "js").mkdir(parents=True, exist_ok=True)
        (ASSETS_DIR / "images").mkdir(parents=True, exist_ok=True)
        (ASSETS_DIR / "fonts").mkdir(parents=True, exist_ok=True)
        (ASSETS_DIR / "icons").mkdir(parents=True, exist_ok=True)

        self.crawl_pages()
        self.download_assets()
        self.save_pages()
        self.write_report()

    def write_report(self):
        counts = defaultdict(int)
        for url in self.asset_urls:
            ext = Path(urllib.parse.urlparse(url).path).suffix.lower()
            font_exts = {".woff", ".woff2", ".ttf", ".otf", ".eot"}
            img_exts = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg", ".ico"}
            if ext in {".css"}:
                counts["css"] += 1
            elif ext in {".js"}:
                counts["js"] += 1
            elif ext in font_exts:
                counts["fonts"] += 1
            elif ext in img_exts:
                counts["images"] += 1
            else:
                counts["other"] += 1

        # Deduplicate external resources
        seen_ext = set()
        deduped_ext = []
        for r in self.external_resources:
            if r["url"] not in seen_ext:
                seen_ext.add(r["url"])
                deduped_ext.append(r)

        report = {
            "pages_crawled": len(self.page_html),
            "asset_counts": dict(counts),
            "total_assets": len(self.asset_urls),
            "external_resources": deduped_ext,
            "pages": sorted(self.page_html.keys()),
        }

        report_path = OUTPUT_DIR / "crawl_report.json"
        report_path.write_text(json.dumps(report, indent=2))

        print(f"\n{'='*60}")
        print("CRAWL REPORT")
        print(f"{'='*60}")
        print(f"  Pages crawled : {report['pages_crawled']}")
        print(f"  CSS files     : {counts['css']}")
        print(f"  JS files      : {counts['js']}")
        print(f"  Images        : {counts['images']}")
        print(f"  Fonts         : {counts['fonts']}")
        print(f"  Other assets  : {counts['other']}")
        print(f"  Total assets  : {report['total_assets']}")
        print(f"  External/CDN  : {len(deduped_ext)}")
        print(f"\nFull report: {report_path}")
        print(f"Output dir : {OUTPUT_DIR.resolve()}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("interactivism.com static site crawler — Phase 1")
    print(f"Output: {OUTPUT_DIR.resolve()}")
    print(f"Base URL: {BASE_URL}")
    print(f"Max depth: {MAX_DEPTH}")
    crawler = Crawler()
    crawler.run()
    print("\nDone. Review interactivism-static/crawl_report.json then commit and push the output.")
