import React from "react";
import Section from "../_components/Section";
import CountryEvents from "@site/src/pages/year/2022/_components/charts/CountryEvents";

export default function () {
  return (
    <Section
      title={title}
      description={description}
    >
      <CountryEvents data={require('../_charts/country-data.json')} />
    </Section>
  )
}

const title = 'Geographic distribution behavior by country or region'
const description = 'We queried the number of various events that occurred throughout the world from January 1 to September 30, 2022 and identified the top 10 countries by the number of events triggered by developers in these countries. The chart displays the proportion of each event type by country or region.'