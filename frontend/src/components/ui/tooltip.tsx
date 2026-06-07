"use client";

import type { ReactNode } from "react";
import { useState } from "react";

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="tooltip-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open ? <span className="tooltip">{label}</span> : null}
    </span>
  );
}
