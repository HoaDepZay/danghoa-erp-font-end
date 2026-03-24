import React from "react";
import { Avatar, Badge, Spinner } from "../../../components/UI/index";
import Modal from "../../../components/UI/Modal";
import { Btn } from "../../../components/UI/index";
import { formatDate } from "../../../utils/helpers";
import { ROLE_COLORS } from "../EmployeeList/useEmployees";
import { useEmployeeDetails } from "./useEmployeeDetails";

const GENDER_MAP: Record<number | string, string> = { 1: "Nam", 2: "Nữ", 3: "Khác" };
const formatGender = (val: number | string | null | undefined): string => {
  if (val == null || val === "") return "—";
  return GENDER_MAP[val] ?? String(val);
};

interface EmployeeDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
}

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ isOpen, onClose, employeeId }) => {
  const { data, loading } = useEmployeeDetails(employeeId);
  const emp = data?.employee || data;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết nhân viên" size="md" footer={<Btn variant="secondary" onClick={onClose}>Đóng</Btn>}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}><Spinner size={28} /></div>
      ) : emp ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0", marginBottom: 16 }}>
             <Avatar name={emp.HOTEN || emp.HoTen} size="lg" />
            <div>
              <p style={{ fontWeight: 700, fontSize: 16 }}>{emp.HOTEN || emp.HoTen}</p>
              <Badge color={ROLE_COLORS[emp.CHUCVU || emp.chucvu] || "gray"}>{emp.CHUCVU || emp.chucvu}</Badge>
            </div>
          </div>
          {[
            ["Mã NV", emp.MANV || emp.MaNV],
            ["Email", emp.EMAIL || emp.Email],
            ["SĐT", emp.SDT || emp.SODIENTHOA || emp.SoDienThoai || "—"],
            ["Ngày sinh", formatDate(emp.NGAYSINH || emp.NgaySinh)],
            ["Giới tính", formatGender(emp.GIOITINH ?? emp.GioiTinh)],
            ["Địa chỉ", emp.DIACHINHAN || emp.DIACHI || emp.DiaChi],
            ["Phòng ban", emp.TENPB || emp.TenPB],
            ["Lương cơ bản", (emp.LUONG != null || emp.LUONGCOBAN != null) ? `${Number(emp.LUONG ?? emp.LUONGCOBAN).toLocaleString("vi-VN")} VNĐ` : "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8f8f8", fontSize: 13 }}>
              <span style={{ color: "#888" }}>{label as string}</span>
               <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
            </div>
          ))}
        </div>
      ) : null}
    </Modal>
  );
};

