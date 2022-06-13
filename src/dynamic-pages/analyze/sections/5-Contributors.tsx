import { ListItem, ListItemAvatar } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import { styled } from '@mui/material/styles';
import React, { ForwardedRef, forwardRef, useMemo } from 'react';
import Section from '../Section';
import { H2 } from '../typography';

export const Contributors = forwardRef(function ({}, ref: ForwardedRef<HTMLElement>) {
  const list = useData()

  return (
    <Section id='contributors' ref={ref}>
      <H2>Contributors</H2>

      <List>
        {list.map(item => (
          <ListItem key={item.login}>
            <ListItemAvatar>
              <a href={item.user_url} target='_blank' rel='noopener'>
                <Avatar src={item.avatar_url} />
              </a>
            </ListItemAvatar>
            <Bar sx={{ width: `calc(${item.width} - 64px)` }} />
            <Number>{item.cnt}</Number>
          </ListItem>
        ))}
      </List>
    </Section>
  )
})

function useData () {
  return useMemo(() => {
    const max = data[0].cnt
    return data.map(({ login, cnt }) => ({
      login,
      user_url: `https://github.com/${login}`,
      avatar_url: `https://github.com/${login}.png`,
      cnt,
      width: `${cnt / max * 100}%`
    }))
  }, [data])
}

const data = [{
  login: '634750802',
  cnt: 1200,
}, {
  login: 'sykp241095',
  cnt: 980,
}, {
  login: 'hooopo',
  cnt: 768,
}]

const Bar = styled('span')({
  display: 'block',
  height: 28,
  background: 'linear-gradient(136deg, rgba(255,177,98,1) 0%, rgba(247,124,0,1) 100%)',
})

const Number = styled('span')({
  display: 'block',
  height: 28,
  lineHeight: '28px',
  fontSize: 14,
  width: 64,
  color: 'white',
  boxSizing: 'border-box',
  padding: '0 8px',
})
