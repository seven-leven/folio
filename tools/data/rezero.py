"""Re:Zero light novel release dates (Japan, English) from Wikipedia, with a linear fit of
the English release date against volume number.

Usage: python tools/data/rezero.py
"""
import io

import numpy as np
import pandas as pd
import requests

from _common import write

URL = "https://en.wikipedia.org/wiki/List_of_Re:Zero_volumes"
html = requests.get(URL, headers={"User-Agent": "folio-data/1.0"}, timeout=30).text
df = pd.read_html(io.StringIO(html))[0].iloc[:, :4]
df.columns = ["no", "jp", "isbn", "en"]
df = df[pd.to_numeric(df.no, errors="coerce").notna()].copy()
df["no"] = df.no.astype(int)


def clean(s):
    s = s.astype(str).str.partition("[")[0].str.partition(" (")[0].replace({"—": None, "nan": None})
    return pd.to_datetime(s, errors="coerce")


df["jp"], df["en"] = clean(df.jp), clean(df.en)
df = df.drop_duplicates("no").sort_values("no")


def year(d):
    return round(d.year + (d.dayofyear - 1) / 365.25, 3)


jp = [year(d) for d in df.jp]
en = [year(d) for d in df.en if pd.notna(d)]
slope, intercept = np.polyfit(np.arange(len(en)), en, 1)  # English date against volume index
pred = intercept + slope * np.arange(len(en))
r2 = 1 - np.sum((np.array(en) - pred) ** 2) / np.sum((np.array(en) - np.mean(en)) ** 2)
write("rezero", {
    "jp": jp,
    "en": en,
    "fit": [round(float(intercept), 4), round(float(slope), 4)],
    "r2": round(float(r2), 4),
    "fetched": pd.Timestamp.today().strftime("%Y-%m"),
})
