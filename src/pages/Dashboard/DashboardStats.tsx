import React from "react";
import { Users, Building2, FolderKanban, Wallet, Briefcase, CheckCircle, Activity, Clock } from "lucide-react";
import { StatCard } from "../../components/UI/index";
import { formatCurrency, getProp } from "../../utils/helpers";
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
            value={getProp(qs, 'TotalEmployees') ?? 0}
            icon={<Users size={20} />}
            trend={`${getProp(qs, 'OfficialEmployees') ?? 0} chính thức`}
          />
          <StatCard
            label="Phòng ban"
            value={getProp(qs, 'TotalDepartments') ?? 0}
            icon={<Building2 size={20} />}
          />
          <StatCard
            label="Tổng dự án"
            value={getProp(qs, 'TotalProjects') ?? 0}
            icon={<Briefcase size={20} />}
            trend={`${getProp(qs, 'ActiveProjects') ?? 0} đang chạy`}
          />
          <StatCard
            label="Chấm công hôm nay"
            value={`${getProp(att, 'CheckedInToday') ?? 0}/${getProp(att, 'TotalEmployees') ?? 0}`}
            icon={<Activity size={20} />}
            trend={`${getProp(att, 'AttendanceRate') ?? 0}%`}
          />
        </div>

        {/* Hàng 2: lương + dự án hoàn thành */}
        <div className="grid-4" style={{ gap: 14 }}>
          <StatCard
            label="Đơn nghỉ chờ duyệt"
            value={getProp(qs, 'PendingLeaves') ?? 0}
            icon={<Clock size={20} />}
            trend="Cần xử lý"
          />
          <StatCard
            label="Quỹ lương ước tính"
            value={formatCurrency(getProp(qs, 'TotalSalary') ?? 0)}
            icon={<Wallet size={20} />}
          />
          <StatCard
            label="Dự án hoàn thành"
            value={getProp(qs, 'CompletedProjects') ?? 0}
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            label="Lượt duyệt phép"
            value={getProp(qs, 'ApprovedLeaves') ?? 0}
            icon={<CheckCircle size={20} />}
            trend="Trong tháng"
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
