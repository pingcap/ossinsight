import type { SiteBannerConfig } from '@/components/ui/types/ui-config';
import type { SiteHeaderConfig } from '@repo/site-shell';

export interface ImageSizeConfig {
  width: number;
  height: number;
  dpr?: number;
}

export interface SiteConfig {
  /** @deprecated not used */
  host: string;
  header: SiteHeaderConfig;
  ga: {
    tag: string;
    measurementId: string;
  };
  banner?: SiteBannerConfig;
}

export function defineSiteConfig(config: SiteConfig): SiteConfig {
  return config;
}
