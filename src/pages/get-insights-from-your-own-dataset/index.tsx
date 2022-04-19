import React from "react";
import CustomPage from "../../theme/CustomPage";
import Typography from "@mui/material/Typography";
import Section from "../../components/Section";
import Card from "@mui/material/Card";
import {Cards, StandardCard} from "../../components/Cards";
import Button from "@mui/material/Button";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Image from "../../components/Image";

const title = '👏Get insights from your own dataset! '

export default function Page() {
  return (
    <CustomPage title={title}>
      <Section>
        <Typography variant='h1' sx={{mb: 8}}>{title}</Typography>
        <Typography variant='body1' sx={{mb: 1}}>
          How about start with our tutorial below
        </Typography>
        <Card sx={{px: 8, py: 4}}>
          <Typography variant='h3' component='h2'>
            ▶️ Use TiDB Cloud to Analyze GitHub Events in 10 Minutes
          </Typography>
          <Cards xs={12} md={6} sx={{my: 4}}>
            <StandardCard
              title='Step 1   Sign up (Free) '
              description='Sign up / Log in a TiDB Cloud account to start your journey'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
            />
            <StandardCard
              title='Step 2   Create cluster (Free)'
              description='You can create a free cluster with TiDB Developer Tier'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
            />
            <StandardCard
              title='Step 3   Import data'
              description='You can import the sample data to your TiDB Cloud cluster'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
            />
            <StandardCard
              title='Step 4   Analysis !'
              description='Enjoy your analysis after finish all the steps above'
              codeStyleDescription={false}
              elevation={0}
              cardSx={{backgroundColor: 'action.hover'}}
            />
          </Cards>
          <Button component='a' startIcon={<ArrowRightIcon />} variant='contained' sx={{':hover': {color: '#ffffff'}}}>
            Tutorial
          </Button>
        </Card>
      </Section>
      <Section
        title='You can do more than Github insight 🤔'
        subtitle='可用于实时分析、海量数据、高并发、低延迟等场景'
      >
        <Cards xs={12} md={6} sx={{my: 4}}>
          <StandardCard
            title='Build your dashboards in Metabase'
            description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor'
            codeStyleDescription={false}
            image={<Image src={require('./images/image-1.png').default} />}
            buttonText='details'
            readMore='https://www.baidu.com/'
            tags={['tag1', 'tag2']}
            elevation={0}
            cardSx={{backgroundColor: 'action.hover'}}
          />
          <StandardCard
            title='Build your dashboards in Metabase'
            description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor'
            codeStyleDescription={false}
            image={<Image src={require('./images/image-1.png').default} />}
            buttonText='details'
            readMore='https://www.baidu.com/'
            tags={['tag1', 'tag2']}
            elevation={0}
            cardSx={{backgroundColor: 'action.hover'}}
          />
          <StandardCard
            title='Build your dashboards in Metabase'
            description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor'
            codeStyleDescription={false}
            image={<Image src={require('./images/image-1.png').default} />}
            buttonText='details'
            readMore='https://www.baidu.com/'
            tags={['tag1', 'tag2']}
            elevation={0}
            cardSx={{backgroundColor: 'action.hover'}}
          />
          <StandardCard
            title='Build your dashboards in Metabase'
            description='Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor'
            codeStyleDescription={false}
            image={<Image src={require('./images/image-1.png').default} />}
            buttonText='details'
            readMore='https://www.baidu.com/'
            tags={['tag1', 'tag2']}
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
      <Section>
        <Typography variant='h2' align='center'>Need help❓</Typography>
        <Typography variant='subtitle1' component='p' sx={{ color: 'text.secondary', my: 2 }} align='center'>我们有详细的技术博客描述如何使用相关工具分析海量数据，或许对你分析自己的业务数据有所帮助</Typography>
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
    </CustomPage>
  )

}