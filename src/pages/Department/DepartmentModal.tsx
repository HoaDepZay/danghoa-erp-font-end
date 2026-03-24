import React, { useState, useEffect, useCallback } from "react";
import { Building2, UserPlus, Trash2 } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { Btn, FormField, Avatar, Spinner } from "../../components/UI/index";
import Modal from "../../components/UI/Modal";
import { formatDate } from "../../utils/helpers";

// ─── Modal Tạo / Sửa phòng ban ───────────────────────────────────────────────
interface DeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  employees: any[];
  onSuccess: () => void;
}

export const DeptModal: React.FC<DeptModalProps> = ({
  isOpen,
  onClose,
  editData,
  employees,
  onSuccess,
}) => {
  const isEdit = !!editData;
  const [form, setForm] = useState({ tenpb: "", matruongphg: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(
      editData
        ? {
            tenpb: editData.TENPB || editData.TenPB || "",
            matruongphg: editData.MATRUONGPHG || editData.MaTruongPhg || "",
          }
        : { tenpb: "", matruongphg: "" }
    );
  }, [editData, isOpen]);

  const handleSubmit = async () => {
    if (!form.tenpb.trim()) return toast.error("Tên phòng ban không được trống");
    setLoading(true);
    try {
      const payload: any = {
        tenpb: form.tenpb.trim(),
        matruongphg: form.matruongphg || undefined,
      };
      if (isEdit) {
        await api.updateDepartment(editData.MAPHG || editData.MaPhg, payload);
        toast.success("Cập nhật phòng ban thành công!");
      } else {
        await api.createDepartment(payload);
        toast.success("Tạo phòng ban thành công!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Lỗi thao tác!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
          <Btn loading={loading} onClick={handleSubmit}>{isEdit ? "Lưu" : "Thêm"}</Btn>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FormField label="Tên phòng ban *">
          <input
            className="form-input"
            placeholder="VD: Phòng Kỹ thuật"
            value={form.tenpb}
            onChange={(e) => setForm((f) => ({ ...f, tenpb: e.target.value }))}
          />
        </FormField>
        <FormField label="Trưởng phòng">
          <select
            className="form-input"
            value={form.matruongphg}
            onChange={(e) => setForm((f) => ({ ...f, matruongphg: e.target.value }))}
          >
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

// ─── Modal Chi tiết phòng ban (có thêm/xóa thành viên) ────────────────────────
interface DeptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptId: string | number | null;
  allEmployees: any[];   // toàn bộ NV để chọn thêm
  isAdmin: boolean;
  onRefresh: () => void;
}

export const DeptDetailModal: React.FC<DeptDetailModalProps> = ({
  isOpen,
  onClose,
  deptId,
  allEmployees,
  isAdmin,
  onRefresh,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [addManv, setAddManv] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!deptId) return;
    setLoading(true);
    try {
      const r = await api.getDepartment(deptId);
      // Response: { success, data: { ...dept, nhanVien: [] } }
      setData(r.data?.data ?? r.data);
    } catch {
      toast.error("Không thể tải chi tiết phòng ban");
    } finally {
      setLoading(false);
    }
  }, [deptId]);

  useEffect(() => {
    if (isOpen) fetchDetail();
    else setData(null);
  }, [isOpen, fetchDetail]);

  // ── Thêm thành viên: chuyển NV vào phòng này ─────────────────────────────
  const handleAddMember = async () => {
    if (!addManv) return toast.error("Vui lòng chọn nhân viên!");
    setAddingMember(true);
    try {
      // PUT /api/employees/:manv  { maphg: deptId }
      await api.updateEmployee(addManv, { maphg: deptId });
      toast.success("Thêm thành viên thành công!");
      setAddManv("");
      fetchDetail();
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi thêm thành viên!");
    } finally {
      setAddingMember(false);
    }
  };

  // ── Xóa thành viên: bỏ NV khỏi phòng (maphg = null) ─────────────────────
  const handleRemoveMember = async (manv: string) => {
    if (!window.confirm("Xác nhận gỡ nhân viên này khỏi phòng ban?")) return;
    try {
      // PUT /api/employees/:manv  { maphg: null }
      await api.updateEmployee(manv, { maphg: null });
      toast.success("Đã gỡ nhân viên!");
      fetchDetail();
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi gỡ thành viên!");
    }
  };

  const members: any[] = data?.nhanVien || data?.NhanVien || [];
  const truongPhong = data?.TenTruongPhong || data?.TruongPhong;

  // Danh sách NV chưa thuộc phòng này (để chọn thêm)
  const memberIds = new Set(members.map((m: any) => m.MANV || m.MaNV));
  const availableEmployees = allEmployees.filter(
    (e) => !memberIds.has(e.MANV || e.MaNV)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết phòng ban"
      size="lg"
      footer={<Btn variant="secondary" onClick={onClose}>Đóng</Btn>}
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
          <Spinner size={28} />
        </div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ width: 52, height: 52, background: "#111", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{data.TENPB || data.TenPB}</p>
              <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>Mã: {data.MAPHG || data.MaPhg}</p>
              {(data.NG_THANHLAP || data.NgThanhLap) && (
                <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>
                  Thành lập: {formatDate(data.NG_THANHLAP || data.NgThanhLap)}
                </p>
              )}
            </div>
          </div>

          {/* ── Trưởng phòng ── */}
          {truongPhong && (
            <div>
              <p style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Trưởng phòng
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8f8f8", borderRadius: 12, padding: "10px 14px" }}>
                <Avatar name={truongPhong} size="sm" />
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{truongPhong}</span>
                  {data.MaTruongPhg && (
                    <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{data.MaTruongPhg}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Danh sách thành viên ── */}
          <div>
            <p style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Thành viên ({members.length} người)
            </p>

            {members.length === 0 ? (
              <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "16px 0" }}>
                Chưa có thành viên trong phòng ban
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                {members.map((nv: any) => {
                  const manv = nv.MANV || nv.MaNV;
                  const hoten = nv.HOTEN || nv.HoTen;
                  const chucvu = nv.CHUCVU || nv.ChucVu || nv.chucvu;
                  return (
                    <div
                      key={manv}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        background: "#f8f8f8",
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={hoten} size="sm" />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{hoten}</p>
                          <p style={{ fontSize: 11, color: "#999", margin: 0 }}>
                            {chucvu} · {manv}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveMember(manv)}
                          title="Gỡ khỏi phòng ban"
                          style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, transition: "background 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Thêm thành viên (chỉ admin) ── */}
          {isAdmin && (
            <div style={{ borderTop: "1px solid #ebebeb", paddingTop: 16 }}>
              <p style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Thêm thành viên vào phòng ban
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <select
                  className="form-input"
                  value={addManv}
                  onChange={(e) => setAddManv(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">— Chọn nhân viên —</option>
                  {availableEmployees.map((emp) => {
                    const id = emp.MANV || emp.MaNV;
                    const name = emp.HOTEN || emp.HoTen;
                    return (
                      <option key={id} value={id}>
                        {name} ({id})
                      </option>
                    );
                  })}
                </select>
                <Btn
                  loading={addingMember}
                  size="sm"
                  icon={<UserPlus size={14} />}
                  onClick={handleAddMember}
                >
                  Thêm
                </Btn>
              </div>
              {availableEmployees.length === 0 && (
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>
                  Tất cả nhân viên đã thuộc phòng ban này
                </p>
              )}
            </div>
          )}

        </div>
      ) : null}
    </Modal>
  );
};
