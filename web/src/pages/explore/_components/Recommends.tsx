import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import { Box } from '@mui/material';
import React from 'react';
import { HighlightButton } from '@site/src/pages/explore/_components/highlighted';

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
      <HighlightButton<'link'> variant='link' sx={{ mt: 3 }} to='/blog/chat2query-tutorials' target='_blank'>
        🧐 Not an expert? Uncover insights with your OWN dataset!
      </HighlightButton>
    </>
  );
}
