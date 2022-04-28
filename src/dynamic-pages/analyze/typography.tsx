import React, {forwardRef, RefCallback} from 'react';
import {TypographyProps} from '@mui/material/Typography';
import {Typography} from '@mui/material';
import {useAnalyzeChartContext, useAnalyzeContext} from '../../analyze-charts/context';

interface AnalyzeTitle {
  analyzeTitle?: boolean;
}

function useAnalyzeTitleRef(analyzeTitle: boolean | undefined): RefCallback<HTMLHeadingElement> | undefined {
  const {headingRef} = useAnalyzeChartContext();
  return analyzeTitle ? headingRef : undefined
}

export const H1 = ({analyzeTitle, ...props}: TypographyProps & AnalyzeTitle) => {
  const ref = useAnalyzeTitleRef(analyzeTitle)
  return <Typography {...props} variant="h1" color="primary.main" marginBottom={4} marginTop={8} ref={ref} />;
};

export const H2 = ({analyzeTitle, ...props}: TypographyProps & AnalyzeTitle) => {
  const ref = useAnalyzeTitleRef(analyzeTitle)
  return <Typography {...props} variant="h2" color="primary.main" marginBottom={4} marginTop={8} ref={ref} />;
};

export const H3 = ({analyzeTitle = true, ...props}: TypographyProps & AnalyzeTitle) => {
  const ref = useAnalyzeTitleRef(analyzeTitle)
  return <Typography {...props} variant="h3" marginBottom={4} marginTop={8} ref={ref} />;
};

export const H4 = ({analyzeTitle, ...props}: TypographyProps & AnalyzeTitle) => {
  const ref = useAnalyzeTitleRef(analyzeTitle)
  return <Typography {...props} variant="h4" ref={ref} />;
};
