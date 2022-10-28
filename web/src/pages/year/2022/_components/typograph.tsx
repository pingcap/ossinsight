import Typography, { TypographyProps } from "@mui/material/Typography";
import React from "react";

export function H1({
  children,
  ...props
}: Omit<TypographyProps<'h1'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="h1" fontFamily='JetBrains Mono' fontSize={64} {...props}>
      {children}
    </Typography>
  );
}

export function H2({
  children,
  ...props
}: Omit<TypographyProps<'h2'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="h2" fontFamily='JetBrains Mono' fontSize={48} {...props}>
      {children}
    </Typography>
  );
}

export function H3({
  children,
  ...props
}: Omit<TypographyProps<'h3'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="h3" fontFamily='JetBrains Mono' fontSize={32} {...props}>
      {children}
    </Typography>
  );
}


export function H4({
  children,
  ...props
}: Omit<TypographyProps<'h4'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="h4" fontFamily='JetBrains Mono' fontSize={28} {...props}>
      {children}
    </Typography>
  );
}

export function P1({
  children,
  ...props
}: Omit<TypographyProps<'p'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="body1" fontFamily='JetBrains Mono' fontSize={20} color="#E0E0E0" {...props}>
      {children}
    </Typography>
  );
}

export function P2({
  children,
  ...props
}: Omit<TypographyProps<'p'>, 'variant' | 'fontSize' | 'color' | 'fontWeight'>) {
  return (
    <Typography variant="body1" fontFamily='JetBrains Mono' fontSize={20} color="#7C7C7C" {...props}>
      {children}
    </Typography>
  );
}
