"""Coastal engineering assignment data: beach profiles after three storms (with eroded and
deposited volumes) and the rubble-mound breakwater design results.

Usage: python tools/data/coastal.py <Assignment 2 data.csv> <Assignment 3 v2.py>
"""
import sys
import warnings

import numpy as np
import pandas as pd
from scipy import integrate
from scipy.interpolate import interp1d

from _common import write

warnings.filterwarnings("ignore")
df = pd.read_csv(sys.argv[1])
d = pd.to_numeric(df.d, errors="coerce")


def curve(col):
    return interp1d(d, df[col], kind="cubic", fill_value="extrapolate")


xs = np.linspace(d.min(), d.max(), 61)
profiles = [[round(float(curve(c)(x)), 2) for x in xs] for c in ["f0", "f1", "f2", "f3"]]
volumes = []
for i in (1, 2, 3):
    before, after = curve("f0"), curve(f"f{i}")
    eroded = integrate.quad(lambda x: max(before(x) - after(x), 0), d.min(), d.max(), limit=200)[0]
    deposited = integrate.quad(lambda x: max(after(x) - before(x), 0), d.min(), d.max(), limit=200)[0]
    volumes.append([round(eroded), round(deposited)])

# The breakwater design script, run with the assignment's parameters
src = open(sys.argv[2], encoding="utf-8").read().replace('if __name__ == "__main__":', "if False:")
ns = {}
exec(compile(src, sys.argv[2], "exec"), ns)
p = ns["DesignParameters"](5.5, 1 / 20, 1.7, 2.0, 2.5, 8, 100, 0.4, "rough quarry stone")
r = ns["design_breakwater"](p)
write("coastal", {
    "x": [round(float(x), 1) for x in xs],
    "profiles": profiles,
    "volumes": volumes,
    "breakwater": {
        "crest": round(r.design_height, 2),
        "designWater": round(p.water_depth + p.design_high_water, 2),
        "armourTonnes": round(r.W_armour / 1000, 1),
        "armour": round(r.t_a, 2),
        "underlayer1": round(r.t_u1, 2),
        "underlayer2": round(r.t_u2, 2),
        "toe": round(r.height_toe, 2),
    },
})
