import { useState, useEffect, useCallback } from "react";
import { api } from "../../../services/api";
import { toast, exportToCsv } from "../../../utils/helpers";
import { toArray } from "../../../utils/user";

export const ROLE_COLORS: Record<string, string> = { "Quản lý": "black", "Nhân viên": "gray", "Cộng tác viên": "blue", "Admin": "purple" };
export const PAGE_SIZE = 10;

export const useEmployees = (user: any) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState({ type: "", data: null as any });

  const ROLE_LEVELS: Record<string, number> = { "Cộng tác viên": 1, "Nhân viên": 2, "Quản lý": 3, "Admin": 4 };
  const userLevel = ROLE_LEVELS[user?.chuc_vu] || ROLE_LEVELS[user?.CHUCVU] || ROLE_LEVELS[user?.role] || 1;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getEmployees({ page, pageSize: PAGE_SIZE, search: search || undefined });
      const d = res.data;
      const arr = toArray(d);
      setEmployees(arr);
      setTotal(d?.pagination?.totalRecords ?? d?.total ?? arr.length);
    } catch {
      toast.error("Không thể tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => {
    api.getDepartments().then((r: any) => {
      const d = r.data;
      setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
    }).catch(() => {});
  }, []);

  const handleExport = () => {
    exportToCsv("nhan_vien", ["Mã NV", "Họ tên", "Email", "SĐT", "Chức vụ", "Phòng ban"],
      employees.map((e) => [e.MANV || e.MaNV, e.HOTEN || e.HoTen, e.EMAIL || e.Email, e.SODIENTHOA || e.SoDienThoai, e.CHUCVU || e.chucvu, e.TENPB || e.TenPB]));
    toast.success("Xuất CSV thành công!");
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    employees, departments, loading, search, setSearch, page, setPage, total, totalPages,
    modal, setModal, userLevel, fetchEmployees, handleExport
  };
};

