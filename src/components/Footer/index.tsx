import Typography from "@mui/material/Typography";
import {Cards, StandardCard} from "../Cards";
import React from "react";
import Section from "../../pages/home/_components/Section";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@docusaurus/Link";

const icon = (src) => {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4}}>
      <img src={src} alt='logo' width='54' height='54' />
    </Box>
  )
}

export default function Footer() {
  return (
    <>
      <Section>
        <Typography variant='h2' sx={{fontSize:40}} align='center'>
          Wonder how OSS Insight works ?
        </Typography>
        <Cards sx={{mt: 2}} xs={12} sm={6} md={4}>
          <StandardCard
            title='Data Preparation for Analytics'
            description='Blog · 5 min read'
            codeStyleDescription={false}
            readMore='/blog/how-it-works'
            buttonVariant='outlined'
            top={icon(require('./icon-1.png').default)}
            cardSx={{
              backgroundColor: '#2c2c2c'
            }}
          />
          <StandardCard
            title='Why We Choose TiDB to Support OSS Insight'
            description='Blog · 5 min read'
            codeStyleDescription={false}
            readMore='/blog/why-we-choose-tidb-to-support-oss-insight'
            buttonVariant='outlined'
            top={icon(require('./icon-2.png').default)}
            cardSx={{
              backgroundColor: '#2c2c2c'
            }}
          />
          <StandardCard
            title='Use TiDB Cloud to Analyze GitHub Events in 10 Minutes'
            description='Tutorial · 10 min read'
            codeStyleDescription={false}
            readMore='/blog/try-it-yourself'
            buttonVariant='outlined'
            top={icon(require('./icon-3.png').default)}
            cardSx={{
              backgroundColor: '#2c2c2c'
            }}
          />
        </Cards>
        <Box textAlign='center' sx={{fontSize: 24, mt: 6}}>
          Now,&nbsp;
          <Button sx={{fontSize: 24, fontWeight: 'bold', verticalAlign: 'baseline' }} component={Link} href='/try-your-own-dataset?utm_content=wonder_cta'>
            Try your own dataset !
          </Button>
        </Box>
      </Section>
      <Section darker>
        <div className="text--center">
          <h3>
            Follow us&nbsp;
            <a href="https://twitter.com/OSSInsight">@OSSInsight</a>
            &nbsp;and join the conversation using the hashtags
            <br />
            <a href="https://twitter.com/hashtag/OSS_Insight" target='_blank'>
              #OSS_Insight
            </a>
            &nbsp;
            <a href="https://twitter.com/hashtag/TiDB_Cloud" target='_blank'>
              #TiDB_Cloud
            </a>
          </h3>
        </div>
      </Section>
    </>
  )
}
