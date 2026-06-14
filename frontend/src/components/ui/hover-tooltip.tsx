import { ReactNode } from "react";

interface HoverTooltipProps {
  children: ReactNode;
  content: ReactNode;
}

export function HoverTooltip({ children, content }: HoverTooltipProps) {
  return (
    <div className="hover-wrap">
      {children}
      <div className="hover-card">
        {content}
      </div>
    </div>
  );
}
