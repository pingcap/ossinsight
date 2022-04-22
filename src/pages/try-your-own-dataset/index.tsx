import React from "react";
import CustomPage from "../../theme/CustomPage";
import Typography from "@mui/material/Typography";
import Section from "../../components/Section";
import Card from "@mui/material/Card";
import {Cards, StandardCard} from "../../components/Cards";
import Button from "@mui/material/Button";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Image from "../../components/Image";
import Footer from "../../components/Footer";

const title = '👏 Try Your Own Dataset ! '

export default function Page() {
  return (
    <CustomPage title={title}>
      <Typography variant='h1' sx={{mb: 4, mt: 6}} align='center'>{title}</Typography>
      <Section
        title='Use TiDB Cloud to Analyze GitHub Events in 5 Minutes'
      >
        <Card sx={{px: 8, py: 4}}>
          <Cards xs={12} md={6} sx={{my: 4}} spacing={4}>
            <StandardCard
              title='Step 1: Sign up (Free) '
              description='Sign up / Log in a TiDB Cloud account to start your journey'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='https://ossinsight.io/blog/try-it-yourself/#sign-up-for-a-tidb-cloud-account-free'
            />
            <StandardCard
              title='Step 2: Create cluster (Free)'
              description='You can create a free cluster with TiDB Developer Tier'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='https://ossinsight.io/blog/try-it-yourself/#create-a-tidb-developer-tier-cluster-free'
            />
            <StandardCard
              title='Step 3: Import data'
              description='You can import the sample data to your TiDB Cloud cluster'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='https://ossinsight.io/blog/try-it-yourself/#import-data-to-your-tidb-cloud-cluster'
            />
            <StandardCard
              title='Step 4: Analysis !'
              description='Enjoy your analysis after finish all the steps above'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
              link='https://ossinsight.io/blog/try-it-yourself/#analysis'
            />
          </Cards>
          <Button component='a' startIcon={<ArrowRightIcon />} variant='contained' sx={{':hover': {color: '#ffffff'}}}>
            Tutorial
          </Button>
        </Card>
      </Section>
      <Section
        title='You can do more than Github insight 🤔'
        subtitle='For real-time analytical, highly concurrent, and low-latency scenarios with massive data.'
      >
        <Cards xs={12} md={6} sx={{my: 4}}>
          <StandardCard
            title='Build your dashboards in Logistics Industry with Metabase'
            description='In this tutorial, you will build a prototype for PingExpress_DemoCorp’s real-time analytics dashboard that runs on a TiDB Cloud Proof-of-Concept (PoC) cluster.'
            codeStyleDescription={false}
            image={<Image src={require('./image-1.png').default} />}
            buttonText='details'
            link='https://en.pingcap.com/blog/build-a-real-time-analytics-application-with-tidb-cloud/'
            readMore='https://en.pingcap.com/blog/build-a-real-time-analytics-application-with-tidb-cloud/'
            tags={['Real-time analytics', 'Proliferate data']}
            elevation={0}
            cardSx={{backgroundColor: 'action.hover'}}
          />
        </Cards>
        <div style={{textAlign: 'center'}}>
          <Button component='a' startIcon={<ArrowRightIcon />} variant='contained' sx={{':hover': {color: '#ffffff'}}}>
            explore other cases
          </Button>
        </div>
      </Section>
    </CustomPage>
  )
}
