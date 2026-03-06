import { getLocationForJsonPath, JsonParserResult } from '@stoplight/json';
import type { Linter } from 'eslint';
import fs from 'fs';
import * as path from 'path';
import { transformJsonRange } from '../utils';

export function validateRefDatasource (result: JsonParserResult<any>, datasource: any, i: number | undefined): Linter.LintMessage[] {
  const widget = datasource.widget.replace(/^@ossinsight\/widget-/, '');
  try {
    const stats = fs.statSync(path.join(widget, 'package.json'));
    if (!stats.isFile()) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error('not a valid widget reference');
    }
    return []
  } catch (e) {
    const path = typeof i === 'number' ? [i, 'widget'] : ['widget'];
    const location = getLocationForJsonPath(result, path);

    return [{
      ruleId: 'ossinsight/datasource-ref',
      ...transformJsonRange(location),
      message: e.message,
      severity: 2,
    }];
  }
}