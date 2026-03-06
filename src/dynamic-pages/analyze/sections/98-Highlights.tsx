import React, { ForwardedRef, forwardRef } from 'react';
import Section from '../Section';
import { H2 } from '@/dynamic-pages/analyze/typography';
import MilestoneTimeline from '@/components/milestone/MilestoneTimeline';
import { useAnalyzeContext } from '@/dynamic-pages/analyze/charts/context';

export const Highlights = forwardRef((_, ref: ForwardedRef<HTMLElement>) => {
  const { repoId, repoName } = useAnalyzeContext();

  return (
    <Section id="highlights" ref={ref}>
      <H2>Highlights</H2>
      <MilestoneTimeline repoId={repoId} repoName={repoName} />
    </Section>
  );
});
