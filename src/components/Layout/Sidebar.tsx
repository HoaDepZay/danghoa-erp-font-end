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
  ShieldAlert,
  LogOut,
  CalendarDays,
  MessageSquare,
  ScanLine,
  FileText,
  FileSignature,
  BarChart3,
} from "lucide-react";
import { getDisplayRole, getUserLevel, getUserName } from "../../utils/user";

const NAV_ITEMS = [
  { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard, minLevel: 1 },
  { key: "schedule", label: "Lịch làm việc", icon: CalendarDays, minLevel: 1 },
  { key: "attendance", label: "Chấm công", icon: ScanLine, minLevel: 1 },
  { key: "profile", label: "Hồ sơ", icon: UserCircle, minLevel: 1 },
  { key: "payroll", label: "Bảng lương", icon: Wallet, minLevel: 1 },

  { key: "projects", label: "Dự án", icon: FolderKanban, minLevel: 1 },
  { key: "chat", label: "Tin nhắn", icon: MessageSquare, minLevel: 1 },
  {key: "employees", label: "Nhân viên", icon: Users, minLevel: 1},
  {key: "departments", label: "Phòng ban", icon: Building2, minLevel: 3},
  {key: "myLeave",    label: "Nghỉ phép",   icon: FileText,      minLevel: 1}, // Mọi NV nộp đơn
  {key: "leave",      label: "Quản lý đơn",  icon: FileText,      minLevel: 3}, // Manager duyệt
  {key: "contracts", label: "Hợp đồng",  icon: FileSignature, minLevel: 3},
  {key: "analytics", label: "HR Analytics", icon: BarChart3,     minLevel: 3},
  { key: "admin",    label: "Quản trị",   icon: ShieldAlert,   minLevel: 4 },
];

const Sidebar = ({
  activePage,
  onNavigate,
  user,
  onLogout,
  collapsed,
  onToggleCollapse,
}: any) => {
  const userLevel = getUserLevel(user);
  const displayRole = getDisplayRole(user);
  const userName = getUserName(user);
  const visibleItems = NAV_ITEMS.filter((item) => userLevel >= item.minLevel);

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <ShieldCheck size={18} />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <div className="brand">HUIT ERP</div>
            <div className="sub">HR Management</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {visibleItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`nav-item${activePage === key ? " active" : ""}`}
            onClick={() => onNavigate(key)}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="sidebar-user">
            <div className="name">{userName}</div>
            <div className="role">{displayRole}</div>
          </div>
        )}

        <button
          className="sidebar-action"
          onClick={onToggleCollapse}
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span>Thu gọn</span>
            </>
          )}
        </button>

        <button
          className="sidebar-action danger"
          onClick={onLogout}
          title={collapsed ? "Đăng xuất" : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
