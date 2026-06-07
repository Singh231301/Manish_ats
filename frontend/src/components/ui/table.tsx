import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

export function Table<T>({ columns, rows }: { columns: TableColumn<T>[]; rows: T[] }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
