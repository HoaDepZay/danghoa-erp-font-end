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

  const fetchData = async () => {
    try {
      const [prof, proj] = await Promise.all([
        api.getProfile(user.ma_nv),
        api.getMyProjects(user.ma_nv),
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
      console.error("Lỗi sync ERP:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, userLevel]);

  const guard = (reqLevel, action) => {
    if (userLevel < reqLevel) return alert("⚠️ BẠN KHÔNG CÓ QUYỀN!");
    action();
  };

  // --- HANDLERS (Gom lại để truyền cho Modals) ---
  const handlers = {
    handleUpdateProfile: async () => {
      try {
        await api.updateInfo({ manv: user.ma_nv, email: modal.data.email });
        setProfile({ ...profile, EMAIL: modal.data.email });
        alert("Thành công!");
        setModal({ isOpen: false, type: "", data: {} });
      } catch {
        alert("Lỗi cập nhật!");
      }
    },
    handleChangePass: async () => {
      if (modal.data.newPass !== modal.data.confirmPass)
        return alert("Mật khẩu không khớp!");
      try {
        await api.changePassword({
          manv: user.ma_nv,
          oldPassword: modal.data.oldPass,
          newPassword: modal.data.newPass,
        });
        alert("Đổi pass thành công!");
        setModal({ isOpen: false, type: "", data: {} });
      } catch (err) {
        alert(err.response?.data?.error || "Lỗi!");
      }
    },
    handleAdminEditNV: async () => {
      try {
        await api.editNhanVien({
          manv: modal.data.MANV,
          hoten: modal.data.HOTEN,
          maphg: modal.data.MAPHG,
          luong: modal.data.luong,
          chucvu: modal.data.chucvu,
        });
        alert("Đã cập nhật!");
        window.location.reload();
      } catch {
        alert("Lỗi phân quyền!");
      }
    },
    handleCreateDepartment: async () => {
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
    },
    handleCreateEmployee: async () => {
      const { username, password, maphg, email } = modal.data;
      setLoading(true);
      try {
        await api.register({ username, password, maphg, email });
        alert("Đã tạo nhân viên thành công!");
        fetchData();
        setModal({ isOpen: false, type: "", data: {} });
      } catch (err) {
        alert(err.response?.data?.error || "Lỗi tạo NV!");
      }
      setLoading(false);
    },
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
              title="Thao tác"
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
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-[10px] font-black"
                  >
                    ĐỔI PASS
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "team" && (
          <div className="grid gap-4 md:grid-cols-3 animate-in slide-in-from-right-4">
            {coworkers.map((member) => (
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
        )}

        {activeTab === "management" && (
          <div className="rounded-[2.5rem] bg-white p-8 border border-slate-100 animate-in slide-in-from-right-4 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900">
                  Quản lý Nhân sự
                </h3>
                <button
                  onClick={() =>
                    guard(3, () =>
                      setModal({ isOpen: true, type: "emp_create", data: {} }),
                    )
                  }
                  className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2"
                >
                  <UserPlus size={16} /> THÊM NHÂN VIÊN
                </button>
              </div>
              <div className="rounded-2xl border border-slate-50 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="p-4">Dự án</th>
                      <th className="p-4">Giờ làm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProjects.map((p, i) => (
                      <tr key={i} className="border-t border-slate-50">
                        <td className="p-4 font-bold text-slate-700">
                          {p.TENDA}
                        </td>
                        <td className="p-4 text-slate-600">{p.THOIGIAN} giờ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900">Phòng ban</h3>
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
              </div>
              <div className="rounded-2xl border border-slate-50 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="p-4">Mã</th>
                      <th className="p-4">Tên phòng</th>
                      <th className="p-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept.MAPHG} className="border-t border-slate-50">
                        <td className="p-4 font-bold text-xs text-slate-400">
                          {dept.MAPHG}
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          {dept.TENPB}
                        </td>
                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() =>
                              guard(3, () => alert("Sửa phòng ban"))
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
          </div>
        )}
      </main>

      <ProfileModals
        modal={modal}
        setModal={setModal}
        departments={departments}
        loading={loading}
        handlers={handlers}
      />
    </div>
  );
};

export default EmployeeProfile;
