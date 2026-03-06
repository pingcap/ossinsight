"use client";

import React, { PropsWithChildren, useEffect } from "react";

export interface Props {
  title?: string;
  description?: string;
  noFooter?: boolean;
  children?: React.ReactNode;
}

export default function Layout({ title, children }: PropsWithChildren<Props>) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return <>{children}</>;
}
