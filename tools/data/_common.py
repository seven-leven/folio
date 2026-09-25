"""Shared helpers for the data scripts: where to write, and how."""
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "site" / "assets" / "data"


def write(name: str, data) -> None:
    """Write site/assets/data/<name>.json compactly and say where it went."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / f"{name}.json"
    path.write_text(json.dumps(data, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(DATA_DIR.parents[2])} ({path.stat().st_size:,} bytes)")
