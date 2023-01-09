import { ButtonBase, styled } from '@mui/material';
import React from 'react';
import Link from '@docusaurus/Link';
import { PropsOf } from '@emotion/react';

export const HighlightBackground = styled('div', { name: 'Highlight-Background' })`
  position: relative;
  background: linear-gradient(116.45deg, #595FEC 0%, rgba(200, 182, 252, 0.2) 96.73%);
  padding: 1px;
  border-radius: 7px;
  width: 100%;
`;

export const HighlightContent = styled(ButtonBase, { name: 'Highlight-Content' })`
  display: block;
  font-size: 14px;
  line-height: 1.25;
  background-color: rgba(44, 44, 44, 0.8);
  border-radius: 6px;
  transition: ${({ theme }) => theme.transitions.create('background-color')};
  padding: 18px;
  text-align: left;
  width: 100%;
  height: 100%;
  vertical-align: top;

  &:hover {
    background-color: rgba(44, 44, 44, 0.5);
  }
`;

const HighlightButtonBackground = styled(HighlightBackground, { name: 'HighlightButton-Background' })`
  display: inline-block;
  border-radius: 17px;
  max-width: max-content;
  color: white !important;
  text-decoration: none !important;
`;

const HighlightButtonContent = styled(HighlightContent, { name: 'HighlightButton-Content' })`
  display: flex;
  border-radius: 16px;
  align-items: center;
  padding: 8px;
  max-width: max-content;
`;

const ButtonVariant = HighlightButtonBackground.withComponent(ButtonBase);
const LinkVariant = HighlightButtonBackground.withComponent(Link);

const HighlightButtonVariants = {
  button: ButtonVariant,
  link: LinkVariant,
} as const;

interface HighlightedButtonConfig<V extends keyof typeof HighlightButtonVariants> {
  props: PropsOf<typeof HighlightButtonVariants[V]>;
}

export function HighlightButton<V extends keyof typeof HighlightButtonVariants = 'button'> ({ variant, children, ...props }: { variant: V } & HighlightedButtonConfig<V>['props']) {
  return (
    <HighlightButtonBackground as={HighlightButtonVariants[variant]} {...props}>
      <HighlightButtonContent as='div'>
        {children}
      </HighlightButtonContent>
    </HighlightButtonBackground>
  );
}
