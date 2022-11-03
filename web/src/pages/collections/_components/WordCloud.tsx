import { useCollections } from '../../../dynamic-pages/collections/hooks/useCollection';
import React, { useMemo, useRef } from 'react';
import { useHistory } from '@docusaurus/router';
import { useSize } from 'ahooks';
import BrowserOnly from '@docusaurus/BrowserOnly';
import D3WordCloud from 'react-d3-cloud';
import styles from './style.module.css';
import { notNullish } from '@site/src/utils/value';
import { styled } from '@mui/material';

export default function WordCloud () {
  const collections = useCollections();

  const tags = useMemo(() => {
    return collections.map((collection) => ({
      text: collection.name,
      value: 16,
      slug: collection.slug,
    }));
  }, [collections]);

  const history = useHistory();
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  const random = useRandomSeed();

  return (
    <TagContainer className={styles.wordCloudContainer} ref={ref}>
      <BrowserOnly>
        {() => (
          <>
            {notNullish(size) && <D3WordCloud
              width={size.width}
              height={size.height}
              data={tags}
              font="system-ui"
              fontStyle="italic"
              fontWeight="bold"
              fontSize={() => 16}
              random={random}
              rotate={() => (~~(random() * 2) - 1) * 90}
              onWordClick={(_, d) => {
                history.push(`/collections/${(d as any).slug as string}`);
              }}
            />}
          </>
        )}
      </BrowserOnly>
    </TagContainer>
  );
}

const TagContainer = styled('div')({
  height: 400,
});

function useRandomSeed (seed: number = 0): () => number {
  return function random () {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}
