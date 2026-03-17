import { useState, useEffect } from "react";
import { UserCircle, Lock, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { api } from "../services/api";
import { toast, formatDate } from "../utils/helpers";
import { getManv } from "../utils/user";
import { Btn, Card, Avatar, Badge, FormField, Spinner } from "../components/UI/index";
import Modal from "../components/UI/Modal";

const ROLE_COLORS = { "Quản lý": "black", "Nhân viên": "gray", "Cộng tác viên": "blue", "Admin": "purple" };

// ── Change Password Modal ─────────────────────────────────────────────────────
const ChangePassModal = ({ isOpen, onClose, user }) => {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword) return toast.error("Vui lòng điền đầy đủ!");
    if (form.newPassword !== form.confirmPassword) return toast.error("Mật khẩu mới không khớp!");
    if (form.newPassword.length < 6) return toast.error("Mật khẩu phải ít nhất 6 ký tự!");
    setLoading(true);
    try {
      // Backend expects: { email, oldPassword, newPassword }
      const email = user?.EMAIL || user?.Email || user?.email;
      await api.changePassword({
        email,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Sai mật khẩu cũ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu"
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit}>Xác nhận</Btn></>}>
      <div className="space-y-4">
        <FormField label="Mật khẩu hiện tại">
          <input className="form-input" type="password" placeholder="••••••••" value={form.oldPassword} onChange={set("oldPassword")} />
        </FormField>
        <FormField label="Mật khẩu mới">
          <input className="form-input" type="password" placeholder="Ít nhất 6 ký tự" value={form.newPassword} onChange={set("newPassword")} />
        </FormField>
        <FormField label="Xác nhận mật khẩu mới">
          <input className="form-input" type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={set("confirmPassword")} />
        </FormField>
      </div>
    </Modal>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const ProfilePage = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState("");

  const manv = getManv(user);

  useEffect(() => {
    api.getEmployee(manv)
      .then((r) => setProfile(r.data?.employee || r.data))
      .catch(() => {
        // Fallback to user data from login
        setProfile(user);
      })
      .finally(() => setLoading(false));
  }, [manv, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={28} className="text-gray-400" />
      </div>
    );
  }

  const emp = profile || user;
  const name = emp?.HOTEN || emp?.HoTen || emp?.hoten || "Nhân viên";
  const chucvu = emp?.CHUCVU || emp?.chucvu || emp?.chuc_vu;

  const infoItems = [
    { icon: <UserCircle size={16} />, label: "Mã nhân viên", value: emp?.MANV || emp?.MaNV || emp?.ma_nv },
    { icon: <Mail size={16} />, label: "Email", value: emp?.EMAIL || emp?.Email },
    { icon: <Phone size={16} />, label: "Số điện thoại", value: emp?.SODIENTHOA || emp?.SoDienThoai },
    { icon: <Calendar size={16} />, label: "Ngày sinh", value: formatDate(emp?.NGAYSINH || emp?.NgaySinh) },
    { icon: <MapPin size={16} />, label: "Địa chỉ", value: emp?.DIACHI || emp?.DiaChi },
    { icon: <Shield size={16} />, label: "Phòng ban", value: emp?.TENPB || emp?.TenPB },
  ];

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      {/* Profile card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar name={name} size="xl" />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-800 text-gray-900">{name}</h2>
            <div className="mt-1.5 flex items-center gap-2 justify-center sm:justify-start">
              <Badge color={ROLE_COLORS[chucvu] || "gray"}>{chucvu}</Badge>
            </div>
            {(emp?.TENPB || emp?.TenPB) && (
              <p className="text-sm text-gray-400 mt-2">{emp?.TENPB || emp?.TenPB}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Btn size="sm" icon={<Lock size={14} />} variant="secondary"
              onClick={() => setModal("password")}>
              Đổi mật khẩu
            </Btn>
          </div>
        </div>
      </Card>

      {/* Info grid */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <UserCircle size={18} className="text-gray-400" />
          <h3 className="font-700 text-gray-900">Thông tin cá nhân</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {infoItems.map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <span className="text-gray-400 mt-0.5">{icon}</span>
              <div>
                <p className="text-xs text-gray-400 font-500">{label}</p>
                <p className="text-sm font-600 text-gray-900 mt-0.5">{value || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-gray-400" />
          <h3 className="font-700 text-gray-900">Bảo mật tài khoản</h3>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
          <div>
            <p className="font-600 text-sm">Mật khẩu đăng nhập</p>
            <p className="text-xs text-gray-400 mt-0.5">Cập nhật định kỳ để bảo vệ tài khoản</p>
          </div>
          <Btn size="sm" variant="secondary" onClick={() => setModal("password")}>
            Đổi mật khẩu
          </Btn>
        </div>
      </Card>

      <ChangePassModal
        isOpen={modal === "password"}
        onClose={() => setModal("")}
        user={user}
      />
    </div>
  );
};

export default ProfilePage;
