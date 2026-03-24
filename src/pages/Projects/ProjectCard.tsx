import React from "react";
import { FolderKanban, User } from "lucide-react";
import { Badge } from "../../components/UI/index";
import { formatDate } from "../../utils/helpers";
import { STATUS_COLOR } from "./useProjects";

interface ProjectCardProps {
  project: any;
  onClick: () => void;
}

/** Lấy giá trị từ nhiều casing khác nhau của cùng một field */
const get = (obj: any, ...keys: string[]) => {
  for (const k of keys) if (obj?.[k] != null) return obj[k];
  return null;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const id     = get(project, "MADA", "MaDA");
  const name   = get(project, "TENDA", "TenDA");
  const desc   = get(project, "MOTA", "MoTa");
  const start  = get(project, "NGAYBATDAU", "NgayBatDau");
  const status = get(project, "TRANGTHAI", "TrangThai") || "—";
  const role   = get(project, "VAITRODUAN", "VaiTroDuAn", "vaitroduan");

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
              background: "#111",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FolderKanban size={18} color="#fff" />
          </div>
          <Badge color={STATUS_COLOR[status] || "gray"}>{status}</Badge>
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
