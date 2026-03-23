import React from "react";
import { Building2, Edit3, Users, ChevronRight } from "lucide-react";

interface DepartmentTableProps {
  departments: any[];
  userLevel: number;
  setModal: (val: any) => void;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({ departments, userLevel, setModal }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {departments.map((dept) => (
        <div key={dept.MAPHG || dept.MaPhg} className="card" style={{ transition: "box-shadow 0.15s", cursor: "pointer", background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #eee" }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = ""}>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, background: "#111", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "#111", fontSize: 14, margin: 0 }}>{dept.TENPB || dept.TenPB}</p>
                  <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Mã: {dept.MAPHG || dept.MaPhg}</p>
                </div>
              </div>
              {userLevel >= 3 && (
                 <button
                  onClick={(e) => { e.stopPropagation(); setModal({ type: "edit", data: dept }); }}
                  style={{ padding: "6px", borderRadius: 8, color: "#aaa", background: "#f5f5f5", border: "none", cursor: "pointer" }}
                ><Edit3 size={14} /></button>
              )}
            </div>

            {dept.TruongPhong && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 12, color: "#666" }}>
                <Users size={12} />
                <span>TP: {dept.TruongPhong}</span>
              </div>
            )}

            <button
               onClick={(e) => { e.stopPropagation(); setModal({ type: "detail", data: dept.MAPHG || dept.MaPhg }); }}
              style={{
                marginTop: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                fontSize: 12, color: "#888", background: "#f8f8f8", border: "none", borderRadius: 10, padding: "8px", cursor: "pointer",
              }}
            >
              <span>Xem chi tiết</span><ChevronRight size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

