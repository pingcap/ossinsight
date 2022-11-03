
export function countNames (data: Array<{ repo_name: string }>): number {
  const set = new Set();
  data.forEach(item => set.add(item.repo_name));
  return set.size;
}

const df = new Intl.DateTimeFormat(['en-US'], {
  month: 'short',
  year: 'numeric',
});

export const formatTime = (name: string | undefined): string => {
  if (name) {
    try {
      return df.format(new Date(name));
    } catch (e) {
      console.log(`${name} is not a valid time value`);
      return '--';
    }
  } else {
    return '--';
  }
};
