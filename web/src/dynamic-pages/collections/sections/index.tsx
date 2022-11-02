import React, { PropsWithChildren } from 'react';
import { P1 } from './typograpy';

export default function Sections ({ description, children }: PropsWithChildren<{ description: string }>) {
  return (
    <>
      <P1>{description}</P1>
      {children}
    </>
  );
}
