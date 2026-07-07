import React, { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  Plus,
  UserPlus,
  Trash2,
  Pencil,
  MessageSquare,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { api } from "../../services/api";
import { toast, formatDate, checkOverdue } from "../../utils/helpers";
import { Btn, Badge, Card, Avatar, Spinner, FormField, CustomSelect } from "../../components/UI/index";
import Modal from "../../components/UI/Modal";
import { STATUS_COLOR, STATUS_OPTIONS } from "./useProjects";
import ProjectTasks from "../../components/ProjectTasks";
// ProjectTimesheet removed: timesheet tab no longer shown
import Chat from "../Chat/Chat";
import { getDisplayRole, getUserLevel } from "../../utils/user";
import ProjectAnalysis from "../../components/ProjectAnalysis";
import { ProjectIconPicker, DynamicIcon } from "../../components/ProjectIconPicker";
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
    MA_VAI_TRO: 1,
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [projectRoles, setProjectRoles] = useState<any[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [addingRole, setAddingRole] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    TEN_DA: "",
    MO_TA: "",
    NGAY_BAT_DAU: "",
    NGAY_KET_THUC: "",
    ICON: "FolderKanban",
    COLOR: "#3b82f6",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const userLevel = getUserLevel(user);
  const myId = user?.userInfo?.MA_NV || user?.MA_NV || "";
  const isSystemAdmin = userLevel >= 3;

  const membersList = data?.THANH_VIEN || data?.thanhVien || [];
  const currentMember = membersList.find((m: any) => (m.MA_NV || m.MANV || m.MaNV) === myId);
  const currentProjectRole = currentMember?.VAI_TRO || currentMember?.VaiTro || currentMember?.VAI_TRO_DU_AN || currentMember?.VaiTroDuAn || "";
  const isProjectLead = normalizeRole(currentProjectRole) === normalizeRole("Trưởng dự án") || normalizeRole(currentProjectRole) === normalizeRole("Phó dự án") || normalizeRole(currentProjectRole) === normalizeRole("Quản lý");
  const canManageProject = isSystemAdmin || isProjectLead;
  const isMember = !!currentMember;
  const isPublic = data?.CONG_KHAI;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleChangeStatus = async (e: any) => {
    const newStatus = e.target.value;
    try {
      await api.updateProject(id, { ...data, TRANG_THAI: newStatus });
      toast.success("Cập nhật trạng thái thành công!");
      fetchDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  useEffect(() => {
    // Nếu là admin hệ thống, hoặc nếu data đã tải xong và phát hiện là quản lý dự án
    const currentProjectRole = data?.THANH_VIEN?.find(
      (m: any) => (m.MA_NV || m.MANV) === myId,
    )?.VAI_TRO || data?.THANH_VIEN?.find(
      (m: any) => (m.MA_NV || m.MANV) === myId,
    )?.VAI_TRO_DU_AN || "";
    const isProjManager =
      normalizeRole(currentProjectRole) === normalizeRole("Trưởng dự án") || normalizeRole(currentProjectRole) === normalizeRole("Phó dự án") || normalizeRole(currentProjectRole) === normalizeRole("Quản lý");

    if (isSystemAdmin || isProjManager) {
      if (employees.length === 0) {
        api.getEmployees({ pageSize: 1000 }).then((res) => setEmployees(res.data?.data || []));
      }
      if (projectRoles.length === 0) {
        api.getProjectRoles().then((res) => setProjectRoles(res.data?.data || []));
      }
    }
  }, [fetchDetail, isSystemAdmin, data, myId, employees.length, projectRoles.length]);

  const handleAddMember = async () => {
    if (!addMember.MA_NV) return toast.error("Vui lòng chọn nhân viên!");
    setAddingMember(true);
    try {
      await api.addProjectMember(id, { MA_NV: addMember.MA_NV, MA_VAI_TRO: addMember.MA_VAI_TRO });
      toast.success("Phân công nhân sự thành công!");
      setAddMember({ MA_NV: "", MA_VAI_TRO: 1 });
      fetchDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi phân công!");
    } finally {
      setAddingMember(false);
    }
  };

  const handleAddRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return toast.error("Vui lòng nhập tên vai trò!");
    setAddingRole(true);
    try {
      await api.createProjectRole(id, { TEN_VAI_TRO: newRoleName.trim() });
      toast.success("Thêm vai trò thành công!");
      const res = await api.getProjectRoles();
      setProjectRoles(res.data?.data || []);
      setShowRoleModal(false);
      setNewRoleName("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi thêm vai trò");
    } finally {
      setAddingRole(false);
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

  const handleOpenSettings = () => {
    setSettingsForm({
      TEN_DA: data?.TEN_DA || "",
      MO_TA: data?.MO_TA || "",
      NGAY_BAT_DAU: data?.NGAY_BAT_DAU ? new Date(data.NGAY_BAT_DAU).toISOString().split('T')[0] : "",
      NGAY_KET_THUC: data?.NGAY_KET_THUC ? new Date(data.NGAY_KET_THUC).toISOString().split('T')[0] : "",
      ICON: data?.ICON || "FolderKanban",
      COLOR: data?.COLOR || "#3b82f6",
    });
    setDeleteConfirmText("");
    setShowSettingsModal(true);
  };

  const handleUpdateProjectSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm.TEN_DA) return toast.error("Tên dự án không được để trống!");
    setIsUpdating(true);
    try {
      await api.updateProject(id, { ...data, ...settingsForm });
      toast.success("Cập nhật thông tin dự án thành công!");
      fetchDetail();
      setShowSettingsModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật dự án");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (deleteConfirmText !== data?.TEN_DA) {
      return toast.error("Vui lòng gõ đúng tên dự án để xác nhận xóa!");
    }
    setIsDeleting(true);
    try {
      await api.deleteProject(id);
      toast.success("Xóa dự án thành công!");
      setShowSettingsModal(false);
      if (onNavigate) onNavigate("projects");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi xóa dự án");
    } finally {
      setIsDeleting(false);
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
            <ArrowLeft size={18} color="#475569" />
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
              <div style={{ 
                width: 36, height: 36, borderRadius: 8, backgroundColor: `${project.COLOR || '#3b82f6'}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4
              }}>
                <DynamicIcon name={project.ICON} color={project.COLOR || '#3b82f6'} size={20} />
              </div>
              <span style={{ wordBreak: "break-word" }}>{project.TEN_DA}</span>
              {checkOverdue(project.NGAY_KET_THUC, project.TRANG_THAI) && (
                <Badge color="red">Quá hạn</Badge>
              )}
              <Badge color={STATUS_COLOR[project.TRANG_THAI] || "gray"}>
                {project.TRANG_THAI}
              </Badge>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                Mã dự án: {project.MA_DA}
              </p>
              {currentProjectRole && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 12, borderLeft: "1px solid #cbd5e1" }}>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>Vai trò của bạn:</span>
                  <Badge color={currentProjectRole.toLowerCase().includes("trưởng") || currentProjectRole.toLowerCase().includes("quản lý") ? "blue" : currentProjectRole.toLowerCase().includes("phó") ? "green" : "purple"}>
                    {currentProjectRole}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, display: "flex", gap: 12 }}>
          {(isMember || isSystemAdmin) && (
            <Btn
              variant="primary"
              icon={<MessageSquare size={16} />}
              onClick={handleProjectChat}
            >
              Chat nhóm
            </Btn>
          )}
          {isSystemAdmin && (
            <Btn
              variant="secondary"
              icon={<Settings size={16} />}
              onClick={handleOpenSettings}
            >
              Cài đặt
            </Btn>
          )}
        </div>
      </div>

      {/* Tabs - scrollable trên mobile */}
      <div style={{ overflowX: "auto", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
          {["overview", "tasks", ...(isMember || isSystemAdmin ? ["chat"] : [])].map((tab) => (
            <Btn
              key={tab}
              onClick={() => setActiveTab(tab as any)}
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
                { overview: "Tổng quan", tasks: "Giai đoạn", chat: "Tin nhắn" }[
                  tab
                ]
              }
            </Btn>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Thêm vai trò dự án mới"
      >
        <form onSubmit={handleAddRoleSubmit}>
          <FormField label="Tên vai trò mới">
            <input
              type="text"
              className="form-input"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Ví dụ: Tester, Hỗ trợ, BA..."
              autoFocus
            />
          </FormField>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Btn type="button" variant="secondary" onClick={() => setShowRoleModal(false)}>
              Hủy
            </Btn>
            <Btn type="submit" variant="primary" loading={addingRole}>
              Lưu vai trò
            </Btn>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Cài đặt Dự án"
      >
        <form onSubmit={handleUpdateProjectSettings} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormField label="Tên dự án *">
            <input
              type="text"
              className="form-input"
              value={settingsForm.TEN_DA}
              onChange={(e) => setSettingsForm({ ...settingsForm, TEN_DA: e.target.value })}
              required
            />
          </FormField>
          
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <FormField label="Ngày bắt đầu">
                <input
                  type="date"
                  className="form-input"
                  value={settingsForm.NGAY_BAT_DAU}
                  onChange={(e) => setSettingsForm({ ...settingsForm, NGAY_BAT_DAU: e.target.value })}
                />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Ngày kết thúc">
                <input
                  type="date"
                  className="form-input"
                  value={settingsForm.NGAY_KET_THUC}
                  onChange={(e) => setSettingsForm({ ...settingsForm, NGAY_KET_THUC: e.target.value })}
                />
              </FormField>
            </div>
          </div>

          <FormField label="Mô tả dự án">
            <textarea
              className="form-input"
              rows={3}
              value={settingsForm.MO_TA}
              onChange={(e) => setSettingsForm({ ...settingsForm, MO_TA: e.target.value })}
            />
          </FormField>

          <ProjectIconPicker 
            icon={settingsForm.ICON} 
            color={settingsForm.COLOR} 
            onIconChange={(icon) => setSettingsForm({ ...settingsForm, ICON: icon })}
            onColorChange={(color) => setSettingsForm({ ...settingsForm, COLOR: color })}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, paddingBottom: 20, borderBottom: "1px solid #f1f5f9" }}>
            <Btn type="button" variant="secondary" onClick={() => setShowSettingsModal(false)}>
              Hủy
            </Btn>
            <Btn type="submit" variant="primary" loading={isUpdating}>
              Lưu cập nhật
            </Btn>
          </div>
        </form>

        <div style={{ marginTop: 20, padding: 16, border: "1px solid #fee2e2", borderRadius: 8, backgroundColor: "#fef2f2" }}>
          <h4 style={{ color: "#ef4444", margin: "0 0 8px 0", fontSize: 15, fontWeight: 700 }}>Xóa dự án (Danger Zone)</h4>
          <p style={{ color: "#991b1b", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
            Hành động này sẽ xóa vĩnh viễn dự án cùng toàn bộ các giai đoạn, nhiệm vụ và phân công nhân sự liên quan. Dữ liệu không thể khôi phục.
            <br />Để xác nhận, vui lòng nhập đúng tên dự án: <strong style={{ color: "#7f1d1d" }}>{project.TEN_DA}</strong>
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, borderColor: "#fca5a5" }}
              placeholder={project.TEN_DA}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
            <Btn 
              variant="danger" 
              icon={<Trash2 size={16} />} 
              onClick={handleDeleteProject}
              loading={isDeleting}
              disabled={deleteConfirmText !== project.TEN_DA}
            >
              Xóa dự án
            </Btn>
          </div>
        </div>
      </Modal>

      {activeTab === "overview" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Tầng 1: Thông tin chung (Full width) */}
          <Card style={{ position: "relative", zIndex: 10 }}>
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
                gap: 24,
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <div style={{ minWidth: 120 }}>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>
                  NGÀY BẮT ĐẦU
                </p>
                <p style={{ fontWeight: 600, margin: 0, color: "#1e293b" }}>
                  {formatDate(project.NGAY_BAT_DAU)}
                </p>
              </div>
              <div style={{ minWidth: 120 }}>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>
                  NGÀY KẾT THÚC
                </p>
                <p style={{ fontWeight: 600, margin: 0, color: "#1e293b" }}>
                  {formatDate(project.NGAY_KET_THUC)}
                </p>
              </div>
              {canManageProject && (
                <div style={{ minWidth: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>
                    CẬP NHẬT TRẠNG THÁI
                  </p>
                  <CustomSelect
                    value={project.TRANG_THAI?.trim()}
                    onChange={handleChangeStatus}
                    options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Tầng 2: Biểu đồ (rộng) & Thành viên (hẹp) */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {/* Cột trái (Biểu đồ) */}
            <div style={{ flex: "2 1 500px", minWidth: 0 }}>
              <ProjectAnalysis projectId={id!} />
            </div>

            {/* Cột phải (Thành viên) */}
            <div style={{ flex: "1 1 300px", minWidth: 0 }}>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
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
                        border: "1px solid #f1f5f9"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar name={m.HO_TEN || m.EMAIL || m.MA_NV} size="md"  src={m?.HINH_DAI_DIEN} />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#1e293b" }}>
                            {m.HO_TEN || m.EMAIL || m.MA_NV}
                          </p>
                          <div style={{ marginTop: 6 }}>
                            <Badge color={(m.VAI_TRO || m.VaiTro || m.VAI_TRO_DU_AN)?.toLowerCase().includes("trưởng") ? "blue" : "purple"}>
                              {m.VAI_TRO || m.VaiTro || m.VAI_TRO_DU_AN || "Thành viên"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {canManageProject && (
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
                          title="Gỡ khỏi dự án"
                        >
                          <Trash2 size={14} />
                        </Btn>
                      )}
                    </div>
                  ))}
                </div>

                {canManageProject && (
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 20,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#475569" }}>
                      Thêm thành viên
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <CustomSelect
                        className="form-input"
                        value={addMember.MA_NV}
                        onChange={(e: any) =>
                          setAddMember((p) => ({ ...p, MA_NV: e.target.value }))
                        }
                        options={[
                          { label: "-- Chọn nhân viên --", value: "" },
                          ...employees.map((e) => ({
                            label: e.HO_TEN || e.EMAIL || e.MA_NV,
                            value: e.MA_NV,
                          })),
                        ]}
                      />
                      <div style={{ display: "flex", gap: 10 }}>
                        <CustomSelect
                          className="form-input"
                          value={addMember.MA_VAI_TRO}
                          onChange={(e: any) =>
                            setAddMember((p) => ({
                              ...p,
                              MA_VAI_TRO: Number(e.target.value),
                            }))
                          }
                          options={projectRoles.map((r) => ({
                            label: r.TEN_VAI_TRO,
                            value: r.MA_VAI_TRO,
                          }))}
                          style={{ flex: 1 }}
                        />
                        <Btn
                          onClick={() => setShowRoleModal(true)}
                          style={{ padding: "0 12px", background: "#f1f5f9", border: "1px solid #cbd5e1" }}
                          title="Thêm vai trò mới"
                        >
                          <Plus size={16} color="#475569" />
                        </Btn>
                      </div>
                    </div>
                    <Btn
                      variant="primary"
                      style={{
                        marginTop: 16,
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
        </div>
      ) : activeTab === "tasks" ? (
        <ProjectTasks
          projectId={project.MA_DA}
          members={members}
          isAdmin={canManageProject}
          currentUser={user}
          projectStatus={project.TRANG_THAI}
          projectStartDate={project.NGAY_BAT_DAU}
          projectEndDate={project.NGAY_KET_THUC}
          onNavigate={onNavigate}
        />
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
