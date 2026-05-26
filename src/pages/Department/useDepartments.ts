import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { toArray, getUserLevel } from "../../utils/user";

export const useDepartments = (user: any) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: "", data: null as any });

  const userLevel = getUserLevel(user);
  const isAdmin = userLevel >= 4;

  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        api.getDepartments(),
        api.getEmployees({ pageSize: 200 })
      ]);
      const d = deptRes.data?.data ?? deptRes.data;
      setDepartments(Array.isArray(d) ? d : []);
      setEmployees(toArray(empRes.data?.data || empRes.data?.employees || empRes.data));
    } catch {
      toast.error("Không thể tải danh sách phòng ban hoặc nhân viên!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepts();
  }, [fetchDepts]);

  return { departments, employees, loading, modal, setModal, userLevel, isAdmin, fetchDepts };
};

