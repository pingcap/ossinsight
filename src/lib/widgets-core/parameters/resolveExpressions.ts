import { ParameterDefinitions } from '@ossinsight/widgets-types';
import parsers from './parser';

export function resolveExpressions (params: ParameterDefinitions) {
  const parameters: Record<string, any> = {};

  Object.entries(params).forEach(([name, config]) => {
    if ('expression' in config) {
      parameters[name] = parsers[config.type]('', config);
    }
  });

  return parameters;
}