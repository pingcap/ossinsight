import React, { forwardRef, RefCallback } from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { useAnalyzeChartContext } from './charts/context';

interface AnalyzeTitle {
  analyzeTitle?: boolean;
}

interface AnalyzeDescription {
  analyzeDescription?: boolean;
}

function useAnalyzeTitleRef (analyzeTitle: boolean | undefined): RefCallback<HTMLHeadingElement> | undefined {
  const { headingRef } = useAnalyzeChartContext();
  return analyzeTitle ? headingRef : undefined;
}

function useAnalyzeDescriptionRef (analyzeDescription: boolean | undefined): RefCallback<HTMLParagraphElement> | undefined {
  const { descriptionRef } = useAnalyzeChartContext();
  return analyzeDescription ? descriptionRef : undefined;
}

export const H1 = ({ analyzeTitle, ...props }: TypographyProps & AnalyzeTitle) => {
  const ref = useAnalyzeTitleRef(analyzeTitle);
  return <Typography {...props} variant="h1" color="primary.main" marginBottom={4} marginTop={8} ref={ref} />;
};

export const H2 = ({ analyzeTitle, ...props }: TypographyProps & AnalyzeTitle) => {
  const ref = useAnalyzeTitleRef(analyzeTitle);
  return <Typography {...props} variant="h2" color="primary.main" marginBottom={2} marginTop={8} ref={ref} />;
};

export const H3 = ({ analyzeTitle = true, ...props }: TypographyProps & AnalyzeTitle) => {
  const ref = useAnalyzeTitleRef(analyzeTitle);
  return <Typography {...props} variant="h3" marginBottom={2} marginTop={4} ref={ref} />;
};

export const H4 = forwardRef<HTMLHeadingElement, TypographyProps & AnalyzeTitle>(({ analyzeTitle, ...props }: TypographyProps & AnalyzeTitle, ref) => {
  return <Typography {...props} variant="h4" ref={ref} />;
});

export const P1 = ({ analyzeDescription = true, ...props }: TypographyProps & AnalyzeDescription) => {
  const ref = useAnalyzeDescriptionRef(analyzeDescription);
  return <Typography {...props} variant="body1" ref={ref} marginBottom={2} marginTop={0} fontSize={18} />;
};

export const P2 = ({ analyzeDescription = true, ...props }: TypographyProps & AnalyzeDescription) => {
  const ref = useAnalyzeDescriptionRef(analyzeDescription);
  return <Typography {...props} variant="body1" ref={ref} marginBottom={2} marginTop={0} fontSize={16} color={'#7c7c7c'}/>;
};
