import React from "react";
import Section from "../_components/Section";
import CountryEvents from "@site/src/pages/year/2022/_components/charts/CountryEvents";

export default function () {
  return (
    <Section>
      <CountryEvents data={require('../_charts/country-data.json')} />
    </Section>
  )
}