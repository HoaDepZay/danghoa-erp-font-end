import React, { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";
import { Btn, FormField, Drawer } from "../../../components/UI/index";
import { Users, User, CreditCard } from "lucide-react";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData: any;
  departments: any[];
  onSuccess: () => void;
}

const TABS = [
  { id: "info",  label: "Thông tin",   icon: <User size={14} /> },
  { id: "legal", label: "Pháp lý & Ngân hàng", icon: <CreditCard size={14} /> },
];

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, editData, departments, onSuccess }) => {
  const isEdit = !!editData;
  const [activeTab, setActiveTab] = useState("info");
  const [form, setForm] = useState({
    MA_NV: "", HO_TEN: "", EMAIL: "", SDT: "", DIA_CHI: "",
    GIOI_TINH: "Nam", NGAY_SINH: "", MA_PHG: "", LUONG: "", CHUC_VU: "Nhân viên", password: "",
  });
  const [legalForm, setLegalForm] = useState({
    maSoThue: "", soTaiKhoan: "", nganHang: "", soNguoiPhuThuoc: "0",
  });
  const [loading, setLoading]      = useState(false);
  const [savingLegal, setSavingLegal] = useState(false);

  useEffect(() => {
    setActiveTab("info");
    if (editData) {
      setForm({
        MA_NV: editData.MA_NV || "",
        HO_TEN: editData.HO_TEN || "",
        EMAIL: editData.EMAIL || "",
        SDT: editData.SDT || editData.SDT || "",
        DIA_CHI: editData.DIA_CHI || "",
        GIOI_TINH: editData.GIOI_TINH || "Nam",
        NGAY_SINH: editData.NGAY_SINH ? (editData.NGAY_SINH as string).split("T")[0] : "",
        MA_PHG: editData.MA_PHG || "",
        LUONG: editData.LUONG || "",
        CHUC_VU: editData.CHUC_VU || "Nhân viên",
        password: "",
      });
      setLegalForm({
        maSoThue: editData.maSoThue || "",
        soTaiKhoan: editData.soTaiKhoan || "",
        nganHang: editData.nganHang || "",
        soNguoiPhuThuoc: String(editData.soNguoiPhuThuoc ?? 0),
      });
    } else {
      setForm({ MA_NV: "", HO_TEN: "", EMAIL: "", SDT: "", DIA_CHI: "", GIOI_TINH: "Nam", NGAY_SINH: "", MA_PHG: "", LUONG: "", CHUC_VU: "Nhân viên", password: "" });
      setLegalForm({ maSoThue: "", soTaiKhoan: "", nganHang: "", soNguoiPhuThuoc: "0" });
    }
  }, [editData, isOpen]);

  const set      = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setLegal = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setLegalForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.HO_TEN) return toast.error("Họ tên không được trống");
    setLoading(true);
    try {
      const payload: any = {
        HO_TEN: form.HO_TEN, EMAIL: form.EMAIL, SDT: form.SDT,
        DIA_CHI: form.DIA_CHI, GIOI_TINH: form.GIOI_TINH,
        NGAY_SINH: form.NGAY_SINH || undefined,
        MA_PHG: form.MA_PHG ? Number(form.MA_PHG) : undefined,
        LUONG: form.LUONG ? Number(form.LUONG) : undefined,
        CHUC_VU: form.CHUC_VU,
      };
      if (isEdit) {
        await api.updateEmployee(form.MA_NV, payload);
        toast.success("Cập nhật nhân viên thành công!");
      } else {
        if (!form.MA_NV) return toast.error("Mã NV không được trống");
        await api.createEmployee({ ...payload, MA_NV: form.MA_NV, password: form.password || "123456" });
        toast.success("Thêm nhân viên thành công!");
      }
      onSuccess(); onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Lỗi thao tác!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLegal = async () => {
    if (!form.MA_NV) return toast.error("Không xác định được mã nhân viên");
    setSavingLegal(true);
    try {
      await api.updateEmployeeLegal({
        MA_NV: form.MA_NV,
        maSoThue: legalForm.maSoThue || undefined,
        soTaiKhoan: legalForm.soTaiKhoan || undefined,
        nganHang: legalForm.nganHang || undefined,
        soNguoiPhuThuoc: legalForm.soNguoiPhuThuoc !== "" ? Number(legalForm.soNguoiPhuThuoc) : undefined,
      });
      toast.success("Đã lưu thông tin pháp lý");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi lưu thông tin");
    } finally {
      setSavingLegal(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
      subtitle={isEdit ? `Mã NV: ${form.MA_NV}` : "Điền thông tin nhân viên mới"}
      icon={<Users size={18} />}
      size="md"
      footer={
        activeTab === "info"
          ? <><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit}>{isEdit ? "Lưu thay đổi" : "Thêm mới"}</Btn></>
          : <><Btn variant="secondary" onClick={onClose}>Đóng</Btn><Btn loading={savingLegal} onClick={handleSaveLegal}>Lưu thông tin pháp lý</Btn></>
      }
    >
      {/* Tab Navigation */}
      {isEdit && (
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #f1f5f9", marginBottom: 18 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 14px", fontSize: 13, fontWeight: 600,
              background: "none", border: "none", cursor: "pointer",
              color: activeTab === tab.id ? "#1e293b" : "#94a3b8",
              borderBottom: `2.5px solid ${activeTab === tab.id ? "#0f172a" : "transparent"}`,
              transition: "all 0.2s",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "info" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!isEdit && (
            <FormField label="Mã nhân viên *">
              <input className="form-input" placeholder="VD: NV001" value={form.MA_NV} onChange={set("MA_NV")} />
            </FormField>
          )}
          <FormField label="Họ và tên *">
            <input className="form-input" placeholder="Nguyễn Văn A" value={form.HO_TEN} onChange={set("HO_TEN")} />
          </FormField>
          <FormField label="Email">
            <input className="form-input" type="EMAIL" placeholder="EMAIL@huit.edu.vn" value={form.EMAIL} onChange={set("EMAIL")} />
          </FormField>
          <FormField label="Số điện thoại">
            <input className="form-input" placeholder="0901234567" value={form.SDT} onChange={set("SDT")} />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Ngày sinh">
              <input className="form-input" type="date" value={form.NGAY_SINH} onChange={set("NGAY_SINH")} />
            </FormField>
            <FormField label="Giới tính">
              <select className="form-input" value={form.GIOI_TINH} onChange={set("GIOI_TINH")}>
                <option>Nam</option><option>Nữ</option>
              </select>
            </FormField>
          </div>
          <FormField label="Phòng ban">
            <select className="form-input" value={form.MA_PHG} onChange={set("MA_PHG")}>
              <option value="">— Chưa chọn —</option>
              {departments.map((d) => (
                <option key={d.MA_PHG} value={d.MA_PHG}>{d.tenpb}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Chức vụ">
            <select className="form-input" value={form.CHUC_VU} onChange={set("CHUC_VU")}>
              <option>Cộng tác viên</option><option>Nhân viên</option><option>Quản lý</option>
            </select>
          </FormField>
          <FormField label="Lương cơ bản (VNĐ)">
            <input className="form-input" type="number" placeholder="5000000" value={form.LUONG} onChange={set("LUONG")} />
          </FormField>
          {!isEdit && (
            <FormField label="Mật khẩu mặc định">
              <input className="form-input" placeholder="Mặc định: 123456" value={form.password} onChange={set("password")} />
            </FormField>
          )}
          <FormField label="Địa chỉ">
            <input className="form-input" placeholder="Số nhà, đường, quận, TP" value={form.DIA_CHI} onChange={set("DIA_CHI")} />
          </FormField>
        </div>
      )}

      {activeTab === "legal" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, fontSize: 13, color: "#166534", border: "1px solid #dcfce7" }}>
            ℹ️ Thông tin này dùng cho mục đích tính thuế TNCN và chuyển khoản lương tự động.
          </div>
          <FormField label="Mã số thuế cá nhân (MST)">
            <input className="form-input" placeholder="VD: 1234567890" value={legalForm.maSoThue} onChange={setLegal("maSoThue")} />
          </FormField>
          <FormField label="Số tài khoản ngân hàng">
            <input className="form-input" placeholder="VD: 0123456789012" value={legalForm.soTaiKhoan} onChange={setLegal("soTaiKhoan")} />
          </FormField>
          <FormField label="Tên ngân hàng">
            <input className="form-input" placeholder="VD: Vietcombank, BIDV, MB Bank..." value={legalForm.nganHang} onChange={setLegal("nganHang")} />
          </FormField>
          <FormField label="Số người phụ thuộc (giảm trừ gia cảnh)">
            <input className="form-input" type="number" min="0" max="10" value={legalForm.soNguoiPhuThuoc} onChange={setLegal("soNguoiPhuThuoc")} />
          </FormField>
        </div>
      )}
    </Drawer>
  );
};
