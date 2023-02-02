import React from 'react';
import SqlSection from '@site/src/pages/explore/_components/SqlSection';
import ResultSection from '@site/src/pages/explore/_components/ResultSection';

export default function Execution ({ search }: { search: string }) {
  return (
    <>
      <SqlSection />
      <ResultSection />
    </>
  );
};
