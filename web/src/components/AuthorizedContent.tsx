import { useAuth0 } from '@auth0/auth0-react';

interface AuthorizedContentProps {
  children: JSX.Element;
  fallback?: JSX.Element | null;
}

export default function AuthorizedContent ({
  children,
  fallback = null,
}: AuthorizedContentProps) {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return children;
  } else {
    return fallback;
  }
}
