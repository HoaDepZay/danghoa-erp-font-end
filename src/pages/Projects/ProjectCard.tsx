import React from "react";
import { FolderKanban, User } from "lucide-react";
import { Badge } from "../../components/UI/index";
import { formatDate } from "../../utils/helpers";
import { STATUS_COLOR } from "./useProjects";

interface ProjectCardProps {
  project: any;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <div
      className="card"
      style={{ cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s" }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.transform = "";
      }}
    >
      <div className="card-body">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, background: "#111", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderKanban size={18} color="#fff" />
          </div>
          <Badge color={STATUS_COLOR[project.TRANGTHAI || project.TrangThai] || "gray"}>
            {project.TRANGTHAI || project.TrangThai || "Đang thực hiện"}
          </Badge>
        </div>
        <h4 style={{ fontWeight: 700, color: "#111", marginBottom: 4, fontSize: 14 }}>
          {project.TENDA || project.TenDA}
        </h4>
        {(project.MOTA || project.MoTa) && (
          <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }} className="line-clamp-2">
            {project.MOTA || project.MoTa}
          </p>
        )}
        {project.VaiTroDuAn && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#aaa", marginTop: 6 }}>
            <User size={11} />
            <span>{project.VaiTroDuAn}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: "1px solid #f5f5f5", fontSize: 11, color: "#bbb" }}>
          {project.NGAYBATDAU ? <span>{formatDate(project.NGAYBATDAU)}</span> : <span />}
          <span>Xem chi tiết →</span>
        </div>
      </div>
    </div>
  );
};

