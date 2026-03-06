import React, { PropsWithChildren, useMemo } from 'react';
import { alpha, ButtonBase } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Link from '@/compat/docusaurus/Link';
import { responsiveSx } from './responsive';

export interface TagProps extends React.ComponentProps<typeof Link> {
  color?: string;
}

export default function Tag ({ color, children, ...props }: PropsWithChildren<TagProps>) {
  const resolvedColor = color ?? '#4b5563';
  const bg = useMemo(() => alpha(resolvedColor, 0.1), [resolvedColor]);
  const hoverBg = useMemo(() => alpha(resolvedColor, 0.2), [resolvedColor]);

  return (
    <ButtonBase
      component={Link}
      {...props}
      sx={[
        {
          transition: 'background-color .2s ease',
          color: resolvedColor,
          backgroundColor: bg,
          ':hover': {
            backgroundColor: hoverBg,
            textDecoration: 'none',
            color: resolvedColor,
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
