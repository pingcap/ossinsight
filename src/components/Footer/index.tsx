import Typography from "@mui/material/Typography";
import {Cards, StandardCard} from "../Cards";
import React from "react";
import Section from "../../pages/home/_components/Section";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "../Link";

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
          Wonder how OSS Insight works?
        </Typography>
        <Cards sx={{mt: 2}} xs={12} sm={6} md={4}>
          <StandardCard
            title='How do we implement OSS Insight ?'
            description='Blog: 10 min read'
            codeStyleDescription={false}
            readMore='/blog/why-we-choose-tidb-to-support-ossinsight'
            buttonVariant='outlined'
            top={icon(require('./icon-1.png').default)}
            cardSx={{
              backgroundColor: '#2c2c2c'
            }}
          />
          <StandardCard
            title='Use TiDB Cloud to analyze GitHub events in 10 minutes'
            description='Tutorial: 10 min read'
            codeStyleDescription={false}
            readMore='/blog/try-it-yourself'
            buttonVariant='outlined'
            top={icon(require('./icon-2.png').default)}
            cardSx={{
              backgroundColor: '#2c2c2c'
            }}
          />
          <StandardCard
            title='Join a workshop to setup a mini OSS Insight'
            description='Tutorial: 25 min'
            codeStyleDescription={false}
            readMore='/workshop/overview'
            buttonVariant='outlined'
            top={icon(require('./icon-3.png').default)}
            cardSx={{
              backgroundColor: '#2c2c2c'
            }}
          />
        </Cards>
        <Box textAlign='center' sx={{fontSize: 24, mt: 6}}>
        Want to create your own IDEAInsight in a day?&nbsp;<br />
          <Button sx={{fontSize: 24, fontWeight: 'bold', verticalAlign: 'baseline', textDecoration: 'underline'}} component={Link} href='https://share.hsforms.com/1E-qtGQWrTVmctP8kBT34gw2npzm'>
            Join a workshop!
          </Button>
        </Box>
      </Section>
      <Section darker>
        <div className="text--center">
          <h3>
            Follow us at&nbsp;
            <a href="https://twitter.com/OSSInsight">@OSSInsight</a>
            &nbsp;and join the conversation using the hashtags
            <br />
            <a href="https://twitter.com/hashtag/OSSInsight" target='_blank'>
              #OSSInsight
            </a>
            &nbsp;
            <a href="https://twitter.com/hashtag/TiDBCloud" target='_blank'>
              #TiDBCloud
            </a>
          </h3>
        </div>
      </Section>
    </>
  )
}
