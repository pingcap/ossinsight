import React from 'react';
import Section from '../_components/Section';
import { LI, ResponsiveAlignedRight, UL } from '../_components/styled';
import { BarChart } from '../_components/charts';
import useIsLarge from '../_components/hooks/useIsLarge';
import { styled } from '@mui/material';

export default function () {
  return (
    <Section
      title={title}
      description={description}
      descriptionProps={{ maxWidth: 939 }}
    >
      <ResponsiveAlignedRight sx={{ position: 'relative', mt: 8 }}>
        <Users
          sx={theme => ({
            position: 'absolute',
            left: 0,
            top: 0,
            [theme.breakpoints.up('md')]: {
              maxWidth: 800,
            },
          })}
        >
          {users.map(user => <User key={user.login} {...user} />)}
        </Users>
        <StargazersChart />
      </ResponsiveAlignedRight>
    </Section>
  );
}

const title = 'Who gave the most stars in 2022';
const description = "We queried the developers who gave the most stars in 2022, took the top 20, and filtered out accounts of suspected bots. If a developer's number of star events divided by the number of starred repositories is equal to or greater than 2, we suspect this user to be a bot.";
const footnote = '* Time range: 2022.01.01-2022.09.30, excluding bot events';

const users: UserProps[] = [
  {
    index: 1,
    login: 'Butters3388214',
    stars: 136,
  },
  {
    index: 2,
    login: 'frankfanslc',
    stars: 133,
  },
  {
    index: 3,
    login: 'mitoksim',
    stars: 76,
  },
];

interface UserProps {
  index: number;
  login: string;
  stars: number;
}

const Users = styled(UL)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginLeft: theme.spacing(-4),
  marginRight: theme.spacing(-4),
}));

function User ({ index, login, stars }: UserProps) {
  return (
    <LI
      sx={theme => ({
        ml: 4,
        mt: 4,
        width: '100%',
        [theme.breakpoints.up('md')]: {
          width: `calc(50% - ${theme.spacing(4)})`,
        },
      })}
    >
      <Rank>{index}</Rank>
      <Login>{login}</Login>
      <Details>{stars} stars</Details>
      <Extra>per day</Extra>
    </LI>
  );
}

const Rank = styled('div', { label: 'Rank' })(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'block',
  },
  fontSize: '1em',
  display: 'inline-block',
  fontStyle: 'italic',
  fontWeight: 100,
  color: '#BFBFBF',
}));

const Login = styled('div', { label: 'Login' })(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'block',
    marginLeft: 0,
  },
  fontSize: '1.2em',
  display: 'inline-block',
  fontWeight: 'bold',
  color: 'white',
  marginTop: 12,
  marginLeft: 8,
}));

const Details = styled('div', { label: 'Details' })(({ theme }) => ({
  color: 'white',
  fontSize: '1em',
  marginTop: 12,
}));

const Extra = styled('div', { label: 'Extra' })(({ theme }) => (({
  color: '#BFBFBF',
  fontSize: '0.8em',
})));

const StargazersChart = () => {
  const large = useIsLarge();

  return (
    <BarChart
      data={require('../_charts/stargazers.json')}
      footnote={footnote}
      aspect={large ? 16 / 9 : 3 / 4}
      sx={{
        width: '100%',
      }}
    />
  );
};
