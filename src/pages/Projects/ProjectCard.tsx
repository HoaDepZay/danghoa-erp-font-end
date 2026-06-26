import React from "react";
import { FolderKanban, User } from "lucide-react";
import { Badge } from "../../components/UI/index";
import { formatDate, checkOverdue } from "../../utils/helpers";
import { STATUS_COLOR } from "./useProjects";

interface ProjectCardProps {
  project: any;
  onClick: () => void;
}

const PROJECT_COLORS = [
  { bg: "#FEE2E2", icon: "#DC2626" }, // Red
  { bg: "#FEF3C7", icon: "#D97706" }, // Amber
  { bg: "#D1FAE5", icon: "#059669" }, // Emerald
  { bg: "#DBEAFE", icon: "#2563EB" }, // Blue
  { bg: "#E0F2FE", icon: "#0284C7" }, // Sky
  { bg: "#F3E8FF", icon: "#8B5CF6" }, // Purple
  { bg: "#FCE7F3", icon: "#DB2777" }, // Pink
  { bg: "#E0E7FF", icon: "#4F46E5" }, // Indigo
  { bg: "#ECFDF5", icon: "#0D9488" }, // Teal
];

const stringToProjectColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PROJECT_COLORS.length;
  return PROJECT_COLORS[index];
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  
  const id     = project.MA_DA;
  const name   = project.TEN_DA ?? "";
  const desc   = project.MO_TA;
  const start  = project.NGAY_BAT_DAU;
  const status = project.TRANG_THAI ?? "—";
  const role   = project.VAI_TRO_DU_AN;
  const end    = project.NGAY_KET_THUC;
  const isOverdue = checkOverdue(end, status);
  const isPublic = project.CONG_KHAI;

  const colors = stringToProjectColor(name);

  return (
    <div
      key={id}
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
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: colors.bg,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FolderKanban size={18} color={colors.icon} />
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
             {isOverdue && <Badge color="red">Quá hạn</Badge>}
             {isPublic ? <Badge color="blue">Công khai</Badge> : <Badge color="gray">Nội bộ</Badge>}
             <Badge color={STATUS_COLOR[status] || "gray"}>{status}</Badge>
          </div>
        </div>

        <h4 style={{ fontWeight: 700, color: "#111", marginBottom: 4, fontSize: 14 }}>
          {name}
        </h4>

        {desc && (
          <p
            style={{ fontSize: 12, color: "#888", marginBottom: 8 }}
            className="line-clamp-2"
          >
            {desc}
          </p>
        )}

        {role && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "#aaa",
              marginTop: 6,
            }}
          >
            <User size={11} />
            <span>{role}</span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid #f5f5f5",
            fontSize: 11,
            color: "#bbb",
          }}
        >
          {start ? <span>{formatDate(start)}</span> : <span />}
          <span>Xem chi tiết →</span>
        </div>
      </div>
    </div>
  );
};
