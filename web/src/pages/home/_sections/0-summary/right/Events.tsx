import {
  CodeReviewIcon,
  CommentIcon,
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestIcon, IssueClosedIcon, IssueOpenedIcon, LogoGistIcon, PersonAddIcon, RepoDeletedIcon, RepoForkedIcon,
  RepoIcon,
  RepoPushIcon, StarFillIcon, TagIcon,
} from '@primer/octicons-react';
import React, { useCallback, useEffect, useRef } from 'react';
import { CoolList, CoolListInstance } from '@site/src/components/CoolList';
import { useRealtimeRemoteData } from '@site/src/components/RemoteCharts/hook';
import { notNullish } from '@site/src/utils/value';
import { styled } from '@mui/material';

type Event = {
  id: number;
  type: 'PushEvent' | 'CreateEvent' | 'PullRequestEvent' | 'WatchEvent' | 'IssueCommentEvent' | 'IssuesEvent' | 'DeleteEvent' | 'ForkEvent' | 'PullRequestReviewCommentEvent' | 'PullRequestReviewEvent' | 'GollumEvent' | 'ReleaseEvent' | 'MemberEvent' | 'CommitCommentEvent' | 'PublicEvent' | 'GistEvent' | 'FollowEvent' | 'Event' | 'DownloadEvent' | 'TeamAddEvent' | 'ForkApplyEvent';
  repo_name: string;
  org_login: string;
  actor_login: string;
  number: number;
  action: 'added' | 'update' | 'created' | 'opened' | 'edited' | 'published' | 'fork' | 'create' | 'merged' | 'started' | 'synchronize' | 'closed' | 'labeled' | 'reopened';
  created_at: string;
  pr_merged: 0 | 1 | null;
};

const getKey = (e: Event) => e.id;

export default function Events ({ show }: { show: boolean }) {
  const ref = useRef<CoolListInstance<Event>>(null);
  const intervalHandler = useRef<ReturnType<typeof setInterval>>();

  const dataRef = useRef<[Event[], number]>([[], 0]);
  // const data = useRealtimeRemoteData<{}, Event>('events-increment-list', {}, false, show);
  const data = useRealtimeRemoteData<{}, Event>(
    'events-increment-list',
    {},
    false,
    show,
    'unique',
  );

  useEffect(() => {
    if (notNullish(data.data)) {
      dataRef.current = [data.data.data, 0];
    }
  }, [data.data]);

  const start = useCallback(() => {
    clearInterval(intervalHandler.current);
    intervalHandler.current = setInterval(() => {
      const [events, i] = dataRef.current;
      if (i < events.length) {
        events[i].id = `${events[i].id}-${Date.now()}` as any; // prevent duplicated id
        ref.current?.add(events[i]);
        dataRef.current[1]++;
      }
    }, 500);
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalHandler.current);
  }, []);

  useEffect(() => {
    if (show) {
      start();
    }
    return stop;
  }, [show]);

  return (
    <CoolList
      ref={ref}
      maxLength={7}
      itemHeight={24}
      getKey={getKey}
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      {renderEvent}
    </CoolList>
  );
}

const EventText = styled('span')({
  fontSize: 12,
  lineHeight: '12px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

function renderEvent (event: Event) {
  return (
    <EventText>
      {renderVerb(event)}
      &nbsp;
      {renderTarget(event)}
    </EventText>
  );
}

function renderVerb (event: Event) {
  const actor = <a href={`https://github.com/${event.actor_login}`} rel="noopener">{event.actor_login}</a>;
  switch (event.type) {
    case 'PushEvent':
      return <><RepoPushIcon size={12} /> {actor} pushed to</>;
    case 'CreateEvent':
      return <><RepoIcon size={12} /> {actor} created</>;
    case 'PullRequestEvent': {
      const pr = <a href={prUrl(event)} target="_blank" rel="noopener noreferrer">#{event.number}</a>;
      switch (event.action) {
        case 'closed':
          if (event.pr_merged) {
            return <><GitMergeIcon size={12} /> {actor} merged PR {pr} in</>;
          } else {
            return <><GitPullRequestClosedIcon size={12} /> {actor} closed PR {pr} in</>;
          }
        default:
          return <><GitPullRequestIcon size={12} /> {actor} {event.action} PR {pr} in</>;
      }
    }
    case 'WatchEvent':
      return <><StarFillIcon size={12} /> {actor} starred</>;
    case 'ForkEvent':
      return <><RepoForkedIcon size={12} /> {actor} forked</>;
    case 'IssuesEvent': {
      const issue = <a href={issueUrl(event)} target="_blank" rel="noopener noreferrer">#{event.number}</a>;
      switch (event.action) {
        case 'closed':
          return <><IssueClosedIcon size={12} /> {actor} closed {issue} in</>;
        default:
          return <><IssueOpenedIcon size={12} /> {actor} {event.action} {issue} in</>;
      }
    }
    case 'PullRequestReviewCommentEvent': {
      const pr = <a href={prUrl(event)} target="_blank" rel="noopener noreferrer">#{event.number}</a>;
      return <><CommentIcon size={12} /> {actor} commented review PR {pr} in</>;
    }
    case 'PullRequestReviewEvent': {
      const pr = <a href={prUrl(event)} target="_blank" rel="noopener noreferrer">#{event.number}</a>;
      return <><CodeReviewIcon size={12} /> {actor} review PR {pr} in</>;
    }
    case 'IssueCommentEvent': {
      const issue = <a href={issueUrl(event)} target="_blank" rel="noopener noreferrer">#{event.number}</a>;
      return <><CommentIcon size={12} /> {actor} commented issue {issue} in</>;
    }
    case 'CommitCommentEvent':
      return <><CommentIcon size={12} /> {actor} commented commit in</>;
    case 'ReleaseEvent':
      return <><TagIcon size={12} /> {actor} released in</>;
    case 'DeleteEvent':
      return <><RepoDeletedIcon size={12} /> {actor} deleted</>;
    case 'GollumEvent':
      return <>{actor} updated wiki in</>;
    case 'GistEvent':
      return <><LogoGistIcon size={12} /> {actor} {event.action} gist</>;
    case 'MemberEvent':
      return <><PersonAddIcon size={12} /> {actor} {event.action} member in</>;
    // Events below are not described in current github document
    // https://docs.github.com/cn/developers/webhooks-and-events/events/github-event-types#memberevent
    case 'PublicEvent':
    case 'DownloadEvent':
    case 'TeamAddEvent':
    case 'FollowEvent':
    case 'ForkApplyEvent':
    case 'Event':
      return <span>{event.type}</span>;
  }
}

function renderTarget (event: Event) {
  if (event.repo_name) {
    return <a href={`https://github.com/${event.repo_name}`} target="_blank" rel="noopener noreferrer">{event.repo_name}</a>;
  }
}

function prUrl (event: Event): string {
  return `https://github.com/${event.repo_name}/pull/${event.number}`;
}

function issueUrl (event: Event): string {
  return `https://github.com/${event.repo_name}/issues/${event.number}`;
}
