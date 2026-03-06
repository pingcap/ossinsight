"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

type LocationLike = {
  pathname: string;
  search: string;
  hash: string;
};

export function useLocation(): LocationLike {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  return { pathname, search, hash };
}

export function useHistory() {
  const router = useRouter();
  const location = useLocation();

  return {
    location,
    push: (to: string | { pathname?: string; search?: string; hash?: string }) => {
      if (typeof to === "string") {
        router.push(to);
        return;
      }
      router.push(`${to.pathname || location.pathname}${to.search ? `?${to.search}` : ""}${to.hash ? `#${to.hash}` : ""}`);
    },
    replace: (to: string | { pathname?: string; search?: string; hash?: string }) => {
      if (typeof to === "string") {
        router.replace(to);
        return;
      }
      router.replace(`${to.pathname || location.pathname}${to.search ? `?${to.search}` : ""}${to.hash ? `#${to.hash}` : ""}`);
    },
    createHref: (loc: { pathname?: string; search?: string; hash?: string }) => {
      return `${loc.pathname || location.pathname}${loc.search || ""}${loc.hash || ""}`;
    },
  };
}

export function Redirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
}
