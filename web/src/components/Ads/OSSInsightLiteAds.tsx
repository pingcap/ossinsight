import Link from '@docusaurus/Link';
import { Box, styled } from '@mui/material';
import React from 'react';
import AspectRatio from 'react-aspect-ratio';

const img = require('./OSSInsightLiteAds.png').default;

const Container = styled(Link)`
  display: block;
  border-radius: 6px;
  background-image: url(${JSON.stringify(img)});
  background-size: contain;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.create(['box-shadow', 'transform'])};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows[4]};
    transform: translateY(-1px) scale(1.02);
  }
`;

export default function OSSInsightLiteAds () {
  return (
    <Box m={1} mt={4}>
      <AspectRatio ratio={31 / 30} >
        <Container target='_blank' href='https://github.com/pingcap/ossinsight-lite#how-to-deploy-your-own-10mins' />
      </AspectRatio>
    </Box>
  );
}
