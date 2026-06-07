import { clsx } from "clsx";
import type { ReactNode } from "react";

type BadgeTone = "purple" | "green" | "yellow" | "red" | "blue";

export function Badge({ children, tone = "purple" }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={clsx("badge", tone)}>{children}</span>;
}
