"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Table, type TableColumn } from "@/components/ui/table";
import type { AnalysisResult } from "@/types/analysis";

type Suggestion = AnalysisResult["suggestions"][number];

export function SuggestionsTable({ suggestions }: { suggestions: Suggestion[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const validSuggestions = suggestions || [];
  const totalPages = Math.max(1, Math.ceil(validSuggestions.length / pageSize));
  const rows = useMemo(() => validSuggestions.slice((page - 1) * pageSize, page * pageSize), [page, validSuggestions]);

  const columns: TableColumn<Suggestion>[] = [
    { key: "category", header: "Category", render: (row) => <Badge tone={row.category === "keywords" ? "blue" : "purple"}>{row.category}</Badge> },
    { key: "title", header: "Action", render: (row) => <strong>{row.title}</strong> },
    { key: "impact", header: "Impact", render: (row) => `+${row.impact}` },
    { key: "detail", header: "Detail", render: (row) => row.detail },
  ];

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Prioritized improvements</h2>
      </div>
      <div className="panel-body">
        {validSuggestions.length ? (
          <>
            <Table columns={columns} rows={rows} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <div className="empty">No major improvements found.</div>
        )}
      </div>
    </section>
  );
}
