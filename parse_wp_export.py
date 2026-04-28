#!/usr/bin/env python3
"""
Parse a WordPress WXR (XML) export and emit structured JSON.

Usage:
    python3 parse_wp_export.py wordpress-source/xml-export/<file>.xml
    python3 parse_wp_export.py wordpress-source/xml-export/<file>.xml --out wordpress-source/xml-export/parsed.json
"""

import argparse
import json
import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {
    "wp":      "http://wordpress.org/export/1.2/",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc":      "http://purl.org/dc/elements/1.1/",
    "excerpt": "http://wordpress.org/export/1.2/excerpt/",
}

# Also try 1.3 namespace (newer exports)
NS_ALT = {k: v.replace("1.2", "1.3") for k, v in NS.items()}


def _ns(tree):
    root_tag = tree.getroot().tag
    if "1.3" in root_tag:
        return NS_ALT
    return NS


def _text(el, path, ns):
    node = el.find(path, ns)
    return node.text.strip() if node is not None and node.text else ""


def _find_media_urls(html: str) -> list[str]:
    return re.findall(r'https?://[^\s"\'<>]+(?:\.jpg|\.jpeg|\.png|\.gif|\.webp|\.svg|\.pdf|\.mp4|\.mov)', html, re.I)


def parse(xml_path: Path) -> dict:
    tree = ET.parse(xml_path)
    ns = _ns(tree)
    channel = tree.find("channel")
    if channel is None:
        sys.exit("ERROR: No <channel> element found — is this a valid WordPress WXR file?")

    site_url = _text(channel, "link", {})
    wp_base  = _text(channel, "wp:base_site_url", ns) or site_url

    posts, pages, attachments, categories, tags, authors = [], [], [], [], [], []
    custom_types: dict[str, list] = {}
    all_media_urls: set[str] = set()

    for item in channel.findall("item"):
        post_type = _text(item, "wp:post_type", ns)
        status    = _text(item, "wp:status", ns)
        title     = _text(item, "title", {})
        slug      = _text(item, "wp:post_name", ns)
        link      = _text(item, "link", {})
        date      = _text(item, "wp:post_date", ns)
        content   = _text(item, "content:encoded", ns)
        excerpt   = _text(item, "excerpt:encoded", ns)
        post_id   = _text(item, "wp:post_id", ns)
        parent_id = _text(item, "wp:post_parent", ns)
        author    = _text(item, "dc:creator", ns)
        attach_url = _text(item, "wp:attachment_url", ns)

        # categories / tags on this item
        item_cats = [c.text for c in item.findall("category[@domain='category']") if c.text]
        item_tags = [c.text for c in item.findall("category[@domain='post_tag']") if c.text]

        # custom fields
        custom_fields = {}
        for meta in item.findall("wp:postmeta", ns):
            key = _text(meta, "wp:meta_key", ns)
            val = _text(meta, "wp:meta_value", ns)
            if key:
                custom_fields[key] = val

        media_in_content = _find_media_urls(content)
        all_media_urls.update(media_in_content)

        record = {
            "id":           post_id,
            "parent_id":    parent_id,
            "title":        title,
            "slug":         slug,
            "link":         link,
            "date":         date,
            "status":       status,
            "author":       author,
            "categories":   item_cats,
            "tags":         item_tags,
            "custom_fields": custom_fields,
            "content":      content,
            "excerpt":      excerpt,
            "media_in_content": media_in_content,
        }

        if post_type == "post":
            posts.append(record)
        elif post_type == "page":
            pages.append(record)
        elif post_type == "attachment":
            record["attachment_url"] = attach_url
            if attach_url:
                all_media_urls.add(attach_url)
            attachments.append(record)
        else:
            custom_types.setdefault(post_type, []).append(record)

    # Taxonomy terms
    for cat in channel.findall("wp:category", ns):
        categories.append({
            "id":   _text(cat, "wp:term_id", ns),
            "slug": _text(cat, "wp:category_nicename", ns),
            "name": _text(cat, "wp:cat_name", ns),
            "parent": _text(cat, "wp:category_parent", ns),
        })

    for tag in channel.findall("wp:tag", ns):
        tags.append({
            "id":   _text(tag, "wp:term_id", ns),
            "slug": _text(tag, "wp:tag_slug", ns),
            "name": _text(tag, "wp:tag_name", ns),
        })

    for author_el in channel.findall("wp:author", ns):
        authors.append({
            "id":           _text(author_el, "wp:author_id", ns),
            "login":        _text(author_el, "wp:author_login", ns),
            "email":        _text(author_el, "wp:author_email", ns),
            "display_name": _text(author_el, "wp:author_display_name", ns),
        })

    summary = {
        "site_url":        site_url,
        "wp_base_url":     wp_base,
        "counts": {
            "posts":        len(posts),
            "pages":        len(pages),
            "attachments":  len(attachments),
            "categories":   len(categories),
            "tags":         len(tags),
            "authors":      len(authors),
            "custom_types": {k: len(v) for k, v in custom_types.items()},
        },
        "all_media_urls":  sorted(all_media_urls),
    }

    return {
        "summary":     summary,
        "authors":     authors,
        "categories":  categories,
        "tags":        tags,
        "posts":       posts,
        "pages":       pages,
        "attachments": attachments,
        "custom_types": custom_types,
    }


def main():
    ap = argparse.ArgumentParser(description="Parse WordPress WXR export to JSON")
    ap.add_argument("xml", help="Path to the .xml export file")
    ap.add_argument("--out", help="Output JSON path (default: print to stdout)")
    args = ap.parse_args()

    xml_path = Path(args.xml)
    if not xml_path.exists():
        sys.exit(f"ERROR: File not found: {xml_path}")

    data = parse(xml_path)

    output = json.dumps(data, indent=2, ensure_ascii=False)

    if args.out:
        out_path = Path(args.out)
        out_path.write_text(output, encoding="utf-8")
        s = data["summary"]
        print(f"Parsed: {s['counts']['posts']} posts, {s['counts']['pages']} pages, "
              f"{s['counts']['attachments']} attachments, {len(s['all_media_urls'])} media URLs")
        print(f"Written to: {out_path}")
    else:
        print(output)


if __name__ == "__main__":
    main()
