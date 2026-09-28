"""Professional work map: counts projects per atoll from the project register and writes them
into the homepage map, legend and stats (site/index.html).

Usage: python tools/data/professional.py "<Project Register (standardised).xlsx>"

- Counts projects marked "In Your Tenure" = Yes on the "Project Register" sheet.
- Places each one with tools/data/professional-places.json (edit that to place more).
- Greater Malé is split into areas: Malé wards from the building prefix (H. Henveiru,
  G. Galolhu, M. Machchangolhi, Ma. Maafannu); Hulhumalé phases from 5-digit lot numbers
  (1xxxx Phase 1, 2xxxx Phase 2); S-prefixed lots (e.g. "S8 G14") and 3xxxx lots are Thilafushi plots.
- A project on several islands counts once per atoll it reaches, and once in the total.
- Prints everything it couldn't place, so the register or the places file can be fixed.
"""
import collections
import json
import re
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / "site" / "index.html"
PLACES = json.loads((Path(__file__).parent / "professional-places.json").read_text(encoding="utf-8"))

ATOLLS = ["Haa Alif", "Haa Dhaalu", "Shaviyani", "Noonu", "Raa", "Lhaviyani", "Baa", "Kaafu", "Malé",
          "Alif Alif", "Alif Dhaal", "Vaavu", "Faafu", "Meemu", "Dhaalu", "Thaa", "Laamu",
          "Gaafu Alif", "Gaafu Dhaalu", "Gnaviyani", "Addu"]
MALE_AREAS = ["Henveiru", "Galolhu", "Machchangolhi", "Maafannu", "Malé, ward not recorded",
              "Hulhumalé Phase 1", "Hulhumalé Phase 2", "Hulhumalé, phase not recorded",
              "Villimalé", "Thilafushi", "Hulhulé"]
WARDS = {"H": "Henveiru", "G": "Galolhu", "M": "Machchangolhi", "Ma": "Maafannu"}


def male_area(island, project):
    if island == "Malé":
        m = re.match(r"^(Ma|H|G|M)[\s.]+\S", project)
        return WARDS[m.group(1)] if m else "Malé, ward not recorded"
    if island == "Hulhumalé":
        lot = re.search(r"\b([12])\d{4}\b", project)
        return f"Hulhumalé Phase {lot.group(1)}" if lot else "Hulhumalé, phase not recorded"
    return island


wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
rows = [r for r in wb["Project Register"].iter_rows(min_row=2, values_only=True) if r[0] is not None]
mine = [r for r in rows if r[12] == "Yes"]

per_atoll = collections.Counter()
areas = collections.Counter()
islands = set()
unplaced = []
unclear_male = []
for r in mine:
    project, location = str(r[2]).strip(), r[4]
    override = PLACES["projects"].get(project, {})
    if "sites" in override:
        sites = override["sites"]
    else:
        place = dict(PLACES["locations"].get(location, {"atoll": None, "note": f"unknown location {location!r}"}))
        # S-prefixed and 3xxxx lots are Thilafushi plots, whatever the register says
        if place.get("island") == "Hulhumalé" and (re.match(r"^(Lot )?S\d", project) or re.search(r"(?<!\d)3\d{4}(?!\d)", project)):
            place = {"atoll": "Malé", "island": "Thilafushi"}
        place.update({k: v for k, v in override.items() if k in ("atoll", "island", "area")})
        sites = [place]
    placed = [s for s in sites if s.get("atoll")]
    if not placed:
        unplaced.append((project, r[1], sites[0].get("note", "")))
        continue
    for atoll in {s["atoll"] for s in placed}:
        per_atoll[atoll] += 1
    for s in placed:
        if s.get("island"):
            islands.add(s["island"])
        if s["atoll"] == "Malé":
            area = s.get("area") or male_area(s.get("island", "Hulhumalé"), project)
            areas[area] += 1
            if "not recorded" in area:
                unclear_male.append((area, project))

total = len(mine)
placed_total = total - len(unplaced)
atolls_with_work = sum(1 for a in ATOLLS if per_atoll[a])

# --- Write into index.html --------------------------------------------------------------
html = INDEX.read_text(encoding="utf-8")
fmt = lambda n: str(n) if n else "–"
for atoll in ATOLLS:
    html, n = re.subn(
        rf'(<g class="pm-marker[^"]*" data-atoll="{atoll}">.*?<text class="pm-count"[^>]*>)[^<]*(</text>)',
        rf"\g<1>{fmt(per_atoll[atoll])}\g<2>", html)
    assert n == 1, atoll
    html, n = re.subn(rf'(<li(?: class="[^"]*")?><span>{atoll}</span><b>)[^<]*(</b>)',
                      rf"\g<1>{fmt(per_atoll[atoll])}\g<2>", html)
    assert n == 1, atoll
    # Dim atolls with no work yet
    html = re.sub(rf'<g class="pm-marker( pm-marker--male)?( pm-marker--none)?" data-atoll="{atoll}">',
                  lambda m: f'<g class="pm-marker{m.group(1) or ""}{"" if per_atoll[atoll] else " pm-marker--none"}" data-atoll="{atoll}">',
                  html)

# Greater Malé breakdown under its legend row
sub = "".join(f'<li><span>{a}</span><b>{areas[a]}</b></li>' for a in MALE_AREAS if areas[a])
html, n = re.subn(r'(<li class="is-male"><span>Malé</span><b>[^<]*</b>)(?:<ul class="pro-legend__sub">.*?</ul>)?(</li>)',
                  rf'\g<1><ul class="pro-legend__sub">{sub}</ul>\g<2>', html)
assert n == 1

stats = (f'<div><dt>{total}</dt><dd>Projects</dd></div>\n'
         f'                        <div><dt>{atolls_with_work}</dt><dd>Atolls</dd></div>\n'
         f'                        <div><dt>{len(islands)}</dt><dd>Islands</dd></div>')
html, n = re.subn(r'<div><dt>[^<]*</dt><dd>Projects</dd></div>\s*<div><dt>[^<]*</dt><dd>Atolls</dd></div>\s*'
                  r'<div><dt>[^<]*</dt><dd>Islands</dd></div>', stats, html)
assert n == 1
html, n = re.subn(r'(<p class="section-intro" data-pro-intro>)[^<]*(</p>)',
                  rf"\g<1>{total} projects since 2023, counted by atoll. Most are in Greater Malé ({per_atoll['Malé']}), "
                  rf"broken down by ward and phase in the list.\g<2>", html)
assert n == 1
reasons = sorted({why for _, _, why in unplaced})
listed = ", ".join(reasons[:-1]) + (" and " if len(reasons) > 1 else "") + reasons[-1] if reasons else ""
note = f"Not on the map yet ({len(unplaced)}): {listed}." if unplaced else ""
html, n = re.subn(r'(<p class="pro-note" data-pro-note>)[^<]*(</p>)', rf"\g<1>{note}\g<2>", html)
assert n == 1
INDEX.write_text(html, encoding="utf-8", newline="\n")

# --- Report ------------------------------------------------------------------------------
print(f"{total} projects in tenure ({len(rows) - total} outside it skipped); {placed_total} placed, "
      f"{atolls_with_work} atolls, {len(islands)} islands.")
for a in ATOLLS:
    if per_atoll[a]:
        print(f"  {per_atoll[a]:3d}  {a}")
print("Greater Malé:")
for a in MALE_AREAS:
    if areas[a]:
        print(f"  {areas[a]:3d}  {a}")
print(f"\nNot placed ({len(unplaced)}):")
for p, c, why in unplaced:
    print(f"  - {p}  [{c}]  {why}")
print(f"\nGreater Malé area not recorded ({len(unclear_male)}):")
for a, p in unclear_male:
    print(f"  - {p}  ({a})")
