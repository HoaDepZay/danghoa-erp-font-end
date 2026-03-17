import { useEffect, useState } from "react";
import {
  User,
  LogOut,
  ShieldCheck,
  Activity,
  Users,
  Settings,
  Edit3,
  UserPlus,
  FolderPlus,
  Trash2,
  X,
  Download,
  Upload,
} from "lucide-react";
import { api } from "../services/api";
import {
  TabButton,
  Card,
  InfoItem,
  LoadingScreen,
} from "../components/Profile/ProfileUI";
import ProfileModals from "../components/Profile/ProfileModals";

const EmployeeProfile = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [coworkers, setCoworkers] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [modal, setModal] = useState({ isOpen: false, type: "", data: {} });
  const [loading, setLoading] = useState(false);

  const roleLevels = { "Cộng tác viên": 1, "Nhân viên": 2, "Quản lý": 3 };
  const userLevel = roleLevels[user.chuc_vu] || 1;

  useEffect(() => {
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

  const guard = (reqLevel, action) => {
    if (userLevel < reqLevel) return alert("⚠️ BẠN KHÔNG CÓ QUYỀN!");
    action();
  };

  // --- HANDLERS ---
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
    if (modal.data.newPass !== modal.data.confirmPass)
      return alert("Mật khẩu không khớp!");
    try {
      await api.changePassword({
        manv: user.ma_nv,
        oldPassword: modal.data.oldPass,
        newPassword: modal.data.newPass,
      });
      alert("Thành công!");
      setModal({ isOpen: false, type: "", data: {} });
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi!");
    }
  };

  const handleAdminEditNV = async () => {
    try {
      const payload = {
        manv: modal.data.MANV.trim(),
        hoten: modal.data.HOTEN,
        maphg: modal.data.MAPHG === null ? null : Number(modal.data.MAPHG),
        luong: Number(modal.data.luong),
        // ✅ Đảm bảo luôn có chucvu, không để bị undefined
        chucvu: modal.data.chucvu || "Nhân viên",
      };

      console.log("🚀 Payload gửi đi:", payload); // Kiểm tra xem chucvu đã có chưa
      await api.editNhanVien(payload);

      alert("✅ Thành công!");
      setModal({ isOpen: false, type: "", data: {} });
    } catch (err) {
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
    } catch (err) {
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

  const handleDeleteDepartment = async (maphg) => {
    if (!window.confirm("Xác nhận xóa?")) return;
    try {
      await api.deleteDept(maphg);
      const depts = await api.getDepartments();
      setDepartments(depts.data);
    } catch (err) {
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
        luong: parseInt(luong),
        chucvu,
      });
      if (userLevel >= 2) {
        const team = await api.getCoworkers(user.ma_phg);
        setCoworkers(team.data);
      }
      setModal({ isOpen: false, type: "", data: {} });
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi!");
    }
    setLoading(false);
  };

  // --- CSV HANDLERS ---
  const exportCoworkersToCsv = () => {
    if (coworkers.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    const headers = ["MANV", "HOTEN", "CHUCVU", "MAPHG"];
    const rows = coworkers.map((member) => [
      member.MANV,
      member.HOTEN,
      member.CHUCVU,
      member.MAPHG,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => (String(cell).includes(",") ? `"${cell}"` : cell))
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nhan_vien_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportDepartmentsToCsv = () => {
    if (departments.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    const headers = ["MAPHG", "TENPB"];
    const rows = departments.map((dept) => [dept.MAPHG, dept.TENPB]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => (String(cell).includes(",") ? `"${cell}"` : cell))
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `phong_ban_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importCoworkersFromCsv = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Vui lòng chọn file CSV!");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = String(e.target?.result || "");
        const lines = content
          .trim()
          .split("\n")
          .filter((line) => line.trim());

        if (lines.length < 2) {
          alert("File CSV không hợp lệ!");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toUpperCase());
        const manvIdx = headers.indexOf("MANV");
        const hotenIdx = headers.indexOf("HOTEN");
        const chucvuIdx = headers.indexOf("CHUCVU");
        const maphgIdx = headers.indexOf("MAPHG");

        if (manvIdx === -1 || hotenIdx === -1) {
          alert("File phải có cột MANV và HOTEN!");
          return;
        }

        const preview = lines.slice(1, 4).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          return `${values[manvIdx]} - ${values[hotenIdx]}`;
        });

        const message =
          `Sẽ nhập ${lines.length - 1} nhân viên:\n\n` +
          preview.join("\n") +
          (lines.length > 4 ? "\n... và nhiều hơn nữa" : "") +
          "\n\nContinue?";

        if (!window.confirm(message)) {
          event.target.value = "";
          return;
        }

        let successCount = 0;
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((v) => v.trim().replace(/"/g, ""));

          if (!values[manvIdx] || !values[hotenIdx]) {
            errors.push(`Dòng ${i + 1}: Thiếu MANV hoặc HOTEN`);
            continue;
          }

          try {
            await api.createNhanVien({
              manv: values[manvIdx],
              hoten: values[hotenIdx],
              maphg: parseInt(values[maphgIdx]) || user.ma_phg,
              luong: 0,
              chucvu: values[chucvuIdx] || "Nhân viên",
            });
            successCount++;
          } catch (err) {
            errors.push(
              `Dòng ${i + 1}: ${err.response?.data?.error || "Lỗi không xác định"}`,
            );
          }
        }

        let resultMsg = `✅ Nhập thành công ${successCount} nhân viên!`;
        if (errors.length > 0) {
          resultMsg += `\n\n❌ Lỗi (${errors.length}):\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n... và ${errors.length - 5} lỗi khác` : ""}`;
        }
        alert(resultMsg);

        if (userLevel >= 2) {
          const team = await api.getCoworkers(user.ma_phg);
          setCoworkers(team.data);
        }
      } catch (err) {
        alert("Lỗi khi đọc file: " + err.message);
        console.error(err);
      }
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  };

  const importDepartmentsFromCsv = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Vui lòng chọn file CSV!");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = String(e.target?.result || "");
        const lines = content
          .trim()
          .split("\n")
          .filter((line) => line.trim());

        if (lines.length < 2) {
          alert("File CSV không hợp lệ!");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toUpperCase());
        const tenpbIdx = headers.indexOf("TENPB");

        if (tenpbIdx === -1) {
          alert("File phải có cột TENPB!");
          return;
        }

        const preview = lines.slice(1, 4).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          return values[tenpbIdx];
        });

        const message =
          `Sẽ nhập ${lines.length - 1} phòng ban:\n\n` +
          preview.join("\n") +
          (lines.length > 4 ? "\n... và nhiều hơn nữa" : "") +
          "\n\nContinue?";

        if (!window.confirm(message)) {
          event.target.value = "";
          return;
        }

        let successCount = 0;
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((v) => v.trim().replace(/"/g, ""));

          if (!values[tenpbIdx]) {
            errors.push(`Dòng ${i + 1}: Thiếu TENPB`);
            continue;
          }

          try {
            await api.createDept({ tenpb: values[tenpbIdx] });
            successCount++;
          } catch (err) {
            errors.push(
              `Dòng ${i + 1}: ${err.response?.data?.error || "Lỗi không xác định"}`,
            );
          }
        }

        let resultMsg = `✅ Nhập thành công ${successCount} phòng ban!`;
        if (errors.length > 0) {
          resultMsg += `\n\n❌ Lỗi (${errors.length}):\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n... và ${errors.length - 5} lỗi khác` : ""}`;
        }
        alert(resultMsg);

        const depts = await api.getDepartments();
        setDepartments(depts.data);
      } catch (err) {
        alert("Lỗi khi đọc file: " + err.message);
        console.error(err);
      }
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  };

  if (!profile) return <LoadingScreen />;

  return (
    <div className="min-h-screen w-screen bg-[#FFFBFB] font-sans text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-red-100 bg-white/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-yellow-500 text-white shadow-lg">
            <ShieldCheck size={22} />
          </div>
          <span className="text-xl font-bold">
            HUIT <span className="text-red-600">ERP</span>
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600"
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <TabButton
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={<User size={16} />}
            label="Hồ sơ"
          />
          <TabButton
            active={activeTab === "team"}
            onClick={() => guard(2, () => setActiveTab("team"))}
            icon={<Users size={16} />}
            label="Đội ngũ"
          />
          <TabButton
            active={activeTab === "management"}
            onClick={() => guard(3, () => setActiveTab("management"))}
            icon={<Settings size={16} />}
            label="Quản trị"
          />
        </div>

        {activeTab === "profile" && (
          <div className="grid gap-6 md:grid-cols-3 animate-in fade-in duration-500">
            <div className="col-span-2 rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100 flex items-center gap-8">
              <div className="h-32 w-32 rounded-3xl bg-gradient-to-tr from-red-600 to-yellow-500 text-4xl font-black text-white flex items-center justify-center">
                {profile.HOTEN.split(" ").pop().charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black">{profile.HOTEN}</h1>
                <p className="text-lg font-medium text-red-500 uppercase tracking-tighter">
                  {user.chuc_vu}
                </p>
                <p className="text-slate-400 font-bold">{profile.TENPB}</p>
              </div>
            </div>
            <Card
              title="Thao tác nhanh"
              icon={<Activity className="text-red-600" size={20} />}
            >
              <div className="space-y-3">
                <InfoItem label="Mã NV" value={profile.MANV} />
                <InfoItem label="Email" value={profile.EMAIL} />
                <div className="pt-4 flex gap-2">
                  <button
                    onClick={() =>
                      setModal({
                        isOpen: true,
                        type: "self_edit",
                        data: { email: profile.EMAIL },
                      })
                    }
                    className="flex-1 rounded-xl bg-slate-900 py-3 text-[10px] font-black text-white"
                  >
                    SỬA EMAIL
                  </button>
                  <button
                    onClick={() =>
                      setModal({ isOpen: true, type: "pass_edit", data: {} })
                    }
                    className="text-blue-50 flex-1 rounded-xl border border-slate-200 py-3 text-[10px] font-black"
                  >
                    ĐỔI PASS
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "team" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Danh sách Đội ngũ</h3>
              <div className="flex gap-2">
                <button
                  onClick={exportCoworkersToCsv}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-blue-700"
                >
                  <Download size={16} /> XUẤT CSV
                </button>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={importCoworkersFromCsv}
                    className="hidden"
                  />
                  <span className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-green-700 inline-flex">
                    <Upload size={16} /> NHẬP CSV
                  </span>
                </label>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3 animate-in slide-in-from-right-4">
              {coworkers?.map((member) => (
                <div
                  key={member.MANV}
                  className="rounded-3xl bg-white p-5 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                      {member.HOTEN.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{member.HOTEN}</p>
                      <p className="text-[10px] uppercase font-black text-slate-400">
                        {member.CHUCVU}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      guard(3, () =>
                        setModal({
                          isOpen: true,
                          type: "admin_edit",
                          data: member,
                        }),
                      )
                    }
                    className="p-2 text-slate-300 hover:text-red-600"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "management" && (
          <div className="rounded-[2.5rem] bg-white p-8 border border-slate-100 animate-in slide-in-from-right-4 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black">Quản lý Nhân viên</h3>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      guard(3, () =>
                        setModal({
                          isOpen: true,
                          type: "emp_create",
                          data: {},
                        }),
                      )
                    }
                    className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-red-700"
                  >
                    <UserPlus size={16} /> THÊM NHÂN VIÊN
                  </button>
                  <button
                    onClick={exportCoworkersToCsv}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-blue-700"
                  >
                    <Download size={16} /> XUẤT CSV
                  </button>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={importCoworkersFromCsv}
                      className="hidden"
                    />
                    <span className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-green-700 inline-flex">
                      <Upload size={16} /> NHẬP CSV
                    </span>
                  </label>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="p-4">Mã NV</th>
                      <th className="p-4">Tên</th>
                      <th className="p-4">Chức vụ</th>
                      <th className="p-4">Phòng ban</th>
                      <th className="p-4">Sửa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coworkers?.map((member) => (
                      <tr
                        key={member.MANV}
                        className="border-t border-slate-50"
                      >
                        <td className="p-4 font-bold text-xs">{member.MANV}</td>
                        <td className="p-4 font-bold">{member.HOTEN}</td>
                        <td className="p-4 text-xs uppercase">
                          {member.CHUCVU}
                        </td>
                        <td className="p-4 text-sm">{member.MAPHG}</td>
                        <td className="p-4">
                          <button
                            onClick={() =>
                              guard(3, () =>
                                setModal({
                                  isOpen: true,
                                  type: "admin_edit",
                                  data: member,
                                }),
                              )
                            }
                            className="text-blue-400 hover:text-blue-600"
                          >
                            <Edit3 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black">Quản lý Dự án</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="p-4">Dự án</th>
                      <th className="p-4">Giờ</th>
                      <th className="p-4">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProjects.map((p, i) => (
                      <tr key={i} className="border-t border-slate-50">
                        <td className="p-4 font-bold">{p.TENDA}</td>
                        <td className="p-4">{p.THOIGIAN} giờ</td>
                        <td className="p-4">
                          <button className="text-red-300 hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black">Quản lý Phòng ban</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      guard(3, () =>
                        setModal({
                          isOpen: true,
                          type: "dept_create",
                          data: { tenpb: "" },
                        }),
                      )
                    }
                    className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2"
                  >
                    <FolderPlus size={16} /> THÊM PHÒNG BAN
                  </button>
                  <button
                    onClick={exportDepartmentsToCsv}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-blue-700"
                  >
                    <Download size={16} /> XUẤT CSV
                  </button>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={importDepartmentsFromCsv}
                      className="hidden"
                    />
                    <span className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-green-700 inline-flex">
                      <Upload size={16} /> NHẬP CSV
                    </span>
                  </label>
                </div>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="p-4">Mã</th>
                    <th className="p-4">Tên</th>
                    <th className="p-4">Sửa/Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.MAPHG} className="border-t border-slate-50">
                      <td className="p-4 font-bold text-xs">{dept.MAPHG}</td>
                      <td className="p-4 font-bold">{dept.TENPB}</td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() =>
                            guard(3, () =>
                              setModal({
                                isOpen: true,
                                type: "dept_edit",
                                data: { MAPHG: dept.MAPHG, tenpb: dept.TENPB },
                              }),
                            )
                          }
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            guard(3, () => handleDeleteDepartment(dept.MAPHG))
                          }
                          className="text-red-300 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <ProfileModals
        modal={modal}
        setModal={setModal}
        departments={departments}
        loading={loading}
        handlers={{
          handleUpdateProfile,
          handleChangePass,
          handleAdminEditNV,
          handleCreateDepartment,
          handleUpdateDepartment,
          handleCreateEmployee,
        }}
      />
    </div>
  );
};

export default EmployeeProfile;
