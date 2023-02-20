import { styled } from '@mui/material';
import React from 'react';
import Beta from './beta.svg';
import { useTotalEvents } from '@site/src/components/RemoteCharts/hook';
import useVisibility from '@site/src/hooks/visibility';
import { useInView } from 'react-intersection-observer';
import AnimatedNumber from 'react-awesome-animated-number';

const Highlight = styled('b', { shouldForwardProp: propName => propName !== 'color' })<{ color: string }>`
  color: ${({ color }) => color};
`;

const TidbCloudLogoImg = styled('img')`
  vertical-align: middle;
  position: relative;
  top: -2px;
`;

const title = 'GitHub Data Explorer';
const subtitleFull = (total: number) => <>Explore <Highlight color='#9197D0'><StyledAnimatedNumber value={total} hasComma size={18}/></Highlight> GitHub data with no SQL or plotting skills. Powered by <TidbCloudLogoImg height='16' alt='tidb cloud logo' src='/img/tidb-cloud-logo-t.svg' /></>;

export default function () {
  const visible = useVisibility();
  const { inView, ref } = useInView();
  const total = useTotalEvents(inView && visible);

  return (
    <HeaderContainer>
      <Title>
        <StyledExploreIconContainer>
          <span className="nav-explore-icon" />
        </StyledExploreIconContainer>
        <TitleContent >
          {title}
        </TitleContent>
        <StyledBeta />
      </Title>
      <SubTitle ref={ref}>
        {subtitleFull(total)}
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

const SubTitle = styled('div')`
  color: #7C7C7C;
  margin: 0;
`;

const StyledAnimatedNumber = styled(AnimatedNumber)`
  display: inline-flex;
`;
