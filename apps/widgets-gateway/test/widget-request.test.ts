import assert from 'node:assert/strict';
import { test } from 'node:test';
import { composeWithBar, renderBar } from '../lib/compose';
import { noticeText, parseWidgetRequest, retiredSnapshotText } from '../lib/widget-request';

function params(query: string) {
  return new URLSearchParams(query);
}

test('equivalent widget addresses share one snapshot', () => {
  const a = parseWidgetRequest('official', 'analyze-repo-stars-history', params('repo_id=41986369&image_size=auto&color_scheme=dark'));
  const b = parseWidgetRequest('official', 'analyze-repo-stars-history', params('color_scheme=dark&utm_source=x&image_size=auto&repo_id=41986369&__name=ignored'));
  assert.ok(a && b);
  assert.equal(a.snapshotPath, b.snapshotPath);
  assert.equal(a.query, 'color_scheme=dark&image_size=auto&repo_id=41986369');
});

test('the snapshot path can be read back into the widget address', () => {
  const widget = parseWidgetRequest('official', 'compose-last-28-days-stats', params('repo_id=1&color_scheme=light'));
  assert.ok(widget);
  const encoded = widget.snapshotPath.split('/').pop()!.replace(/\.png$/, '');
  assert.equal(Buffer.from(encoded, 'base64url').toString(), 'color_scheme=light&repo_id=1');
  assert.equal(widget.colorScheme, 'light');
});

test('light and dark variants are stored separately', () => {
  const dark = parseWidgetRequest('official', 'x', params('repo_id=1&color_scheme=dark'));
  const light = parseWidgetRequest('official', 'x', params('repo_id=1&color_scheme=light'));
  assert.notEqual(dark?.snapshotPath, light?.snapshotPath);
});

test('addresses the gateway should not store are rejected', () => {
  assert.equal(parseWidgetRequest('other', 'x', params('')), null);
  assert.equal(parseWidgetRequest('official', '../secrets', params('')), null);
  assert.equal(parseWidgetRequest('official', 'x', params('repo_id=<script>')), null);
  assert.equal(parseWidgetRequest('official', 'x', params(`repo_ids=${'1,'.repeat(400)}`)), null);
});

test('the snapshot date is written in UTC', () => {
  assert.equal(retiredSnapshotText(new Date('2026-12-03T23:30:00Z')).detail, 'Snapshot from December 3, 2026 · no longer updates');
});

test('the notice bar is attached below the image without changing it', async () => {
  const { createCanvas, loadImage } = await import('@napi-rs/canvas');
  const source = createCanvas(1310, 398);
  const ctx = source.getContext('2d');
  ctx.fillStyle = '#123456';
  ctx.fillRect(0, 0, 1310, 398);
  const composed = await loadImage(await composeWithBar(source.toBuffer('image/png'), 'dark', noticeText()));
  assert.equal(composed.width, 1310);
  assert.equal(composed.height, 398 + 12 + 84);

  const check = createCanvas(composed.width, composed.height);
  const checkCtx = check.getContext('2d');
  checkCtx.drawImage(composed, 0, 0);
  assert.deepEqual([...checkCtx.getImageData(600, 200, 1, 1).data], [0x12, 0x34, 0x56, 255]);
  // The gap between image and bar stays transparent.
  assert.equal(checkCtx.getImageData(600, 398 + 6, 1, 1).data[3], 0);
});

test('the bar still renders on a very narrow image', async () => {
  const { createCanvas, loadImage } = await import('@napi-rs/canvas');
  const source = createCanvas(360, 200);
  const composed = await loadImage(await composeWithBar(source.toBuffer('image/png'), 'light', noticeText()));
  assert.equal(composed.width, 360);
  assert.ok(composed.height > 200);
  assert.ok((await loadImage(renderBar('light', noticeText(), 360))).width === 360);
});
