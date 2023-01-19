import { styled } from '@mui/material';
import React from 'react';
import Beta from './beta.svg';

const Highlight = styled('b', { shouldForwardProp: propName => propName !== 'color' })<{ color: string }>`
  color: ${({ color }) => color};
`;

const title = 'Data Explorer';
const subtitleFull = <>Explore <Highlight color='#9197D0'>5 billion</Highlight> GitHub data with no SQL or plotting skills. Reveal fascinating discoveries <Highlight color='#7D71C7'>RIGHT NOW</Highlight>!</>;

export default function () {
  return (
    <HeaderContainer>
      <Title>
        <StyledExploreIconContainer>
          <span className="nav-explore-icon" />
        </StyledExploreIconContainer>
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

const StyledExploreIconContainer = styled('span')`
  display: inline-flex;
  width: 36px;
  height: 36px;
  vertical-align: middle;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  > span {
    scale: 2;
  }
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
