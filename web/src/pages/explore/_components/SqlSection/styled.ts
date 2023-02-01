import { Box, styled } from '@mui/material';

export const Line = styled(Box)`
  line-height: 40px;
`;

export const StyledTitle = styled('div')`
`;

export const NotClear = styled('span')`
  color: #ECBAAA;
`;

export const Tag = styled('span')`
  display: inline;
  background: #383744;
  font-weight: bold;
  color: #CBE0FF;
  border-radius: 6px;
  padding: 6px;
  line-height: 1.25;
  pointer-events: auto;
  user-select: text !important;
  cursor: text;

  > i {
    color: #E7D9A8;
  }
`;
