import { useState, useEffect } from "react";
import { api } from "../../../services/api";

export const useEmployeeProfile = (user: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [coworkers, setCoworkers] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [modal, setModal] = useState({ isOpen: false, type: "", data: {} as any });
  const [loading, setLoading] = useState(false);

  const roleLevels: Record<string, number> = { "Cộng tác viên": 1, "Nhân viên": 2, "Quản lý": 3 };
  const userLevel = roleLevels[user?.chuc_vu] || 1;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [prof, proj] = await Promise.all([
          api.getProfile(user.MANV),
          api.getMyProjects(user.MANV),
        ]);
        setProfile(prof.data);
        setMyProjects(proj.data);

        if (userLevel >= 2) {
          const team = await api.getCoworkers(user.ma_phg);
          setCoworkers(team.data);
        }
        if (userLevel >= 3) {
          const depts = await api.getDepartments();
          setDepartments(depts.data);
        }
      } catch (err) {
        console.error("Lỗi ERP:", err);
      }
    };
    fetchData();
  }, [user, userLevel]);

  const guard = (reqLevel: number, action: () => void) => {
    if (userLevel < reqLevel) return alert("⚠️ BẠN KHÔNG CÓ QUYỀN!");
    action();
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await api.updateInfo({ manv: user.ma_nv, email: modal.data.email });
      const updatedUser = { ...user, email: modal.data.email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfile({ ...profile, EMAIL: modal.data.email });
      alert("Thành công!");
      setModal({ isOpen: false, type: "", data: {} });
    } catch {
      alert("Lỗi!");
    }
    setLoading(false);
  };

  const handleChangePass = async () => {
    if (modal.data.newPass !== modal.data.confirmPass) return alert("Mật khẩu không khớp!");
    try {
      await api.changePassword({
        manv: user.ma_nv,
        oldPassword: modal.data.oldPass,
        newPassword: modal.data.newPass,
      });
      alert("Thành công!");
      setModal({ isOpen: false, type: "", data: {} });
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi!");
    }
  };

  const handleAdminEditNV = async () => {
    try {
      const payload = {
        manv: modal.data.MANV?.trim(),
        hoten: modal.data.HOTEN,
        maphg: modal.data.MAPHG === null ? null : Number(modal.data.MAPHG),
        luong: Number(modal.data.luong || 0),
        chucvu: modal.data.chucvu || "Nhân viên",
      };
      await api.editNhanVien(payload);
      alert("✅ Thành công!");
      setModal({ isOpen: false, type: "", data: {} });
      if (userLevel >= 2) {
        const team = await api.getCoworkers(user.ma_phg);
        setCoworkers(team.data);
      }
    } catch (err: any) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  const handleCreateDepartment = async () => {
    setLoading(true);
    try {
      await api.createDept({ tenpb: modal.data.tenpb });
      const depts = await api.getDepartments();
      setDepartments(depts.data);
      setModal({ isOpen: false, type: "", data: {} });
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi!");
    }
    setLoading(false);
  };

  const handleUpdateDepartment = async () => {
    setLoading(true);
    try {
      await api.editDept({ maphg: modal.data.MAPHG, tenpb: modal.data.tenpb });
      const depts = await api.getDepartments();
      setDepartments(depts.data);
      setModal({ isOpen: false, type: "", data: {} });
    } catch {
      alert("Lỗi!");
    }
    setLoading(false);
  };

  const handleDeleteDepartment = async (maphg: string | number) => {
    if (!window.confirm("Xác nhận xóa?")) return;
    try {
      await api.deleteDept(maphg);
      const depts = await api.getDepartments();
      setDepartments(depts.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi!");
    }
  };

  const handleCreateEmployee = async () => {
    const { manv, hoten, maphg, luong, chucvu } = modal.data;
    setLoading(true);
    try {
      await api.createNhanVien({
        manv,
        hoten,
        maphg: parseInt(maphg),
        luong: parseInt(luong || 0),
        chucvu,
      });
      if (userLevel >= 2) {
        const team = await api.getCoworkers(user.ma_phg);
        setCoworkers(team.data);
      }
      setModal({ isOpen: false, type: "", data: {} });
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi!");
    }
    setLoading(false);
  };

   const exportCoworkersToCsv = () => {
    if (coworkers.length === 0) return alert("Không có dữ liệu để xuất!");
    const headers = ["MANV", "HOTEN", "CHUCVU", "MAPHG"];
    const rows = coworkers.map(m => [m.MANV, m.HOTEN, m.CHUCVU, m.MAPHG]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => String(c).includes(",") ? `"${c}"` : c).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nhan_vien_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const exportDepartmentsToCsv = () => {
    if (departments.length === 0) return alert("Không có dữ liệu để xuất!");
    const headers = ["MAPHG", "TENPB"];
    const rows = departments.map(d => [d.MAPHG, d.TENPB]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => String(c).includes(",") ? `"${c}"` : c).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `phong_ban_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const importCoworkersFromCsv = (event: any) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".csv")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = String(e.target?.result || "");
        const lines = content.trim().split("\n").filter(l => l.trim());
        if (lines.length < 2) return alert("File CSV không hợp lệ!");
        const headers = lines[0].split(",").map(h => h.trim().toUpperCase());
        const [mIdx, hIdx, cIdx, pIdx] = ["MANV", "HOTEN", "CHUCVU", "MAPHG"].map(k => headers.indexOf(k));
        if (mIdx === -1 || hIdx === -1) return alert("Thiếu cột MANV hoặc HOTEN!");
        
        let success = 0;
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
          if (!vals[mIdx] || !vals[hIdx]) continue;
          try {
            await api.createNhanVien({
              manv: vals[mIdx], hoten: vals[hIdx], maphg: parseInt(vals[pIdx]) || user.ma_phg,
              luong: 0, chucvu: vals[cIdx] || "Nhân viên"
            });
            success++;
          } catch (err) {}
        }
        alert(`Đã nhập thành công ${success} nhân viên!`);
        if (userLevel >= 2) {
          const team = await api.getCoworkers(user.ma_phg);
          setCoworkers(team.data);
        }
      } catch (err: any) { alert("Lỗi đọc file: " + err.message); }
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  };

  const importDepartmentsFromCsv = (event: any) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".csv")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = String(e.target?.result || "");
        const lines = content.trim().split("\n").filter(l => l.trim());
        if (lines.length < 2) return alert("File CSV không hợp lệ!");
        const headers = lines[0].split(",").map(h => h.trim().toUpperCase());
        const tIdx = headers.indexOf("TENPB");
        if (tIdx === -1) return alert("Thiếu cột TENPB!");
        
        let success = 0;
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
          if (!vals[tIdx]) continue;
          try {
            await api.createDept({ tenpb: vals[tIdx] });
             success++;
          } catch (err) {}
        }
        alert(`Đã nhập thành công ${success} phòng ban!`);
        const depts = await api.getDepartments();
        setDepartments(depts.data);
      } catch (err: any) { alert("Lỗi đọc file: " + err.message); }
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  };

  const handlers = {
    handleUpdateProfile, handleChangePass, handleAdminEditNV,
    handleCreateDepartment, handleUpdateDepartment, handleCreateEmployee,
  };

  return {
    profile, coworkers, myProjects, departments, activeTab, setActiveTab,
    modal, setModal, loading, userLevel, guard, handlers,
    exportCoworkersToCsv, exportDepartmentsToCsv, importCoworkersFromCsv, importDepartmentsFromCsv
  };
};

