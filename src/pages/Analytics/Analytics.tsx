import { Btn } from '../../components/UI';
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { formatCurrency, getProp } from "../../utils/helpers";
import { TrendingUp, Users, Wallet, ScanLine, RefreshCw, Building2 } from "lucide-react";
import { Spinner, Card } from "../../components/UI/index";
// ── Mini Line Chart SVG thuần ─────────────────────────────────────────────────
const LineChart = ({ data, color = "#6366f1", label }: { data: number[]; color?: string; label: string }) => {
  if (!data || data.length < 2) return <p style={{ color: "#bbb", fontSize: 12 }}>Chưa có dữ liệu</p>;
  const max = Math.max(...data, 1);
  const W = 260, H = 80, P = 8;
  const xStep = (W - P * 2) / (data.length - 1);
  const points = data.map((v, i) => `${P + i * xStep},${H - P - ((v / max) * (H - P * 2))}`).join(" ");
  const area = `${P},${H - P} ${points} ${P + (data.length - 1) * xStep},${H - P}`;
  return (
    <div>
      <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</p>
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#grad-${label})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((v, i) => (
          <circle key={i} cx={P + i * xStep} cy={H - P - ((v / max) * (H - P * 2))} r={3} fill={color} />
        ))}
      </svg>
    </div>
  );
};

// ── Horizontal Bar ─────────────────────────────────────────────────────────────
const HBar = ({ label, value, max, color, formatter = (v: number) => String(v) }:
  { label: string; value: number; max: number; color: string; formatter?: (v: number) => string }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
        <span style={{ color: "#475569", fontWeight: 600, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ fontWeight: 700, color: "#1e293b" }}>{formatter(value)}</span>
      </div>
      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 8, transition: "width 0.7s ease" }} />
      </div>
    </div>
  );
};

// ── Donut SVG ──────────────────────────────────────────────────────────────────
const DonutChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p style={{ color: "#bbb", fontSize: 13 }}>Chưa có dữ liệu</p>;
  const R = 46, C = 2 * Math.PI * R;
  let offset = 0;
  const slices = data.map(d => {
    const dash = (d.value / total) * C;
    const s = { ...d, offset, dash };
    offset += dash;
    return s;
  });
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={R} fill="none" strokeWidth={16} stroke="#f1f5f9" />
        {slices.map(s => (
          <circle key={s.label} cx={55} cy={55} r={R} fill="none" stroke={s.color} strokeWidth={16}
            strokeDasharray={`${s.dash} ${C - s.dash}`} strokeDashoffset={C / 4 - s.offset}
            style={{ transition: "stroke-dasharray 0.7s ease" }} />
        ))}
        <text x={55} y={59} textAnchor="middle" fontSize={15} fontWeight={800} fill="#1e293b">{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#64748b" }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, marginLeft: "auto", paddingLeft: 12, color: "#1e293b" }}>
              {s.value} <span style={{ fontWeight: 400, color: "#94a3b8" }}>({Math.round(s.value / total * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Analytics Page ────────────────────────────────────────────────────────
const Analytics = ({ user }: { user: any }) => {
  const [turnover,   setTurnover]   = useState<any[]>([]);
  const [salaryCost, setSalaryCost] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [summary,    setSummary]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, s, a, sm] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getAnalyticsSalaryCost(),
        api.getAnalyticsAttendance(),
        api.getAnalyticsSummary(),
      ]);
      setTurnover(t.data?.data   || []);
      setSalaryCost(s.data?.data || []);
      setAttendance(a.data?.data || []);
      setSummary(sm.data?.data   || null);
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const maxSalary = Math.max(...salaryCost.map((d: any) => getProp(d, 'TongLuong') || 0), 1);
  const ROLE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>HR Analytics</h2>
          <p>Phân tích nhân sự chuyên sâu dành cho Ban Giám đốc & HR Manager</p>
        </div>
        <div className="section-header-actions">
          <Btn className="btn btn-secondary" onClick={fetchAll} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={15} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
            Làm mới
          </Btn>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner size={36} /></div>
      ) : (
        <>
          {/* ── KPI Summary ── */}
          {summary?.employeeStats && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
              {[
                { label: "Tổng nhân viên",    value: getProp(summary.employeeStats, 'TongSo'),       icon: <Users size={18} />,    color: "#6366f1", bg: "#eef2ff" },
                { label: "Chính thức",         value: getProp(summary.employeeStats, 'ChinhThuc'),    icon: <Users size={18} />,    color: "#22c55e", bg: "#f0fdf4" },
                { label: "Thử việc",           value: getProp(summary.employeeStats, 'ThuViec'),      icon: <Users size={18} />,    color: "#f59e0b", bg: "#fffbeb" },
                { label: "Lương trung bình",   value: formatCurrency(getProp(summary.employeeStats, 'LuongTrungBinh')), icon: <Wallet size={18} />, color: "#0ea5e9", bg: "#f0f9ff", isText: true },
              ].map(item => (
                <div key={item.label} style={{
                  background: "#fff", borderRadius: 16, padding: "18px 20px",
                  border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", color: item.color, marginBottom: 12 }}>
                    {item.icon}
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase" }}>{item.label}</p>
                  <p style={{ fontSize: (item as any).isText ? 16 : 26, fontWeight: 800, color: "#1e293b", margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid-2">
            {/* ── Biến động nhân sự (Line Chart) ── */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <TrendingUp size={17} color="#6366f1" />
                <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Biến động tuyển dụng 12 tháng</h3>
              </div>
              {turnover.length > 0 ? (
                <>
                  <LineChart
                    data={turnover.map((d: any) => getProp(d, 'NhanVienMoi') || 0)}
                    color="#6366f1"
                    label="Nhân viên tuyển mới theo tháng"
                  />
                  <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                    {turnover.slice(-6).map((d: any) => (
                      <div key={`${getProp(d, 'Nam')}-${getProp(d, 'Thang')}`} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#6366f1" }}>{getProp(d, 'NhanVienMoi') || 0}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{getProp(d, 'Thang')}/{getProp(d, 'Nam')}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ color: "#bbb", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Chưa có dữ liệu tuyển dụng</p>
              )}
            </Card>

            {/* ── Phân bổ nhân sự theo chức vụ (Donut) ── */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Users size={17} color="#22c55e" />
                <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Phân bổ theo chức vụ</h3>
              </div>
              {summary?.byRole?.length > 0 ? (
                <DonutChart data={summary.byRole.map((r: any, i: number) => ({
                  label: getProp(r, 'CHUC_VU') || "Khác",
                  value: getProp(r, 'SoLuong') || 0,
                  color: ROLE_COLORS[i % ROLE_COLORS.length],
                }))} />
              ) : (
                <p style={{ color: "#bbb", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Chưa có dữ liệu</p>
              )}
            </Card>
          </div>

          <div className="grid-2">
            {/* ── Chi phí lương theo phòng ban ── */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Wallet size={17} color="#f59e0b" />
                <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Chi phí lương theo phòng ban</h3>
              </div>
              {salaryCost.length > 0 ? salaryCost.map((d: any) => (
                <HBar
                  key={getProp(d, 'MA_PHG') || Math.random()}
                  label={getProp(d, 'TEN_PB') || "—"}
                  value={getProp(d, 'TongLuong') || 0}
                  max={maxSalary}
                  color="#f59e0b"
                  formatter={v => formatCurrency(v)}
                />
              )) : (
                <p style={{ color: "#bbb", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Chưa có dữ liệu lương</p>
              )}
            </Card>

            {/* ── Chấm công 6 tháng gần nhất ── */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <ScanLine size={17} color="#0ea5e9" />
                <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Chấm công 6 tháng gần nhất</h3>
              </div>
              {attendance.length > 0 ? (
                <>
                  <LineChart
                    data={[...attendance].reverse().map((d: any) => getProp(d, 'TyLeDungGio') || 0)}
                    color="#0ea5e9"
                    label="Tỷ lệ % đúng giờ theo tháng"
                  />
                  <div style={{ marginTop: 16 }}>
                    {[...attendance].slice(0, 4).map((d: any) => (
                      <div key={`${getProp(d, 'Nam')}-${getProp(d, 'Thang')}`} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
                        <span style={{ color: "#64748b" }}>Tháng {getProp(d, 'Thang')}/{getProp(d, 'Nam')}</span>
                        <span style={{ fontWeight: 700 }}>{getProp(d, 'SoNhanVienDiLam') || 0} NV · {getProp(d, 'SoLuotDiTre') || 0} lần trễ · <span style={{ color: "#0ea5e9" }}>{getProp(d, 'TyLeDungGio') || 0}% đúng giờ</span></span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ color: "#bbb", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Chưa có dữ liệu chấm công</p>
              )}
            </Card>
          </div>

          {/* ── Top phòng ban theo nhân sự ── */}
          {summary?.topDepartments?.length > 0 && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Building2 size={17} color="#8b5cf6" />
                <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Top phòng ban nhiều nhân sự nhất</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {summary.topDepartments.map((d: any, i: number) => (
                  <div key={getProp(d, 'TEN_PB') || i} style={{
                    padding: "14px 16px", borderRadius: 14,
                    background: i === 0 ? "#1e293b" : "#f8fafc",
                    border: "1px solid " + (i === 0 ? "#1e293b" : "#f1f5f9"),
                  }}>
                    <p style={{ fontSize: 11, margin: "0 0 6px", color: i === 0 ? "rgba(255,255,255,0.5)" : "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                      #{i + 1} · {getProp(d, 'TEN_PB')}
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 800, margin: "0 0 2px", color: i === 0 ? "#fff" : "#1e293b" }}>
                      {getProp(d, 'SoNhanVien') || 0} <span style={{ fontSize: 12, fontWeight: 400 }}>NV</span>
                    </p>
                    <p style={{ fontSize: 12, color: i === 0 ? "rgba(255,255,255,0.5)" : "#64748b", margin: 0 }}>
                      {formatCurrency(getProp(d, 'TongLuong') || 0)}/tháng
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
