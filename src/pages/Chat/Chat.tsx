import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Send, 
  Search, 
  Plus, 
  Users, 
  Hash, 
  User, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Smile,
  Paperclip,
  Image as ImageIcon,
  MessageSquare,
  Briefcase,
  Building2,
  X,
  Clock,
  ChevronDown
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { api, tokenStorage } from "../../services/api";
import { toast, formatDate } from "../../utils/helpers";
import { Spinner, Avatar } from "../../components/UI";
import { getManv, toArray, getUserName } from "../../utils/user";

// ─── Helper: format giờ hiển thị preview ───────────────────────────────────────
const fmtPreviewTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const Chat = ({ user }: { user: any }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  // Map roomId -> latest message object
  const [latestMsgMap, setLatestMsgMap] = useState<Record<number, any>>({});
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [roomSearchQuery, setRoomSearchQuery] = useState("");
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ─── Search state ───────────────────────────────────────────────────────────
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const myMaNv = getManv(user);

  // 1. Kết nối Socket
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const socketBase = isLocalhost ? "http://localhost:5000" : `http://${window.location.hostname}:5000`;
    const socket = io(socketBase, { transports: ["websocket"], auth: { token } });
    socketRef.current = socket;
    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("Socket error:", err.message));

    // Lắng nghe tin nhắn mới + cập nhật latest preview
    socket.on("chat:new_message", (newMsg) => {
      setMessages((prev) => {
        const maTN = newMsg.MaTN || newMsg.MaTinNhan || newMsg.maTN;
        if (prev.some(m => (m.MaTN || m.MaTinNhan || m.maTN) === maTN)) return prev;
        return [...prev, newMsg];
      });
      // Cập nhật preview tin nhắn mới nhất cho phòng
      const roomId = newMsg.MaPhong;
      if (roomId) {
        setLatestMsgMap(prev => ({ ...prev, [roomId]: newMsg }));
      }
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedRoom && isMobile) setShowSidebar(false);
  }, [selectedRoom, isMobile]);

  useEffect(() => {
    if (selectedRoom && selectedRoom.MaPhong && selectedRoom.MaPhong !== "undefined") {
      fetchMessages(selectedRoom.MaPhong);
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedRoom && selectedRoom.MaPhong && selectedRoom.MaPhong !== "undefined" && socketRef.current) {
      const socket = socketRef.current;
      socket.emit("chat:join_room", { maPhong: selectedRoom.MaPhong }, (ack: any) => {
        if (!ack.success) console.warn("Join room failed:", ack.message);
      });
      return () => { socket.emit("chat:leave_room", { maPhong: selectedRoom.MaPhong }); };
    }
  }, [selectedRoom, socketRef.current]);

  useEffect(() => { fetchRooms(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Đóng search khi đổi phòng
  useEffect(() => {
    setShowSearch(false);
    setSearchKeyword("");
    setSearchResults([]);
    setSearchDone(false);
  }, [selectedRoom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ─── Fetch room + latest message ───────────────────────────────────────────
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.getChatRooms();
      const roomsData = toArray(res.data);
      setRooms(roomsData);
      
      const activeRoomId = localStorage.getItem("activeRoomId");
      if (activeRoomId) {
        const found = roomsData.find((r: any) => String(r.MaPhong) === String(activeRoomId));
        if (found) {
          setSelectedRoom(found);
        } else {
          if (roomsData.length > 0 && !selectedRoom) setSelectedRoom(roomsData[0]);
        }
        localStorage.removeItem("activeRoomId");
      } else {
        if (roomsData.length > 0 && !selectedRoom) setSelectedRoom(roomsData[0]);
      }

      // Fetch latest message song song cho tất cả phòng
      fetchAllLatestMessages(roomsData);
    } catch (err) {
      console.error("Fetch rooms error", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchAllLatestMessages = useCallback(async (roomList: any[]) => {
    const validRooms = roomList.filter(room => room && room.MaPhong && room.MaPhong !== "undefined");
    const results = await Promise.allSettled(
      validRooms.map(async (room) => {
        try {
          const res = await (api as any).getLatestMessage(room.MaPhong);
          const data = res.data?.data ?? null;
          return { roomId: room.MaPhong, data };
        } catch {
          return { roomId: room.MaPhong, data: null };
        }
      })
    );
    const map: Record<number, any> = {};
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value.data) {
        map[r.value.roomId] = r.value.data;
      }
    });
    setLatestMsgMap(map);
  }, []);

  const fetchMessages = async (roomId: number) => {
    setLoadingMessages(true);
    try {
      const res = await api.getMessages(roomId);
      const messagesData = toArray(res.data);
      setMessages(messagesData);
    } catch (err) {
      console.error("Fetch messages error", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRoom || !socketRef.current) return;
    const currentMsg = messageInput;
    setMessageInput("");
    socketRef.current.emit("chat:send_message", {
      maPhong: selectedRoom.MaPhong,
      noiDung: currentMsg,
    }, (ack: any) => {
      if (!ack.success) {
        toast.error("Gửi tin nhắn thất bại!");
        setMessageInput(currentMsg);
      }
    });
  };

  // ─── Search messages ────────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) { toast.error("Vui lòng nhập từ khoá!"); return; }
    if (!selectedRoom || !selectedRoom.MaPhong || selectedRoom.MaPhong === "undefined") return;
    setSearchLoading(true);
    setSearchDone(false);
    try {
      const res = await (api as any).searchMessages(selectedRoom.MaPhong, searchKeyword.trim());
      const data = res.data?.data ?? [];
      setSearchResults(Array.isArray(data) ? data : []);
      setSearchDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tìm kiếm!");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchKeyword, selectedRoom]);

  const openSearch = () => {
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchKeyword("");
    setSearchResults([]);
    setSearchDone(false);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getDisplayName = (room: any) => {
    if (room.LoaiPhong !== 1) return room.TenPhong;
    const myName = getUserName(user).trim().toLowerCase().normalize("NFC");
    let names = room.TenPhong.split(" - ");
    if (names.length < 2) names = room.TenPhong.split("-");
    if (names.length >= 2) {
      const name0 = names[0].trim().normalize("NFC");
      const name1 = names[1].trim().normalize("NFC");
      if (name0.toLowerCase() === myName) return name1;
      if (name1.toLowerCase() === myName) return name0;
      return name0.toLowerCase().includes(myName) ? name1 : name0;
    }
    return room.TenPhong;
  };

  const getRoomIcon = (type: number) => {
    switch (type) {
      case 1: return <User size={18} />;
      case 2: return <Briefcase size={18} />;
      case 3: return <Building2 size={18} />;
      default: return <Hash size={18} />;
    }
  };

  const filteredRooms = rooms
    .filter(room => room.TenPhong?.toLowerCase().includes(roomSearchQuery.toLowerCase()))
    // Sắp xếp: phòng có tin nhắn mới nhất lên đầu
    .sort((a, b) => {
      const ta = latestMsgMap[a.MaPhong]?.ThoiGianGui;
      const tb = latestMsgMap[b.MaPhong]?.ThoiGianGui;
      if (!ta && !tb) return 0;
      if (!ta) return 1;
      if (!tb) return -1;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });

  // Cắt nội dung preview
  const truncate = (text: string, max = 36) =>
    text?.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div
      className={`chat-page ${showSidebar ? "show-sidebar" : "show-chat"}`}
      style={{
        height: "calc(100vh - 120px)", display: "flex", background: "#fff",
        borderRadius: "20px", overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
        position: "relative", width: "100%", minWidth: 0,
      }}
    >
      {/* ── Sidebar ── */}
      <div
        className="chat-sidebar"
        style={{
          width: isMobile ? "100%" : "320px", borderRight: "1px solid #f1f5f9",
          display: isMobile && !showSidebar ? "none" : "flex",
          flexDirection: "column", background: "#fdfdff", flexShrink: 0,
        }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>Tin nhắn</h2>
            <button style={{
              width: "36px", height: "36px", borderRadius: "10px", background: "#f1f5f9",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#64748b",
            }}>
              <Plus size={20} />
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              placeholder="Tìm cuộc hội thoại..."
              value={roomSearchQuery}
              onChange={(e) => setRoomSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px 10px 38px", background: "#fff",
                border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "14px", outline: "none",
              }}
            />
          </div>
        </div>

        {/* Room list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {loadingRooms ? (
            <div style={{ padding: "20px", textAlign: "center" }}><Spinner size={24} /></div>
          ) : filteredRooms.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
              <Users size={32} style={{ marginBottom: "12px", opacity: 0.3 }} />
              <p style={{ fontSize: "14px" }}>Chưa có cuộc hội thoại nào</p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const latest = latestMsgMap[room.MaPhong];
              const latestContent = latest?.NoiDung || "";
              const latestTime = latest?.ThoiGianGui;
              const isSelected = selectedRoom?.MaPhong === room.MaPhong;

              return (
                <div
                  key={room.MaPhong}
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "12px",
                    borderRadius: "14px", cursor: "pointer", transition: "all 0.2s",
                    background: isSelected ? "#f1f5f9" : "transparent",
                    marginBottom: "2px",
                  }}
                  className="room-item"
                >
                  {/* Avatar */}
                  {room.LoaiPhong === 1 ? (
                    <Avatar name={getDisplayName(room)} size="lg" />
                  ) : (
                    <div style={{
                      width: "52px", height: "52px", borderRadius: "14px",
                      background: isSelected ? "#fff" : "#f1f5f9",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
                      boxShadow: isSelected ? "0 4px 6px -1px rgb(0 0 0 / 0.1)" : "none",
                      flexShrink: 0,
                    }}>
                      {getRoomIcon(room.LoaiPhong)}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                      <h4 style={{
                        margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {getDisplayName(room)}
                      </h4>
                      {/* ← Thời gian tin nhắn mới nhất */}
                      {latestTime && (
                        <span style={{ fontSize: "10px", color: "#94a3b8", flexShrink: 0, marginLeft: 4 }}>
                          {fmtPreviewTime(latestTime)}
                        </span>
                      )}
                    </div>
                    {/* ← Preview tin nhắn mới nhất */}
                    <p style={{
                      margin: 0, fontSize: "12px",
                      color: latestContent ? "#64748b" : "#94a3b8",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      fontStyle: latestContent ? "normal" : "italic",
                    }}>
                      {latestContent
                        ? truncate(latestContent)
                        : room.MoTa || "Bắt đầu trò chuyện..."}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", minWidth: 0 }}>
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: isMobile ? "12px 16px" : "16px 24px", borderBottom: "1px solid #f1f5f9",
              display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "12px", minWidth: 0 }}>
                {isMobile && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    style={{ border: "none", background: "none", padding: "8px", cursor: "pointer", color: "#64748b" }}
                  >
                    <Plus size={20} style={{ transform: "rotate(45deg)" }} />
                  </button>
                )}
                {selectedRoom.LoaiPhong === 1 ? (
                  <Avatar name={getDisplayName(selectedRoom)} size="md" />
                ) : (
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "12px", background: "#f8fafc",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#334155",
                    border: "1px solid #f1f5f9", flexShrink: 0,
                  }}>
                    {getRoomIcon(selectedRoom.LoaiPhong)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {getDisplayName(selectedRoom)}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Đang hoạt động</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {/* ← Nút tìm kiếm tin nhắn */}
                <button
                  className="chat-action-btn"
                  onClick={showSearch ? closeSearch : openSearch}
                  style={{ background: showSearch ? "#f1f5f9" : "transparent" }}
                  title="Tìm kiếm tin nhắn"
                >
                  <Search size={18} />
                </button>
                <button className="chat-action-btn" onClick={() => toast.info("Tính năng cuộc gọi đang được phát triển")}><Phone size={18} /></button>
                <button className="chat-action-btn" onClick={() => toast.info("Tính năng cuộc gọi video đang được phát triển")}><Video size={18} /></button>
                <button
                  className="chat-action-btn"
                  onClick={() => setShowRoomInfo(!showRoomInfo)}
                  style={{ background: showRoomInfo ? "#f1f5f9" : "transparent" }}
                >
                  <Info size={18} />
                </button>
                {(!isMobile || !showRoomInfo) && (
                  <button className="chat-action-btn" onClick={() => toast.info("Tính năng đang được phát triển")}><MoreVertical size={18} /></button>
                )}
              </div>
            </div>

            {/* ← Search Panel */}
            {showSearch && (
              <div style={{
                padding: "12px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {/* Search input row */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{
                    flex: 1, display: "flex", alignItems: "center", gap: 8,
                    background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
                    padding: "8px 14px",
                  }}>
                    <Search size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
                    <input
                      ref={searchInputRef}
                      placeholder="Tìm kiếm trong cuộc hội thoại..."
                      value={searchKeyword}
                      onChange={e => setSearchKeyword(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSearch()}
                      style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "none" }}
                    />
                    {searchKeyword && (
                      <button
                        onClick={() => { setSearchKeyword(""); setSearchResults([]); setSearchDone(false); }}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    style={{
                      padding: "8px 16px", borderRadius: 10, border: "none",
                      background: "#111", color: "#fff", fontWeight: 700, fontSize: 13,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      opacity: searchLoading ? 0.7 : 1,
                    }}
                  >
                    {searchLoading ? <Spinner size={14} /> : <Search size={14} />}
                    Tìm
                  </button>
                  <button
                    onClick={closeSearch}
                    style={{
                      width: 36, height: 36, borderRadius: 10, border: "none",
                      background: "#e2e8f0", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", color: "#64748b",
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Search results */}
                {searchDone && (
                  <div style={{
                    maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4,
                  }}>
                    {searchResults.length === 0 ? (
                      <div style={{ padding: "12px 4px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                        Không tìm thấy tin nhắn nào chứa "{searchKeyword}"
                      </div>
                    ) : (
                      <>
                        <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                          {searchResults.length} kết quả
                        </p>
                        {searchResults.map((msg, i) => {
                          const isMine = (msg.MaNV_Gui || msg.maNvGui) === myMaNv;
                          const content = msg.NoiDung || msg.noiDung || "";
                          const time = msg.ThoiGianGui || msg.thoiGianGui;
                          // Highlight từ khoá
                          const idx = content.toLowerCase().indexOf(searchKeyword.toLowerCase());
                          let display: React.ReactNode = content;
                          if (idx >= 0) {
                            display = (
                              <>
                                {content.slice(0, idx)}
                                <mark style={{ background: "#fef08a", borderRadius: 2, padding: "0 1px" }}>
                                  {content.slice(idx, idx + searchKeyword.length)}
                                </mark>
                                {content.slice(idx + searchKeyword.length)}
                              </>
                            );
                          }
                          return (
                            <div
                              key={msg.MaTN ?? i}
                              style={{
                                padding: "8px 12px", borderRadius: 10, background: "#fff",
                                border: "1px solid #f1f5f9", display: "flex", gap: 10, alignItems: "flex-start",
                              }}
                            >
                              <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: isMine ? "#111" : "#334155",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, color: "#fff", fontWeight: 700, flexShrink: 0,
                              }}>
                                {isMine ? "T" : (msg.MaNV_Gui || "?").charAt(0)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                                    {isMine ? "Bạn" : (msg.MaNV_Gui || "Người dùng")}
                                  </span>
                                  {time && (
                                    <span style={{ fontSize: 10, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
                                      <Clock size={9} /> {fmtPreviewTime(time)}
                                    </span>
                                  )}
                                </div>
                                <p style={{ margin: 0, fontSize: 13, color: "#1e293b", wordBreak: "break-word" }}>
                                  {display}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#fcfcfd" }}>
              {loadingMessages ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Spinner size={24} /></div>
              ) : messages.length === 0 ? (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                  <img src="/chat-welcome.svg" alt="Welcome" style={{ width: "120px", opacity: 0.5, marginBottom: "16px" }} />
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>Hãy gửi lời chào đầu tiên!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const maNvGui = msg.MaNV_Gui || msg.maNvGui || msg.MaNV || msg.manv;
                  const isMine = maNvGui === myMaNv;
                  const noiDung = msg.NoiDung || msg.noiDung;
                  const thoiGian = msg.ThoiGianGui || msg.thoiGianGui || msg.ThoiGian;
                  let tenNv = msg.TenNguoiGui || msg.TenNhanVien || msg.tenNhanVien;
                  if (!tenNv) {
                    if (isMine) tenNv = getUserName(user) || "Tôi";
                    else if (selectedRoom.LoaiPhong === 1) tenNv = getDisplayName(selectedRoom);
                    else tenNv = "User";
                  }
                  return (
                    <div
                      key={msg.MaTN || msg.MaTinNhan || idx}
                      style={{ display: "flex", flexDirection: isMine ? "row-reverse" : "row", marginBottom: "16px", gap: "12px" }}
                    >
                      {!isMine && (
                        <Avatar name={tenNv} size="sm" />
                      )}
                      <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                        {!isMine && <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginLeft: "4px", marginBottom: "4px" }}>{tenNv}</span>}
                        <div style={{
                          padding: "10px 16px",
                          borderRadius: isMine ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                          background: isMine ? "#111" : "#fff",
                          color: isMine ? "#fff" : "#1e293b",
                          fontSize: "14px", lineHeight: "1.5",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          border: isMine ? "none" : "1px solid #f1f5f9",
                        }}>
                          {noiDung}
                        </div>
                        <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px", padding: "0 4px" }}>
                          {formatDate(thoiGian)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: "20px 24px", background: "#fff", borderTop: "1px solid #f1f5f9" }}>
              <form
                onSubmit={handleSendMessage}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc",
                  padding: "8px 16px", borderRadius: "16px", border: "1px solid #e2e8f0",
                }}
              >
                <button type="button" className="input-action-btn" onClick={() => toast.info("Tính năng gửi icon đang được phát triển")}><Smile size={20} /></button>
                <button type="button" className="input-action-btn" onClick={() => toast.info("Tính năng đính kèm file đang được phát triển")}><Paperclip size={20} /></button>
                <input
                  placeholder="Viết tin nhắn..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  style={{ flex: 1, border: "none", background: "none", outline: "none", padding: "10px 0", fontSize: "14px", minWidth: 0 }}
                />
                <button type="button" className="input-action-btn" onClick={() => toast.info("Tính năng gửi hình ảnh đang được phát triển")}><ImageIcon size={20} /></button>
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  style={{
                    width: "40px", height: "40px", borderRadius: "12px", background: "#111",
                    color: "#fff", border: "none", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                    opacity: messageInput.trim() ? 1 : 0.5,
                  }}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fcfcfd" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "24px", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)", marginBottom: "24px",
            }}>
              <MessageSquare size={32} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: "0 0 8px 0" }}>Bắt đầu trò chuyện</h2>
            <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", maxWidth: "280px" }}>
              Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu trao đổi công việc.
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar - Room Info */}
      {showRoomInfo && selectedRoom && (
        <div
          className="chat-info-panel"
          style={{
            width: isMobile ? "100%" : "280px", height: isMobile ? "100%" : "auto",
            position: isMobile ? "absolute" : "static", top: 0, left: 0, zIndex: 100,
            borderLeft: isMobile ? "none" : "1px solid #f1f5f9",
            background: "#fff", padding: "24px", overflowY: "auto",
          }}
        >
          {isMobile && (
            <button
              onClick={() => setShowRoomInfo(false)}
              style={{ position: "absolute", top: "20px", left: "20px", border: "none", background: "#f1f5f9", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Plus size={20} style={{ transform: "rotate(45deg)" }} />
            </button>
          )}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "24px", background: "#f8fafc",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#334155",
              border: "1px solid #f1f5f9", margin: "0 auto 16px",
            }}>
              {getRoomIcon(selectedRoom.LoaiPhong)}
            </div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 800 }}>{getDisplayName(selectedRoom)}</h3>
            <span className="badge badge-gray">
              {selectedRoom.LoaiPhong === 1 ? "Cá nhân" : selectedRoom.LoaiPhong === 2 ? "Dự án" : "Nhóm"}
            </span>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Thông tin</p>
            <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
              {selectedRoom.MoTa || "Không có mô tả chi tiết."}
            </div>
          </div>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Thành viên</p>
            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "12px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>
              Chưa hiển thị danh sách
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chat-action-btn, .input-action-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: none; background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #64748b; transition: all 0.2s;
        }
        .chat-action-btn:hover, .input-action-btn:hover {
          background: #f1f5f9; color: #1e293b;
        }
        .room-item:hover { background: #f8fafc !important; }
      `}</style>
    </div>
  );
};

export default Chat;
