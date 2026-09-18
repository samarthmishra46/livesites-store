"""Create colour variants of the product photos (run after clean-reference-images.py).

Segments the garment with GrabCut and remaps its luminance onto a target colour so the
swatches on product cards switch to a matching photo.
"""
import os
import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "public/images")


def garment_mask(img, outline, straps=(), refine=True):
    """GrabCut refined around a hand-traced outline: only a thin band around it is uncertain."""
    poly = np.zeros(img.shape[:2], np.uint8)
    cv2.fillPoly(poly, [np.array(outline, np.int32)], 255)
    for a, b in straps:
        cv2.line(poly, a, b, 255, 5)
    if not refine:
        return cv2.GaussianBlur(poly, (0, 0), 1.5).astype(np.float32) / 255
    mask = np.full(img.shape[:2], cv2.GC_BGD, np.uint8)
    mask[cv2.dilate(poly, np.ones((25, 25), np.uint8)) > 0] = cv2.GC_PR_BGD
    mask[poly > 0] = cv2.GC_PR_FGD
    mask[cv2.erode(poly, np.ones((15, 15), np.uint8)) > 0] = cv2.GC_FGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    m = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, labels, stats, _ = cv2.connectedComponentsWithStats(m)
    if n > 1:
        keep = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        m = np.where(labels == keep, 255, 0).astype(np.uint8)
    return cv2.GaussianBlur(m, (0, 0), 1.2).astype(np.float32) / 255


def recolor(img, alpha, target_hex, contrast=1.0):
    t = np.array([int(target_hex[i:i + 2], 16) for i in (5, 3, 1)], np.float32)  # BGR
    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    sel = alpha > 0.5
    mean = lum[sel].mean()
    rel = (lum - mean) / 255.0 * contrast
    out = t[None, None, :] * (1 + rel[..., None] * 1.6)
    out = np.clip(out, 0, 255)
    a = alpha[..., None]
    return (img * (1 - a) + out * a).astype(np.uint8)


def variants(src, outline, colours, straps=(), refine=True):
    img = cv2.imread(os.path.join(IMG, src))
    alpha = garment_mask(img, outline, straps, refine)
    base = os.path.splitext(src)[0]
    for name, hex_, contrast in colours:
        cv2.imwrite(os.path.join(IMG, f"{base}-{name}.jpg"), recolor(img, alpha, hex_, contrast),
                    [cv2.IMWRITE_JPEG_QUALITY, 92])


# blazer photo is 596x408, dress 598x408 (2x crops)
BLAZER = [(235, 40), (262, 28), (340, 30), (352, 50), (400, 75), (420, 90), (445, 160), (465, 230),
          (480, 290), (492, 345), (490, 375), (440, 380), (430, 408), (185, 408), (150, 390), (100, 345),
          (105, 320), (115, 260), (130, 190), (150, 110), (175, 80), (230, 55)]
DRESS = [(208, 46), (240, 48), (300, 50), (360, 48), (381, 46), (380, 100), (378, 150), (379, 200),
         (386, 260), (393, 320), (401, 408), (199, 408), (204, 330), (208, 260), (212, 200), (207, 150), (205, 100)]
variants("linen-blazer.jpg", BLAZER, [("camel", "#a88a72", 1.0), ("charcoal", "#4a494e", 1.4)])
variants("silk-slip-dress.jpg", DRESS, [("black", "#1d1c21", 2.2)],
         straps=[((229, 12), (209, 47)), ((372, 14), (381, 47))], refine=False)
print("done")
