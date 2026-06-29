import React, { useState, useEffect } from "react";
import { 
  Plus, Calendar, List, Kanban, CalendarDays, Activity, CheckCircle2, AlertCircle
} from "lucide-react";
import { api } from "../services/api";
import { toast, formatDate, checkOverdue } from "../utils/helpers";
import { Spinner, Btn, Badge, FormField, SharedCalendar, DatePicker, CustomSelect, Card } from "./UI";

interface ProjectTasksProps {
  projectId: number;
  members: any[];
  isAdmin: boolean;
  defaultView?: "list" | "calendar" | "kanban" | "timeline";
  currentUser?: any;
  projectStatus?: string;
  onNavigate?: (page: string) => void;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId, isAdmin, defaultView = "list", onNavigate }) => {
  const [phases, setPhases] = useState<any[]>([]);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [showAddPhaseForm, setShowAddPhaseForm] = useState(false);
  const [phaseForm, setPhaseForm] = useState({ tenGd: "", ngayBatDau: "", ngayKetThuc: "", trangThai: "Chưa bắt đầu" });
  const [view, setView] = useState<"list" | "calendar" | "kanban" | "timeline">(defaultView);

  useEffect(() => {
    fetchPhases();
  }, [projectId]);

  const fetchPhases = async () => {
    if (!projectId) return;
    setLoadingPhases(true);
    try {
      const res = await api.getPhasesByProject(projectId);
      setPhases(res.data?.data || []);
    } catch (err) {
      toast.error("Lỗi tải giai đoạn");
    } finally {
      setLoadingPhases(false);
    }
  };

  const handleCreatePhase = async () => {
    if (!phaseForm.tenGd) return toast.error("Vui lòng nhập tên giai đoạn");
    try {
      await api.createPhase(projectId, phaseForm);
      toast.success("Đã tạo giai đoạn");
      setShowAddPhaseForm(false);
      setPhaseForm({ tenGd: "", ngayBatDau: "", ngayKetThuc: "", trangThai: "Chưa bắt đầu" });
      fetchPhases();
    } catch (err) {
      toast.error("Lỗi tạo giai đoạn");
    }
  };

  const getStatusColorHex = (status: string) => {
    switch (status?.toLowerCase()) {
      case "hoàn thành": case "đã duyệt": return "green";
      case "đang thực hiện": return "blue";
      case "tạm dừng": return "red";
      case "chưa bắt đầu": return "gray";
      default: return "gray";
    }
  };

  const navigateToPhase = (phaseId: string | number) => {
    localStorage.setItem("selectedPhaseId", String(phaseId));
    if (onNavigate) {
      onNavigate("phase_details");
    } else {
      window.location.hash = "phase_details";
    }
  };

  const renderPhaseCard = (p: any, viewType: string) => {
    const isOverdue = checkOverdue(p.NGAY_KET_THUC || p.ngayKetThuc, p.TRANG_THAI || p.trangThai);
    return (
      <Card 
        key={p.MA_GD || p.maGd} 
        style={{ 
          padding: 16, 
          cursor: "pointer", 
          transition: "all 0.2s", 
          display: "flex", 
          flexDirection: viewType === "kanban" ? "column" : "row",
          justifyContent: "space-between", 
          alignItems: viewType === "kanban" ? "flex-start" : "center",
          gap: 12,
          border: isOverdue ? "1px solid #fecdd3" : "1px solid #e2e8f0",
          background: isOverdue ? "#fff1f2" : "#fff",
        }}
        onClick={() => navigateToPhase(p.MA_GD || p.maGd)}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: 16, color: isOverdue ? "#9f1239" : "#1e293b", fontWeight: 700 }}>
              {p.TEN_GD || p.tenGd}
            </h4>
            {isOverdue && <Badge color="red">Quá hạn</Badge>}
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#64748b" }}>
            <span><Calendar size={13} style={{marginRight: 4, verticalAlign: -2}}/>{formatDate(p.NGAY_BAT_DAU || p.ngayBatDau)} - {formatDate(p.NGAY_KET_THUC || p.ngayKetThuc)}</span>
          </div>
        </div>
        <div>
          <Badge color={getStatusColorHex(p.TRANG_THAI || p.trangThai)}>{p.TRANG_THAI || p.trangThai}</Badge>
        </div>
      </Card>
    );
  };

  const calendarEvents = phases.map((p) => ({
    id: String(p.MA_GD || p.maGd),
    title: p.TEN_GD || p.tenGd,
    start: p.NGAY_BAT_DAU || p.ngayBatDau,
    end: p.NGAY_KET_THUC || p.ngayKetThuc,
    backgroundColor: getStatusColorHex(p.TRANG_THAI || p.trangThai) === "green" ? "#10b981" : 
                     getStatusColorHex(p.TRANG_THAI || p.trangThai) === "blue" ? "#3b82f6" : 
                     getStatusColorHex(p.TRANG_THAI || p.trangThai) === "red" ? "#ef4444" : "#94a3b8",
    extendedProps: p
  }));

  const KANBAN_COLUMNS = ["Chưa bắt đầu", "Đang thực hiện", "Hoàn thành", "Tạm dừng"];

  return (
    <div className="project-phases" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 4 }}>
          <button onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: view === "list" ? "#fff" : "transparent", color: view === "list" ? "#111" : "#64748b", boxShadow: view === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><List size={14}/> Danh sách</button>
          <button onClick={() => setView("kanban")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: view === "kanban" ? "#fff" : "transparent", color: view === "kanban" ? "#111" : "#64748b", boxShadow: view === "kanban" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><Kanban size={14}/> Kanban</button>
          <button onClick={() => setView("calendar")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: view === "calendar" ? "#fff" : "transparent", color: view === "calendar" ? "#111" : "#64748b", boxShadow: view === "calendar" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><CalendarDays size={14}/> Lịch</button>
          <button onClick={() => setView("timeline")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: view === "timeline" ? "#fff" : "transparent", color: view === "timeline" ? "#111" : "#64748b", boxShadow: view === "timeline" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><Activity size={14}/> Sơ đồ</button>
        </div>
        {isAdmin && (
          <Btn size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setShowAddPhaseForm(!showAddPhaseForm)}>
            Thêm giai đoạn
          </Btn>
        )}
      </div>

      {showAddPhaseForm && (
        <Card style={{ padding: 16, background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
          <h6 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700 }}>Tạo giai đoạn mới</h6>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Tên giai đoạn *">
              <input className="form-input" value={phaseForm.tenGd} onChange={e => setPhaseForm({...phaseForm, tenGd: e.target.value})} />
            </FormField>
            <FormField label="Trạng thái">
              <CustomSelect 
                className="form-input" 
                value={phaseForm.trangThai} 
                onChange={(e: any) => setPhaseForm({...phaseForm, trangThai: e.target.value})}
                options={KANBAN_COLUMNS.map(s => ({label: s, value: s}))}
              />
            </FormField>
            <FormField label="Ngày bắt đầu">
              <DatePicker value={phaseForm.ngayBatDau} onChange={(d) => setPhaseForm({...phaseForm, ngayBatDau: d ? d.toLocaleDateString('en-CA') : ""})} />
            </FormField>
            <FormField label="Ngày kết thúc">
              <DatePicker value={phaseForm.ngayKetThuc} onChange={(d) => setPhaseForm({...phaseForm, ngayKetThuc: d ? d.toLocaleDateString('en-CA') : ""})} />
            </FormField>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <Btn size="sm" variant="secondary" onClick={() => setShowAddPhaseForm(false)}>Hủy</Btn>
            <Btn size="sm" onClick={handleCreatePhase}>Tạo mới</Btn>
          </div>
        </Card>
      )}

      {loadingPhases ? (
        <div style={{ padding: 40, textAlign: "center" }}><Spinner size={24} /></div>
      ) : phases.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Chưa có giai đoạn nào.</p>
        </div>
      ) : (
        <>
          {view === "list" && (
             <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
               {phases.map(p => renderPhaseCard(p, "list"))}
             </div>
          )}

          {view === "kanban" && (
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12, alignItems: "flex-start" }}>
              {KANBAN_COLUMNS.map(col => {
                const colPhases = phases.filter(p => (p.TRANG_THAI || p.trangThai) === col);
                return (
                  <div key={col} style={{ minWidth: 300, flex: 1, background: "#f8fafc", borderRadius: 12, padding: 12, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h6 style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: 0 }}>{col}</h6>
                      <Badge color={getStatusColorHex(col)}>{colPhases.length}</Badge>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {colPhases.length > 0 ? colPhases.map(p => renderPhaseCard(p, "kanban")) : (
                        <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 12, border: "1px dashed #cbd5e1", borderRadius: 8 }}>
                          Không có giai đoạn
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "calendar" && (
            <Card style={{ padding: "10px", background: "#fff" }}>
              <SharedCalendar
                events={calendarEvents}
                eventContent={(arg) => (
                  <div style={{ display: "flex", flexDirection: "column", padding: "4px 8px", backgroundColor: arg.event.backgroundColor, color: "#fff", fontSize: 11, fontWeight: 600, width: "100%", boxSizing: "border-box" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {arg.event.title}
                    </span>
                  </div>
                )}
                onEventClick={(info: any) => {
                  const props = info.event.extendedProps as any;
                  navigateToPhase(props.MA_GD || props.maGd);
                }}
              />
            </Card>
          )}

          {view === "timeline" && (
            <Card style={{ padding: 24, overflowX: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", minWidth: "max-content", padding: "20px 0" }}>
                {phases.map((p, index) => {
                  const isDone = (p.TRANG_THAI || p.trangThai) === "Hoàn thành";
                  const isCurrent = (p.TRANG_THAI || p.trangThai) === "Đang thực hiện";
                  return (
                    <React.Fragment key={p.MA_GD || p.maGd}>
                      {/* Cột Timeline */}
                      <div 
                        style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          alignItems: "center", 
                          cursor: "pointer", 
                          width: 140,
                          position: "relative"
                        }}
                        onClick={() => navigateToPhase(p.MA_GD || p.maGd)}
                      >
                        {/* Icon trạng thái */}
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: isDone ? "#10b981" : isCurrent ? "#3b82f6" : "#f1f5f9",
                          color: isDone || isCurrent ? "#fff" : "#94a3b8",
                          border: isCurrent ? "4px solid #bfdbfe" : "none",
                          zIndex: 2,
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}>
                          {isDone ? <CheckCircle2 size={20} /> : isCurrent ? <Activity size={20} /> : <AlertCircle size={20} />}
                        </div>
                        
                        {/* Tên giai đoạn */}
                        <div style={{ 
                          marginTop: 16, 
                          textAlign: "center", 
                          fontWeight: isCurrent ? 700 : 600,
                          color: isDone ? "#059669" : isCurrent ? "#1d4ed8" : "#475569",
                          fontSize: 14,
                          lineHeight: 1.4
                        }}>
                          {p.TEN_GD || p.tenGd}
                        </div>
                        
                        {/* Thời gian */}
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <span>{formatDate(p.NGAY_BAT_DAU || p.ngayBatDau)}</span>
                          <span>-</span>
                          <span>{formatDate(p.NGAY_KET_THUC || p.ngayKetThuc)}</span>
                        </div>
                      </div>

                      {/* Đường kẻ nối Timeline */}
                      {index < phases.length - 1 && (
                        <div style={{ 
                          width: 60, 
                          height: 3, 
                          background: isDone ? "#10b981" : "#e2e8f0",
                          marginTop: -60 // Căn dọc đường kẻ cho khớp icon 40px
                        }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectTasks;
