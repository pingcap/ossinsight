import React, {useEffect, useMemo} from "react";
import styles from './index.module.css'
import {useRemoteData} from "../../components/RemoteCharts/hook";
import { CodeReviewIcon, CommentIcon, GitCommitIcon, GitPullRequestIcon, IssueClosedIcon, RepoDeletedIcon, RepoForkedIcon, RepoIcon, RepoPushIcon, StarIcon, VersionsIcon } from "@primer/octicons-react";
import { formatNumber } from "../../lib/text";
import { Box, Tooltip, useMediaQuery, useTheme } from "@mui/material";

const EVENT_TYPES = {
  'WatchEvent': {
    icon: <StarIcon size={14}/>
  },
  'PushEvent': {
    icon: <RepoPushIcon size={14}/>
  },
  'PullRequestEvent': {
    icon: <GitPullRequestIcon size={14}/>
  },
  'PullRequestReviewComment': {
    icon: <>
      <CodeReviewIcon size={14} />
      <CommentIcon className={styles.superIcon} size={10} />
    </>
  },
  'IssuesEvent': {
    icon: <IssueClosedIcon />
  },
  'CommitCommentEvent': {
    icon: <>
      <GitCommitIcon size={14} />
      <CommentIcon className={styles.superIcon} size={10} />
    </>
  },
  'CreateEvent': {
    icon: <RepoIcon size={14} />
  },
  'DeleteEvent': {
    icon: <RepoDeletedIcon  size={14} />
  },
  'ReleaseEvent': {
    icon: <VersionsIcon size={14} />
  },
  'ForkEvent': {
    icon: <RepoForkedIcon  size={14} />
  },
  'PullRequestReviewEvent': {
    icon: <CodeReviewIcon size={14}  />
  },
  'IssueCommentEvent': {
    icon: <>
      <IssueClosedIcon />
      <CommentIcon className={styles.superIcon} size={10} />
    </>
  }
}
const EVENT_TYPE_NAMES = Object.keys(EVENT_TYPES)

function getEventAllType(events) {
  return (events || []).filter((event) => {
    return event.type === 'All';
  })[0]
}

function getEventTypes(events) {
  return (events || []).filter((event) => {
    return EVENT_TYPE_NAMES.find((v) => v === event.type) !== undefined;
  }).sort(function(a, b) {
    return a.cnt < b.cnt
  })
}

export default function StatusBar(props) {
  const {data: res} = useRemoteData('events-last-imported', {}, false)
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  return <Box component='div' className={styles.statusBar} sx={{ display: { xs: 'none', sm: 'flex' } }}>
    <span className={styles.statusBarTitle}>
      <span>There were </span>
      <span className={styles.statusBarItemIncrease}>
        {
          formatNumber(getEventAllType(res?.data)?.cnt, 2) || 0
        }
      </span>
      {
        isLargeScreen ?
        <span> events imported during last hour: </span>:
        <span> events imported during last hour.</span>
      }
    </span>
    {
      isLargeScreen ?
      getEventTypes(res?.data).map((event, index, arr) => {
        return <span key={event.type}>
          <Tooltip title={event.type} arrow>
            <span>
              <span className={styles.statusBarItem}>
                <span className={styles.statusBarItemEventType}>{EVENT_TYPES[event.type]?.icon}</span>
                <span className={styles.statusBarItemIncrease}> +{formatNumber(event.cnt, 2)}</span>
              </span>
              {
                index !== arr.length - 1 ? <span>, </span> : null
              }
            </span>
          </Tooltip>
        </span>
      }) :
      null
    }
  </Box>
}
