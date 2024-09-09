import { styled } from '@mui/material';

export const Section = styled('section')<{ dark?: boolean }>`
  background-color: ${({ dark }) => dark ? '#141414' : '#212122'};
  padding: 120px 12px;
`;
export const SectionContent = styled('div')`
  max-width: 1400px;
  margin: 0 auto;
`;

export const SectionTitle = styled('h2')`
  font-weight: 700;
  font-size: 48px;
  line-height: 58.09px;
  text-align: center;
`;

export const SectionDescription = styled('p')`
  font-weight: 700;
  font-size: 24px;
  line-height: 38px;
  color: #B1B1B1;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;

  strong {
    color: #73D9B4;
  }
`;
