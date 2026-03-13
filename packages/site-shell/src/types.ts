import type { CSSProperties, ComponentType, SVGProps } from 'react';

export type ConfigIconType =
  | ComponentType<SVGProps<SVGSVGElement>>
  | string
  | {
      src: string;
      width: number;
      height: number;
      alt?: string;
    };

export interface MenuItemBaseConfig {
  label: string;
  icon?: ConfigIconType;
  matchPrefixes?: string[];
  newTab?: boolean;
}

export interface MenuItemConfig extends MenuItemBaseConfig {
  href: string;
}

export interface MenuParentItemConfig extends MenuItemBaseConfig {
  items: MenuItemConfig[];
}

export type Spacer = 'spacer';
export type Divider = 'divider';

export interface MenuConfig {
  items: Array<MenuItemConfig | MenuParentItemConfig | Spacer | Divider>;
}

export interface SiteHeaderConfig extends MenuConfig {
  homeHref?: string;
  logo: ConfigIconType;
  className?: string;
  style?: CSSProperties;
}

export type SiteApp = 'web' | 'docs';
