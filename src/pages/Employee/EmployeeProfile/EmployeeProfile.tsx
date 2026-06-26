import React, { useState } from "react";
import { ArrowLeft, Edit, MessageSquare, CalendarDays, FileText, Wallet, ShieldAlert, Building2, FolderKanban, Clock, Users } from "lucide-react";
import { useEmployeeDetails } from "../EmployeeDetails/useEmployeeDetails";
import { useEmployeeExtra } from "./useEmployeeExtra";
import { formatDate } from "../../../utils/helpers";
import { api } from "../../../services/api";
import { Btn, Card, Avatar, Badge, EmptyState } from "../../../components/UI/index";
import { getUserLevel } from "../../../utils/user";
import { toast } from "../../../utils/helpers";
const GENDER_MAP: Record<number | string, string> = { 1: "Nam", 2: "Nữ", 3: "Khác" };
const formatGender = (val: number | string | null | undefined): string => {
  if (val == null || val === "") return "—";
  return GENDER_MAP[val] ?? String(val);
};

const EmployeeProfile = ({ user, onNavigate }: { user: any; onNavigate: (page: string) => void }) => {
  const employeeId = localStorage.getItem("selectedEmployeeId");
  const { data, loading } = useEmployeeDetails(employeeId);
  const [activeTab, setActiveTab] = useState("personal");
  const [chatLoading, setChatLoading] = useState(false);
  const userLevel = getUserLevel(user);

  const { departmentInfo, projects, leaves, loadingExtra } = useEmployeeExtra(employeeId, activeTab, user, userLevel);

  const handleEditClick = () => {
    if (userLevel < 3) {
      toast.error("Bạn không có quyền chỉnh sửa");
      return;
    }
    toast.info("Chức năng chỉnh sửa tại trang chi tiết đang được phát triển. Vui lòng quay lại danh sách để sửa.");
  };

  const handleBack = () => {
    localStorage.removeItem("selectedEmployeeId");
    onNavigate("employees");
  };

  if (!employeeId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <ShieldAlert size={48} color="#ccc" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Không tìm thấy thông tin</h2>
        <Btn onClick={() => onNavigate("employees")} style={{ marginTop: 16 }}>Quay lại danh sách</Btn>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <div className="spinner" style={{ width: 40, height: 40, color: "var(--primary-color)" }}></div>
      </div>
    );
  }

  const emp = data?.employee || data;
  if (!emp) return null;

  const handleStartChat = async () => {
    if (!emp) return;
    setChatLoading(true);
    try {
      const res = await api.createDirectRoom({ targetMaNv: emp.MA_NV });
      const roomId = res.data?.data?.maPhong || res.data?.maPhong;
      if (roomId) localStorage.setItem("activeRoomId", String(roomId));
      onNavigate("chat");
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể tạo phòng chat với nhân viên này");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1440, margin: "0 auto", width: "100%", paddingBottom: 32 }}>
      <Btn variant="ghost" onClick={handleBack} icon={<ArrowLeft size={16} />} style={{ marginBottom: 16 }}>
        Quay lại danh sách
      </Btn>

      {/* Profile Header Card */}
      <Card padding={false} style={{ marginBottom: 24, overflow: "hidden" }}>
        <div style={{ 
          height: 192, 
          width: "100%", 
          background: "linear-gradient(to right, #2563eb, #3730a3)",
          position: "relative"
        }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 96, background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }}></div>
        </div>
        
        <div style={{ 
          padding: "0 32px 24px", 
          display: "flex", 
          flexWrap: "wrap",
          alignItems: "flex-end", 
          gap: 24, 
          marginTop: -48,
          position: "relative"
        }}>
          <div style={{ 
            width: 128, 
            height: 128, 
            borderRadius: 12, 
            border: "4px solid #fff", 
            backgroundColor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: "bold",
            color: "#94a3b8",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
          }}>
            {emp.HO_TEN?.charAt(0).toUpperCase()}
          </div>
          
          <div style={{ flex: 1, minWidth: 250, paddingTop: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "#1e293b" }}>{emp.HO_TEN}</h2>
              <Badge color="green">Đang làm việc</Badge>
            </div>
            <p style={{ color: "#64748b", marginTop: 4, fontSize: 15 }}>{emp.CHUC_VU} • {emp.TEN_PB}</p>
          </div>
          
          <div style={{ display: "flex", gap: 12, paddingTop: 48 }}>
            <Btn variant="secondary" icon={<Edit size={16} />} onClick={handleEditClick}>Chỉnh sửa</Btn>
            <Btn 
              onClick={handleStartChat} 
              loading={chatLoading} 
              icon={<MessageSquare size={16} />}
            >
              Nhắn tin
            </Btn>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div style={{ 
        display: "flex", 
        gap: 24, 
        borderBottom: "1px solid var(--border-light)", 
        marginBottom: 24,
        overflowX: "auto"
      }}>
        {[
          { id: "personal", label: "Thông tin cá nhân" },
          { id: "employment", label: "Công việc" },
          { id: "documents", label: "Tài liệu" },
          { id: "attendance", label: "Chấm công" },
          { id: "payroll", label: "Lương thưởng" }
        ].map(tab => (
          <Btn
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--primary-color)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--primary-color)" : "var(--text-muted)",
              padding: "0 4px 12px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s"
            }}
          >
            {tab.label}
          </Btn>
        ))}
      </div>

      {/* Tab Content Rendering */}
      {activeTab === "personal" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          
          {/* Main Info Section (Left/Center) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: "2 1 0%" }}>
            
            <Card>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Thông tin cơ bản</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px 32px" }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Mã nhân viên</label>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{emp.MA_NV}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Họ và tên</label>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{emp.HO_TEN}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Ngày sinh</label>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{formatDate(emp.NGAY_SINH)}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Giới tính</label>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{formatGender(emp.GIOI_TINH)}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>CCCD / CMND</label>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{emp.CCCD || "—"}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Phòng ban</label>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{emp.TEN_PB}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Chi tiết liên hệ</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 32px" }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Email công việc</label>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--primary-color)" }}>{emp.EMAIL}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Số điện thoại</label>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{emp.SDT || "—"}</p>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Địa chỉ thường trú</label>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{emp.DIA_CHI || "—"}</p>
                </div>
              </div>
            </Card>

          </div>

          {/* Sidebar (Right) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: "1 1 0%" }}>
            
            <Card>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 16 }}>Thông tin lương</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: "50%", 
                  backgroundColor: "var(--primary-light)", 
                  color: "var(--primary-color)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Wallet size={20} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Lương cơ bản</p>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "4px 0 0" }}>
                    {emp.LUONG ? `${Number(emp.LUONG).toLocaleString("vi-VN")} VNĐ` : "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Stats/Actions */}
            <Card>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 16 }}>Lối tắt</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Btn style={{ 
                  width: "100%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  padding: 12, 
                  borderRadius: 8, 
                  border: "1px solid var(--border-light)", 
                  background: "transparent",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }} onMouseOver={(e) => e.currentTarget.style.background = "var(--surface-dim)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <CalendarDays size={18} color="var(--text-muted)" />
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-dark)" }}>Lịch sử nghỉ phép</span>
                  </div>
                  <ArrowLeft size={16} color="#cbd5e1" style={{ transform: "rotate(180deg)" }} />
                </Btn>
                
                <Btn style={{ 
                  width: "100%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  padding: 12, 
                  borderRadius: 8, 
                  border: "1px solid var(--border-light)", 
                  background: "transparent",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }} onMouseOver={(e) => e.currentTarget.style.background = "var(--surface-dim)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <FileText size={18} color="var(--text-muted)" />
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-dark)" }}>Hợp đồng lao động</span>
                  </div>
                  <ArrowLeft size={16} color="#cbd5e1" style={{ transform: "rotate(180deg)" }} />
                </Btn>
              </div>
            </Card>

          </div>
        </div>
      ) : activeTab === "employment" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {loadingExtra ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div className="spinner" style={{ width: 32, height: 32, color: "var(--primary-color)" }}></div>
              <p style={{ marginTop: 16, color: "var(--text-muted)" }}>Đang tải thông tin công việc...</p>
            </div>
          ) : (
            <>
              {/* Department Info */}
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--primary-light)", color: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Phòng ban: {departmentInfo?.TEN_PB || departmentInfo?.TEN_PHG || emp.TEN_PB}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "4px 0 0" }}>
                      Trưởng phòng: {
                        departmentInfo?.nhanVien?.find((nv: any) => nv.MA_NV === departmentInfo.MA_TRUONG_PHG || nv.MA_NV === departmentInfo.MATRUONGPHG)?.HO_TEN 
                        || "Chưa có trưởng phòng"
                      }
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
                  {departmentInfo?.nhanVien?.map((nv: any) => (
                    <div key={nv.MA_NV} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, border: "1px solid var(--border-light)", borderRadius: 8 }}>
                      <Avatar name={nv.HO_TEN} size="md" />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{nv.HO_TEN}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{nv.CHUC_VU}</p>
                      </div>
                      {nv.MA_NV === employeeId && <Badge color="blue">Đang xem</Badge>}
                    </div>
                  ))}
                  {(!departmentInfo?.nhanVien || departmentInfo.nhanVien.length === 0) && (
                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Không có nhân sự nào cùng phòng.</p>
                  )}
                </div>
              </Card>

              {/* Projects */}
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FolderKanban size={20} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Dự án đang tham gia ({projects.length})</h3>
                </div>

                {projects.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {projects.map((proj: any) => (
                      <div key={proj.MA_DU_AN} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, border: "1px solid var(--border-light)", borderRadius: 8 }}>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{proj.TEN_DU_AN}</p>
                          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>Vai trò: {proj.VAI_TRO || "Thành viên"}</p>
                        </div>
                        <Badge color={proj.TRANG_THAI === "Đang thực hiện" ? "green" : proj.TRANG_THAI === "Tạm dừng" ? "yellow" : "gray"}>
                          {proj.TRANG_THAI}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Chưa tham gia dự án nào.</p>
                )}
              </Card>

              {/* Leaves */}
              {(userLevel >= 4 || user?.CHUC_VU === "Giám đốc" || user?.MA_NV === employeeId || user?.MA_NV === departmentInfo?.MA_TRUONG_PHG || user?.MA_NV === departmentInfo?.MATRUONGPHG) && (
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CalendarDays size={20} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Đơn xin nghỉ phép ({leaves.length})</h3>
                  </div>

                  {leaves.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {leaves.map((leave: any) => (
                        <div key={leave.MA_DON} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, border: "1px solid var(--border-light)", borderRadius: 8 }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                              Từ: {formatDate(leave.TU_NGAY)} - Đến: {formatDate(leave.DEN_NGAY)}
                            </p>
                            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>Lý do: {leave.LY_DO}</p>
                          </div>
                          <Badge color={
                            leave.TRANG_THAI_DUYET === "Đã duyệt" ? "green" 
                            : leave.TRANG_THAI_DUYET === "Từ chối" ? "red" 
                            : "yellow"
                          }>
                            {leave.TRANG_THAI_DUYET}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Chưa có đơn xin nghỉ nào.</p>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      ) : (
        <Card>
          <EmptyState 
            icon={<FileText size={48} color="#cbd5e1" />} 
            title="Đang cập nhật" 
            description="Thông tin trong tab này hiện chưa có dữ liệu hoặc đang trong quá trình phát triển." 
          />
        </Card>
      )}
    </div>
  );
};

export default EmployeeProfile;
