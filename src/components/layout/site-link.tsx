"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

export const SITE_NAVIGATION_EVENT = "form:site-navigation";

// แจ้ง navbar แม้ Next.js เปลี่ยนเฉพาะ hash โดยไม่มี hashchange
type SiteLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & {
  href: string;
};

export function SiteLink({ href, ...props }: SiteLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      onNavigate={() => {
        window.dispatchEvent(
          new CustomEvent(SITE_NAVIGATION_EVENT, { detail: href }),
        );
      }}
    />
  );
}
