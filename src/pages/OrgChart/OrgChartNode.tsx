import React from "react";
import { OrgNodeData } from "./useOrgChart";
import { Avatar } from "../../components/UI";
import { Users, Building2, ShieldCheck } from "lucide-react";

interface Props {
  node: OrgNodeData;
  onNodeClick: (node: OrgNodeData) => void;
}

export const OrgChartNode: React.FC<Props> = ({ node, onNodeClick }) => {
  const isRoot = node.type === "root";
  const isDept = node.type === "department";
  const isRole = node.type === "role";

  let bgColor = "#fff";
  let borderColor = "#e2e8f0";
  let icon = <Users size={16} />;

  if (isRoot) {
    bgColor = "#eff6ff";
    borderColor = "#3b82f6";
    icon = <ShieldCheck size={16} color="#3b82f6" />;
  } else if (isDept) {
    bgColor = "#f8fafc";
    borderColor = "#cbd5e1";
    icon = <Building2 size={16} color="#64748b" />;
  } else {
    bgColor = "#fff";
    borderColor = "#e2e8f0";
    icon = <Users size={16} color="#94a3b8" />;
  }

  return (
    <div 
      className="org-node-card"
      onClick={() => onNodeClick(node)}
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderStyle: isRole ? "dashed" : "solid",
        borderRadius: isRoot ? 12 : 8,
        padding: "16px",
        minWidth: 200,
        maxWidth: 240,
        display: "inline-block",
        cursor: "pointer",
        boxShadow: isRoot ? "0 4px 6px -1px rgba(59, 130, 246, 0.1)" : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s",
        position: "relative",
        zIndex: 2
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
        {icon}
        <h3 style={{ margin: 0, fontSize: isRoot ? 16 : 14, fontWeight: 700, color: "#1e293b", textTransform: isRoot ? "uppercase" : "none" }}>
          {node.title}
        </h3>
      </div>
      
      {node.subtitle && (
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 12, fontWeight: 500, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
          {node.subtitle}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, color: "#334155" }}>
          {node.count} nhân sự
        </div>
      </div>
    </div>
  );
};
