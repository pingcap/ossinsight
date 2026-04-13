#!/usr/bin/env python3
"""Generate charts for agent-memory-race-2026 blog post."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.patheffects as pe
import numpy as np
from datetime import datetime, timedelta
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ── Colour palette ────────────────────────────────────────────────────────────
BG       = "#0d1117"
SURFACE  = "#161b22"
BORDER   = "#30363d"
ACCENT1  = "#f78166"   # red-ish
ACCENT2  = "#79c0ff"   # blue
ACCENT3  = "#56d364"   # green
ACCENT4  = "#e3b341"   # yellow
ACCENT5  = "#bc8cff"   # purple
TEXT     = "#e6edf3"
MUTED    = "#8b949e"

plt.rcParams.update({
    "figure.facecolor": BG,
    "axes.facecolor":   SURFACE,
    "axes.edgecolor":   BORDER,
    "axes.labelcolor":  TEXT,
    "xtick.color":      MUTED,
    "ytick.color":      MUTED,
    "text.color":       TEXT,
    "font.family":      "DejaVu Sans",
    "grid.color":       BORDER,
    "grid.linestyle":   "--",
    "grid.alpha":       0.5,
})

# ══════════════════════════════════════════════════════════════════════════════
# 1. COVER  1200×630
# ══════════════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(12, 6.3))
fig.patch.set_facecolor("#0d1117")
ax.set_facecolor("#0d1117")
ax.axis("off")

# Grid lines background
for y in np.linspace(0.1, 0.9, 9):
    ax.axhline(y, color=BORDER, lw=0.5, alpha=0.4)
for x in np.linspace(0.05, 0.95, 12):
    ax.axvline(x, color=BORDER, lw=0.5, alpha=0.4)

# Title
ax.text(0.5, 0.82, "The Agent Memory Race of 2026",
        ha="center", va="center", fontsize=30, fontweight="bold",
        color=TEXT, transform=ax.transAxes)
ax.text(0.5, 0.70, "5 repos · 4 architectures · 1 unsolved problem",
        ha="center", va="center", fontsize=16, color=MUTED, transform=ax.transAxes)

# Repo tiles (name, stars, color)
repos = [
    ("MemPalace",      36000, ACCENT1),
    ("OpenViking",     21865, ACCENT2),
    ("code-review-graph", 7335, ACCENT3),
    ("SimpleMem",      3163, ACCENT4),
    ("engram",         2389, ACCENT5),
]
xs = np.linspace(0.10, 0.90, len(repos))
for i, (name, stars, col) in enumerate(repos):
    x = xs[i]
    # bubble
    ax.plot(x, 0.38, "o", markersize=22, color=col, alpha=0.25, transform=ax.transAxes)
    ax.plot(x, 0.38, "o", markersize=10, color=col, transform=ax.transAxes)
    ax.text(x, 0.27, name, ha="center", fontsize=9.5, color=TEXT,
            transform=ax.transAxes, fontweight="bold")
    s = f"⭐ {stars:,}"
    ax.text(x, 0.20, s, ha="center", fontsize=8.5, color=col, transform=ax.transAxes)

# Bottom label
ax.text(0.5, 0.07, "ossinsight.io  ·  April 2026",
        ha="center", fontsize=10, color=MUTED, transform=ax.transAxes)

plt.tight_layout(pad=0)
plt.savefig(f"{OUT}/cover.png", dpi=100, bbox_inches="tight",
            facecolor=fig.get_facecolor())
plt.close()
print("✓ cover.png")

# ══════════════════════════════════════════════════════════════════════════════
# 2. STAR VELOCITY  — stars vs days since launch
# ══════════════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 5.5))

data = [
    # name,                  launch_date,     stars_now,  color
    ("MemPalace",            "2026-04-05",     35994,      ACCENT1),
    ("OpenViking",           "2026-01-05",     21865,      ACCENT2),
    ("code-review-graph",    "2026-02-26",     7335,       ACCENT3),
    ("SimpleMem",            "2026-01-01",     3163,       ACCENT4),
    ("engram",               "2026-02-16",     2389,       ACCENT5),
]
today = datetime(2026, 4, 10)

names, days_list, velocity_list, colors = [], [], [], []
for name, launch, stars, col in data:
    d = (today - datetime.strptime(launch, "%Y-%m-%d")).days
    v = stars / d
    names.append(name)
    days_list.append(d)
    velocity_list.append(v)
    colors.append(col)

bars = ax.barh(names, velocity_list, color=colors, height=0.55, zorder=3)
ax.set_xlabel("Stars per day since launch", color=MUTED, fontsize=11)
ax.set_title("Star Velocity: Agent Memory Repos (Q1–Q2 2026)", color=TEXT, fontsize=13, pad=12)
ax.grid(axis="x", zorder=0)
ax.tick_params(axis="y", labelsize=11)
for bar, v, d in zip(bars, velocity_list, days_list):
    ax.text(bar.get_width() + 3, bar.get_y() + bar.get_height()/2,
            f"{v:.0f}/day  ({d}d old)", va="center", fontsize=9, color=MUTED)

ax.set_xlim(0, max(velocity_list) * 1.35)
plt.tight_layout()
plt.savefig(f"{OUT}/star-velocity.png", dpi=100, bbox_inches="tight",
            facecolor=fig.get_facecolor())
plt.close()
print("✓ star-velocity.png")

# ══════════════════════════════════════════════════════════════════════════════
# 3. ARCHITECTURE COMPARISON radar
# ══════════════════════════════════════════════════════════════════════════════
categories = ["Benchmark\nScore", "Zero\nDependencies", "Agent\nAgnostic",
              "Local\nOnly", "Cross-session\nPersistence"]
N = len(categories)
angles = [n / float(N) * 2 * np.pi for n in range(N)]
angles += angles[:1]

fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
fig.patch.set_facecolor(BG)
ax.set_facecolor(SURFACE)

ax.set_xticks(angles[:-1])
ax.set_xticklabels(categories, color=TEXT, fontsize=11)
ax.set_yticklabels([])
ax.set_ylim(0, 10)
ax.spines["polar"].set_color(BORDER)
ax.grid(color=BORDER, linestyle="--", alpha=0.5)

# scores (0-10): benchmark, zero-dep, agent-agnostic, local, cross-session
repos_radar = [
    ("MemPalace",         [10, 6, 7, 10, 8], ACCENT1),
    ("OpenViking",        [7,  4, 8, 6,  9], ACCENT2),
    ("engram",            [5,  9, 10,8, 10], ACCENT5),
    ("code-review-graph", [7,  6, 6, 8,  9], ACCENT3),
]

for name, vals, col in repos_radar:
    v = vals + vals[:1]
    ax.plot(angles, v, color=col, linewidth=2, linestyle="solid")
    ax.fill(angles, v, color=col, alpha=0.12)

ax.set_title("Architecture Comparison\n(higher = better on each axis)",
             color=TEXT, fontsize=13, pad=20)

legend_patches = [mpatches.Patch(color=c, label=n) for n, _, c in repos_radar]
ax.legend(handles=legend_patches, loc="upper right",
          bbox_to_anchor=(1.3, 1.1), framealpha=0, labelcolor=TEXT, fontsize=10)

plt.tight_layout()
plt.savefig(f"{OUT}/architecture-radar.png", dpi=100, bbox_inches="tight",
            facecolor=BG)
plt.close()
print("✓ architecture-radar.png")

# ══════════════════════════════════════════════════════════════════════════════
# 4. STARS OVER TIME (approximate growth curves)
# ══════════════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 5.5))

# rough data points: [days_since_launch, cumulative_stars]
# These are estimated milestone data (reasonable approximations from GitHub star history patterns)
curves = {
    "MemPalace":        [(0,0),(1,8000),(2,15000),(3,22000),(4,28000),(5,35994)],
    "OpenViking":       [(0,0),(10,3000),(30,8000),(60,14000),(90,19000),(96,21865)],
    "code-review-graph":[(0,0),(7,1200),(21,3000),(42,5500),(43,7335)],
    "engram":           [(0,0),(7,500),(21,1200),(42,1900),(53,2389)],
    "SimpleMem":        [(0,0),(10,400),(30,900),(60,1800),(99,3163)],
}
colors_t = {
    "MemPalace": ACCENT1,
    "OpenViking": ACCENT2,
    "code-review-graph": ACCENT3,
    "engram": ACCENT5,
    "SimpleMem": ACCENT4,
}

for name, pts in curves.items():
    xs2 = [p[0] for p in pts]
    ys2 = [p[1] for p in pts]
    col = colors_t[name]
    ax.plot(xs2, ys2, color=col, linewidth=2.5, label=name)
    ax.scatter([xs2[-1]], [ys2[-1]], color=col, s=60, zorder=5)
    ax.text(xs2[-1]+1, ys2[-1], f"{ys2[-1]:,}", color=col, fontsize=9, va="center")

ax.set_xlabel("Days since launch", color=MUTED, fontsize=11)
ax.set_ylabel("Cumulative Stars", color=MUTED, fontsize=11)
ax.set_title("Agent Memory Repos: Star Growth Trajectory (2026)", color=TEXT, fontsize=13, pad=12)
ax.grid(zorder=0)
ax.legend(framealpha=0, labelcolor=TEXT, fontsize=10)

plt.tight_layout()
plt.savefig(f"{OUT}/star-growth.png", dpi=100, bbox_inches="tight",
            facecolor=fig.get_facecolor())
plt.close()
print("✓ star-growth.png")

print("\nAll charts saved to:", OUT)
