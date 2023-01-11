import { styled } from '@mui/material';
import React, { CSSProperties } from 'react';
import { Nullish } from '@site/src/utils/value';
import { SxProps } from '@mui/system';

export interface PoweredByProps {
  align?: CSSProperties['textAlign'];
  sx?: SxProps;
}

export default function PoweredBy ({ align = 'left', sx }: PoweredByProps) {
  return (
    <PoweredByContainer align={align} sx={sx}>
      Powered by <a href='https://www.pingcap.com/tidb-cloud/?utm_source=ossinsight&utm_medium=referral&utm_campaign=dataexplore' target='_blank' rel="noopener noreferrer">TiDB Cloud</a>
    </PoweredByContainer>
  );
}

const PoweredByContainer = styled('div', { shouldForwardProp: name => name !== 'align' })<{ align: Exclude<CSSProperties['textAlign'], Nullish> }>`
  text-align: ${({ align }) => align};
  font-size: 16px;
  color: #C1C1C1;

  > a {
    color: #C1C1C1 !important;
    text-decoration: underline;
  }
`;
