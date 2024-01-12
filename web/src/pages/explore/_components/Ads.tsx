import { generateUtilityClasses, styled, Typography } from '@mui/material';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';
import UploadIcon from './img/upload.svg';
import React from 'react';
import clsx from 'clsx';
import GradientDashedBox, { gradientDashedBoxClasses, GradientDashedBoxProps } from '@site/src/components/GradientDashedBox';
import { SxProps } from '@mui/system';

export interface AdsProps {
  size?: 'small';
  sx?: SxProps;
  utmContent?: string;
}

const COLOR_STOPS: Array<[string, number]> = [
  ['#FFBCA7', 2.21],
  ['#DAA3D8', 30.93],
  ['#B587FF', 67.95],
  ['#6B7AFF', 103.3],
];

const Ads = ({ size, sx, utmContent }: AdsProps) => {
  return (
    <>
      <TiDBCloudLink<GradientDashedBoxProps>
        as={AdsContainer}
        sx={sx}
        stops={COLOR_STOPS}
        deg={90}
        content={utmContent}
        components={{
          content: clsx({ [classes.small]: size === 'small' }),
        }}
      >
        <Typography variant="body2" fontSize={12} color="#A0A0A0">
          GitHub data is not your focus?
        </Typography>
        <AdsButton className={clsx({ [classes.small]: size === 'small' })}>
          <AdsButtonIconContainer className={clsx({ [classes.small]: size === 'small' })}>
            <UploadIcon />
          </AdsButtonIconContainer>
          Import any dataset
        </AdsButton>
        <AdsImage className={clsx({ [classes.small]: size === 'small' })} width="228" src={require('./img/ads-prompts.png').default} alt="image" />
      </TiDBCloudLink>
    </>
  );
};

export default Ads;

const classes = generateUtilityClasses('Ads', ['small']);

const AdsContainer = styled(GradientDashedBox)`
  opacity: 1;
  cursor: pointer;
  user-select: none;
  transition: ${({ theme }) => theme.transitions.create(['box-shadow', 'transform'])};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows[10]};
    transform: scale3d(1.02, 1.02, 1.02);
  }

  .${gradientDashedBoxClasses.content} {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 12px;

    &.${classes.small} {
      padding: 12px;
    }
  }
`;

const AdsButton = styled('span')`
  background: linear-gradient(90deg, #5667FF 0%, #A168FF 106.06%);
  box-shadow: ${({ theme }) => theme.shadows[4]};
  border-radius: 48px;
  display: flex;
  align-items: center;
  padding: 12px !important;
  font-weight: 600;
  font-size: 16px;
  color: white !important;
  text-decoration: none !important;
  margin-top: 8px;

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

const AdsImage = styled('img')`
  max-width: 100%;

  &.${classes.small} {
    max-width: 90%;
  }
`;
