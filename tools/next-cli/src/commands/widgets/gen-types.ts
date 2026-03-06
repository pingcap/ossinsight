import { Command } from 'commander';
import * as fs from 'fs';
import { glob } from 'glob';
import { Liquid } from 'liquidjs';
import * as path from 'path';
import pino from 'pino';
import Logger = pino.Logger;

const renderer = new Liquid();

renderer.registerFilter('when', (v, some) => some ? v : '');
renderer.registerFilter('ifnull', (v, fallback) => v ? v : fallback);

export function initWidgetsGenTypesCommand (parentCommand: Command, logger: Logger) {
  parentCommand
    .command('gen-types')
    .description('Generate type definitions for widgets')
    .requiredOption(
      '-o, --out-file <string>',
      'Output file',
      value => value,
      path.resolve(process.cwd(), '../../src/lib/widgets-types/widgets.d.ts'),
    )
    .action(async ({ outFile }) => {
      const template = fs.readFileSync(path.join(process.cwd(), 'templates/widget-type.d.ts.liquid'), 'utf-8');

      const base = process.cwd();
      const widgetsPath = path.resolve(base, '../../widgets');

      const pkgs = glob.sync('**/*/package.json', {
        ignore: ['**/node_modules/**'],
        cwd: widgetsPath,
      });

      const manifest: any[] = [];

      pkgs.forEach(pkg => {
        const pkgPath = path.join(widgetsPath, pkg);

        const { name, private: isPrivate, description } = require(pkgPath);

        const dir = path.dirname(pkgPath);
        const paramsPath = path.join(dir, 'params.json');
        const params = require(paramsPath);

        manifest.push({
          name,
          isPrivate,
          description,
          params,
        });
      });

      const code = await renderer.parseAndRender(template, {
        manifest,
        typeMap,
      });

      fs.writeFileSync(outFile, code);
    });
}

const typeMap = {
  'repo-id': 'number',
  'user-id': 'number',
  'org-id': 'number',
  'owner-id': 'number',
  'collection-id': 'number',
  'day': 'number',
  'month': 'number',
  'time': 'string',
  'datetime': 'string',
  'event-type': 'string',
  'activity-type': 'string',
  'time-period': 'string',
  'time-zone': 'number',
  'luxon-datetime': 'any // TODO',
  'limit': 'number',
  'string': 'string',
  'repo_ids': 'number[]',
};
