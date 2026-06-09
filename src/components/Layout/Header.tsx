import React, { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu, Check } from "lucide-react";
import { Avatar } from "../UI/index";
import { getDisplayRole, getUserName } from "../../utils/user";
import { toast, formatDate } from "../../utils/helpers";
import { api, API_URL } from "../../services/api";
import io from "socket.io-client";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Tổng quan",
  profile: "Hồ sơ của tôi",
  employees: "Danh sách nhân viên",
  departments: "Phòng ban",
  projects: "Dự án",
  payroll: "Bảng lương",
  admin: "Quản trị hệ thống",
};

const Header = ({ activePage, user, onToggleMenu, onNavigate }: any) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const role = getDisplayRole(user);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.DaDoc && !n.daDoc).length;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.getNotifications();
        setNotifications(res.data || []);
      } catch (e) {
        console.error("Lỗi lấy thông báo", e);
      }
    };
    if (user) {
      fetchNotifs();
      const socket = io(API_URL);
      const MA_NV = user?.userInfo?.MA_NV;
      socket.emit("join_notification", MA_NV);
      socket.on("new_notification", (notif: any) => {
        setNotifications((prev) => [notif, ...prev]);
        toast.info(notif.TieuDe || notif.tieuDe);
      });
      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRead = async (id: number) => {
    try {
      await api.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.MaTB === id || n.maTB === id ? { ...n, DaDoc: true, daDoc: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

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

        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button className="topbar-bell" onClick={() => setShowDropdown(!showDropdown)}>
            <Bell size={17} />
            {unreadCount > 0 && <span className="dot" />}
          </button>
          
          {showDropdown && (
            <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 320, background: "#fff", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Thông báo mới ({unreadCount})</h3>
              </div>
              <div style={{ maxHeight: 350, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <p style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13, margin: 0 }}>Không có thông báo nào.</p>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !n.DaDoc && !n.daDoc;
                    const id = n.MaTB || n.maTB;
                    const title = n.TieuDe || n.tieuDe;
                    const body = n.NoiDung || n.noiDung;
                    const date = n.NgayTao || n.ngayTao;
                    const type = n.LoaiThongBao || n.loaiThongBao;
                    return (
                      <div key={id} onClick={() => { 
                        if (isUnread) handleRead(id); 
                        setShowDropdown(false);
                        if (type === "leave_request" && onNavigate) onNavigate("leave");
                        else if (type?.startsWith("project") && onNavigate) onNavigate("projects");
                      }} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: isUnread ? "#f0fdf4" : "#fff", transition: "all 0.2s" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: isUnread ? 700 : 500, color: "#0f172a" }}>{title}</p>
                          <p style={{ margin: "4px 0 6px", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{body}</p>
                          <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{formatDate(date)}</p>
                        </div>
                        {isUnread && (
                          <div style={{ alignSelf: "center", width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="topbar-avatar-wrap" onClick={() => onNavigate("profile")} style={{ cursor: "pointer" }} title="Xem hồ sơ">
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
