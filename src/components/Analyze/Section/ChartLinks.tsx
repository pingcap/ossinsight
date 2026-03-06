import { Tooltip } from '@/lib/ui';
import ArrowUpRightIcon from 'bootstrap-icons/icons/arrow-up-right.svg';
import CodeIcon from 'bootstrap-icons/icons/code.svg';
import NextLink from 'next/link';
import * as React from 'react';

interface ChartLinksProps {
  name: string
  innerSectionId?: string
  searchParamsStr: string
}

export function ChartLinks ({ name, innerSectionId, searchParamsStr }: ChartLinksProps) {
  const [targetWidgetLinkMemo, targetSectionLinkMemo] = React.useMemo(() => {
    let targetWidgetLink = null;
    let targetSectionLink = null;
    if (name.includes(`@ossinsight/widget-`)) {
      const widget = name.split('@ossinsight/widget-').pop();
      targetWidgetLink = `/widgets/official/${widget}?${searchParamsStr}`;
    }
    if (innerSectionId) {
      targetSectionLink = `#${innerSectionId}`;
    }
    // FIXME: temporary disable widget link if selected repos.
    if (searchParamsStr.includes('repo_ids=')) {
      targetWidgetLink = null;
    }
    return [targetWidgetLink, targetSectionLink];
  }, [innerSectionId, name, searchParamsStr]);

  return (
    <div className="absolute top-4 right-4 flex gap-2">
      {targetSectionLinkMemo && (
        <NextLink
          href={targetSectionLinkMemo}
          className="w-4 h-4 rounded-full inline-flex text-[#D9D9D9] items-center justify-center"
        >
          <Tooltip.InfoTooltip
            Icon={ArrowUpRightIcon}
            iconProps={{
              className: 'w-3 h-3',
            }}
            contentProps={{
              className: 'text-[12px] leading-[16px] max-w-[400px] bg-[var(--background-color-tooltip)] text-[var(--text-color-tooltip)]',
            }}
            arrowProps={{
              className: 'fill-[var(--background-color-tooltip)]',
            }}
          >
            See Details
          </Tooltip.InfoTooltip>
        </NextLink>
      )}
      {targetWidgetLinkMemo && (
        <NextLink
          target="_blank"
          href={targetWidgetLinkMemo}
          className="w-4 h-4 rounded-full inline-flex text-[#D9D9D9] items-center justify-center"
        >
          <Tooltip.InfoTooltip
            Icon={CodeIcon}
            iconProps={{
              className: 'w-3 h-3',
            }}
            contentProps={{
              className: 'text-[12px] leading-[16px] max-w-[400px] bg-[var(--background-color-tooltip)] text-[var(--text-color-tooltip)]',
            }}
            arrowProps={{
              className: 'fill-[var(--background-color-tooltip)]',
            }}
          >
            Embed to README.md
          </Tooltip.InfoTooltip>
        </NextLink>
      )}
    </div>
  );
}