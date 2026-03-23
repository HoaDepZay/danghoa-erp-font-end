import { useState, useCallback } from "react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { getUserLevel } from "../../utils/user";

export const useAdmin = (user: any) => {
  const [activeTab, setActiveTab] = useState("employees");
  const userLevel = getUserLevel(user);
  const adminEmail = user?.email || user?.EMAIL || "";

  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [modal, setModal] = useState({ type: "", data: null as any });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.allSettled([
        api.getEmployees({ pageSize: 200 }),
        api.adminGetDepartments(),
      ]);
      if (empRes.status === "fulfilled") {
        const d = empRes.value.data;
        setEmployees(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.employees) ? d.employees : []);
      }
      if (deptRes.status === "fulfilled") {
        const d = deptRes.value.data;
        setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
      }
    } catch { toast.error("Không thể tải dữ liệu!"); }
    finally { setLoading(false); }
  }, []);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminGetDepartments();
      const d = res.data;
      setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
    } catch { toast.error("Không thể tải danh sách phòng ban!"); }
    finally { setLoading(false); }
  }, []);

  /** Lấy danh sách hồ sơ OTP_VERIFIED chờ duyệt */
  const fetchPendingOnboarding = useCallback(async () => {
    setOnboardingLoading(true);
    try {
      const [pendingRes, deptRes] = await Promise.allSettled([
        api.getPendingOnboarding(),
        api.adminGetDepartments(),
      ]);
      if (pendingRes.status === "fulfilled") {
        const d = pendingRes.value.data;
        setPendingList(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
      }
      if (deptRes.status === "fulfilled") {
        const d = deptRes.value.data;
        setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách chờ duyệt!");
    } finally {
      setOnboardingLoading(false);
    }
  }, []);

  /** Duyệt hồ sơ onboarding */
  const handleAcceptOnboarding = async (applicant: any, extra: { maphg: number; luong: number; chucvu: string }) => {
    try {
      await api.acceptOnboarding({
        email:      applicant.Email || applicant.EMAIL || applicant.email,
        approvedBy: adminEmail,
        maphg:      extra.maphg,
        luong:      extra.luong,
        chucvu:     extra.chucvu,
      });
      toast.success(`Đã duyệt hồ sơ của ${applicant.HoTen || applicant.HOTEN || applicant.hoten || applicant.Email || applicant.email}!`);
      fetchPendingOnboarding();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi duyệt hồ sơ!");
    }
  };

  /** Từ chối hồ sơ onboarding */
  const handleRejectOnboarding = async (applicant: any, reason: string) => {
    try {
      await api.rejectOnboarding({
        email:      applicant.Email || applicant.EMAIL || applicant.email,
        rejectedBy: adminEmail,
        reason,
      });
      toast.success(`Đã từ chối hồ sơ của ${applicant.HoTen || applicant.HOTEN || applicant.hoten || applicant.Email || applicant.email}.`);
      fetchPendingOnboarding();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi từ chối hồ sơ!");
    }
  };

  const handleDeleteEmployee = async (manv: string) => {
    if (!window.confirm(`Xác nhận xóa nhân viên ${manv}? Thao tác này không thể hoàn tác!`)) return;
    try {
      await api.adminDeleteEmployee(manv);
      toast.success(`Đã xóa nhân viên ${manv}!`);
      fetchEmployees();
    } catch (err: any) { toast.error(err.response?.data?.message || "Không thể xóa nhân viên!"); }
  };

  const handleDeleteDepartment = async (maphg: string | number, tenpb: string) => {
    if (!window.confirm(`Xóa phòng ban "${tenpb}"?\nChỉ xóa được nếu không còn nhân viên.`)) return;
    try {
      await api.adminDeleteDepartment(maphg);
      toast.success(`Đã xóa phòng ban "${tenpb}"!`);
      fetchDepartments();
    } catch (err: any) { toast.error(err.response?.data?.message || "Không thể xóa phòng ban!"); }
  };

  return {
    activeTab, setActiveTab, userLevel,
    employees, departments, pendingList,
    loading, onboardingLoading, modal, setModal,
    fetchEmployees, fetchDepartments, fetchPendingOnboarding,
    handleDeleteEmployee, handleDeleteDepartment,
    handleAcceptOnboarding, handleRejectOnboarding,
  };
};
