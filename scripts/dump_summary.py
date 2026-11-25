import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
lessons = json.load(open(ROOT / "all_raw_lessons.json", encoding="utf-8"))

phases = sorted(list(set(l["phase_num"] for l in lessons)))
with open(ROOT / "phases_summary.txt", "w", encoding="utf-8") as f:
    for p in phases:
        p_lessons = [l for l in lessons if l["phase_num"] == p]
        f.write(f"=== Phase {p} ({len(p_lessons)}) ===\n")
        for l in p_lessons:
            f.write(f"{l['key']}\t{l['slug']}\t{l['title']}\n")
        f.write("\n")

print("Saved phases_summary.txt")
