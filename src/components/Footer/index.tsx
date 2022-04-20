import Typography from "@mui/material/Typography";
import {Cards, StandardCard} from "../Cards";
import Section from "../Section";
import React from "react";

export default function Footer() {
  return (
    <>
      <Section
        title='Wonder how OSS Insight works ?'
        subtitle={(
          <>
            Read our blog and 👏
            &nbsp;
            <a href='https://www.baidu.com'>try it yourself</a>
            !
          </>
        )}
      >
        <Cards sx={{mt: 2}} xs={12} sm={6} md={4}>
          <StandardCard
            title='Data Preparation for Analytics'
            description='March 22, 2022 · 5 min read'
            codeStyleDescription={false}
            readMore='https://www.baidu.com'
          />
          <StandardCard
            title='What is TiDB Cloud'
            description='March 22, 2022 · 5 min read'
            codeStyleDescription={false}
            readMore='https://www.baidu.com'
          />
          <StandardCard
            title='Use TiDB Cloud to Analyze GitHub Events in 10 Minutes'
            description='March 22, 2022 · 5 min read'
            codeStyleDescription={false}
            readMore='https://www.baidu.com'
          />
        </Cards>
      </Section>
      <Section>
        <div className="text--center">
          <h3>Follow us <a href="https://twitter.com/PingCAP">@PingCAP</a> and join the conversation using the
            hashtags #PingCAP</h3>
        </div>
      </Section>
    </>
  )
}
