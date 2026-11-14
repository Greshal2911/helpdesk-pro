"use client";

import { Suspense } from "react";
import { DeskShell } from "@/components/desk-shell";

export default function DeskFrame({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-500">Loading the desk…</p>}>
      <DeskShell>{children}</DeskShell>
    </Suspense>
  );
}
