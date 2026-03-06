"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWidgetsGenModulesCommand = initWidgetsGenModulesCommand;
const fs = require("fs");
const glob_1 = require("glob");
const liquidjs_1 = require("liquidjs");
const path = require("path");
const TS = require("typescript");
TS.createProgram({ rootNames: [], options: {} });
const renderer = new liquidjs_1.Liquid();
function initWidgetsGenModulesCommand(parentCommand, logger) {
    parentCommand
        .command('gen-modules')
        .description('Generate widgets modules')
        .requiredOption('-o, --out-file <string>', 'Output file', value => value, path.resolve(process.cwd(), '../../widgets/index.js'))
        .action(async ({ outFile }) => {
        const template = fs.readFileSync(path.join(process.cwd(), 'templates/widget-module.js.liquid'), 'utf-8');
        const base = process.cwd();
        const widgetsPath = path.resolve(base, '../../widgets');
        const outDir = path.dirname(outFile);
        const toImportPath = (filePath) => {
            const rel = path.relative(outDir, filePath).replaceAll(path.sep, '/');
            return rel.startsWith('.') ? rel : `./${rel}`;
        };
        const pkgs = glob_1.glob.sync('**/*/package.json', {
            ignore: ['**/node_modules/**'],
            cwd: widgetsPath,
        });
        const manifest = [];
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
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, code);
    });
}
