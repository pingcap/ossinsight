import {styled} from '@mui/material/styles';
import Grid from '@mui/material/Grid';

export const HeaderGrid = styled(Grid)(({theme}) => ({
  backgroundColor: '#2c2c2c',
  borderRadius: theme.spacing(1),
  height: theme.spacing(6),
  padding: `0 ${theme.spacing(4)}!important`,
}));

export const DataGrid = styled(Grid)(({theme}) => ({
  backgroundColor: '#1c1c1c',
  borderRadius: theme.spacing(1),
  height: theme.spacing(6),
  padding: `0 ${theme.spacing(4)}!important`,
}));

export const HeadText = styled('span')(({theme}) => ({
  fontSize: 20,
  fontColor: 'rgba(196,196,196)',
  textAlign: 'left',
  lineHeight: theme.spacing(6),
}));

export const BodyText = styled('span')(({theme}) => ({
  fontSize: 20,
  fontColor: 'white',
  fontWeight: 'bold',
  textAlign: 'left',
  lineHeight: theme.spacing(6),
}));