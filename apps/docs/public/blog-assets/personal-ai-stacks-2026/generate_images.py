#!/usr/bin/env python3
"""Generate blog images for personal-ai-stacks-2026 post."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from pathlib import Path

OUT = Path(__file__).parent

# ── Color palette ──────────────────────────────────────────────────────────────
BG      = "#0f0f1a"
BG2     = "#1a1a2e"
ACCENT  = "#7c3aed"   # purple
GOLD    = "#f59e0b"
TEAL    = "#06b6d4"
GREEN   = "#10b981"
RED     = "#ef4444"
GRAY    = "#6b7280"
WHITE   = "#f9fafb"
SUBTLE  = "#374151"

# ── 1. Cover image (1200×630) ───────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(12, 6.3), facecolor=BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 12); ax.set_ylim(0, 6.3)
ax.axis("off")

# Background gradient effect
from matplotlib.patches import FancyBboxPatch
rect = FancyBboxPatch((0, 0), 12, 6.3, boxstyle="round,pad=0", 
                       facecolor=BG, edgecolor="none")
ax.add_patch(rect)

# Accent stripe on left
ax.add_patch(plt.Rectangle((0, 0), 0.12, 6.3, color=ACCENT, zorder=5))

# Decorative circles background
for x, y, r, alpha in [(9.5, 4.5, 2.5, 0.04), (10.5, 1.5, 1.8, 0.03), (7, 5.5, 1.2, 0.03)]:
    circle = plt.Circle((x, y), r, color=ACCENT, alpha=alpha)
    ax.add_patch(circle)

# Key stat chips at top-right
chips = [
    ("+50,074 ⭐", GOLD, 10.0, 5.7),
    ("16 days", TEAL, 10.0, 5.2),
    ("7.8x forks", GREEN, 10.0, 4.7),
]
for txt, color, cx, cy in chips:
    ax.add_patch(FancyBboxPatch((cx-1.1, cy-0.22), 2.2, 0.44, 
                                 boxstyle="round,pad=0.05", facecolor=color, alpha=0.15, edgecolor=color, linewidth=1))
    ax.text(cx, cy, txt, ha="center", va="center", fontsize=11, color=color, fontweight="bold", zorder=10)

# Subtitle top
ax.text(0.3, 5.9, "OSSINSIGHT DATA STORY", ha="left", va="top", 
        fontsize=9, color=ACCENT, fontweight="bold", alpha=0.9, zorder=10)

# Main headline
ax.text(0.3, 5.4, "50,000 Stars for One", ha="left", va="top",
        fontsize=30, color=WHITE, fontweight="bold", zorder=10)
ax.text(0.3, 4.7, "Person's Config File", ha="left", va="top",
        fontsize=30, color=GOLD, fontweight="bold", zorder=10)

# Subtitle
ax.text(0.3, 3.85, "What garrytan/gstack reveals about GitHub's newest category:", 
        ha="left", va="top", fontsize=13, color=GRAY, zorder=10)
ax.text(0.3, 3.4, "personal AI stacks as open-source content", 
        ha="left", va="top", fontsize=13, color=WHITE, alpha=0.85, zorder=10)

# Divider line
ax.add_patch(plt.Rectangle((0.3, 3.1), 6.5, 0.025, color=ACCENT, alpha=0.5))

# Bottom mini data row
repos = [
    ("garrytan/gstack", "50K ⭐", "16d", GOLD),
    ("mattpocock/skills", "10K ⭐", "52d", TEAL),
    ("slavingia/skills", "3.6K ⭐", "4d", GREEN),
]
for i, (name, stars, age, color) in enumerate(repos):
    bx = 0.3 + i * 3.8
    ax.add_patch(FancyBboxPatch((bx, 2.05), 3.5, 0.85, 
                                 boxstyle="round,pad=0.08", facecolor=BG2, edgecolor=SUBTLE, linewidth=0.8))
    ax.text(bx + 0.18, 2.72, name, fontsize=8.5, color=WHITE, va="center", zorder=10)
    ax.text(bx + 0.18, 2.42, f"{stars} in {age}", fontsize=10, color=color, fontweight="bold", va="center", zorder=10)

# OSSInsight watermark
ax.text(11.85, 0.15, "ossinsight.io", ha="right", va="bottom", fontsize=8,
        color=GRAY, alpha=0.7, zorder=10)

plt.tight_layout(pad=0)
fig.savefig(OUT / "cover.png", dpi=150, bbox_inches="tight", facecolor=BG)
plt.close()
print("✓ cover.png")


# ── 2. Stars vs Fork ratio chart ───────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=BG)
ax.set_facecolor(BG)

categories = [
    # (label, stars, forks, color, annotate)
    ("garrytan/gstack\n(personal AI stack)", 50074, 6396, GOLD, True),
    ("mattpocock/skills\n(personal AI skills)", 10350, 845, TEAL, True),
    ("slavingia/skills\n(personal AI skills)", 3650, 242, GREEN, True),
    ("karpathy/autoresearch\n(ML research tool)", 57421, 7998, ACCENT, False),
    ("facebook/react\n(production library)", 230000, 47000, GRAY, False),
    ("karpathy/nanoGPT\n(educational repo)", 55641, 9200, RED, False),
]

for i, (label, stars, forks, color, annotate) in enumerate(categories):
    ratio = stars / forks
    bar = ax.barh(i, ratio, color=color, alpha=0.85, height=0.6, edgecolor="none")
    ax.text(ratio + 0.15, i, f"{ratio:.1f}x", va="center", ha="left", 
            color=color, fontsize=10, fontweight="bold")
    
    if annotate:
        ax.annotate("← personal stack", xy=(ratio + 0.3, i - 0.3),
                   fontsize=7.5, color=color, alpha=0.7)

ax.set_yticks(range(len(categories)))
ax.set_yticklabels([c[0] for c in categories], fontsize=9, color=WHITE)
ax.set_xlabel("Stars per Fork (higher = more viewers, fewer builders)", fontsize=10, color=GRAY)
ax.set_title("Personal AI Stacks Have Anomalously High Star-to-Fork Ratios\nData as of March 27, 2026 — Source: GitHub API via OSSInsight", 
             fontsize=12, color=WHITE, pad=12)

ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.spines["left"].set_color(SUBTLE)
ax.spines["bottom"].set_color(SUBTLE)
ax.tick_params(colors=GRAY, labelsize=9)
ax.grid(axis="x", color=SUBTLE, alpha=0.4, linestyle="--")
ax.set_xlim(0, 20)

# Highlight bands
ax.axvspan(0, 8, alpha=0.04, color=GRAY)
ax.axvspan(8, 20, alpha=0.06, color=GOLD)
ax.text(13, -0.7, '→ "content repo" zone', fontsize=8.5, color=GOLD, alpha=0.8)
ax.text(3, -0.7, "tool zone", fontsize=8.5, color=GRAY, alpha=0.8)

plt.tight_layout(pad=1.5)
fig.savefig(OUT / "star-fork-ratio.png", dpi=150, bbox_inches="tight", facecolor=BG)
plt.close()
print("✓ star-fork-ratio.png")


# ── 3. Growth velocity chart ───────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 5.5), facecolor=BG)
ax.set_facecolor(BG)

repos_vel = [
    ("garrytan/gstack", 3130, GOLD, "Personal AI stack"),
    ("karpathy/autoresearch", 2734, ACCENT, "ML research tool"),
    ("karpathy/nanochat", 316, RED, "ML library"),
    ("mattpocock/skills", 199, TEAL, "Personal AI skills"),
    ("slavingia/skills", 912, GREEN, "Personal AI skills"),
    ("karpathy/nanoGPT", 47, GRAY, "Educational (3yr avg)"),
    ("facebook/react", 49, GRAY, "Production lib (13yr avg)"),
]
repos_vel.sort(key=lambda x: x[1])

labels = [r[0] for r in repos_vel]
values = [r[1] for r in repos_vel]
colors = [r[2] for r in repos_vel]
notes  = [r[3] for r in repos_vel]

bars = ax.barh(range(len(repos_vel)), values, color=colors, alpha=0.85, height=0.6)

for i, (val, note, color) in enumerate(zip(values, notes, colors)):
    ax.text(val + 20, i, f"{val:,.0f} ⭐/day", va="center", ha="left", 
            color=color, fontsize=9.5, fontweight="bold")

ax.set_yticks(range(len(repos_vel)))
ax.set_yticklabels(labels, fontsize=9, color=WHITE)
ax.set_xlabel("Stars per day (since creation)", fontsize=10, color=GRAY)
ax.set_title("Star Velocity Comparison\n(Stars/day since creation — Data: March 27, 2026)", 
             fontsize=12, color=WHITE, pad=12)

ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.spines["left"].set_color(SUBTLE)
ax.spines["bottom"].set_color(SUBTLE)
ax.tick_params(colors=GRAY)
ax.grid(axis="x", color=SUBTLE, alpha=0.4, linestyle="--")
ax.set_xlim(0, 4000)

plt.tight_layout(pad=1.5)
fig.savefig(OUT / "growth-velocity.png", dpi=150, bbox_inches="tight", facecolor=BG)
plt.close()
print("✓ growth-velocity.png")


# ── 4. Content composition comparison ─────────────────────────────────────────
fig, axes = plt.subplots(1, 3, figsize=(11, 4.5), facecolor=BG)
fig.patch.set_facecolor(BG)

repos_comp = [
    {
        "name": "garrytan/gstack",
        "stars": 50074,
        "label": "YC President's\nAI engineering stack",
        "color": GOLD,
        "slices": [35, 25, 20, 12, 8],
        "slice_labels": ["Skills/\nworkflows", "Browse\ntools", "Tests/\nevals", "Docs", "Config"],
        "slice_colors": [GOLD, TEAL, GREEN, ACCENT, GRAY],
    },
    {
        "name": "mattpocock/skills",
        "stars": 10350,
        "label": "TypeScript author's\nAI coding skills",
        "color": TEAL,
        "slices": [45, 25, 20, 10],
        "slice_labels": ["Skills\n(Markdown)", "Scripts", "Docs", "Config"],
        "slice_colors": [TEAL, GREEN, ACCENT, GRAY],
    },
    {
        "name": "slavingia/skills",
        "stars": 3650,
        "label": "Gumroad founder's\nbusiness-thinking skills",
        "color": GREEN,
        "slices": [70, 15, 15],
        "slice_labels": ["Skills\n(Markdown)", "Docs", "Config"],
        "slice_colors": [GREEN, ACCENT, GRAY],
    },
]

for ax_i, (ax, repo) in enumerate(zip(axes, repos_comp)):
    ax.set_facecolor(BG)
    wedges, texts, autotexts = ax.pie(
        repo["slices"],
        labels=None,
        autopct="%1.0f%%",
        colors=repo["slice_colors"],
        startangle=90,
        pctdistance=0.75,
        wedgeprops={"edgecolor": BG, "linewidth": 2},
    )
    for t in autotexts:
        t.set_fontsize(8)
        t.set_color(WHITE)
    
    ax.set_title(f"{repo['name']}\n{repo['stars']:,} ⭐", 
                 fontsize=9.5, color=repo["color"], pad=6)
    
    # Legend
    patches = [mpatches.Patch(color=c, label=l) 
               for c, l in zip(repo["slice_colors"], repo["slice_labels"])]
    ax.legend(handles=patches, loc="lower center", bbox_to_anchor=(0.5, -0.32),
              fontsize=7, ncol=3, frameon=False, labelcolor=WHITE)

fig.suptitle("What's Actually in a Personal AI Stack?\nContent composition of the top 3 repos", 
             fontsize=12, color=WHITE, y=1.02)

plt.tight_layout(pad=1.5)
fig.savefig(OUT / "content-composition.png", dpi=150, bbox_inches="tight", facecolor=BG)
plt.close()
print("✓ content-composition.png")

print("\n✅ All images generated!")
