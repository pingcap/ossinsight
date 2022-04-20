import React, {useState} from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import WordCloud from "../../components/WordCloud";
import TopList from "../../components/TopList";
import {Cards, StandardCard} from '../../components/Cards';
import Image from "../../components/Image";
import Section from '../../components/Section';
import CustomPage from "../../theme/CustomPage";

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const [period, setPeriod] = useState('last_hour')

  return (
    <CustomPage
      title={siteConfig.title}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <Section
        title='Deep insights into open source software'
        subtitle='Discover deep analytical insights of various types including their rankings and popularity trends using multiple metrics such as stars, PRs, and contributors.'
        buttonText='Dig deeper via more metrics'
        buttonLink='https://www.baidu.com/'
      >
        <Cards sx={{mt: 2}} xs={12} sm={6} md={4}>
          <StandardCard
            title='📈 OSS Database Repos Landscape 2021'
            description='/* Deep insights into oss databases in 2011. */'
            image={<Image src={require('./images/chart-1.png').default} style={{borderRadius: 6}} />}
            link='https://www.baidu.com/'
          />
          <StandardCard
            title='🔥 Real-time Insights'
            description='/* Analyze open source software in realtime, up to last hour. */'
            image={<Image src={require('./images/chart-2.png').default} style={{borderRadius: 6}} />}
            link='https://www.baidu.com/'
          />
          <StandardCard
            title='❤️ Custom Insights'
            description='/* Analyze by customize your own date range. */'
            image={<Image src={require('./images/chart-3.png').default} style={{borderRadius: 6}} />}
            link='https://www.baidu.com/'
          />
        </Cards>
      </Section>
      <Section
        title='Compare any 2 GitHub repositories'
        subtitle='Compare any two repositories using multiple metrics such as stars, pull requests, commits...'
        buttonText='Dig deeper via more metrics'
        buttonLink='https://www.baidu.com/'
        backgroundImage={require('./images/map-bg.png').default}
      >
        <Cards sx={{mt: 2}} xs={12} sm={6} md={4}>
          <StandardCard
            title='Total Count or Trend'
            description='/* Discover how the two repos differ in star(popularity), issue(user), pull request(contribution). */'
            image={<Image src={require('./images/chart-4.png').default} style={{borderRadius: 6}} />}
            link='https://www.baidu.com/'
          />
          <StandardCard
            title='Company Distribution'
            description='/* Learn how the two repos differ in coding vitality as measured by the time contributors making their commits. */'
            image={<Image src={require('./images/chart-5.png').default} style={{borderRadius: 6}} />}
            link='https://www.baidu.com/'
          />
          <StandardCard
            title='Geographical Distribution'
            description='/* Identify how the two repos differ in the geographic distribution of their contributors. */'
            image={<Image src={require('./images/chart-6.png').default} style={{borderRadius: 6}} />}
            link='https://www.baidu.com/'
          />
        </Cards>
      </Section>
      <Section>
        <TopList period={period} onPeriodChange={setPeriod} />
      </Section>
    </CustomPage>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

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
          <p className={clsx('hero__subtitle', styles.autoBr)}>
            Powered by
            <img alt="TiDB Cloud" src='img/tidb_cloud.png' width={108} height={24} />
          </p>
        </div>
      </div>
    </>
  );
}
