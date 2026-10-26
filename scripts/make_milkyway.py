"""Builds data/milkyway.json from data/stars.json (the committed ESA Hipparcos
catalogue, magnitude 6.0 and brighter, epoch J2000): the catalogue's own
density on the galactic plane, for rebuild wave 4's Milky Way.
Each star's equatorial place is turned to galactic coordinates by the
standard J2000 rotation (ESA SP-1200, the Hipparcos catalogue's own
transformation; Murray 1989), counted into a grid of 1-degree cells
(360 of galactic longitude by 29 rows of galactic latitude, centres at
-14 to +14 degrees), and smoothed with a separable Gaussian (sigma
3.0 degrees in longitude, wrapping; 1.8 degrees in latitude, clamped),
because the band the eye reads is the smoothed crowd, not the cells.
The grid is normalised so its peak stands at 255. No downloads, no
libraries beyond the standard one: the same input gives the same file,
byte for byte. Run: python3 scripts/make_milkyway.py"""
import json, math

# Equatorial (J2000) -> galactic rotation, ESA SP-1200 / Murray 1989.
M = [[-0.0548755604162154, -0.8734370902348850, -0.4838350155487132],
     [ 0.4941094278755837, -0.4448296299600112,  0.7469822444972189],
     [-0.8676661490190047, -0.1980763734312015,  0.4559837761750669]]

def eq_to_gal(ra, dec):
    a, d = math.radians(ra), math.radians(dec)
    x = math.cos(d) * math.cos(a); y = math.cos(d) * math.sin(a); z = math.sin(d)
    gx = M[0][0] * x + M[0][1] * y + M[0][2] * z
    gy = M[1][0] * x + M[1][1] * y + M[1][2] * z
    gz = M[2][0] * x + M[2][1] * y + M[2][2] * z
    b = math.degrees(math.asin(gz))
    l = math.degrees(math.atan2(gy, gx)) % 360.0
    return l, b

LB, BMIN, ROWS = 360, -14, 29
grid = [[0.0] * LB for _ in range(ROWS)]
stars = json.load(open("data/stars.json"))["stars"]
for s in stars:
    l, b = eq_to_gal(s[0], s[1])
    r = int(round(b)) - BMIN
    if 0 <= r < ROWS:
        grid[r][int(l) % LB] += 1.0

def smooth(grid, sigma_l, sigma_b):
    rl = int(math.ceil(3 * sigma_l)); rb = int(math.ceil(3 * sigma_b))
    kl = [math.exp(-(k * k) / (2 * sigma_l * sigma_l)) for k in range(-rl, rl + 1)]
    kb = [math.exp(-(k * k) / (2 * sigma_b * sigma_b)) for k in range(-rb, rb + 1)]
    tmp = [[0.0] * LB for _ in range(ROWS)]
    for r in range(ROWS):
        for i in range(LB):
            acc = wsum = 0.0
            for j, w in enumerate(kl):
                acc += grid[r][(i + j - rl) % LB] * w; wsum += w
            tmp[r][i] = acc / wsum
    out = [[0.0] * LB for _ in range(ROWS)]
    for r in range(ROWS):
        for i in range(LB):
            acc = wsum = 0.0
            for j, w in enumerate(kb):
                rr = r + j - rb
                if 0 <= rr < ROWS:
                    acc += tmp[rr][i] * w; wsum += w
            out[r][i] = acc / wsum
    return out

sm = smooth(grid, 3.0, 1.8)
peak = max(max(row) for row in sm)
data = [int(round(255.0 * v / peak)) for row in sm for v in row]
json.dump({"format": "milkyway/1",
           "source": "Density of the ESA Hipparcos catalogue (data/stars.json, magnitude 6.0 and brighter) in galactic coordinates, J2000 rotation (ESA SP-1200), 1-degree cells, Gaussian smoothed (sigma 3.0 deg longitude, 1.8 deg latitude), peak normalised to 255. Built by scripts/make_milkyway.py.",
           "lBins": LB, "bMin": BMIN, "bStep": 1, "rows": ROWS, "peakCell": round(peak, 3),
           "data": data},
          open("data/milkyway.json", "w"), separators=(",", ":"))
print("stars", len(stars), "peak cell", round(peak, 3))
