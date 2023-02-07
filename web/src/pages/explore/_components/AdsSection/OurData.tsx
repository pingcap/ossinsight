import GradientDashedBox, { gradientDashedBoxClasses } from '@site/src/components/GradientDashedBox';
import React from 'react';
import { styled } from '@mui/material';
import icon from '../img/ads-1.svg';

export default function OurData () {
  return (
    <Container
      stops={[
        ['rgba(255, 188, 167, 0.5)', 2.21],
        ['rgba(218, 163, 216, 0.5)', 30.93],
        ['rgba(181, 135, 255, 0.5)', 67.95],
        ['rgba(107, 122, 255, 0.5)', 103.3],
      ]}
    >
      <Title>
        Our data source
      </Title>
      <Icon />
      <Line>
        <Logo src='/img/explore-logo-layer-0.png' alt='OSSInsight Explore Logo' />
        GitHub Data Explorer for
        <Logo src='/img/logo-small.png' alt='OSSInsight Logo' />
        Open Source Software Insight
      </Line>
    </Container>
  );
}

const Container = styled(GradientDashedBox)`
  .${gradientDashedBoxClasses.content} {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 12px;
  }
`;

const Title = styled('div')`
  font-weight: 600;
  font-size: 32px;
  line-height: 150.02%;

  background: linear-gradient(90deg, #FFBCA7 2.21%, #DAA3D8 30.93%, #B587FF 67.95%, #6B7AFF 103.3%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

const Icon = styled(icon)`
  max-width: 90%;
  margin-top: 12px;
`;

const Logo = styled('img')`
  height: 24px;
  margin: 0 8px;
  vertical-align: text-bottom;
`;

const Line = styled('div')`
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 180%;
  /* or 29px */
  color: #FFFFFF;
  margin-top: 12px;
  vertical-align: middle;
`;
