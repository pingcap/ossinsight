import { init } from 'echarts/core';
import { EChartsOption, EChartsType } from 'echarts/types/dist/shared';
import { LocaleOption } from 'echarts/types/src/core/locale';
import { ComponentOption as EChartsComponentOption, RendererType } from 'echarts/types/src/util/types';
import deepEqual from 'fast-deep-equal/react';
import {
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import OptionContext from './OptionContext';
import { getDevicePixelRatio } from './utils';


export interface EChartsInitOptions {
  locale?: string | LocaleOption;
  renderer?: RendererType;
  devicePixelRatio?: number;
  useDirtyRect?: boolean;
  ssr?: boolean;
  width?: number;
  height?: number;
}

export interface OptionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  theme?: string | object;
  init?: EChartsInitOptions;
  defaults?: Partial<EChartsOption>;
  debug?: boolean;
}

function addComponent(option: EChartsOption, item: EChartsComponentOption) {
  if (!item.mainType) {
    throw new Error('option.mainType must be specified');
  }
  if (option[item.mainType]) {
    const optionItem = option[item.mainType] as EChartsComponentOption | EChartsComponentOption[];
    if (optionItem instanceof Array) {
      if (optionItem.length === 1) {
        if (optionItem[0].id === item.id && item.id !== undefined) {
          optionItem[0] = item;
        } else if (optionItem[0].id === undefined || item.id === undefined) {
          throw new Error('option.id must be set with multiple items');
        } else {
          optionItem.push(item);
        }
      } else if (optionItem.length > 1) {
        if (item.id === undefined) {
          throw new Error('option.id must be set with multiple items');
        }
        const idx = optionItem.findIndex(i => i.id === item.id);
        if (idx >= 0) {
          optionItem.splice(idx, 1, item);
        } else {
          optionItem.push(item);
        }
      } else {
        optionItem[0] = item;
      }
    } else {
      if (optionItem.id === item.id && item.id !== undefined) {
        option[item.mainType] = item;
      } else if (item.id === undefined || optionItem.id === undefined) {
        throw new Error('option.id must be set with multiple items');
      } else {
        option[item.mainType] = [optionItem, item];
      }
    }
  } else {
    option[item.mainType] = item;
  }
}


function applyRef<T>(ref: ForwardedRef<T>, value: T) {
  if (ref) {
    if (typeof ref === 'function') {
      ref(value);
    } else {
      ref.current = value;
    }
  }
}

function EChartsx({
  children,
  theme,
  init: initProp = {},
  defaults = {},
  debug = false,
  ...props
}: OptionProps, forwardedRef: ForwardedRef<EChartsType | undefined>) {
  const options = useMemo<Record<string, EChartsComponentOption>>(() => ({}), []);
  const ref = useRef<HTMLDivElement>(null);
  const echartsInstanceRef = useRef<EChartsType>();
  const [version, setVersion] = useState(0);
  const shouldFullReload = useRef(true);
  const changingKeys = useRef<Record<string, boolean>>({});
  const forwarded = useRef(false);
  const isBasicOptionsSet = useRef(false)
  const initialOptions = useRef<EChartsOption[]>([])

  const set = useCallback((id: string, component: EChartsComponentOption) => {
    if (deepEqual(options[id], component)) {
      return;
    }
    options[id] = component;
    changingKeys.current[id] = true;
    setVersion(version => version + 1);
  }, []);

  const remove = useCallback((id: string) => {
    if (!(id in options)) {
      return;
    }
    delete options[id];
    shouldFullReload.current = true;
    changingKeys.current[id] = true;
    setVersion(version => version + 1);
  }, []);

  const markNoMerge = useCallback(() => {
    shouldFullReload.current = true;
  }, []);

  useEffect(() => {
    const resize = () => {
      echartsInstanceRef.current?.resize()
    }
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(resize);
      if (ref.current) {
        ro.observe(ref.current);
      }
      return () => {
        ro.disconnect();
      };
    } else {
      window.addEventListener('resize', resize);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }
  }, [])

  useEffect(() => {
    const dispose = () => {
      if (echartsInstanceRef.current) {
        echartsInstanceRef.current.dispose();
        echartsInstanceRef.current = undefined;
        applyRef(forwardedRef, undefined);
      }
    };

    if (ref.current) {
      const ec = echartsInstanceRef.current = init(ref.current, theme, { devicePixelRatio: getDevicePixelRatio(), ...initProp });
      forwarded.current = false;
      return dispose;
    } else {
      dispose();
    }
  }, []);

  useLayoutEffect(() => {
    echartsInstanceRef.current?.resize({ width: initProp?.width ?? 'auto', height: initProp?.height ?? 'auto' })
  }, [initProp?.width, initProp?.height])

  useEffect(() => {
    const option: EChartsOption = shouldFullReload.current ? { ...defaults } : {};
    (shouldFullReload.current ? Object.values(options) : Object.keys(changingKeys.current).map(key => options[key]))
      .forEach(component => addComponent(option, component));
    if (Object.keys(option).length) {
      if (debug) {
        console.debug('echartsx.set', option);
      }
      const ec = echartsInstanceRef.current;
      if (ec) {
        ec.setOption(option, shouldFullReload.current);
        // set cached options after first options set
        isBasicOptionsSet.current = true
        if (initialOptions.current.length > 0) {
          initialOptions.current.forEach(option => ec.setOption(option))
          initialOptions.current = []
        }
      }
      if (!forwarded.current) {
        applyRef(forwardedRef, echartsInstanceRef.current);
        forwarded.current = true;
      }
    }
    shouldFullReload.current = false;
    changingKeys.current = {};
  }, [defaults, version]);

  // some option may be popped before echarts instance initialized, we cache those options and set
  // after echarts instance init
  const setOption = useCallback((option: EChartsOption) => {
    const ec = echartsInstanceRef.current
    if (ec && isBasicOptionsSet.current) {
      ec.setOption(option)
    } else {
      initialOptions.current.push(option)
    }
  }, [])

  return (
    <OptionContext.Provider value={{ set, markNoMerge, remove, setOption }}>
      <div ref={ref} {...props} />
      {children}
    </OptionContext.Provider>
  );
}

export default forwardRef(EChartsx);
