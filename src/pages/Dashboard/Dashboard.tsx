import React from "react";
import { TrendingUp, RefreshCw } from "lucide-react";
import { Spinner } from "../../components/UI/index";
import { getUserName } from "../../utils/user";
import { useDashboard } from "./useDashboard";
import { DashboardStats } from "./DashboardStats";
import { DashboardChart } from "./DashboardChart";

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const {
    realtimeData, myProjects, myPayroll,
    loading, realtimeLoading, lastUpdated,
    userLevel, month, year, pay, fetchRealtime,
  } = useDashboard(user);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
        <Spinner size={32} />
      </div>
    );
  }

  const role = user?.chuc_vu || user?.CHUCVU || user?.role || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">

      {/* Welcome banner */}
      <div style={{
        background: "linear-gradient(135deg, #111 0%, #333 100%)",
        borderRadius: 20, padding: "24px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff",
      }}>
        <div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>Chào mừng trở lại 👋</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 4px", color: "#fff" }}>
            {getUserName(user)}
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            {role} · Tháng {month}/{year}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Nút refresh realtime */}
          {userLevel >= 2 && (
            <button
              onClick={fetchRealtime}
              disabled={realtimeLoading}
              title="Làm mới dữ liệu realtime"
              style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 10, width: 38, height: 38, display: "flex",
                alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff",
              }}
            >
              <RefreshCw
                size={16}
                style={{ animation: realtimeLoading ? "spin 0.8s linear infinite" : "none" }}
              />
            </button>
          )}
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TrendingUp size={24} color="#fff" />
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <DashboardStats
        userLevel={userLevel}
        realtimeData={realtimeData}
        myProjects={myProjects}
        month={month}
        pay={pay}
        realtimeLoading={realtimeLoading}
      />

      {/* Charts + danh sách */}
      <DashboardChart
        myProjects={myProjects}
        myPayroll={myPayroll}
        pay={pay}
        month={month}
        year={year}
        realtimeData={realtimeData}
        realtimeLoading={realtimeLoading}
        lastUpdated={lastUpdated}
        fetchRealtime={fetchRealtime}
        userLevel={userLevel}
      />
    </div>
  );
};

export default Dashboard;
