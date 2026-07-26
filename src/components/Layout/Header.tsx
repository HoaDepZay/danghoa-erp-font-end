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
  recruitment: "Quản lý Tuyển dụng",
  campaign_details: "Chi tiết Chiến dịch",
  campaign_create: "Tạo Chiến dịch Tuyển dụng",
  campaign_edit: "Chỉnh sửa Chiến dịch Tuyển dụng",
  admin: "Quản trị hệ thống",
  developer: "Developer Portal",
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
  const unreadCount = notifications.filter((n) => n.DA_DOC === false || n.DA_DOC === 0 || n.daDoc === false).length;
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
        toast.info(notif.TIEU_DE || notif.TieuDe || notif.tieuDe);
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
        prev.map((n) => (n.MA_TB === id || n.maTB === id || n.MaTB === id ? { ...n, DA_DOC: true, daDoc: true } : n))
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
        <h1>{PAGE_TITLES[activePage] || "DANGHOA-ERP"}</h1>
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
                {notifications.filter(n => n.DA_DOC === false || n.DA_DOC === 0 || n.daDoc === false).length === 0 ? (
                  <p style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13, margin: 0 }}>Không có thông báo mới nào.</p>
                ) : (
                  notifications.filter(n => n.DA_DOC === false || n.DA_DOC === 0 || n.daDoc === false).map((n) => {
                    const isUnread = true; // All displayed are unread
                    const id = n.MA_TB || n.maTB || n.MaTB;
                    const title = n.TIEU_DE || n.tieuDe || n.TieuDe;
                    const body = n.NOI_DUNG || n.noiDung || n.NoiDung;
                    const date = n.NGAY_TAO || n.ngayTao || n.NgayTao;
                    const type = n.LOAI || n.loai || n.Loai;
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
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRead(id);
                            }}
                            style={{ 
                              background: "none", border: "none", cursor: "pointer", 
                              color: "#10b981", padding: 4, display: "flex", alignItems: "center",
                              borderRadius: "50%"
                            }}
                            title="Đánh dấu đã đọc"
                            onMouseEnter={(e) => e.currentTarget.style.background = "#dcfce7"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="topbar-avatar-wrap" onClick={() => onNavigate("profile")} style={{ cursor: "pointer" }} title="Xem hồ sơ">
          <Avatar name={getUserName(user)} size="sm"  src={user?.HINH_DAI_DIEN || user?.hinh_dai_dien || user?.userInfo?.HINH_DAI_DIEN || user?.userInfo?.hinh_dai_dien} />
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
