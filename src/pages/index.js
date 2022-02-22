import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';
import WordCloud from "../components/WordCloud";
import ChangeLog from '../../CHANGELOG.md'

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <>
      <header className={clsx('hero', styles.heroWc)}>
        <div className={styles.wcContainer}>
          <WordCloud>
            <h1 className={clsx('hero__title', styles.heroWcTitle)} >{siteConfig.title}</h1>
          </WordCloud>
        </div>
      </header>
      <div className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className='container'>
          <br />
          <br />
          <p className="hero__title">{siteConfig.tagline}</p>
          <p className="hero__subtitle">
            We store GitHub events data from Feb 2011 in TiDB Cloud and update hourly, then analyze the trends of stars, pull requests, and many more metrics of repositories.
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/_/database/">
              Let's Explore
            </Link>
          </div>
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
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
      <div style={{margin: '4em 0'}}>
        <div className='container container-fluid'>
          <ChangeLog />
        </div>
      </div>
    </Layout>
  );
}
