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
        sx={theme => ({
          [theme.breakpoints.up('md')]: {
            maxHeight: 400,
          },
          height: 500,
          mt: 6,
        })}
      />
    </Section>
  );
}

const title = 'Developer behavior distribution on weekdays and weekends';
const description = 'We queried the distribution of each event type over the seven days of the week.';