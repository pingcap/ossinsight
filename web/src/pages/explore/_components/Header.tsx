import { styled } from '@mui/material';
import React from 'react';
import Beta from './beta.svg';

const title = 'Data Explorer';
const subtitleFull = 'Analyze 5+ billion GitHub data from natural language, no prerequisite knowledge of SQL or plotting libraries necessary.';

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
