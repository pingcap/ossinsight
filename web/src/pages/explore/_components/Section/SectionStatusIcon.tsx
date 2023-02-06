import { SectionStatus } from './Section';
import React from 'react';
import RippleDot from '@site/src/components/RippleDot';
import { CheckCircle, Circle } from '@mui/icons-material';
import { SxProps } from '@mui/system';

export interface SectionStatusIconProps {
  status: SectionStatus;
}

export default function SectionStatusIcon ({ status }: SectionStatusIconProps) {
  switch (status) {
    case SectionStatus.loading:
      return <RippleDot sx={iconSx} size={12} />;
    case SectionStatus.success:
      return <CheckCircle sx={iconSx} color="success" fontSize="inherit" />;
    case SectionStatus.error:
      return <Circle sx={iconSx} color="disabled" fontSize="inherit" />;
    default:
      return <></>;
  }
}

const iconSx: SxProps = {
  mr: 1,
  verticalAlign: 'middle',
};
