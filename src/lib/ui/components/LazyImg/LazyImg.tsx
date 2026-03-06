import { ImgHTMLAttributes, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export interface LazyImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: ReactNode;
}

export default function LazyImg ({ src, fallback, className, ...props }: LazyImgProps) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <img
        src={src}
        ref={ref}
        className={twMerge(
          loaded ? 'block' : 'hidden',
          className)}
        {...props}
        onLoad={handleLoad}
      />
      {!loaded && fallback}
    </>
  );
}