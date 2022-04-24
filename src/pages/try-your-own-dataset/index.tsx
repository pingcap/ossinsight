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
              link='https://ossinsight.io/blog/try-it-yourself/#sign-up-for-a-tidb-cloud-account-free'
            />
            <StandardCard
              title='Step 2: Create cluster (Free)'
              description='Create cluster with TiDB Cloud Dev Tier, it is free for one year ⏰ !'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='https://ossinsight.io/blog/try-it-yourself/#create-a-tidb-developer-tier-cluster-free'
            />
            <StandardCard
              title='Step 3: Import data'
              description='Import the sample data to your TiDB Cloud cluster, this dataset records what happend in the first hour of 2022'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='https://ossinsight.io/blog/try-it-yourself/#import-data-to-your-tidb-cloud-cluster'
            />
            <StandardCard
              title='Step 4: Analyze with SQL !'
              description='Use the sample SQL to see what happened in the first hour of 2022'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='https://ossinsight.io/blog/try-it-yourself/#analysis'
            />
          </Cards>
          <Button component='a' startIcon={<ArrowRightIcon />} variant='contained' sx={{':hover': {color: '#ffffff'}}} href="/blog/try-it-yourself/">
            Tutorial
          </Button>
        </Card>
      </Section>
      <Section
        title='You can do more than GitHub insight 🤔'
        subtitle='For real-time analytical, highly concurrent, and low-latency scenarios with massive data.'
      >
        <Cards xs={12} md={6} sx={{my: 4}}>
          <StandardCard
            title='Build your dashboards in Logistics Industry with Metabase'
            description='In this tutorial, you will build a prototype for PingExpress_DemoCorp’s real-time analytics dashboard that runs on a TiDB Cloud Proof-of-Concept (PoC) cluster.'
            codeStyleDescription={false}
            image={<Image src={require('./image-1.png').default} />}
            buttonText='details'
            link='https://en.pingcap.com/blog/build-a-real-time-analytics-application-with-tidb-cloud/?utm_source=ossinsight'
            readMore='https://en.pingcap.com/blog/build-a-real-time-analytics-application-with-tidb-cloud/?utm_source=ossinsight'
            tags={['Real-time analytics', 'Proliferate data']}
            elevation={0}
            cardSx={{backgroundColor: 'action.hover'}}
          />
        </Cards>
        <Cards xs={12} md={6} sx={{my: 4}}>
          <StandardCard
            title='Build a Real-time Dashboard for Promotions in Automobile Industry'
            description='In this case, the dashboard is refresh QPS needs to be very real-time. Using analytic databases exclusively is too costly for the business. Using lighter analysis tools and finding techniques that can be maintained quickly become important solutions for this typical scenario.'
            codeStyleDescription={false}
            image={<Image src={require('./image-2.png').default} />}
            buttonText='details'
            link='https://en.pingcap.com/case-study/reduce-real-time-query-latency-from-0-5s-to-0-01s-with-scale-out-htap-database/?utm_source=ossinsight'
            readMore='https://en.pingcap.com/case-study/reduce-real-time-query-latency-from-0-5s-to-0-01s-with-scale-out-htap-database/?utm_source=ossinsight'
            tags={['High availability','No sharding','Real-time analytics','Scalability','HTAP'}
            elevation={0}
            cardSx={{backgroundColor: 'action.hover'}}
          />
        </Cards>
        <div style={{textAlign: 'center'}}>
          <Button component='a' startIcon={<ArrowRightIcon />} variant='contained' sx={{':hover': {color: '#ffffff'}}} href="https://en.pingcap.com/customers/?utm_source=ossinsight">
            explore other cases
          </Button>
        </div>
      </Section>
    </CustomPage>
  )
}
