import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';
import WordCloud from "../components/WordCloud";
import Bottom from './bottom.md'
import TopList from "../components/TopList";

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <>
      <header className={clsx('hero', styles.heroWc)}>
        <div className={styles.wcContainer}>
          <WordCloud>
            <h1 className={clsx('hero__title', styles.heroWcTitle)}>{siteConfig.title}</h1>
          </WordCloud>
        </div>
      </header>
      <div className={clsx('hero', styles.heroBanner)}>
        <div className='container'>
          <p className={clsx('hero__subtitle')}>
            {siteConfig.tagline}
            <a href='/blog/about'>, learn more</a>.
          </p>
        </div>
      </div>
      <div className={clsx('hero', styles.heroBanner)}>
        <div className='container'>
          <TopList />
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <div
        style={{
          '--ifm-container-width-xl': '960px'
        }}
      >
        <HomepageHeader />
        <div style={{margin: '4em 0'}}>
          <div className='container container-fluid'>
            <Bottom />
          </div>
        </div>
      </div>
    </Layout>
  );
}
