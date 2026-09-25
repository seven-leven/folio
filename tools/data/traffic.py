"""Benchmark every version of the traffic model function (average of 10,000 runs each).

Usage: python tools/data/traffic.py <path to Traffic.py>
Versions are listed in the order they were written: v1 is mine, the last is the newest.
"""
import importlib.util
import sys

from _common import write

spec = importlib.util.spec_from_file_location("traffic", sys.argv[1])
t = importlib.util.module_from_spec(spec)
spec.loader.exec_module(t)
funcs = [t.old, t.new, t.newer, t.newer3, t.newer4, t.newer5, t.newer6, t.newer7, t.newer8,
         t.newer9, t.newer10, t.newer11, t.newer12, t.newer13, t.mog_generic, t.mog_unrolled]
args = (t.num_regions, t.NUM_ITERATIONS, t.traffic_origin, t.traffic_destination, t.traffic_flow)
expected = t.old(*args)
runs = []
for i, f in enumerate(funcs):
    correct = t.validate_results(f, args, expected)
    timings = t.benchmark_function(f, args, 10_000, 100)
    label = "v1 · mine" if i == 0 else f"v{i + 1} · latest" if i == len(funcs) - 1 else f"v{i + 1}"
    runs.append([label, round(sum(timings) / len(timings) * 1e6, 1), not correct])
write("traffic", {"runs": runs})
