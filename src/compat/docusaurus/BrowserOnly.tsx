"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";

type BrowserOnlyProps = PropsWithChildren<{
  children: React.ReactNode | (() => React.ReactNode);
}>;

export default function BrowserOnly({ children }: BrowserOnlyProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return null;
  }

  return <>{typeof children === "function" ? (children as () => React.ReactNode)() : children}</>;
}
