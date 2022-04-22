import Typography from "@mui/material/Typography";
import {Cards, StandardCard} from "../Cards";
import React from "react";
import Section from "../../pages/home/_components/Section";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

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
            description='Tutorial · 5 min read'
            codeStyleDescription={false}
            readMore='/blog/how-it-works'
            top={icon(require('./icon-1.png').default)}
          />
          <StandardCard
            title='What is TiDB Cloud'
            description='Documentation · 10 min read'
            codeStyleDescription={false}
            readMore='https://docs.pingcap.com/tidbcloud'
            top={icon(require('./icon-2.png').default)}
          />
          <StandardCard
            title='Use TiDB Cloud to Analyze GitHub Events in 10 Minutes'
            description='Tutorial · 10 min read'
            codeStyleDescription={false}
            readMore='/blog/try-it-yourself'
            top={icon(require('./icon-3.png').default)}
          />
        </Cards>
        <Box textAlign='center' sx={{fontSize: 24, mt: 6}}>
          Now, how about
          <Button sx={{fontSize: 24, fontWeight: 'bold'}}>
            Try your own dataset !
          </Button>
        </Box>
      </Section>
      <Section darker>
        <div className="text--center">
          <h3>
            Follow us&nbsp;
            <a href="https://twitter.com/PingCAP">@PingCAP</a>
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
