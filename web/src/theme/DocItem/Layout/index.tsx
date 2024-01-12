import React from 'react';
import clsx from 'clsx';
import { useWindowSize } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/theme-common/internal';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import DocItemContent from '@theme/DocItem/Content';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import type { Props } from '@theme/DocItem/Layout';

import styles from './styles.module.css';
import ShareButtons from '@site/src/components/ShareButtons';
import { notNullish } from '@site/src/utils/value';

/**
 * Decide if the toc should be rendered, on mobile or desktop viewports
 */
function useDocTOC () {
  const { frontMatter, toc } = useDoc();
  const windowSize = useWindowSize();

  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;

  const mobile = canRender ? <DocItemTOCMobile /> : undefined;

  const desktop =
    canRender && (windowSize === 'desktop' || windowSize === 'ssr')
      ? (
      <DocItemTOCDesktop />
        )
      : undefined;

  return {
    hidden,
    mobile,
    desktop,
  };
}

export default function DocItemLayout ({ children }: Props): JSX.Element {
  const docTOC = useDocTOC();
  const { metadata: { title } } = useDoc();
  return (
    <div className="row">
      <div className={clsx('col', !docTOC.hidden && styles.docItemCol)}>
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            <ShareButtons title={title} />
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
      </div>
      {notNullish(docTOC.desktop) && <div className="col col--3">{docTOC.desktop}</div>}
    </div>
  );
}
