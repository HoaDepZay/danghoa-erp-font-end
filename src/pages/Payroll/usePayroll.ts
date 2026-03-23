import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { toast, getCurrentMonthYear } from "../../utils/helpers";
import { getManv } from "../../utils/user";

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
  const [generating, setGenerating] = useState(false);
  const [modal, setModal] = useState({ type: "", data: null as any });

  const ROLE_LEVELS: Record<string, number> = { "Cộng tác viên": 1, "Nhân viên": 2, "Quản lý": 3, "Admin": 4 };
  const userLevel = ROLE_LEVELS[user?.chuc_vu] || ROLE_LEVELS[user?.CHUCVU] || ROLE_LEVELS[user?.role] || 1;
  const manv = getManv(user);
  const isHR = userLevel >= 3;

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      if (isHR) {
        const res = await api.getPayroll(year, month);
        const d = res.data;
        setPayroll(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
      } else {
        const res = await api.getMyPayroll(manv, year, month);
        setMyPayroll(res.data || null);
      }
    } catch (err: any) {
      if (err.response?.status === 404) { setPayroll([]); setMyPayroll(null); }
      else toast.error("Không thể tải bảng lương!");
    } finally { setLoading(false); }
  }, [isHR, manv, month, year]);

  useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

  const handleGenerate = async () => {
    if (!window.confirm(`Chốt lương tháng ${month}/${year}?`)) return;
    setGenerating(true);
    try {
      await api.generatePayroll({ month, year });
      toast.success(`Đã chốt lương tháng ${month}/${year}!`);
      fetchPayroll();
    } catch (err: any) { toast.error(err.response?.data?.message || "Lỗi chốt lương!"); }
    finally { setGenerating(false); }
  };

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear((y: number) => y - 1); } else setMonth((m: number) => m - 1); };
  const nextMonth = () => {
    const now = new Date();
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return;
    if (month === 12) { setMonth(1); setYear((y: number) => y + 1); } else setMonth((m: number) => m + 1);
  };

  const totalBudget = payroll.reduce((sum, r) => sum + (r.TONGLUONG || r.TongLuong || 0), 0);

  return {
    month, year, payroll, myPayroll, loading, generating, modal, setModal,
    isHR, totalBudget, fetchPayroll, handleGenerate, prevMonth, nextMonth
  };
};

