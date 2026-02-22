import https from "node:https";
import http from "node:http";
import zlib from "node:zlib";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink } from "node:fs/promises";

const GHARCHIVE_BASE_URL =
  process.env.GHARCHIVE_BASE_URL ?? "https://data.gharchive.org";

/** Download a GH Archive gzip file and return a readable stream of raw bytes. */
export async function fetchGHArchiveStream(filename: string): Promise<Readable> {
  const url = `${GHARCHIVE_BASE_URL}/${filename}`;
  const stream = await httpGet(url);
  // Decompress on the fly
  const gunzip = zlib.createGunzip();
  stream.pipe(gunzip);
  return gunzip as unknown as Readable;
}

/** Download a GH Archive file to a temp file and return its path. */
export async function downloadGHArchiveFile(filename: string): Promise<string> {
  const url = `${GHARCHIVE_BASE_URL}/${filename}`;
  const tmpPath = join(tmpdir(), `gharchive-${Date.now()}-${filename}`);

  const stream = await httpGet(url);
  await pipeline(stream, createWriteFile(tmpPath));
  return tmpPath;
}

export async function cleanupFile(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function httpGet(url: string): Promise<Readable> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode === 404) {
          reject(new Error(`404 Not Found: ${url}`));
          res.resume();
          return;
        }
        if (res.statusCode !== 200) {
          reject(
            new Error(`Unexpected status ${res.statusCode} for ${url}`)
          );
          res.resume();
          return;
        }
        resolve(res as unknown as Readable);
      })
      .on("error", reject);
  });
}

function createWriteFile(path: string) {
  return createWriteStream(path);
}
