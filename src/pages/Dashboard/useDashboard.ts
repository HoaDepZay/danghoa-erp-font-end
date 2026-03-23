import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { getCurrentMonthYear } from "../../utils/helpers";
import { getManv, toArray, getUserLevel } from "../../utils/user";

export const useDashboard = (user: any) => {
  const [stats, setStats] = useState<{ employees: number | string | null; departments: number | string | null }>({ employees: null, departments: null });
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [myPayroll, setMyPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userLevel = getUserLevel(user);
  const { month, year } = getCurrentMonthYear();
  const manv = getManv(user);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        try {
          const projRes = await api.getMyProjects(manv);
          setMyProjects(toArray(projRes.data));
        } catch { setMyProjects([]); }

        if (manv) {
          try {
            const payRes = await api.getMyPayroll(manv, year, month);
            setMyPayroll(payRes.data || null);
          } catch { setMyPayroll(null); }
        }

        if (userLevel >= 2) {
          try {
            const [empRes, deptRes] = await Promise.allSettled([
              api.getEmployees({ page: 1, pageSize: 1 }),
              api.getDepartments(),
            ]);
            setStats({
              employees: empRes.status === "fulfilled"
                ? (empRes.value.data?.pagination?.totalRecords ?? empRes.value.data?.total ?? empRes.value.data?.data?.length ?? null)
                : null,
              departments: deptRes.status === "fulfilled"
                ? (Array.isArray(deptRes.value.data) ? deptRes.value.data.length
                  : Array.isArray(deptRes.value.data?.data) ? deptRes.value.data.data.length : null)
                : null,
            });
          } catch { /* no-op */ }
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user, userLevel, month, year, manv]);

  const pay = (key: string) => {
    if (!myPayroll) return 0;
    return myPayroll[key] ?? myPayroll[key.toUpperCase()] ?? 0;
  };

  return { stats, myProjects, myPayroll, loading, userLevel, month, year, pay };
};

