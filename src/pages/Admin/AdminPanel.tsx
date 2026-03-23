import React, { useState, useEffect } from "react";
import { AlertTriangle, Edit3, Trash2, Users, Building2, Plus, CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { Btn, Badge, Card, SkeletonRows, EmptyState, Avatar, FormField } from "../../components/UI/index";
import Modal from "../../components/UI/Modal";

interface AdminEditEmpModalProps {
  isOpen: boolean; onClose: () => void; editData: any; departments: any[]; onSuccess: () => void;
}
export const AdminEditEmpModal: React.FC<AdminEditEmpModalProps> = ({ isOpen, onClose, editData, departments, onSuccess }) => {
  const [form, setForm] = useState({ manv: "", hoten: "", maphg: "", luong: "", chucvu: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        manv:   editData.MANV  || editData.MaNV  || editData.manv  || "",
        hoten:  editData.HOTEN || editData.HoTen || editData.hoten || "",
        maphg:  editData.MAPHG || editData.MaPhg || editData.maphg || "",
        luong:  editData.LUONG || editData.LUONGCOBAN || editData.LuongCoBan || "",
        chucvu: editData.CHUCVU || editData.chucvu || "Nhân viên",
      });
    }
  }, [editData, isOpen]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.manv || !form.hoten) return toast.error("Mã NV và Họ tên không được trống!");
    setLoading(true);
    try {
      await api.adminUpdateEmployee({
         manv: form.manv, hoten: form.hoten,
        maphg: form.maphg ? Number(form.maphg) : undefined,
        luong: form.luong ? Number(form.luong) : undefined,
        chucvu: form.chucvu,
      });
      toast.success("Cập nhật nhân viên thành công!");
      onSuccess(); onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Lỗi cập nhật!");
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin – Chỉnh sửa nhân viên"
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit}>Lưu thay đổi</Btn></>}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Mã nhân viên">
           <input className="form-input" value={form.manv} readOnly />
        </FormField>
         <FormField label="Họ và tên *">
          <input className="form-input" placeholder="Nguyễn Văn A" value={form.hoten} onChange={set("hoten")} />
        </FormField>
         <FormField label="Chức vụ">
          <select className="form-input" value={form.chucvu} onChange={set("chucvu")}>
             <option>Cộng tác viên</option><option>Nhân viên</option><option>Quản lý</option><option>Admin</option>
          </select>
        </FormField>
        <FormField label="Phòng ban">
           <select className="form-input" value={form.maphg} onChange={set("maphg")}>
            <option value="">— Chưa chọn —</option>
            {departments.map((d: any) => (
               <option key={d.MAPHG || d.maphg} value={d.MAPHG || d.maphg}>{d.TENPB || d.tenpb}</option>
            ))}
          </select>
        </FormField>
        <div style={{ gridColumn: "1 / -1" }}>
           <FormField label="Lương cơ bản (VNĐ)">
            <input className="form-input" type="number" placeholder="5000000" value={form.luong} onChange={set("luong")} />
          </FormField>
        </div>
      </div>
    </Modal>
  );
};

interface AdminDeptModalProps {
  isOpen: boolean; onClose: () => void; editData: any; onSuccess: () => void;
}
export const AdminDeptModal: React.FC<AdminDeptModalProps> = ({ isOpen, onClose, editData, onSuccess }) => {
  const isEdit = !!editData;
  const [form, setForm] = useState({ tenpb: "", maphg: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(editData
      ? { tenpb: editData.TENPB || editData.tenpb || "", maphg: editData.MAPHG || editData.maphg || "" }
      : { tenpb: "", maphg: "" }
    );
  }, [editData, isOpen]);

  const handleSubmit = async () => {
    if (!form.tenpb.trim()) return toast.error("Tên phòng ban không được trống!");
    setLoading(true);
    try {
      if (isEdit) {
         await api.adminUpdateDepartment({ maphg: form.maphg, tenpb: form.tenpb });
        toast.success("Cập nhật phòng ban thành công!");
      } else {
        await api.adminCreateDepartment({ tenpb: form.tenpb });
        toast.success("Tạo phòng ban thành công!");
      }
      onSuccess(); onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Lỗi thao tác!");
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Admin – Sửa phòng ban" : "Admin – Tạo phòng ban mới"}
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit}>{isEdit ? "Lưu" : "Tạo mới"}</Btn></>}>
       <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Tên phòng ban *">
          <input className="form-input" placeholder="VD: Phòng Công nghệ" value={form.tenpb}
             onChange={(e) => setForm((f) => ({ ...f, tenpb: e.target.value }))} />
        </FormField>
        {isEdit && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 12, color: "#92400e" }}>
            <AlertTriangle size={14} />
             <span>Mã phòng ban: <strong>{form.maphg}</strong> — không thể thay đổi</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export const AdminEmployeeTab: React.FC<{ adminData: any }> = ({ adminData }) => {
  const { employees, departments, loading, modal, setModal, fetchEmployees, handleDeleteEmployee } = adminData;

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  const ROLE_COLORS: Record<string, string> = { "Quản lý": "black", "Nhân viên": "gray", "Cộng tác viên": "blue", "Admin": "purple" };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
         <p style={{ fontSize: 13, color: "#888" }}>{employees.length} nhân viên trong hệ thống</p>
      </div>
      <Card padding={false}>
         <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Mã NV</th><th>Họ tên</th><th>Chức vụ</th><th>Phòng ban</th><th>Lương</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={6} rows={8} />
              ) : employees.length === 0 ? (
                 <tr><td colSpan={6}><EmptyState icon={<Users size={40} />} title="Không có nhân viên" /></td></tr>
              ) : (
                employees.map((emp: any) => (
                  <tr key={emp.MANV || emp.MaNV}>
                     <td>
                      <span style={{ fontWeight: 600, fontSize: 11, background: "#f0f0f0", padding: "3px 8px", borderRadius: 5 }}>
                        {emp.MANV || emp.MaNV}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={emp.HOTEN || emp.HoTen} size="sm" />
                         <span style={{ fontWeight: 600 }}>{emp.HOTEN || emp.HoTen}</span>
                      </div>
                    </td>
                    <td><Badge color={ROLE_COLORS[emp.CHUCVU || emp.chucvu] || "gray"}>{emp.CHUCVU || emp.chucvu}</Badge></td>
                    <td style={{ color: "#666" }}>{emp.TENPB || emp.TenPB || "—"}</td>
                     <td style={{ fontSize: 12, color: "#555" }}>
                      {(emp.LUONG || emp.LUONGCOBAN)
                         ? `${Number(emp.LUONG || emp.LUONGCOBAN).toLocaleString("vi-VN")} đ`
                        : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                         <button onClick={() => setModal({ type: "editEmp", data: emp })}
                          style={{ fontSize: 12, color: "#666", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                           <Edit3 size={12} /> Sửa
                        </button>
                        <button onClick={() => handleDeleteEmployee(emp.MANV || emp.MaNV)}
                           style={{ fontSize: 12, color: "#f87171", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                          <Trash2 size={12} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <AdminEditEmpModal
        isOpen={modal.type === "editEmp"} onClose={() => setModal({ type: "", data: null })}
        editData={modal.data} departments={departments} onSuccess={fetchEmployees}
      />
    </>
  );
};

export const AdminDepartmentTab: React.FC<{ adminData: any }> = ({ adminData }) => {
  const { departments, loading, modal, setModal, fetchDepartments, handleDeleteDepartment } = adminData;

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: "#888" }}>{departments.length} phòng ban</p>
         <Btn size="sm" icon={<Plus size={14} />} onClick={() => setModal({ type: "addDept", data: null })}>Tạo phòng ban</Btn>
      </div>

       {loading ? (
        <Card padding={false}>
          <table className="data-table"><thead><tr><th>Mã PB</th><th>Tên phòng ban</th><th>Thao tác</th></tr></thead>
          <tbody><SkeletonRows cols={3} rows={5} /></tbody></table>
        </Card>
      ) : departments.length === 0 ? (
        <Card><EmptyState icon={<Building2 size={48} />} title="Chưa có phòng ban nào" /></Card>
      ) : (
         <Card padding={false}>
          <table className="data-table">
             <thead><tr><th>Mã PB</th><th>Tên phòng ban</th><th style={{ width: 140 }}>Thao tác</th></tr></thead>
            <tbody>
              {departments.map((dept: any) => (
                 <tr key={dept.MAPHG || dept.maphg}>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: 11, background: "#f0f0f0", padding: "3px 8px", borderRadius: 5 }}>
                      {dept.MAPHG || dept.maphg}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                       <div style={{ width: 32, height: 32, background: "#111", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Building2 size={14} color="#fff" />
                      </div>
                      <span style={{ fontWeight: 600 }}>{dept.TENPB || dept.tenpb}</span>
                    </div>
                  </td>
                   <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setModal({ type: "editDept", data: dept })}
                         style={{ fontSize: 12, color: "#666", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                        <Edit3 size={12} /> Sửa
                      </button>
                       <button onClick={() => handleDeleteDepartment(dept.MAPHG || dept.maphg, dept.TENPB || dept.tenpb)}
                        style={{ fontSize: 12, color: "#f87171", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                        <Trash2 size={12} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <AdminDeptModal
        isOpen={modal.type === "addDept" || modal.type === "editDept"}
         onClose={() => setModal({ type: "", data: null })}
        editData={modal.type === "editDept" ? modal.data : null}
         onSuccess={fetchDepartments}
      />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL: Duyệt hồ sơ onboarding
// ─────────────────────────────────────────────────────────────────────────────
interface AcceptOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: any;
  departments: any[];
  onAccept: (applicant: any, extra: { maphg: number; luong: number; chucvu: string }) => Promise<void>;
}

export const AcceptOnboardingModal: React.FC<AcceptOnboardingModalProps> = ({ isOpen, onClose, applicant, departments, onAccept }) => {
  const [form, setForm] = useState({ maphg: "", luong: "", chucvu: "Nhân viên" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isOpen) setForm({ maphg: "", luong: "", chucvu: "Nhân viên" }); }, [isOpen]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.maphg) return toast.error("Vui lòng chọn phòng ban!");
    if (!form.luong || Number(form.luong) <= 0) return toast.error("Vui lòng nhập mức lương hợp lệ!");
    setLoading(true);
    try {
      await onAccept(applicant, { maphg: Number(form.maphg), luong: Number(form.luong), chucvu: form.chucvu });
      onClose();
    } finally { setLoading(false); }
  };

  if (!isOpen || !applicant) return null;
  const name = applicant.HoTen || applicant.HOTEN || applicant.hoten || applicant.Email || applicant.EMAIL || applicant.email || "???";
  const email = applicant.Email || applicant.EMAIL || applicant.email || "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Duyệt hồ sơ ứng viên"
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit}>✓ Duyệt & Tạo tài khoản</Btn></>}>
      {/* Info ứng viên */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <UserCheck size={20} color="#fff" />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#111", margin: 0 }}>{name}</p>
          <p style={{ fontSize: 12, color: "#15803d", margin: 0 }}>{email}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Chức vụ">
          <select className="form-input" value={form.chucvu} onChange={set("chucvu")}>
            <option>Cộng tác viên</option><option>Nhân viên</option><option>Quản lý</option><option>Admin</option>
          </select>
        </FormField>
        <FormField label="Phòng ban *">
          <select className="form-input" value={form.maphg} onChange={set("maphg")}>
            <option value="">— Chọn phòng ban —</option>
            {departments.map((d: any) => (
              <option key={d.MAPHG || d.maphg} value={d.MAPHG || d.maphg}>{d.TENPB || d.tenpb}</option>
            ))}
          </select>
        </FormField>
        <div style={{ gridColumn: "1 / -1" }}>
          <FormField label="Lương cơ bản (VNĐ) *">
            <input className="form-input" type="number" placeholder="VD: 12000000" value={form.luong} onChange={set("luong")} />
          </FormField>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL: Từ chối hồ sơ onboarding
// ─────────────────────────────────────────────────────────────────────────────
interface RejectOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: any;
  onReject: (applicant: any, reason: string) => Promise<void>;
}

export const RejectOnboardingModal: React.FC<RejectOnboardingModalProps> = ({ isOpen, onClose, applicant, onReject }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isOpen) setReason(""); }, [isOpen]);

  const handleSubmit = async () => {
    if (!reason.trim()) return toast.error("Vui lòng nhập lý do từ chối!");
    setLoading(true);
    try {
      await onReject(applicant, reason.trim());
      onClose();
    } finally { setLoading(false); }
  };

  if (!isOpen || !applicant) return null;
  const name = applicant.HoTen || applicant.HOTEN || applicant.hoten || applicant.Email || applicant.EMAIL || applicant.email || "???";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Từ chối hồ sơ ứng viên"
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit} variant="danger">✕ Xác nhận từ chối</Btn></>}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, marginBottom: 16 }}>
        <XCircle size={18} color="#ef4444" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#991b1b" }}>Từ chối hồ sơ của <strong>{name}</strong></span>
      </div>
      <FormField label="Lý do từ chối *">
        <textarea
          className="form-input"
          placeholder="VD: Thiếu thông tin hồ sơ, không phù hợp vị trí..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          style={{ resize: "vertical", fontFamily: "inherit", fontSize: 14 }}
        />
      </FormField>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Onboarding — danh sách hồ sơ chờ admin duyệt
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  OTP_VERIFIED: { label: "Chờ duyệt", color: "blue" },
  PENDING_OTP:  { label: "Chưa xác thực OTP", color: "gray" },
  APPROVED:     { label: "Đã duyệt", color: "green" },
  REJECTED:     { label: "Đã từ chối", color: "red" },
  EXPIRED:      { label: "Hết hạn", color: "orange" },
};

export const AdminOnboardingTab: React.FC<{ adminData: any }> = ({ adminData }) => {
  const {
    pendingList, departments, onboardingLoading, modal, setModal,
    fetchPendingOnboarding, handleAcceptOnboarding, handleRejectOnboarding,
  } = adminData;

  useEffect(() => { fetchPendingOnboarding(); }, [fetchPendingOnboarding]);

  const pendingCount = pendingList.filter((a: any) =>
    (a.RegistrationStatus || a.STATUS || a.status || a.TRANGTHAI || a.trangthai) === "OTP_VERIFIED"
  ).length;

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            {pendingList.length} hồ sơ •{" "}
            <strong style={{ color: pendingCount > 0 ? "#d97706" : "#888" }}>
              {pendingCount} chờ duyệt
            </strong>
          </p>
          {pendingCount > 0 && (
            <span style={{
              background: "#fef3c7", color: "#92400e", fontSize: 11,
              fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <Clock size={11} /> Cần xử lý
            </span>
          )}
        </div>
        <Btn size="sm" onClick={fetchPendingOnboarding}>↻ Làm mới</Btn>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
                <th style={{ width: 160 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {onboardingLoading ? (
                <SkeletonRows cols={5} rows={5} />
              ) : pendingList.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<UserCheck size={40} />}
                      title="Không có hồ sơ nào đang chờ"
                    />
                  </td>
                </tr>
              ) : (
                pendingList.map((a: any, idx: number) => {
                  const status = a.RegistrationStatus || a.STATUS || a.status || a.TRANGTHAI || a.trangthai || "PENDING_OTP";
                  const name = a.HoTen || a.HOTEN || a.hoten || "—";
                  const email = a.Email || a.EMAIL || a.email || "—";
                  const createdAt = a.CreatedAt || a.NGAYDANGKY || a.NgayDangKy || a.createdAt || "";
                  const badgeCfg = STATUS_BADGE[status] || { label: status, color: "gray" };
                  const canAction = status === "OTP_VERIFIED";

                  return (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={name !== "—" ? name : email} size="sm" />
                          <span style={{ fontWeight: 600 }}>{name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: "#555" }}>{email}</td>
                      <td style={{ fontSize: 12, color: "#888" }}>
                        {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td><Badge color={badgeCfg.color}>{badgeCfg.label}</Badge></td>
                      <td>
                        {canAction ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => setModal({ type: "acceptOnboarding", data: a })}
                              style={{ fontSize: 12, color: "#16a34a", background: "none", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 600 }}
                            >
                              <CheckCircle size={12} /> Duyệt
                            </button>
                            <button
                              onClick={() => setModal({ type: "rejectOnboarding", data: a })}
                              style={{ fontSize: 12, color: "#dc2626", background: "none", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 600 }}
                            >
                              <XCircle size={12} /> Từ chối
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#bbb" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AcceptOnboardingModal
        isOpen={modal.type === "acceptOnboarding"}
        onClose={() => setModal({ type: "", data: null })}
        applicant={modal.data}
        departments={departments}
        onAccept={handleAcceptOnboarding}
      />
      <RejectOnboardingModal
        isOpen={modal.type === "rejectOnboarding"}
        onClose={() => setModal({ type: "", data: null })}
        applicant={modal.data}
        onReject={handleRejectOnboarding}
      />
    </>
  );
};
