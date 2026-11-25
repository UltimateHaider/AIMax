#!/usr/bin/env python3
"""
scripts/generate_sitemap.py

Builds website/docs/public/sitemap.xml and robots.txt from curriculum.json.
The sitemap covers the home page, roadmap, about page, the 20 phase
overview pages, and all 435 lesson pages using VitePress clean URLs.

Usage:
    python3 scripts/generate_sitemap.py
    SITE_URL=https://example.com python3 scripts/generate_sitemap.py
    python3 scripts/generate_sitemap.py --strict

--strict fails when a lesson or phase page referenced by curriculum.json
does not exist, which prevents publishing 404 URLs in the sitemap.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
CURRICULUM_PATH = ROOT / "curriculum.json"
DOCS_DIR = ROOT / "website" / "docs"
PUBLIC_DIR = DOCS_DIR / "public"
SITEMAP_PATH = PUBLIC_DIR / "sitemap.xml"
ROBOTS_PATH = PUBLIC_DIR / "robots.txt"

DEFAULT_SITE_URL = "https://aiengineeringfromscratch.com"
STATIC_PAGES = (
    # path, source file, changefreq, priority
    ("/", "index.md", "weekly", "1.0"),
    ("/roadmap", "roadmap.md", "monthly", "0.9"),
    ("/about", "about.md", "yearly", "0.4"),
)


def normalize_base_url(raw: str) -> str:
    value = (raw or DEFAULT_SITE_URL).strip().rstrip("/")
    if not re.match(r"^https?://[^/]+", value):
        raise ValueError(f"SITE_URL must start with http:// or https:// (got: {value!r})")
    return value


def file_lastmod(path: Path) -> str:
    if not path.exists():
        return date.today().isoformat()
    return datetime.fromtimestamp(path.stat().st_mtime).date().isoformat()


def lesson_url(phase_id: str, slug: str) -> str:
    return f"/phases/{phase_id}/{slug}"


def phase_url(phase_id: str) -> str:
    # VitePress renders phases/<id>/index.md as /phases/<id>/ with clean URLs.
    return f"/phases/{phase_id}/"


def collect_entries(curriculum: dict[str, Any], strict: bool) -> tuple[list[tuple[str, str, str, str]], list[str]]:
    entries: list[tuple[str, str, str, str]] = []
    problems: list[str] = []
    seen: set[str] = set()

    for path, source, changefreq, priority in STATIC_PAGES:
        source_path = DOCS_DIR / source
        if not source_path.exists():
            problems.append(f"missing static page source: {source}")
            if strict:
                continue
        entries.append((path, file_lastmod(source_path), changefreq, priority))
        seen.add(path)

    phases = curriculum.get("phases", [])
    for phase in phases:
        phase_id = str(phase.get("id", "")).zfill(2)
        page_file = DOCS_DIR / "phases" / phase_id / "index.md"
        if not page_file.exists():
            problems.append(f"missing phase page: {page_file.relative_to(ROOT)}")
        else:
            entry = phase_url(phase_id)
            if entry not in seen:
                entries.append((entry, file_lastmod(page_file), "monthly", "0.8"))
                seen.add(entry)

        for lesson in phase.get("lessons", []):
            slug = str(lesson.get("slug", "")).strip()
            if not slug:
                problems.append(f"phase {phase_id}: lesson without slug")
                continue
            page_file = DOCS_DIR / "phases" / phase_id / f"{slug}.md"
            if not page_file.exists():
                problems.append(f"missing lesson page: {page_file.relative_to(ROOT)}")
                continue
            entry = lesson_url(phase_id, slug)
            if entry in seen:
                problems.append(f"duplicate URL: {entry}")
                continue
            entries.append((entry, file_lastmod(page_file), "monthly", "0.7"))
            seen.add(entry)

    return entries, problems


def render_sitemap(base_url: str, entries: list[tuple[str, str, str, str]]) -> str:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for path, lastmod, changefreq, priority in entries:
        loc = f"{base_url}{path}"
        lines.extend(
            [
                "  <url>",
                f"    <loc>{escape(loc)}</loc>",
                f"    <lastmod>{lastmod}</lastmod>",
                f"    <changefreq>{changefreq}</changefreq>",
                f"    <priority>{priority}</priority>",
                "  </url>",
            ]
        )
    lines.append("</urlset>")
    lines.append("")
    return "\n".join(lines)


def render_robots(base_url: str) -> str:
    return "\n".join(
        [
            "# Search engines and AI crawlers are welcome.",
            "User-agent: *",
            "Allow: /",
            "",
            f"Sitemap: {base_url}/sitemap.xml",
            "",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate sitemap.xml and robots.txt")
    parser.add_argument("--strict", action="store_true", help="fail if a referenced page is missing")
    parser.add_argument(
        "--base-url",
        default=os.environ.get("SITE_URL", DEFAULT_SITE_URL),
        help="canonical site origin (default: env SITE_URL or %s)" % DEFAULT_SITE_URL,
    )
    args = parser.parse_args()

    if not CURRICULUM_PATH.exists():
        print(f"ERROR: missing curriculum: {CURRICULUM_PATH}", file=sys.stderr)
        return 1

    try:
        base_url = normalize_base_url(args.base_url)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    curriculum = json.loads(CURRICULUM_PATH.read_text(encoding="utf-8"))
    entries, problems = collect_entries(curriculum, strict=args.strict)

    if problems:
        print("Sitemap warnings:", file=sys.stderr)
        for problem in problems:
            print(f"  - {problem}", file=sys.stderr)
        if args.strict:
            return 1

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    SITEMAP_PATH.write_text(render_sitemap(base_url, entries), encoding="utf-8", newline="\n")
    ROBOTS_PATH.write_text(render_robots(base_url), encoding="utf-8", newline="\n")

    lesson_count = sum(len(phase.get("lessons", [])) for phase in curriculum.get("phases", []))
    phase_count = len(curriculum.get("phases", []))
    print(f"Base URL: {base_url}")
    print(f"Sitemap: {len(entries)} URLs ({lesson_count} lessons, {phase_count} phases, {len(STATIC_PAGES)} static)")
    print(f"  -> {SITEMAP_PATH}")
    print(f"Robots: -> {ROBOTS_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
