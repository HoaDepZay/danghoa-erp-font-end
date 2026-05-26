import { Edit3, Search, MessageSquare } from "lucide-react";
import { Badge, Avatar, SkeletonRows, EmptyState } from "../../../components/UI/index";
import { ROLE_COLORS } from "./useEmployees";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";

interface EmployeeTableProps {
  loading: boolean;
  employees: any[];
  userLevel: number;
  setModal: (val: any) => void;
  onNavigate: (page: string) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ loading, employees, userLevel, setModal, onNavigate }) => {
  const handleChat = async (emp: any) => {
    try {
      await api.createDirectRoom({ targetMaNv: emp.manv });
      onNavigate("chat");
    } catch (err) {
      toast.error("Lỗi tạo phòng chat!");
    }
  };
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã NV</th><th>Họ tên</th><th>Email</th>
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
              const statusText = emp.trangthailamviec || "—";
              const isOnline = statusText === "Đang làm việc";
              return (
                 <tr key={emp.manv}>
                  <td><span style={{ fontWeight: 600, fontSize: 11, background: "#f0f0f0", padding: "3px 8px", borderRadius: 5 }}>{emp.manv}</span></td>
                  <td>
                    <div 
                      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} 
                      onClick={() => handleChat(emp)}
                      title={`Nhắn tin với ${emp.hoten}`}
                    >
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <Avatar name={emp.hoten} size="sm" />
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
                      <span style={{ fontWeight: 600 }}>{emp.hoten}</span>
                    </div>
                  </td>
                  <td style={{ color: "#666" }}>{emp.email || "—"}</td>
                  <td><Badge color={ROLE_COLORS[emp.chucvu] || "gray"}>{emp.chucvu}</Badge></td>
                  <td style={{ color: "#666" }}>{emp.tenpb || "—"}</td>
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
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setModal({ type: "detail", data: emp.manv })} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Chi tiết</button>
                      <button onClick={() => handleChat(emp)} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><MessageSquare size={12} /> Nhắn tin</button>
                      {userLevel >= 3 && (
                        <button onClick={() => setModal({ type: "edit", data: emp })} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><Edit3 size={12} /> Sửa</button>
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

