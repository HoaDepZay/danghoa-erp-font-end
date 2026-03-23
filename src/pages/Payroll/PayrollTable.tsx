import React from "react";
import { Edit3 } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import { SkeletonRows } from "../../components/UI/index";

interface PayrollTableProps {
  loading: boolean;
  payroll: any[];
  totalBudget: number;
  setModal: (val: any) => void;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({ loading, payroll, totalBudget, setModal }) => {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã NV</th><th>Họ tên</th><th>Ngày công</th><th>Lương cơ bản</th>
            <th>Phụ cấp</th><th>Thưởng</th><th>Khấu trừ BH</th>
            <th style={{ textAlign: "right" }}>Tổng thực nhận</th><th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
             <SkeletonRows cols={9} rows={8} />
          ) : (
            payroll.map((r) => (
              <tr key={r.MABL || r.MaBl}>
                <td style={{ fontWeight: 600, fontSize: 12 }}>{r.MANV || r.MaNV}</td>
                <td style={{ fontWeight: 600 }}>{r.HOTEN || r.HoTen}</td>
                <td>{r.SONGAYCONGTHUCTE || r.SoNgayCongThucTe || 0}</td>
                <td style={{ color: "#555" }}>{formatCurrency(r.LUONGCOBAN || r.LuongCoBan)}</td>
                <td style={{ color: "#555" }}>{formatCurrency(r.PHUCAP || r.PhuCap || 0)}</td>
                <td style={{ color: "#10b981" }}>{formatCurrency(r.THUONG || r.Thuong || 0)}</td>
                <td style={{ color: "#ef4444" }}>{formatCurrency(r.KHAUTRUBH || r.KhauTruBH || 0)}</td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(r.TONGLUONG || r.TongLuong)}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setModal({ type: "payslip", data: r })}
                      style={{ fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer" }}>Xem</button>
                    <button onClick={() => setModal({ type: "update", data: r })}
                      style={{ color: "#aaa", background: "none", border: "none", cursor: "pointer", display: "flex" }}><Edit3 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
        {!loading && payroll.length > 0 && (
          <tfoot>
            <tr style={{ background: "#111" }}>
              <td colSpan={7} style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#fff" }}>Tổng ngân sách tháng</td>
              <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 800, color: "#fff" }}>{formatCurrency(totalBudget)}</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

