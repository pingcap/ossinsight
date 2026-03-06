
function getGroups () {
  if (typeof window !== 'undefined') {
    return window?.osdbgroup?.reduce((p, c) => {
      p[c.group_name] = { name: c.group_name, repoIds: c.repos.map(item => item.id) };
      return p;
    }, {} as Record<string, { name: string; repoIds: number[] }>) ?? {};
  } else {
    return {} as Record<string, { name: string; repoIds: number[] }>;
  }
}

export const groups = getGroups();
