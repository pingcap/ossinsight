import { Transition } from '@headlessui/react';
import { Fragment, ReactElement, useEffect, useState } from 'react';

export function Scale ({ children }: { children: ReactElement }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <Transition
      as={Fragment}
      show={show}
      enter='ease-out duration-300'
      enterFrom='opacity-0 scale-[0.9]'
      enterTo='opacity-100 scale-1'
    >
      {children}
    </Transition>
  );
}