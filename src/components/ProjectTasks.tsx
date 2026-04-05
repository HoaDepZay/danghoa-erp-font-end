import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  User, 
  Calendar,
  MoreVertical,
  Activity,
  CheckCircle,
  Layout,
  X
} from "lucide-react";
import { api } from "../services/api";
import { toast, formatDate, checkOverdue } from "../utils/helpers";
import { Spinner, Btn, Badge, FormField } from "./UI";

interface Task {
  MaNVDA: number;
  MaDA: number;
  MaNV: string;
  TenNhanVien: string;
  TenNhiemVu: string;
  MoTa: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  DoUuTien: string;
  TrangThai: string;
  PhanTramHoanThanh: number;
}

interface ProjectTasksProps {
  projectId: number;
  members: any[];
  isAdmin: boolean;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId, members, isAdmin }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    manv: "",
    tennhiemvu: "",
    mota: "",
    ngaybatdau: "",
    ngayketthuc: "",
    douutien: "Trung bình",
    trangthai: "Mới",
    phantramhoanthanh: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await api.getProjectTasks(projectId);
      setTasks(res.data?.data || []);
    } catch (err: any) {
      console.error("Fetch tasks error", err);
      // toast.error(err.response?.data?.message || "Không thể tải danh sách nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!form.manv || !form.tennhiemvu) return toast.error("Vui lòng điền đủ thông tin bắt buộc!");
    setSubmitting(true);
    try {
      await api.createProjectTask(projectId, form);
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
      // Body request mẫu của backend: { trangthai, phantramhoanthanh, mota }
      const payload = {
        trangthai: taskData.TrangThai,
        phantramhoanthanh: taskData.PhanTramHoanThanh,
        mota: taskData.MoTa,
      };
      await api.updateProjectTask(projectId, taskId, payload);
      toast.success("Cập nhật nhiệm vụ thành công!");
      fetchTasks();
      setEditingTask(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật nhiệm vụ!");
    }
  };

  const resetForm = () => {
    setForm({
      manv: "",
      tennhiemvu: "",
      mota: "",
      ngaybatdau: "",
      ngayketthuc: "",
      douutien: "Trung bình",
      trangthai: "Mới",
      phantramhoanthanh: 0,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Cao": return "red";
      case "Trung bình": return "yellow";
      case "Thấp": return "gray";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Hoàn thành": return <CheckCircle2 size={14} color="#10b981" />;
      case "Đang làm": return <Clock size={14} color="#3b82f6" />;
      case "Mới": return <Activity size={14} color="#94a3b8" />;
      default: return <AlertCircle size={14} color="#f59e0b" />;
    }
  };

  return (
    <div className="project-tasks">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h5 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
          <Layout size={14} /> Danh sách nhiệm vụ ({tasks.length})
        </h5>
        {isAdmin && !showAddForm && (
          <Btn size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setShowAddForm(true)}>
            Giao nhiệm vụ
          </Btn>
        )}
      </div>

      {showAddForm && (
        <div className="card" style={{ padding: 16, marginBottom: 20, background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
          <h6 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700 }}>Giao nhiệm vụ mới</h6>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Nhân viên phụ trách *">
              <select className="form-input" value={form.manv} onChange={(e) => setForm({...form, manv: e.target.value})}>
                <option value="">-- Chọn nhân viên --</option>
                {members.map((m: any) => (
                  <option key={m.MANV || m.MaNV || m.manv} value={m.MANV || m.MaNV || m.manv}>{m.HOTEN || m.HoTen || m.hoten}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Tên nhiệm vụ *">
              <input className="form-input" placeholder="Tên nhiệm vụ..." value={form.tennhiemvu} onChange={(e) => setForm({...form, tennhiemvu: e.target.value})} />
            </FormField>
            <div style={{ gridColumn: "span 2" }}>
              <FormField label="Mô tả">
                <textarea className="form-input" rows={2} placeholder="Chi tiết công việc..." value={form.mota} onChange={(e) => setForm({...form, mota: e.target.value})} style={{ resize: "none" }} />
              </FormField>
            </div>
            <FormField label="Ngày bắt đầu">
              <input type="date" className="form-input" value={form.ngaybatdau} onChange={(e) => setForm({...form, ngaybatdau: e.target.value})} />
            </FormField>
            <FormField label="Ngày kết thúc">
              <input type="date" className="form-input" value={form.ngayketthuc} onChange={(e) => setForm({...form, ngayketthuc: e.target.value})} />
            </FormField>
            <FormField label="Độ ưu tiên">
              <select className="form-input" value={form.douutien} onChange={(e) => setForm({...form, douutien: e.target.value})}>
                <option>Thấp</option>
                <option>Trung bình</option>
                <option>Cao</option>
              </select>
            </FormField>
            <FormField label="Trạng thái">
              <select className="form-input" value={form.trangthai} onChange={(e) => setForm({...form, trangthai: e.target.value})}>
                <option>Mới</option>
                <option>Đang làm</option>
                <option>Hoàn thành</option>
                <option>Tạm dừng</option>
              </select>
            </FormField>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <Btn size="sm" variant="secondary" onClick={() => setShowAddForm(false)}>Hủy</Btn>
            <Btn size="sm" loading={submitting} onClick={handleCreateTask}>Xác nhận giao</Btn>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center" }}><Spinner size={24} /></div>
      ) : tasks.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Chưa có nhiệm vụ nào được phân công.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.map((task) => {
            const isOverdue = checkOverdue(task.NgayKetThuc, task.TrangThai);
            return (
            <div key={task.MaNVDA} className="card" style={{ 
              padding: 14, 
              background: isOverdue ? "#fff1f2" : "#fff", // Nền đỏ nhạt nếu quá hạn
              borderColor: isOverdue ? "#fecdd3" : "#f1f5f9",
              transition: "all 0.2s" 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {getStatusIcon(task.TrangThai)}
                    <span style={{ fontWeight: 700, fontSize: 14, color: isOverdue ? "#9f1239" : "#1e293b" }}>{task.TenNhiemVu}</span>
                    {isOverdue && <Badge color="red">Quá hạn</Badge>}
                    <Badge color={getPriorityColor(task.DoUuTien)}>{task.DoUuTien}</Badge>
                  </div>
                  <p style={{ margin: "0 0 10px 0", fontSize: 12, color: "#64748b" }}>{task.MoTa || "Không có mô tả"}</p>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8" }}>
                      <User size={12} /> <span style={{ fontWeight: 600, color: "#475569" }}>{task.TenNhanVien}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8" }}>
                      <Calendar size={12} /> {formatDate(task.NgayBatDau)} - {formatDate(task.NgayKetThuc)}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", paddingLeft: 16 }}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>{task.PhanTramHoanThanh}%</div>
                    <div style={{ width: 60, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
                      <div style={{ width: `${task.PhanTramHoanThanh}%`, height: "100%", background: "#3b82f6" }} />
                    </div>
                  </div>
                  {editingTask?.MaNVDA === task.MaNVDA ? (
                    <div style={{ display: "flex", gap: 4 }}>
                       <button onClick={() => handleUpdateTask(task.MaNVDA, editingTask)} style={{ color: "#10b981", background: "none", border: "none", cursor: "pointer" }}><CheckCircle size={16} /></button>
                       <button onClick={() => setEditingTask(null)} style={{ color: "#f43f5e", background: "none", border: "none", cursor: "pointer" }}><X size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingTask({...task})} style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
                       <MoreVertical size={16} />
                    </button>
                  )}
                </div>
              </div>

              {editingTask?.MaNVDA === task.MaNVDA && (
                <div style={{ marginTop: 12, borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <FormField label="Trạng thái">
                      <select className="form-input" value={editingTask.TrangThai} onChange={(e) => setEditingTask({...editingTask, TrangThai: e.target.value})}>
                        <option>Mới</option>
                        <option>Đang làm</option>
                        <option>Hoàn thành</option>
                        <option>Tạm dừng</option>
                      </select>
                    </FormField>
                    <FormField label="Hoàn thành (%)">
                      <input type="number" className="form-input" min="0" max="100" value={editingTask.PhanTramHoanThanh} onChange={(e) => setEditingTask({...editingTask, PhanTramHoanThanh: parseInt(e.target.value)})} />
                    </FormField>
                    <div style={{ gridColumn: "span 2" }}>
                      <FormField label="Ghi chú/Mô tả tiến độ mới">
                        <textarea 
                          className="form-input" 
                          rows={2} 
                          value={editingTask.MoTa} 
                          onChange={(e) => setEditingTask({...editingTask, MoTa: e.target.value})} 
                          style={{ resize: "none" }} 
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;
