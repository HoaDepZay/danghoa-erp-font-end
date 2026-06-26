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
// ProjectTimesheet removed: timesheet tab no longer shown
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
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "chat">(
    "overview",
  );
  const [projectChatRoomId, setProjectChatRoomId] = useState<string>("");
  const [projectChatRoom, setProjectChatRoom] = useState<any>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [addMember, setAddMember] = useState({
    MA_NV: "",
    VAI_TRO_DU_AN: "Thành viên",
  });
  const [employees, setEmployees] = useState<any[]>([]);

  const userLevel = getUserLevel(user);
  const myId = user?.userInfo?.MA_NV || user?.MA_NV || "";
  // isAdmin được xác định ban đầu bởi level hệ thống. Ta sẽ kết hợp với quyền trong dự án khi render
  const isSystemAdmin = userLevel >= 3;

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getProject(id);
      setData(res.data?.data || res.data);
      try {
        const cRes = await api.getProjectChatRoom(id);
        const room = cRes.data?.data || cRes.data;
        const roomIdValue =
          room?.MA_PHONG ||
          room?.MaPhong ||
          room?.maPhong ||
          room?.MAPHONG ||
          room?.maphong ||
          room?.id;
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
  }, [fetchDetail]);

  useEffect(() => {
    // Nếu là admin hệ thống, hoặc nếu data đã tải xong và phát hiện là quản lý dự án
    const currentProjectRole = data?.THANH_VIEN?.find(
      (m: any) => (m.MA_NV || m.MANV) === myId,
    )?.VAI_TRO_DU_AN;
    const isProjManager =
      currentProjectRole === "Quản lý" || currentProjectRole === "Phó dự án";

    if (isSystemAdmin || isProjManager) {
      if (employees.length === 0) {
        api.getEmployees({ pageSize: 1000 }).then((res) => setEmployees(res.data?.data || []));
      }
    }
  }, [fetchDetail, isSystemAdmin, data, myId, employees.length]);

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
      const roomIdValue =
        room?.MA_PHONG ||
        room?.MaPhong ||
        room?.maPhong ||
        room?.MAPHONG ||
        room?.maphong ||
        room?.id;
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

  // Xác định quyền quản lý của user hiện tại trên dự án này
  const myProjectRole = members.find(
    (m: any) => (m.MA_NV || m.MANV) === myId,
  )?.VAI_TRO_DU_AN;
  const isProjectManager =
    myProjectRole === "Quản lý" || myProjectRole === "Phó dự án";
  const isAdmin = isSystemAdmin || isProjectManager;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
          }}
        >
          <Btn
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
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} />
          </Btn>
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                fontSize: "clamp(16px, 4vw, 22px)",
                margin: 0,
                marginBottom: 4,
              }}
            >
              <span style={{ wordBreak: "break-word" }}>{project.TEN_DA}</span>
              {checkOverdue(project.NGAY_KET_THUC, project.TRANG_THAI) && (
                <Badge color="red">Quá hạn</Badge>
              )}
              <Badge color={STATUS_COLOR[project.TRANG_THAI] || "gray"}>
                {project.TRANG_THAI}
              </Badge>
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              Mã dự án: {project.MA_DA}
            </p>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Btn
            variant="primary"
            icon={<MessageSquare size={16} />}
            onClick={handleProjectChat}
          >
            Chat nhóm
          </Btn>
        </div>
      </div>

      {/* Tabs - scrollable trên mobile */}
      <div style={{ overflowX: "auto", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
          {(["overview", "tasks", "chat"] as const).map((tab) => (
            <Btn
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                background: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                color: activeTab === tab ? "#111" : "#94a3b8",
                borderBottom: `3px solid ${activeTab === tab ? "#111" : "transparent"}`,
              }}
            >
              {
                { overview: "Tổng quan", tasks: "Nhiệm vụ", chat: "Tin nhắn" }[
                  tab
                ]
              }
            </Btn>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 24,
          }}
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
                  flexWrap: "wrap",
                  gap: 20,
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div style={{ minWidth: 120 }}>
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
                  <p style={{ fontWeight: 600, margin: 0 }}>
                    {formatDate(project.NGAY_BAT_DAU)}
                  </p>
                </div>
                <div style={{ minWidth: 120 }}>
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
                  <p style={{ fontWeight: 600, margin: 0 }}>
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
                      <Avatar name={m.HO_TEN || m.EMAIL || m.MA_NV} size="md" />
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            margin: 0,
                            color: "#1e293b",
                          }}
                        >
                          {m.HO_TEN || m.EMAIL || m.MA_NV}
                        </p>
                        <p
                          style={{ fontSize: 12, color: "#64748b", margin: 0 }}
                        >
                          {m.VAI_TRO_DU_AN}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Btn
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
                      </Btn>
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
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <select
                      className="form-input"
                      value={addMember.MA_NV}
                      onChange={(e) =>
                        setAddMember((p) => ({ ...p, MA_NV: e.target.value }))
                      }
                    >
                      <option value="">-- Chọn nhân viên --</option>
                      {employees.map((e) => (
                        <option key={e.MA_NV} value={e.MA_NV}>
                          {e.HO_TEN || e.EMAIL || e.MA_NV}
                        </option>
                      ))}
                    </select>
                    <select
                      className="form-input"
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
        <div
          style={{
            height: "calc(100vh - 250px)",
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #f1f5f9",
            overflow: "hidden",
          }}
        >
          {projectChatRoomId ? (
            <Chat
              user={user}
              embeddedRoomId={projectChatRoomId}
              embeddedRoom={projectChatRoom}
            />
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              Đang tải phòng chat hoặc dự án này chưa có phòng chat.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ProjectDetails;
