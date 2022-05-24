import { useRouteMatch, useLocation } from '@docusaurus/router';
import { translate } from '@docusaurus/Translate';
import BackToTopButton from '@theme/BackToTopButton';
import DocSidebar from '@theme/DocSidebar';
import IconArrow from '@theme/IconArrow';
import clsx from 'clsx';
import React, { PropsWithChildren, useCallback, useState } from 'react';
import { registerThemeDark } from '../../components/BasicCharts';
import CustomPage from '../../theme/CustomPage';
import CollectionsContext from './context';
import { Collection, useCollection } from './hooks/useCollection';
import { useCollectionsSidebar } from './hooks/useCollectionsSidebar';
import Sections from './sections';
import styles from './styles.module.css';

interface CollectionsPageParams {
  slug: string;
}

export interface CollectionsPageLayoutProps {
  title: (collection?: Collection) => string
}

function CollectionsPageLayout({ title, children }: PropsWithChildren<CollectionsPageLayoutProps>) {
  let { params: { slug } } = useRouteMatch<CollectionsPageParams>();
  const { pathname } = useLocation()
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

  return (
    <CustomPage title={title(collection)}>
      <CollectionsContext.Provider value={{ collection }}>
        <div className={styles.collectionsPage}>
          <BackToTopButton />

          <div className={styles.collectionsMainContainer}>
            {sidebar && (
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
                hiddenSidebarContainer || !sidebar,
              })}>
              <div
                className={clsx(
                  'container padding-top--md padding-bottom--lg',
                  styles.collectionsItemWrapper,
                  {
                    [styles.collectionsItemWrapperEnhanced]: hiddenSidebarContainer,
                  },
                )}>
                <Sections collection={collection}>
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

export default CollectionsPageLayout;
