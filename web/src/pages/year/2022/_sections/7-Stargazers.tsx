import React from "react";
import Section from "../_components/Section";
import { styled } from "@mui/material/styles";
import { LI, ResponsiveAlignedRight, UL } from "../_components/styled";
import { BarChart } from "@site/src/pages/year/2022/_components/charts";
import useIsLarge from "@site/src/pages/year/2022/_components/hooks/useIsLarge";


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
            [theme.breakpoints.up('md')]: {
              position: 'absolute',
              left: 0,
              top: 0,
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

const title = 'Who Gave the Most Stars in 2022';
const description = 'We queried the developers who gave the most stars in 2022, took the Top 10, filtered the accounts of suspected robots.';

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

const Users = styled(UL)({
  fontFamily: "JetBrains Mono",
  display: 'flex',
  flexWrap: 'wrap',
});

function User({ index, login, stars }: UserProps) {
  return (
    <LI sx={{ mr: 12, mb: 12 }}>
      <Rank>{index}</Rank>
      <Login>{login}</Login>
      <Details>{stars} stars</Details>
      <Extra>per day</Extra>
    </LI>
  );
}

const Rank = styled('div')({
  fontSize: 40,
  fontStyle: 'italic',
  fontWeight: 100,
  color: '#BFBFBF',
});

const Login = styled('div')({
  fontSize: 33,
  fontWeight: 'bold',
  color: 'white',
  marginTop: 16,
});

const Details = styled('div')({
  color: 'white',
  fontSize: 30,
  marginTop: 16,
});

const Extra = styled('div')({
  color: '#BFBFBF',
  fontSize: 20,
});

const StargazersChart = () => {
  const large = useIsLarge();

  return (
    <BarChart
      data={require('../_charts/stargazers.json')}
      aspect={large ? 16 / 9 : 3 / 4}
      sx={{
        width: '100%',
      }}
    />
  );
};