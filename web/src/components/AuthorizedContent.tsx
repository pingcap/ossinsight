import { useUserInfoContext } from '@site/src/context/user';

interface AuthorizedContentProps {
  children: JSX.Element;
  fallback?: JSX.Element | null;
}

export default function AuthorizedContent ({ children, fallback = null }: AuthorizedContentProps) {
  const { validated } = useUserInfoContext();

  if (validated) {
    return children;
  } else {
    return fallback;
  }
}
