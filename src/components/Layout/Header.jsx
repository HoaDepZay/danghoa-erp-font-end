import { Bell, Search } from "lucide-react";
import { Avatar } from "../UI/index";

const PAGE_TITLES = {
  dashboard: "Tổng quan",
  profile: "Hồ sơ cá nhân",
  employees: "Quản lý Nhân viên",
  departments: "Quản lý Phòng ban",
  projects: "Quản lý Dự án",
  payroll: "Bảng lương",
};

const Header = ({ activePage, user }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-lg font-700 text-gray-900">{PAGE_TITLES[activePage] || "HUIT ERP"}</h1>
        <p className="text-xs text-gray-400 mt-0.5 capitalize">{dateStr}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-400">
          <Search size={15} />
          <span className="hidden sm:inline">Tìm kiếm...</span>
        </div>

        <button className="relative p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <Avatar name={user?.HoTen || user?.hoten || "U"} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-600 text-gray-900 leading-tight">{user?.HoTen || user?.hoten || "Nhân viên"}</p>
            <p className="text-[11px] text-gray-400">{user?.chuc_vu}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
