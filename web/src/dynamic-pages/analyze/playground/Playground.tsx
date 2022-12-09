import * as React from 'react';
import { useMemo } from 'react';
import { Drawer } from '@mui/material';
import useUrlSearchState, { booleanParam } from '@site/src/hooks/url-search-state';
import { useWhenMounted } from '@site/src/hooks/mounted';
import PlaygroundContent from './PlaygroundContent';
import PlaygroundButton from './PlaygroundButton';

function Playground ({ open, onClose }: { open: boolean, onClose: () => void }) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <PlaygroundContent />
    </Drawer>
  );
}

export function usePlayground () {
  const [open, setOpen] = useUrlSearchState('playground', booleanParam('enabled'), false);
  const whenMounted = useWhenMounted();

  return useMemo(() => {
    return {
      button: <PlaygroundButton open={open} onToggleOpen={whenMounted(() => setOpen(open => !open))} />,
      drawer: <Playground open={open} onClose={whenMounted(() => setOpen(false))} />,
    };
  }, [open]);
}
