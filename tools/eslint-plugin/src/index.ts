import { parseWithPointers } from '@stoplight/json';
import type { ESLint, Linter } from 'eslint';
import fs from 'fs';
import { validateRefDatasource } from './rules/datasource-ref';
import { validateDatasourceSchema } from './rules/datasource-schema';
import { validateParamsSchema } from './rules/params-schema';

const plugin: ESLint.Plugin = {
  processors: {
    'params': {
      supportsAutofix: false,
      preprocess (text: string, filename: string): (string | Linter.ProcessorFile)[] {
        if (/^|\/params\.json$/.test(filename)) {
          return [{ text, filename }];
        }
        return [];
      },
      postprocess (messages: Linter.LintMessage[][], filename: string): Linter.LintMessage[] {
        const source = fs.readFileSync(filename, { encoding: 'utf-8' });
        const result = parseWithPointers(source);

        return validateParamsSchema(result)
          .concat(...messages);
      },
    },
    'datasource': {
      supportsAutofix: false,
      preprocess (text: string, filename: string): (string | Linter.ProcessorFile)[] {
        if (/^|\/datasource\.json$/.test(filename)) {
          return [{ text, filename }];
        }
        return [];
      },
      postprocess (messages: Linter.LintMessage[][], filename: string): Linter.LintMessage[] {
        const source = fs.readFileSync(filename, { encoding: 'utf-8' });
        const result = parseWithPointers(source);

        function validateDatasource (datasource: any, i: number | undefined): Linter.LintMessage[] {
          if (datasource instanceof Array) {
            return datasource.flatMap(validateDatasource);
          } else {
            switch (datasource.type) {
              case 'api':
                return [];
              case 'ref':
                return validateRefDatasource(result, datasource, i);
            }
          }
        }

        return validateDatasourceSchema(result)
          .concat(validateDatasource(result.data, undefined))
          .concat(...messages);
      },
    },
  },
  rules: {},
  configs: {
    'recommended': {
      overrides: [
        {
          files: '*/params.json',
          plugins: ['ossinsight'],
          parser: 'jsonc-eslint-parser',
          processor: 'ossinsight/params',
          rules: {
            'ossinsight/*': 2,
          },
        },
        {
          files: '*/datasource.json',
          plugins: ['ossinsight'],
          parser: 'jsonc-eslint-parser',
          processor: 'ossinsight/datasource',
          rules: {
            'ossinsight/*': 2,
          },
        },
      ],
    },
  },
};

export = plugin;
