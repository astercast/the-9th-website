"""Build data/sky.json once (and yearly, by the Action): real moon phases, seasons and lunar eclipses from NASA JPL's DE421 ephemeris.
pip install skyfield. The first run downloads de421.bsp (17 MB). The output is plain data, so the site never calls anything at runtime."""
import json, sys
from skyfield import api, almanac, eclipselib
Y0, Y1 = int(sys.argv[1]) if len(sys.argv) > 1 else 2026, int(sys.argv[2]) if len(sys.argv) > 2 else 2050
ts = api.load.timescale(); eph = api.load("de421.bsp")
iso = lambda t: t.utc_strftime("%Y-%m-%dT%H:%MZ")
t, y = almanac.find_discrete(ts.utc(Y0, 1, 1), ts.utc(Y1 + 1, 1, 1), almanac.moon_phases(eph))
phases = [[iso(a), int(b)] for a, b in zip(t, y)]                      # 0 new, 1 first quarter, 2 full, 3 last quarter
t, y = almanac.find_discrete(ts.utc(Y0, 1, 1), ts.utc(Y1 + 1, 1, 1), almanac.seasons(eph))
seasons = [[iso(a), ["spring equinox", "summer solstice", "autumn equinox", "winter solstice"][int(b)]] for a, b in zip(t, y)]
t, y, _ = eclipselib.lunar_eclipses(ts.utc(Y0, 1, 1), ts.utc(Y1 + 1, 1, 1), eph)
eclipses = [[iso(a), eclipselib.LUNAR_ECLIPSES[int(b)].lower()] for a, b in zip(t, y)]
json.dump({"format": "sky/1", "source": "NASA JPL DE421 via Skyfield", "from": Y0, "to": Y1, "phases": phases, "seasons": seasons, "lunarEclipses": eclipses}, open("sky.json", "w"), separators=(",", ":"))
print(len(phases), len(seasons), len(eclipses))
