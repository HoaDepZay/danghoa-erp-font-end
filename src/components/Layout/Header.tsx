import { Bell, Search, Menu } from "lucide-react";
import { Avatar } from "../UI/index";
import { getDisplayRole, getUserName } from "../../utils/user";
import { toast } from "../../utils/helpers";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Tổng quan",
  profile: "Hồ sơ của tôi",
  employees: "Danh sách nhân viên",
  departments: "Phòng ban",
  projects: "Dự án",
  payroll: "Bảng lương",
  admin: "Quản trị hệ thống",
};

const Header = ({ activePage, user, onToggleMenu }: any) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const role = getDisplayRole(user);

  return (
    <header className="topbar">
      <button
        className="topbar-menu"
        onClick={onToggleMenu}
        aria-label="Mở menu"
      >
        <Menu size={18} />
      </button>
      <div className="topbar-title">
        <h1>{PAGE_TITLES[activePage] || "HUIT ERP"}</h1>
        <p>{dateStr}</p>
      </div>

      <div className="topbar-right">
        <div className="topbar-search" onClick={() => toast.info("Tính năng tìm kiếm đang được phát triển")}>
          <Search size={14} />
          <span>Tìm kiếm...</span>
        </div>

        <button className="topbar-bell" onClick={() => toast.info("Tính năng thông báo đang được phát triển")}>
          <Bell size={17} />
          <span className="dot" />
        </button>

        <div className="topbar-avatar-wrap">
          <Avatar name={getUserName(user)} size="sm" />
          <div className="topbar-avatar-info">
            <div className="user-name">{getUserName(user)}</div>
            <div className="user-role">{role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
