import Link from '@docusaurus/Link';
import { Button, styled } from '@mui/material';
import React from 'react';
import { aligns, Body } from '../../../_components/typography';

const FooterLine = () => {
  return (
    <Body sx={aligns.heading}>
      <TidbLogo href="https://www.pingcap.com/tidb-cloud-serverless/?utm_source=ossinsight&utm_medium=referral" target="_blank" rel="noreferrer">
        <img src="/img/tidb-logo.svg" height={40} alt="TiDB" />
        TiDB
      </TidbLogo>
      <Button sx={{ color: 'black !important', verticalAlign: 'text-bottom', textTransform: 'none' }} variant="contained" component={Link} to="/open-source-heroes/?utm_source=ossinsight&utm_medium=referral&utm_campaign=plg_OSScontribution_credit_05">
        Claim credits for open-source heroes! -&gt;
      </Button>
    </Body>
  );
};

const TidbLogo = styled('a')`
  height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  vertical-align: text-bottom;
  
  font-weight: 900;
  font-size: 20px;

  color: white !important;
  text-decoration: none !important;

  margin-right: 16px;
`;

export default FooterLine;
