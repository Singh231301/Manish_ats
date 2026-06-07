"use client";

import type { ReactNode } from "react";
import { useState } from "react";

export function HoverCard({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="hover-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {trigger}
      {open ? <span className="hover-card">{children}</span> : null}
    </span>
  );
}
