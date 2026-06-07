import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { toast, getCurrentMonthYear } from "../../utils/helpers";
import { getManv, getUserLevel } from "../../utils/user";

export const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];

export const usePayroll = (user: any) => {
  const { month: curMonth, year: curYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(curMonth);
  const [year, setYear] = useState(curYear);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [myPayroll, setMyPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ type: "", data: null as any });

  const userLevel = getUserLevel(user);
  const MA_NV = getManv(user);
  const isHR = userLevel >= 3;

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      if (isHR) {
        const res = await api.getPayroll(year, month);
        const d = res.data;
        setPayroll(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []);
      } else {
        const res = await api.getMyPayroll(MA_NV, year, month);
        const d = res.data;
        setMyPayroll(d?.data || d || null);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPayroll([]);
        setMyPayroll(null);
      } else {
        toast.error("Không thể tải bảng lương!");
      }
    } finally {
      setLoading(false);
    }
  }, [isHR, MA_NV, month, year]);

  useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y: number) => y - 1); }
    else setMonth((m: number) => m - 1);
  };

  const nextMonth = () => {
    const now = new Date();
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return;
    if (month === 12) { setMonth(1); setYear((y: number) => y + 1); }
    else setMonth((m: number) => m + 1);
  };

  // Dùng thucLanh làm tổng ngân sách theo API mới
  const totalBudget = payroll.reduce((sum, r) => sum + (r.thucLanh ?? 0), 0);

  return {
    month, year, payroll, myPayroll, loading, modal, setModal,
    isHR, totalBudget, fetchPayroll, prevMonth, nextMonth,
  };
};
