#!/usr/bin/env python3
"""make_planet_ref.py: the reference the wanderers are measured against.

Rebuild wave 2: tests/planets-ref.json holds, for fixed moments and two
places, each wanderer's apparent geocentric right ascension and declination
from NASA JPL DE421 via Skyfield (the same ephemeris the Computed Sky wave
built data/sky.json from), with altitude and azimuth worked from that
position by plain geometry and Skyfield's own sidereal time, so the test
measures the planet reckoning itself and nothing else. Altitudes carry no
refraction correction, matching the page's arithmetic.

Run with a Skyfield-equipped python from a directory holding de421.bsp:
    python3 scripts/make_planet_ref.py
The ephemeris file itself stays outside the repo; the reference is
committed, so the test needs neither Skyfield nor the ephemeris.
"""
import json
import math
import os

from skyfield.api import load

MOMENTS = [
    "2025-06-21T06:00:00Z", "2025-06-21T19:00:00Z",
    "2026-01-15T06:00:00Z", "2026-01-15T19:00:00Z",
    "2026-04-15T06:00:00Z", "2026-04-15T19:00:00Z",
    "2026-07-15T06:00:00Z", "2026-07-15T19:00:00Z",
    "2026-10-24T06:00:00Z", "2026-10-24T19:00:00Z",
    "2026-10-25T03:00:00Z", "2027-01-15T06:00:00Z",
]
PLACES = [
    {"name": "Los Angeles", "lat": 34.05, "lon": -118.24},
    {"name": "London", "lat": 51.51, "lon": -0.13},
]
BODIES = ["mercury barycenter", "venus barycenter", "mars barycenter",
          "jupiter barycenter", "saturn barycenter", "uranus barycenter"]
NAMES = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus"]


def altaz(ra_deg, dec_deg, gmst_deg, lat, lon):
    H = math.radians(gmst_deg + lon - ra_deg)
    la, dec = math.radians(lat), math.radians(dec_deg)
    alt = math.asin(math.sin(la) * math.sin(dec)
                    + math.cos(la) * math.cos(dec) * math.cos(H))
    az = math.atan2(-math.cos(dec) * math.sin(H),
                    math.sin(dec) * math.cos(la)
                    - math.cos(dec) * math.cos(H) * math.sin(la))
    return math.degrees(alt), math.degrees(az) % 360.0


def main():
    eph = load("de421.bsp")
    earth = eph["earth"]
    ts = load.timescale()
    cases = []
    for iso in MOMENTS:
        y, rest = int(iso[:4]), iso[5:]
        mo, dy = int(rest[:2]), int(rest[3:5])
        hh, mm = int(rest[6:8]), int(rest[9:11])
        t = ts.utc(y, mo, dy, hh, mm)
        gmst = t.gmst * 15.0
        for place in PLACES:
            planets = {}
            for body, name in zip(BODIES, NAMES):
                # epoch=t: coordinates of the date, the frame the page reckons in
                # (radec() alone would answer in the J2000 frame, a generation stale)
                ra, dec, _ = earth.at(t).observe(eph[body]).apparent().radec(epoch=t)
                ra_deg, dec_deg = ra.hours * 15.0, dec.degrees
                alt, az = altaz(ra_deg, dec_deg, gmst, place["lat"], place["lon"])
                planets[name] = {
                    "ra": round(ra_deg, 5), "dec": round(dec_deg, 5),
                    "alt": round(alt, 5), "az": round(az, 5),
                }
            cases.append({"iso": iso, "place": place["name"],
                          "lat": place["lat"], "lon": place["lon"],
                          "planets": planets})
    out = {"format": "planets-ref/1", "source": "NASA JPL DE421 via Skyfield 1.55",
           "cases": cases}
    path = os.path.join(os.path.dirname(__file__), "..", "tests", "planets-ref.json")
    with open(path, "w") as f:
        json.dump(out, f, indent=1)
    print("wrote", os.path.normpath(path), "cases:", len(cases))


if __name__ == "__main__":
    main()
