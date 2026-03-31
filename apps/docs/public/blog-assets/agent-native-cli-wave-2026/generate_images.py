#!/usr/bin/env python3
"""Generate blog images for agent-native-cli-wave-2026 post."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ─────────────────────────────────────────────
# 1. Cover image  (1200×630)
# ─────────────────────────────────────────────
def make_cover():
    img = Image.new("RGB", (1200, 630), color="#0d1117")
    draw = ImageDraw.Draw(img)

    # background gradient strips
    for i in range(630):
        ratio = i / 630
        r = int(13 + ratio * 10)
        g = int(17 + ratio * 8)
        b = int(23 + ratio * 40)
        draw.line([(0, i), (1200, i)], fill=(r, g, b))

    # accent glow (top-left)
    for radius in range(300, 0, -20):
        alpha = int(30 * (1 - radius / 300))
        draw.ellipse([-radius + 100, -radius + 150, radius + 100, radius + 150],
                     fill=(100, 60, 200, alpha) if False else None,
                     outline=(100, 60, 200))

    # Try to use a default font; fall back to default
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
        font_sub = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        font_tag = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_small = font_title
        font_tag = font_title

    # Tag line
    draw.text((80, 60), "GITHUB TREND REPORT  ·  MARCH 2026", fill="#7c8db5", font=font_tag)

    # Main title
    draw.text((80, 120), "The Agent Interface", fill="#e6edf3", font=font_title)
    draw.text((80, 210), "Layer", fill="#7ee787", font=font_title)

    # Subtitle
    draw.text((80, 310), "How software is being re-wrapped for AI agents —", fill="#8b949e", font=font_sub)
    draw.text((80, 355), "and why it looks exactly like the REST API wave.", fill="#8b949e", font=font_sub)

    # Key stats  (right side)
    stats = [
        ("25,212 ⭐", "CLI-Anything", "in 23 days"),
        ("23,219 ⭐", "Google Workspace CLI", "in 28 days"),
        ("25,808 ⭐", "agent-browser", "in 79 days"),
    ]
    x0 = 700
    for i, (num, name, period) in enumerate(stats):
        y = 130 + i * 130
        # card bg
        draw.rounded_rectangle([x0, y, 1140, y + 100], radius=12, fill="#161b22", outline="#30363d")
        draw.text((x0 + 20, y + 12), num, fill="#7ee787", font=font_sub)
        draw.text((x0 + 20, y + 52), name, fill="#e6edf3", font=font_small)
        draw.text((x0 + 20, y + 76), period, fill="#7c8db5", font=font_tag)

    # Footer
    draw.text((80, 570), "ossinsight.io", fill="#388bfd", font=font_small)

    img.save(os.path.join(OUT_DIR, "cover.png"))
    print("✓ cover.png")


# ─────────────────────────────────────────────
# 2. Star growth rate comparison (bar chart)
# ─────────────────────────────────────────────
def make_star_growth_chart():
    repos = [
        "CLI-Anything\n(HKUDS)",
        "Google\nWorkspace CLI",
        "larksuite/cli",
        "agent-browser\n(Vercel Labs)",
        "jackwener/\nopencli",
        "Agent-Reach\n(Panniantong)",
    ]
    stars_per_day = [1096, 829, 944, 331, 576, 408]
    colors = ["#7ee787", "#58a6ff", "#d2a8ff", "#ffa657", "#f78166", "#79c0ff"]

    fig, ax = plt.subplots(figsize=(12, 6))
    fig.patch.set_facecolor("#0d1117")
    ax.set_facecolor("#161b22")

    bars = ax.barh(repos, stars_per_day, color=colors, height=0.6)

    for bar, val in zip(bars, stars_per_day):
        ax.text(bar.get_width() + 15, bar.get_y() + bar.get_height() / 2,
                f"{val:,} ⭐/day", va="center", color="#e6edf3", fontsize=11, fontweight="bold")

    ax.set_xlabel("Stars per Day (lifetime average)", color="#8b949e", fontsize=12)
    ax.set_title("Agent-Native CLI Repos: Star Velocity (Q1 2026)", color="#e6edf3", fontsize=14, pad=15)
    ax.tick_params(colors="#8b949e", labelsize=10)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["bottom"].set_color("#30363d")
    ax.spines["left"].set_color("#30363d")
    ax.set_xlim(0, 1350)
    ax.xaxis.label.set_color("#8b949e")
    for spine in ax.spines.values():
        spine.set_color("#30363d")
    ax.tick_params(axis="x", colors="#8b949e")
    ax.tick_params(axis="y", colors="#e6edf3")

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "star-velocity.png"), dpi=150, facecolor="#0d1117")
    plt.close()
    print("✓ star-velocity.png")


# ─────────────────────────────────────────────
# 3. Fork ratio comparison (signal of real usage)
# ─────────────────────────────────────────────
def make_fork_ratio_chart():
    repos = [
        "CLI-Anything",
        "Gworkspace CLI",
        "agent-browser",
        "larksuite/cli",
        "Agent-Reach",
        "opencli",
    ]
    fork_ratios = [8.96, 4.90, 6.06, 4.62, 7.90, 8.35]  # percent
    total_stars = [25212, 23219, 25808, 4722, 13881, 9231]

    fig, ax = plt.subplots(figsize=(10, 5))
    fig.patch.set_facecolor("#0d1117")
    ax.set_facecolor("#161b22")

    scatter = ax.scatter(total_stars, fork_ratios,
                         s=[300] * len(repos),
                         c=["#7ee787", "#58a6ff", "#d2a8ff", "#ffa657", "#79c0ff", "#f78166"],
                         zorder=5, edgecolors="#30363d", linewidth=1)

    for i, (name, x, y) in enumerate(zip(repos, total_stars, fork_ratios)):
        ax.annotate(name, (x, y), textcoords="offset points", xytext=(10, 6),
                    color="#e6edf3", fontsize=10)

    # Reference line - average fork ratio across all GitHub repos ~2%
    ax.axhline(y=2.0, color="#f78166", linestyle="--", alpha=0.6, label="GitHub avg fork rate (~2%)")

    ax.set_xlabel("Total Stars", color="#8b949e", fontsize=11)
    ax.set_ylabel("Fork Ratio (%)", color="#8b949e", fontsize=11)
    ax.set_title("Fork Ratio vs Stars: Signal of Real Usage\n(High fork ratio = developers actually building with it)",
                 color="#e6edf3", fontsize=13, pad=12)
    ax.legend(facecolor="#161b22", edgecolor="#30363d", labelcolor="#8b949e")
    ax.tick_params(colors="#8b949e")
    for spine in ax.spines.values():
        spine.set_color("#30363d")

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fork-ratio.png"), dpi=150, facecolor="#0d1117")
    plt.close()
    print("✓ fork-ratio.png")


# ─────────────────────────────────────────────
# 4. Timeline / Wave chart
# ─────────────────────────────────────────────
def make_timeline_chart():
    fig, ax = plt.subplots(figsize=(13, 5))
    fig.patch.set_facecolor("#0d1117")
    ax.set_facecolor("#161b22")

    # Month markers
    months = ["Jan 2026", "Feb 2026", "Mar 2026"]
    month_x = [0, 31, 59]

    events = [
        # (day_offset_from_jan1, name, stars, color)
        (11, "agent-browser\n(Vercel Labs)", 25808, "#d2a8ff"),
        (35, "larksuite/cli\nlaunch — OSS", 4722, "#ffa657"),
        (59, "Google Workspace\nCLI", 23219, "#58a6ff"),
        (66, "jackwener/\nopencli", 9231, "#79c0ff"),
        (67, "CLI-Anything\n(HKUDS)", 25212, "#7ee787"),
        (84, "larksuite/cli\nofficial OSS", 4722, "#ffa657"),
    ]

    for x, name, stars, color in events:
        size = max(100, stars // 100)
        ax.scatter([x], [1], s=size, c=color, zorder=5, alpha=0.85)
        ax.annotate(name, (x, 1), textcoords="offset points",
                    xytext=(0, 18 if events.index((x, name, stars, color)) % 2 == 0 else -50),
                    ha="center", color=color, fontsize=9,
                    arrowprops=dict(arrowstyle="-", color=color, alpha=0.5))

    for mx, label in zip(month_x, months):
        ax.axvline(x=mx, color="#30363d", linestyle="--", alpha=0.6)
        ax.text(mx + 1, 0.92, label, color="#8b949e", fontsize=9)

    ax.set_xlim(-5, 95)
    ax.set_ylim(0.7, 1.5)
    ax.set_yticks([])
    ax.set_xticks([])
    ax.set_title("The Agent-Native CLI Wave: Q1 2026 Launch Timeline\n(bubble size = total stars)",
                 color="#e6edf3", fontsize=13, pad=12)
    for spine in ax.spines.values():
        spine.set_color("#30363d")

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "timeline.png"), dpi=150, facecolor="#0d1117")
    plt.close()
    print("✓ timeline.png")


if __name__ == "__main__":
    make_cover()
    make_star_growth_chart()
    make_fork_ratio_chart()
    make_timeline_chart()
    print("\nAll images generated ✓")
