import { generateUtilityClasses, styled, Typography } from '@mui/material';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';
import { SaveAlt } from '@mui/icons-material';
import React from 'react';
import clsx from 'clsx';

export interface AdsProps {
  size?: 'small';
}

const Ads = ({ size }: AdsProps) => {
  return (
    <>
      <AdsContainer>
        <AdsDashedContainer>
          <AdsContent className={clsx({ [classes.small]: size === 'small' })}>
            <Typography variant="body2" fontSize={12} color="#A0A0A0">
              GitHub data is not your focus?
            </Typography>
            <TiDBCloudLink as={AdsButton} className={clsx({ [classes.small]: size === 'small' })}>
              <AdsButtonIconContainer className={clsx({ [classes.small]: size === 'small' })}>
                <SaveAlt fontSize='inherit' />
              </AdsButtonIconContainer>
              Import any dataset
            </TiDBCloudLink>
            <AdsImage className={clsx({ [classes.small]: size === 'small' })} width="228" src={require('./img/ads-prompts.png').default} alt="image" />
          </AdsContent>
        </AdsDashedContainer>
      </AdsContainer>
      <AdsFootnote>
          <span>
            🤖️ Chat2Query on
          </span>
        <img src="/img/tidb-cloud-logo-o.png" height="18" alt="TiDB Cloud Logo" />
      </AdsFootnote>
    </>
  );
};

export default Ads;

const classes = generateUtilityClasses('Ads', ['small']);

const AdsContainer = styled('div')`
  background: linear-gradient(90deg, #FFBCA7 2.21%, #DAA3D8 30.93%, #B587FF 67.95%, #6B7AFF 103.3%);
  border-radius: 6px;
  margin-top: 16px;
`;

const AdsDashedContainer = styled('div')`
  border-radius: 6px;
  border: dashed 1px var(--ifm-background-color);
  box-sizing: border-box;
`;

const AdsContent = styled('div')`
  background: var(--ifm-background-color);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;

  &.${classes.small} {
    padding: 12px;
  }
`;

const AdsButton = styled('a')`
  background: linear-gradient(90deg, #5667FF 0%, #A168FF 106.06%);
  box-shadow: ${({ theme }) => theme.shadows[4]};
  border-radius: 29px;
  display: flex;
  align-items: center;
  padding: 8px !important;
  font-weight: 600;
  font-size: 16px;
  color: white !important;
  text-decoration: none !important;
  opacity: 1;
  cursor: pointer;
  user-select: none;
  margin-top: 8px;
  transition: ${({ theme }) => theme.transitions.create(['box-shadow', 'transform'])};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows[10]};
    transform: scale3d(1.02, 1.02, 1.02);
  }

  &.${classes.small} {
    font-size: 14px;
  }
`;

const AdsButtonIconContainer = styled('span')`
  display: inline-flex;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background: white;
  color: #5667FF;
  margin-right: 16px;
  min-width: 32px;
  font-size: 20px;

  &.${classes.small} {
    width: 24px;
    height: 24px;
    min-width: 24px;
    font-size: 16px;
    margin-right: 8px;
  }
`;

const AdsFootnote = styled('div')`
  font-size: 14px;
  color: white;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  flex-wrap: wrap;

  > :first-child {
    margin-right: 8px;
  }
`;

const AdsImage = styled('img')`
  max-width: 100%;
  &.${classes.small} {
    max-width: 90%;
  }
`;
