import React, { ReactNode } from "react";
import Box, { BoxProps } from "@mui/material/Box";
import { H4 } from "./typograph";
import { styled } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";

export interface InsightsProps extends BoxProps {
  hideTitle?: boolean;
  children: ReactNode;
  title?: string;
  titleProps?: TypographyProps<'h4'>;
}

export default function Insights({
  hideTitle = false,
  children,
  title = 'Insights',
  titleProps,
  ...props
}: InsightsProps) {
  return (
    <Box {...props}>
      {!hideTitle && (
        <H4 {...titleProps}>
          {title}
          <Logo width={40} src="/img/favicon-1.png" alt="logo" />
        </H4>
      )}
      <Body as="div">
        {children}
      </Body>
    </Box>
  );
}

const Logo = styled('img')({
  verticalAlign: 'text-bottom',
  marginLeft: 8,
});

const Body = styled(Typography)({
  position: 'relative',
  paddingLeft: 22,
  fontSize: '0.9em',
  color: '#7C7C7C',
  marginTop: 32,
  '&:before': {
    display: 'block',
    content: '" "',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: 6,
    background: 'transparent linear-gradient(180deg, #EA7E53 0%, #3E2A75 100%) 0% 0% no-repeat padding-box',
  },
  '& strong': {
    color: '#FFFFFF',
    fontWeight: 'border',
  },
});
