import React, { useRef } from "react";
import { UserCircle, Lock, Mail, Phone, MapPin, Calendar, Shield, Camera } from "lucide-react";
import { formatDate, getProp } from "../../../utils/helpers";
import { Btn, Card, Avatar, Badge, Spinner } from "../../../components/UI/index";
import { useProfile } from "./useProfile";
import { ChangePassModal } from "./ChangePassModal";
import { UpdateProfileModal } from "./UpdateProfileModal";
import Modal from "../../../components/UI/Modal";
import { AlertCircle, FileText } from "lucide-react";
import { api } from "../../../services/api";

const ROLE_COLORS: Record<string, string> = {
  "Quản lý": "black",
  "Nhân viên": "gray",
  "Cộng tác viên": "blue",
  "Admin": "purple",
};

interface ProfileProps {
  user: any;
  onNavigate: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onNavigate }) => {
  const { profile, loading, modal, setModal, handleProfileUpdated, handleAvatarUpload, uploadingAvatar } = useProfile(user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNotice, setShowNotice] = React.useState(false);

  React.useEffect(() => {
    if (!loading && profile) {
      const emp = profile;
      // Chỉ kiểm tra 5 trường: Mã NV, EMAIL, SĐT, Ngày sinh, Địa chỉ
      const isMissing =
        !getProp(emp, 'MA_NV') ||
        !getProp(emp, 'EMAIL') ||
        !getProp(emp, 'SDT') ||
        !getProp(emp, 'NGAY_SINH') ||
        !getProp(emp, 'DIA_CHI');

      if (isMissing) {
        setShowNotice(true);
      }
    }
  }, [loading, profile]);

  const [contracts, setContracts] = React.useState<any[]>([]);
  React.useEffect(() => {
    const maNV = getProp(user, 'MA_NV') || getProp(user, 'ma_nv');
    if (maNV) {
      api.getContractByMaNV(maNV).then(res => setContracts(res.data?.data || [])).catch(e => console.error(e));
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
        <Spinner size={28} />
      </div>
    );
  }

  const emp = profile || user;
  const name = getProp(emp, 'HO_TEN') || getProp(emp, 'ten') || "Nhân viên";
  const CHUC_VU = getProp(emp, 'CHUC_VU') || getProp(emp, 'CHUC_VU') || getProp(emp, 'role');

  const infoItems = [
    { icon: <UserCircle size={15} />, label: "Mã nhân viên", value: getProp(emp, 'MA_NV') },
    { icon: <Mail size={15} />, label: "EMAIL", value: getProp(emp, 'EMAIL') },
    { icon: <Phone size={15} />, label: "Số điện thoại", value: getProp(emp, 'SDT') },
    { icon: <Calendar size={15} />, label: "Ngày sinh", value: formatDate(getProp(emp, 'NGAY_SINH')) },
    { icon: <MapPin size={15} />, label: "Địa chỉ", value: getProp(emp, 'DIA_CHI') || getProp(emp, 'DIA_CHI') },
  ];

  const workItems = [
    { label: "Phòng ban", value: getProp(emp, 'phongban') || getProp(emp, 'tenphongban') || getProp(emp, 'TEN_PB') || "Chưa cập nhật" },
    { label: "Vị trí", value: getProp(emp, 'CHUC_VU') || "Chưa cập nhật" },
    { label: "Trạng thái", value: getProp(emp, 'TRANG_THAI') === 1 || getProp(emp, 'TRANG_THAI') === "Đang làm việc" ? "Đang làm việc" : "Nghỉ việc" },
  ];

  const contractItems = [
    { label: "Phụ cấp", value: getProp(emp, 'phucap') != null ? parseInt(getProp(emp, 'phucap')).toLocaleString() + " VNĐ" : "Chưa cập nhật" },
    { label: "Phí BHXH (%)", value: getProp(emp, 'phibhxh') != null ? getProp(emp, 'phibhxh') + " %" : "Chưa cập nhật" },
    { label: "Số người phụ thuộc", value: getProp(emp, 'songuoiphuthuoc') != null ? getProp(emp, 'songuoiphuthuoc') : "0" },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Profile card */}
      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <div style={{ position: "relative", display: "inline-block" }}>
            <Avatar name={name} size="xl" src={getProp(emp, 'HINH_DAI_DIEN')} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "2px solid white",
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: uploadingAvatar ? "wait" : "pointer",
                padding: 0
              }}
            >
              {uploadingAvatar ? <Spinner size={14} color="#666" /> : <Camera size={14} color="#666" />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              accept="image/*" 
              onChange={handleAvatarUpload} 
            />
          </div>
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
             <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}>{name}</h2>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
               <Badge color={ROLE_COLORS[CHUC_VU] || "gray"}>{CHUC_VU}</Badge>
              {getProp(emp, 'TEN_PB') && (
                <span style={{ fontSize: 13, color: "#888" }}>{getProp(emp, 'TEN_PB')}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full-mobile">
            <Btn size="sm" icon={<Lock size={13} />} variant="secondary" onClick={() => setModal("password")}>Đổi mật khẩu</Btn>
            <Btn size="sm" onClick={() => setModal("profile")}>Cập nhật thông tin</Btn>
          </div>
        </div>
      </Card>

      <div className="grid-2">
        {/* Info grid */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <UserCircle size={16} color="#aaa" />
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Thông tin cá nhân</h3>
          </div>
          <div className="grid-1" style={{ gap: 10 }}>
            {infoItems.map(({ icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 10, background: "#fafafa", minWidth: 0 }}>
                <span style={{ color: "#bbb", marginTop: 1, flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#888", fontWeight: 600 }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: value ? "#111" : "#bbb", fontWeight: 500, wordBreak: "break-word" }}>
                    {value || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Work grid */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Shield size={16} color="#aaa" />
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Thông tin công việc</h3>
          </div>
          <div className="grid-1" style={{ gap: 10 }}>
            {workItems.map(({ label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 10, background: "#fafafa", minWidth: 0 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#888", fontWeight: 600 }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: value ? "#111" : "#bbb", fontWeight: 500, wordBreak: "break-word" }}>
                    {value || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ borderTop: "1px solid #eee", margin: "16px 0" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Lương & Hợp đồng</h3>
          </div>
          <div className="grid-1" style={{ gap: 10 }}>
            {contractItems.map(({ label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 10, background: "#fafafa", minWidth: 0 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#888", fontWeight: 600 }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: value ? "#111" : "#bbb", fontWeight: 500, wordBreak: "break-word" }}>
                    {value || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #eee", margin: "16px 0" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <FileText size={16} color="#aaa" />
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Danh sách Hợp đồng</h3>
          </div>
          {contracts.length === 0 ? (
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Chưa có hợp đồng nào được lưu.</p>
          ) : (
            <div className="grid-1" style={{ gap: 10 }}>
              {contracts.map(c => (
                <div key={c.MA_HD || Math.random()} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: 10, background: "#fafafa", border: "1px solid #f1f5f9" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111" }}>{c.LOAI_HOP_DONG}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                      {formatDate(c.TU_NGAY)} {c.DEN_NGAY ? `- ${formatDate(c.DEN_NGAY)}` : "- Vô thời hạn"}
                    </p>
                  </div>
                  {c.URL_CHI_TIET ? (
                    <Btn size="sm" variant="secondary" onClick={() => {
                      localStorage.setItem("selected_contract", JSON.stringify(c));
                      localStorage.setItem("contract_back_to", "profile");
                      onNavigate("contract_details");
                    }}>
                      Chi tiết
                    </Btn>
                  ) : (
                    <Btn size="sm" variant="secondary" onClick={() => {
                      localStorage.setItem("selected_contract", JSON.stringify(c));
                      localStorage.setItem("contract_back_to", "profile");
                      onNavigate("contract_details");
                    }}>
                      Chi tiết
                    </Btn>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Security */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
           <Lock size={16} color="#aaa" />
          <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Bảo mật tài khoản</h3>
        </div>
         <div className="flex items-center justify-between gap-3 p-4 rounded-sm bg-muted flex-wrap">
          <div>
            <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Mật khẩu đăng nhập</p>
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>Cập nhật định kỳ để bảo vệ tài khoản</p>
          </div>
           <Btn size="sm" variant="secondary" onClick={() => setModal("password")}>Đổi mật khẩu</Btn>
        </div>
      </Card>

       <Card>
         <div className="flex items-center justify-between gap-3 p-4 rounded-sm bg-muted flex-wrap">
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

