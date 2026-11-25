import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from translations_data import LESSON_TRANSLATIONS

with open(ROOT / "catalog.json", "r", encoding="utf-8") as f:
    catalog = json.load(f)

print(f"Total entries in translation dictionary: {len(LESSON_TRANSLATIONS)}")

missing = []
total_lessons = 0
for p in catalog["phases"]:
    for l in p["lessons"]:
        total_lessons += 1
        key = f"{p['num']:02d}-{l['num']:02d}"
        if key not in LESSON_TRANSLATIONS:
            missing.append((key, l["title"]))

print(f"Total catalog lessons: {total_lessons}")
print(f"Missing from translations: {len(missing)}")
if missing:
    print("Missing list:")
    for k, t in missing:
        print(f"  {k}: {t}")
else:
    print("PERFECT: Every single one of the 435 lessons is explicitly translated in the dictionary!")
