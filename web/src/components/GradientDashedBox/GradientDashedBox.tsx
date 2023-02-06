import React, { ForwardedRef, forwardRef, HTMLAttributes } from 'react';
import { Container, Content, Root } from '@site/src/components/GradientDashedBox/styled';
import { generateUtilityClasses } from '@mui/material';
import clsx from 'clsx';
import { SxProps } from '@mui/system';

export interface GradientDashedBoxProps extends HTMLAttributes<HTMLAnchorElement> {
  stops: Array<[color: string, percent: number]>;
  deg?: number;
  backgroundColor?: string;
  borderRadius?: number;
  components?: Partial<typeof gradientDashedBoxClasses>;

  sx?: SxProps;
}

export const gradientDashedBoxClasses = generateUtilityClasses('GradientDashedBox', ['root', 'container', 'content']);

const GradientDashedBox = forwardRef(({
  stops = [],
  backgroundColor = 'var(--ifm-background-color)',
  borderRadius = 6,
  deg = 90,
  components,
  className,
  children,
  ...props
}: GradientDashedBoxProps, ref: ForwardedRef<HTMLAnchorElement>) => {
  const rootClasses = clsx(className, gradientDashedBoxClasses.root, components?.root);
  const containerClasses = clsx(gradientDashedBoxClasses.container, components?.container);
  const contentClasses = clsx(gradientDashedBoxClasses.content, components?.content);

  return (
    <Root className={rootClasses} ref={ref as never} stops={stops} deg={deg} borderRadius={borderRadius} {...(props as any)}>
      <Container className={containerClasses} borderRadius={borderRadius} backgroundColor={backgroundColor}>
        <Content className={contentClasses} borderRadius={borderRadius} backgroundColor={backgroundColor}>
          {children}
        </Content>
      </Container>
    </Root>
  );
});

export default GradientDashedBox;
