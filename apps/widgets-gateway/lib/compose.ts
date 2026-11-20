import { createCanvas, GlobalFonts, loadImage, type SKRSContext2D } from '@napi-rs/canvas';
import { BOLD_TTF_BASE64, REGULAR_TTF_BASE64 } from './fonts';

const FONT_FAMILY = 'GatewaySans';
let fontsRegistered = false;

function ensureFonts() {
  if (fontsRegistered) {
    return;
  }
  GlobalFonts.register(Buffer.from(REGULAR_TTF_BASE64, 'base64'), FONT_FAMILY);
  GlobalFonts.register(Buffer.from(BOLD_TTF_BASE64, 'base64'), FONT_FAMILY);
  fontsRegistered = true;
}

export type ColorScheme = 'dark' | 'light';

export interface BarText {
  /** Bold lead, always shown. */
  strong: string;
  /** Secondary text, dropped when the bar is too narrow for it. */
  detail?: string;
  /** Colour role of the lead: `warning` before the shutdown, `plain` after it. */
  tone: 'warning' | 'plain';
}

const THEMES: Record<ColorScheme, { bg: string; border: string; plain: string; detail: string; warning: string; link: string }> = {
  dark: { bg: '#24232f', border: '#343340', plain: '#c8c8cc', detail: '#a0a0a8', warning: '#ffe895', link: '#e06c64' },
  light: { bg: '#ffffff', border: '#e5e5e5', plain: '#3c3c3c', detail: '#6e6e74', warning: '#9a6700', link: '#cf463e' },
};

// Widget images are rendered at 2x, so these are device pixels for a typical 1310-1920px wide image.
const BASE_WIDTH = 1310;
const BAR_HEIGHT = 84;
const GAP = 12;
const RADIUS = 18;
const PADDING = 36;
const STRONG_SIZE = 25;
const DETAIL_SIZE = 23;
const LINK_TEXT = 'ossinsight.io';
/** Width of the bar image that is served when there is no widget image to attach it to. */
export const STANDALONE_BAR_WIDTH = 1442;

function drawBar(ctx: SKRSContext2D, x: number, y: number, width: number, scheme: ColorScheme, text: BarText) {
  const theme = THEMES[scheme];
  // Shrink everything on images narrower than a normal widget so the bar keeps its proportions.
  const scale = Math.min(1, Math.max(0.5, width / BASE_WIDTH));
  const height = Math.round(BAR_HEIGHT * scale);
  const padding = Math.round(PADDING * scale);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 1, width - 2, height - 2, RADIUS * scale);
  ctx.fillStyle = theme.bg;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = theme.border;
  ctx.stroke();

  ctx.textBaseline = 'middle';
  const middle = y + height / 2;
  const available = width - padding * 2;

  const linkFont = `${Math.round(DETAIL_SIZE * scale)}px ${FONT_FAMILY}`;
  ctx.font = linkFont;
  const linkWidth = ctx.measureText(LINK_TEXT).width;
  const gap = 24 * scale;

  // The lead must always fit: reduce its size until it does, dropping the link first if needed.
  let strongSize = Math.round(STRONG_SIZE * scale);
  let showLink = true;
  const strongWidthAt = (size: number) => {
    ctx.font = `bold ${size}px ${FONT_FAMILY}`;
    return ctx.measureText(text.strong).width;
  };
  if (strongWidthAt(strongSize) + gap + linkWidth > available) {
    showLink = false;
  }
  while (strongSize > 10 && strongWidthAt(strongSize) > available) {
    strongSize -= 1;
  }
  const strongWidth = strongWidthAt(strongSize);

  ctx.font = `bold ${strongSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = text.tone === 'warning' ? theme.warning : theme.plain;
  ctx.textAlign = 'left';
  ctx.fillText(text.strong, x + padding, middle);

  if (text.detail && showLink) {
    ctx.font = linkFont;
    const detailWidth = ctx.measureText(text.detail).width;
    const detailX = x + padding + strongWidth + 18 * scale;
    if (detailX + detailWidth + gap + linkWidth <= x + width - padding) {
      ctx.fillStyle = theme.detail;
      ctx.fillText(text.detail, detailX, middle);
    }
  }

  if (showLink) {
    ctx.font = linkFont;
    ctx.fillStyle = theme.link;
    ctx.textAlign = 'right';
    ctx.fillText(LINK_TEXT, x + width - padding, middle);
  }
  ctx.restore();

  return height;
}

function barHeightFor(width: number) {
  return Math.round(BAR_HEIGHT * Math.min(1, Math.max(0.5, width / BASE_WIDTH)));
}

/** Returns the widget image with a notice bar attached underneath. The widget image itself is not altered. */
export async function composeWithBar(png: Buffer, scheme: ColorScheme, text: BarText): Promise<Buffer> {
  ensureFonts();
  const image = await loadImage(png);
  const gap = Math.round(GAP * Math.min(1, Math.max(0.5, image.width / BASE_WIDTH)));
  const canvas = createCanvas(image.width, image.height + gap + barHeightFor(image.width));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  drawBar(ctx, 0, image.height + gap, image.width, scheme, text);
  return canvas.toBuffer('image/png');
}

/** Returns the notice bar on its own, for widget addresses that have no snapshot. */
export function renderBar(scheme: ColorScheme, text: BarText, width = STANDALONE_BAR_WIDTH): Buffer {
  ensureFonts();
  const canvas = createCanvas(width, barHeightFor(width));
  drawBar(canvas.getContext('2d'), 0, 0, width, scheme, text);
  return canvas.toBuffer('image/png');
}
