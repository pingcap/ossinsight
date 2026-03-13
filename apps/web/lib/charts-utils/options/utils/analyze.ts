import _ from 'lodash';

// TODO
interface AnalyzeTemplateParams<T> {
  id: 'main' | 'vs';
}

// TODO
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
