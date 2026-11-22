import { put } from '@vercel/blob';
import { waitUntil } from '@vercel/functions';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { composeWithBar, renderBar } from '../lib/compose';
import { noticeText, parseWidgetRequest, retiredSnapshotText, retiredWithoutSnapshotText, type WidgetRequest } from '../lib/widget-request';

/**
 * `notice`: the widget service is still running. Fetch the live image, keep a copy, and attach a shutdown notice.
 * `retired`: the widget service is gone. Serve the stored copy with a retired notice, or the notice alone.
 */
const MODE = process.env.WIDGET_MODE === 'retired' ? 'retired' : 'notice';
const ORIGIN = (process.env.WIDGET_ORIGIN ?? 'https://ossinsight-next-pingcap.vercel.app').replace(/\/$/, '');
const ORIGIN_TIMEOUT_MS = 50_000;

/** The response object Vercel passes to Node.js functions: Node's own, plus two helpers. */
type FunctionResponse = ServerResponse & {
  status(code: number): FunctionResponse;
  send(body: Buffer | string): FunctionResponse;
};

function snapshotBaseUrl(): string | null {
  if (process.env.SNAPSHOT_BASE_URL) {
    return process.env.SNAPSHOT_BASE_URL.replace(/\/$/, '');
  }
  // A read-write token looks like `vercel_blob_rw_<storeId>_<secret>`; public files live under the store id.
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.split('_')[3];
  return storeId ? `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com` : null;
}

async function readSnapshot(widget: WidgetRequest): Promise<{ png: Buffer; date: Date | null } | null> {
  const base = snapshotBaseUrl();
  if (!base) {
    return null;
  }
  try {
    const response = await fetch(`${base}/${widget.snapshotPath}`, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) {
      return null;
    }
    const modified = response.headers.get('last-modified');
    const date = modified ? new Date(modified) : null;
    return {
      png: Buffer.from(await response.arrayBuffer()),
      date: date && !Number.isNaN(date.getTime()) ? date : null,
    };
  } catch (error) {
    console.error('snapshot read failed', widget.snapshotPath, error);
    return null;
  }
}

function storeSnapshot(widget: WidgetRequest, png: Buffer) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }
  waitUntil(
    put(widget.snapshotPath, png, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'image/png',
      cacheControlMaxAge: 300,
    }).catch((error) => console.error('snapshot write failed', widget.snapshotPath, error)),
  );
}

function sendPng(res: FunctionResponse, png: Buffer, cacheControl: string, source: string) {
  res.status(200);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('X-Widget-Gateway', source);
  res.send(png);
}

function originalQuery(params: URLSearchParams): string {
  const forwarded = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    // `__vendor` and `__name` are added by the rewrite in vercel.json.
    if (!key.startsWith('__')) {
      forwarded.append(key, value);
    }
  }
  const query = forwarded.toString();
  return query ? `?${query}` : '';
}

export default async function handler(req: IncomingMessage, res: FunctionResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).send('Method Not Allowed');
    return;
  }

  const url = new URL(req.url ?? '/', 'https://next.ossinsight.io');
  const fromPath = url.pathname.match(/^\/widgets\/([^/]+)\/([^/]+)\/thumbnail\.png$/);
  const vendor = url.searchParams.get('__vendor') ?? fromPath?.[1];
  const name = url.searchParams.get('__name') ?? fromPath?.[2];
  const widget = parseWidgetRequest(vendor, name ? decodeURIComponent(name) : undefined, url.searchParams);
  const scheme = url.searchParams.get('color_scheme') === 'light' ? 'light' : 'dark';

  if (MODE === 'retired') {
    const snapshot = widget ? await readSnapshot(widget) : null;
    if (snapshot) {
      try {
        const png = await composeWithBar(snapshot.png, scheme, retiredSnapshotText(snapshot.date));
        sendPng(res, png, 'public, max-age=86400, s-maxage=2592000', 'retired-snapshot');
        return;
      } catch (error) {
        console.error('compose failed for snapshot', widget?.snapshotPath, error);
      }
    }
    sendPng(res, renderBar(scheme, retiredWithoutSnapshotText()), 'public, max-age=86400, s-maxage=86400', 'retired-notice');
    return;
  }

  // Notice mode: ask the live widget service for the image, exactly as it was requested.
  const originUrl = `${ORIGIN}/widgets/${encodeURIComponent(vendor ?? '')}/${encodeURIComponent(name ?? '')}/thumbnail.png${originalQuery(url.searchParams)}`;
  let upstream: Response | null = null;
  try {
    upstream = await fetch(originUrl, { signal: AbortSignal.timeout(ORIGIN_TIMEOUT_MS) });
  } catch (error) {
    console.error('origin fetch failed', originUrl, error);
  }

  if (upstream?.ok && upstream.headers.get('content-type')?.includes('image/png')) {
    const original = Buffer.from(await upstream.arrayBuffer());
    if (widget) {
      storeSnapshot(widget, original);
    }
    try {
      const png = await composeWithBar(original, scheme, noticeText());
      sendPng(res, png, 'public, max-age=3600, s-maxage=3600', 'live');
    } catch (error) {
      console.error('compose failed for live image', originUrl, error);
      sendPng(res, original, 'public, max-age=600, s-maxage=600', 'live-unmodified');
    }
    return;
  }

  // The widget service failed. Show the last good image for this address if there is one.
  const snapshot = widget ? await readSnapshot(widget) : null;
  if (snapshot) {
    try {
      const png = await composeWithBar(snapshot.png, scheme, noticeText());
      sendPng(res, png, 'public, max-age=600, s-maxage=600', 'snapshot');
      return;
    } catch (error) {
      console.error('compose failed for snapshot', widget?.snapshotPath, error);
    }
  }

  // Nothing better to offer: pass the failure through unchanged and do not let it be cached.
  res.status(upstream?.status ?? 502);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Widget-Gateway', 'origin-error');
  const contentType = upstream?.headers.get('content-type');
  if (contentType) {
    res.setHeader('Content-Type', contentType);
  }
  res.send(upstream ? Buffer.from(await upstream.arrayBuffer()) : 'Widget service unavailable');
}
