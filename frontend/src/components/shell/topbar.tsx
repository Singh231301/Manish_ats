import { Bell, CircleHelp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export function Topbar() {
  return (
    <header className="topbar">
      <div style={{ flex: 1, maxWidth: 420 }}>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--muted)" }} />
          <input className="input" style={{ paddingLeft: 38 }} placeholder="Search resumes, jobs, analyses" />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Tooltip label="Product guidance">
          <Button variant="ghost" aria-label="Help" icon={<CircleHelp size={18} />} />
        </Tooltip>
        <Tooltip label="Notifications">
          <Button variant="ghost" aria-label="Notifications" icon={<Bell size={18} />} />
        </Tooltip>
      </div>
    </header>
  );
}
