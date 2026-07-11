import React from "react";
import { Edit3, Search } from "lucide-react";
import { Badge, Avatar, Btn, Table, Column } from "../../../components/UI/index";
import { ROLE_COLORS } from "./useEmployees";

interface EmployeeTableProps {
  loading: boolean;
  employees: any[];
  userLevel: number;
  setModal: (val: any) => void;
  onNavigate: (page: string) => void;
  onViewDetail: (id: string) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ loading, employees, userLevel, setModal, onViewDetail }) => {
  const columns: Column<any>[] = [
    {
      key: "MA_NV",
      title: "Mã NV",
      render: (emp) => (
        <span style={{ fontWeight: 600, fontSize: 11, background: "#f0f0f0", padding: "3px 8px", borderRadius: 5 }}>
          {emp.MA_NV}
        </span>
      )
    },
    {
      key: "HO_TEN",
      title: "Họ tên",
      render: (emp) => {
        const statusText = emp.TRANG_THAI_LAM_VIEC || emp.trang_thai_hom_nay || "—";
        const isOnline = statusText === "DANG_LAM_VIEC" || statusText === "Đang làm việc";
        return (
          <div 
            style={{ display: "flex", alignItems: "center", gap: 10 }} 
            title={`Chi tiết nhân viên ${emp.HO_TEN}`}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <Avatar name={emp.HO_TEN || emp.TEN_NV || "User"} src={emp.HINH_DAI_DIEN} size="sm" />
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
        );
      }
    },
    {
      key: "EMAIL",
      title: "EMAIL",
      render: (emp) => <span style={{ color: "#666" }}>{emp.EMAIL || "—"}</span>
    },
    {
      key: "CHUC_VU",
      title: "Chức vụ",
      render: (emp) => {
        const role = emp.CHUC_VU || "—";
        const colors = ["blue", "purple", "orange", "green", "red", "yellow"];
        let hash = 0;
        for (let i = 0; i < role.length; i++) hash = role.charCodeAt(i) + ((hash << 5) - hash);
        const color = ROLE_COLORS[role] || colors[Math.abs(hash) % colors.length];
        return <Badge color={color}>{role}</Badge>;
      }
    },
    {
      key: "TEN_PB",
      title: "Phòng ban",
      render: (emp) => {
        const dept = emp.TEN_PB || "—";
        const colors = ["purple", "blue", "green", "orange", "gray", "red"];
        let hash = 0;
        for (let i = 0; i < dept.length; i++) hash = dept.charCodeAt(i) + ((hash << 5) - hash);
        const color = dept === "—" ? "gray" : colors[Math.abs(hash) % colors.length];
        return <Badge color={color}>{dept}</Badge>;
      }
    },
    {
      key: "TRANG_THAI",
      title: "Trạng thái",
      render: (emp) => {
        const st = String(emp.TRANG_THAI_LAM_VIEC || emp.trang_thai_hom_nay || "—").trim();
        let color = "gray";
        
        if (st === "DANG_LAM_VIEC" || st === "Đang làm việc") {
          color = "green";
        } else if (st === "VANG_MAT" || st === "Vắng mặt" || st === "Đang nghỉ" || st === "Nghỉ việc") {
          color = "red";
        } else if (st === "Chính thức") {
          color = "blue";
        }

        return (
          <Badge color={color}>
            {st === "DANG_LAM_VIEC" ? "Đang làm việc" : st === "VANG_MAT" ? "Vắng mặt" : st}
          </Badge>
        );
      }
    },
    {
      key: "ACTIONS",
      title: "Thao tác",
      render: (emp) => (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {userLevel >= 3 && (
            <Btn variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setModal({ type: "edit", data: emp }); }} icon={<Edit3 size={14} />}>
              Sửa
            </Btn>
          )}
        </div>
      )
    }
  ];

  const displayColumns = userLevel >= 3 ? columns : columns.filter(c => c.key !== "ACTIONS");

  return (
    <Table 
      columns={displayColumns} 
      data={employees} 
      loading={loading} 
      emptyText="Không tìm thấy nhân viên"
      emptyIcon={<Search size={40} />}
      rowKey="MA_NV"
      onRowClick={(emp) => onViewDetail(emp.MA_NV)}
    />
  );
};
