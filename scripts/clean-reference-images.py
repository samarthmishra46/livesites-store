"""Derive clean site imagery from assets/reference-full.jpg.

Removes the baked-in hero copy/CTA and floating assistant card from the hero photo,
strips overlays from the assistant portrait and hearts/rounded corners from product crops.
Requires: pip install numpy opencv-python-headless
Run: python scripts/clean-reference-images.py
"""
import cv2
import numpy as np
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public/images")
os.makedirs(OUT, exist_ok=True)

ref = cv2.imread(os.path.join(ROOT, "assets/reference-full.jpg"))
H, W = ref.shape[:2]


def dark_mask(img, box, delta=14):
    """Mask pixels noticeably darker than their smoothed local background inside box."""
    x0, y0, x1, y1 = box
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.int16)
    bg = cv2.medianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 31).astype(np.int16)
    m = np.zeros(g.shape, np.uint8)
    sub = (g[y0:y1, x0:x1] < bg[y0:y1, x0:x1] - delta).astype(np.uint8) * 255
    m[y0:y1, x0:x1] = sub
    return m


def save(img, name, q=92):
    cv2.imwrite(os.path.join(OUT, name), img, [cv2.IMWRITE_JPEG_QUALITY, q])


# ---------------------------------------------------------------- hero
img = ref.copy()
mask = np.zeros((H, W), np.uint8)
for box in [(132, 336, 322, 360), (133, 390, 429, 567), (133, 587, 393, 647)]:
    mask |= dark_mask(img, box)
# thin rule after AURORA
mask[344:354, 258:322] = 255
# CTA block
mask[667:741, 133:396] = 255
mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=2)
img = cv2.inpaint(img, mask, 9, cv2.INPAINT_TELEA)
soft = cv2.GaussianBlur(img, (0, 0), 7)
m3 = cv2.GaussianBlur(cv2.dilate(mask, np.ones((9, 9), np.uint8)), (0, 0), 4).astype(np.float32)[..., None] / 255
img = (img * (1 - m3) + soft * m3).astype(np.uint8)

# avatar card: x 624..790 (screen edge), y 283..606
cx0, cy0, cx1, cy1 = 623, 282, 790, 607
SY = 606  # bottom edge of the card
# 1) background: harmonic (membrane) fill from background-only boundary pixels, solved coarse-to-fine
PT, PL, PB = 3, 6, 6
R = img[cy0 - PT:cy1 + PB, cx0 - PL:cx1].astype(np.float32)
rh, rw = R.shape[:2]
unknown = np.zeros((rh, rw), bool)
unknown[PT:rh - PB, PL:] = True
known_bg = (~unknown) & (R.mean(2) > 175)
valid = unknown | known_bg


def relax(u, unknown, valid, iters):
    h, w = unknown.shape
    for _ in range(iters):
        p = np.pad(u, ((1, 1), (1, 1), (0, 0)), mode="edge")
        vp = np.pad(valid, 1, mode="constant")
        acc = np.zeros_like(u); cnt = np.zeros((h, w, 1), np.float32)
        for dy, dx in ((0, 1), (2, 1), (1, 0), (1, 2)):
            v = vp[dy:dy + h, dx:dx + w][..., None]
            acc += p[dy:dy + h, dx:dx + w] * v
            cnt += v
        nu = acc / np.maximum(cnt, 1)
        u[unknown] = nu[unknown]
    return u


u = None
for s in (16, 8, 4, 2, 1):
    h, w = max(rh // s, 2), max(rw // s, 2)
    Rs = cv2.resize(R, (w, h), interpolation=cv2.INTER_AREA)
    kb = cv2.resize(known_bg.astype(np.float32), (w, h), interpolation=cv2.INTER_AREA) > 0.5
    un = cv2.resize(unknown.astype(np.float32), (w, h), interpolation=cv2.INTER_AREA) > 0.5
    kb &= ~un
    if u is None:
        us = np.where(un[..., None], R[known_bg].mean(0), Rs).astype(np.float32)
    else:
        us = cv2.resize(u, (w, h), interpolation=cv2.INTER_LINEAR)
        us[~un] = Rs[~un]
    u = relax(us, un, un | kb, 400)
fill = cv2.GaussianBlur(u, (0, 0), 2)[PT:rh - PB, PL:]
# 2) shoulder: mirror the visible blazer below the card edge upwards
hgt, wid = cy1 - cy0, cx1 - cx0
mir = np.zeros((hgt, wid, 3), np.float32)
for y in range(cy0, cy1):
    sy = min(2 * SY - y, H - 1)
    mir[y - cy0] = img[sy, cx0:cx1]
shoulder_pts = np.array([(cx0, 505), (640, 507), (660, 514), (678, 525), (692, 540),
                         (700, 558), (705, 580), (709, SY), (709, cy1), (cx0, cy1)], np.int32)
sm = np.zeros((H, W), np.uint8)
cv2.fillPoly(sm, [shoulder_pts], 255)
sm = sm[cy0:cy1, cx0:cx1]
dist = cv2.distanceTransform(sm, cv2.DIST_L2, 5)
mir *= (1 - 0.08 * np.exp(-dist / 4.0))[..., None]
a = cv2.GaussianBlur(sm, (0, 0), 1.0).astype(np.float32)[..., None] / 255
patch = fill * (1 - a) + mir * a
rng = np.random.default_rng(3)
patch += rng.normal(0, 1.2, patch.shape)
feather = np.ones((hgt, wid), np.float32)
ramp = 4
for i in range(ramp):
    w = (i + 1) / (ramp + 1)
    feather[:, i] = np.minimum(feather[:, i], w)
orig = img[cy0:cy1, cx0:cx1].astype(np.float32)
img[cy0:cy1, cx0:cx1] = np.clip(orig * (1 - feather[..., None]) + patch * feather[..., None], 0, 255).astype(np.uint8)

hero = img[279:815, 112:788]
hero2 = cv2.resize(hero, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
blur = cv2.GaussianBlur(hero2, (0, 0), 1.2)
hero2 = cv2.addWeighted(hero2, 1.35, blur, -0.35, 0)
save(hero2, "hero-aurora.jpg")

# model portrait for "Aurora suit" product (from the clean hero)
look = hero[0:536, 248:653]
look2 = cv2.resize(look, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
look2 = cv2.addWeighted(look2, 1.3, cv2.GaussianBlur(look2, (0, 0), 1.2), -0.3, 0)
save(look2, "aurora-linen-suit.jpg")

# ---------------------------------------------------------------- avatar portrait
av = ref[290:600, 633:795].copy().astype(np.float32)   # inside the card border
ah, aw = av.shape[:2]
topc = av[3:7].mean(0)   # colours right under the card border
def flat_fill(y0, y1, x0, x1):
    blk = np.repeat(topc[None, x0:x1], y1 - y0, 0)
    fm = np.zeros((ah, aw), np.float32); fm[y0:y1, x0:x1] = 1
    fm = cv2.GaussianBlur(fm, (0, 0), 3)[..., None]
    full = av.copy(); full[y0:y1, x0:x1] = blk
    full = cv2.GaussianBlur(full, (0, 0), 2)
    return av * (1 - fm) + full * fm
av = flat_fill(5, 56, 5, 92)       # Live pill
av = flat_fill(5, 58, 120, aw)     # close button
# lower half (speech bubble + control bar): extend the shoulder rows downwards, heavily softened
band = av[166:178]
start = 178
ext = np.repeat(band.mean(0)[None], ah - start, 0)
ext = cv2.GaussianBlur(ext, (0, 0), sigmaX=10, sigmaY=1)
t = np.linspace(0, 1, ah - start)[:, None, None]
ext = ext * (1 - 0.35 * t) + ext.mean((0, 1)) * 0.35 * t
fm = np.zeros((ah, aw), np.float32); fm[start:] = 1
fm = cv2.GaussianBlur(fm, (0, 0), 3)[..., None]
full = av.copy(); full[start:] = ext
av = np.clip(av * (1 - fm) + full * fm, 0, 255).astype(np.uint8)
av2 = cv2.resize(av, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
av2 = cv2.addWeighted(av2, 1.3, cv2.GaussianBlur(av2, (0, 0), 1.2), -0.3, 0)
save(av2, "assistant-portrait.jpg")


# ---------------------------------------------------------------- products
def product(box, heart, name, radius=13):
    x0, y0, x1, y1 = box
    p = ref[y0:y1, x0:x1].copy()
    ph, pw = p.shape[:2]
    m = np.zeros((ph, pw), np.uint8)
    if heart:
        hx, hy = heart
        cv2.circle(m, (hx - x0, hy - y0), 14, 255, -1)
    # rounded corners: everything outside the rounded rect
    rr = np.full((ph, pw), 255, np.uint8)
    cv2.rectangle(rr, (radius, 0), (pw - radius - 1, ph - 1), 0, -1)
    cv2.rectangle(rr, (0, radius), (pw - 1, ph - radius - 1), 0, -1)
    for c in [(radius, radius), (pw - radius - 1, radius), (radius, ph - radius - 1), (pw - radius - 1, ph - radius - 1)]:
        cv2.circle(rr, c, radius, 0, -1)
    m |= cv2.dilate(rr, np.ones((3, 3), np.uint8), iterations=2)
    p = cv2.inpaint(p, m, 6, cv2.INPAINT_TELEA)
    mb = cv2.GaussianBlur(m, (0, 0), 3).astype(np.float32)[..., None] / 255
    p = (p * (1 - mb) + cv2.GaussianBlur(p, (0, 0), 3) * mb).astype(np.uint8)
    p2 = cv2.resize(p, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
    p2 = cv2.addWeighted(p2, 1.3, cv2.GaussianBlur(p2, (0, 0), 1.2), -0.3, 0)
    save(p2, name)
    return p


product((138, 1017, 436, 1221), (412, 1040), "linen-blazer.jpg")
product((465, 1017, 764, 1221), (740, 1040), "silk-slip-dress.jpg")
product((605, 1345, 705, 1420), None, "structured-tote.jpg", radius=6)

# recommendation avatar
ra = ref[1347:1417, 160:229].copy()
ra2 = cv2.resize(ra, None, fx=3, fy=3, interpolation=cv2.INTER_LANCZOS4)
ra2 = cv2.addWeighted(ra2, 1.3, cv2.GaussianBlur(ra2, (0, 0), 1.5), -0.3, 0)
save(ra2, "stylist-avatar.jpg")
print("done")
