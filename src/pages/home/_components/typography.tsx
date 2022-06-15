import React from "react";
import Typography, {TypographyProps} from "@mui/material/Typography";
import {combineSx} from "../../../utils/mui";
import {responsive} from "./responsive";

export const fontSizes = {
  h1: responsive('fontSize', 36, 48, 64),
  h2: responsive('fontSize', 24, 36, 48),
  h2plus: responsive('fontSize', 28, 48, 64),
  subtitle: responsive('fontSize', 14, 18, 24),
  body: responsive('fontSize', 12, 16, 20)
}

export const H1 = (props: TypographyProps<'h2'>) => (
  <Typography
    {...props}
    variant='h1'
    sx={fontSizes.h1}
  />
)

export const H2 = (props: TypographyProps<'h2'>) => (
  <Typography
    {...props}
    variant='h2'
    sx={fontSizes.h2}
  />
)

export const Span = (props: TypographyProps<'span'>) => (
  <Typography {...props} component='span' display='inline' variant='inherit' />
)

export const H2Plus = (props: TypographyProps<'span'>) => (
  <Typography {...props} component='span' display='inline' variant='inherit'
              sx={combineSx(props.sx, fontSizes.h2plus)} />
)

export const Headline = (props: TypographyProps<'p'>) => (
  <Typography
    {...props}
    component='div'
    variant='subtitle2'
    sx={[
      {color: '#C4C4C4'},
      fontSizes.subtitle
    ]}
  />
)

export const Subtitle = (props: TypographyProps<'p'>) => (
  <Typography
    {...props}
    component='p'
    variant='subtitle1'
    sx={[
      responsive('mt', 1, 2, 7),
      fontSizes.subtitle
    ]}
  />
)

export const Body = (props: TypographyProps) => (
  <Typography
    {...props}
    variant='body2'
    sx={[
      {color: '#C4C4C4'},
      responsive('mt', 2, 4, 6),
      fontSizes.body
    ]}
  />
)
