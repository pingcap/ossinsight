import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { useRouteMatch } from 'react-router';
import { translate } from '@docusaurus/Translate';
import { Add } from '@mui/icons-material';
import DocSidebar from '@theme/DocSidebar';
import IconArrow from '@theme/Icon/Arrow';
import clsx from 'clsx';
import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import CustomPage from '../../theme/CustomPage';
import CollectionsContext from './context';
import type { Collection } from '@ossinsight/api';
import { useCollection } from './hooks/useCollection';
import { useCollectionsSidebar } from './hooks/useCollectionsSidebar';
import Sections from './sections';
import { H1 } from './sections/typograpy';
import styles from './styles.module.css';
import { isFalsy, notFalsy } from '@site/src/utils/value';

import { Stack, Typography } from '@mui/material';
import EditCollection from '@site/src/dynamic-pages/collections/components/EditCollection';

interface CollectionsPageParams {
  slug: string;
}

export interface CollectionsPageLayoutProps {
  title: (collection?: Collection) => string;
  description: string;
  keywords: string[];
}

function CollectionsPageLayout ({ title: propTitle, description, keywords, children }: PropsWithChildren<CollectionsPageLayoutProps>) {
  const { params: { slug } } = useRouteMatch<CollectionsPageParams>();
  const { pathname } = useLocation();
  const collection = useCollection(slug);
  const sidebar = useCollectionsSidebar();
  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  const [hiddenSidebar, setHiddenSidebar] = useState(false);
  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      setHiddenSidebar(false);
    }

    setHiddenSidebarContainer((value) => !value);
  }, [hiddenSidebar]);

  const title = useMemo(() => propTitle(collection), [propTitle, collection]);

  return (
    <CustomPage title={title} description={description} keywords={keywords} image={require('./thumbnail.png').default}>
      <CollectionsContext.Provider value={{ collection }}>
        <div className={styles.collectionsPage}>

          <div className={styles.collectionsMainContainer}>
            {notFalsy(sidebar) && (
              <aside
                className={clsx(styles.collectionsSidebarContainer, {
                  [styles.collectionsSidebarContainerHidden]: hiddenSidebarContainer,
                })}
                onTransitionEnd={(e) => {
                  if (
                    !e.currentTarget.classList.contains(styles.collectionsSidebarContainer)
                  ) {
                    return;
                  }

                  if (hiddenSidebarContainer) {
                    setHiddenSidebar(true);
                  }
                }}>
                <DocSidebar
                  key="collections"
                  sidebar={sidebar}
                  path={pathname}
                  onCollapse={toggleSidebar}
                  isHidden={hiddenSidebar}
                  Footer={SidebarFooter}
                />

                {hiddenSidebar && (
                  <div
                    className={styles.collapsedCollectionsSidebar}
                    title={translate({
                      id: 'theme.docs.sidebar.expandButtonTitle',
                      message: 'Expand sidebar',
                      description:
                        'The ARIA label and title attribute for expand button of doc sidebar',
                    })}
                    aria-label={translate({
                      id: 'theme.docs.sidebar.expandButtonAriaLabel',
                      message: 'Expand sidebar',
                      description:
                        'The ARIA label and title attribute for expand button of doc sidebar',
                    })}
                    tabIndex={0}
                    role="button"
                    onKeyDown={toggleSidebar}
                    onClick={toggleSidebar}>
                    <IconArrow className={styles.expandSidebarButtonIcon} />
                  </div>
                )}
              </aside>
            )}
            <main
              className={clsx(styles.collectionsMainContainer, {
                [styles.collectionsMainContainerEnhanced]:
                hiddenSidebarContainer || isFalsy(sidebar),
              })}>
              <div
                className={clsx(
                  'container padding-top--md padding-bottom--lg',
                  styles.collectionsItemWrapper,
                  {
                    [styles.collectionsItemWrapperEnhanced]: hiddenSidebarContainer,
                  },
                )}>
                {collection && <EditCollection collection={collection} />}
                <H1 mt={2}>{title}</H1>
                <Sections description={description}>
                  {children}
                </Sections>
              </div>
            </main>
          </div>
        </div>
      </CollectionsContext.Provider>
    </CustomPage>
  );
}

const SidebarFooter = () => {
  return (
    <Link to="https://github.com/pingcap/ossinsight#how-to-add-collections">
      <Stack direction="row" width="100%" height="100%" alignItems="center" justifyContent="center" spacing={1}>
        <Add />
        <Typography variant="body2" component="span" fontSize="inherit">
          Add a Collection
        </Typography>
      </Stack>
    </Link>
  );
};

export default CollectionsPageLayout;
