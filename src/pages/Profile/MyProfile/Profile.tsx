import React from "react";
import { UserCircle, Lock, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { formatDate } from "../../../utils/helpers";
import { Btn, Card, Avatar, Badge, Spinner } from "../../../components/UI/index";
import { useProfile } from "./useProfile";
import { ChangePassModal } from "./ChangePassModal";
import { UpdateProfileModal } from "./UpdateProfileModal";
import Modal from "../../../components/UI/Modal";
import { AlertCircle } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  "Quản lý": "black",
  "Nhân viên": "gray",
  "Cộng tác viên": "blue",
  "Admin": "purple",
};

interface ProfileProps {
  user: any;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const { profile, loading, modal, setModal, handleProfileUpdated } = useProfile(user);
  const [showNotice, setShowNotice] = React.useState(false);

  React.useEffect(() => {
    if (!loading && profile) {
      const emp = profile;
      // Chỉ kiểm tra 5 trường: Mã NV, Email, SĐT, Ngày sinh, Địa chỉ
      const isMissing =
        !(emp?.MANV   || emp?.MaNV  || emp?.manv  || emp?.ma_nv) ||
        !(emp?.EMAIL  || emp?.Email || emp?.email) ||
        !(emp?.SODIENTHOA || emp?.SODIENTHOAI || emp?.SoDienThoai || emp?.SDT || emp?.sdt) ||
        !(emp?.NGAYSINH   || emp?.NgaySinh    || emp?.ngaysinh) ||
        !(emp?.DIACHINHAN || emp?.DiaChiNhan  || emp?.DIACHI || emp?.DiaChi || emp?.diachi);

      if (isMissing) {
        setShowNotice(true);
      }
    }
  }, [loading, profile]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
        <Spinner size={28} />
      </div>
    );
  }

  const emp = profile || user;
  const name = emp?.HOTEN || emp?.HoTen || emp?.hoten || "Nhân viên";
  const chucvu = emp?.CHUCVU || emp?.chucvu || emp?.chuc_vu;

  const infoItems = [
    { icon: <UserCircle size={15} />, label: "Mã nhân viên", value: emp?.MANV || emp?.MaNV || emp?.ma_nv },
    { icon: <Mail size={15} />, label: "Email", value: emp?.EMAIL || emp?.Email || emp?.email },
    { icon: <Phone size={15} />, label: "Số điện thoại", value: emp?.SODIENTHOA || emp?.SODIENTHOAI || emp?.SoDienThoai || emp?.SDT },
    { icon: <Calendar size={15} />, label: "Ngày sinh", value: formatDate(emp?.NGAYSINH || emp?.NgaySinh) },
    { icon: <MapPin size={15} />, label: "Địa chỉ", value: emp?.DIACHINHAN || emp?.DiaChiNhan || emp?.DIACHI || emp?.DiaChi },
    { icon: <Shield size={15} />, label: "Phòng ban", value: emp?.TENPB || emp?.TenPB },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Profile card */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
           <Avatar name={name} size="xl" />
          <div style={{ flex: 1 }}>
             <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}>{name}</h2>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
               <Badge color={ROLE_COLORS[chucvu] || "gray"}>{chucvu}</Badge>
              {(emp?.TENPB || emp?.TenPB) && (
                <span style={{ fontSize: 13, color: "#888" }}>{emp?.TENPB || emp?.TenPB}</span>
              )}
            </div>
          </div>
          <Btn size="sm" icon={<Lock size={13} />} variant="secondary" onClick={() => setModal("password")}>Đổi mật khẩu</Btn>
          <Btn size="sm" onClick={() => setModal("profile")}>Cập nhật thông tin</Btn>
        </div>
      </Card>

      {/* Info grid */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <UserCircle size={16} color="#aaa" />
          <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Thông tin cá nhân</h3>
        </div>
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {infoItems.map(({ icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 10, background: "#fafafa" }}>
              <span style={{ color: "#bbb", marginTop: 1 }}>{icon}</span>
              <div>
                <p style={{ fontSize: 10, color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111", marginTop: 3 }}>{value || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
           <Lock size={16} color="#aaa" />
          <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Bảo mật tài khoản</h3>
        </div>
         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, background: "#f8f8f8" }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Mật khẩu đăng nhập</p>
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>Cập nhật định kỳ để bảo vệ tài khoản</p>
          </div>
           <Btn size="sm" variant="secondary" onClick={() => setModal("password")}>Đổi mật khẩu</Btn>
        </div>
      </Card>

       <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", borderRadius: 12, background: "#f8f8f8" }}>
          <div>
             <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Thông tin liên hệ</p>
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>Cập nhật họ tên, ngày sinh, giới tính, địa chỉ nhận và số điện thoại</p>
          </div>
          <Btn size="sm" onClick={() => setModal("profile")}>Cập nhật thông tin</Btn>
        </div>
      </Card>

      <ChangePassModal isOpen={modal === "password"} onClose={() => setModal("")} user={user} />
      <UpdateProfileModal isOpen={modal === "profile"} onClose={() => setModal("")} user={user} profile={emp} onUpdated={handleProfileUpdated} />

      {/* Thông báo cập nhật thông tin */}
      <Modal
        isOpen={showNotice}
        onClose={() => setShowNotice(false)}
        title="Thông tin chưa hoàn thiện"
        size="sm"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowNotice(false)}>Để sau</Btn>
            <Btn onClick={() => { setShowNotice(false); setModal("profile"); }}>Cập nhật ngay</Btn>
          </>
        }
      >
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
             <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertCircle size={28} color="#f97316" />
             </div>
          </div>
          <p style={{ fontWeight: 600, fontSize: 16, color: "#111", marginBottom: 8 }}>Hồ sơ của bạn chưa đầy đủ</p>
          <p style={{ color: "#666", fontSize: 13, lineHeight: 1.5 }}>Vui lòng cập nhật đầy đủ thông tin cá nhân để chúng tôi có thể phục vụ bạn tốt hơn.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;

