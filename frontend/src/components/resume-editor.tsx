"use client";

import { Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { HoverCard } from "@/components/ui/hover-card";

export function ResumeEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Resume editor</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <HoverCard trigger={<Button variant="secondary" icon={<Save size={16} />}>Save draft</Button>}>
            Draft persistence will connect to the PostgreSQL `resume_versions` table.
          </HoverCard>
          <Button variant="ghost" icon={<Trash2 size={16} />} onClick={() => setConfirmOpen(true)}>
            Clear
          </Button>
        </div>
      </div>
      <div className="panel-body">
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
