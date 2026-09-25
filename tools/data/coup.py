"""Elo ratings after each Coup game, with names replaced by letters.

Usage: python tools/data/coup.py <matches_all.csv>   (each row: players in finishing order)
Players with at least 7 games are kept, lettered A, B, C... by final rating.
"""
import collections
import csv
import sys

from _common import write

K, BASE, MIN_GAMES = 32, 1000, 7
rows = [[p.strip() for p in r if p.strip()] for r in csv.reader(open(sys.argv[1], encoding="utf8"))]
names = sorted({p for r in rows for p in r})
rating = {p: float(BASE) for p in names}
history = {p: [BASE] for p in names}
games = collections.Counter()
for row in rows:
    games.update(row)
    for i in range(len(row)):  # each finishing order is a set of head-to-head results
        for j in range(i + 1, len(row)):
            a, b = row[i], row[j]
            expected = 1 / (1 + 10 ** ((rating[b] - rating[a]) / 400))
            rating[a] += K * (1 - expected)
            rating[b] -= K * (1 - expected)
    for p in names:
        history[p].append(round(rating[p]))
kept = sorted((p for p in names if games[p] >= MIN_GAMES), key=lambda p: -rating[p])
write("coup", {"players": {chr(65 + i): history[p] for i, p in enumerate(kept)}})
