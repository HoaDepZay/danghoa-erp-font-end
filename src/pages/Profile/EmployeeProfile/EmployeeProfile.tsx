import React from "react";
import { User, LogOut, ShieldCheck, Activity, Users, Settings, Edit3, UserPlus, FolderPlus, Trash2, Download, Upload } from "lucide-react";
import { TabButton, Card, InfoItem, LoadingScreen } from "../../../components/Profile/ProfileUI";
import ProfileModals from "./ProfileModals";
import { useEmployeeProfile } from "./useEmployeeProfile";

interface EmployeeProfileProps {
  user: any;
  onLogout: () => void;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ user, onLogout }) => {
  const {
    profile, coworkers, myProjects, departments, activeTab, setActiveTab,
    modal, setModal, loading, userLevel, guard, handlers,
    exportCoworkersToCsv, exportDepartmentsToCsv, importCoworkersFromCsv, importDepartmentsFromCsv
  } = useEmployeeProfile(user);

  if (!profile) return <LoadingScreen />;

  return (
    <div className="min-h-screen w-screen bg-[#FFFBFB] font-sans text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-red-100 bg-white/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-yellow-500 text-white shadow-lg">
            <ShieldCheck size={22} />
          </div>
          <span className="text-xl font-bold">HUIT <span className="text-red-600">ERP</span></span>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600">
          <LogOut size={18} /> Đăng xuất
        </button>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User size={16} />} label="Hồ sơ" />
          <TabButton active={activeTab === "team"} onClick={() => guard(2, () => setActiveTab("team"))} icon={<Users size={16} />} label="Đội ngũ" />
          <TabButton active={activeTab === "management"} onClick={() => guard(3, () => setActiveTab("management"))} icon={<Settings size={16} />} label="Quản trị" />
        </div>

        {activeTab === "profile" && (
          <div className="grid gap-6 md:grid-cols-3 animate-in fade-in duration-500">
            <div className="col-span-2 rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100 flex items-center gap-8">
              <div className="h-32 w-32 rounded-3xl bg-gradient-to-tr from-red-600 to-yellow-500 text-4xl font-black text-white flex items-center justify-center">
                {profile.HO_TEN?.split(" ").pop()?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-black">{profile.HO_TEN}</h1>
                <p className="text-lg font-medium text-red-500 uppercase tracking-tighter">{user.chuc_vu}</p>
                <p className="text-slate-400 font-bold">{profile.TEN_PB}</p>
              </div>
            </div>
            <Card title="Thao tác nhanh" icon={<Activity className="text-red-600" size={20} />}>
              <div className="space-y-3">
                <InfoItem label="Mã NV" value={profile.MA_NV} />
                <InfoItem label="EMAIL" value={profile.EMAIL} />
                <div className="pt-4 flex gap-2">
                  <button onClick={() => setModal({ isOpen: true, type: "self_edit", data: { EMAIL: profile.EMAIL } })} className="flex-1 rounded-xl bg-slate-900 py-3 text-[10px] font-black text-white">SỬA EMAIL</button>
                  <button onClick={() => setModal({ isOpen: true, type: "pass_edit", data: {} })} className="text-blue-50 flex-1 rounded-xl border border-slate-200 py-3 text-[10px] font-black">ĐỔI PASS</button>
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
                <button onClick={exportCoworkersToCsv} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-blue-700">
                  <Download size={16} /> XUẤT CSV
                </button>
                <label className="cursor-pointer">
                  <input type="file" accept=".csv" onChange={importCoworkersFromCsv} className="hidden" />
                  <span className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-green-700 inline-flex">
                    <Upload size={16} /> NHẬP CSV
                  </span>
                </label>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3 animate-in slide-in-from-right-4">
              {coworkers?.map((member) => (
                <div key={member.MA_NV} className="rounded-3xl bg-white p-5 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                      {member.HO_TEN?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{member.HO_TEN}</p>
                      <p className="text-[10px] uppercase font-black text-slate-400">{member.CHUC_VU}</p>
                    </div>
                  </div>
                  <button onClick={() => guard(3, () => setModal({ isOpen: true, type: "admin_edit", data: member }))} className="p-2 text-slate-300 hover:text-red-600"><Edit3 size={16} /></button>
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
                  <button onClick={() => guard(3, () => setModal({ isOpen: true, type: "emp_create", data: {} }))} className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-red-700">
                    <UserPlus size={16} /> THÊM NHÂN VIÊN
                  </button>
                  <button onClick={exportCoworkersToCsv} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-blue-700">
                    <Download size={16} /> XUẤT CSV
                  </button>
                  <label className="cursor-pointer">
                    <input type="file" accept=".csv" onChange={importCoworkersFromCsv} className="hidden" />
                    <span className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-green-700 inline-flex">
                      <Upload size={16} /> NHẬP CSV
                    </span>
                  </label>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr><th className="p-4">Mã NV</th><th className="p-4">Tên</th><th className="p-4">Chức vụ</th><th className="p-4">Phòng ban</th><th className="p-4">Sửa</th></tr>
                  </thead>
                  <tbody>
                    {coworkers?.map((member) => (
                      <tr key={member.MA_NV} className="border-t border-slate-50">
                        <td className="p-4 font-bold text-xs">{member.MA_NV}</td>
                        <td className="p-4 font-bold">{member.HO_TEN}</td>
                        <td className="p-4 text-xs uppercase">{member.CHUC_VU}</td>
                        <td className="p-4 text-sm">{member.MA_PHG}</td>
                        <td className="p-4">
                          <button onClick={() => guard(3, () => setModal({ isOpen: true, type: "admin_edit", data: member }))} className="text-blue-400 hover:text-blue-600"><Edit3 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-black">Quản lý Dự án</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr><th className="p-4">Dự án</th><th className="p-4">Giờ</th><th className="p-4">Xóa</th></tr>
                  </thead>
                  <tbody>
                    {myProjects.map((p, i) => (
                      <tr key={i} className="border-t border-slate-50">
                        <td className="p-4 font-bold">{p.TEN_DA}</td>
                        <td className="p-4">{p.THOI_GIAN} giờ</td>
                        <td className="p-4"><button className="text-red-300 hover:text-red-600"><Trash2 size={16} /></button></td>
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
                  <button onClick={() => guard(3, () => setModal({ isOpen: true, type: "dept_create", data: { TEN_PB: "" } }))} className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2">
                    <FolderPlus size={16} /> THÊM PHÒNG BAN
                  </button>
                  <button onClick={exportDepartmentsToCsv} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-blue-700">
                    <Download size={16} /> XUẤT CSV
                  </button>
                  <label className="cursor-pointer">
                    <input type="file" accept=".csv" onChange={importDepartmentsFromCsv} className="hidden" />
                    <span className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center gap-2 hover:bg-green-700 inline-flex">
                      <Upload size={16} /> NHẬP CSV
                    </span>
                  </label>
                </div>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                  <tr><th className="p-4">Mã</th><th className="p-4">Tên</th><th className="p-4">Sửa/Xóa</th></tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.MA_PHG} className="border-t border-slate-50">
                      <td className="p-4 font-bold text-xs">{dept.MA_PHG}</td>
                      <td className="p-4 font-bold">{dept.TEN_PB}</td>
                     <td className="p-4 flex gap-2">
                        <button onClick={() => guard(3, () => setModal({ isOpen: true, type: "dept_edit", data: { MA_PHG: dept.MA_PHG, TEN_PB: dept.TEN_PB } }))} className="text-blue-400 hover:text-blue-600"><Edit3 size={16} /></button>
                        <button onClick={() => guard(3, () => handlers.handleDeleteDepartment(dept.MA_PHG))} className="text-red-300 hover:text-red-600"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <ProfileModals modal={modal} setModal={setModal} departments={departments} loading={loading} handlers={handlers} />
    </div>
  );
};

export default EmployeeProfile;

