"""Wind roses per year and the average wind for each week of the year.

Usage: python tools/data/wind.py <data1_clean.csv>   (columns: date, x_dir = u, y_dir = v)
"""
import sys

import numpy as np
import pandas as pd

from _common import write

df = pd.read_csv(sys.argv[1])
df["date"] = pd.to_datetime(df.date)
u, v = df.x_dir.values, df.y_dir.values
came_from = (np.degrees(np.arctan2(-u, -v)) + 360) % 360  # meteorological: where it blows from
df["sector"] = ((came_from + 11.25) // 22.5).astype(int) % 16
years = sorted(df.date.dt.year.unique())
rose = [np.bincount(df[df.date.dt.year == y].sector, minlength=16).tolist() for y in years]
df["week"] = ((df.date.dt.dayofyear - 1) // 7).clip(upper=51)
weekly = df.groupby("week")[["x_dir", "y_dir"]].mean()
week = [[round(float((np.degrees(np.arctan2(-a, -b)) + 360) % 360)), round(float(np.hypot(a, b)), 2)]
        for a, b in zip(weekly.x_dir, weekly.y_dir)]
write("wind", {"firstYear": int(years[0]), "rose": rose, "week": week})
