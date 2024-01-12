import React, { ReactNode } from 'react';
import { BoxProps } from '@mui/material/Box';
import { H4 } from './typograph';
import { Box, styled, TypographyProps } from '@mui/material';

export interface InsightsProps extends BoxProps {
  hideTitle?: boolean;
  children: ReactNode;
  title?: string;
  titleProps?: TypographyProps<'h4'>;
}

export default function Insights ({
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
          <Logo src="/img/favicon-1.png" alt="logo" />
        </H4>
      )}
      <Body mt={[2, 3, 4]}>
        {children}
      </Body>
    </Box>
  );
}

const Logo = styled('img')({
  verticalAlign: 'text-bottom',
  marginLeft: 8,
  width: '2em',
});

const Body = styled(Box)({
  position: 'relative',
  paddingLeft: 16,
  fontSize: '0.8em',
  color: '#7C7C7C',
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
