import {styled} from '@mui/material/styles';
import Grid from '@mui/material/Grid';

export const HeaderGrid = styled(Grid)(({theme}) => ({
  backgroundColor: '#2c2c2c',
  borderRadius: theme.spacing(1),
  height: theme.spacing(5),
  padding: `0 ${theme.spacing(1.5)}!important`,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
}));

export const DataGrid = styled(Grid)(({theme}) => ({
  backgroundColor: '#1c1c1c',
  borderRadius: theme.spacing(1),
  height: theme.spacing(5),
  padding: `0 ${theme.spacing(1.5)}!important`,
  textAlign: 'right',
}));

export const HeadText = styled('span')(({theme}) => ({
  fontSize: 16,
  fontColor: 'rgba(196,196,196)',
  textAlign: 'left',
  lineHeight: theme.spacing(5),
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
}));

export const BodyText = styled('span')(({theme}) => ({
  fontSize: 14,
  fontColor: 'white',
  fontWeight: 'bold',
  lineHeight: theme.spacing(5),
}));