import type { SiteBannerConfig, SiteHeaderConfig } from '@/components/ui/types/ui-config';

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
    measurementSecret: string;
    clientId: string;
  };
  banner?: SiteBannerConfig;
}

export function defineSiteConfig(config: SiteConfig): SiteConfig {
  return config;
}
