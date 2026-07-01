import { Btn } from '../../components/UI';
import React from "react";
import { Edit3, Users, ChevronRight } from "lucide-react";
import { DynamicIcon } from "../../components/ProjectIconPicker";
interface DepartmentTableProps {
  departments: any[];
  userLevel: number;
  setModal: (val: any) => void;
  onNavigate?: (page: string) => void;
}

const DEPT_COLORS = [
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

const stringToDeptColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEPT_COLORS.length;
  return DEPT_COLORS[index];
};

export const DepartmentTable: React.FC<DepartmentTableProps> = ({ departments, userLevel, setModal, onNavigate }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {departments.map((dept) => {
        const name = dept.TEN_PB || "";
        const fallbackColors = stringToDeptColor(name);
        const iconCol = dept.COLOR || fallbackColors.icon;
        const bgCol = dept.COLOR ? `${dept.COLOR}15` : fallbackColors.bg;
        const iconName = dept.ICON || 'Building';
        return (
          <div key={dept.MA_PHG} className="card" style={{ transition: "box-shadow 0.15s", cursor: "pointer", background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #eee" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = ""}
            onClick={() => {
              localStorage.setItem("selectedDeptId", String(dept.MA_PHG));
              if (onNavigate) {
                onNavigate("department_details");
              } else {
                setModal({ type: "detail", data: dept.MA_PHG }); 
              }
            }}>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: bgCol, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <DynamicIcon name={iconName} size={18} color={iconCol} />
                  </div>
                <div>
                  <p style={{ fontWeight: 700, color: "#111", fontSize: 14, margin: 0 }}>{dept.TEN_PB}</p>
                  <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Mã: {dept.MA_PHG}</p>
                </div>
              </div>
              {userLevel >= 3 && (
                 <Btn
                  onClick={(e) => { e.stopPropagation(); setModal({ type: "edit", data: dept }); }}
                  style={{ padding: "6px", borderRadius: 8, color: "#aaa", background: "#f5f5f5", border: "none", cursor: "pointer" }}
                ><Edit3 size={14} /></Btn>
              )}
            </div>

            {/* Trưởng phòng — API trả tenTruongPhong */}
            {dept.tenTruongPhong && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 12, color: "#666" }}>
                <Users size={12} />
                <span>TP: {dept.tenTruongPhong}</span>
              </div>
            )}

            <Btn
               onClick={(e) => { 
                 e.stopPropagation(); 
                 localStorage.setItem("selectedDeptId", dept.MA_PHG);
                 if (onNavigate) {
                   onNavigate("department_details");
                 } else {
                   setModal({ type: "detail", data: dept.MA_PHG }); 
                 }
               }}
              style={{
                marginTop: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                fontSize: 12, color: "#888", background: "#f8f8f8", border: "none", borderRadius: 10, padding: "8px", cursor: "pointer",
              }}
            >
              <span>Xem chi tiết</span><ChevronRight size={13} />
            </Btn>
          </div>
        </div>
      )
    })}
    </div>
  );
};

