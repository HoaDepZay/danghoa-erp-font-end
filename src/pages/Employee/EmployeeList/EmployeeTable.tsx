import React from "react";
import { Edit3, Search } from "lucide-react";
import { Badge, Avatar, SkeletonRows, EmptyState } from "../../../components/UI/index";
import { ROLE_COLORS } from "./useEmployees";

interface EmployeeTableProps {
  loading: boolean;
  employees: any[];
  userLevel: number;
  setModal: (val: any) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ loading, employees, userLevel, setModal }) => {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã NV</th><th>Họ tên</th><th>Email</th>
            <th>Chức vụ</th><th>Phòng ban</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
             <SkeletonRows cols={6} rows={8} />
          ) : employees.length === 0 ? (
            <tr><td colSpan={6}><EmptyState icon={<Search size={40} />} title="Không tìm thấy nhân viên" /></td></tr>
          ) : (
            employees.map((emp) => (
               <tr key={emp.MANV || emp.MaNV}>
                <td><span style={{ fontWeight: 600, fontSize: 11, background: "#f0f0f0", padding: "3px 8px", borderRadius: 5 }}>{emp.MANV || emp.MaNV}</span></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={emp.HOTEN || emp.HoTen} size="sm" />
                    <span style={{ fontWeight: 600 }}>{emp.HOTEN || emp.HoTen}</span>
                  </div>
                </td>
                <td style={{ color: "#666" }}>{emp.EMAIL || emp.Email || "—"}</td>
                <td><Badge color={ROLE_COLORS[emp.CHUCVU || emp.chucvu] || "gray"}>{emp.CHUCVU || emp.chucvu}</Badge></td>
                <td style={{ color: "#666" }}>{emp.TENPB || emp.TenPB || "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setModal({ type: "detail", data: emp.MANV || emp.MaNV })} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Chi tiết</button>
                    {userLevel >= 3 && (
                      <button onClick={() => setModal({ type: "edit", data: emp })} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><Edit3 size={12} /> Sửa</button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

