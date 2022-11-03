import React, { PropsWithChildren, useMemo } from 'react';
import { alpha, ButtonBase } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Link, { Props } from '@docusaurus/Link';
import { responsiveSx } from './responsive';

export interface TagProps extends Props {
  color: string;
}

export default function Tag ({ color, children, ...props }: PropsWithChildren<TagProps>) {
  const bg = useMemo(() => alpha(color, 0.1), [color]);
  const hoverBg = useMemo(() => alpha(color, 0.2), [color]);

  return (
    <ButtonBase
      component={Link}
      {...props}
      sx={[
        {
          transition: 'background-color .2s ease',
          color,
          backgroundColor: bg,
          ':hover': {
            backgroundColor: hoverBg,
            textDecoration: 'none',
            color,
          },
          display: 'inline-flex',
          borderRadius: 1,
          alignItems: 'center',
          marginTop: '0 !important',
        },
        responsiveSx({
          fontSize: 14,
          lineHeight: '14px',
          px: 1,
          py: 0.5,
        }, {
          fontSize: 18,
          lineHeight: '18px',
          px: 1.5,
          py: 1,
        }, {
          fontSize: 24,
          lineHeight: '24px',
          px: 2,
          py: 1.5,
        })]}>
      <ArrowRightIcon sx={{ ml: -1, mr: 0.5 }} />
      <span>
        {children}
      </span>
    </ButtonBase>
  );
}
