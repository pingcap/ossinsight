import { useDocumentVisible, useOnline, useVisible } from '@/utils/hooks';
import { useRef, useState } from 'react';

export function useShouldPerformNetworkRequests<E extends HTMLElement = any> () {
  const online = useOnline();
  const documentVisible = useDocumentVisible();

  const [ref, setRef] = useState<E | null>(null);
  const visible = useVisible({ current: ref }, false);

  return {
    ref: setRef,
    value: visible && online && documentVisible,
  };
}
