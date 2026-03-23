import React from "react";
import { FolderKanban, Clock, Wallet } from "lucide-react";
import { Card } from "../../components/UI/index";
import { formatCurrency } from "../../utils/helpers";

interface DashboardChartProps {
  myProjects: any[];
  myPayroll: any;
  pay: (key: string) => any;
  month: number;
  year: number;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ myProjects, myPayroll, pay, month, year }) => {
  return (
    <>
      {/* Projects list */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <FolderKanban size={17} color="#aaa" />
          <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#111" }}>Dự án đang tham gia</h3>
        </div>
        {(!Array.isArray(myProjects) || myProjects.length === 0) ? (
          <p style={{ textAlign: "center", color: "#bbb", fontSize: 13, padding: "24px 0" }}>
            Chưa tham gia dự án nào
          </p>
        ) : (
          <div>
            {myProjects.slice(0, 5).map((p, i) => (
              <div key={p.MADA || p.MaDA || i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 0",
                borderBottom: i < Math.min(myProjects.length, 5) - 1 ? "1px solid #f5f5f5" : "none",
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: 0, color: "#111" }}>
                    {p.TENDA || p.TenDA || "Dự án"}
                  </p>
                  <p style={{ fontSize: 11, color: "#999", margin: "2px 0 0" }}>
                    {p.VaiTroDuAn || "Thành viên"}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#aaa", fontSize: 12 }}>
                  <Clock size={12} />
                  <span>{p.THOIGIAN || p.ThoiGian || 0}h</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Payroll summary */}
      {myPayroll && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Wallet size={17} color="#aaa" />
            <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#111" }}>
              Phiếu lương tháng {month}/{year}
            </h3>
          </div>
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Lương cơ bản", val: pay("LuongCoBan"), raw: false, highlight: false },
              { label: "Phụ cấp", val: pay("PhuCap"), raw: false, highlight: false },
              { label: "Ngày công", val: `${pay("SoNgayCongThucTe")} ngày`, raw: true, highlight: false },
              { label: "Thưởng", val: pay("Thuong"), raw: false, highlight: false },
              { label: "Bảo hiểm", val: pay("KhauTruBH"), raw: false, highlight: false },
              { label: "Thực nhận", val: pay("TongLuong"), raw: false, highlight: true },
            ].map(({ label, val, raw, highlight }) => (
              <div key={label} style={{
                padding: "14px 16px", borderRadius: 14,
                background: highlight ? "#111" : "#f8f8f8",
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: highlight ? "rgba(255,255,255,0.5)" : "#888", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {label}
                </p>
                <p style={{ fontSize: 16, fontWeight: 800, margin: "6px 0 0", color: highlight ? "#fff" : "#111" }}>
                  {raw ? val : formatCurrency(val)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
};

