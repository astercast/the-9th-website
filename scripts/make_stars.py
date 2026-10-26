"""Builds data/stars.json from the ESA Hipparcos catalogue (1997): 5041 stars of magnitude 6.0 and brighter, epoch J2000.
pip install skyfield. The first run downloads hip_main.dat (about 52 MB). The output is plain numbers, 231 KB (95 KB gzipped)."""
import json
from skyfield.api import load
from skyfield.data import hipparcos
with load.open(hipparcos.URL): pass                          # makes sure hip_main.dat is on disk
rows = []
for line in open("hip_main.dat"):
    f = line.split("|")
    try: mag, ra, de = float(f[5]), float(f[8]), float(f[9])
    except ValueError: continue
    if mag > 6.0: continue
    def num(i, d):
        try: return float(f[i])
        except ValueError: return d
    rows.append([round(ra, 4), round(de, 4), round(mag, 2), round(num(37, .6), 2), round(num(12, 0), 1), round(num(13, 0), 1), int(f[1])])
json.dump({"format": "stars/1", "source": "ESA Hipparcos 1997, magnitude 6.0 and brighter, epoch J2000",
           "cols": ["ra_deg", "dec_deg", "mag", "bv", "pm_ra_mas_yr", "pm_dec_mas_yr", "hip"], "stars": rows}, open("data/stars.json", "w"), separators=(",", ":"))
print(len(rows))
