import React from "react";
import { Badge, SharedCalendar } from "../../components/UI";
import { ProjectCard } from "./ProjectCard";
import { STATUS_COLOR, STATUS_OPTIONS } from "./useProjects";
import { formatDate, checkOverdue } from "../../utils/helpers";
import { DynamicIcon } from "../../components/ProjectIconPicker";

export const ProjectListView = ({ projects, onClick }: { projects: any[]; onClick: (p: any) => void }) => (
  <div style={{ overflowX: "auto", background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f8fafc", color: "#64748b", textTransform: "uppercase", fontSize: 11 }}>
          <th style={{ padding: "12px 16px" }}>Tên dự án</th>
          <th style={{ padding: "12px 16px" }}>Trạng thái</th>
          <th style={{ padding: "12px 16px" }}>Ngày bắt đầu</th>
          <th style={{ padding: "12px 16px" }}>Ngày kết thúc</th>
        </tr>
      </thead>
      <tbody>
        {projects.map(p => (
          <tr key={p.MA_DA} onClick={() => onClick(p)} style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: `${p.COLOR || '#3b82f6'}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DynamicIcon name={p.ICON || 'FolderKanban'} color={p.COLOR || '#3b82f6'} size={14} />
                </div>
                {p.TEN_DA}
              </div>
            </td>
            <td style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge color={STATUS_COLOR[p.TRANG_THAI] || "gray"}>{p.TRANG_THAI}</Badge>
                {checkOverdue(p.NGAY_KET_THUC, p.TRANG_THAI) && <Badge color="red">Quá hạn</Badge>}
              </div>
            </td>
            <td style={{ padding: "12px 16px", color: "#64748b" }}>{formatDate(p.NGAY_BAT_DAU)}</td>
            <td style={{ padding: "12px 16px", color: "#64748b" }}>{formatDate(p.NGAY_KET_THUC)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ProjectKanbanView = ({ projects, onClick }: { projects: any[]; onClick: (p: any) => void }) => {
  return (
    <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16 }}>
      {STATUS_OPTIONS.map(status => {
        const cols = projects.filter(p => p.TRANG_THAI === status);
        return (
          <div key={status} style={{ minWidth: 280, flex: 1, background: "#f8fafc", borderRadius: 12, padding: 12, border: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {status} <span style={{ background: "#e2e8f0", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>{cols.length}</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cols.map(p => (
                <ProjectCard key={p.MA_DA} project={p} onClick={() => onClick(p)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  );
};

export const ProjectCalendarView = ({ projects, onClick }: { projects: any[]; onClick: (p: any) => void }) => {
  const events = projects
    .filter((p: any) => p.NGAY_BAT_DAU && p.NGAY_KET_THUC)
    .map((p: any) => ({
      id: String(p.MA_DA),
      title: p.TEN_DA || "Không tên",
      start: p.NGAY_BAT_DAU,
      end: p.NGAY_KET_THUC,
      backgroundColor: p.TRANG_THAI === "Hoàn thành" ? "#10b981" : (checkOverdue(p.NGAY_KET_THUC, p.TRANG_THAI) ? "#ef4444" : (p.COLOR || "#3b82f6")),
      borderColor: "transparent",
      extendedProps: { ...p }
    }));
    
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #f1f5f9" }}>
      <SharedCalendar 
        events={events} 
        onEventClick={(info) => onClick(info.event.extendedProps)} 
      />
    </div>
  );
};
