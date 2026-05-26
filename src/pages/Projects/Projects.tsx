import React, { useState, useEffect, useCallback } from "react";
import { FolderKanban, Plus, UserPlus, Trash2, Pencil, MessageSquare } from "lucide-react";
import { api } from "../../services/api";
import { toast, formatDate, checkOverdue } from "../../utils/helpers";
import {
  CREATE_PROJECT_INITIAL_FORM,
  buildCreateProjectModel,
} from "../../utils/projectModel";
import {
  Btn,
  Badge,
  Card,
  SectionHeader,
  EmptyState,
  Avatar,
  Spinner,
  FormField,
} from "../../components/UI/index";
import Modal from "../../components/UI/Modal";
import { Drawer } from "../../components/UI/index";
import { STATUS_COLOR, STATUS_OPTIONS, useProjects } from "./useProjects";
import { ProjectCard } from "./ProjectCard";
import ProjectTasks from "../../components/ProjectTasks";
import ProjectTimesheet from "../../components/ProjectTimesheet";

// ─── Tạo dự án ──────────────────────────────────────────────────────────────
const CreateProjectModal: React.FC<any> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ ...CREATE_PROJECT_INITIAL_FORM });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ ...CREATE_PROJECT_INITIAL_FORM });
  }, [isOpen]);

  const set = (k: string) => (e: any) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const payload = buildCreateProjectModel(form);
    if (!payload.tenda) return toast.error("Tên dự án không được trống");
    if (
      payload.ngaybatdau &&
      payload.ngayketthuc &&
      payload.ngaybatdau > payload.ngayketthuc
    ) {
      return toast.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
    }
    setLoading(true);
    try {
      await api.createProject(payload);
      toast.success("Tạo dự án thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tạo dự án!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo dự án mới"
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>
            Hủy
          </Btn>
          <Btn loading={loading} onClick={handleSubmit}>
            Tạo dự án
          </Btn>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Tên dự án *">
          <input
            className="form-input"
            placeholder="Tên dự án..."
            value={form.tenda}
            onChange={set("tenda")}
          />
        </FormField>
        <FormField label="Mô tả">
          <textarea
            className="form-input"
            rows={3}
            placeholder="Mô tả dự án..."
            value={form.mota}
            onChange={set("mota")}
            style={{ resize: "none" }}
          />
        </FormField>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <FormField label="Ngày bắt đầu">
            <input
              className="form-input"
              type="date"
              value={form.ngaybatdau}
              onChange={set("ngaybatdau")}
            />
          </FormField>
          <FormField label="Ngày kết thúc">
            <input
              className="form-input"
              type="date"
              value={form.ngayketthuc}
              onChange={set("ngayketthuc")}
            />
          </FormField>
        </div>
        <FormField label="Trạng thái">
          <select
            className="form-input"
            value={form.trangthai}
            onChange={set("trangthai")}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </FormField>
      </div>
    </Modal>
  );
};

// ─── Sửa dự án ──────────────────────────────────────────────────────────────
const EditProjectModal: React.FC<any> = ({
  isOpen,
  onClose,
  project,
  onSuccess,
}) => {
  const [form, setForm] = useState({ ...CREATE_PROJECT_INITIAL_FORM });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setForm({
        tenda: project.tenda || "",
        mota: project.mota || "",
        ngaybatdau: project.ngaybatdau ? project.ngaybatdau.slice(0, 10) : "",
        ngayketthuc: project.ngayketthuc ? project.ngayketthuc.slice(0, 10) : "",
        trangthai: project.trangthai || "Đang thực hiện",
      });
    }
  }, [isOpen, project]);

  const set = (k: string) => (e: any) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const payload = buildCreateProjectModel(form);
    if (!payload.tenda) return toast.error("Tên dự án không được trống");
    if (
      payload.ngaybatdau &&
      payload.ngayketthuc &&
      payload.ngaybatdau > payload.ngayketthuc
    ) {
      return toast.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
    }
    setLoading(true);
    try {
      const id = project.mada;
      await api.updateProject(id, payload);
      toast.success("Cập nhật dự án thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật dự án!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa dự án"
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>
            Hủy
          </Btn>
          <Btn loading={loading} onClick={handleSubmit}>
            Lưu thay đổi
          </Btn>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Tên dự án *">
          <input
            className="form-input"
            placeholder="Tên dự án..."
            value={form.tenda}
            onChange={set("tenda")}
          />
        </FormField>
        <FormField label="Mô tả">
          <textarea
            className="form-input"
            rows={3}
            placeholder="Mô tả..."
            value={form.mota}
            onChange={set("mota")}
            style={{ resize: "none" }}
          />
        </FormField>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <FormField label="Ngày bắt đầu">
            <input
              className="form-input"
              type="date"
              value={form.ngaybatdau}
              onChange={set("ngaybatdau")}
            />
          </FormField>
          <FormField label="Ngày kết thúc">
            <input
              className="form-input"
              type="date"
              value={form.ngayketthuc}
              onChange={set("ngayketthuc")}
            />
          </FormField>
        </div>
        <FormField label="Trạng thái">
          <select
            className="form-input"
            value={form.trangthai}
            onChange={set("trangthai")}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </FormField>
      </div>
    </Modal>
  );
};

// ─── Chi tiết dự án ─────────────────────────────────────────────────────────
const ProjectDetailModal: React.FC<any> = ({
  isOpen,
  onClose,
  projectId,
  employees,
  isAdmin,
  onRefresh,
  onEdit,
  onDelete,
  onNavigate,
  user,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Thành viên để phân công
  const [addMember, setAddMember] = useState({ manv: "", vaitroduan: "Thành viên" });
  const [addingMember, setAddingMember] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const r = await api.getProject(projectId);
      setData(r.data?.data ?? r.data);
    } catch {
      toast.error("Không thể tải chi tiết dự án");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchDetail();
      setActiveTab("overview");
    } else {
      setData(null);
    }
  }, [isOpen, fetchDetail]);

  const handleAddMember = async () => {
    if (!addMember.manv) return toast.error("Vui lòng chọn nhân viên!");
    setAddingMember(true);
    try {
      await api.addProjectMember(projectId, addMember);
      toast.success("Phân công nhân sự thành công!");
      setAddMember({ manv: "", vaitroduan: "Thành viên" });
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
      await api.removeProjectMember(projectId, employeeId);
      toast.success("Đã gỡ nhân sự!");
      fetchDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi gỡ nhân sự!");
    }
  };

  const handleProjectChat = async () => {
    if (!projectId) return;
    try {
      const res = await api.getProjectChatRoom(projectId);
      const room = res.data?.data || res.data;
      const roomIdValue = room?.maPhong || room?.maphong || room?.id;
      if (room && roomIdValue) {
        localStorage.setItem("pendingChatRoomId", String(roomIdValue));
        if (onNavigate) {
          onNavigate("chat");
          onClose();
        }
      } else {
        toast.error("Không tìm thấy phòng chat cho dự án này!");
      }
    } catch (err: any) {
      toast.error("Dự án này chưa có phòng chat hoặc lỗi kết nối!");
    }
  };

  const project = data;
  const members = data?.thanhVien || data?.ThanhVien || data?.members || [];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={project ? (project.tenda || "Chi tiết dự án") : "Chi tiết dự án"}
      subtitle={project ? `Mã: ${project.mada}` : undefined}
      icon={<FolderKanban size={18} />}
      size="lg"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {project && (
              <Btn variant="primary" size="sm" icon={<MessageSquare size={13} />} onClick={handleProjectChat}>Chat nhóm</Btn>
            )}
            {isAdmin && project && activeTab === "overview" && (
              <>
                <Btn variant="secondary" size="sm" icon={<Pencil size={13} />} onClick={() => { onClose(); onEdit(project); }}>Sửa</Btn>
                <Btn variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => { onClose(); onDelete(project); }}>Xóa</Btn>
              </>
            )}
          </div>
          <Btn variant="secondary" onClick={onClose}>Đóng</Btn>
        </div>
      }
    >
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", gap: 24, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "8px 4px", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer",
            color: activeTab === "overview" ? "#111" : "#94a3b8",
            borderBottom: `2.5px solid ${activeTab === "overview" ? "#111" : "transparent"}`,
          }}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          style={{
            padding: "8px 4px", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer",
            color: activeTab === "tasks" ? "#111" : "#94a3b8",
            borderBottom: `2.5px solid ${activeTab === "tasks" ? "#111" : "transparent"}`,
          }}
        >
          Nhiệm vụ
        </button>
        <button
          onClick={() => setActiveTab("timesheet")}
          style={{
            padding: "8px 4px", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer",
            color: activeTab === "timesheet" ? "#111" : "#94a3b8",
            borderBottom: `2.5px solid ${activeTab === "timesheet" ? "#111" : "transparent"}`,
          }}
        >
          Timesheet
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner size={28} /></div>
      ) : project ? (
        activeTab === "overview" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#f8f8f8", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <h4 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{project.tenda}</h4>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {checkOverdue(project.ngayketthuc, project.trangthai) && (
                    <Badge color="red">Quá hạn</Badge>
                  )}
                  <Badge color={STATUS_COLOR[project.trangthai] || "gray"}>{project.trangthai}</Badge>
                </div>
              </div>
              {project.mota && <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{project.mota}</p>}
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#aaa" }}>
                <span>Bắt đầu: {formatDate(project.ngaybatdau)}</span>
                <span>Kết thúc: {formatDate(project.ngayketthuc)}</span>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 10 }}>Thành viên ({members.length})</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {members.map((m: any) => (
                  <div key={m.manv} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f8f8f8", borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={m.hoten} size="sm" />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{m.hoten}</p>
                        <p style={{ fontSize: 11, color: "#999", margin: 0 }}>{m.vaitroduan}</p>
                      </div>
                    </div>
                    {isAdmin && <button onClick={() => handleRemoveMember(m.manv)} style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8 }}><Trash2 size={13} /></button>}
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && (
              <div style={{ borderTop: "1px solid #ebebeb", paddingTop: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 10 }}>Phân công</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <select className="form-input" value={addMember.manv} onChange={(e) => setAddMember({ ...addMember, manv: e.target.value })}>
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map((emp: any) => (<option key={emp.manv} value={emp.manv}>{emp.hoten}</option>))}
                  </select>
                  <select className="form-input" value={addMember.vaitroduan} onChange={(e) => setAddMember({ ...addMember, vaitroduan: e.target.value })}>
                    <option>Thành viên</option><option>Trưởng dự án</option><option>Backend Developer</option><option>Frontend Developer</option>
                  </select>
                </div>
                <Btn loading={addingMember} size="sm" icon={<UserPlus size={14} />} onClick={handleAddMember} style={{ width: "100%", marginTop: 10, justifyContent: "center" }}>Phân công</Btn>
              </div>
            )}
          </div>
        ) : activeTab === "tasks" ? (
          <ProjectTasks projectId={projectId} members={members} isAdmin={isAdmin} />
        ) : (
          <ProjectTimesheet projectId={projectId} user={user} />
        )
      ) : null}
    </Drawer>
  );
};

// ─── Trang chính ─────────────────────────────────────────────────────────────
export const Projects: React.FC<{ user: any; onNavigate: (page: string) => void }> = ({ user, onNavigate }) => {
  const { displayList, employees, loading, modal, setModal, viewMode, setViewMode, isAdmin, fetchProjects } = useProjects(user);

  const handleDelete = async (project: any) => {
    const id = project.mada;
    if (!window.confirm("Xác nhận xóa dự án?")) return;
    try {
      await api.deleteProject(id);
      toast.success("Đã xóa dự án!");
      fetchProjects();
    } catch {
      toast.error("Lỗi xóa dự án!");
    }
  };

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Dự án" subtitle={`${displayList.length} dự án`} actions={
        <>
          {isAdmin && (
            <div style={{ display: "flex", borderRadius: 10, border: "1.5px solid #e0e0e0", overflow: "hidden" }}>
              {["mine", "all"].map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: viewMode === mode ? "#111" : "#fff", color: viewMode === mode ? "#fff" : "#666" }}>
                  {mode === "mine" ? "Của tôi" : "Tất cả"}
                </button>
              ))}
            </div>
          )}
          {isAdmin && <Btn size="sm" icon={<Plus size={14} />} onClick={() => setModal({ type: "create", data: null })}>Tạo dự án</Btn>}
        </>
      } />

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[1,2,3,4,5,6].map(i => (<div key={i} className="card"><div className="card-body"><span className="skeleton" style={{ height: 16, width: "70%", marginBottom: 10, display: "block" }} /></div></div>))}
        </div>
      ) : displayList.length === 0 ? (
        <Card><EmptyState icon={<FolderKanban size={48} />} title="Chưa có dự án" description={isAdmin ? "Tạo dự án đầu tiên" : "Chưa được phân công"} /></Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {displayList.map((project) => (
            <ProjectCard 
              key={project.mada} 
              project={project} 
              onClick={() => {
                localStorage.setItem("selectedProjectId", project.mada);
                onNavigate("project_details");
              }} 
            />
          ))}
        </div>
      )}

      <CreateProjectModal isOpen={modal.type === "create"} onClose={() => setModal({ type: "", data: null })} onSuccess={fetchProjects} />
      <EditProjectModal isOpen={modal.type === "edit"} onClose={() => setModal({ type: "", data: null })} project={modal.data} onSuccess={fetchProjects} />
    </div>
  );
};

export default Projects;
