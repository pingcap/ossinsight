import React from 'react';
import { H2, H2Plus } from '../../../_components/typography';

export default function TitleLine () {
  return (
    <H2 id='developer'>
      Visible & Unique
      <br />
      <H2Plus sx={{color: '#FFE895'}}>
        Developer Analytics
      </H2Plus>
    </H2>
  )
}