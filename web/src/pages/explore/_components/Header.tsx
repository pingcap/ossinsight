import { styled } from '@mui/material';
import React from 'react';
import Beta from './beta.svg';

const Highlight = styled('b', { shouldForwardProp: propName => propName !== 'color' })<{ color: string }>`
  color: ${({ color }) => color};
`;

const title = 'Data Explorer';
const subtitleFull = <>Explore <Highlight color='#9197D0'>5 billion</Highlight> GitHub data with no SQL or plotting skills. Unleash your <Highlight color='#5C6AE0'>imagination</Highlight> and discover new <Highlight color='#7D71C7'>insights</Highlight> NOW!</>;

export default function () {
  return (
    <HeaderContainer>
      <Title>
        <TitleContent>
          {title}
        </TitleContent>
        <StyledBeta />
      </Title>
      <SubTitle>
        {subtitleFull}
      </SubTitle>
    </HeaderContainer>
  );
}

const StyledBeta = styled(Beta)`
  margin-left: 8px;
`;

const HeaderContainer = styled('div', { shouldForwardProp: propName => propName !== 'display' })`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
`;

const Title = styled('h1')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
`;

const TitleContent = styled('span')`
`;

const SubTitle = styled('p')`
  color: #7C7C7C;
  margin: 0;
`;
