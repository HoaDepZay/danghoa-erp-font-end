import React from "react";
import { FolderKanban, Clock, Wallet, Building2, BarChart3, RefreshCw } from "lucide-react";
import { Card } from "../../components/UI/index";
import { formatCurrency, getProp } from "../../utils/helpers";
import type { RealtimeData } from "./useDashboard";

interface DashboardChartProps {
  myProjects: any[];
  myPayroll: any;
  pay: (key: string) => any;
  month: number;
  year: number;
  realtimeData: RealtimeData | null;
  realtimeLoading: boolean;
  lastUpdated: Date | null;
  fetchRealtime: () => void;
  userLevel: number;
}

// ── Mini bar chart thuần CSS ───────────────────────────────────────────────────
const BarChart: React.FC<{ data: { label: string; value: number; max: number; color?: string }[] }> = ({ data }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {data.map(({ label, value, max, color = "#111" }) => {
      const pct = max > 0 ? Math.round((value / max) * 100) : 0;
      return (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "#555", fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
            <span style={{ fontWeight: 700, color: "#111" }}>{value}</span>
          </div>
          <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
          </div>
        </div>
      );
    })}
  </div>
);

// ── Donut chart thuần CSS (SVG) ────────────────────────────────────────────────
const DonutSlice: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p style={{ textAlign: "center", color: "#bbb", fontSize: 13 }}>Không có dữ liệu</p>;

  let offset = 0;
  const R = 40, C = 2 * Math.PI * R;
  const slices = data.map((d) => {
    const pct = d.value / total;
    const dash = pct * C;
    const s = { offset, dash, ...d };
    offset += dash;
    return s;
  });

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={R} fill="none" strokeWidth={14} stroke="#f0f0f0" />
        {slices.map((s) => (
          <circle
            key={s.label}
            cx={50} cy={50} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={14}
            strokeDasharray={`${s.dash} ${C - s.dash}`}
            strokeDashoffset={C / 4 - s.offset}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        ))}
        <text x={50} y={54} textAnchor="middle" fontSize={14} fontWeight={800} fill="#111">{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#555" }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, marginLeft: "auto", paddingLeft: 8, color: "#111" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export const DashboardChart: React.FC<DashboardChartProps> = ({
  myProjects, myPayroll, pay, month, year,
  realtimeData, realtimeLoading, lastUpdated, fetchRealtime, userLevel,
}) => {
  const deptData = realtimeData?.departmentHeadcount ?? [];
  const projStatus = realtimeData?.projectStatus ?? [];
  const maxEmp = Math.max(...deptData.map((d) => getProp(d, 'EmployeeCount') ?? 0), 1);

  // Màu cho các trạng thái dự án
  const STATUS_COLORS: Record<string, string> = {
    "Đang thực hiện": "#22c55e",
    "Hoàn thành":     "#3b82f6",
    "Tạm dừng":       "#f59e0b",
    "Không xác định": "#d1d5db",
  };

  return (
    <>
      {/* ── Charts khi là admin/quản lý ───────────────────────────────── */}
      {userLevel >= 2 && realtimeData && (
        <div className="grid-2">

          {/* Nhân sự theo phòng ban */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Building2 size={17} color="#aaa" />
                <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Nhân sự theo phòng ban</h3>
              </div>
              <span style={{ fontSize: 11, color: "#bbb" }}>{deptData.length} phòng</span>
            </div>
            {deptData.length === 0
              ? <p style={{ textAlign: "center", color: "#bbb", fontSize: 13, padding: "20px 0" }}>Không có dữ liệu</p>
              : <BarChart data={deptData.map((d) => ({ label: getProp(d, 'TEN_PB'), value: getProp(d, 'EmployeeCount') ?? 0, max: maxEmp, color: "#111" }))} />
            }
          </Card>

          {/* Trạng thái dự án */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <BarChart3 size={17} color="#aaa" />
              <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Trạng thái dự án</h3>
            </div>
            <DonutSlice
              data={projStatus.map((p) => {
                const status = getProp(p, 'TRANG_THAI');
                return {
                  label: status,
                  value: getProp(p, 'SoLuong') ?? 0,
                  color: STATUS_COLORS[status] ?? "#a3a3a3",
                };
              })}
            />
          </Card>
        </div>
      )}

      {/* ── Dự án cá nhân ─────────────────────────────────────────────── */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <FolderKanban size={17} color="#aaa" />
          <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Dự án đang tham gia</h3>
        </div>
        {(!Array.isArray(myProjects) || myProjects.length === 0) ? (
          <p style={{ textAlign: "center", color: "#bbb", fontSize: 13, padding: "24px 0" }}>Chưa tham gia dự án nào</p>
        ) : (
          <div>
            {myProjects.slice(0, 5).map((p, i) => {
              const MA_DA = getProp(p, 'MA_DA') ?? getProp(p, 'id') ?? i;
              const TEN_DA = getProp(p, 'TEN_DA') ?? getProp(p, 'ten') ?? "Dự án";
              const vaiTro = getProp(p, 'VAI_TRO_DU_AN') ?? getProp(p, 'vaitro') ?? "Thành viên";
              const THOI_GIAN = getProp(p, 'THOI_GIAN') ?? 0;
              return (
              <div key={MA_DA} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 0",
                borderBottom: i < Math.min(myProjects.length, 5) - 1 ? "1px solid #f5f5f5" : "none",
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{TEN_DA}</p>
                  <p style={{ fontSize: 11, color: "#999", margin: "2px 0 0" }}>{vaiTro}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#aaa", fontSize: 12 }}>
                  <Clock size={12} />
                  <span>{THOI_GIAN}h</span>
                </div>
              </div>
            )})}
          </div>
        )}
      </Card>

      {/* ── Phiếu lương cá nhân ───────────────────────────────────────── */}
      {myPayroll && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Wallet size={17} color="#aaa" />
            <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Phiếu lương tháng {month}/{year}</h3>
          </div>
          <div className="grid-3">
            {[
              { label: "Lương cơ bản",   val: pay("LuongCoBan"),           raw: false, highlight: false },
              { label: "Phụ cấp",        val: pay("PhuCap"),               raw: false, highlight: false },
              { label: "Ngày công",      val: `${pay("SoNgayCongThucTe")} ngày`, raw: true, highlight: false },
              { label: "Thưởng",         val: pay("Thuong"),               raw: false, highlight: false },
              { label: "Bảo hiểm",       val: pay("KhauTruBH"),            raw: false, highlight: false },
              { label: "Thực nhận",      val: pay("TongLuong"),            raw: false, highlight: true  },
            ].map(({ label, val, raw, highlight }) => (
              <div key={label} style={{ padding: "14px 16px", borderRadius: 14, background: highlight ? "#111" : "#f8f8f8" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: highlight ? "rgba(255,255,255,0.5)" : "#888", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ fontSize: 16, fontWeight: 800, margin: "6px 0 0", color: highlight ? "#fff" : "#111" }}>
                  {raw ? val : formatCurrency(val)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Footer: timestamp + nút refresh ──────────────────────────── */}
      {userLevel >= 2 && lastUpdated && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#bbb" }}>
            Cập nhật lúc {lastUpdated.toLocaleTimeString("vi-VN")} · tự làm mới sau 60s
          </span>
          <button
            onClick={fetchRealtime}
            disabled={realtimeLoading}
            style={{ background: "none", border: "1px solid #e5e5e5", borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "#555", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit" }}
          >
            <RefreshCw size={12} style={{ animation: realtimeLoading ? "spin 0.8s linear infinite" : "none" }} />
            {realtimeLoading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      )}
    </>
  );
};
