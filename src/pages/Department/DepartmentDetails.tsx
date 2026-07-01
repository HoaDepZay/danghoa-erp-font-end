import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  UserPlus,
  Trash2,
  MessageSquare,
  ArrowLeft,
  Users,
  CalendarCheck
} from "lucide-react";
import { api } from "../../services/api";
import { toast, formatDate } from "../../utils/helpers";
import { Btn, Card, Avatar, Spinner } from "../../components/UI/index";
import Chat from "../Chat/Chat";
import LeaveManagement from "../Leave/LeaveManagement";
import { getUserLevel } from "../../utils/user";
import { DynamicIcon } from "../../components/ProjectIconPicker";
const DepartmentDetails = ({ user, onNavigate }: any) => {
  const deptId = localStorage.getItem("selectedDeptId");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"members" | "chat" | "leaves">("members");
  
  const [departmentChatRoomId, setDepartmentChatRoomId] = useState<string>("");
  const [addingMember, setAddingMember] = useState(false);
  const [addManv, setAddManv] = useState("");
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  const userLevel = getUserLevel(user);
  const isAdmin = userLevel >= 3;

  const fetchDetail = useCallback(async () => {
    if (!deptId) {
      if (onNavigate) onNavigate("departments");
      return;
    }
    setLoading(true);
    try {
      const r = await api.getDepartment(deptId);
      setData(r.data?.data ?? r.data);
      
      try {
        const cRes = await api.getDepartmentChatRoom(deptId);
        const room = cRes.data?.data || cRes.data;
        const roomIdValue = room?.MA_PHONG || room?.MaPhong || room?.maPhong || room?.id;
        if (roomIdValue) {
          setDepartmentChatRoomId(String(roomIdValue));
        }
      } catch (e) {
        console.error("No chat room found or error:", e);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi tải chi tiết phòng ban");
      if (onNavigate) onNavigate("departments");
    } finally {
      setLoading(false);
    }
  }, [deptId, onNavigate]);

  useEffect(() => {
    fetchDetail();
    if (isAdmin) {
      api.getEmployees({ pageSize: 1000 }).then(res => setAllEmployees(res.data?.data || []));
    }
  }, [fetchDetail, isAdmin]);

  const handleAddMember = async () => {
    if (!addManv) return toast.error("Vui lòng chọn nhân viên!");
    setAddingMember(true);
    try {
      await api.updateEmployee(addManv, { MA_PHG: deptId });
      toast.success("Thêm thành viên thành công!");
      setAddManv("");
      fetchDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi thêm thành viên!");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (MA_NV: string) => {
    if (!window.confirm("Xác nhận gỡ nhân viên này khỏi phòng ban?")) return;
    try {
      await api.updateEmployee(MA_NV, { MA_PHG: null });
      toast.success("Đã gỡ nhân viên!");
      fetchDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi gỡ thành viên!");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!data) return null;

  // Xử lý danh sách thành viên (API trả về data.employees)
  let members = (data.THANH_VIEN || data.employees || []).filter((m: any) => m.MA_NV);
  
  // Nếu API không trả về mảng nhân viên, tự động fallback lọc từ allEmployees
  if (members.length === 0 && allEmployees.length > 0) {
    members = allEmployees.filter((emp: any) => {
      const empDeptId = emp.MA_PHG || emp.maphong;
      return empDeptId && deptId && String(empDeptId).trim().toUpperCase() === String(deptId).trim().toUpperCase();
    });
  }
  
  const truongPhongEmp = members.find((emp: any) => 
    String(emp.MA_NV).trim().toUpperCase() === String(data.matruongphg || "").trim().toUpperCase()
  );
  const truongPhong = truongPhongEmp ? truongPhongEmp.HO_TEN : (data.tenTruongPhong || "Chưa có");

  const memberIds = new Set(members.map((m: any) => m.MA_NV));
  const availableEmployees = allEmployees.filter((e) => !memberIds.has(e.MA_NV));

  const myId = user?.userInfo?.MA_NV || user?.MA_NV || "";
  const isAuthorizedToViewLeaves = isAdmin || String(myId).trim().toUpperCase() === String(data.matruongphg || "").trim().toUpperCase();

  return (
    <div className="page-container fade-in">
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Btn
          className="icon-btn"
          onClick={() => {
            if (onNavigate) onNavigate("departments");
          }}
          style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", border: "1px solid #e2e8f0" }}
        >
          <ArrowLeft size={20} color="#64748b" />
        </Btn>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: data.COLOR ? `${data.COLOR}15` : "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DynamicIcon name={data.ICON || 'Building'} size={24} color={data.COLOR || "#4f46e5"} />
            </div>
            <div>
              <h1 className="page-title" style={{ margin: 0, fontSize: 24 }}>
                {data.TEN_PB}
              </h1>
              <div style={{ display: "flex", gap: 16, marginTop: 4, color: "#64748b", fontSize: 13 }}>
                <span>Mã phòng: {data.MA_PHG}</span>
                <span>•</span>
                <span>Trưởng phòng: <strong style={{ color: "#334155" }}>{truongPhong}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 32, borderBottom: "1px solid #e2e8f0", marginBottom: 24 }}>
        <Btn
          onClick={() => setActiveTab("members")}
          style={{
            padding: "0 4px 12px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "members" ? "2px solid #4f46e5" : "2px solid transparent",
            color: activeTab === "members" ? "#4f46e5" : "#64748b",
            fontWeight: activeTab === "members" ? 600 : 500,
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s"
          }}
        >
          <Users size={18} />
          Danh sách nhân sự
          <span style={{ 
            background: activeTab === "members" ? "#e0e7ff" : "#f1f5f9", 
            color: activeTab === "members" ? "#4f46e5" : "#64748b",
            padding: "2px 8px", 
            borderRadius: 12, 
            fontSize: 12 
          }}>
            {members.length}
          </span>
        </Btn>
        <Btn
          onClick={() => setActiveTab("chat")}
          style={{
            padding: "0 4px 12px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "chat" ? "2px solid #4f46e5" : "2px solid transparent",
            color: activeTab === "chat" ? "#4f46e5" : "#64748b",
            fontWeight: activeTab === "chat" ? 600 : 500,
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s"
          }}
        >
          <MessageSquare size={18} />
          Tin nhắn nhóm
        </Btn>
        {isAuthorizedToViewLeaves && (
          <Btn
            onClick={() => setActiveTab("leaves")}
            style={{
              padding: "0 4px 12px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "leaves" ? "2px solid #4f46e5" : "2px solid transparent",
              color: activeTab === "leaves" ? "#4f46e5" : "#64748b",
              fontWeight: activeTab === "leaves" ? 600 : 500,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s"
            }}
          >
            <CalendarCheck size={18} />
            Đơn xin nghỉ phép
          </Btn>
        )}
      </div>

      {/* CONTENT */}
      {activeTab === "members" && (
        <div style={{ display: "grid", gap: 24, gridTemplateColumns: isAdmin ? "2fr 1fr" : "1fr" }}>
          {/* Cột Danh sách NV */}
          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>
              Thành viên ({members.length} người)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {members.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "20px 0" }}>Chưa có thành viên nào</p>
              ) : (
                members.map((m: any) => (
                  <div key={m.MA_NV} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar name={m.HO_TEN} size={40} />
                      <div>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{m.HO_TEN}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {m.VAI_TRO || m.CHUC_VU || "Thành viên"} · {m.MA_NV}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <Btn
                        style={{ 
                          color: "#ef4444", 
                          background: "#fef2f2", 
                          border: "none", 
                          width: 32, 
                          height: 32, 
                          borderRadius: 8, 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                        onClick={() => handleRemoveMember(m.MA_NV)}
                        title="Gỡ khỏi phòng ban"
                      >
                        <Trash2 size={16} />
                      </Btn>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Cột Thêm NV */}
          {isAdmin && (
            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <UserPlus size={18} color="#4f46e5" />
                Thêm thành viên
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <select
                  className="form-input"
                  value={addManv}
                  onChange={(e) => setAddManv(e.target.value)}
                >
                  <option value="">— Chọn nhân viên —</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.MA_NV} value={emp.MA_NV}>
                      {emp.HO_TEN} ({emp.MA_NV})
                    </option>
                  ))}
                </select>
                <Btn loading={addingMember} onClick={handleAddMember} style={{ width: "100%" }}>
                  Thêm vào phòng
                </Btn>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "chat" && (
        <div style={{ height: "calc(100vh - 250px)", background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          {departmentChatRoomId ? (
            <Chat user={user} embeddedRoomId={departmentChatRoomId} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
              <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p>Phòng ban này chưa có phòng chat hoặc đang bị lỗi tải tin nhắn.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "leaves" && isAuthorizedToViewLeaves && (
        <div className="fade-in">
          <LeaveManagement user={user} deptId={deptId} isEmbedded={true} />
        </div>
      )}
    </div>
  );
};

export default DepartmentDetails;
