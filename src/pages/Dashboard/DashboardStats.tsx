import React from "react";
import { Users, Building2, FolderKanban, Wallet, Briefcase, CheckCircle, Activity, Clock } from "lucide-react";
import { StatCard } from "../../components/UI/index";
import { formatCurrency } from "../../utils/helpers";
import type { RealtimeData } from "./useDashboard";

interface DashboardStatsProps {
  userLevel: number;
  realtimeData: RealtimeData | null;
  myProjects: any[];
  month: number;
  pay: (key: string) => any;
  realtimeLoading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  userLevel, realtimeData, myProjects, month, pay, realtimeLoading,
}) => {
  const qs = realtimeData?.quickStats;
  const att = realtimeData?.attendanceToday;

  if (userLevel >= 2 && qs) {
    // Admin / Quản lý: hiển thị stats từ realtime API
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Hàng 1: nhân sự */}
        <div className="grid-4">
          <StatCard
            label="Tổng nhân viên"
            value={qs.TotalEmployees}
            icon={<Users size={20} />}
            trend={`${qs.OfficialEmployees} chính thức`}
          />
          <StatCard
            label="Phòng ban"
            value={qs.TotalDepartments}
            icon={<Building2 size={20} />}
          />
          <StatCard
            label="Tổng dự án"
            value={qs.TotalProjects}
            icon={<Briefcase size={20} />}
            trend={`${qs.ActiveProjects} đang chạy`}
          />
          <StatCard
            label="Chấm công hôm nay"
            value={`${att?.CheckedInToday ?? 0}/${att?.TotalEmployees ?? 0}`}
            icon={<Activity size={20} />}
            trend={`${att?.AttendanceRate ?? 0}%`}
          />
        </div>

        {/* Hàng 2: lương + dự án hoàn thành */}
        <div className="grid-4" style={{ gap: 14 }}>
          <StatCard
            label="Lương TB (VNĐ)"
            value={qs.AvgSalary > 0 ? formatCurrency(qs.AvgSalary) : "Chưa có"}
            icon={<Wallet size={20} />}
          />
          <StatCard
            label="Tổng quỹ lương"
            value={qs.TotalSalary > 0 ? formatCurrency(qs.TotalSalary) : "Chưa có"}
            icon={<Wallet size={20} />}
          />
          <StatCard
            label="Dự án hoàn thành"
            value={qs.CompletedProjects}
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            label={`Lương tháng ${month}`}
            value={pay("TongLuong") ? formatCurrency(pay("TongLuong")) : "Chưa chốt"}
            icon={<Clock size={20} />}
          />
        </div>
      </div>
    );
  }

  // Nhân viên thường: stats cá nhân
  return (
    <div className="grid-2">
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
  );
};
