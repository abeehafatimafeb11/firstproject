#!/usr/bin/env python3
"""One-off generator for built-in worksheet PNGs (simple line art)."""
import math
import os
import struct
import zlib


def out_path(name):
    return os.path.join(os.path.dirname(__file__), "..", "assets", "coloring", name)


def png_chunk(typ, dat):
    return struct.pack(">I", len(dat)) + typ + dat + struct.pack(">I", zlib.crc32(typ + dat) & 0xFFFFFFFF)


def write_png(path, w, h, rgb):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            r, g, b = rgb(x, y)
            raw.extend((r & 255, g & 255, b & 255))
    z = zlib.compress(bytes(raw), 9)
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", z) + png_chunk(b"IEND", b"")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)


def dseg(px, py, ax, ay, bx, by):
    abx = bx - ax
    aby = by - ay
    apx = px - ax
    apy = py - ay
    ab2 = max(1e-9, abx * abx + aby * aby)
    t = max(0, min(1, (apx * abx + apy * aby) / ab2))
    qx = ax + t * abx
    qy = ay + t * aby
    return math.hypot(px - qx, py - qy)


def ring(cx, cy, r, t):
    def f(x, y):
        dd = math.hypot(x - cx, y - cy)
        return abs(dd - r) <= t * 0.5

    return f


def compose(w, h, ink_width, framed, painters):
    def rgb(x, y):
        ink = framed and (
            x <= 10 + ink_width
            or x >= w - 11 - ink_width
            or y <= 10 + ink_width
            or y >= h - 11 - ink_width
        )
        if not ink:
            for fn in painters:
                if fn(x, y):
                    ink = True
                    break
        return (0, 0, 0) if ink else (255, 255, 255)

    return rgb


def segs_paint(segs):
    lw = SEGLW

    def f(x, y):
        for (ax, ay, bx, by) in segs:
            if dseg(x, y, ax, ay, bx, by) <= lw:
                return True
        return False

    return f


SEGLW = 4.2
W, H = 640, 480


def farm():
    s = []
    cx, cy = 115, 100
    s += [(cx + 62 * math.cos(math.radians(a)), cy + 62 * math.sin(math.radians(a)), cx + 78 * math.cos(math.radians(a)), cy + 78 * math.sin(math.radians(a))) for a in range(0, 360, 28)]
    s += [(200, 360, 200, 230), (420, 360, 420, 230), (200, 360, 420, 360), (200, 230, 420, 230)]
    s += [(175, 230, 312, 150), (312, 150, 445, 230)]
    s += [(295, 360, 295, 278), (335, 360, 335, 278)]
    s += [(40, 410, W - 40, 410)]
    for i in range(10):
        bx = 52 + i * 56
        s += [(bx, 410, bx + 20, 380), (bx + 20, 380, bx + 44, 410)]
    p = [
        ring(310, 100, 40, SEGLW * 2),
        segs_paint(s),
    ]

    def sun(x, y):
        rr = math.hypot(x - cx, y - cy)
        return 54 <= rr <= 68 or (rr <= 45 and rr >= 41)

    p.insert(0, sun)

    write_png(
        out_path("farm-worksheet.png"),
        W,
        H,
        compose(W, H, SEGLW, True, p),
    )


def bakery():
    rects = [(232, 360, 408, 315), (250, 315, 390, 278), (265, 278, 375, 240)]
    s = []
    for (x1, y1, x2, y2) in rects:
        s += [(x1, y1, x2, y1), (x2, y1, x2, y2), (x2, y2, x1, y2), (x1, y2, x1, y1)]
    s += [(240, 315, 400, 315)]
    for i in range(7):
        xi = 250 + i * 22
        s += [(xi, 298, xi + 8, 315), (xi + 8, 315, xi + 17, 300)]
    s += [(320, 240, 320, 198), (304, 198, 336, 198)]
    s += [(320, 192, 327, 168), (327, 168, 320, 162), (320, 162, 313, 168), (313, 168, 320, 192)]
    sprinkles = [ring(210, 200, 4, SEGLW + 2), ring(280, 185, 3.6, SEGLW + 1), ring(380, 195, 4, SEGLW + 1), ring(350, 350, 5, SEGLW + 1), ring(295, 340, 4, SEGLW)]

    painters = [segs_paint(s)] + sprinkles

    write_png(
        out_path("bakery-worksheet.png"),
        W,
        H,
        compose(W, H, SEGLW, True, painters),
    )


def unicorn():
    s = []

    def arc_seg(cx0, cy0, r0, a0, a1, steps=24):
        for i in range(steps):
            t0 = math.radians(a0 + (a1 - a0) * i / steps)
            t1 = math.radians(a0 + (a1 - a0) * (i + 1) / steps)
            s.append(
                (
                    cx0 + r0 * math.cos(t0),
                    cy0 + r0 * math.sin(t0),
                    cx0 + r0 * math.cos(t1),
                    cy0 + r0 * math.sin(t1),
                )
            )

    arc_seg(305, 255, 75, -30, 30)
    arc_seg(305, 255, 75, 150, 210)
    arc_seg(265, 255, 54, -130, -50)
    arc_seg(345, 255, 54, -130, -50)
    arc_seg(365, 195, 24, -90, 40)
    s += [(305, 180, 310, 95), (310, 95, 285, 128), (285, 128, 305, 180)]
    s += [(355, 250, 480, 255), (480, 255, 420, 300)]
    s += [(255, 300, 200, 360), (200, 360, 180, 400)]
    s += [(50, 400, W - 50, 400)]
    s += [(500, 90, 520, 40), (520, 40, 540, 75), (540, 75, 555, 30)]
    painters = [
        lambda x, y: abs(math.hypot(x - 298, y - 208) - 11) <= 2.2,
        lambda x, y: abs(math.hypot(x - 318, y - 206) - 9) <= 2.2,
        segs_paint(s),
    ]
    painters.insert(
        0,
        lambda x, y: 108 <= math.hypot(x - 302, y - 250) <= 126,
    )

    write_png(
        out_path("unicorn-worksheet.png"),
        W,
        H,
        compose(W, H, SEGLW, True, painters),
    )


def main():
    farm()
    bakery()
    unicorn()
    print("Wrote defaults to assets/coloring/")


if __name__ == "__main__":
    main()
