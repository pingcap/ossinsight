
export function countNames(data: { repo_name: string }[]): number {
  const set = new Set();
  data.forEach(item => set.add(item.repo_name));
  return set.size;
}
