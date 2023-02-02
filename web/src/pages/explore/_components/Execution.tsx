import React from 'react';
import SqlSection from '@site/src/pages/explore/_components/SqlSection';
import ResultSection from '@site/src/pages/explore/_components/ResultSection';

export interface ExecutionProps {
  onResultFullyVisible?: () => void;
  onResultFullyInvisible?: () => void;
  onResultInvisible?: () => void;
  onResultVisible?: () => void;
}

export default function Execution ({
  onResultVisible,
  onResultInvisible,
  onResultFullyVisible,
  onResultFullyInvisible,
}: ExecutionProps) {
  return (
    <>
      <SqlSection />
      <ResultSection
        onInvisible={onResultInvisible}
        onVisible={onResultVisible}
        onFullyInvisible={onResultFullyInvisible}
        onFullyVisible={onResultFullyVisible}
      />
    </>
  );
};
