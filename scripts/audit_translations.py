import json
import re

d = json.load(open(r'C:\Users\Ultim\.gemini\antigravity\scratch\ai-engineering-from-scratch\curriculum.json', encoding='utf-8'))
has_arabic = lambda s: bool(re.search(r'[\u0600-\u06FF]', s))
no_arabic = []
partial = []

for p in d['phases']:
    for l in p['lessons']:
        tar = l.get('titleAr', '')
        if not has_arabic(tar):
            no_arabic.append((p['id'], l['id'], l['title'], tar))
        elif re.search(r'[a-zA-Z]{4,}', tar):
            partial.append((p['id'], l['id'], l['title'], tar))

print(f"Total phases: {len(d['phases'])}")
print(f"Total lessons: {sum(len(p['lessons']) for p in d['phases'])}")
print(f"Titles with NO Arabic characters: {len(no_arabic)}")
if no_arabic:
    print("Samples of completely untranslated:")
    for x in no_arabic[:10]:
        print(f"  [{x[0]}-{x[1]}] {x[2]}")

print(f"\nTitles with some remaining English words (technical acronyms/terms): {len(partial)}")
if partial:
    print("Samples of partial:")
    for x in partial[:10]:
        print(f"  [{x[0]}-{x[1]}] {x[2]} -> {x[3]}")
