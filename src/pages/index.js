import React, {useState} from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import WordCloud from "../components/WordCloud";
import Bottom from './bottom.md'
import TopList from "../components/TopList";
import CustomPage from "../theme/CustomPage";

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const [period, setPeriod] = useState('last_hour')

  return (
    <>
      <header className={clsx('hero', styles.heroWc)}>
        <div className={styles.wcContainer}>
          <WordCloud period='last_hour'>
            <h1 className={clsx('hero__title', styles.heroWcTitle)}>{siteConfig.title}</h1>
          </WordCloud>
        </div>
      </header>
      <div className={clsx('hero', styles.heroBanner)}>
        <div className='container'>
          <p className={clsx('hero__subtitle', styles.autoBr)}>
            {siteConfig.tagline}
          </p>
        </div>
      </div>
      <div className={clsx('hero', styles.heroBanner)}>
        <div className='container'>
          <TopList period={period} onPeriodChange={setPeriod} />
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <CustomPage
      footer={false}
      title={`📈 2021 OSS Analysis`}
      description="💎 Comprehensive analysis of open source software trends on github, include database field, javascript framework field, web framework, lowcode development tool, etc."
    >
      <HomepageHeader />
      <div style={{margin: '4em 0'}}>
        <div className='container container-fluid'>
          <Bottom />
        </div>
      </div>
    </CustomPage>
  );
}
