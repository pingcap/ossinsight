import React, { ForwardedRef, forwardRef } from 'react';
import Section from '../Section';
import { H2 } from '@site/src/dynamic-pages/analyze/typography';
import MilestoneTimeline from '@site/src/components/milestone/MilestoneTimeline';
import { useAnalyzeContext } from '@site/src/dynamic-pages/analyze/charts/context';

export const Milestone = forwardRef((_, ref: ForwardedRef<HTMLElement>) => {
  const { repoId } = useAnalyzeContext();

  return (
    <Section id="milestone" ref={ref}>
      <H2>Milestones</H2>
      <MilestoneTimeline repoId={repoId} />
    </Section>
  );
});
