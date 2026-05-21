import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Calendar as CalendarIcon, Info, CalendarDays, User, Clock, ChevronRight, X, Users, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { api } from "../../services/api";
import { toArray, getUserLevel, getManv } from "../../utils/user";
import { toast, formatDate, checkOverdue } from "../../utils/helpers";
import ProjectTasks from "../../components/ProjectTasks";

const Schedule = ({ user, onNavigate }: { user: any; onNavigate: (page: string) => void }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const handleProjectChat = async () => {
    if (!selectedProject) return;
    try {
      await api.getProjectChatRoom(selectedProject.MADA || selectedProject.MaDA);
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
      fetchMyProjects();
    }
  }, [user]);

  const fetchMyProjects = async () => {
    setLoading(true);
    try {
      // Sử dụng API lấy toàn bộ dự án mà nhân viên hiện tại tham gia
      const res = await api.getMyProjectsFull();
      const projects = toArray(res.data);
      console.log("My Projects Full Data:", projects);
      
      const calendarEvents = projects
        .filter((p: any) => p.NgayBatDau && p.NgayKetThuc) // Chỉ hiển thị dự án có ngày rõ ràng
        .map((p: any) => {
          const isOverdue = checkOverdue(p.NgayKetThuc, p.TrangThai);
          return {
            id: String(p.MADA),
            title: p.TENDA || "Dự án không tên",
            start: p.NgayBatDau,
            end: p.NgayKetThuc,
            backgroundColor: isOverdue ? "#ef4444" : 
                             (p.TrangThai === "Hoàn thành" ? "#10b981" : getRandomColor(String(p.MADA))),
            borderColor: "transparent",
            extendedProps: { ...p, isOverdue }
          };
        });
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error("Fetch projects error:", error);
      toast.error("Không thể tải danh sách dự án");
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
          <button className="btn btn-secondary" onClick={fetchMyProjects} disabled={loading}>
            <CalendarDays size={16} />
            Làm mới
          </button>
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
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,dayGridWeek"
                }}
                locale="vi"
                buttonText={{
                  today: "Hôm nay",
                  month: "Tháng",
                  week: "Tuần"
                }}
                height="auto"
                dayMaxEvents={true}
                eventDisplay="block"
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
                  background: selectedProject.isOverdue ? "#ef4444" : (selectedProject.TrangThai === "Hoàn thành" ? "#10b981" : getRandomColor(String(selectedProject.MADA))),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  <CalendarIcon size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px" }}>{selectedProject.TENDA}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <span className="badge badge-black" style={{ fontSize: "10px" }}>ID: {selectedProject.MADA}</span>
                    {selectedProject.isOverdue && <span className="badge badge-red">Quá hạn</span>}
                    {getStatusBadge(selectedProject.TrangThai)}
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: "0 24px 24px 24px" }}>
              {/* Tabs Navigation */}
               <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", gap: "24px", marginBottom: "20px" }}>
                <button 
                  onClick={() => setActiveTab("overview")}
                  style={{
                    padding: "12px 4px", fontSize: "14px", fontWeight: 700, border: "none", background: "none", cursor: "pointer",
                    color: activeTab === "overview" ? "#1e293b" : "#94a3b8",
                    borderBottom: `2.5px solid ${activeTab === "overview" ? "#0f172a" : "transparent"}`,
                    transition: "all 0.2s"
                  }}
                >
                  Thông tin chung
                </button>
                <button 
                  onClick={() => setActiveTab("tasks")}
                  style={{
                    padding: "12px 4px", fontSize: "14px", fontWeight: 700, border: "none", background: "none", cursor: "pointer",
                    color: activeTab === "tasks" ? "#1e293b" : "#94a3b8",
                    borderBottom: `2.5px solid ${activeTab === "tasks" ? "#0f172a" : "transparent"}`,
                    transition: "all 0.2s"
                  }}
                >
                  Nhiệm vụ & Công việc
                </button>
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
                      {selectedProject.MoTa || "Không có mô tả chi tiết cho dự án này."}
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="form-label" style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} /> Thời gian thực hiện
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flex: 1, padding: "12px", background: "#f0fdf4", borderRadius: "10px", textAlign: "center", border: "1px solid #dcfce7" }}>
                        <div style={{ fontSize: "10px", color: "#166534", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Bắt đầu</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#166534" }}>{formatDate(selectedProject.NgayBatDau)}</div>
                      </div>
                      <ChevronRight size={16} color="#cbd5e1" />
                      <div style={{ flex: 1, padding: "12px", background: "#fef2f2", borderRadius: "10px", textAlign: "center", border: "1px solid #fee2e2" }}>
                        <div style={{ fontSize: "10px", color: "#991b1b", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Kết thúc</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#991b1b" }}>{formatDate(selectedProject.NgayKetThuc)}</div>
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
                            {m.HOTEN?.charAt(0) || "U"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {m.HOTEN}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{m.VaiTroDuAn || "Thành viên"}</div>
                          </div>
                          <div className="badge badge-gray" style={{ fontSize: "9px" }}>{m.MaNV}</div>
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
                    projectId={selectedProject.MADA} 
                    members={selectedProject.thanhVien || []} 
                    isAdmin={getUserLevel(user) >= 2} 
                  />
                </div>
              )}
            </div>


            <div className="modal-footer" style={{ padding: "16px 24px", background: "#f8fafc", borderBottomLeftRadius: "20px", borderBottomRightRadius: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={handleProjectChat}>
                <MessageSquare size={14} /> Chat dự án
              </button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .calendar-container {
          background: #fff;
        }
        .fc {
          font-family: inherit;
        }
        .fc .fc-toolbar-title {
          font-size: 18px;
          font-weight: 800;
          color: #111;
        }
        .fc .fc-button-primary {
          background-color: #fff;
          border-color: #e2e8f0;
          color: #475569;
          font-weight: 600;
          text-transform: capitalize;
          padding: 8px 16px;
          font-size: 13px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .fc .fc-button-primary:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
          color: #1e293b;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active, 
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #0f172a;
          border-color: #0f172a;
          color: #fff;
        }
        .fc .fc-button-primary:focus {
          box-shadow: none;
        }
        .fc .fc-daygrid-day-number {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          padding: 8px;
        }
        .fc .fc-col-header-cell-cushion {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 12px 0;
          letter-spacing: 0.05em;
        }
        .fc .fc-event {
          border-radius: 8px;
          padding: 3px 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .fc .fc-event:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .fc .fc-day-today {
          background-color: #f8fafc !important;
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
