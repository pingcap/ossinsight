import {Dispatch, SetStateAction, useEffect, useMemo, useState} from "react";
import {DateTime} from "luxon";

export interface UseUrlSearchStateProps<T> {
  defaultValue: T | (() => T)
  serialize: (value: T) => string
  deserialize: (string: string) => T
}

function useUrlSearchStateSSR<T>(key: string, {defaultValue}: UseUrlSearchStateProps<T>): [T, Dispatch<SetStateAction<T>>] {
  return useState<T | undefined>(defaultValue)
}

function useUrlSearchStateCSR<T>(key: string, {
  defaultValue,
  deserialize,
  serialize
}: UseUrlSearchStateProps<T>, push: boolean = false): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const initialValue = useMemo(() => {
    const usp = new URLSearchParams(location.search)
    if (usp.has(key)) {
      return deserialize(usp.get(key))
    } else {
      return defaultValue
    }
  }, [])
  const [value, setValue] = useState<T>(initialValue)
  useEffect(() => {
    const sv = serialize(value)
    const usp = new URLSearchParams(location.search)
    if (sv === undefined || sv === null) {
      usp.delete(key)
    } else {
      usp.set(key, sv)
    }
    const uspStr = usp.toString()
    const search = uspStr ? `?${uspStr}` : ''
    const hash = location.hash ? `${location.hash}` : ''
    const url = location.pathname + search + hash
    if (push) {
      window.history.pushState(null, null, url)
    } else {
      window.history.replaceState(null, null, url)
    }
  }, [value])

  return [value, setValue]
}

const useUrlSearchState = typeof window === 'undefined' ? useUrlSearchStateSSR : useUrlSearchStateCSR

export default useUrlSearchState

export function stringParam(defaultValue?): UseUrlSearchStateProps<string> {
  return {
    defaultValue,
    serialize: s => s,
    deserialize: s => s
  }
}

export function numberParam(defaultValue?): UseUrlSearchStateProps<number> {
  return {
    defaultValue,
    serialize: value => isFinite(value) ? String(value) : undefined,
    deserialize: string => {
      if (!string) {
        return undefined
      }
      const number = Number(string)
      return isFinite(number) ? number : undefined
    }
  }
}

export function booleanParam(defaultValue?): UseUrlSearchStateProps<boolean> {
  return {
    defaultValue,
    serialize: v => String(v),
    deserialize: s => s ? Boolean(s) : undefined
  }
}

export function dateParam(fmt = 'yyyy-MM-dd HH:mm:ss', defaultValue?): UseUrlSearchStateProps<Date | null> {
  return {
    defaultValue,
    serialize: date => date ? DateTime.fromJSDate(date).toFormat(fmt) : undefined,
    deserialize: dateString => dateString ? DateTime.fromFormat(dateString, fmt).toJSDate() : undefined
  }
}

export function dateRangeParam(fmt = 'yyyy-MM-dd HH:mm:ss', defaultValue?): UseUrlSearchStateProps<[Date | null, Date | null]> {
  const reuse = dateParam(fmt)
  return {
    defaultValue,
    serialize: (dates) => (dates[0] || dates[1])
      ? dates.map(d => reuse.serialize(d) ?? '').join(',')
      : undefined,
    deserialize: (rangeString) => (rangeString[0] || rangeString[1])
      ? rangeString.split(',', 2).map(ds => reuse.deserialize(ds) ?? null) as [Date | null, Date | null]
      : undefined
  }
}
