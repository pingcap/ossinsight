import React from "react";
import {Repo} from "../CompareHeader/RepoSelector";
import styles from './compare-numbers.module.css'
import useSWR, {SWRResponse} from "swr";
import {createHttpClient} from "../../lib/request";
import Typography from "@mui/material/Typography";
import {formatNumber} from "../../lib/text";
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";

const httpClient = createHttpClient();

export interface CompareNumbersProps {
  tag?: keyof JSX.IntrinsicElements
  title: string
  query: string
  repos: [Repo | null, Repo | null]
}

export function CompareNumbersContainer({ title, children }) {
  return (
    <Card sx={{ maxWidth: 'max-content', mx: 'auto', py: 2, my: 2 }} elevation={0} >
      <CardHeader title={title} titleTypographyProps={{component: 'h2', variant: 'h4', align: 'center'}} />
      <div className={styles.compareNumbersContainer}>
        <div className={styles.compareNumbersContainerBody}>
          {children}
        </div>
      </div>
    </Card>
  )
}

export default function CompareNumbers({tag: Tag = 'div', title, query, repos}: CompareNumbersProps) {
  const repo1 = useNumberQuery(query, repos[0])
  const repo2 = useNumberQuery(query, repos[1])

  return (
    <Tag className={styles.compareNumbers} >
      <Typography
        className={styles.repo1}
        component='span'
        variant="body1"
        fontFamily="Lato"
        fontWeight={800}
        // color={isDarkTheme ? '#f5f6f7' : '#4d5771'}
      >
        {repo1.isValidating
          ? <CircularProgress size="1em" />
          : (
            <Tooltip title={repo1.data[0]}>
              <span>
                {repo1.data[1]}
              </span>
            </Tooltip>
          )
        }
      </Typography>
      <Typography
        className={styles.title}
        component="h3"
        variant="h5"
        fontFamily="Lato"
        gutterBottom
        fontWeight={400}
        sx={{borderColor: 'gray'}}
      >
        {title}
      </Typography>
      <Typography
        className={styles.repo2}
        component='span'
        variant="body1"
        fontFamily="Lato"
        fontWeight={800}
        // color={isDarkTheme ? '#f5f6f7' : '#4d5771'}
      >
        {repo2.isValidating
          ? <CircularProgress size="1em" />
          : (
            <Tooltip title={repo2.data[0]}>
              <span>
                {repo2.data[1]}
              </span>
            </Tooltip>
          )
        }
      </Typography>
    </Tag>
  )
}

function useNumberQuery(query: string, repo: Repo | null): SWRResponse<[string, string]> {
  return useSWR([query, repo], {
    fetcher: (query, repo) => {
      if (!repo) {
        return Promise.resolve(['--', '--'])
      } else {
        return httpClient.get(`/q/${query}`, {params: {repoName: repo.name}})
          .then(({data: {data}}) => {
            const origin = Object.values(data[0])
            return [String(origin), String(formatNumber(origin, 1) || 0)]
          })
      }
    },
    fallbackData: ['--', '--'],
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}
