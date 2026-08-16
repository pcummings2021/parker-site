#!/usr/bin/env python3
"""Generate the Mycilia tree-of-knowledge SVG via space colonization.

Deterministic (seeded). Output is an SVG fragment (groups + defs) meant to be
inlined into the site's hero <svg>, plus a standalone preview page for review.

Usage: python3 tools/generate_tree.py [seed] [outdir]
"""
import math
import random
import sys

VIEW_W, VIEW_H = 900, 1040
GROUND_Y = 900

# canopy = union of overlapping ellipses (cx, cy, rx, ry)
CANOPY = [
    (450, 400, 300, 210),
    (330, 470, 180, 150),
    (580, 450, 190, 160),
    (470, 300, 175, 130),
]

ATTRACTOR_COUNT = 850
INFLUENCE = 82.0
KILL = 16.0
STEP = 13.0
MAX_ITERS = 220

LEAF_RAMP = ["#3F5A34", "#4E6B3C", "#5E7F46", "#719150", "#86A45D", "#9BB56C"]
GOLD = ["#D9A75B", "#C98F3D"]
BRANCH_INK = "#33291F"
TWIG_INK = "#453728"
BACK_CANOPY = "#31462B"
GRASS_INK = "#4A5A3A"
ROOT_PALE = "#D8CFBB"


def in_canopy(x, y):
    for cx, cy, rx, ry in CANOPY:
        if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
            return True
    return False


def f(v):
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


class Node:
    __slots__ = ("x", "y", "parent", "children")

    def __init__(self, x, y, parent):
        self.x, self.y = x, y
        self.parent = parent
        self.children = []


def grow(rng):
    attractors = []
    while len(attractors) < ATTRACTOR_COUNT:
        x = rng.uniform(80, VIEW_W - 80)
        y = rng.uniform(120, 620)
        if in_canopy(x, y):
            attractors.append((x, y))

    seeds = [Node(424, 610, None), Node(474, 608, None)]
    nodes = list(seeds)

    for _ in range(MAX_ITERS):
        pull = {}
        alive = []
        for ax, ay in attractors:
            best, bd = None, INFLUENCE
            for i, n in enumerate(nodes):
                d = math.hypot(n.x - ax, n.y - ay)
                if d < bd:
                    best, bd = i, d
            if bd < KILL:
                continue
            alive.append((ax, ay))
            if best is not None:
                pull.setdefault(best, []).append((ax, ay))
        attractors = alive
        if not pull:
            break
        new = []
        for i, pts in pull.items():
            n = nodes[i]
            dx = sum(px - n.x for px, py in pts)
            dy = sum(py - n.y for px, py in pts)
            mag = math.hypot(dx, dy)
            if mag < 1e-6:
                continue
            # slight upward bias keeps the silhouette lifted
            ux, uy = dx / mag, dy / mag - 0.08
            m2 = math.hypot(ux, uy)
            child = Node(n.x + STEP * ux / m2, n.y + STEP * uy / m2, n)
            n.children.append(child)
            new.append(child)
        if not new:
            break
        nodes.extend(new)
    return seeds, nodes


def subtree_weights(nodes):
    w = {id(n): 1 for n in nodes}
    for n in reversed(nodes):  # children were appended after parents
        if n.parent is not None:
            w[id(n.parent)] += w[id(n)]
    return w


def chains_from(seed):
    out = []
    stack = [(seed, [seed])]
    while stack:
        node, path = stack.pop()
        while len(node.children) == 1:
            node = node.children[0]
            path.append(node)
        out.append(path)
        for c in node.children:
            stack.append((c, [node, c]))
    return out


def smooth_path(points):
    if len(points) < 2:
        return ""
    d = [f"M{f(points[0].x)} {f(points[0].y)}"]
    for i in range(1, len(points) - 1):
        mx = (points[i].x + points[i + 1].x) / 2
        my = (points[i].y + points[i + 1].y) / 2
        d.append(f"Q{f(points[i].x)} {f(points[i].y)} {f(mx)} {f(my)}")
    d.append(f"L{f(points[-1].x)} {f(points[-1].y)}")
    return " ".join(d)


def trunk_path():
    # filled tapered trunk: root flare at base, gentle waist, splitting fork
    return (
        f"M374 {GROUND_Y} "
        f"C420 880 426 812 432 748 C436 706 434 664 428 630 "
        f"C426 620 424 614 420 606 "
        f"L438 610 C444 622 446 630 450 640 C454 630 456 620 462 608 "
        f"L480 604 "
        f"C475 614 472 622 470 632 C465 668 464 708 470 750 "
        f"C476 814 482 880 526 {GROUND_Y} "
        f"C496 890 472 886 450 886 C428 886 404 890 374 {GROUND_Y} Z"
    )


def build(seed=7):
    rng = random.Random(seed)
    seeds, nodes = grow(rng)
    weights = subtree_weights(nodes)

    # --- branches, grouped into width tiers ---
    tiers = {}
    for s in seeds:
        for chain in chains_from(s):
            wt = weights[id(chain[0])]
            width = min(12.5, 0.9 + 1.45 * math.sqrt(wt))
            tier = round(width * 2) / 2
            tiers.setdefault(tier, []).append(smooth_path(chain))

    branch_groups = []
    for tier in sorted(tiers, reverse=True):
        ink = BRANCH_INK if tier >= 2.5 else TWIG_INK
        paths = "".join(f'<path d="{d}"/>' for d in tiers[tier])
        branch_groups.append(
            f'<g stroke="{ink}" stroke-width="{tier}" fill="none" '
            f'stroke-linecap="round">{paths}</g>'
        )

    terminals = [n for n in nodes if not n.children]

    # --- back canopy mass (drawn behind branches) ---
    back = []
    for _ in range(190):
        t = rng.choice(terminals)
        if t.y > 560:
            continue
        neighbors = sum(1 for o in terminals if o is not t and math.hypot(o.x - t.x, o.y - t.y) < 45)
        if neighbors < 2:
            continue
        rx = rng.uniform(10, 20)
        back.append(
            f'<ellipse cx="{f(t.x + rng.uniform(-12, 12))}" cy="{f(t.y + rng.uniform(-10, 10))}" '
            f'rx="{f(rx)}" ry="{f(rx * rng.uniform(0.62, 0.85))}" '
            f'transform="rotate({f(rng.uniform(-30, 30))} {f(t.x)} {f(t.y)})"/>'
        )
    back_g = f'<g fill="#3D5731" opacity="0.55">{"".join(back)}</g>'

    # --- front leaves on terminals, parents, and grandparents ---
    leafy = set()
    for t in terminals:
        leafy.add(t)
        if t.parent is not None:
            leafy.add(t.parent)
            if t.parent.parent is not None:
                leafy.add(t.parent.parent)
    leaves = []
    for n in leafy:
        for _ in range(rng.randint(3, 6)):
            lx = n.x + rng.uniform(-15, 15)
            ly = n.y + rng.uniform(-13, 13)
            # height + sun-side (upper right) drive the color choice
            hnorm = max(0.0, min(1.0, (620 - ly) / 480))
            sun = max(0.0, min(1.0, (lx - 300) / 480))
            warm = 0.35 * hnorm + 0.45 * sun
            if sun > 0.6 and hnorm > 0.45 and rng.random() < 0.2:
                col = rng.choice(GOLD)
            elif rng.random() < 0.03:
                col = rng.choice(GOLD)
            else:
                idx = min(len(LEAF_RAMP) - 1, int(warm * len(LEAF_RAMP) + rng.uniform(-1.2, 1.2)))
                col = LEAF_RAMP[max(0, idx)]
            rx = rng.uniform(5, 11)
            leaves.append(
                f'<ellipse cx="{f(lx)}" cy="{f(ly)}" rx="{f(rx)}" ry="{f(rx * rng.uniform(0.5, 0.75))}" '
                f'fill="{col}" opacity="{f(rng.uniform(0.72, 0.92))}" '
                f'transform="rotate({f(rng.uniform(-40, 40))} {f(lx)} {f(ly)})"/>'
            )
    leaves_g = f'<g>{"".join(leaves)}</g>'

    # --- knowledge motes: well-spread glowing terminals ---
    motes, chosen = [], []
    for t in sorted(terminals, key=lambda n: n.y):
        if all(math.hypot(t.x - c.x, t.y - c.y) > 95 for c in chosen):
            chosen.append(t)
        if len(chosen) >= 12:
            break
    for i, t in enumerate(chosen):
        r = rng.uniform(2.8, 4.4)
        motes.append(
            f'<g class="mote" style="--d:{f(i * 0.55)}s">'
            f'<circle cx="{f(t.x)}" cy="{f(t.y)}" r="{f(r * 4.2)}" fill="#E8B96A" '
            f'opacity="0.38" filter="url(#moteGlow)"/>'
            f'<circle cx="{f(t.x)}" cy="{f(t.y)}" r="{f(r)}" fill="#F3CE8C"/></g>'
        )
    motes_g = f'<g id="motes">{"".join(motes)}</g>'

    # --- grass tufts along the ground line ---
    grass = []
    for _ in range(30):
        gx = rng.uniform(150, 750)
        for _ in range(rng.randint(2, 4)):
            bx = gx + rng.uniform(-7, 7)
            h = rng.uniform(9, 20)
            sway = rng.uniform(-7, 7)
            grass.append(
                f'<path d="M{f(bx)} {GROUND_Y} Q{f(bx + sway * 0.4)} {f(GROUND_Y - h * 0.6)} '
                f'{f(bx + sway)} {f(GROUND_Y - h)}"/>'
            )
    grass_g = (
        f'<g stroke="{GRASS_INK}" stroke-width="1.6" fill="none" '
        f'stroke-linecap="round" opacity="0.55">{"".join(grass)}</g>'
    )

    # --- first roots, descending into the soil band of the hero ---
    roots = []
    for i in range(9):
        c = i - 4
        rx0 = 450 + c * 15 + rng.uniform(-5, 5)
        spread = c * 44 + rng.uniform(-18, 18)
        depth = rng.uniform(78, 132)
        wobble = rng.uniform(-24, 24)
        mx = rx0 + spread * 0.45 + wobble
        my = GROUND_Y + depth * 0.5
        ex, ey = rx0 + spread, GROUND_Y + depth
        w = max(1.3, 4.6 - abs(c) * 0.62)
        op = f(rng.uniform(0.32, 0.58))
        roots.append(
            f'<path d="M{f(rx0)} {GROUND_Y - 4} C{f(rx0 + spread * 0.1)} {f(GROUND_Y + 26)} '
            f'{f(mx)} {f(my)} {f(ex)} {f(ey)}" stroke-width="{f(w)}" opacity="{op}"/>'
        )
        # each root forks once partway down
        fx = rx0 + spread * 0.55
        fy = GROUND_Y + depth * 0.58
        bx = fx + rng.uniform(-40, 40)
        by = fy + rng.uniform(34, 62)
        roots.append(
            f'<path d="M{f(fx)} {f(fy)} Q{f((fx + bx) / 2 + rng.uniform(-12, 12))} '
            f'{f((fy + by) / 2)} {f(bx)} {f(by)}" stroke-width="{f(w * 0.5)}" opacity="{op}"/>'
        )
    roots_g = (
        f'<g stroke="{ROOT_PALE}" fill="none" stroke-linecap="round">{"".join(roots)}</g>'
    )

    defs = (
        '<defs><filter id="moteGlow" x="-80%" y="-80%" width="260%" height="260%">'
        '<feGaussianBlur stdDeviation="5"/></filter></defs>'
    )
    trunk = f'<path d="{trunk_path()}" fill="{BRANCH_INK}"/>'

    fragment = (
        defs
        + f'<g id="tree">{back_g}{trunk}{"".join(branch_groups)}{leaves_g}{motes_g}{grass_g}</g>'
        + f'<g id="firstroots">{roots_g}</g>'
    )
    return fragment, len(nodes), len(terminals)


def main():
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    outdir = sys.argv[2] if len(sys.argv) > 2 else "."
    fragment, n_nodes, n_terms = build(seed)

    with open(f"{outdir}/tree_fragment.svg", "w") as fh:
        fh.write(fragment)

    preview = f"""<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{{margin:0;background:#0D0B0A}}
.sky{{background:linear-gradient(to bottom,#E9EDE0 0%,#E3E8D8 45%,#EDE9D2 74%,#E6DFC2 86.5%,#3A2E23 86.7%,#1F1914 100%)}}
svg{{display:block;width:100%;max-width:900px;margin:0 auto}}</style>
<div class="sky"><svg viewBox="0 0 {VIEW_W} {VIEW_H}">{fragment}</svg></div>"""
    with open(f"{outdir}/tree_preview.html", "w") as fh:
        fh.write(preview)
    print(f"seed={seed} nodes={n_nodes} terminals={n_terms} bytes={len(fragment)}")


if __name__ == "__main__":
    main()
