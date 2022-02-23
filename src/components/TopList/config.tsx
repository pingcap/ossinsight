import {RepoRank} from "../../api/query";
import {
  CodeReviewIcon,
  CommentIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  StarIcon
} from "@primer/octicons-react";
import styles from "./index.module.css";
import React from "react";

interface Data {
  title: React.ReactNode
  headline: {
    content: string
    url: string
  }
  tooltip: React.ReactNode
  key: keyof RepoRank
}

export const data: Data[] = [
  {
    title: 'Events',
    headline: {
      content: 'Events',
      url: 'https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types'
    },
    tooltip: 'All events in recent 1 hour',
    key: 'history_events'
  },
  {
    title: <StarIcon />,
    headline: {
      content: 'WatchEvent',
      url: 'https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#watchevent'
    },
    tooltip: (
      <>
        When someone stars a repository. The type of activity is specified in the action property of the payload object.
        For more information, see the "starring" REST API.
        <br />
        <br />
        The event object includes properties that are common for all events. Each event object includes a payload
        property and the value is unique to each event type. The payload object for this event is described below.
      </>
    ),
    key: 'watch_events'
  },
  {
    title: <GitPullRequestIcon />,
    headline: {
      content: 'PullRequestEvent',
      url: 'https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#pullrequestevent'
    },
    tooltip: (
      <>
        Activity related to pull requests. The type of activity is specified in the action property of the payload
        object. For more information, see the "pull requests" REST API.
        <br />
        <br />
        The event object includes properties that are common for all events. Each event object includes a payload
        property and the value is unique to each event type. The payload object for this event is described below.
      </>
    ),
    key: 'pull_request_events'
  },
  {
    title: <IssueClosedIcon />,
    headline: {
      content: 'IssuesEvent',
      url: 'https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#issuesevent'
    },
    tooltip: (
      <>
        Activity related to an issue. The type of activity is specified in the action property of the payload object.
        For more information, see the "issues" REST API.
        <br />
        <br />
        The event object includes properties that are common for all events. Each event object includes a payload
        property and the value is unique to each event type. The payload object for this event is described below.
      </>
    ),
    key: 'issues_events'
  },
  {
    title: <CodeReviewIcon />,
    headline: {
      content: 'PullRequestReviewEvent',
      url: 'https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#pullrequestreviewevent'
    },
    tooltip: (
      <>
        Activity related to pull request reviews. The type of activity is specified in the action property of the
        payload object. For more information, see the "pull request reviews" REST API.
        <br />
        <br />
        The event object includes properties that are common for all events. Each event object includes a payload
        property and the value is unique to each event type. The payload object for this event is described below.
      </>
    ),
    key: 'pull_request_review_events'
  },
  {
    title: (
      <>
        <IssueClosedIcon />
        <CommentIcon className={styles.superIcon} size={10} />
      </>
    ),
    headline: {
      content: 'IssueCommentEvent',
      url: 'https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#issuecommentevent'
    },
    tooltip: (
      <>
        Activity related to an issue or pull request comment. The type of activity is specified in the action property
        of the payload object. For more information, see the "issue comments" REST API.
        <br />
        <br />
        The event object includes properties that are common for all events. Each event object includes a payload
        property and the value is unique to each event type. The payload object for this event is described below.
      </>
    ),
    key: 'issue_comment_events'
  },
  {
    title: (
      <>
        <CodeReviewIcon />
        <CommentIcon className={styles.superIcon} size={10} />
      </>
    ),
    headline: {
      content: 'PullRequestReviewCommentEvent',
      url: 'https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#pullrequestreviewcommentevent'
    },
    tooltip: (
      <>
        Activity related to pull request review comments in the pull request's unified diff. The type of activity is
        specified in the action property of the payload object. For more information, see the "pull request review
        comments" REST API.
        <br />
        <br />
        The event object includes properties that are common for all events. Each event object includes a payload
        property and the value is unique to each event type. The payload object for this event is described below.
      </>
    ),
    key: 'pull_request_review_comment_events'
  },
  {
    title: (
      <>
        <GitCommitIcon />
        <CommentIcon className={styles.superIcon} size={10} />
      </>
    ),
    headline: {
      content: 'CommitCommentEvent',
      url: 'https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#commitcommentevent'
    },
    tooltip: (
      <>
        A commit comment is created. The type of activity is specified in the action property of the payload object. For
        more information, see the "commit comment" REST API.
        <br />
        <br />
        The event object includes properties that are common for all events. Each event object includes a payload
        property and the value is unique to each event type. The payload object for this event is described below.
      </>
    ),
    key: 'commit_comment_events'
  }
]
