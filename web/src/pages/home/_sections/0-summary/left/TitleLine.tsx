import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import React from 'react';
import { H1, Span } from '../../../_components/typography';

const TitleLine = () => {
  return (
    <H1>
      Open Source Software
      <br />
      <Span sx={{ color: '#FFE895' }}>
        <VisibilityOutlinedIcon fontSize='inherit' sx={{ verticalAlign: 'text-bottom' }} />
        &nbsp;Insight
      </Span>
    </H1>
  );
};

export default TitleLine;
