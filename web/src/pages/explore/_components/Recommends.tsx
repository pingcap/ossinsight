import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import { Box } from '@mui/material';
import React from 'react';

interface RecommendsProps {
  title?: string;
}

export default function Recommends ({ title = '🔥 Popular queries' }: RecommendsProps) {
  return (
    <>
      <RecommendedSuggestions
        title={() => (
          <Box height="40px">
            {title}
          </Box>
        )}
        n={6}
      />
    </>
  );
}
