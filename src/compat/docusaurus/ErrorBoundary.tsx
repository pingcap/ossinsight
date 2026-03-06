import React from 'react';

export default function ErrorBoundary ({
  children,
  fallback,
}: {
  children?: React.ReactNode;
  fallback?: (error: unknown) => React.ReactNode;
}) {
  try {
    return <>{children}</>;
  } catch (e) {
    return <>{fallback?.(e)}</>;
  }
}
