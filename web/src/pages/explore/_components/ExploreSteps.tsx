import { decomposeColor, recomposeColor, Step, stepIconClasses, StepLabel, Stepper, styled } from '@mui/material';
import React, { useMemo } from 'react';
import { SxProps } from '@mui/system';

interface ExploreStepsProps {
  startColor?: string;
  stopColor?: string;
  steps: string[];
  sx?: SxProps;
}

export default function ExploreSteps ({ startColor = '#794BC5', stopColor = '#3D44FF', steps, sx }: ExploreStepsProps) {
  const colorSequences = useMemo(() => {
    const colorStart = decomposeColor('#794BC5').values as RGBColor;
    const colorStop = decomposeColor('#3D44FF').values as RGBColor;
    return steps.map((_, i) => mixColor(colorStart, colorStop, i / (steps.length - 1)));
  }, [startColor, stopColor, steps.length]);

  return (
    <Stepper sx={sx}>
      {steps.map((step, i) => (
        <Step key={step} completed={false} active>
          <StyledStepLabel color={colorSequences[i]}>
            {step}
          </StyledStepLabel>
        </Step>
      ))}
    </Stepper>
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

const StyledStepLabel = styled(StepLabel, { shouldForwardProp: propName => propName !== 'color' })`
  .${stepIconClasses.root}.${stepIconClasses.active} {
    color: ${({ color }) => color};
  }
`;
