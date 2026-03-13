const names = ['main', 'vs'];

export function compare<Data, Option> (input: [Data, Data | undefined], gen: (data: Data, name: string) => Option) {
  return input.filter(Boolean).map((data, index) => gen(data, names[index]));
}
