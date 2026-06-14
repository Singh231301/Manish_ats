import { Topbar } from "@/components/shell/topbar";
import { AtsWorkspace } from "@/components/ats-workspace";

export default function Home() {
  return (
    <div className="app-shell">
      <main className="main">
        <Topbar />
        <div className="page">
          <AtsWorkspace />
        </div>
      </main>
    </div>
  );
}
