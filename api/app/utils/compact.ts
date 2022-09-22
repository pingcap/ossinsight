export function toCompact<T extends object>(data: T[]) {
  let fields: Record<string, number> = {};

  const arrayList = data.map(item => {
    let array: any[] = [];
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        if (key in fields) {
          array[fields[key]] = item[key];
        } else {
          array[fields[key] = Object.keys(fields).length] = item[key];
        }
      }
    }
    for (let i = 0; i < array.length; i++) {
      if (array[i] === undefined) {
        array[i] = null;
      }
    }
    return array;
  });

  return { fields: Object.keys(fields), data: arrayList };
}