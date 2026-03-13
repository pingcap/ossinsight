import { SiteBannerConfig } from '../../types/ui-config';
import { renderMarkdown } from './utils';

export interface SiteBannerProps {
  banner: SiteBannerConfig;
}

export function SiteBanner ({ banner: { content, closable: _closable, style } }: SiteBannerProps) {
  return (
    <div
      className="flex h-[30px] items-center justify-center bg-[#4C33B1] px-4 py-[5px] text-[13.6px] font-bold text-white [&_a]:underline [&_em]:italic [&_strong]:font-bold"
      style={style}
    >
      {renderMarkdown(content)}
    </div>
  );
}
