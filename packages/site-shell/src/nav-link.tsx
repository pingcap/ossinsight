import type { MenuItemConfig } from './types';

export function isAbsoluteUrl(value: string) {
  return /^https?:\/\//.test(value);
}

export function isActiveMenuItem(item: MenuItemConfig, pathname: string | null) {
  if (!pathname || isAbsoluteUrl(item.href)) {
    return false;
  }

  const matches = item.matchPrefixes ?? [item.href];
  return matches.some((prefix) => (prefix === '/' ? pathname === prefix : pathname.startsWith(prefix)));
}
