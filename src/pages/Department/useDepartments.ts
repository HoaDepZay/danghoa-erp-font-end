import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { toArray } from "../../utils/user";

export const useDepartments = (user: any) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: "", data: null as any });

  const ROLE_LEVELS: Record<string, number> = { "Cộng tác viên": 1, "Nhân viên": 2, "Quản lý": 3, "Admin": 4 };
  const userLevel = ROLE_LEVELS[user?.chuc_vu] || ROLE_LEVELS[user?.CHUCVU] || ROLE_LEVELS[user?.role] || 1;

  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getDepartments();
      const d = res.data;
      setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
    } catch { toast.error("Không thể tải danh sách phòng ban!"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);
  useEffect(() => {
    api.getEmployees({ pageSize: 200 })
      .then((r: any) => setEmployees(toArray(r.data?.data || r.data?.employees || r.data)))
      .catch(() => {});
  }, []);

  return { departments, employees, loading, modal, setModal, userLevel, fetchDepts };
};

