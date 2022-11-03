import { styled, Grid } from '@mui/material';

export const HeaderGrid = styled(Grid)(({ theme }) => ({
  backgroundColor: 'rgba(69,69,69,.5)',
  borderRadius: theme.spacing(1),
  height: theme.spacing(6.5),
  padding: `0 ${theme.spacing(1.5)}!important`,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
}));

export const DataGrid = styled(Grid)(({ theme }) => ({
  backgroundColor: 'rgba(44,44,44,.5)',
  borderRadius: theme.spacing(1),
  height: theme.spacing(6.5),
  padding: `0 ${theme.spacing(1.5)}!important`,
  textAlign: 'right',
}));

export const HeadText = styled('span')(({ theme }) => ({
  fontSize: 16,
  fontColor: 'rgba(196,196,196)',
  textAlign: 'left',
  lineHeight: theme.spacing(6.5),
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
}));

export const BodyText = styled('span')(({ theme }) => ({
  fontSize: 16,
  fontColor: 'white',
  fontWeight: 'bold',
  lineHeight: theme.spacing(6.5),
}));
