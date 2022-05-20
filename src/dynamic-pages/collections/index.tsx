import { useRouteMatch } from '@docusaurus/router';
import { translate } from '@docusaurus/Translate';
import BackToTopButton from '@theme/BackToTopButton';
import DocSidebar from '@theme/DocSidebar';
import IconArrow from '@theme/IconArrow';
import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { registerThemeDark } from '../../components/BasicCharts';
import CustomPage from '../../theme/CustomPage';
import CollectionsContext from './context';
import { useCollection } from './hooks/useCollection';
import { useCollectionsSidebar } from './hooks/useCollectionsSidebar';
import Sections from './sections';
import styles from './styles.module.css';

interface CollectionsPageParams {
  slug: string;
}

registerThemeDark();

function CollectionsPage() {
  let { params: { slug } } = useRouteMatch<CollectionsPageParams>();
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
    <CustomPage title={collection?.name}>
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
                  path={`/collections/${collection?.slug}`}
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
                <Sections collection={collection} />
              </div>
            </main>
          </div>
        </div>
      </CollectionsContext.Provider>
    </CustomPage>
  );
}

export default CollectionsPage;
