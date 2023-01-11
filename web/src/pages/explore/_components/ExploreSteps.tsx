import { decomposeColor, recomposeColor, Step, stepIconClasses, StepLabel, Stepper, styled, Theme, useMediaQuery } from '@mui/material';
import React, { useMemo } from 'react';
import { SxProps } from '@mui/system';
import { array } from '@site/src/utils/generate';

interface ExploreStepsProps {
  startColor?: string;
  stopColor?: string;
  steps: string[];
  sx?: SxProps;
}

export default function ExploreSteps ({ startColor = '#794BC5', stopColor = '#3D44FF', steps, sx }: ExploreStepsProps) {
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  const colorSequences = useMemo(() => {
    const colorStart = decomposeColor(startColor).values as RGBColor;
    const colorStop = decomposeColor(stopColor).values as RGBColor;
    return array(steps.length + 1).map((i) => mixColor(colorStart, colorStop, i / steps.length));
  }, [startColor, stopColor, steps.length]);

  return (
    <>
      <svg width="0" height="0">
        <defs>
          {steps.map((_, i) => (
            <linearGradient id={`explore-step-gradient-${i}`} key={i} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: colorSequences[i], stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: colorSequences[i + 1], stopOpacity: 1 }} />
            </linearGradient>
          ))}
        </defs>
      </svg>
      <Stepper sx={sx} orientation={isSmall ? 'vertical' : 'horizontal'}>
        {steps.map((step, i) => (
          <Step key={step} completed={false} active>
            <StyledStepLabel fill={`explore-step-gradient-${i}`}>
              {step}
            </StyledStepLabel>
          </Step>
        ))}
      </Stepper>
    </>
  );
}

type RGBColor = [r: number, g: number, b: number];

function mixColor ([r1, g1, b1]: RGBColor, [r2, g2, b2]: RGBColor, p: number) {
  const r = 1 - p;
  return recomposeColor({
    type: 'rgb',
    values: [
      r1 * r + r2 * p,
      g1 * r + g2 * p,
      b1 * r + b2 * p,
    ],
  });
}

const StyledStepLabel = styled(StepLabel, { shouldForwardProp: propName => propName !== 'fill' })<{ fill: string }>`
  .${stepIconClasses.root}.${stepIconClasses.active} {
    fill: url(#${({ fill }) => fill}); // ${({ color }) => color};
  }
`;
