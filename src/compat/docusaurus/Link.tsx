"use client";

import NextLink from "next/link";
import React, { AnchorHTMLAttributes, forwardRef } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to?: string;
  href?: string;
};

function isExternal(url?: string) {
  return !!url && /^(https?:)?\/\//.test(url);
}

const Link = forwardRef<HTMLAnchorElement, Props>(function Link(props, ref) {
  const { to, href, children, ...rest } = props;
  const target = to || href || "";

  if (isExternal(target)) {
    return (
      <a ref={ref} href={target} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <NextLink ref={ref} href={target || "/"} {...rest}>
      {children}
    </NextLink>
  );
});

export default Link;
