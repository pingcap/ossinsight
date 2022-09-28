import { Fields } from "../core/TiDBQueryExecutor";

export function toCompactFormat<T extends object>(data: T[], fields: Fields<T>) {
  return data.map(item => {
    let array: any[] = [];
    fields.forEach((field, i) => {
      array[i] = item[field.name] ?? null
    })
    return array;
  });
}
