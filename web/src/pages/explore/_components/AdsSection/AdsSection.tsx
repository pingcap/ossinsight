import { Divider, styled } from '@mui/material';
import React, { forwardRef, HTMLAttributes } from 'react';
import { SxProps } from '@mui/system';
import Ads from './CloudAd';
import OurData from './OurData';

interface AdsSectionProps extends HTMLAttributes<HTMLElement> {
  sx?: SxProps;
}

const AdsSection = forwardRef<HTMLElement, AdsSectionProps>((props, ref) => {
  return (
    <AdsSectionContainer ref={ref} {...props}>
      <Divider sx={{ my: 2 }}>
        Get to know our data inside and out
      </Divider>
      <AdsSectionContent>
        <OurData />
        <Ads />
      </AdsSectionContent>
    </AdsSectionContainer>
  );
});

export default AdsSection;

const AdsSectionContainer = styled('section')`
  margin-top: 16px;
  transform-origin: top center;
`;

const AdsSectionContent = styled('div')`
  display: flex;
  align-items: stretch;
  gap: 16px;

  ${({ theme }) => theme.breakpoints.down('md')} {
    flex-direction: column;
  }

  > * {
    flex: 1;
  }
`;
