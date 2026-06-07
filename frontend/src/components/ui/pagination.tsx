import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="pagination">
      <Button
        variant="secondary"
        aria-label="Previous page"
        icon={<ChevronLeft size={16} />}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      <span className="score-caption">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        aria-label="Next page"
        icon={<ChevronRight size={16} />}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </div>
  );
}
