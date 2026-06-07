import React, { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";
import { getUserEmail } from "../../../utils/user";
import { 
  fetchProvinces, 
  fetchDistricts, 
  fetchWards, 
  formatFullAddress 
} from "../../../utils/vietnamAddresses";
import { Btn, FormField } from "../../../components/UI/index";
import Modal from "../../../components/UI/Modal";

export const normalizeDateInput = (value: any) => {
  if (!value) return "";
  const str = String(value);
  return str.includes("T") ? str.split("T")[0] : str;
};

export const pickProfileValue = (emp: any, keys: string[]) => {
  for (const key of keys) {
    if (emp?.[key] != null && emp?.[key] !== "") return emp[key];
  }
  return "";
};

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  onUpdated: (updated: any) => void;
}

export const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ isOpen, onClose, user, profile, onUpdated }) => {
  const [form, setForm] = useState({
    EMAIL: "", HO_TEN: "", NGAY_SINH: "", GIOI_TINH: "", 
    tinh: "", quan: "", phuong: "", 
    tinhCode: "", quanCode: "", phuongCode: "",
    SDT: "", fullAddress: "", detail: "",
  });
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Khởi tạo form và fetch tỉnh thành
  useEffect(() => {
    if (!isOpen) return;
    const source = profile || user || {};
    const currentAddress = source.DIA_CHI;
    
    setForm({
      EMAIL: getUserEmail(source) || getUserEmail(user),
      HO_TEN: source.HO_TEN || "",
      NGAY_SINH: normalizeDateInput(source.NGAY_SINH),
      GIOI_TINH: source.GIOI_TINH || "",
      tinh: "", quan: "", phuong: "",
      tinhCode: "", quanCode: "", phuongCode: "",
      SDT: source.SDT || "",
      fullAddress: currentAddress || "",
      detail: "",
    });

    fetchProvinces().then(setProvinces);
  }, [isOpen]);

  // Fetch quận huyện khi chọn tỉnh
  useEffect(() => {
    if (form.tinhCode) {
      fetchDistricts(form.tinhCode).then(setDistricts);
      setForm(f => ({ ...f, quan: "", quanCode: "", phuong: "", phuongCode: "" }));
    } else {
      setDistricts([]);
    }
  }, [form.tinhCode]);

  // Fetch phường xã khi chọn huyện
  useEffect(() => {
    if (form.quanCode) {
      fetchWards(form.quanCode).then(setWards);
      setForm(f => ({ ...f, phuong: "", phuongCode: "" }));
    } else {
      setWards([]);
    }
  }, [form.quanCode]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const name = provinces.find(p => String(p.code) === code)?.name || "";
    setForm(f => ({ ...f, tinh: name, tinhCode: code }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const name = districts.find(d => String(d.code) === code)?.name || "";
    setForm(f => ({ ...f, quan: name, quanCode: code }));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const name = wards.find(w => String(w.code) === code)?.name || "";
    setForm(f => ({ ...f, phuong: name, phuongCode: code }));
  };

  const handleSubmit = async () => {
    if (!form.EMAIL) return toast.error("Không tìm thấy EMAIL của tài khoản hiện tại!");

    const payload: any = { EMAIL: form.EMAIL };
    if (form.HO_TEN.trim()) payload.HO_TEN = form.HO_TEN.trim();
    if (form.NGAY_SINH) payload.NGAY_SINH = form.NGAY_SINH;
    if (form.GIOI_TINH) payload.GIOI_TINH = form.GIOI_TINH;
    
    let finalAddress = form.fullAddress;
    if (form.tinh) {
      const selectedPart = formatFullAddress(form.tinh, form.quan, form.phuong);
      finalAddress = form.detail.trim() ? `${form.detail.trim()}, ${selectedPart}` : selectedPart;
    }
    if (finalAddress) payload.DIA_CHI = finalAddress;
    if (form.SDT.trim()) payload.SDT = form.SDT.trim();

    setLoading(true);
    try {
      const res = await api.updateProfile(payload);
      toast.success(res.data?.message || "Cập nhật profile thành công");
      onUpdated({
        HO_TEN: payload.HO_TEN,
        NGAY_SINH: payload.NGAY_SINH,
        GIOI_TINH: payload.GIOI_TINH,
        DIA_CHI: payload.DIA_CHI,
        SDT: payload.SDT,
      });
      onClose();
    } catch (err: any) {
      toast.apiError(err, "Cập nhật profile thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật thông tin nhân viên"
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
          <Btn loading={loading} onClick={handleSubmit}>Lưu thay đổi</Btn>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <FormField label="Email (không thể chỉnh sửa)">
            <input className="form-input" value={form.EMAIL} readOnly />
          </FormField>
        </div>
         <div style={{ gridColumn: "1 / -1" }}>
          <FormField label="Họ tên">
            <input className="form-input" placeholder="Nhập họ tên" value={form.HO_TEN} onChange={set("HO_TEN")} />
          </FormField>
        </div>
        <FormField label="Ngày sinh">
          <input className="form-input" type="date" value={form.NGAY_SINH} onChange={set("NGAY_SINH")} />
        </FormField>
        <FormField label="Giới tính">
          <select className="form-input" value={form.GIOI_TINH} onChange={set("GIOI_TINH")}>
            <option value="">-- Chọn giới tính --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </FormField>
        <div style={{ gridColumn: "1 / -1" }}>
          <FormField label="Số điện thoại">
             <input className="form-input" placeholder="Nhập số điện thoại" value={form.SDT} onChange={set("SDT")} />
          </FormField>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <p style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 600 }}>Địa chỉ hiện tại: <span style={{ color: "#333" }}>{form.fullAddress || "Chưa cập nhật"}</span></p>
        </div>

        <FormField label="Tỉnh/Thành phố">
          <select className="form-input" value={form.tinhCode} onChange={handleProvinceChange}>
            <option value="">-- Chọn tỉnh/thành phố --</option>
            {provinces.map((p: any) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </FormField>
        
        <FormField label="Quận/Huyện">
            <select className="form-input" value={form.quanCode} onChange={handleDistrictChange} disabled={!form.tinhCode}>
            <option value="">-- Chọn quận/huyện --</option>
            {districts.map((d: any) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Phường/Xã">
            <select className="form-input" value={form.phuongCode} onChange={handleWardChange} disabled={!form.quanCode}>
            <option value="">-- Chọn phường/xã --</option>
            {wards.map((w: any) => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
            </select>
        </FormField>

        <div style={{ gridColumn: "1 / -1" }}>
          <FormField label="Số nhà, tên đường">
              <input className="form-input" placeholder="Ví dụ: 123 Đường ABC..." value={form.detail} onChange={set("detail")} />
          </FormField>
        </div>
      </div>
    </Modal>
  );
};

