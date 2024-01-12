import React, { createContext, PropsWithChildren, ReactNode, Ref, useContext } from 'react';
import { H2, H3, P2 } from './typograph';
import { AdditionalTag } from './styled';
import { notFalsy } from '@site/src/utils/value';

import { Box, TypographyProps } from '@mui/material';

interface SectionProps {
  additional?: string;
  title?: ReactNode;
  titleComponent?: typeof H3;
  description?: ReactNode;
  descriptionProps?: TypographyProps<'div'>;
}

interface SectionContextValues {
  id: string | undefined;
  ref: Ref<HTMLDivElement | null> | undefined;
}

export const SectionContext = createContext<SectionContextValues>({
  id: undefined,
  ref: undefined,
});

export default function Section ({
  additional,
  title,
  description,
  descriptionProps = {},
  children,
}: PropsWithChildren<SectionProps>) {
  const { id, ref } = useContext(SectionContext);

  return (
    <Box
      id={id}
      component="section"
      sx={theme => ({
        '&:not(:first-of-type)': {
          borderTop: '1px dashed #4D4D4D',
        },
        [theme.breakpoints.up('sm')]: {
          py: 6,
          borderWidth: '2px !important',
        },
        [theme.breakpoints.up('md')]: {
          py: 8,
          borderWidth: '3px !important',
        },
        [theme.breakpoints.up('lg')]: {
          py: 10,
          borderWidth: '4px !important',
          '&:not(:first-of-type)': {
            pt: 10,
          },
        },
        py: 6,
      })}
      ref={ref}
    >
      {additional && <AdditionalTag>{additional}</AdditionalTag>}
      {notFalsy(title) && <H2>{title}</H2>}
      {notFalsy(description) && <P2 mt={3} {...descriptionProps}>{description}</P2>}
      {children}
    </Box>
  );
}

export function SubSection ({ additional, title, titleComponent: Title = H3, description, children }: PropsWithChildren<SectionProps>) {
  return (
    <Box
      component="div"
      sx={theme => ({
        '&:first-of-type': {
          pt: 2,
        },
        '&:not(:first-of-type)': {
          borderTop: '1px solid #4D4D4D40',
        },
        py: 4,
        [theme.breakpoints.up('sm')]: {
          py: 6,
          borderWidth: '2px !important',
        },
        [theme.breakpoints.up('md')]: {
          py: 10,
          borderWidth: '3px !important',
        },
        [theme.breakpoints.up('lg')]: {
          py: 12,
        },
      })}
    >
      {additional && <AdditionalTag>{additional}</AdditionalTag>}
      {notFalsy(title) && <Title>{title}</Title>}
      {notFalsy(description) && <P2 mt={3}>{description}</P2>}
      {children}
    </Box>
  );
}
