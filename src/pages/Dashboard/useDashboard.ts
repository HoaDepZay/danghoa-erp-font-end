import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { getCurrentMonthYear } from "../../utils/helpers";
import { getManv, toArray, getUserLevel } from "../../utils/user";

export interface RealtimeData {
  quickStats: {
    TotalEmployees: number;
    OfficialEmployees: number;
    NonOfficialEmployees: number;
    AvgSalary: number;
    TotalSalary: number;
    TotalProjects: number;
    ActiveProjects: number;
    CompletedProjects: number;
    PendingLeaves: number;
    ApprovedLeaves: number;
    TotalDepartments: number;
    GeneratedAt: string;
  };
  departmentHeadcount: { MAPHG: number; TENPB: string; EmployeeCount: number; AvgSalary: number }[];
  projectStatus: { TrangThai: string; SoLuong: number }[];
  attendanceToday: { CheckedInToday: number; TotalEmployees: number; AttendanceRate: number };
}

export const useDashboard = (user: any) => {
  const [realtimeData, setRealtimeData]   = useState<RealtimeData | null>(null);
  const [myProjects, setMyProjects]       = useState<any[]>([]);
  const [myPayroll, setMyPayroll]         = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [lastUpdated, setLastUpdated]     = useState<Date | null>(null);

  const userLevel = getUserLevel(user);
  const { month, year } = getCurrentMonthYear();
  const MA_NV = getManv(user);

  // Fetch realtime stats (chỉ admin/quản lý)
  const fetchRealtime = useCallback(async () => {
    if (userLevel < 2) return;
    setRealtimeLoading(true);
    try {
      const res = await api.getDashboardRealtime();
      if (res.data?.success && res.data?.data) {
        setRealtimeData(res.data.data);
        setLastUpdated(new Date());
      }
    } catch { /* fallback gracefully */ }
    finally { setRealtimeLoading(false); }
  }, [userLevel]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Dự án cá nhân
        try {
          const projRes = await api.getMyProjects(MA_NV);
          setMyProjects(toArray(projRes.data));
        } catch { setMyProjects([]); }

        // Lương cá nhân
        if (MA_NV) {
          try {
            const payRes = await api.getMyPayroll(MA_NV, year, month);
            setMyPayroll(payRes.data || null);
          } catch { setMyPayroll(null); }
        }

        // Realtime dashboard (admin/quản lý)
        await fetchRealtime();
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user, userLevel, month, year, MA_NV, fetchRealtime]);

  // Auto-refresh realtime mỗi 60 giây
  useEffect(() => {
    if (userLevel < 2) return;
    const interval = setInterval(fetchRealtime, 60_000);
    return () => clearInterval(interval);
  }, [userLevel, fetchRealtime]);

  const pay = (key: string) => {
    if (!myPayroll) return 0;
    return myPayroll[key] ?? myPayroll[key.toUpperCase()] ?? 0;
  };

  return {
    realtimeData, myProjects, myPayroll,
    loading, realtimeLoading, lastUpdated,
    userLevel, month, year, pay, fetchRealtime,
  };
};
