import React from 'react';
import clsx from 'clsx';
import type { Props } from '@theme/Footer/Layout';

export default function FooterLayout ({
  style,
  links,
  logo,
  copyright,
  sideWidth,
}: Props): JSX.Element {
  return (
    <footer
      className={clsx('footer', {
        'footer--dark': style === 'dark',
      })}
      style={{ marginLeft: sideWidth, paddingRight: sideWidth }}
    >
      <div className="container container-fluid">
        {links}
        {(logo || copyright) && (
          <div className="footer__bottom text--center">
            {logo && <div className="margin-bottom--sm">{logo}</div>}
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
