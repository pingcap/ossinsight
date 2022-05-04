import React from "react";
import CustomPage from "../../theme/CustomPage";
import Typography from "@mui/material/Typography";
import Section from "../../components/Section";
import Card from "@mui/material/Card";
import {Cards, StandardCard} from "../../components/Cards";
import Button from "@mui/material/Button";
import Link from "@docusaurus/Link";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Image from "../../components/Image";
import Footer from "../../components/Footer";
import Container from "@mui/material/Container";

const title = '👏 Try Your Own Dataset ! '

export default function Page() {
  return (
    <CustomPage title={title}>
      <Container maxWidth='xl'>
        <Typography variant='h1' sx={{mb: 2, mt: 8}} align='center'>{title}</Typography>
      </Container>
      <Section
        title='Use TiDB Cloud to Analyze GitHub Events in 5 Minutes'
      >
        <Card sx={{px: 8, py: 4}}>
          <Cards xs={12} md={6} sx={{my: 4}} spacing={4}>
            <StandardCard
              title='Step 1: Sign up TiDB Cloud (Free) '
              description='Sign up a TiDB Cloud account for free, no need to add credit card'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='/blog/try-it-yourself/#sign-up-for-a-tidb-cloud-account-free'
            />
            <StandardCard
              title='Step 2: Create cluster (Free)'
              description='Create cluster with TiDB Cloud Dev Tier, it is free for one year ⏰ !'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='/blog/try-it-yourself/#create-a-tidb-developer-tier-cluster-free'
            />
            <StandardCard
              title='Step 3: Import data'
              description='Import the sample data to your TiDB Cloud cluster, this dataset records what happend in the first hour of 2022'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='/blog/try-it-yourself/#import-data-to-your-tidb-cloud-cluster'
            />
            <StandardCard
              title='Step 4: Analyze with SQL !'
              description='Use the sample SQL to see what happened in the first hour of 2022'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='/blog/try-it-yourself/#analysis'
            />
          </Cards>
          <Button component='a' startIcon={<ArrowRightIcon />} variant='contained' sx={{':hover': {color: '#ffffff'}}} href="/blog/try-it-yourself/">
            Tutorial
          </Button>
        </Card>
      </Section>
      <Section
        title='See more of XYZ insight 🤔'
        subtitle='For real-time analytical, highly concurrent, and low-latency scenarios with massive data.'
      >
        <Cards xs={12} md={6} sx={{my: 4}}>
          <StandardCard
            title='Full Life Cycle Package Tracking in Real-time'
            description='Logistic companies care about real-time data. Besides building a package tracking system to record where exactly each package is, you still need insights like whether the resources (warehouse, vehicles, courier, etc) are deployed wisely; whether the packages reach the hands of customers in time; how many packages delivered during the peak hours of Black Friday.'
            codeStyleDescription={false}
            image={<Image src={require('./image-1.png').default} />}
            buttonText='details'
            link='https://en.pingcap.com/case-study/real-time-insights-reduce-per-order-costs-by-25-percent/?utm_source=ossinsight'
            readMore='https://en.pingcap.com/case-study/real-time-insights-reduce-per-order-costs-by-25-percent/?utm_source=ossinsight'
            buttonVariant='contained' 
            tags={['Logistic delivery', 'Multi-dimensional analytics']}
            elevation={0}
            cardSx={{backgroundColor: 'action.hover'}}
          />
          <StandardCard
            title='Use Real-time Dashboards in Big Sales Promotion'
            description='During special shopping seasons, merchants often hold promotions. In this case, the refresh interval of the dashboard needs to be very real-time. Dedicated use of analytics databases is too cumbersome and yet costly for the business. A lightweight analytics platform that can be maintained easily will be a suitable solution for this typical scenario.'
            codeStyleDescription={false}
            image={<Image src={require('./image-2.png').default} />}
            buttonText='details'
            link='https://en.pingcap.com/case-study/reduce-real-time-query-latency-from-0-5s-to-0-01s-with-scale-out-htap-database/?utm_source=ossinsight'
            readMore='https://en.pingcap.com/case-study/reduce-real-time-query-latency-from-0-5s-to-0-01s-with-scale-out-htap-database/?utm_source=ossinsight'
            buttonVariant='contained'
            tags={['High availability','No sharding','Real-time analytics','Scalability']}
            elevation={0}
            cardSx={{backgroundColor: 'action.hover'}}
          />
          <StandardCard
            title='A Database Solution for Building a Data-heavy Community Forum Application'
            description='The Autohome community forum is one of the oldest applications, with 100 million+ daily visits and 1 billion+ daily interface calls. As data size rapidly grew, SQL Server became  database bottleneck. Sharding didn’t meet our app requirements, and scaling database capacity affected apps. It looked for a new database solution.'
            codeStyleDescription={false}
            image={<Image src={require('./image-3.png').default} />}
            buttonText='details'
            link='https://en.pingcap.com/case-study/reduce-real-time-query-latency-from-0-5s-to-0-01s-with-scale-out-htap-database/?utm_source=ossinsight?utm_source=ossinsight'
            readMore='https://en.pingcap.com/case-study/reduce-real-time-query-latency-from-0-5s-to-0-01s-with-scale-out-htap-database/?utm_source=ossinsight?utm_source=ossinsight'
            buttonVariant='contained'
            tags={['High Availability','Scalability','HTAP','Real-time Analytics']}
            elevation={0}
            cardSx={{backgroundColor: 'action.hover'}}
          />
           <StandardCard
            title='Maintain Millisecond Query Response Times in the Massive Data Volume of Social Media Platforms'
            description='About 1.3 trillion rows of data were stored in ZHIHU Moneta application. With approximately 100 billion rows of data accruing each month and growing, this number will reach 3 trillion in two years. ZHIHU faced severe challenges in scaling our backend system while maintaining good user experience.'
            codeStyleDescription={false}
            image={<Image src={require('./image-4.png').default} />}
            buttonText='details'
            buttonVariant='contained'
            link='https://en.pingcap.com/case-study/lesson-learned-from-queries-over-1-3-trillion-rows-of-data-within-milliseconds-of-response-time-at-zhihu/?utm_source=ossinsight?utm_source=ossinsight'
            readMore='https://en.pingcap.com/case-study/lesson-learned-from-queries-over-1-3-trillion-rows-of-data-within-milliseconds-of-response-time-at-zhihu/?utm_source=ossinsight?utm_source=ossinsight'
            tags={['Real-time Analytics','Millisecond precision','High throughput']}
            elevation={0}
            cardSx={{backgroundColor: 'action.hover'}}
          />
        </Cards>
        <div style={{textAlign: 'center'}}>
          <Button component='a' startIcon={<ArrowRightIcon />} variant='contained' sx={{':hover': {color: '#ffffff'}}} href="https://en.pingcap.com/customers/?utm_source=ossinsight" target="_blank">
            More Cases
          </Button>
        </div>
      </Section>
    </CustomPage>
  )
}
