"""Draws the Stations launcher icon into res/mipmap-*/ic_launcher.png."""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(HERE, "..", "res")
SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
N = 1024  # master canvas, downscaled per density

INK, PAPER, OK, RW, RWB, LINE = "#1D211C", "#F3EFE6", "#1E6A50", "#B34A12", "#E9884E", "#3A3F38"


def master():
    im = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    m = 40
    d.rounded_rectangle([m, m, N - m, N - m], radius=230, fill=INK)
    # Route: bottom-left station -> S-bend -> top-right station.
    w = 58
    x1, y1, x2, y2 = 300, 760, 724, 264
    mid = (y1 + y2) // 2
    r = (y1 - mid) // 2
    h = w // 2  # PIL strokes arcs inside their box; grow the box so they meet the lines

    def arc(cx, cy, a0, a1, color):
        d.arc([cx - r - h, cy - r - h, cx + r + h, cy + r + h], a0, a1, fill=color, width=w)

    lo, hi = (y1 + mid) // 2, (mid + y2) // 2
    d.line([(x1, y1), (x2 - r, y1)], fill=OK, width=w)
    arc(x2 - r, lo, 0, 90, OK)
    arc(x2 - r, lo, 270, 360, LINE)
    d.line([(x1 + r, mid), (x2 - r, mid)], fill=LINE, width=w)
    arc(x1 + r, hi, 90, 270, LINE)
    d.line([(x1 + r, y2), (x2, y2)], fill=LINE, width=w)
    # Stations.
    d.ellipse([x1 - 78, y1 - 78, x1 + 78, y1 + 78], fill=OK)
    d.ellipse([x2 - 58, lo - 58, x2 + 58, lo + 58], fill=INK)
    d.ellipse([x2 - 40, lo - 40, x2 + 40, lo + 40], fill=RWB)  # "you are here"
    d.ellipse([x2 - 92, y2 - 92, x2 + 92, y2 + 92], fill=RW)
    d.ellipse([x2 - 66, y2 - 66, x2 + 66, y2 + 66], fill=PAPER)
    d.ellipse([x2 - 30, y2 - 30, x2 + 30, y2 + 30], fill=RW)
    return im


def main():
    im = master()
    for dens, px in SIZES.items():
        out = os.path.join(RES, "mipmap-" + dens)
        os.makedirs(out, exist_ok=True)
        im.resize((px, px), Image.LANCZOS).save(os.path.join(out, "ic_launcher.png"), optimize=True)
    im.resize((512, 512), Image.LANCZOS).save(os.path.join(HERE, "icon-512.png"))


if __name__ == "__main__":
    main()
