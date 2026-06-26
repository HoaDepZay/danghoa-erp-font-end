import React, { ReactNode } from "react";
import { SkeletonRows, EmptyState } from "./index";

export interface Column<T> {
  key: string;
  title: string;
  render?: (record: T, index: number) => ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  emptyIcon?: ReactNode;
  rowKey?: string | ((record: T) => string);
  className?: string;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyText = "Không có dữ liệu",
  emptyIcon,
  rowKey = "id",
  className = "",
}: TableProps<T>) {
  const getRowKey = (record: T, index: number) => {
    if (typeof rowKey === "function") return rowKey(record);
    // @ts-ignore
    if (record && record[rowKey]) return record[rowKey];
    return index.toString();
  };

  return (
    <div className={`table-responsive ${className}`}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.key || index}
                style={{ width: col.width, textAlign: col.align || "left" }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows cols={columns.length} rows={5} />
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "32px 0" }}>
                <EmptyState title={emptyText} icon={emptyIcon} />
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr key={getRowKey(record, index)}>
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key || colIndex}
                    style={{ textAlign: col.align || "left" }}
                  >
                    {col.render ? col.render(record, index) : (record as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
