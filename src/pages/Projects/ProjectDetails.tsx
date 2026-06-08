import React, { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  Plus,
  UserPlus,
  Trash2,
  Pencil,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { api } from "../../services/api";
import { toast, formatDate, checkOverdue } from "../../utils/helpers";
import { Btn, Badge, Card, Avatar, Spinner } from "../../components/UI/index";
import { STATUS_COLOR } from "./useProjects";
import ProjectTasks from "../../components/ProjectTasks";
import ProjectTimesheet from "../../components/ProjectTimesheet";
import Chat from "../Chat/Chat";
import { getDisplayRole, getUserLevel } from "../../utils/user";
import ProjectAnalysis from "../../components/ProjectAnalysis";

const normalizeRole = (role: string) =>
  String(role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();

const ProjectDetails = ({ user, onNavigate }: any) => {
  // Helper: lấy field hỗ trợ cả UPPERCASE, lowercase, và camelCase (bỏ qua case và underscore)

  const id = localStorage.getItem("selectedProjectId");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "timesheet" | "chat"
  >("overview");
  const [projectChatRoomId, setProjectChatRoomId] = useState<string>("");
  const [projectChatRoom, setProjectChatRoom] = useState<any>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [addMember, setAddMember] = useState({
    MA_NV: "",
    VAI_TRO_DU_AN: "Thành viên",
  });
  const [employees, setEmployees] = useState<any[]>([]);

  const userLevel = getUserLevel(user);
  const isAdmin = userLevel >= 3;

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getProject(id);
      setData(res.data?.data || res.data);
      try {
        const cRes = await api.getProjectChatRoom(id);
        const room = cRes.data?.data || cRes.data;
        const roomIdValue = room?.MA_PHONG || room?.MaPhong || room?.maPhong || room?.MAPHONG || room?.maphong || room?.id;
        if (roomIdValue) {
          setProjectChatRoomId(String(roomIdValue));
          setProjectChatRoom(room);
        }
      } catch (e) {}
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi lấy chi tiết dự án");
      if (onNavigate) onNavigate("projects");
    } finally {
      setLoading(false);
    }
  }, [id, onNavigate]);

  useEffect(() => {
    fetchDetail();
    if (isAdmin) {
      api.getEmployees().then((res) => setEmployees(res.data?.data || []));
    }
  }, [fetchDetail, isAdmin]);

  const handleAddMember = async () => {
    if (!addMember.MA_NV) return toast.error("Vui lòng chọn nhân viên!");
    setAddingMember(true);
    try {
      await api.addProjectMember(id, addMember);
      toast.success("Phân công nhân sự thành công!");
      setAddMember({ MA_NV: "", VAI_TRO_DU_AN: "Thành viên" });
      fetchDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi phân công!");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (employeeId: string) => {
    if (!window.confirm("Xác nhận gỡ nhân sự khỏi dự án?")) return;
    try {
      await api.removeProjectMember(id, employeeId);
      toast.success("Đã gỡ nhân sự!");
      fetchDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi gỡ nhân sự!");
    }
  };

  const handleProjectChat = async () => {
    if (!id) return;
    try {
      const res = await api.getProjectChatRoom(id);
      const room = res.data?.data || res.data;
      const roomIdValue = room?.MA_PHONG || room?.MaPhong || room?.maPhong || room?.MAPHONG || room?.maphong || room?.id;
      if (room && roomIdValue) {
        localStorage.setItem("pendingChatRoomId", String(roomIdValue));
        if (onNavigate) onNavigate("chat");
      } else {
        toast.error("Không tìm thấy phòng chat cho dự án này!");
      }
    } catch (err: any) {
      toast.error("Dự án này chưa có phòng chat hoặc lỗi kết nối!");
    }
  };

  if (loading)
    return (
      <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
        <Spinner size={32} />
      </div>
    );
  if (!data)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Dự án không tồn tại
      </div>
    );

  const project = data;
  const members = data?.THANH_VIEN || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => onNavigate && onNavigate("projects")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
              borderRadius: 8,
              backgroundColor: "#f1f5f9",
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {project.TEN_DA}
              {checkOverdue(project.NGAY_KET_THUC, project.TRANG_THAI) && (
                <Badge color="red">Quá hạn</Badge>
              )}
              <Badge color={STATUS_COLOR[project.TRANG_THAI] || "gray"}>
                {project.TRANG_THAI}
              </Badge>
            </h2>
            <p>Mã dự án: {project.MA_DA}</p>
          </div>
        </div>
        <div className="section-header-actions">
          <Btn
            variant="primary"
            icon={<MessageSquare size={16} />}
            onClick={handleProjectChat}
          >
            Chat nhóm dự án
          </Btn>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{ display: "flex", borderBottom: "1px solid #f1f5f9", gap: 24 }}
      >
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "12px 4px",
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: activeTab === "overview" ? "#111" : "#94a3b8",
            borderBottom: `3px solid ${activeTab === "overview" ? "#111" : "transparent"}`,
          }}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          style={{
            padding: "12px 4px",
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: activeTab === "tasks" ? "#111" : "#94a3b8",
            borderBottom: `3px solid ${activeTab === "tasks" ? "#111" : "transparent"}`,
          }}
        >
          Nhiệm vụ
        </button>

        <button
          onClick={() => setActiveTab("timesheet")}
          style={{
            padding: "12px 4px",
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: activeTab === "timesheet" ? "#111" : "#94a3b8",
            borderBottom: `3px solid ${activeTab === "timesheet" ? "#111" : "transparent"}`,
          }}
        >
          Timesheet
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          style={{
            padding: "12px 4px",
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: activeTab === "chat" ? "#111" : "#94a3b8",
            borderBottom: `3px solid ${activeTab === "chat" ? "#111" : "transparent"}`,
          }}
        >
          Tin nhắn
        </button>
      </div>

      {activeTab === "overview" ? (
        <div
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                Thông tin chung
              </h3>
              <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
                {project.MO_TA || "Không có mô tả."}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 32,
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#94a3b8",
                      marginBottom: 4,
                      fontWeight: 600,
                    }}
                  >
                    NGÀY BẮT ĐẦU
                  </p>
                  <p style={{ fontWeight: 600 }}>
                    {formatDate(project.NGAY_BAT_DAU)}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#94a3b8",
                      marginBottom: 4,
                      fontWeight: 600,
                    }}
                  >
                    NGÀY KẾT THÚC
                  </p>
                  <p style={{ fontWeight: 600 }}>
                    {formatDate(project.NGAY_KET_THUC)}
                  </p>
                </div>
              </div>
            </Card>
            <ProjectAnalysis projectId={id!} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                  Thành viên ({members.length})
                </h3>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {members.map((m: any) => (
                  <div
                    key={m.MA_NV}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <Avatar name={m.TENNV} size="md" />
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            margin: 0,
                            color: "#1e293b",
                          }}
                        >
                          {m.TENNV}
                        </p>
                        <p
                          style={{ fontSize: 12, color: "#64748b", margin: 0 }}
                        >
                          {m.VAI_TRO_DU_AN}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleRemoveMember(m.MA_NV)}
                        style={{
                          color: "#ef4444",
                          background: "#fee2e2",
                          border: "none",
                          cursor: "pointer",
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 12,
                      color: "#64748b",
                    }}
                  >
                    Thêm thành viên
                  </h4>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      className="form-input"
                      style={{ flex: 1 }}
                      value={addMember.MA_NV}
                      onChange={(e) =>
                        setAddMember((p) => ({ ...p, MA_NV: e.target.value }))
                      }
                    >
                      <option value="">-- Chọn NV --</option>
                      {employees.map((e) => (
                        <option
                          key={e.MA_NV || e.MA_NV || e.MA_NV}
                          value={e.MA_NV || e.MA_NV || e.MA_NV}
                        >
                          {e.HO_TEN || e.HO_TEN || e.HO_TEN}
                        </option>
                      ))}
                    </select>
                    <select
                      className="form-input"
                      style={{ width: 120 }}
                      value={addMember.VAI_TRO_DU_AN}
                      onChange={(e) =>
                        setAddMember((p) => ({
                          ...p,
                          VAI_TRO_DU_AN: e.target.value,
                        }))
                      }
                    >
                      <option>Quản lý</option>
                      <option>Thành viên</option>
                    </select>
                  </div>
                  <Btn
                    variant="primary"
                    style={{
                      marginTop: 12,
                      width: "100%",
                      justifyContent: "center",
                    }}
                    onClick={handleAddMember}
                    loading={addingMember}
                  >
                    Thêm vào dự án
                  </Btn>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : activeTab === "tasks" ? (
        <Card>
          <ProjectTasks
            projectId={project.MA_DA}
            members={members}
            isAdmin={isAdmin}
            currentUser={user}
          />
        </Card>
      ) : activeTab === "chat" ? (
        <div style={{ height: "calc(100vh - 250px)", background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
          {projectChatRoomId ? (
            <Chat user={user} embeddedRoomId={projectChatRoomId} embeddedRoom={projectChatRoom} />
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              Đang tải phòng chat hoặc dự án này chưa có phòng chat.
            </div>
          )}
        </div>
      ) : (
        <Card>
          <ProjectTimesheet projectId={project.MA_DA} user={user} />
        </Card>
      )}
    </div>
  );
};

export default ProjectDetails;
