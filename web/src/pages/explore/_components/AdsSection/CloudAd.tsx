import { styled } from '@mui/material';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';
import UploadIcon from '../img/upload.svg';
import React from 'react';
import GradientDashedBox, { gradientDashedBoxClasses, GradientDashedBoxProps } from '@site/src/components/GradientDashedBox';
import { SxProps } from '@mui/system';

export interface AdsProps {
  size?: 'small';
  sx?: SxProps;
}

const COLOR_STOPS: Array<[string, number]> = [
  ['#FFBCA7', 2.21],
  ['#DAA3D8', 30.93],
  ['#B587FF', 67.95],
  ['#6B7AFF', 103.3],
];

const Ads = ({ size, sx }: AdsProps) => {
  return (
    <>
      <TiDBCloudLink<GradientDashedBoxProps>
        as={AdsContainer}
        sx={sx}
        stops={COLOR_STOPS}
        deg={90}
        content='result_bottom'
      >
        <Title>
          Try other dataset
        </Title>
        <AdsButton>
          <AdsButtonIconContainer>
            <UploadIcon />
          </AdsButtonIconContainer>
          Import NOW!
        </AdsButton>
        <AdsImage width="304" src={require('../img/ads-2.png').default} alt="image" />
        <Spacer />
        <Line>
          Chat2Query on
          <Logo src="/img/tidb-cloud-logo-o.png" alt="TiDB Cloud Logo" />
        </Line>
      </TiDBCloudLink>
    </>
  );
};

export default Ads;

const Title = styled('div')`
  font-style: normal;
  font-weight: 600;
  font-size: 32px;
  line-height: 150.02%;
  color: #FFFFFF;
`;

const AdsContainer = styled(GradientDashedBox)`
  opacity: 1;
  cursor: pointer;
  user-select: none;
  transition: ${({ theme }) => theme.transitions.create(['box-shadow', 'transform'])};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows[10]};
    transform: scale3d(1.02, 1.02, 1.02);
  }

  .${gradientDashedBoxClasses.container} {
    height: 100%;
  }

  .${gradientDashedBoxClasses.content} {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 12px;
  }
`;

const AdsButton = styled('span')`
  background: linear-gradient(90deg, #5667FF 0%, #A168FF 106.06%);
  box-shadow: ${({ theme }) => theme.shadows[4]};
  border-radius: 48px;
  display: flex;
  align-items: center;
  color: white !important;
  text-decoration: none !important;
  margin-top: 8px;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 150.02%;
  padding: 12px 48px 12px 12px;
`;

const AdsButtonIconContainer = styled('span')`
  display: inline-flex;
  width: 42px;
  height: 42px;
  border-radius: 21px;
  align-items: center;
  justify-content: center;
  background: white;
  color: #5667FF;
  min-width: 32px;
  font-size: 26px;
  margin-right: 32px;
`;

const AdsImage = styled('img')`
  max-width: 100%;
`;

const Spacer = styled('span')`
  display: block;
  flex: 1;
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
