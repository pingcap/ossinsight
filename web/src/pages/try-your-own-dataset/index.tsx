import React from 'react';
import CustomPage from '../../theme/CustomPage';
import Section from './_components/Section';
import { Cards, StandardCard } from '../../components/Cards';
import Link from '@docusaurus/Link';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Image from '../../components/Image';
import IconSet from './icon-set.svg';

import { Grid, Typography, Card, Button, Container } from '@mui/material';

const title = '🔥 Try Your Own Dataset ! ';

export default function Page () {
  return (
    <CustomPage title={title}>
      <Container maxWidth='xl'>
        <Typography variant='h1' sx={{ mb: 2, mt: 8 }} align='center'>{title}</Typography>
      </Container>
      <Typography variant='h2' sx={{ mb: 2, mt: 8, mx: 2 }} align='center'>Use TiDB Cloud to Analyze GitHub Events in 10 Minutes</Typography>
      <Section>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Card
              sx={(theme) => ({
                px: 8,
                py: 4,
                [theme.breakpoints.down('md')]: {
                  p: 2,
                },
              })}
            >
              <Cards xs={12} md={6} spacing={4}>
                <StandardCard
                  title='Step 1: Sign up TiDB Cloud'
                  description='Sign up a TiDB Cloud account for free, no need to add credit card'
                  codeStyleDescription={false}
                  elevation={0}
                  cardSx={{ backgroundColor: 'action.hover' }}
                  link='/blog/try-it-yourself/#sign-up-for-a-tidb-cloud-account-free'
                  size='small'
                />
                <StandardCard
                  title='Step 2: Create cluster'
                  description='Create cluster with TiDB Cloud Serverless Tier ⏰ !'
                  codeStyleDescription={false}
                  elevation={0}
                  cardSx={{ backgroundColor: 'action.hover' }}
                  link='/blog/try-it-yourself/#create-a-tidb-cloud-serverless-tier-cluster'
                  size='small'
                />
                <StandardCard
                  title='Step 3: Import data'
                  description='Import the sample data to your TiDB Cloud cluster, this dataset records what happened in the first hour of 2022'
                  codeStyleDescription={false}
                  elevation={0}
                  cardSx={{ backgroundColor: 'action.hover' }}
                  link='/blog/try-it-yourself/#import-data-to-your-tidb-cloud-cluster'
                  size='small'
                />
                <StandardCard
                  title='Step 4: Analyze with SQL !'
                  description='Use the sample SQL to see what happened in the first hour of 2022'
                  codeStyleDescription={false}
                  elevation={0}
                  cardSx={{ backgroundColor: 'action.hover' }}
                  link='/blog/try-it-yourself/#analysis'
                  size='small'
                />
              </Cards>
              <Button component='a' startIcon={<ArrowRightIcon />} variant='contained' sx={{ mt: 4, ':hover': { color: '#ffffff' } }} href="/blog/try-it-yourself/">
                Tutorial
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={[
              { px: 4, py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
              theme => ({ [theme.breakpoints.up('lg')]: { height: '100%' } }),
            ]}>
              <IconSet />
              <Typography variant='h3' sx={{ fontWeight: 'bold', my: 4 }}>
                How we build this powerful insight tool?
              </Typography>
              <Button variant='outlined' component={Link} to='/blog/why-we-choose-tidb-to-support-ossinsight/'>
                Get for answers
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Section>
      <Typography variant='h2' sx={{ mb: 2, mt: 8 }} align='center'>See more of XYZ insight 🤔</Typography>
      <Typography variant='subtitle1' align='center'>
        For real-time analytical, highly concurrent, and low-latency scenarios with massive data.
      </Typography>
      <Section>
        <Cards xs={12} md={6} sx={{ mb: 4 }}>
          <StandardCard
            title='Logistics Insight for Building a Real-time Parcel Tracking System'
            description='It is very important for logistics companies in getting insights to build a real-time parcel tracking system. Here you can find how these valuable insights were obtained.'
            codeStyleDescription={false}
            image={<Image src={require('./image-1.png').default} />}
            buttonText='get insights'
            link='https://en.pingcap.com/blog/build-a-real-time-analytics-application-with-tidb-cloud/?utm_source=ossinsight&utm_medium=referral'
            readMore='https://en.pingcap.com/blog/build-a-real-time-analytics-application-with-tidb-cloud/?utm_source=ossinsight&utm_medium=referral'
            buttonVariant='contained'
            tags={['Logistic delivery', 'Multi-dimensional analytics']}
            elevation={0}
            cardSx={{ backgroundColor: 'action.hover' }}
          />
          <StandardCard
            title='SaaS Insight for Building a Real-time CRM Application'
            description='SaaS systems are naturally hybrid-workload systems. Here is a useful case illustrate how to choose database solution for SaaS application( e.g. CRM ) through insights.'
            codeStyleDescription={false}
            image={<Image src={require('./image-2.png').default} />}
            buttonText='get insights'
            link='/blog/saas-insight-for-building-a-real-time-crm-application'
            readMore='/blog/saas-insight-for-building-a-real-time-crm-application'
            buttonVariant='contained'
            tags={['High availability', 'No sharding', 'Real-time analytics', 'Scalability']}
            elevation={0}
            cardSx={{ backgroundColor: 'action.hover' }}
          />
        </Cards>
        <div style={{ textAlign: 'center' }}>
          <Button component='a' startIcon={<ArrowRightIcon />} variant='contained' sx={{ ':hover': { color: '#ffffff' } }} href="https://en.pingcap.com/customers/?utm_source=ossinsight&utm_medium=referral" target="_blank">
            More Cases
          </Button>
        </div>
      </Section>
    </CustomPage>
  );
}
