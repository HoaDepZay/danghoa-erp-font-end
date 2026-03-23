import React from "react";
import { TrendingUp } from "lucide-react";
import { Spinner } from "../../components/UI/index";
import { getUserName } from "../../utils/user";
import { useDashboard } from "./useDashboard";
import { DashboardStats } from "./DashboardStats";
import { DashboardChart } from "./DashboardChart";

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { stats, myProjects, myPayroll, loading, userLevel, month, year, pay } = useDashboard(user);

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
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <TrendingUp size={24} color="#fff" />
        </div>
      </div>

      <DashboardStats userLevel={userLevel} stats={stats} myProjects={myProjects} month={month} pay={pay} />
      
      <DashboardChart myProjects={myProjects} myPayroll={myPayroll} pay={pay} month={month} year={year} />
    </div>
  );
};

export default Dashboard;

