import React from "react";
import { formatCurrency } from "../../utils/helpers";
import { SkeletonRows } from "../../components/UI/index";

interface PayrollTableProps {
  loading: boolean;
  payroll: any[];
  totalBudget: number;
  onViewDetail: (record: any) => void;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({ loading, payroll, totalBudget, onViewDetail }) => {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã NV</th>
            <th>Tháng / Năm</th>
            <th>Giờ làm việc</th>
            <th>Phụ cấp</th>
            <th>Thưởng</th>
            <th>BHXH</th>
            <th>Thuế TNCN</th>
            <th style={{ textAlign: "right" }}>Thực lãnh</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows cols={9} rows={8} />
          ) : (
            payroll.map((r, idx) => (
              <tr key={r.manv ?? idx}>
                <td style={{ fontWeight: 600, fontSize: 12 }}>{r.manv}</td>
                <td style={{ color: "#888" }}>
                  {r.thang}/{r.nam}
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{r.giolamViec ?? 0}</span>
                  <span style={{ fontSize: 11, color: "#aaa", marginLeft: 4 }}>giờ</span>
                </td>
                <td style={{ color: "#555" }}>{formatCurrency(r.phucap ?? 0)}</td>
                <td style={{ color: "#10b981" }}>{formatCurrency(r.thuong ?? 0)}</td>
                <td style={{ color: "#ef4444" }}>{formatCurrency(r.bhxh ?? 0)}</td>
                <td style={{ color: "#f59e0b" }}>{formatCurrency(r.thueTNCN ?? 0)}</td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(r.thucLanh ?? 0)}</td>
                <td>
                  <button
                    onClick={() => onViewDetail(r)}
                    style={{ fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        {!loading && payroll.length > 0 && (
          <tfoot>
            <tr style={{ background: "#111" }}>
              <td colSpan={7} style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                Tổng thực lãnh tháng
              </td>
              <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 800, color: "#fff" }}>
                {formatCurrency(totalBudget)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
