import { Button, useEventCallback } from '@mui/material';
import { Question } from '@site/src/api/explorer';
import ExecutionInfoDialog from '@site/src/pages/explore/_components/ResultSection/ExecutionInfoDialog';
import React, { ReactNode, useState } from 'react';

export default function ShowExecutionInfoButton ({ question, children }: { question: Question, children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const handleOpen = useEventCallback(() => {
    setOpen(true);
  });

  return (
    <>
      <Button variant="text" size="small" sx={{ ml: 1 }} onClick={handleOpen}>
        {children}
      </Button>
      <ExecutionInfoDialog open={open} onOpenChange={setOpen} question={question} />
    </>
  );
}
