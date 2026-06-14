"use client";

import { Save, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { HoverCard } from "@/components/ui/hover-card";
import { optimizeResume } from "@/lib/api";

export function ResumeEditor({
  value,
  jobDescription,
  onChange,
}: {
  value: string;
  jobDescription: string;
  onChange: (value: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiNote, setAiNote] = useState("");

  async function rewriteWithAi() {
    setLoading(true);
    setAiNote("");
    try {
      const result = await optimizeResume({ resumeText: value, jobDescription, tone: "direct" });
      if (result.optimizedText) {
        onChange(result.optimizedText);
      }
      setAiNote(`Updated with ${result.modelUsed}. ${result.changes.length} changes suggested.`);
    } catch (error) {
      setAiNote(error instanceof Error ? error.message : "AI rewrite failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Resume editor</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="primary" icon={<Sparkles size={16} />} onClick={rewriteWithAi} disabled={loading}>
            {loading ? "Rewriting" : "AI rewrite"}
          </Button>
          <HoverCard trigger={<Button variant="secondary" icon={<Save size={16} />}>Save draft</Button>}>
            Draft persistence will connect to the PostgreSQL `resume_versions` table.
          </HoverCard>
          <Button variant="ghost" icon={<Trash2 size={16} />} onClick={() => setConfirmOpen(true)}>
            Clear
          </Button>
        </div>
      </div>
      <div className="panel-body">
        {aiNote ? <p className="score-caption" style={{ marginTop: 0 }}>{aiNote}</p> : null}
        <textarea className="textarea" style={{ minHeight: 320 }} value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Clear resume draft?"
        message="This removes the current text from the editor."
        confirmLabel="Clear draft"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          onChange("");
          setConfirmOpen(false);
        }}
      />
    </section>
  );
}
