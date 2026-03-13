import { StaticImageData } from 'next/image';
import { ComponentType, CSSProperties, SVGProps } from 'react';

/**
 *
 */
export type ConfigIconType = ComponentType<SVGProps<SVGSVGElement>> | StaticImageData | { src: string, width: number, height: number, alt: string };

export interface MenuItemBaseConfig {
  label: string;
  icon?: ConfigIconType;
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
  items: (MenuItemConfig | MenuParentItemConfig | Spacer | Divider)[];
}

export interface SiteHeaderConfig extends MenuConfig {
  logo: ConfigIconType;
}

export interface SiteBannerConfig {
  style?: CSSProperties;

  /**
   * Content of banner, could be a markdown with single top-level paragraph block
   *
   * @see {import('./utils.ts').renderMarkdown}
   */
  content: string;
  closable?: boolean;
}

export interface SiteWidgetTagCategory {
  key?: string;
  name: string;
  tags: string[];
}

export interface SiteTagDetails {
  name: string;
  tooltip?: string;
  icon?: string;
}

export interface SiteWidgetsTagsConfig {
  filters: string[],
  details?: SiteTagDetails[],
}

export interface SiteWidgetsConfig {
  tags: SiteWidgetsTagsConfig;
}
