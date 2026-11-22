"""Raw tiles → assets (graded like the style's prep_wide.py): height grid, albedo (graded land + depth-shaded sea), water mask,
baked low-sun shadows. EX is the vertical exaggeration the page uses.
usage (library root): .venv/bin/python -I films/somali-rains/tools/prep_map.py films/somali-rains"""
import sys, os, json, math
import numpy as np
from PIL import Image
from scipy import ndimage
D = sys.argv[1]; RAW = os.path.join(D, 'raw'); OUT = os.path.join(D, 'assets'); os.makedirs(OUT, exist_ok=True)
Image.MAX_IMAGE_PIXELS = None
EX = 12.0
m = json.load(open(os.path.join(RAW, 'bbox.json'))); W, S, E, N = m['bbox']
def merc(lon, lat, z): n = 2 ** z * 256; return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
s2m = m['s2']; z = s2m['z']; x0, y0 = merc(W, N, z); x1, y1 = merc(E, S, z)
img = Image.open(os.path.join(RAW, f's2_z{z}.jpg')).convert('RGB')
img = img.crop((int(x0 - s2m['tx0'] * 256), int(y0 - s2m['ty0'] * 256), int(x1 - s2m['tx0'] * 256), int(y1 - s2m['ty0'] * 256)))
IW, IH = img.size
km_px = 40075.0 / (2 ** z * 256) * math.cos(math.radians((S + N) / 2))
tm = m['terrain']; zt = tm['z']; tx0, ty0 = merc(W, N, zt); tx1, ty1 = merc(E, S, zt)
t = np.asarray(Image.open(os.path.join(RAW, f'terrain_z{zt}.png')).convert('RGB'), np.float64)
h = t[..., 0] * 256 + t[..., 1] + t[..., 2] / 256 - 32768
ys = (np.arange(IH) + .5) / IH * (ty1 - ty0) + ty0 - tm['ty0'] * 256 - .5
xs = (np.arange(IW) + .5) / IW * (tx1 - tx0) + tx0 - tm['tx0'] * 256 - .5
X, Y = np.meshgrid(xs, ys); hi = ndimage.map_coordinates(h, [Y, X], order=3, mode='nearest').astype(np.float32)
a = np.asarray(img, np.float32) / 255; r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = .3 * r + .59 * g + .11 * b
water = (hi <= 1.0) | (((b > r + .015) & (lum < .42)) & (hi < 12))
water = ndimage.binary_closing(ndimage.binary_opening(water, iterations=1), iterations=1)
lab, n = ndimage.label(water); sizes = ndimage.sum(water, lab, range(1, n + 1)); keep = np.zeros(n + 1, bool); keep[1:] = sizes > 60; water = keep[lab]
land = ~water
hl = np.where(land, np.maximum(hi, 2.0), np.minimum(hi, -1.0))
dist_land = ndimage.distance_transform_edt(water) * km_px
lin = a ** 2.2; L = lin.copy(); l = (L * [.2126, .7152, .0722]).sum(-1, keepdims=True)
L = l + (L - l) * .86; L = L * np.array([1.06, 1.0, .9]); L = np.clip(L * .95, 0, 1); L = L ** 1.08 * 1.1
depth = np.clip(-hl, 0, 5000)
sh = np.exp(-depth / 120.0); sh = np.maximum(sh, np.exp(-dist_land / 6.0) * .6)
deep = np.array([.008, .030, .066]); mid = np.array([.016, .06, .10]); teal = np.array([.03, .17, .19])
dd = np.clip(depth / 4000, 0, 1)[..., None] ** .6
sea = mid * (1 - dd) + deep * dd
shallow = .6 * teal + .4 * (lin * np.array([.55, .95, 1.0]))
sea = sea * (1 - sh[..., None] * .85) + shallow * (sh[..., None] * .85)
wm = ndimage.gaussian_filter(water.astype(np.float32), .7)[..., None]
alb = L * (1 - wm) + sea * wm
Image.fromarray((np.clip(alb, 0, 1) ** (1 / 2.2) * 255 + .5).astype(np.uint8)).save(os.path.join(OUT, 'albedo.jpg'), quality=92)
Image.fromarray((wm[..., 0] * 255).astype(np.uint8)).resize((IW // 2, IH // 2), Image.LANCZOS).save(os.path.join(OUT, 'water.png'))
GW, GH = IW // 3, IH // 3
hg = np.asarray(Image.fromarray(hl).resize((GW, GH), Image.BILINEAR), np.float32); hg.astype('<f4').tofile(os.path.join(OUT, 'height.bin'))
meta = {'GW': GW, 'GH': GH, 'IW': IW, 'IH': IH, 'bbox': [W, S, E, N], 'z': z, 'merc': [x0, y0, x1, y1], 'km_px': km_px,
        'width_km': IW * km_px, 'height_km': IH * km_px, 'EX': EX, 'hmax': float(hg.max()), 'hmin': float(hg.min())}
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), indent=1); print(meta)
# ---- baked low-sun shadows (sun from the west-north-west, 24° up) ----
SUN = np.array([-150.0, 67.0, -60.0]); hor = math.hypot(SUN[0], SUN[2]); TAN = SUN[1] / hor; dx, dz = SUN[0] / hor, SUN[2] / hor
y = np.maximum(hg, 0) / 1000 * EX; y = ndimage.zoom(y, 2, order=1); Hh, Ww = y.shape
kx = meta['width_km'] / (Ww - 1); kz = meta['height_km'] / (Hh - 1); step = min(kx, kz) * .75
R, C = np.mgrid[0:Hh, 0:Ww].astype(np.float32); occ = np.zeros_like(y); d = step
while d < 260:
    hs = ndimage.map_coordinates(y, [R + dz * d / kz, C + dx * d / kx], order=1, mode='nearest')
    occ = np.maximum(occ, (hs - (y + d * TAN)) / (.2 + d * .04)); d += step * (1 + d / 60)
lit = np.clip(1 - occ, 0, 1); lit = lit * lit * (3 - 2 * lit)
Image.fromarray((lit * 255 + .5).astype(np.uint8)).save(os.path.join(OUT, 'shadow.png')); print('shadow', Ww, Hh, float((lit < .5).mean()))
