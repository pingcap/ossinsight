import React, { useState } from 'react';
import { Alert, IconButton, Snackbar, useEventCallback } from '@mui/material';
import { notFalsy } from '@site/src/utils/value';
import { ContentCopy } from '@mui/icons-material';

export interface CopyButtonProps {
  content: string | undefined;
}

export default function CopyButton ({ content }: CopyButtonProps) {
  const [show, setShow] = useState(false);

  const handleHide = useEventCallback(() => {
    setShow(false);
  });

  const handleClick = useEventCallback(() => {
    if (notFalsy(content)) {
      if (content.includes('<b>')) {
        const fake = document.createElement('div');
        fake.innerHTML = content;
        content = fake.innerText;
      }
      navigator.clipboard.writeText(content).catch(console.error);
      setShow(true);
    }
  });

  return (
    <>
      <IconButton size="small" onClick={handleClick} sx={{ ml: 0.5 }}>
        <ContentCopy fontSize="inherit" />
      </IconButton>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={show}
        onClose={handleHide}
        autoHideDuration={3000}
      >
        <Alert severity="info" onClose={handleHide} sx={{ width: '100%' }}>
          Copied!
        </Alert>
      </Snackbar>
    </>
  );
}
