import ChartJs, { ScriptableContext } from 'chart.js/auto';
import { notNullish } from '@site/src/utils/value';

type ResponsiveObject<T extends object> = {
  [P in keyof T]: Array<T[P]>
};

type ResponsiveValue<T> = T[];

type Responsive<T> = T extends object ? ResponsiveObject<T> : ResponsiveValue<T>;

type PartialOrPrimitive<T> = T extends object ? Partial<T> : T;

function getResponsiveIndex (chart: ChartJs): number {
  return chart.width < 400 ? 0 : chart.width < 600 ? 1 : 2;
}

function isObject (t: any): t is object {
  return typeof t === 'object' && t;
}

export function responsive<T> (spec: Responsive<PartialOrPrimitive<T>>): ((ctx: Pick<ScriptableContext<any>, 'chart'>) => PartialOrPrimitive<T>) | undefined {
  let specs: Array<PartialOrPrimitive<T>>;
  if (isObject(spec)) {
    if (!(spec instanceof Array)) {
      const resolvedSpecs: Array<Partial<T>> = [{}, {}, {}];
      for (const key in spec) {
        let last: any;
        for (let i = 0; i < 3; i++) {
          const value = spec[key][i];
          if (notNullish(value)) {
            last = value;
          }
          (resolvedSpecs[i] as any)[key] = last;
        }
      }
      specs = resolvedSpecs as Array<PartialOrPrimitive<T>>;
    } else {
      const resolvedSpecs: T[] = [...spec];
      resolvedSpecs.fill(spec[spec.length - 1] as T, spec.length, 3);
      specs = resolvedSpecs as Array<PartialOrPrimitive<T>>;
    }
  } else {
    return undefined;
  }
  return ({ chart }: ScriptableContext<any>) => {
    return specs[getResponsiveIndex(chart)] as any;
  };
}
