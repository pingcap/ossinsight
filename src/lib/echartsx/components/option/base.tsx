import { ComponentOption } from 'echarts/types/src/util/types';
import deepEquals from 'fast-deep-equal/react';
import { FC, useContext, useEffect, useMemo, useRef } from 'react';
import OptionContext from '../EChartsx/OptionContext';

let id = 0;

function useId() {
  return useMemo(() => `:${++id}`, []);
}

export function withBaseOption<O extends ComponentOption>(
  mainType: Exclude<O['mainType'], undefined>,
  {
    ...defaults
  }: Partial<O> = {},
  displayName?: string,
) {
  const Component: FC<Omit<O, 'mainType'>> = (props) => {
    const { set, remove } = useContext(OptionContext);
    const id = useId();
    const last = useRef<object | undefined>(undefined);

    useEffect(() => {
      if (last.current && (deepEquals(last.current, props))) {
        return;
      }
      set(id, { id, ...defaults, ...props, mainType });
      last.current = props;
    }, [props]);

    useEffect(() => {
      return () => {
        last.current = undefined;
        remove(id);
      };
    }, []);
    return <></>;
  };

  Component.displayName = displayName ?? ('echarts:' + mainType);

  return Component;
}
