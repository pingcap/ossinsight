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
  font-weight: bold;
  color: #BDDBFF;
  border-radius: 6px;
  border: 1px dashed #656565;
  padding: 6px;
  line-height: 1.25;
  pointer-events: auto;
  user-select: text !important;
  cursor: text;


  > i, b {
    background-color: #6B40B1;
  }
`;
