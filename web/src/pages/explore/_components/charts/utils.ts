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

export function transformTimeData (data: any[], field: string) {
  return data.map((item) => {
    let value = item[field];
    if (isYearLike(value as string | number)) {
      value = new Date(String(value));
    }
    return { ...item, [field]: value };
  });
}
