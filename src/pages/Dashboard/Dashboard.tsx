import { Btn } from '../../components/UI';
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

  const role = user?.chuc_vu || user?.CHUC_VU || user?.role || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">

      {/* Welcome banner */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 className="dashboard-title" style={{ fontSize: 28, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>
            Tổng quan hệ thống
          </h3>
          <p className="dashboard-subtitle" style={{ fontSize: 16, color: "var(--text-muted)", margin: 0 }}>
            Chào mừng trở lại, {getUserName(user)}! Dưới đây là tình hình hoạt động tháng {month}/{year}.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Nút refresh realtime */}
          {userLevel >= 2 && (
            <Btn
              onClick={fetchRealtime}
              disabled={realtimeLoading}
              title="Làm mới dữ liệu realtime"
              className="btn btn-secondary"
              style={{ padding: "10px", borderRadius: 10 }}
            >
              <RefreshCw
                size={18}
                style={{ animation: realtimeLoading ? "spin 0.8s linear infinite" : "none" }}
              />
            </Btn>
          )}
          <Btn className="btn btn-primary" style={{ height: 40 }}>
            <TrendingUp size={18} />
            Báo cáo chi tiết
          </Btn>
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
