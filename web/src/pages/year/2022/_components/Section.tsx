import Box from "@mui/material/Box";
import React, { createContext, ForwardedRef, forwardRef, PropsWithChildren, ReactNode, Ref, useContext } from "react";
import { H2, H3, P2 } from './typograph';
import { TypographyProps } from "@mui/material/Typography";

interface SectionProps {
  title?: ReactNode;
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

export default function Section({
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
      sx={{
        '&:not(:first-of-type)': {
          borderTop: '6px dashed #4D4D4D',
        },
        py: 8,
      }}
      ref={ref}
    >
      {title && <H2>{title}</H2>}
      {description && <P2 mt={3} {...descriptionProps}>{description}</P2>}
      {children}
    </Box>
  );
}

export function SubSection({ title, description, children }: PropsWithChildren<SectionProps>) {
  return (
    <Box
      component="div"
      sx={{
        '&:not(:first-of-type)': {
          borderTop: '3px solid #4D4D4D80',
        },
        py: 6,
      }}
    >
      {title && <H3>{title}</H3>}
      {description && <P2 mt={3}>{description}</P2>}
      {children}
    </Box>
  );
}
