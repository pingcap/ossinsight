import React from 'react';
import { Headline } from '../../../_components/typography';
import TotalNumber from './TotalNumber';

const EventLine = () => {
  return (
    <Headline>
      Get insights from
      <TotalNumber />
      GitHub Events
    </Headline>
  )
}

export default EventLine
