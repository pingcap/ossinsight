import React from 'react';
import { aligns, Body } from '../../../_components/typography';
import { styled } from '@mui/material';

const Logo = styled('img')(({ theme }) => ({
  verticalAlign: 'text-bottom',
  marginLeft: theme.spacing(1),
}));

const FooterLine = () => {
  return (
    <Body sx={aligns.heading}>
      <a href="https://www.pingcap.com/tidb-serverless/?utm_source=ossinsight&utm_medium=referral" target="_blank" rel="noreferrer">
        <Logo src='/img/tidb-cloud-logo-o.png' height={20} alt='TiDB' />
      </a>
    </Body>
  );
};

export default FooterLine;
