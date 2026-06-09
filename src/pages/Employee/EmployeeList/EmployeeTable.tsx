import { Edit3, Search } from "lucide-react";
import { Badge, Avatar, SkeletonRows, EmptyState, Btn } from "../../../components/UI/index";
import { ROLE_COLORS } from "./useEmployees";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";

interface EmployeeTableProps {
  loading: boolean;
  employees: any[];
  userLevel: number;
  setModal: (val: any) => void;
  onNavigate: (page: string) => void;
  onViewDetail: (id: string) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ loading, employees, userLevel, setModal, onNavigate, onViewDetail }) => {
  // Xóa hàm handleChat theo yêu cầu
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã NV</th><th>Họ tên</th><th>EMAIL</th>
            <th>Chức vụ</th><th>Phòng ban</th><th>Trạng thái</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
             <SkeletonRows cols={7} rows={8} />
          ) : employees.length === 0 ? (
            <tr><td colSpan={7}><EmptyState icon={<Search size={40} />} title="Không tìm thấy nhân viên" /></td></tr>
          ) : (
            employees.map((emp) => {
              const statusText = emp.trang_thai_hom_nay || "—";
              const isOnline = statusText === "Đang làm việc";
              return (
                 <tr key={emp.MA_NV} onClick={() => onViewDetail(emp.MA_NV)} style={{ cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td><span style={{ fontWeight: 600, fontSize: 11, background: "#f0f0f0", padding: "3px 8px", borderRadius: 5 }}>{emp.MA_NV}</span></td>
                  <td>
                    <div 
                      style={{ display: "flex", alignItems: "center", gap: 10 }} 
                      title={`Chi tiết nhân viên ${emp.HO_TEN}`}
                    >
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <Avatar name={emp.HO_TEN} size="sm" />
                        {isOnline && (
                           <span 
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: "#10b981",
                              border: "2px solid white",
                              display: "block"
                            }}
                            title="Đang làm việc (Online)"
                          />
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{emp.HO_TEN}</span>
                    </div>
                  </td>
                  <td style={{ color: "#666" }}>{emp.EMAIL || "—"}</td>
                  <td><Badge color={ROLE_COLORS[emp.CHUC_VU] || "gray"}>{emp.CHUC_VU}</Badge></td>
                  <td style={{ color: "#666" }}>
                    {emp.TEN_PB ? (
                      <span style={{ padding: "4px 10px", background: "#f1f5f9", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "#334155", display: "inline-block" }}>
                        {emp.TEN_PB}
                      </span>
                    ) : "—"}
                  </td>
                  <td>
                    <Badge 
                      color={
                        statusText === "Đang làm việc" ? "green" :
                        statusText === "Đang nghỉ" ? "red" :
                        statusText === "Chính thức" ? "blue" : "gray"
                      }
                    >
                      {statusText}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {userLevel >= 3 && (
                        <Btn variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setModal({ type: "edit", data: emp }); }} icon={<Edit3 size={14} />}>Sửa</Btn>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

