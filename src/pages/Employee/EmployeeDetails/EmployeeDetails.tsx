import React, { useState } from "react";
import { User, MessageSquare } from "lucide-react";
import { Avatar, Badge, Spinner, Drawer } from "../../../components/UI/index";
import { Btn } from "../../../components/UI/index";
import { formatDate } from "../../../utils/helpers";
import { ROLE_COLORS } from "../EmployeeList/useEmployees";
import { useEmployeeDetails } from "./useEmployeeDetails";
import { api } from "../../../services/api";

const GENDER_MAP: Record<number | string, string> = { 1: "Nam", 2: "Nữ", 3: "Khác" };
const formatGender = (val: number | string | null | undefined): string => {
  if (val == null || val === "") return "—";
  return GENDER_MAP[val] ?? String(val);
};

interface EmployeeDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
  onNavigate?: (page: string) => void;
}

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ isOpen, onClose, employeeId, onNavigate }) => {
  const { data, loading } = useEmployeeDetails(employeeId);
  const [chatLoading, setChatLoading] = useState(false);
  const emp = data?.employee || data;

  const handleStartChat = async () => {
    if (!emp) return;
    setChatLoading(true);
    try {
      const targetMaNv = emp.manv;
      const res = await api.createDirectRoom({ targetMaNv });
      const roomId = res.data?.data?.maPhong || res.data?.maPhong;
      if (roomId) {
        localStorage.setItem("activeRoomId", String(roomId));
      }
      onClose();
      if (onNavigate) {
        onNavigate("chat");
      }
    } catch (error: any) {
      console.error("Lỗi tạo phòng chat:", error);
      alert(error.response?.data?.message || "Không thể tạo phòng chat với nhân viên này");
    } finally {
      setChatLoading(false);
    }
  };

  const fields = emp ? [
    ["Mã NV", emp.manv],
    ["Email", emp.email],
    ["SĐT", emp.sdt || "—"],
    ["Ngày sinh", formatDate(emp.ngaysinh)],
    ["Giới tính", formatGender(emp.gioitinh)],
    ["Địa chỉ", emp.diachinhan],
    ["Phòng ban", emp.tenpb],
    ["Lương cơ bản", (emp.luong != null)
      ? `${Number(emp.luong).toLocaleString("vi-VN")} VNĐ` : "—"],
  ] : [];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={emp ? (emp.hoten || "Chi tiết nhân viên") : "Chi tiết nhân viên"}
      subtitle={emp ? `Mã NV: ${emp.manv}` : undefined}
      icon={<User size={18} />}
      size="sm"
      footer={
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          {emp && (
            <Btn variant="primary" onClick={handleStartChat} loading={chatLoading} icon={<MessageSquare size={14} />} style={{ flex: 1 }}>
              Nhắn tin
            </Btn>
          )}
          <Btn variant="secondary" onClick={onClose} disabled={chatLoading}>Đóng</Btn>
        </div>
      }
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}><Spinner size={28} /></div>
      ) : emp ? (
        <div>
          {/* Avatar header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#f8f8f8", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
            <Avatar name={emp.hoten} size="lg" />
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 6px" }}>{emp.hoten}</p>
              <Badge color={ROLE_COLORS[emp.chucvu] || "gray"}>{emp.chucvu}</Badge>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="drawer-section">
            <p className="drawer-section-title">Thông tin cá nhân</p>
            {fields.map(([label, value]) => (
              <div key={label as string} className="drawer-field">
                <span className="drawer-field-label">{label as string}</span>
                <span className="drawer-field-value">{(value as string) || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
};
