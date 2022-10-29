import Section from "@site/src/pages/year/2022/_components/Section";
import React from "react";
import { PieChart } from '../_components/charts';

export default function () {
  return (
    <Section
      title={title}
      description={description}
      descriptionProps={{ maxWidth: 1165 }}
    >
      <PieChart
        sx={{ maxHeight: 400, mt: 6 }}
      />
    </Section>
  );
}

const title = 'Behavior distribution by Weekdays/Weekends';
const description = 'We query the event distribution for each Weekday/Weekend in 2022 and calculate the distribution of each event on 7 days of the week and the distribution of events for each day.';