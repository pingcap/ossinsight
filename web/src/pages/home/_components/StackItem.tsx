import { Box, styled } from '@mui/material';

export const stackDirection = { xs: 'column', md: 'row' } as const;

export const Item = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  flex: 1,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: theme.spacing(1),
  },
}));

export const AlignRightItem = styled(Item)(({ theme }) => ({
  textAlign: 'right',
  [theme.breakpoints.down('md')]: {
    textAlign: 'left',
  },
}));
