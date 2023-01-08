import { useExperimental } from '@site/src/components/Experimental';
import { useEffect } from 'react';

export default function () {
  const [, setEnabled] = useExperimental('explore-data');

  useEffect(() => {
    setEnabled(true);
    location.href = '/explore';
  }, []);
  return null;
}
