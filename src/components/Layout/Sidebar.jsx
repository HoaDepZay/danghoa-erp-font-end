import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  Wallet,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { getUserLevel, getUserName } from "../../utils/user";

const NAV_ITEMS = [
  { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard, minLevel: 1 },
  { key: "profile", label: "Hồ sơ", icon: UserCircle, minLevel: 1 },
  { key: "payroll", label: "Bảng lương", icon: Wallet, minLevel: 1 },
  { key: "projects", label: "Dự án", icon: FolderKanban, minLevel: 1 },
  { key: "employees", label: "Nhân viên", icon: Users, minLevel: 2 },
  { key: "departments", label: "Phòng ban", icon: Building2, minLevel: 2 },
];

const ROLE_LEVELS = {
  "Cộng tác viên": 1,
  "Nhân viên": 2,
  "Quản lý": 3,
  "Admin": 4,
};

const Sidebar = ({ activePage, onNavigate, user, onLogout, collapsed, onToggleCollapse }) => {
  const userLevel = getUserLevel(user); // handles login format (role) and employee format (chuc_vu)
  const displayRole = user?.chuc_vu || user?.CHUCVU || user?.role || "";
  const visibleItems = NAV_ITEMS.filter((item) => userLevel >= item.minLevel);

  return (
    <aside
      className={`flex flex-col bg-gray-900 text-white transition-all duration-300 flex-shrink-0 ${
        collapsed ? "w-16" : "w-60"
      }`}
      style={{ minHeight: "100vh" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-800 text-white text-sm leading-tight">HUIT ERP</p>
            <p className="text-[10px] text-white/50 leading-none mt-0.5">HR Management</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {visibleItems.map(({ key, label, icon: Icon }) => {
          const isActive = activePage === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-colors ${
                isActive
                  ? "bg-white text-gray-900 font-700"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User info + actions */}
      <div className="border-t border-white/10 p-3 space-y-1">
        {!collapsed && user && (
          <div className="px-2 py-2 mb-1">
            <p className="text-xs font-700 text-white truncate">{getUserName(user)}</p>
            <p className="text-[10px] text-white/40 mt-0.5 truncate">{displayRole}</p>
          </div>
        )}

        {/* Toggle collapse */}
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Thu gọn</span></>}
        </button>

        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Đăng xuất" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
