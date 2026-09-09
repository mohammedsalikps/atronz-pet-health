"""
Generates every Atronz brand asset from the single official logo file.

The source is a screenshot of the logo on near-white paper, so the background is
removed by building an alpha matte from each pixel's distance to the paper
colour, then un-premultiplying the colour. That keeps edges clean on cream,
white and dark surfaces alike rather than leaving a white fringe.

Run:  python scripts/build-brand-assets.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "brand" / "atronz-logo-source.png"
WEB = ROOT / "src" / "assets" / "brand"
PUBLIC = ROOT / "public"
NATIVE = ROOT / "assets"

# Paper colour of the source screenshot, and the distance at which a pixel is
# considered fully opaque ink.
PAPER = np.array([253.0, 253.0, 253.0])
# Anything within NOISE_FLOOR of the paper colour is compression noise, not ink,
# and must snap to fully transparent — otherwise the whole source rectangle
# keeps a faint haze that shows up over dark surfaces.
NOISE_FLOOR = 10.0
FEATHER = 46.0

# Brand colours sampled from the official mark.
CREAM = (250, 248, 244)


def load_matted() -> Image.Image:
    """Source logo with the paper background replaced by real transparency."""
    rgb = np.asarray(Image.open(SOURCE).convert("RGB")).astype(np.float64)

    distance = np.abs(rgb - PAPER).max(axis=2)
    alpha = np.clip((distance - NOISE_FLOOR) / (FEATHER - NOISE_FLOOR), 0.0, 1.0)

    # Un-premultiply: C = a*F + (1-a)*P  =>  F = (C - (1-a)*P) / a
    safe = np.maximum(alpha, 1e-4)[..., None]
    fg = (rgb - (1.0 - alpha)[..., None] * PAPER) / safe
    fg = np.clip(fg, 0, 255)
    fg = np.where(alpha[..., None] > 0.02, fg, rgb)

    out = np.dstack([fg, alpha * 255.0]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


# Faint screenshot noise carries a little alpha, so "is there ink here?" needs a
# firmer threshold than "alpha > 0" for both trimming and the gutter scan.
INK_ALPHA = 60


def trim(img: Image.Image) -> Image.Image:
    """Crops to the pixels that are actually ink, ignoring background noise."""
    alpha = np.asarray(img)[..., 3]
    solid = alpha > INK_ALPHA
    if not solid.any():
        raise SystemExit("Source image appears to be blank.")
    rows = np.where(solid.any(axis=1))[0]
    cols = np.where(solid.any(axis=0))[0]
    return img.crop((int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1))


def fit_width(img: Image.Image, width: int) -> Image.Image:
    height = round(img.height * width / img.width)
    return img.resize((width, height), Image.LANCZOS)


def square(img: Image.Image, size: int, coverage: float, bg=None) -> Image.Image:
    """Centres `img` on a square canvas, scaled to `coverage` of the canvas."""
    canvas = Image.new("RGBA", (size, size), (*bg, 255) if bg else (0, 0, 0, 0))
    target = size * coverage
    scale = min(target / img.width, target / img.height)
    resized = img.resize((max(1, round(img.width * scale)), max(1, round(img.height * scale))), Image.LANCZOS)
    canvas.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
    return canvas


def main() -> None:
    for folder in (WEB, PUBLIC, NATIVE):
        folder.mkdir(parents=True, exist_ok=True)

    matted = load_matted()
    lockup = trim(matted)

    # The mark and the wordmark are separated by a wide empty gutter; split on it.
    alpha = np.asarray(lockup)[..., 3]
    column_has_ink = (alpha > INK_ALPHA).any(axis=0)
    gap_start = None
    run = None
    # Start past the first ink column so the leading margin is not mistaken for
    # the gutter.
    for x in range(1, len(column_has_ink)):
        if not column_has_ink[x]:
            if run is None:
                run = x
        else:
            if run is not None and x - run >= 20:
                gap_start = run
                break
            run = None
    if gap_start is None:
        raise SystemExit("Could not find the gutter between the mark and the wordmark.")

    mark = trim(lockup.crop((0, 0, gap_start, lockup.height)))

    # --- Web assets (imported by the app, so Vite fingerprints them) ---
    # Sized for ~3x the largest on-screen use (lockup ~180px, mark ~40px)
    # rather than shipping the full source resolution into the APK.
    fit_width(lockup, 640).save(WEB / "atronz-lockup.png", optimize=True)
    square(mark, 192, 1.0).save(WEB / "atronz-mark.png", optimize=True)

    # Boot splash reads this straight from /public before the bundle loads.
    fit_width(lockup, 512).save(PUBLIC / "brand-lockup.png", optimize=True)

    # --- Favicon / touch icon ---
    square(mark, 512, 0.82).save(PUBLIC / "favicon.png", optimize=True)
    square(mark, 180, 0.72, bg=CREAM).save(PUBLIC / "apple-touch-icon.png", optimize=True)

    # --- Capacitor native assets (@capacitor/assets input) ---
    # Adaptive icons crop to a circle, so the foreground stays inside the
    # central safe zone while the plain icon can sit closer to the edges.
    square(mark, 1024, 0.66, bg=(255, 255, 255)).save(NATIVE / "icon.png")
    square(mark, 1024, 0.52).save(NATIVE / "icon-foreground.png")
    Image.new("RGBA", (1024, 1024), (255, 255, 255, 255)).save(NATIVE / "icon-background.png")

    # Both splashes keep the light brand ground. The official wordmark is
    # charcoal, so putting it on a dark panel would make it disappear, and
    # recolouring the logo is not an option.
    square(lockup, 2732, 0.42, bg=CREAM).save(NATIVE / "splash.png")
    square(lockup, 2732, 0.42, bg=CREAM).save(NATIVE / "splash-dark.png")

    for path in sorted(
        [*WEB.glob("*.png"), *PUBLIC.glob("*.png"), *NATIVE.glob("*.png")]
    ):
        with Image.open(path) as out:
            kb = path.stat().st_size / 1024
            print(f"{path.relative_to(ROOT).as_posix():44} {out.size[0]}x{out.size[1]:<6} {kb:6.1f} KB")


if __name__ == "__main__":
    main()
