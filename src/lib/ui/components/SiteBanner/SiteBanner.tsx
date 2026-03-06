import { SiteBannerConfig } from '../../types/ui-config';
import { renderMarkdown } from './utils';
import './style.scss';

export interface SiteBannerProps {
  banner: SiteBannerConfig;
}

export function SiteBanner ({ banner: { content, closable, style } }: SiteBannerProps) {
  return (
    <div
      className="Banner py-[5px] bg-[#4C33B1] font-bold text-[13.6px] h-[30px] text-white flex items-center justify-center"
      style={style}
    >
      {renderMarkdown(content)}
    </div>
  );
}
