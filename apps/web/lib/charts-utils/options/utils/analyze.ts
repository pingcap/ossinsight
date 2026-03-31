import _ from 'lodash';

interface AnalyzeTemplateParams<T> {
  id: 'main' | 'vs';
}

export function template<P, T = any>(
  fp: (params: AnalyzeTemplateParams<P>, i: number) => T | T[],
  vs?: boolean
) {
  const result = [];

  result.push(fp({ id: 'main' }, 0));

  if (vs) {
    result.push(fp({ id: 'vs' }, 1));
  }

  return _.flatMap(result);
}
