import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { getManv, getUserLevel, getMaPhg } from "../../../utils/user";

export const useEmployeeProfile = (user: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [coworkers, setCoworkers] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [modal, setModal] = useState({ isOpen: false, type: "", data: {} as any });
  const [loading, setLoading] = useState(false);

  const userLevel = getUserLevel(user);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [prof, proj] = await Promise.all([
          api.getProfile(getManv(user)),
          api.getMyProjects(getManv(user)),
        ]);
        setProfile(prof.data);
        setMyProjects(proj.data);

        if (userLevel >= 2) {
          const team = await api.getCoworkers(getMaPhg(user));
          setCoworkers(team.data);
        }
        if (userLevel >= 3) {
          const depts = await api.getDepartments();
          // Response: { success, data: [...] }
          const d = depts.data;
          setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
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
      await api.updateEmployeeInfo({ MA_NV: getManv(user), EMAIL: modal.data.EMAIL });
      const updatedUser = { ...user, EMAIL: modal.data.EMAIL };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfile({ ...profile, EMAIL: modal.data.EMAIL });
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
        MA_NV: getManv(user),
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
        MA_NV: modal.data.MA_NV?.trim(),
        HO_TEN: modal.data.HO_TEN,
        MA_PHG: modal.data.MA_PHG === null ? null : Number(modal.data.MA_PHG),
        LUONG: Number(modal.data.LUONG || 0),
        CHUC_VU: modal.data.CHUC_VU || "Nhân viên",
      };
      await api.adminUpdateEmployee(payload);
      alert("✅ Thành công!");
      setModal({ isOpen: false, type: "", data: {} });
      if (userLevel >= 2) {
        const team = await api.getCoworkers(getMaPhg(user));
        setCoworkers(team.data);
      }
    } catch (err: any) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  const handleCreateDepartment = async () => {
    setLoading(true);
    try {
      // POST /api/departments  body: { TEN_PB, matruongphg? }
      await api.createDepartment({ TEN_PB: modal.data.TEN_PB, matruongphg: modal.data.matruongphg || undefined });
      const depts = await api.getDepartments();
      const d = depts.data;
      setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
      setModal({ isOpen: false, type: "", data: {} });
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || "Lỗi!");
    }
    setLoading(false);
  };

  const handleUpdateDepartment = async () => {
    setLoading(true);
    try {
      // PUT /api/departments/:id  body: { TEN_PB, matruongphg? }
      await api.updateDepartment(modal.data.MA_PHG, {
        TEN_PB: modal.data.TEN_PB,
        matruongphg: modal.data.matruongphg || undefined,
      });
      const depts = await api.getDepartments();
      const d = depts.data;
      setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
      setModal({ isOpen: false, type: "", data: {} });
    } catch {
      alert("Lỗi!");
    }
    setLoading(false);
  };

  const handleDeleteDepartment = async (MA_PHG: string | number) => {
    if (!window.confirm("Xác nhận xóa?")) return;
    try {
      // DELETE /api/departments/:id
      await api.deleteDepartment(MA_PHG);
      const depts = await api.getDepartments();
      const d = depts.data;
      setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || "Lỗi!");
    }
  };

  const handleCreateEmployee = async () => {
    const { MA_NV, HO_TEN, MA_PHG, LUONG, CHUC_VU } = modal.data;
    setLoading(true);
    try {
      await api.createEmployee({
        MA_NV,
        HO_TEN,
        MA_PHG: parseInt(MA_PHG),
        LUONG: parseInt(LUONG || 0),
        CHUC_VU,
      });
      if (userLevel >= 2) {
        const team = await api.getCoworkers(getMaPhg(user));
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
    const headers = ["MA_NV", "HO_TEN", "CHUC_VU", "MA_PHG"];
    const rows = coworkers.map(m => [m.MA_NV, m.HO_TEN, m.CHUC_VU, m.MA_PHG]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => String(c).includes(",") ? `"${c}"` : c).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nhan_vien_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const exportDepartmentsToCsv = () => {
    if (departments.length === 0) return alert("Không có dữ liệu để xuất!");
    const headers = ["MA_PHG", "TEN_PB"];
    const rows = departments.map(d => [d.MA_PHG, d.TEN_PB]);
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
        const [mIdx, hIdx, cIdx, pIdx] = ["MA_NV", "HO_TEN", "CHUC_VU", "MA_PHG"].map(k => headers.indexOf(k));
        if (mIdx === -1 || hIdx === -1) return alert("Thiếu cột MA_NV hoặc HO_TEN!");
        
        let success = 0;
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
          if (!vals[mIdx] || !vals[hIdx]) continue;
          try {
            await api.createEmployee({
              MA_NV: vals[mIdx], HO_TEN: vals[hIdx], MA_PHG: parseInt(vals[pIdx]) || Number(getMaPhg(user)),
              LUONG: 0, CHUC_VU: vals[cIdx] || "Nhân viên"
            });
            success++;
          } catch (err) {}
        }
        alert(`Đã nhập thành công ${success} nhân viên!`);
        if (userLevel >= 2) {
          const team = await api.getCoworkers(getMaPhg(user));
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
        const tIdx = headers.indexOf("TEN_PB");
        if (tIdx === -1) return alert("Thiếu cột TEN_PB!");
        
        let success = 0;
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
          if (!vals[tIdx]) continue;
          try {
            await api.createDepartment({ TEN_PB: vals[tIdx] });
             success++;
          } catch (err) {}
        }
        alert(`Đã nhập thành công ${success} phòng ban!`);
        const depts = await api.getDepartments();
        const d = depts.data;
        setDepartments(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
      } catch (err: any) { alert("Lỗi đọc file: " + err.message); }
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  };

  const handlers = {
    handleUpdateProfile, handleChangePass, handleAdminEditNV,
    handleCreateDepartment, handleUpdateDepartment, handleDeleteDepartment, handleCreateEmployee,
  };

  return {
    profile, coworkers, myProjects, departments, activeTab, setActiveTab,
    modal, setModal, loading, userLevel, guard, handlers,
    exportCoworkersToCsv, exportDepartmentsToCsv, importCoworkersFromCsv, importDepartmentsFromCsv
  };
};

