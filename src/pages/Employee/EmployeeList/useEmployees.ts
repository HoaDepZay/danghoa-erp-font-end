import { useState, useEffect, useCallback } from "react";
import { api } from "../../../services/api";
import { toast, exportToCsv } from "../../../utils/helpers";
import { toArray } from "../../../utils/user";

export const ROLE_COLORS: Record<string, string> = { "Quản lý": "black", "Nhân viên": "gray", "Cộng tác viên": "blue", "Admin": "purple" };
export const PAGE_SIZE = 10;

export const useEmployees = (user: any) => {
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Filters
  const [filterDept, setFilterDept] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ type: "", data: null as any });

  const ROLE_LEVELS: Record<string, number> = { "Cộng tác viên": 1, "Nhân viên": 2, "Quản lý": 3, "Admin": 4 };
  const userLevel = ROLE_LEVELS[user?.CHUC_VU] || ROLE_LEVELS[user?.role] || 1;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      // Lấy toàn bộ nhân viên và dữ liệu chấm công hôm nay để tính toán stats
      const today = new Date().toISOString().split('T')[0];
      const [empRes, attRes] = await Promise.all([
        api.getEmployees({ page: 1, pageSize: 10000 }),
        api.getAttendanceByDate(today).catch(() => ({ data: [] }))
      ]);
      const d = empRes.data;
      const arr = toArray(d);

      const attendanceData = Array.isArray(attRes.data) ? attRes.data : Array.isArray(attRes.data?.data) ? attRes.data.data : [];
      const attendanceMap: Record<string, string> = {};
      attendanceData.forEach((att: any) => {
        attendanceMap[att.MA_NV] = att.TRANG_THAI;
      });

      const employeesWithStatus = arr.map(emp => ({
        ...emp,
        trang_thai_hom_nay: attendanceMap[emp.MA_NV] || "Chưa check-in"
      }));

      setAllEmployees(employeesWithStatus);
    } catch {
      toast.error("Không thể tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => {
    api.getDepartments().then((r: any) => {
      const d = r.data;
      setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
    }).catch(() => {});
  }, []);

  const handleExport = () => {
    exportToCsv("nhan_vien", ["Mã NV", "Họ tên", "EMAIL", "SĐT", "Chức vụ", "Phòng ban", "Trạng thái hôm nay"],
      filteredEmployees.map((e) => [e.MA_NV, e.HO_TEN, e.EMAIL, e.SDT || e.SDT, e.CHUC_VU, e.TEN_PB, e.trang_thai_hom_nay]));
    toast.success("Xuất CSV thành công!");
  };

  // Client-side filtering
  const filteredEmployees = allEmployees.filter(emp => {
    // Search
    if (search) {
      const kw = search.toLowerCase();
      const matchSearch = (emp.HO_TEN?.toLowerCase().includes(kw)) ||
                          (emp.MA_NV?.toLowerCase().includes(kw)) ||
                          (emp.EMAIL?.toLowerCase().includes(kw));
      if (!matchSearch) return false;
    }
    // Filters
    if (filterDept !== "all" && emp.TEN_PB !== filterDept) return false;
    if (filterRole !== "all" && emp.CHUC_VU !== filterRole) return false;
    
    const statusText = emp.trang_thai_hom_nay;
    if (filterStatus !== "all") {
      if (filterStatus === "working" && statusText !== "Đang làm việc") return false;
      if (filterStatus === "off" && statusText !== "Đang nghỉ" && statusText !== "Vắng mặt" && statusText !== "Nghỉ việc") return false;
      if (filterStatus === "other" && statusText === "Đang làm việc" && statusText === "Đang nghỉ" && statusText === "Vắng mặt" && statusText === "Nghỉ việc") return false;
    }
    
    return true;
  });

  // Client-side pagination
  const total = filteredEmployees.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const employees = filteredEmployees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const totalEmployees = allEmployees.length;
  const workingCount = allEmployees.filter(e => e.trang_thai_hom_nay === "Đang làm việc").length;
  const offCount = allEmployees.filter(e => e.trang_thai_hom_nay === "Đang nghỉ" || e.trang_thai_hom_nay === "Vắng mặt" || e.trang_thai_hom_nay === "Nghỉ việc").length;

  return {
    employees, departments, loading, search, setSearch, page, setPage, total, totalPages,
    modal, setModal, userLevel, fetchEmployees, handleExport,
    filterDept, setFilterDept, filterRole, setFilterRole, filterStatus, setFilterStatus,
    stats: { totalEmployees, workingCount, offCount }
  };
};

