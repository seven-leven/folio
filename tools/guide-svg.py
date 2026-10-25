"""Turns docs/design-manifesto.pdf (written by npm run guide) into a vector
docs/design-manifesto.svg, text as outlines so it needs no fonts installed.

Needs PyMuPDF (pip install pymupdf). Run: python tools/guide-svg.py
"""

from pathlib import Path

import fitz

docs = Path(__file__).resolve().parent.parent / "docs"
pdf = fitz.open(docs / "design-manifesto.pdf")
svg = pdf[0].get_svg_image(text_as_path=True)
(docs / "design-manifesto.svg").write_text(svg, encoding="utf-8")
print(f"Wrote {docs / 'design-manifesto.svg'} ({len(svg) // 1024} KB)")
