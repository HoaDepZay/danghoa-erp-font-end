import React from "react";
import { ShieldCheck, UserCog, Building2, AlertTriangle, ClipboardList } from "lucide-react";
import { Card, SectionHeader } from "../../components/UI/index";
import { useAdmin } from "./useAdmin";
import { AdminEmployeeTab, AdminDepartmentTab, AdminOnboardingTab } from "./AdminPanel";
import { ImportModal } from "./ImportModal";

const TABS = [
  { id: "employees",   label: "Nhân viên",   icon: <UserCog size={15} /> },
  { id: "departments", label: "Phòng ban",   icon: <Building2 size={15} /> },
  { id: "onboarding",  label: "Onboarding",  icon: <ClipboardList size={15} /> },
];

export const Admin: React.FC<{ user: any }> = ({ user }) => {
  const adminData = useAdmin(user);
  const { activeTab, setActiveTab, userLevel, pendingList } = adminData;

  if (userLevel < 4) {
    return (
      <Card>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 14 }}>
          <div style={{ width: 60, height: 60, background: "#fef2f2", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={26} color="#ef4444" />
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontWeight: 700, color: "#111", marginBottom: 4 }}>Không có quyền truy cập</h3>
            <p style={{ fontSize: 13, color: "#aaa" }}>Trang này chỉ dành cho tài khoản Admin.</p>
          </div>
        </div>
      </Card>
    );
  }

  // Đếm hồ sơ chờ duyệt để hiển thị badge
  const pendingCount = (pendingList || []).filter((a: any) =>
    (a.STATUS || a.status || a.TRANGTHAI || a.trangthai) === "OTP_VERIFIED"
  ).length;

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Quản trị hệ thống"
        subtitle="Admin · Quản lý nhân viên, phòng ban và hồ sơ onboarding"
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#111", borderRadius: 10 }}>
            <ShieldCheck size={14} color="#fff" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Admin Panel</span>
          </div>
        }
      />

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f0f0f0", padding: 4, borderRadius: 12, width: "fit-content" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
              borderRadius: 9, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
              background: activeTab === tab.id ? "#fff" : "transparent",
              color: activeTab === tab.id ? "#111" : "#888",
              boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "background 0.15s, color 0.15s",
              position: "relative",
            }}>
            {tab.icon}{tab.label}
            {/* Badge đếm hồ sơ chờ duyệt trên tab Onboarding */}
            {tab.id === "onboarding" && pendingCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4,
                background: "#f59e0b", color: "#fff",
                fontSize: 10, fontWeight: 800, borderRadius: "50%",
                minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 4px",
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "employees"   && <AdminEmployeeTab adminData={adminData} />}
      {activeTab === "departments" && <AdminDepartmentTab adminData={adminData} />}
      {activeTab === "onboarding"  && <AdminOnboardingTab adminData={adminData} />}
      <ImportModal />
    </div>
  );
};

export default Admin;
