import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { toArray, getUserLevel } from "../../utils/user";

export const useDepartments = (user: any) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: "", data: null as any });

  // Dùng getUserLevel từ utils/user để xử lý đúng case:
  // "admin" / "Admin" / "ADMIN" đều → level 4
  const userLevel = getUserLevel(user);
  const isAdmin = userLevel >= 4;

  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      // Đối với Admin/Quản lý: Lấy toàn bộ danh sách phòng ban
      const res = await api.getDepartments();
      const d = res.data?.data ?? res.data;
      console.log("Admin/Manager - Loading all departments:", d);
      setDepartments(Array.isArray(d) ? d : []);
    } catch {
      toast.error("Không thể tải danh sách phòng ban!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);

  useEffect(() => {
    api.getEmployees({ pageSize: 200 })
      .then((r: any) => setEmployees(toArray(r.data?.data || r.data?.employees || r.data)))
      .catch(() => {});
  }, []);

  return { departments, employees, loading, modal, setModal, userLevel, isAdmin, fetchDepts };
};
