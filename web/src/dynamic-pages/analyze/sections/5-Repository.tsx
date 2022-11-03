import React, { ForwardedRef, forwardRef } from 'react';
import Section from '../Section';
import { H2 } from '../typography';
import { MonthlyDetailsCard } from '../charts/montly-cards/MonthlyDetailsCard';

export const Repository = forwardRef((props, ref: ForwardedRef<HTMLElement>) => {
  return (
    <Section id="repository" ref={ref}>
      <H2>Repository Statistics - Last 28 Days</H2>
      <MonthlyDetailsCard />
    </Section>
  );
});
