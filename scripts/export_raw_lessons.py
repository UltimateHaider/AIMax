import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

with open(ROOT / "catalog.json", "r", encoding="utf-8") as f:
    catalog = json.load(f)

lessons = []
for p in catalog["phases"]:
    for l in p["lessons"]:
        lessons.append({
            "key": f"{p['num']:02d}-{l['num']:02d}",
            "phase_num": f"{p['num']:02d}",
            "lesson_num": f"{l['num']:02d}",
            "slug": l["slug"],
            "title": l["title"]
        })

with open(ROOT / "all_raw_lessons.json", "w", encoding="utf-8") as f:
    json.dump(lessons, f, ensure_ascii=False, indent=2)

print(f"Exported {len(lessons)} lessons.")
