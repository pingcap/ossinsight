import CodeIcon from '@mui/icons-material/Code';
import {
  FormControlLabel,
  FormControl,
  ListItem,
  ListItemAvatar,
  Switch,
  useEventCallback,
  InputLabel,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import React, { ForwardedRef, forwardRef, useCallback, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAnalyzeContext } from '../../../analyze-charts/context';
import DebugDialog from '../../../components/DebugDialog/DebugDialog';
import { RemoteData, useRemoteData } from '../../../components/RemoteCharts/hook';
import useVisibility from '../../../hooks/visibility';
import Section from '../Section';
import { H2, P2 } from '../typography';

type ChangedEvents = { last_month_events: number, last_2nd_month_events: number, changes: number }

type CodeType = 'add' | 'delete' | 'lines'
type CodeKeys<K extends CodeType> =
  `${K}_row_num`
  | `last_month_${K}`
  | `last_2nd_month_${K}`
  | `${K}_changed`
  | `${K}_proportion`
type ChangedCodes =
  Record<CodeKeys<'add'>, number>
  & Record<CodeKeys<'delete'>, number>
  & Record<CodeKeys<'lines'>, number>

type Param = { repoId: number, excludeBots: boolean }
type Result = { actor_id: number, actor_login: string, proportion: number, row_num: number }

type TypeMap = {
  'analyze-people-activities-contribution-rank': Result & ChangedEvents
  'analyze-people-code-changes-contribution-rank': Result & ChangedCodes
  'analyze-people-code-contribution-rank': Result & ChangedEvents & { is_new_contributor: 0 | 1 }
  'analyze-people-code-review-comments-contribution-rank': Result & ChangedEvents
  'analyze-people-code-review-prs-contribution-rank': Result & ChangedEvents
  'analyze-people-code-review-submits-contribution-rank': Result & ChangedEvents
  'analyze-people-issue-close-contribution-rank': Result & ChangedEvents
  'analyze-people-issue-comment-contribution-rank': Result & ChangedEvents
  'analyze-people-issue-contribution-rank': Result & ChangedEvents & { is_new_contributor: 0 | 1 }
}

type Descriptor<K extends keyof TypeMap> = {
  key: K
  title: string
  render: (item: TypeMap[K], first: TypeMap[K], options: { percentage: boolean }) => JSX.Element
}

const descriptors: Descriptor<any>[] = [
  {
    key: 'analyze-people-activities-contribution-rank',
    title: 'All Activities',
    render: renderBasic,
  },
  {
    key: 'analyze-people-code-contribution-rank',
    title: 'Push and Commits',
    render: renderBasic,
  },
  {
    key: 'analyze-people-issue-contribution-rank',
    title: 'Issue Open',
    render: renderBasic,
  },
  {
    key: 'analyze-people-issue-comment-contribution-rank',
    title: 'Issue Comment',
    render: renderBasic,
  },
  {
    key: 'analyze-people-issue-close-contribution-rank',
    title: 'Issue Close',
    render: renderBasic,
  },
  {
    key: 'analyze-people-code-review-comments-contribution-rank',
    title: 'Code Review Comments',
    render: renderBasic,
  },
  {
    key: 'analyze-people-code-review-prs-contribution-rank',
    title: 'Code Review PRs',
    render: renderBasic,
  },
  {
    key: 'analyze-people-code-review-submits-contribution-rank',
    title: 'Code Review Submits',
    render: renderBasic,
  },
  // {
  //   key: 'analyze-people-code-changes-contribution-rank',
  //   title: 'Code Changes',
  //   render: renderCodes,
  // },
];

function renderBasic(item: Result & ChangedEvents & { is_new_contributor?: 0 | 1 }, first: Result & ChangedEvents, { percentage }: { percentage: boolean }): JSX.Element {
  let avatar = <Avatar src={`https://github.com/${item.actor_login}.png`} />;
  if (item.is_new_contributor) {
    avatar = (
      <Badge color='primary' badgeContent="new">
        {avatar}
      </Badge>
    );
  }
  return (
    <Line key={item.actor_login}>
      <ListItemAvatar>
        <a href={`https://github.com/${item.actor_login}`} target="_blank" rel="noopener">
          {avatar}
        </a>
      </ListItemAvatar>
      <Box sx={{ fontSize: 12, maxWidth: 64, minWidth: 64, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', mr: 1 }}>
        {item.actor_login}
      </Box>
      <Bar sx={{ width: `${item.last_month_events / first.last_month_events * 100}%` }} />
      {percentage
        ? (
          <Number>{(item.proportion * 100).toPrecision(2)}%</Number>
        ) : (
          <Number>{item.last_month_events} ({item.changes >= 0 ? `+${item.changes}` : item.changes})</Number>
        )}
    </Line>
  );
}

// TODO
function renderCodes(item: Result & ChangedCodes, first: Result & ChangedCodes): JSX.Element {
  return <></>;
}

function useData<K extends keyof TypeMap>(repoId: number, key: string, excludeBots: boolean, show: boolean): [TypeMap[K][], RemoteData<any, TypeMap[K]>] {
  const { data } = useRemoteData<Param, TypeMap[K]>(key, {
    repoId,
    excludeBots,
  }, false, show);

  return [data?.data ?? [], data];
}

const BarContainer = styled(List)({
  paddingRight: 128,
  overflowY: 'scroll',
  maxHeight: '80vh',
  minHeight: '40vh',
  marginTop: 16,
  marginBottom: 16,
});

const Line = styled(ListItem)({
  width: 'calc(100% + 128px)',
});

const Bar = styled('span')({
  display: 'block',
  height: 28,
  background: 'linear-gradient(136deg, rgba(255,177,98,1) 0%, rgba(247,124,0,1) 100%)',
  minWidth: 1,
});

const Number = styled('span')({
  display: 'block',
  height: 28,
  lineHeight: '28px',
  fontSize: 14,
  width: 128,
  color: 'white',
  boxSizing: 'border-box',
  padding: '0 8px',
});

const Spacer = styled('div')({
  flex: 100,
})

export const Contributors = forwardRef(function ({}, ref: ForwardedRef<HTMLElement>) {
  const visible = useVisibility();
  const { ref: inViewRef, inView } = useInView();

  const { repoId } = useAnalyzeContext();
  const [descriptor, setDescriptor] = useState<Descriptor<any>>(descriptors[0]);
  const [type, setType] = useState('count');
  const [excludeBots, setExcludeBots] = useState(true);
  const [list, data] = useData(repoId, descriptor.key, excludeBots, visible && inView);

  const [showDebugModel, setShowDebugModel] = useState(false);

  const handleShowDebugModel = useEventCallback(() => {
    setShowDebugModel(true);
  })

  const handleCloseDebugModel = useEventCallback(() => {
    setShowDebugModel(false);
  })

  const handleChangeDescriptor = useEventCallback((event: SelectChangeEvent<Descriptor<any>>) => {
    setDescriptor(descriptors.find(descriptor => descriptor.key === event.target.value));
  });

  const handleChangeType = useEventCallback((event, value: string) => {
    setType(value);
  });

  const handleChangeExcludeBots = useEventCallback((event, value: boolean) => {
    setExcludeBots(value)
  })

  const selectDescriptor = (
    <FormControl variant="standard">
      <Select<Descriptor<any>>
        id='select-descriptor'
        size='small'
        value={descriptor.key}
        onChange={handleChangeDescriptor}
        native={false}
        renderValue={descriptor => descriptor.title}
      >
        {descriptors.map(descriptor => (
          <MenuItem key={descriptor.key} value={descriptor.key}>{descriptor.title}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  const switchExcludeBots = (
    <FormControlLabel control={<Switch checked={excludeBots} onChange={handleChangeExcludeBots} />} label="Exclude Bots" />
  )

  const toggleType = (
    <ToggleButtonGroup
      size='small'
      color='primary'
      value={type}
      exclusive
      onChange={handleChangeType}
    >
      <ToggleButton value='count'>Count</ToggleButton>
      <ToggleButton value='percentage'>Percentage</ToggleButton>
    </ToggleButtonGroup>
  )

  return (
    <Section id="contributors" ref={ref}>
      <H2>Contributors</H2>
      <P2>Contribution status in multiple dimensions LAST MONTH</P2>

      <Stack direction='row' justifyContent='space-between' flexWrap='wrap' gap={2}>
        {selectDescriptor}
        <Spacer />
        {switchExcludeBots}
        {toggleType}
        <Button size='small' onClick={handleShowDebugModel} endIcon={<CodeIcon />}>SHOW SQL</Button>
      </Stack>

      {data ? <DebugDialog sql={data.sql} query={data.query} params={data.params} open={showDebugModel} onClose={handleCloseDebugModel} /> : undefined}

      <BarContainer ref={inViewRef}>
        {list.map((item, index, all) => descriptor.render(item, all[0], { percentage: type === 'percentage'}))}
      </BarContainer>
    </Section>
  );
});
