import { Command } from 'commander';
import * as fs from 'fs';
import { glob } from 'glob';
import { Liquid } from 'liquidjs';
import * as path from 'path';
import pino from 'pino';
import Logger = pino.Logger;
import * as TS from 'typescript'
TS.createProgram({ rootNames: [], options: {} })
const renderer = new Liquid();

export function initWidgetsGenModulesCommand (parentCommand: Command, logger: Logger) {
  parentCommand
    .command('gen-modules')
    .description('Generate widgets modules')
    .requiredOption(
      '-o, --out-file <string>',
      'Output file',
      value => value,
      path.resolve(process.cwd(), '../../widgets/index.js'),
    )
    .action(async ({ outFile }) => {
      const template = fs.readFileSync(path.join(process.cwd(), 'templates/widget-module.js.liquid'), 'utf-8');

      const base = process.cwd();
      const widgetsPath = path.resolve(base, '../../widgets');
      const outDir = path.dirname(outFile);

      const toImportPath = (filePath: string) => {
        const rel = path.relative(outDir, filePath).replaceAll(path.sep, '/');
        return rel.startsWith('.') ? rel : `./${rel}`;
      };

      const pkgs = glob.sync('**/*/package.json', {
        ignore: ['**/node_modules/**'],
        cwd: widgetsPath,
      });

      const manifest: any[] = [];

      pkgs.forEach(pkg => {
        const pkgPath = path.join(widgetsPath, pkg);

        const { name, version, private: isPrivate, keywords, description, author, main, module } = require(pkgPath);
        const meta = { name, version, private: isPrivate, keywords, description, author };

        const dir = path.dirname(pkgPath);

        const paramsPath = path.join(dir, 'params.json');
        const datasourcePath = path.join(dir, 'datasource.json');
        const visualizerPath = path.join(dir, main);
        const metadataPath = path.join(dir, 'metadata.ts');

        manifest.push({
          name,
          isPrivate,
          paramsPath: toImportPath(paramsPath),
          datasourcePath: toImportPath(datasourcePath),
          visualizerPath: toImportPath(visualizerPath),
          metadataPath: fs.existsSync(metadataPath) ? toImportPath(metadataPath) : undefined,
          isJsx: /\.[jt]sx$/.test(visualizerPath),
          meta,
        });
      });

      const code = await renderer.parseAndRender(template, {
        manifest,
      });

      fs.mkdirSync(path.dirname(outFile), { recursive: true })
      fs.writeFileSync(outFile, code);
    });
}
