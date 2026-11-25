#!/usr/bin/env python3
"""
scripts/sync_content.py
Synchronizes lesson markdown files, quizzes, sidebar, assets, and landing page
from curriculum.json and phases/ directory to the VitePress website.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parent.parent
CURRICULUM_PATH = ROOT / "curriculum.json"
WEBSITE_DIR = ROOT / "website"
DOCS_DIR = WEBSITE_DIR / "docs"
PHASES_DOCS_DIR = DOCS_DIR / "phases"
VITEPRESS_DIR = DOCS_DIR / ".vitepress"
SIDEBAR_PATH = VITEPRESS_DIR / "sidebar.ts"
QUIZZES_DIR = DOCS_DIR / "public" / "quizzes"
LESSONS_ASSETS_DIR = DOCS_DIR / "public" / "lessons-assets"
INDEX_PATH = DOCS_DIR / "index.md"
HOME_TEMPLATE_PATH = WEBSITE_DIR / "home.template.md"

ALLOWED_TAG_NAMES = {
    "a", "b", "i", "strong", "em", "code", "pre", "span", "div", "p", "br", "hr",
    "img", "table", "thead", "tbody", "tr", "th", "td", "ul", "ol", "li",
    "blockquote", "details", "summary", "sub", "sup", "mark", "svg", "path",
    "kbd", "var", "homestats", "roadmappreview", "startfromyourlevel", "phasebadge"
}


def sanitize_markdown(content: str, p_id: str, l_slug: str) -> str:
    """
    Escapes pseudo-HTML tags and math operators (<think>, <=, <1, <image>) outside
    code blocks, and rewrites relative asset paths to public static URLs.
    """
    # 1. Rewrite relative image asset links
    content = re.sub(
        r'\(\.\./assets/([^)]+)\)',
        f'(/lessons-assets/{p_id}/{l_slug}/\\1)',
        content
    )
    content = re.sub(
        r'\(\./assets/([^)]+)\)',
        f'(/lessons-assets/{p_id}/{l_slug}/\\1)',
        content
    )

    def clean_prose(text: str) -> str:
        def tag_replacer(match: re.Match[str]) -> str:
            full = match.group(0)
            if full.startswith("<!--"):
                return full
            tag_match = re.match(r"^</?([a-zA-Z0-9_-]+)", full)
            if tag_match:
                tag_name = tag_match.group(1).lower()
                if tag_name in ALLOWED_TAG_NAMES:
                    return full
            return full.replace("<", "&lt;").replace(">", "&gt;")

        text = re.sub(r"<!--.*?-->|<[^>\n]+>", tag_replacer, text)
        text = re.sub(r"<(?=[=<0-9\-])", "&lt;", text)
        return text

    lines = content.splitlines(keepends=True)
    in_code = False
    result: List[str] = []

    for line in lines:
        if line.strip().startswith("```"):
            in_code = not in_code
            result.append(line)
            continue
        if in_code:
            result.append(line)
            continue

        parts = re.split(r"(`[^`\n]+`)", line)
        for i in range(0, len(parts), 2):
            parts[i] = clean_prose(parts[i])
        result.append("".join(parts))

    return "".join(result)


def merge_frontmatter(content: str, meta: Dict[str, Any], p_id: str, l_slug: str) -> str:
    """
    Extract existing frontmatter if present, merge with provided metadata,
    and return the updated document string.
    """
    body = content
    existing_meta: Dict[str, Any] = {}

    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            raw_fm = parts[1]
            body = parts[2].lstrip("\r\n")
            for line in raw_fm.splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k:
                        existing_meta[k] = v

    merged = {**existing_meta, **meta}
    fm_lines = ["---"]
    for key, val in merged.items():
        if isinstance(val, bool):
            val_str = "true" if val else "false"
        elif isinstance(val, (int, float)):
            val_str = str(val)
        else:
            escaped = str(val).replace("\\", "\\\\").replace('"', '\\"')
            val_str = f'"{escaped}"'
        fm_lines.append(f"{key}: {val_str}")
    fm_lines.append("---")
    fm_lines.append("")

    sanitized_body = sanitize_markdown(body, p_id, l_slug)
    return "\n".join(fm_lines) + sanitized_body


def copy_lesson_assets(source_lesson_dir: Path, p_id: str, l_slug: str, dry_run: bool) -> None:
    """
    Copies diagram and image assets from lesson directory to public assets directory.
    """
    assets_src = source_lesson_dir / "assets"
    if not assets_src.exists() or not assets_src.is_dir():
        return

    target_assets_dir = LESSONS_ASSETS_DIR / p_id / l_slug
    if not dry_run:
        target_assets_dir.mkdir(parents=True, exist_ok=True)
        for item in assets_src.iterdir():
            if item.is_file():
                shutil.copy2(item, target_assets_dir / item.name)


def copy_lessons(
    curriculum: Dict[str, Any],
    docs_dir: Path,
    phase_filter: Optional[str],
    dry_run: bool,
    warnings: List[str]
) -> int:
    """
    Copies every lesson docs/en.md to website/docs/phases/<phaseId>/<lessonSlug>.md
    with added YAML frontmatter and synchronized assets.
    """
    copied_count = 0
    phases = curriculum.get("phases", [])

    for p in phases:
        p_id = str(p.get("id", "")).zfill(2)
        if phase_filter and p_id != phase_filter.zfill(2):
            continue

        p_name_ar = p.get("nameAr", "")
        p_target_dir = docs_dir / p_id
        lessons_in_phase = p.get("lessons", [])
        phase_lesson_count = len(lessons_in_phase)
        if not dry_run:
            p_target_dir.mkdir(parents=True, exist_ok=True)

        for idx, lesson in enumerate(lessons_in_phase, start=1):
            l_id = str(lesson.get("id", "")).zfill(2)
            l_slug = lesson.get("slug", "")
            source_rel_path = lesson.get("path", "")
            source_file = ROOT / source_rel_path

            if not source_file.exists():
                warnings.append(f"Missing doc file: {source_rel_path}")
                continue

            lesson_dir = source_file.parent.parent
            copy_lesson_assets(lesson_dir, p_id, l_slug, dry_run)

            target_file = p_target_dir / f"{l_slug}.md"
            raw_content = source_file.read_text(encoding="utf-8")
            word_count = len(re.findall(r"\S+", raw_content))
            reading_minutes = max(1, round(word_count / 200))

            fm_meta = {
                "title": lesson.get("title", ""),
                "titleAr": lesson.get("titleAr", ""),
                "phase": p_id,
                "phaseAr": p_name_ar,
                "lessonId": l_id,
                "lessonSlug": l_slug,
                "sourcePath": source_rel_path,
                "hasQuiz": lesson.get("hasQuiz", False),
                "hasCode": lesson.get("hasCode", False),
                "order": idx,
                "phaseLessonCount": phase_lesson_count,
                "wordCount": word_count,
                "readingMinutes": reading_minutes,
            }

            merged_doc = merge_frontmatter(raw_content, fm_meta, p_id, l_slug)
            if not dry_run:
                target_file.write_text(merged_doc, encoding="utf-8")
            copied_count += 1

    return copied_count


def generate_sidebar(
    curriculum: Dict[str, Any],
    sidebar_path: Path,
    dry_run: bool
) -> Tuple[int, int]:
    """
    Generates website/docs/.vitepress/sidebar.ts as a multi-sidebar config:
    one key per phase, so each page only renders its own phase (20 sections,
    435 lesson links total). This keeps build output small and fast.
    """
    phases = sorted(curriculum.get("phases", []), key=lambda x: str(x.get("id", "")))
    section_count = len(phases)
    total_items = 0

    lines: List[str] = [
        "// هذا الملف مولّد تلقائيًا — لا تعدّله يدويًا",
        "export default {",
    ]

    for p in phases:
        p_id = str(p.get("id", "")).zfill(2)
        p_name_ar = p.get("nameAr", "").replace("'", "\\'")
        lessons = sorted(p.get("lessons", []), key=lambda x: str(x.get("id", "")))

        lines.append(f"  '/phases/{p_id}/': [")
        lines.append("    {")
        lines.append(f"      text: '{p_id} — {p_name_ar}',")
        lines.append("      collapsed: false,")
        lines.append(
            f"      meta: {{ phaseId: '{p_id}', lessonCount: {len(lessons)} }},"
        )
        lines.append("      items: [")

        for lesson in lessons:
            total_items += 1
            l_id = str(lesson.get("id", "")).zfill(2)
            l_slug = lesson.get("slug", "")
            l_title_ar = lesson.get("titleAr", "").replace("'", "\\'")
            link = f"/phases/{p_id}/{l_slug}"
            has_quiz = "true" if lesson.get("hasQuiz") else "false"
            lines.append(
                f"        {{ text: '{l_id}. {l_title_ar}', link: '{link}', "
                f"meta: {{ phaseId: '{p_id}', lessonId: '{l_id}', hasQuiz: {has_quiz} }} }},"
            )

        lines.append("      ]")
        lines.append("    }")
        lines.append("  ],")

    lines.append("};")
    lines.append("")

    content = "\n".join(lines)
    if not dry_run:
        sidebar_path.parent.mkdir(parents=True, exist_ok=True)
        sidebar_path.write_text(content, encoding="utf-8")

    return section_count, total_items


def copy_quizzes(
    curriculum: Dict[str, Any],
    quizzes_dir: Path,
    phase_filter: Optional[str],
    dry_run: bool,
    warnings: List[str]
) -> int:
    """
    Copies quiz.json files to website/docs/public/quizzes/<phaseId>-<lessonId>.json
    preventing ID collisions across phases. Validates JSON syntax.
    """
    copied_count = 0
    if not dry_run:
        quizzes_dir.mkdir(parents=True, exist_ok=True)

    for p in curriculum.get("phases", []):
        p_id = str(p.get("id", "")).zfill(2)
        if phase_filter and p_id != phase_filter.zfill(2):
            continue

        for lesson in p.get("lessons", []):
            l_id = str(lesson.get("id", "")).zfill(2)
            doc_path = Path(lesson.get("path", ""))
            lesson_dir = ROOT / doc_path.parent.parent
            quiz_src = lesson_dir / "quiz.json"

            if not quiz_src.exists():
                continue

            target_quiz = quizzes_dir / f"{p_id}-{l_id}.json"
            try:
                raw_text = quiz_src.read_text(encoding="utf-8")
                json.loads(raw_text)
                if not dry_run:
                    target_quiz.write_text(raw_text, encoding="utf-8")
                copied_count += 1
            except Exception as e:
                warnings.append(f"Corrupted quiz.json in {lesson_dir}: {e}")

    return copied_count


def generate_index(index_path: Path, dry_run: bool) -> None:
    """
    Copies the hand-authored homepage template into website/docs/index.md.
    The template contains the custom Hero/Stats/Features components and the
    lazy-loaded lower sections. Keeping it in a separate file means running
    this sync script never overwrites the custom homepage with an old layout.
    """
    if not HOME_TEMPLATE_PATH.exists():
        raise FileNotFoundError(
            f"Homepage template not found: {HOME_TEMPLATE_PATH}"
        )

    content = HOME_TEMPLATE_PATH.read_text(encoding="utf-8")
    if not dry_run:
        index_path.parent.mkdir(parents=True, exist_ok=True)
        index_path.write_text(content, encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Sync curriculum content into VitePress website docs."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate the sync process without writing any files."
    )
    parser.add_argument(
        "--phase",
        type=str,
        default=None,
        help="Process only a single phase ID (e.g. 00, 01, 14)."
    )
    return parser.parse_args()


def main() -> None:
    # Ensure Arabic/emoji output works on Windows consoles (cp1252 by default).
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    args = parse_args()
    start_time = time.perf_counter()
    warnings: List[str] = []

    if not CURRICULUM_PATH.exists():
        print(f"Error: {CURRICULUM_PATH} does not exist. Run generate_curriculum.py first.")
        sys.exit(1)

    with open(CURRICULUM_PATH, "r", encoding="utf-8") as f:
        curriculum = json.load(f)

    # 1. Copy lessons and assets
    copied_lessons = copy_lessons(
        curriculum, PHASES_DOCS_DIR, args.phase, args.dry_run, warnings
    )

    # 2. Generate sidebar
    sections, items = generate_sidebar(curriculum, SIDEBAR_PATH, args.dry_run)

    # 3. Copy quizzes
    copied_quizzes = copy_quizzes(
        curriculum, QUIZZES_DIR, args.phase, args.dry_run, warnings
    )

    # 4. Generate index.md
    generate_index(INDEX_PATH, args.dry_run)

    # Copy curriculum.json to public for client-side access
    if not args.dry_run:
        public_curriculum = DOCS_DIR / "public" / "curriculum.json"
        public_curriculum.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(CURRICULUM_PATH, public_curriculum)
        # Generate lightweight curriculum-summary.json for theme components
        theme_dir = VITEPRESS_DIR / "theme"
        theme_dir.mkdir(parents=True, exist_ok=True)
        phases_list = curriculum.get("phases", [])
        total_l = sum(len(p.get("lessons", [])) for p in phases_list)
        total_q = sum(sum(1 for l in p.get("lessons", []) if l.get("hasQuiz")) for p in phases_list)
        total_c = sum(sum(1 for l in p.get("lessons", []) if l.get("hasCode")) for p in phases_list)
        summary = {
            "stats": {
                "totalPhases": len(phases_list),
                "totalLessons": total_l,
                "totalQuizzes": total_q,
                "totalCode": total_c
            },
            "phases": [
                {
                    "id": p["id"],
                    "name": p["name"],
                    "nameAr": p["nameAr"],
                    "descriptionAr": p.get("descriptionAr", ""),
                    "lessonCount": len(p.get("lessons", [])),
                    "firstLessonSlug": p["lessons"][0]["slug"] if p.get("lessons") else "01-intro",
                    "firstLessonTitleAr": p["lessons"][0]["titleAr"] if p.get("lessons") else ""
                }
                for p in phases_list
            ]
        }
        with open(theme_dir / "curriculum-summary.json", "w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)

    elapsed = time.perf_counter() - start_time

    # Print summary
    dry_tag = " [DRY-RUN]" if args.dry_run else ""
    print("═" * 44)
    print(f"✅ تم نسخ {copied_lessons} ملف درس.{dry_tag}")
    print(f"✅ تم توليد sidebar.ts ({sections} قسمًا، {items} عنصرًا).{dry_tag}")
    print(f"✅ تم نسخ {copied_quizzes} ملف quiz.{dry_tag}")
    print(f"✅ تم توليد index.md.{dry_tag}")
    print(f"⚠️  تحذيرات: {len(warnings)}")
    for w in warnings:
        print(f"   - {w}")
    print(f"⏱️  الوقت المستغرق: {elapsed:.2f} ثانية.")
    print("═" * 44)


if __name__ == "__main__":
    main()
