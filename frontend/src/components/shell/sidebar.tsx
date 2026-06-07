import { BarChart3, FileText, Flame, LayoutDashboard, PencilLine, Settings, Sparkles } from "lucide-react";

const groups = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, active: true },
      { label: "Resume Parser", icon: FileText },
      { label: "Score Center", icon: BarChart3 },
      { label: "Heatmap", icon: Flame },
    ],
  },
  {
    label: "Optimization",
    items: [
      { label: "AI Rewrite", icon: Sparkles },
      { label: "Editor", icon: PencilLine },
      { label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">A</span>
        <span>ATS Platform</span>
      </div>
      {groups.map((group) => (
        <div className="nav-group" key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map((item) => (
            <button className={item.active ? "nav-item active" : "nav-item"} key={item.label}>
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
