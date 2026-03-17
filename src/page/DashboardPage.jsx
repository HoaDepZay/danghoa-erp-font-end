import { useState, useEffect } from "react";
import { Users, Building2, FolderKanban, Wallet, TrendingUp, Clock } from "lucide-react";
import { api } from "../services/api";
import { formatCurrency, getCurrentMonthYear } from "../utils/helpers";
import { getManv, toArray, getUserLevel, getUserName } from "../utils/user";
import { Card, StatCard, Spinner } from "../components/UI/index";




const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState({ employees: null, departments: null });
  const [myProjects, setMyProjects] = useState([]);
  const [myPayroll, setMyPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  const userLevel = getUserLevel(user); // handles both login (role) and employee (chuc_vu/CHUCVU) format
  const { month, year } = getCurrentMonthYear();
  const manv = getManv(user);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch projects
        try {
          const projRes = await api.getMyProjects(manv);
          setMyProjects(toArray(projRes.data));
        } catch (e) {
          console.warn("Không tải được dự án:", e.message);
          setMyProjects([]);
        }

        // Fetch payroll (may 404 if not generated yet)
        if (manv) {
          try {
            const payRes = await api.getMyPayroll(manv, year, month);
            setMyPayroll(payRes.data || null);
          } catch {
            setMyPayroll(null);
          }
        }

        // Admin stats
        if (userLevel >= 2) {
          try {
            const [empRes, deptRes] = await Promise.allSettled([
              api.getEmployees({ page: 1, pageSize: 1 }),
              api.getDepartments(),
            ]);
            setStats({
              employees:
                empRes.status === "fulfilled"
                  ? empRes.value.data?.total ?? empRes.value.data?.data?.length ?? null
                  : null,
              departments:
                deptRes.status === "fulfilled"
                  ? (Array.isArray(deptRes.value.data) ? deptRes.value.data.length : null)
                  : null,
            });
          } catch {
            // no-op
          }
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user, userLevel, month, year, manv]);

  // Helper lấy giá trị payroll dù key uppercase hay camelCase
  const pay = (key) => {
    if (!myPayroll) return 0;
    return myPayroll[key] ?? myPayroll[key.toUpperCase()] ?? 0;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
        <Spinner size={32} className="text-gray-400" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome banner */}
      <div
        style={{
          backgroundColor: "#111", borderRadius: 20, padding: "24px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff",
        }}
      >
        <div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>Chào mừng trở lại 👋</p>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "6px 0 4px", color: "#fff" }}>
            {getUserName(user)}
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            {user?.chuc_vu} · Tháng {month}/{year}
          </p>
        </div>
        <div
          style={{
            width: 60, height: 60, borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <TrendingUp size={28} color="#fff" />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: userLevel >= 2 ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 16 }}>
        {userLevel >= 2 && (
          <>
            <StatCard label="Tổng nhân viên" value={stats.employees ?? "—"} icon={<Users size={20} />} />
            <StatCard label="Phòng ban" value={stats.departments ?? "—"} icon={<Building2 size={20} />} />
          </>
        )}
        <StatCard
          label="Dự án tham gia"
          value={Array.isArray(myProjects) ? myProjects.length : 0}
          icon={<FolderKanban size={20} />}
        />
        <StatCard
          label={`Lương tháng ${month}`}
          value={pay("TongLuong") ? formatCurrency(pay("TongLuong")) : "Chưa chốt"}
          icon={<Wallet size={20} />}
        />
      </div>

      {/* Recent projects */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <FolderKanban size={18} color="#aaa" />
          <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#111" }}>Dự án đang tham gia</h3>
        </div>
        {!Array.isArray(myProjects) || myProjects.length === 0 ? (
          <p style={{ textAlign: "center", color: "#bbb", fontSize: 14, padding: "28px 0" }}>
            Chưa tham gia dự án nào
          </p>
        ) : (
          <div>
            {myProjects.slice(0, 5).map((p, i) => (
              <div
                key={p.MADA || p.MaDA || i}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: i < Math.min(myProjects.length, 5) - 1 ? "1px solid #f5f5f5" : "none",
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#111" }}>
                    {p.TENDA || p.TenDA || "Dự án"}
                  </p>
                  <p style={{ fontSize: 12, color: "#999", margin: "2px 0 0" }}>
                    {p.VaiTroDuAn || "Thành viên"}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#aaa", fontSize: 12 }}>
                  <Clock size={13} />
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
            <Wallet size={18} color="#aaa" />
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#111" }}>
              Phiếu lương tháng {month}/{year}
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Lương cơ bản", val: pay("LuongCoBan") },
              { label: "Phụ cấp", val: pay("PhuCap") },
              { label: "Ngày công", val: `${pay("SoNgayCongThucTe")} ngày`, raw: true },
              { label: "Thưởng", val: pay("Thuong") },
              { label: "Bảo hiểm", val: pay("KhauTruBH") },
              { label: "Thực nhận", val: pay("TongLuong"), highlight: true },
            ].map(({ label, val, raw, highlight }) => (
              <div
                key={label}
                style={{
                  padding: "14px 16px", borderRadius: 14,
                  backgroundColor: highlight ? "#111" : "#f9f9f9",
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 600, color: highlight ? "rgba(255,255,255,0.5)" : "#999", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
    </div>
  );
};

export default DashboardPage;
