import React, {PropsWithChildren, useMemo} from "react";
import {alpha} from "@mui/material";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Link, {LinkProps} from '@docusaurus/Link';
import ButtonBase from "@mui/material/ButtonBase";

export interface TagProps extends LinkProps {
  color: string
}

export default function Tag({color, children, ...props}: PropsWithChildren<TagProps>) {
  const bg = useMemo(() => alpha(color, .1), [color])
  const hoverBg = useMemo(() => alpha(color, .2), [color])

  return (
    <Link {...props}>
      <ButtonBase component='span' sx={{
        transition: 'background-color .2s ease',
        color,
        backgroundColor: bg,
        ':hover': {backgroundColor: hoverBg},
        display: 'inline-block',
        borderRadius: 1,
        px: 2,
        py: 1.5,
        fontSize: 24,
        lineHeight: 1
      }}>
        <ArrowRightIcon sx={{ml: -1, mr: 0.5, verticalAlign: 'text-bottom'}} />
        {children}
      </ButtonBase>
    </Link>
  )
}