import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, Clock, AlertCircle, Plus, Calendar, MoreVertical,
  Activity, CheckCircle, Layout, X, List, Kanban, CalendarDays, ArrowLeft, Users
} from "lucide-react";
import { api } from "../../services/api";
import { toast, formatDate, checkOverdue } from "../../utils/helpers";
import { Spinner, Btn, Badge, FormField, SharedCalendar, DatePicker, CustomSelect, Avatar } from "../../components/UI";
import { getUserLevel } from "../../utils/user";

const normalizeRole = (role: string) =>
  String(role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();


interface Task {
  maNvGd: number;
  MA_GD: number;
  MA_NV: string;
  tenNguoiThucHien: string;
  TEN_NHIEM_VU: string;
  MO_TA: string;
  NGAY_BAT_DAU: string;
  NGAY_KET_THUC: string;
  DO_UU_TIEN: string;
  TRANG_THAI: string;
  PHAN_TRAM_HOAN_THANH: number;
}

const PhaseDetails = ({ user, onNavigate }: any) => {
  const myId = user?.userInfo?.MA_NV || user?.MA_NV;
  const phaseId = localStorage.getItem("selectedPhaseId");
  const projectId = localStorage.getItem("selectedProjectId");

  const [phase, setPhase] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [phaseMembers, setPhaseMembers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<any>(null);
  const [view, setView] = useState<"list" | "kanban" | "calendar">("list");
  
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ maNv: "", vaiTro: "Nhân viên" });

  const [form, setForm] = useState({
    maNv: "",
    tenNhiemVu: "",
    moTa: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    doUuTien: "Trung bình",
    trangThai: "Mới",
    phanTramHoanThanh: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [phaseId, projectId]);

  const fetchInitialData = async () => {
    if (!phaseId || !projectId) return;
    setLoading(true);
    try {
      const [phaseRes, projRes, tasksRes, assignRes] = await Promise.all([
        api.getPhase(phaseId),
        api.getProject(projectId),
        api.getTasksByPhase(phaseId),
        api.getPhaseAssignments(phaseId)
      ]);
      
      setPhase(phaseRes.data?.data);
      const projData = projRes.data?.data || projRes.data;
      setProject(projData);
      const projMembers = projData?.THANH_VIEN || [];
      setProjectMembers(projMembers);
      setTasks(tasksRes.data?.data || []);
      setPhaseMembers(assignRes.data?.data || []);
      
      const userLevel = getUserLevel(user);
      const myMember = projMembers.find((m: any) => String(m.MA_NV || m.MANV).trim().toLowerCase() === String(myId).trim().toLowerCase());
      const myProjectRole = myMember?.VAI_TRO_DU_AN || myMember?.VAI_TRO || "";
      const isProjectManager = 
        normalizeRole(myProjectRole) === normalizeRole("Trưởng dự án") || 
        normalizeRole(myProjectRole) === normalizeRole("Phó dự án") || 
        normalizeRole(myProjectRole) === normalizeRole("Quản lý");
      setIsAdmin(userLevel >= 3 || isProjectManager);
      
    } catch (err) {
      toast.error("Lỗi lấy thông tin giai đoạn");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.getTasksByPhase(phaseId!);
      setTasks(res.data?.data || []);
    } catch (err) {}
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.getPhaseAssignments(phaseId!);
      setPhaseMembers(res.data?.data || []);
    } catch (err) {}
  };

  const handleAddAssignment = async () => {
    if (!assignmentForm.maNv) return toast.error("Vui lòng chọn nhân viên");
    try {
      await api.addPhaseAssignment(phaseId!, assignmentForm);
      toast.success("Đã phân công");
      setShowAssignmentForm(false);
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi phân công");
    }
  };

  const handleRemoveAssignment = async (empId: string) => {
    if(!window.confirm("Xóa nhân viên khỏi giai đoạn?")) return;
    try {
      await api.removePhaseAssignment(phaseId!, empId);
      toast.success("Đã xóa");
      fetchAssignments();
    } catch (err) {
      toast.error("Lỗi xóa nhân sự");
    }
  };

  const handleUpdatePhaseStatus = async (status: string) => {
    try {
      await api.updatePhase(phaseId!, { ...phase, trangThai: status, TRANG_THAI: status });
      setPhase({ ...phase, TRANG_THAI: status, trangThai: status });
      toast.success("Đã cập nhật trạng thái giai đoạn!");
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái!");
    }
  };

  const handleCreateTask = async () => {
    if (!form.maNv || !form.tenNhiemVu) return toast.error("Vui lòng điền đủ thông tin bắt buộc!");
    setSubmitting(true);
    try {
      await api.createTask(phaseId!, form);
      toast.success("Tạo nhiệm vụ thành công!");
      setShowAddForm(false);
      resetForm();
      fetchTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tạo nhiệm vụ!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskId: number, taskData: any) => {
    try {
      const payload = {
        TRANG_THAI: taskData.TRANG_THAI,
        PHAN_TRAM_HOAN_THANH: taskData.PHAN_TRAM_HOAN_THANH,
        MO_TA: taskData.MO_TA,
        MA_NV: taskData.MA_NV || taskData.maNv
      };
      await api.updateTask(taskId, payload);
      toast.success("Cập nhật nhiệm vụ thành công!");
      fetchTasks();
      setEditingTask(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật nhiệm vụ!");
    }
  };

  const handleQuickUpdate = async (task: any, status: string, progress: number) => {
    try {
      const taskId = task.MANVGD || task.maNvGd || task.MA_NV_GD;
      await api.updateTask(taskId, {
        trangThai: status,
        phanTramHoanThanh: progress,
        moTa: task.MO_TA
      });
      toast.success("Đã cập nhật trạng thái!");
      fetchTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái!");
    }
  };

  const resetForm = () => {
    setForm({
      maNv: "", tenNhiemVu: "", moTa: "", ngayBatDau: "", ngayKetThuc: "", doUuTien: "Trung bình", trangThai: "Mới", phanTramHoanThanh: 0,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "cao": case "high": return "red";
      case "trung bình": case "normal": case "medium": return "yellow";
      case "thấp": case "low": return "gray";
      default: return "gray";
    }
  };

  const getStatusColorHex = (status: string) => {
    switch (status?.toLowerCase()) {
      case "hoàn thành": case "đã duyệt": return "green";
      case "đang làm": return "blue";
      case "tạm dừng": return "red";
      default: return "gray";
    }
  };

  const getAssigneeName = (maNv: string) => {
    if (!maNv) return "";
    const member = projectMembers.find((m: any) => (m.MA_NV || m.MANV)?.toLowerCase() === maNv.toLowerCase());
    return member?.HO_TEN || member?.TEN_NV || member?.TENNV || maNv;
  };

  const getAssigneePhaseRole = (maNv: string) => {
    if (!maNv) return "";
    const member = phaseMembers.find((m: any) => String(m.MA_NV || m.MANV).toLowerCase() === String(maNv).toLowerCase());
    return member?.VAI_TRO || "Thành viên";
  };

  const KANBAN_COLUMNS = ["Mới", "Đang làm", "Hoàn thành", "Đã duyệt", "Tạm dừng"];
  const myPhaseRole = phaseMembers.find(m => String(m.MA_NV) === String(myId))?.VAI_TRO || "";
  const isPhaseManager = normalizeRole(myPhaseRole) === normalizeRole("Trưởng giai đoạn");
  const canManagePhase = isAdmin || isPhaseManager;

  const renderTaskCard = (task: any) => {
    const taskId = task.maNvGd || task.MA_NV_GD;
    const isOverdue = checkOverdue(task.NGAY_KET_THUC, task.TRANG_THAI);
    const isEditing = editingTask && (taskId === editingTask.maNvGd || taskId === editingTask.MA_NV_GD);
    const isAssignee = String(task.MA_NV).trim() === String(myId).trim();

    return (
      <div key={taskId} className="card" style={{ 
        position: "relative",
        zIndex: isEditing ? 50 : 1,
        padding: 16, 
        background: isOverdue ? "#fff1f2" : "#fff", 
        borderColor: isOverdue ? "#fecdd3" : "#e2e8f0",
        borderWidth: 1, borderStyle: "solid", display: "flex", flexDirection: "column", gap: 12
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <Badge color={getStatusColorHex(task.TRANG_THAI)}>{task.TRANG_THAI}</Badge>
              {isOverdue && <Badge color="red">Quá hạn</Badge>}
              <Badge color={getPriorityColor(task.DO_UU_TIEN)}>{task.DO_UU_TIEN}</Badge>
            </div>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: isOverdue ? "#9f1239" : "#1e293b" }}>{task.TEN_NHIEM_VU}</h4>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>{task.PHAN_TRAM_HOAN_THANH || 0}%</span>
            <div style={{ width: 80, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${task.PHAN_TRAM_HOAN_THANH || 0}%`, height: "100%", background: "#3b82f6" }} />
            </div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
          {task.MO_TA || <span style={{ fontStyle: "italic", color: "#94a3b8" }}>Không có mô tả chi tiết...</span>}
        </p>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", background: "#f8fafc", padding: "10px 14px", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#eff6ff", padding: "4px 12px 4px 4px", borderRadius: 20, border: "1px solid #bfdbfe" }}>
            <Avatar name={getAssigneeName(task.MA_NV || task.maNv) || "C"} size="sm" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 800, color: "#1e40af", fontSize: 13, lineHeight: 1.2 }}>
                {getAssigneeName(task.MA_NV || task.maNv) || "Chưa phân công"}
              </span>
              {(task.MA_NV || task.maNv) && (
                <span style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600 }}>
                  {getAssigneePhaseRole(task.MA_NV || task.maNv)}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569", fontWeight: 500 }}>
            <Calendar size={15} color="#64748b" /> 
            <span>{formatDate(task.NGAY_BAT_DAU)} <strong style={{ color: "#cbd5e1", margin: "0 6px" }}>→</strong> {formatDate(task.NGAY_KET_THUC)}</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, paddingTop: 12, borderTop: "1px dashed #e2e8f0" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {(canManagePhase || isAssignee) && (task.TRANG_THAI === "Mới" || task.TRANG_THAI?.toLowerCase() === "new") && (
              <Btn size="sm" variant="secondary" onClick={() => handleQuickUpdate(task, "Đang làm", 10)} style={{ fontSize: 12, padding: "4px 12px" }}>Bắt đầu làm</Btn>
            )}
            {(canManagePhase || isAssignee) && (task.TRANG_THAI === "Đang làm") && (
              <Btn size="sm" variant="success" onClick={() => handleQuickUpdate(task, "Hoàn thành", 100)} style={{ fontSize: 12, padding: "4px 12px" }}>Hoàn tất</Btn>
            )}
            {canManagePhase && (task.TRANG_THAI === "Hoàn thành") && (
              <Btn size="sm" variant="primary" onClick={() => handleQuickUpdate(task, "Đã duyệt", 100)} style={{ fontSize: 12, padding: "4px 12px" }}><CheckCircle size={14}/> Duyệt Task</Btn>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {isEditing ? (
              <>
                <Btn size="sm" variant="primary" onClick={() => handleUpdateTask(taskId, editingTask)} style={{ fontSize: 12 }}>Lưu</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setEditingTask(null)} style={{ fontSize: 12, color: "#ef4444" }}>Hủy</Btn>
              </>
            ) : canManagePhase ? (
              <Btn size="sm" variant="ghost" onClick={() => setEditingTask({...task})} style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <MoreVertical size={14} /> Sửa
              </Btn>
            ) : null}
          </div>
        </div>

        {isEditing && (
          <div style={{ marginTop: 12, borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FormField label="Trạng thái">
                <CustomSelect 
                  className="form-input" 
                  value={editingTask.TRANG_THAI} 
                  onChange={(e: any) => setEditingTask({...editingTask, TRANG_THAI: e.target.value})}
                  options={["Mới", "Đang làm", "Hoàn thành", "Đã duyệt", "Tạm dừng", "Hủy"].map(s => ({ label: s, value: s }))}
                />
              </FormField>
              <FormField label="Hoàn thành (%)">
                <CustomSelect 
                  className="form-input" 
                  value={editingTask.PHAN_TRAM_HOAN_THANH} 
                  onChange={(e: any) => setEditingTask({...editingTask, PHAN_TRAM_HOAN_THANH: parseInt(e.target.value)})}
                  options={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => ({ label: `${val}%`, value: val }))}
                  disabled={editingTask.TRANG_THAI === 'Đã duyệt'}
                />
              </FormField>
              <div style={{ gridColumn: "span 2" }}>
                <FormField label="Ghi chú/Mô tả tiến độ mới">
                  <textarea 
                    className="form-input" 
                    rows={2} 
                    value={editingTask.MO_TA} 
                    onChange={(e) => setEditingTask({...editingTask, MO_TA: e.target.value})} 
                    style={{ resize: "none" }} 
                  />
                </FormField>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const calendarEvents = tasks.map((t) => ({
    id: String(t.maNvGd || t.MA_NV_GD),
    title: t.TEN_NHIEM_VU,
    start: t.NGAY_BAT_DAU,
    end: t.NGAY_KET_THUC,
    backgroundColor: getPriorityColor(t.DO_UU_TIEN) === "red" ? "#ef4444" : getPriorityColor(t.DO_UU_TIEN) === "yellow" ? "#f59e0b" : "#64748b",
    extendedProps: t
  }));

  if (loading) {
    return <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><Spinner size={32} /></div>;
  }
  
  if (!phase) {
     return <div style={{ padding: 40, textAlign: "center" }}>Giai đoạn không tồn tại.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Row 1: Back Button + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <button 
            onClick={() => onNavigate && onNavigate("project_details")} 
            style={{ 
              display: "flex", alignItems: "center", justifyContent: "center", 
              width: 32, height: 32, background: "#f8fafc", border: "1px solid #e2e8f0", 
              cursor: "pointer", borderRadius: 8, flexShrink: 0, transition: "all 0.2s" 
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            title="Quay lại danh sách giai đoạn"
          >
            <ArrowLeft size={16} color="#475569" />
          </button>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: 22, flexWrap: "wrap" }}>
            <span style={{ wordBreak: "break-word" }}>{phase.TEN_GD || phase.tenGd}</span>
            {canManagePhase ? (
              <CustomSelect 
                value={phase.TRANG_THAI || phase.trangThai} 
                onChange={(e: any) => handleUpdatePhaseStatus(e.target.value)}
                options={["Chưa bắt đầu", "Đang thực hiện", "Hoàn thành", "Tạm dừng", "Hủy"].map(s => ({ label: s, value: s }))}
                style={{ width: 160, fontSize: 13, padding: "2px 8px", minHeight: 28, borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontWeight: 600, color: getStatusColorHex(phase.TRANG_THAI || phase.trangThai) === 'green' ? '#15803d' : getStatusColorHex(phase.TRANG_THAI || phase.trangThai) === 'blue' ? '#1d4ed8' : getStatusColorHex(phase.TRANG_THAI || phase.trangThai) === 'red' ? '#b91c1c' : '#475569' }}
              />
            ) : (
              <Badge color={getStatusColorHex(phase.TRANG_THAI || phase.trangThai)}>{phase.TRANG_THAI || phase.trangThai}</Badge>
            )}
          </h2>
        </div>

        {/* Row 2: Subtitle & Members (indented to align with Title text) */}
        <div style={{ paddingLeft: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              Chi tiết các nhiệm vụ trong giai đoạn này
            </p>
            {myPhaseRole && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 12, borderLeft: "1px solid #cbd5e1" }}>
                <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>Vai trò của bạn:</span>
                <Badge color={myPhaseRole.toLowerCase().includes("trưởng") ? "blue" : "purple"}>
                  {myPhaseRole}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Hiển thị nhanh danh sách thành viên giai đoạn */}
          {phaseMembers.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Thành viên tham gia ({phaseMembers.length}):</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {phaseMembers.map(m => (
                  <div key={m.MA_NV} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", padding: "6px 12px 6px 6px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
                    <Avatar name={m.HO_TEN || m.TEN_NV || m.MA_NV} size="sm" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.2, marginBottom: 4 }}>{m.HO_TEN || m.TEN_NV || m.MA_NV}</span>
                      <Badge color={m.VAI_TRO?.toLowerCase().includes("trưởng") ? "blue" : "purple"}>{m.VAI_TRO}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 4 }}>
          <button onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: view === "list" ? "#fff" : "transparent", color: view === "list" ? "#111" : "#64748b", boxShadow: view === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><List size={14}/> Danh sách</button>
          <button onClick={() => setView("kanban")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: view === "kanban" ? "#fff" : "transparent", color: view === "kanban" ? "#111" : "#64748b", boxShadow: view === "kanban" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><Kanban size={14}/> Kanban</button>
          <button onClick={() => setView("calendar")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: view === "calendar" ? "#fff" : "transparent", color: view === "calendar" ? "#111" : "#64748b", boxShadow: view === "calendar" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><CalendarDays size={14}/> Lịch</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canManagePhase && (
            <Btn variant="secondary" icon={<Users size={14} />} onClick={() => setShowAssignmentForm(!showAssignmentForm)}>
              Nhân sự
            </Btn>
          )}
          {canManagePhase && !showAddForm && (
            <Btn variant="primary" icon={<Plus size={14} />} onClick={() => setShowAddForm(true)}>
              Giao nhiệm vụ
            </Btn>
          )}
        </div>
      </div>

      {showAssignmentForm && (
        <div className="card" style={{ padding: 16, background: "#f8fafc", border: "1px dashed #cbd5e1", position: "relative", zIndex: 100 }}>
          <h6 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700 }}>Phân công nhân sự Giai đoạn</h6>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <CustomSelect 
                className="form-input" 
                value={assignmentForm.maNv} 
                onChange={(e: any) => setAssignmentForm({...assignmentForm, maNv: e.target.value})}
                options={[
                  { label: "-- Chọn nhân viên dự án --", value: "" },
                  ...projectMembers.map((m: any) => ({
                    label: m.HO_TEN || m.TEN_NV || m.TENNV,
                    value: m.MA_NV || m.MANV
                  }))
                ]}
              />
            </div>
            <div style={{ width: 200 }}>
              <CustomSelect 
                className="form-input" 
                value={assignmentForm.vaiTro} 
                onChange={(e: any) => setAssignmentForm({...assignmentForm, vaiTro: e.target.value})}
                options={["Nhân viên", "Trưởng giai đoạn"].map(s => ({label: s, value: s}))}
              />
            </div>
            <Btn onClick={handleAddAssignment}>Thêm</Btn>
          </div>
          <div style={{ marginTop: 16 }}>
            {phaseMembers.map(m => (
              <div key={m.MA_NV} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 6 }}>
                <div><strong style={{fontSize: 14}}>{m.HO_TEN}</strong> <span style={{fontSize: 12, color: "#64748b"}}>({m.VAI_TRO})</span></div>
                <button onClick={() => handleRemoveAssignment(m.MA_NV)} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}><X size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="card" style={{ padding: 16, background: "#f8fafc", border: "1px dashed #cbd5e1", position: "relative", zIndex: 100 }}>
          <h6 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700 }}>Giao nhiệm vụ mới</h6>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Nhân viên phụ trách *">
              <CustomSelect 
                className="form-input" 
                value={form.maNv} 
                onChange={(e: any) => setForm({...form, maNv: e.target.value})}
                options={[
                  { label: "-- Chọn nhân viên --", value: "" },
                  ...phaseMembers.map((m: any) => ({
                    label: m.HO_TEN || m.TEN_NV || m.TENNV,
                    value: m.MA_NV || m.MANV
                  }))
                ]}
              />
            </FormField>
            <FormField label="Tên nhiệm vụ *">
              <input className="form-input" placeholder="Tên nhiệm vụ..." value={form.tenNhiemVu} onChange={(e) => setForm({...form, tenNhiemVu: e.target.value})} />
            </FormField>
            <div style={{ gridColumn: "span 2" }}>
              <FormField label="Mô tả">
                <textarea className="form-input" rows={2} placeholder="Chi tiết công việc..." value={form.moTa} onChange={(e) => setForm({...form, moTa: e.target.value})} style={{ resize: "none" }} />
              </FormField>
            </div>
            <FormField label="Ngày bắt đầu">
              <DatePicker 
                value={form.ngayBatDau} 
                onChange={(date) => setForm({...form, ngayBatDau: date ? date.toLocaleDateString('en-CA') : ""})}
                minDate={phase?.NGAY_BAT_DAU || phase?.ngayBatDau ? new Date(phase?.NGAY_BAT_DAU || phase?.ngayBatDau) : (project?.NGAY_BAT_DAU ? new Date(project.NGAY_BAT_DAU) : undefined)}
                maxDate={phase?.NGAY_KET_THUC || phase?.ngayKetThuc ? new Date(phase?.NGAY_KET_THUC || phase?.ngayKetThuc) : (project?.NGAY_KET_THUC ? new Date(project.NGAY_KET_THUC) : undefined)}
              />
            </FormField>
            <FormField label="Ngày kết thúc">
              <DatePicker 
                value={form.ngayKetThuc} 
                onChange={(date) => setForm({...form, ngayKetThuc: date ? date.toLocaleDateString('en-CA') : ""})}
                minDate={form.ngayBatDau ? new Date(form.ngayBatDau) : (phase?.NGAY_BAT_DAU || phase?.ngayBatDau ? new Date(phase?.NGAY_BAT_DAU || phase?.ngayBatDau) : (project?.NGAY_BAT_DAU ? new Date(project.NGAY_BAT_DAU) : undefined))}
                maxDate={phase?.NGAY_KET_THUC || phase?.ngayKetThuc ? new Date(phase?.NGAY_KET_THUC || phase?.ngayKetThuc) : (project?.NGAY_KET_THUC ? new Date(project.NGAY_KET_THUC) : undefined)}
              />
            </FormField>
            <FormField label="Độ ưu tiên">
              <CustomSelect 
                className="form-input" value={form.doUuTien} onChange={(e: any) => setForm({...form, doUuTien: e.target.value})}
                options={["Thấp", "Trung bình", "Cao"].map(s => ({ label: s, value: s }))}
              />
            </FormField>
            <FormField label="Trạng thái">
              <CustomSelect 
                className="form-input" value={form.trangThai} onChange={(e: any) => setForm({...form, trangThai: e.target.value})}
                options={["Mới", "Đang làm", "Hoàn thành", "Tạm dừng", "Hủy"].map(s => ({ label: s, value: s }))}
              />
            </FormField>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <Btn size="sm" variant="secondary" onClick={() => setShowAddForm(false)}>Hủy</Btn>
            <Btn size="sm" loading={submitting} onClick={handleCreateTask}>Xác nhận giao</Btn>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Chưa có nhiệm vụ nào được phân công.</p>
        </div>
      ) : (
        <>
          {view === "list" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tasks.map(renderTaskCard)}
            </div>
          )}

          {view === "kanban" && (
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12, alignItems: "flex-start" }}>
              {KANBAN_COLUMNS.map(col => {
                const colTasks = tasks.filter(t => t.TRANG_THAI === col);
                return (
                  <div key={col} style={{ minWidth: 300, flex: 1, background: "#f8fafc", borderRadius: 12, padding: 12, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h6 style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: 0 }}>{col}</h6>
                      <Badge color={getStatusColorHex(col)}>{colTasks.length}</Badge>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {colTasks.length > 0 ? colTasks.map(renderTaskCard) : (
                        <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 12, border: "1px dashed #cbd5e1", borderRadius: 8 }}>
                          Không có nhiệm vụ
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "calendar" && (
            <div className="project-tasks-calendar" style={{ padding: "0 10px", background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9" }}>
              <SharedCalendar
                events={calendarEvents}
                eventContent={(arg) => (
                  <div style={{ display: "flex", flexDirection: "column", padding: "4px 8px", backgroundColor: arg.event.backgroundColor || "#3b82f6", color: "#fff", fontSize: 11, fontWeight: 600, width: "100%", boxSizing: "border-box" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {arg.event.title}
                    </span>
                    <span style={{ fontSize: 10, opacity: 0.9, fontWeight: 500 }}>
                      {arg.event.extendedProps.TEN_NGUOI_THUC_HIEN || getAssigneeName(arg.event.extendedProps.MA_NV)}
                    </span>
                  </div>
                )}
                onEventClick={(info: any) => {
                  const props = info.event.extendedProps as any;
                  setSelectedEventId(props.maNvGd || props.MA_NV_GD);
                }}
              />
            </div>
          )}
        </>
      )}

      {selectedEventId && view === "calendar" && (
        <div className="modal-overlay" onClick={() => { setSelectedEventId(null); setEditingTask(null); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: 600, maxWidth: "90%", padding: "24px", position: "relative" }}>
            <button className="modal-close" onClick={() => { setSelectedEventId(null); setEditingTask(null); }} style={{ position: "absolute", right: 24, top: 24, zIndex: 10 }}>
              <X size={20} />
            </button>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Chi tiết nhiệm vụ (Từ Lịch)</h3>
            {(() => {
              const task = tasks.find(t => (t.maNvGd || (t as any).MA_NV_GD) === selectedEventId);
              if (!task) return <p>Không tìm thấy nhiệm vụ.</p>;
              return renderTaskCard(task);
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseDetails;
