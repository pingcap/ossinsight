import { allSatisfy, isNonemptyString, isNullish, notNullish } from '@site/src/utils/value';

export function isTimeField (name: string) {
  return /date|time|year|month/.test(name);
}

export function isYearLike (value: string | number): boolean {
  if (typeof value === 'number') {
    return value >= 1970 && value < 2100;
  } else {
    return isYearLike(Number(value));
  }
}

export function isRepoNameLike (value: string | number): boolean {
  if (typeof value === 'string') {
    return value.includes('/');
  } else {
    return false;
  }
}

export function transformTimeData (data: any[], field: string) {
  return data.map((item) => {
    let value = item[field];
    if (isYearLike(value as string | number)) {
      value = new Date(String(value));
    }
    return { ...item, [field]: value };
  });
}

export function isRepoNameField (data: any[], field: string) {
  return allSatisfy(data.map(item => item[field]), isRepoNameLike);
}

export function useValidData (data: any[], fields: Array<string | string[] | undefined>) {
  // Ensure all provided fields are non-empty string or non-empty string array.
  const satisfy = (field: string | string[] | undefined) => {
    if (isNullish(field)) {
      return false;
    }
    if (field instanceof Array) {
      return field.length > 0 && allSatisfy(field, isNonemptyString);
    } else {
      return isNonemptyString(field);
    }
  };

  // Ensure all fields of an item are non-nullish
  const itemFieldSatisfy = (item: any) => (field: string | string[]) => {
    if (typeof field === 'string') {
      return notNullish(item[field]);
    } else {
      return allSatisfy(field, f => notNullish(item[f]));
    }
  };

  if (allSatisfy(fields, satisfy)) {
    return data.filter((item) => allSatisfy(fields as Array<string | string[]>, itemFieldSatisfy(item)));
  } else {
    return [];
  }
}
