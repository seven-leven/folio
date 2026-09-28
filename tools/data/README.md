# Data for the Coding timeline

Each script here regenerates one file in `site/assets/data/`, which the matching animation in
`site/assets/js/coding/visuals/` loads. The sources are personal archives that aren't in this repo; the table says where
each one lives.

Run from the repo root, for example `python tools/data/anime.py path/to/export.xml`. The scripts need Python 3 with
numpy, pandas, scipy, scikit-learn and requests (and torch for `titanic.py`).

| Script       | Writes         | Source                                                                                                             |
| ------------ | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `anime.py`   | `anime.json`   | a MyAnimeList XML export (Profile, then Export)                                                                    |
| `traffic.py` | `traffic.json` | `D:\Backups\Coding\traffic-simulation\Traffic.py` (runs the benchmark, so timings vary a little)                   |
| `wind.py`    | `wind.json`    | `D:\Backups\Coding\wind-data\data1_clean.csv`                                                                      |
| `coup.py`    | `coup.json`    | `D:\Backups\Coding\coup-rank\matches_all.csv` (names are replaced with letters)                                    |
| `rezero.py`  | `rezero.json`  | Wikipedia, fetched live                                                                                            |
| `coastal.py` | `coastal.json` | `D:\Backups\studies\2023 Term II\BES 409 - Costal Engineering\`: `Assignement 2\data.csv` and `assignment 3\v2.py` |
| `titanic.py` | `titanic.json` | `D:\Backups\Coding\titanic-ml-kaggle`                                                                              |

## Professional map

`professional.py` is different: it reads the work project register (Excel) and writes the per-atoll counts, the Greater
Malé breakdown and the stats straight into the map section of `site/index.html`. Locations are placed with
`professional-places.json`: add a register location there, or override a single project by its exact name (`sites` for
several islands, `area` for a Malé ward or Hulhumalé phase). The script prints anything it couldn't place.

```
python tools/data/professional.py "C:\Users\gaahi\Desktop\Ixp\Project Progress\Project Register (standardised).xlsx"
```

When a script's numbers change, update any figures quoted in the timeline text in `site/index.html` to match (for
example the anime totals, or the benchmark speed-up).
