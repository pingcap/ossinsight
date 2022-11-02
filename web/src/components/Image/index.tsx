import React, { HTMLAttributes, useMemo } from 'react';
import clsx from 'clsx';
import styles from './style.module.css';

export interface ImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
}

export default function Image ({ src, className, style, ...props }: ImageProps) {
  const realStyle = useMemo(() => {
    return Object.assign({}, style, {
      '--image-url': `url("${src}")`,
    });
  }, [style]);

  return (
    <div className={clsx(styles.image, className)} style={realStyle} {...props} />
  );
}
