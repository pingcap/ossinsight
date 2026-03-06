import React, { PropsWithChildren } from "react";

type TranslateArgs = {
  message?: string;
  id?: string;
  description?: string;
};

export function translate(args: TranslateArgs): string {
  return args.message || args.id || "";
}

export default function Translate({ children }: PropsWithChildren) {
  return <>{children}</>;
}
