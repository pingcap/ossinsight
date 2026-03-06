import { SiteBannerConfig, SiteHeaderConfig, SiteWidgetsConfig } from '@/lib/ui/types/ui-config';
import { WidgetImageGridSize } from '@ossinsight/widgets-types';
import { getWidgetSize } from '@/lib/widgets-utils/utils';

export interface SiteConfig {
  /** @deprecated not used */
  host: string;
  header: SiteHeaderConfig;
  ga: {
    tag: string
    measurementId: string
    measurementSecret: string
    clientId: string
  };
  banner?: SiteBannerConfig;
  sizes: Record<string, ImageSizeConfig>;
  widgets: SiteWidgetsConfig;
}

export interface ImageSizeConfig {
  width: number;
  height: number;
  /**
   * Device pixel ratio, default to 2
   */
  dpr?: number;
}

export function defineSiteConfig (config: SiteConfig): SiteConfig {
  return config;
}

export function resolveImageSizeConfig (config: SiteConfig, name: string, grid?: WidgetImageGridSize) {
  if (grid) {
    const [c, r, ...none] = name.split('x');
    if (none.length === 0) {
      const gridSizes = getWidgetSize();
      const cols = Number(c);
      const rows = Number(r);
      if (isFinite(cols) && isFinite(rows)) {
        return {
          width: gridSizes.widgetWidth(adapt(cols, grid.cols)),
          height: gridSizes.widgetWidth(adapt(rows, grid.rows)),
        };
      }
    }
  }
  return config.sizes[name] || config.sizes['default'];
}

function adapt (value: number, constraint: number | { min: number, max: number }) {
  if (typeof constraint === 'number') {
    return constraint;
  } else {
    return Math.max(Math.max(Math.round(value), constraint.min), constraint.max);
  }
}
