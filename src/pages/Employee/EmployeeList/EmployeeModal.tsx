import React, { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";
import { Btn, FormField, Drawer } from "../../../components/UI/index";
import { Users } from "lucide-react";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData: any;
  departments: any[];
  onSuccess: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, editData, departments, onSuccess }) => {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    MaNV: "", HoTen: "", Email: "", SoDienThoai: "", DiaChi: "",
    GioiTinh: "Nam", NgaySinh: "", MaPhg: "", LuongCoBan: "", chucvu: "Nhân viên", Password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        MaNV: editData.MANV || editData.MaNV || "",
        HoTen: editData.HOTEN || editData.HoTen || "",
        Email: editData.EMAIL || editData.Email || "",
        SoDienThoai: editData.SODIENTHOA || editData.SoDienThoai || "",
        DiaChi: editData.DIACHINHAN || editData.DIACHI || editData.DiaChi || "",
        GioiTinh: editData.GIOITINH || editData.GioiTinh || "Nam",
        NgaySinh: editData.NGAYSINH ? (editData.NGAYSINH as string).split("T")[0] : "",
        MaPhg: editData.MAPHG || editData.MaPhg || "",
        LuongCoBan: editData.LUONG || editData.LUONGCOBAN || editData.LuongCoBan || "",
        chucvu: editData.CHUCVU || editData.chucvu || "Nhân viên",
        Password: "",
      });
    } else {
      setForm({ MaNV: "", HoTen: "", Email: "", SoDienThoai: "", DiaChi: "", GioiTinh: "Nam", NgaySinh: "", MaPhg: "", LuongCoBan: "", chucvu: "Nhân viên", Password: "" });
    }
  }, [editData, isOpen]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.HoTen) return toast.error("Họ tên không được trống");
    setLoading(true);
    try {
      const payload: any = {
        HoTen: form.HoTen, Email: form.Email, SoDienThoai: form.SoDienThoai,
        DiaChi: form.DiaChi, GioiTinh: form.GioiTinh,
        NgaySinh: form.NgaySinh || undefined,
        MaPhg: form.MaPhg ? Number(form.MaPhg) : undefined,
        LuongCoBan: form.LuongCoBan ? Number(form.LuongCoBan) : undefined,
        chucvu: form.chucvu,
      };
      if (isEdit) {
        await api.updateEmployee(form.MaNV, payload);
        toast.success("Cập nhật nhân viên thành công!");
      } else {
        if (!form.MaNV) return toast.error("Mã NV không được trống");
        await api.createEmployee({ ...payload, MaNV: form.MaNV, Password: form.Password || "123456" });
        toast.success("Thêm nhân viên thành công!");
      }
      onSuccess(); onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Lỗi thao tác!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
      subtitle={isEdit ? `Mã NV: ${form.MaNV}` : "Điền thông tin nhân viên mới"}
      icon={<Users size={18} />}
      size="md"
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit}>{isEdit ? "Lưu thay đổi" : "Thêm mới"}</Btn></>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {!isEdit && (
          <FormField label="Mã nhân viên *">
            <input className="form-input" placeholder="VD: NV001" value={form.MaNV} onChange={set("MaNV")} />
          </FormField>
        )}
        <FormField label="Họ và tên *">
          <input className="form-input" placeholder="Nguyễn Văn A" value={form.HoTen} onChange={set("HoTen")} />
        </FormField>
        <FormField label="Email">
          <input className="form-input" type="email" placeholder="email@huit.edu.vn" value={form.Email} onChange={set("Email")} />
        </FormField>
        <FormField label="Số điện thoại">
          <input className="form-input" placeholder="0901234567" value={form.SoDienThoai} onChange={set("SoDienThoai")} />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FormField label="Ngày sinh">
            <input className="form-input" type="date" value={form.NgaySinh} onChange={set("NgaySinh")} />
          </FormField>
          <FormField label="Giới tính">
            <select className="form-input" value={form.GioiTinh} onChange={set("GioiTinh")}>
              <option>Nam</option><option>Nữ</option>
            </select>
          </FormField>
        </div>
        <FormField label="Phòng ban">
          <select className="form-input" value={form.MaPhg} onChange={set("MaPhg")}>
            <option value="">— Chưa chọn —</option>
            {departments.map((d) => (
              <option key={d.MAPHG || d.MaPhg} value={d.MAPHG || d.MaPhg}>{d.TENPB || d.TenPB}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Chức vụ">
          <select className="form-input" value={form.chucvu} onChange={set("chucvu")}>
            <option>Cộng tác viên</option><option>Nhân viên</option><option>Quản lý</option>
          </select>
        </FormField>
        <FormField label="Lương cơ bản (VNĐ)">
          <input className="form-input" type="number" placeholder="5000000" value={form.LuongCoBan} onChange={set("LuongCoBan")} />
        </FormField>
        {!isEdit && (
          <FormField label="Mật khẩu mặc định">
            <input className="form-input" placeholder="Mặc định: 123456" value={form.Password} onChange={set("Password")} />
          </FormField>
        )}
        <FormField label="Địa chỉ">
          <input className="form-input" placeholder="Số nhà, đường, quận, TP" value={form.DiaChi} onChange={set("DiaChi")} />
        </FormField>
      </div>
    </Drawer>
  );
};

