import { Btn } from '../../components/UI';
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Info, CalendarDays, User, Clock, ChevronRight, X, Users, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { api } from "../../services/api";
import { toArray, getUserLevel, getManv } from "../../utils/user";
import { toast, formatDate, checkOverdue, getProp } from "../../utils/helpers";
import ProjectTasks from "../../components/ProjectTasks";
import { SharedCalendar } from "../../components/UI";
const Schedule = ({ user, onNavigate }: { user: any; onNavigate: (page: string) => void }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const handleProjectChat = async () => {
    if (!selectedProject) return;
    try {
      await api.getProjectChatRoom(getProp(selectedProject, 'MA_DA') ?? getProp(selectedProject, 'id'));
      setShowModal(false);
      onNavigate("chat");
    } catch (err) {
      toast.error("Không thể mở phòng chat dự án!");
    }
  };

  useEffect(() => {
    if (showModal) setActiveTab("overview");
  }, [showModal]);

  useEffect(() => {
    if (user) {
      fetchMyProjectsAndShifts();
    }
  }, [user]);

  const fetchMyProjectsAndShifts = async () => {
    setLoading(true);
    try {
      // Lấy dự án
      const resProj = await api.getMyProjectsFull();
      const projects = toArray(resProj.data);
      
      const projectEvents = projects
        .filter((p: any) => getProp(p, 'NGAY_BAT_DAU') && getProp(p, 'NGAY_KET_THUC'))
        .map((p: any) => {
          const MA_DA = getProp(p, 'MA_DA') ?? getProp(p, 'id');
          const TEN_DA = getProp(p, 'TEN_DA') ?? getProp(p, 'ten');
          const NGAY_BAT_DAU = getProp(p, 'NGAY_BAT_DAU');
          const NGAY_KET_THUC = getProp(p, 'NGAY_KET_THUC');
          const TRANG_THAI = getProp(p, 'TRANG_THAI');
          const isOverdue = checkOverdue(NGAY_KET_THUC, TRANG_THAI);
          return {
            id: `proj_${MA_DA}`,
            title: `[DA] ${TEN_DA || "Dự án không tên"}`,
            start: NGAY_BAT_DAU,
            end: NGAY_KET_THUC,
            backgroundColor: isOverdue ? "#ef4444" : 
                             (TRANG_THAI === "Hoàn thành" ? "#10b981" : getRandomColor(String(MA_DA))),
            borderColor: "transparent",
            extendedProps: { ...p, type: "project", isOverdue }
          };
        });

      // Lấy ca làm việc
      const resShift = await api.getShiftAssignments({ MA_NV: getManv(user) });
      const shifts = toArray(resShift.data);
      
      const shiftEvents = shifts.map((s: any) => ({
        id: `shift_${getProp(s, 'id')}`,
        title: `[Ca] ${getProp(s, 'tenca')}`,
        start: getProp(s, 'ngaylamviec'),
        allDay: true,
        backgroundColor: "#f59e0b",
        borderColor: "transparent",
        extendedProps: { ...s, type: "shift" }
      }));
      
      setEvents([...projectEvents, ...shiftEvents]);
    } catch (error) {
      console.error("Fetch schedule error:", error);
      toast.error("Không thể tải danh sách lịch trình");
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = (id: string) => {
    const colors = ["#4f46e5", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1"];
    const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const handleEventClick = (info: any) => {
    if (info.event.extendedProps.type === "shift") {
      toast.info(`Ca làm việc: ${info.event.title} - Trạng thái: ${info.event.extendedProps.TRANG_THAI || info.event.extendedProps.TRANG_THAI}`);
      return;
    }
    setSelectedProject(info.event.extendedProps);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Hoàn thành":
        return <span className="badge badge-green"><CheckCircle2 size={10} style={{ marginRight: 4 }} /> Hoàn thành</span>;
      case "Đang thực hiện":
        return <span className="badge badge-blue"><Clock size={10} style={{ marginRight: 4 }} /> Đang thực hiện</span>;
      case "Tạm dừng":
        return <span className="badge badge-yellow"><AlertCircle size={10} style={{ marginRight: 4 }} /> Tạm dừng</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div className="schedule-page">
      <div className="section-header">
        <div>
          <h2>Lịch làm việc cá nhân</h2>
          <p>Dự án bạn đang tham gia và tiến độ thực hiện</p>
        </div>
        <div className="section-header-actions">
          <Btn className="btn btn-secondary" onClick={fetchMyProjectsAndShifts} disabled={loading}>
            <CalendarDays size={16} />
            Làm mới
          </Btn>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ minHeight: "650px", padding: "16px" }}>
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ width: "24px", height: "24px", marginBottom: "12px" }} />
              <p>Đang tải dữ liệu lịch...</p>
            </div>
          ) : (
            <div className="calendar-container">
              <SharedCalendar
                events={events}
                onEventClick={handleEventClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      {showModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ 
                  width: "44px", 
                  height: "44px", 
                  borderRadius: "12px", 
                  background: selectedProject.isOverdue ? "#ef4444" : (selectedProject.TRANG_THAI === "Hoàn thành" ? "#10b981" : getRandomColor(String(selectedProject.MADA))),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  <CalendarIcon size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px" }}>{selectedProject.TEN_DA}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <span className="badge badge-black" style={{ fontSize: "10px" }}>ID: {selectedProject.MADA}</span>
                    {selectedProject.isOverdue && <span className="badge badge-red">Quá hạn</span>}
                    {getStatusBadge(selectedProject.TRANG_THAI)}
                  </div>
                </div>
              </div>
              <Btn className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </Btn>
            </div>
            
            <div className="modal-body" style={{ padding: "0 24px 24px 24px" }}>
              {/* Tabs Navigation */}
               <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", gap: "24px", marginBottom: "20px" }}>
                <Btn 
                  onClick={() => setActiveTab("overview")}
                  style={{
                    padding: "12px 4px", fontSize: "14px", fontWeight: 700, border: "none", background: "none", cursor: "pointer",
                    color: activeTab === "overview" ? "#1e293b" : "#94a3b8",
                    borderBottom: `2.5px solid ${activeTab === "overview" ? "#0f172a" : "transparent"}`,
                    transition: "all 0.2s"
                  }}
                >
                  Thông tin chung
                </Btn>
                <Btn 
                  onClick={() => setActiveTab("tasks")}
                  style={{
                    padding: "12px 4px", fontSize: "14px", fontWeight: 700, border: "none", background: "none", cursor: "pointer",
                    color: activeTab === "tasks" ? "#1e293b" : "#94a3b8",
                    borderBottom: `2.5px solid ${activeTab === "tasks" ? "#0f172a" : "transparent"}`,
                    transition: "all 0.2s"
                  }}
                >
                  Nhiệm vụ & Công việc
                </Btn>
              </div>

              {activeTab === "overview" ? (
                <div className="grid-2" style={{ gap: "32px" }}>
                {/* Left Column: Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="detail-section">
                    <div className="form-label" style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Info size={14} /> Mô tả dự án
                    </div>
                    <div style={{ 
                      padding: "16px", 
                      background: "#f8fafc", 
                      borderRadius: "12px", 
                      fontSize: "14px", 
                      lineHeight: "1.6", 
                      color: "#475569",
                      border: "1px solid #f1f5f9"
                    }}>
                      {selectedProject.MO_TA || "Không có mô tả chi tiết cho dự án này."}
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="form-label" style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} /> Thời gian thực hiện
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flex: 1, padding: "12px", background: "#f0fdf4", borderRadius: "10px", textAlign: "center", border: "1px solid #dcfce7" }}>
                        <div style={{ fontSize: "10px", color: "#166534", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Bắt đầu</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#166534" }}>{formatDate(selectedProject.NGAY_BAT_DAU)}</div>
                      </div>
                      <ChevronRight size={16} color="#cbd5e1" />
                      <div style={{ flex: 1, padding: "12px", background: "#fef2f2", borderRadius: "10px", textAlign: "center", border: "1px solid #fee2e2" }}>
                        <div style={{ fontSize: "10px", color: "#991b1b", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Kết thúc</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#991b1b" }}>{formatDate(selectedProject.NGAY_KET_THUC)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Members */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Users size={14} /> Thành viên tham gia ({selectedProject.thanhVien?.length || 0})
                  </div>
                  <div className="member-list" style={{ 
                    maxHeight: "300px", 
                    overflowY: "auto", 
                    padding: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}>
                    {selectedProject.thanhVien && selectedProject.thanhVien.length > 0 ? (
                      selectedProject.thanhVien.map((m: any, idx: number) => (
                        <div key={idx} style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "10px", 
                          padding: "10px 12px", 
                          background: "#fff", 
                          border: "1px solid #f1f5f9", 
                          borderRadius: "10px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                        }}>
                          <div style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "8px", 
                            background: "#334155", 
                            color: "#fff", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700
                          }}>
                            {m.HO_TEN?.charAt(0) || "U"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {m.HO_TEN}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{m.VAI_TRO_DU_AN || "Thành viên"}</div>
                          </div>
                          <div className="badge badge-gray" style={{ fontSize: "9px" }}>{m.MA_NV}</div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state" style={{ padding: "20px" }}>
                        <User size={24} color="#e2e8f0" />
                        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>Chưa có thành viên nào</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              ) : (
                <div style={{ minHeight: "350px" }}>
                   <ProjectTasks 
                    projectId={getProp(selectedProject, 'MA_DA') ?? getProp(selectedProject, 'id')} 
                    members={selectedProject.thanhVien || []} 
                    isAdmin={getUserLevel(user) >= 2} 
                  />
                </div>
              )}
            </div>


            <div className="modal-footer" style={{ padding: "16px 24px", background: "#f8fafc", borderBottomLeftRadius: "20px", borderBottomRightRadius: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Btn className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={handleProjectChat}>
                <MessageSquare size={14} /> Chat dự án
              </Btn>
              <Btn className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</Btn>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .calendar-container {
          background: #fff;
        }
        .member-list::-webkit-scrollbar {
          width: 4px;
        }
        .member-list::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .member-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Schedule;
