import React from "react";
import { Users, Building2, FolderKanban, Wallet } from "lucide-react";
import { StatCard } from "../../components/UI/index";
import { formatCurrency } from "../../utils/helpers";

interface DashboardStatsProps {
  userLevel: number;
  stats: { employees: number | string | null; departments: number | string | null };
  myProjects: any[];
  month: number;
  pay: (key: string) => any;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ userLevel, stats, myProjects, month, pay }) => {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${userLevel >= 2 ? 4 : 2}, 1fr)`,
      gap: 16,
    }}>
      {userLevel >= 2 && (
        <>
          <StatCard label="Tổng nhân viên" value={stats.employees ?? "—"} icon={<Users size={20} />} />
          <StatCard label="Phòng ban" value={stats.departments ?? "—"} icon={<Building2 size={20} />} />
        </>
      )}
      <StatCard label="Dự án tham gia" value={Array.isArray(myProjects) ? myProjects.length : 0} icon={<FolderKanban size={20} />} />
      <StatCard
        label={`Lương tháng ${month}`}
        value={pay("TongLuong") ? formatCurrency(pay("TongLuong")) : "Chưa chốt"}
        icon={<Wallet size={20} />}
      />
    </div>
  );
};

