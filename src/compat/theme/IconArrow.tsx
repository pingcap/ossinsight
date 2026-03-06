import React from "react";

export default function IconArrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
      <path d="M8 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
