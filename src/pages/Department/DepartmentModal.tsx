import React, { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { Btn, FormField, Avatar, Spinner } from "../../components/UI/index";
import Modal from "../../components/UI/Modal";

interface DeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  employees: any[];
  onSuccess: () => void;
}

export const DeptModal: React.FC<DeptModalProps> = ({ isOpen, onClose, editData, employees, onSuccess }) => {
  const isEdit = !!editData;
  const [form, setForm] = useState({ TenPB: "", MaTruongPhg: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(editData
      ? { TenPB: editData.TENPB || editData.TenPB || "", MaTruongPhg: editData.MATRUONGPHG || editData.MaTruongPhg || "" }
      : { TenPB: "", MaTruongPhg: "" }
    );
  }, [editData, isOpen]);

  const handleSubmit = async () => {
    if (!form.TenPB.trim()) return toast.error("Tên phòng ban không được trống");
    setLoading(true);
    try {
      const payload: any = { TenPB: form.TenPB, MaTruongPhg: form.MaTruongPhg || undefined };
      if (isEdit) {
        await api.updateDepartment(editData.MAPHG || editData.MaPhg, payload);
        toast.success("Cập nhật phòng ban thành công!");
      } else {
        await api.createDepartment(payload);
        toast.success("Tạo phòng ban thành công!");
      }
      onSuccess(); onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Lỗi thao tác!");
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit}>{isEdit ? "Lưu" : "Thêm"}</Btn></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FormField label="Tên phòng ban *">
          <input className="form-input" placeholder="VD: Phòng Kỹ thuật" value={form.TenPB}
            onChange={(e) => setForm((f) => ({ ...f, TenPB: e.target.value }))} />
        </FormField>
        <FormField label="Trưởng phòng">
           <select className="form-input" value={form.MaTruongPhg}
            onChange={(e) => setForm((f) => ({ ...f, MaTruongPhg: e.target.value }))}>
            <option value="">— Chưa chọn —</option>
            {employees.map((emp) => (
              <option key={emp.MANV || emp.MaNV} value={emp.MANV || emp.MaNV}>
                {emp.HOTEN || emp.HoTen} ({emp.MANV || emp.MaNV})
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </Modal>
  );
};

interface DeptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptId: string | number | null;
}

export const DeptDetailModal: React.FC<DeptDetailModalProps> = ({ isOpen, onClose, deptId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && deptId) {
      setLoading(true);
      api.getDepartment(deptId)
        .then((r: any) => setData(r.data))
        .catch(() => toast.error("Không thể tải chi tiết phòng ban"))
        .finally(() => setLoading(false));
    } else {
       setData(null);
    }
  }, [isOpen, deptId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết phòng ban" size="md" footer={<Btn variant="secondary" onClick={onClose}>Đóng</Btn>}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><Spinner size={28} /></div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ width: 52, height: 52, background: "#111", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{data.TENPB || data.TenPB}</p>
              <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>Mã: {data.MAPHG || data.MaPhg}</p>
            </div>
          </div>
          {data.TruongPhong && (
            <div>
              <p style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Trưởng phòng</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8f8f8", borderRadius: 12, padding: "10px 14px" }}>
                <Avatar name={data.TruongPhong} size="sm" />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{data.TruongPhong}</span>
              </div>
            </div>
          )}
          {data.NhanVien && data.NhanVien.length > 0 && (
            <div>
              <p style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Nhân viên ({data.NhanVien.length} người)
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflowY: "auto" }}>
                {data.NhanVien.map((nv: any) => (
                  <div key={nv.MANV || nv.MaNV} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", borderRadius: 10, background: "#fafafa" }}>
                    <Avatar name={nv.HOTEN || nv.HoTen} size="sm" />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{nv.HOTEN || nv.HoTen}</p>
                      <p style={{ fontSize: 11, color: "#999", margin: 0 }}>{nv.CHUCVU || nv.chucvu}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

