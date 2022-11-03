import { Plugin } from '@docusaurus/types';
import path from 'node:path';
import { NormalModuleReplacementPlugin } from 'webpack';
import { createHash } from 'node:crypto';
import fsp from 'node:fs/promises';
import assert from 'node:assert';
import cp from 'node:child_process';

const PROJ_ROOT = path.resolve(__dirname, '../..');
const SOURCE_FILE = 'node_modules/@docusaurus/core/lib/client/serverEntry.js';
const PATCH_FILE = path.resolve(__dirname, 'serverEntry.js.patch');
const PATCH_TARGET_FILE = path.resolve(__dirname, 'serverEntry.js');

const CMD_PATCH = `patch ${SOURCE_FILE} ${PATCH_FILE} -o ${PATCH_TARGET_FILE}`;

export default function PrefetchPlugin (): Plugin<void> {
  if (process.env.NODE_ENV !== 'production') {
    return {
      name: 'plugin-material-ui',
    };
  }

  return {
    name: 'plugin-material-ui',
    async loadContent () {
      const DOCUSAURUS_CORE_VERSION: string = require(path.resolve(PROJ_ROOT, 'package-lock.json')).packages['node_modules/@docusaurus/core'].version;

      // Check md5 of serverEntry.js
      const ORIGINAL_MD5 = await fsp.readFile(path.resolve(__dirname, 'serverEntry.js.md5'), { encoding: 'utf-8' });
      const md5 = createHash('md5')
        .update(await fsp.readFile(path.resolve(PROJ_ROOT, SOURCE_FILE)))
        .digest('hex');
      assert(
        md5 === ORIGINAL_MD5,
        `MD5 of file ${SOURCE_FILE} (${md5}) not matched (requires ${ORIGINAL_MD5}). The file was hacked based on official @docusaurus/core ${DOCUSAURUS_CORE_VERSION}, ensure you install the same version or the file was not changed.`,
      );

      // do patch
      await new Promise<void>((resolve, reject) => {
        const proc = cp.exec(CMD_PATCH);
        const errChunks: any[] = [];
        proc.stderr?.on('readable', () => {
          let chunk;
          while ((chunk = proc.stderr?.read()) != null) {
            errChunks.push(chunk);
          }
        });
        proc.on('exit', () => {
          if (proc.exitCode === 0) {
            resolve();
          } else {
            reject(new Error(`Failed to patch file ${SOURCE_FILE}: \n${errChunks.join('')}`));
          }
        });
      });
    },
    configureWebpack () {
      return {
        plugins: [
          new NormalModuleReplacementPlugin(/@docusaurus\/core\/lib\/client\/serverEntry\.js/, path.resolve(__dirname, './serverEntry.js')),
        ],
      };
    },
  };
}
