"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

interface MyTicketsLinkProps {
  children: ReactNode;
  className?: string;
}

export function MyTicketsLink({ children, className }: MyTicketsLinkProps) {
  const { user, hydrated } = useAuth();
  const signedIn = hydrated && Boolean(user);
  if (!signedIn) return null;
  return (
    <Link href="/dashboard" className={className}>
      {children}
    </Link>
  );
}
