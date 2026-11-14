import { Suspense } from "react";
import DeskFrame from "./desk-frame";

export const instant = false;

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-500">Loading the desk…</p>}>
      <DeskFrame>{children}</DeskFrame>
    </Suspense>
  );
}
