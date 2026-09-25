"""Anime totals from a MyAnimeList XML export: completed titles and episodes per finish year.

Usage: python tools/data/anime.py <animelist export .xml>
"""
import collections
import sys
import xml.etree.ElementTree as ET

from _common import write

root = ET.parse(sys.argv[1]).getroot()
titles = episodes = 0
by_year = collections.Counter()
for a in root.findall("anime"):
    if a.findtext("my_status") != "Completed":
        continue
    n = int(a.findtext("my_watched_episodes") or 0)
    titles += 1
    episodes += n
    year = (a.findtext("my_finish_date") or "0000")[:4]
    if year != "0000":
        by_year[int(year)] += n
years = sorted(by_year)
write("anime", {
    "titles": titles,
    "episodes": episodes,
    "days": round(episodes * 23 / 60 / 24),  # at about 23 minutes an episode
    "years": years,
    "episodesByYear": [by_year[y] for y in years],
})
