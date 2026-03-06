"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWidgetsGenTypesCommand = initWidgetsGenTypesCommand;
const fs = require("fs");
const glob_1 = require("glob");
const liquidjs_1 = require("liquidjs");
const path = require("path");
const renderer = new liquidjs_1.Liquid();
renderer.registerFilter('when', (v, some) => some ? v : '');
renderer.registerFilter('ifnull', (v, fallback) => v ? v : fallback);
function initWidgetsGenTypesCommand(parentCommand, logger) {
    parentCommand
        .command('gen-types')
        .description('Generate type definitions for widgets')
        .requiredOption('-o, --out-file <string>', 'Output file', value => value, path.resolve(process.cwd(), '../../src/lib/widgets-types/widgets.d.ts'))
        .action(async ({ outFile }) => {
        const template = fs.readFileSync(path.join(process.cwd(), 'templates/widget-type.d.ts.liquid'), 'utf-8');
        const base = process.cwd();
        const widgetsPath = path.resolve(base, '../../widgets');
        const pkgs = glob_1.glob.sync('**/*/package.json', {
            ignore: ['**/node_modules/**'],
            cwd: widgetsPath,
        });
        const manifest = [];
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
