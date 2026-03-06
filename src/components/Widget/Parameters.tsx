'use client';

import { isWidget, widgetParameterDefinitions } from '@/utils/widgets';
import { Button } from '@/lib/ui/components/Button';
import parsers from '@/lib/widgets-core/parameters/parser';
import { ParamInput } from '@/lib/widgets-core/parameters/react';
import { ParametersContext } from '@/lib/widgets-core/parameters/react/context';
import { LinkedData } from '@/lib/widgets-core/parameters/resolver';
import { ParameterDefinition } from '@ossinsight/widgets-types';
import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { use, useId, useMemo, useState } from 'react';

export function WidgetParameters ({ widgetName, linkedData, excludeParameters }: { widgetName: string, linkedData: LinkedData, excludeParameters: string[] }) {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const id = useId();

  if (!isWidget(widgetName)) {
    throw new Error('bad widget');
  }

  const parameters = use(widgetParameterDefinitions(widgetName));

  const [values, setValues] = useState(() => {
    return urlSearch2stringArrayRecord(searchParams);
  });

  const validated = useMemo(() => {
    for (let [k, p] of Object.entries(parameters)) {
      if (p.required) {
        if (values[k] == null) {
          return false;
        }
      }
    }
    return true;
  }, [parameters, values]);

  const ownerIdMemo = useMemo(() => {
    if (searchParams == null) {
      return null;
    }
    let result = null;
    try {
      const ownerId = searchParams.get('owner_id');
      if (ownerId) {
        result = Number(ownerId);
      }
    } catch {}
    return result;
  }, [searchParams]);

  return (
    <ParametersContext.Provider value={{ linkedData }}>
      <div className="flex flex-col items-start gap-4 mt-4">
        {Object.entries(parameters).filter(([key]) => !excludeParameters.includes(key)).map(([key, config]) => {
          const pId = `${key}-${id}`;
          const rawValue = values[key];
          const value = parseValue(rawValue, config);
          const showRequiredMessage = config.required && value == null;
          return (
            <div key={key} className='flex flex-col gap-2'>
              <label
                className={`text-sm${
                  showRequiredMessage ? ' text-red-400' : ''
                }`}
                htmlFor={pId}
              >
                {config.title ?? key}
              </label>
              <ParamInput
                id={pId}
                config={config}
                value={value}
                ownerId={ownerIdMemo}
                onValueChange={(nv) => {
                  setValues((values) => {
                    const newValues = stringArrayRecord2UrlSearch(values);
                    if (nv == null) {
                      newValues.delete(key);
                    } else {
                      if (Array.isArray(nv)) {
                        newValues.delete(key);
                        nv.forEach((v) => newValues.append(key, String(v)));
                      } else {
                        newValues.set(key, String(nv));
                      }
                    }
                    return urlSearch2stringArrayRecord(newValues);
                  });
                }}
              />
              {showRequiredMessage && (
                <p className='text-xs text-red-400'>
                  {config.title} is required.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <Button
          variant="primary"
          className="w-full"
          disabled={!validated}
          onClick={() => {
            const usp = stringArrayRecord2UrlSearch(values);
            push(`${pathname}?${usp.toString()}`);
          }}>
          Update
        </Button>
      </div>
    </ParametersContext.Provider>
  );
}

function parseValue (rawValue: any, config: ParameterDefinition) {
  if (rawValue == null) {
    if (!('expression' in config)) {
      return rawValue;
    }
  }
  return parsers[config.type](rawValue, config as any);
}

function stringArrayRecord2UrlSearch(values: Record<string, string | string[]>) {
  const newValues = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) {
    if (Array.isArray(v)) {
      v.forEach((i) => newValues.append(k, i));
    } else {
      newValues.set(k, v);
    }
  }
  return newValues;
}

function urlSearch2stringArrayRecord (search: URLSearchParams | ReadonlyURLSearchParams | null) {
  if (search == null) {
    return {};
  }
  const values: Record<string, string | string[]> = {};
  for (const item of search.keys()) {
    const val = search.getAll(item);
    if (val.length === 1) {
      values[item] = val[0];
    } else {
      values[item] = val;
    }
  }
  return values;
}
