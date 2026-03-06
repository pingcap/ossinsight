const names = ['main', 'vs'];

export function compare<Data, Option> (input: [Data, Data | undefined], gen: (data: Data, name: string) => Option) {
  return input.filter((data): data is Data => data !== undefined).map((data, index) => gen(data, names[index]));
}
