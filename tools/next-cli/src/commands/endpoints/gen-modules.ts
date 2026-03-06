import {Command} from "commander";
import * as fs from "fs";
import {glob} from "glob";
import {Liquid} from "liquidjs";
import * as path from "path";
import pino from "pino";
import Logger = pino.Logger;

const renderer = new Liquid();

export function initEndpointsGenModulesCommand(parentCommand: Command, logger: Logger) {
  parentCommand
    .command('gen-modules')
    .description('Bundle the endpoints\' config into one file.')
    .requiredOption<string>(
      '-e, --endpoints-dir <string>',
      'Specifies the directory to load the endpoint configs.',
      (value) => value,
      path.resolve(process.cwd(), '../../src/lib/data-service/endpoints')
    )
    .requiredOption<string>(
      '-o, --output-path <string>',
      'Specifies the output path to save the entry code.',
      (value) => value,
      path.resolve(process.cwd(), '../../src/lib/data-service/endpoints')
    )
    .action(async ({ endpointsDir, outputPath }) => {
      const endpointTemplateFile = path.resolve(process.cwd(), 'templates/endpoint.js.liquid');
      const endpointsTemplateFile = path.resolve(process.cwd(), 'templates/endpoints.js.liquid');

      // Check if the endpoints directory exists.
      if (!fs.existsSync(endpointsDir)) {
        logger.error(`The endpoints config directory "${endpointsDir}" does not exist, please check the --endpoints-dir argument.`);
        return;
      }
      const endpointBaseDir = path.isAbsolute(endpointsDir) ? endpointsDir : path.resolve(process.cwd(), endpointsDir);

      // Check if the functions directory exists.

      fs.mkdirSync(outputPath, { recursive: true });


      // Load function template.
      const endpointTemplate = renderer.parse(fs.readFileSync(endpointTemplateFile, 'utf-8'));
      const endpointsTemplate = renderer.parse(fs.readFileSync(endpointsTemplateFile, 'utf-8'));

      // Traverse the endpoint config directory.
      const endpointJSONFiles = await glob('**/params.json', {
        cwd: endpointBaseDir,
      });

      const queries: Record<string, any>[] = [];
      for (const endpointJSONFile of endpointJSONFiles) {
        // Read endpoint SQL.
        const endpointDir = path.dirname(endpointJSONFile);

        const dir = path.join(outputPath, endpointDir)
        const res = await renderer.render(endpointTemplate);

        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.js'), res);

        queries.push({
          name: endpointDir,
        });
      }

      queries.sort((a, b) => a.name.localeCompare(b.name));

      // Generate function code.
      const entryCode = await renderer.render(endpointsTemplate, {
        endpoints: queries,
      });
      fs.writeFileSync(path.join(outputPath, 'index.js'), entryCode);
    })
}
