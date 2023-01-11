import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import { Box, IconButton } from '@mui/material';
import React from 'react';
import { Cached } from '@mui/icons-material';

interface RecommendsProps {
  title?: string;
}

export default function Recommends ({ title = '💡 Popular questions' }: RecommendsProps) {
  return (
    <>
      <RecommendedSuggestions
        title={(reload, loading) => (
          <Box height="40px">
            {title} <IconButton onClick={reload} disabled={loading}><Cached /></IconButton>
          </Box>
        )}
        n={6}
      />
    </>
  );
}
