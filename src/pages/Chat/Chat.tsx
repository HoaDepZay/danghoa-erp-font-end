import { Btn } from '../../components/UI';
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
import { api, tokenStorage, API_URL } from "../../services/api";
import { toast, formatDate, getProp } from "../../utils/helpers";
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

const Chat = ({ user, embeddedRoomId, embeddedRoom }: { user: any; embeddedRoomId?: string; embeddedRoom?: any }) => {
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
  const [showSidebar, setShowSidebar] = useState(!embeddedRoomId);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ─── Search state ───────────────────────────────────────────────────────────
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ file: File; url: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const myMaNv = getManv(user);

  // 1. Kết nối Socket
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;
    const socket = io(API_URL, { transports: ["websocket"], auth: { token } });
    socketRef.current = socket;
    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("Socket error:", err.message));

    // Lắng nghe tin nhắn mới + cập nhật latest preview
    socket.on("chat:new_message", (newMsg) => {
      setMessages((prev) => {
        const maTN = getProp(newMsg, 'MaTN') || getProp(newMsg, 'MaTinNhan');
        if (prev.some(m => (getProp(m, 'MaTN') || getProp(m, 'MaTinNhan')) === maTN)) return prev;
        return [...prev, newMsg];
      });
      // Cập nhật preview tin nhắn mới nhất cho phòng
      const roomId = getRoomId(newMsg);
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
    if (selectedRoom) {
      const roomId = getRoomId(selectedRoom);
      if (roomId) fetchMessages(roomId);
    }
  }, [selectedRoom]);

  useEffect(() => {
    const roomId = selectedRoom ? getRoomId(selectedRoom) : null;
    if (roomId && socketRef.current) {
      const socket = socketRef.current;
      socket.emit("chat:join_room", { maPhong: roomId }, (ack: any) => {
        if (!ack.success) console.warn("Join room failed:", ack.message);
      });
      return () => { socket.emit("chat:leave_room", { maPhong: roomId }); };
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

  const getRoomId = (room: any) => room?.MA_PHONG || room?.MaPhong || room?.maPhong || room?.MAPHONG || room?.maphong || room?.id;
  const getRoomName = (r: any) => getProp(r, 'tenphong') ?? "";
  const getRoomType = (r: any) => {
    const raw = getProp(r, 'LOAI_PHONG') ?? getProp(r, 'loai_phong') ?? 1;
    if (typeof raw === 'number') return raw;
    const str = String(raw).toLowerCase().trim();
    if (str === 'nhan vien' || str === 'direct' || str === '1') return 1;
    if (str === 'du an' || str === 'project' || str === '2') return 2;
    if (str === 'phong ban' || str === 'department' || str === '3') return 3;
    return 3;
  };

  // ─── Fetch room + latest message ───────────────────────────────────────────
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.getChatRooms();
      const roomsData = toArray(res.data);
      setRooms(roomsData);
      
      if (embeddedRoomId) {
        let found = roomsData.find((r: any) => String(getRoomId(r)) === String(embeddedRoomId));
        if (!found && embeddedRoom) {
          found = embeddedRoom;
          setRooms((prev) => [...prev, embeddedRoom]);
        }
        if (found) {
          setSelectedRoom(found);
        }
      } else {
        const activeRoomId = localStorage.getItem("activeRoomId") || localStorage.getItem("pendingChatRoomId");
        if (activeRoomId) {
          const found = roomsData.find((r: any) => String(getRoomId(r)) === String(activeRoomId));
          if (found) {
            setSelectedRoom(found);
          } else {
            if (roomsData.length > 0 && !selectedRoom) setSelectedRoom(roomsData[0]);
          }
          localStorage.removeItem("activeRoomId");
          localStorage.removeItem("pendingChatRoomId");
        } else {
          if (roomsData.length > 0 && !selectedRoom) setSelectedRoom(roomsData[0]);
        }
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
    const map: Record<string, any> = {};
    await Promise.all(
      roomList.map(async (r) => {
        try {
          const roomId = getRoomId(r);
          if (!roomId) return;
          const res = await (api as any).getLatestMessage(roomId);
          const msgData = getProp(res?.data, 'data');
          if (msgData) {
            map[roomId] = msgData;
          }
        } catch {}
      })
    );
    setLatestMsgMap(map);
  }, []);

  const fetchMessages = async (roomId: any) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await (api as any).uploadFile(formData);
        const isSuccess = getProp(res?.data, 'success');
        if (isSuccess) {
          setAttachedFile({
            file,
            url: getProp(res.data, 'url'),
            type: getProp(res.data, 'type')
          });
        }
      } catch (err) {
        toast.error("Upload thất bại!");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !attachedFile) || !selectedRoom || !socketRef.current) return;
    const currentMsg = messageInput;
    const fileUrl = attachedFile?.url;
    const fileType = attachedFile?.type;
    
    setMessageInput("");
    setAttachedFile(null);
    socketRef.current.emit("chat:send_message", {
      maPhong: getRoomId(selectedRoom),
      noiDung: currentMsg,
      fileUrl,
      fileType
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
    const roomId = selectedRoom ? getRoomId(selectedRoom) : null;
    if (!roomId) return;
    setSearchLoading(true);
    setSearchDone(false);
    try {
      const res = await (api as any).searchMessages(roomId, searchKeyword.trim());
      const data = getProp(res?.data, 'data') ?? [];
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

  const getDisplayName = (room: any) => {
    if (!room) return "";
    let name = getRoomName(room);
    
    // Nếu phòng chat cá nhân có tên là chuỗi mặc định "Chat: ", hãy cố lấy tên từ thành viên
    if (getRoomType(room) === 1 && name.startsWith("Chat: ")) {
      name = "";
    }
    
    // Nếu tên phòng trống (có thể xảy ra khi vừa tạo phòng mới hoặc bị clear ở trên),
    // cố gắng lấy từ thông tin thành viên (thanhVien) nếu có.
    if (!name && getRoomType(room) === 1 && room.thanhVien && Array.isArray(room.thanhVien)) {
      const myMaNv = getManv(user);
      const other = room.thanhVien.find((tv: any) => getManv(tv) !== myMaNv);
      if (other) {
        name = getProp(other, 'TENNV') || getProp(other, 'HO_TEN') || getProp(other, 'name') || "User";
      }
    }
    
    // Fallback cuối cùng nếu cả thanhVien cũng không có
    if (!name && getRoomType(room) === 1) {
       name = getRoomName(room); // Trả lại cái tên cũ "Chat: xxx" nếu không tìm được tên
       if (name.startsWith("Chat: ")) {
          // Bỏ chữ "Chat: "
          name = name.replace("Chat: ", "").trim();
       }
    }
    
    return name || "User";
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
    .filter(room => getRoomName(room).toLowerCase().includes(roomSearchQuery.toLowerCase()))
    .sort((a, b) => {
      const ta = getProp(latestMsgMap[getRoomId(a)], 'ThoiGianGui');
      const tb = getProp(latestMsgMap[getRoomId(b)], 'ThoiGianGui');
      if (!ta && !tb) return 0;
      if (!ta) return 1;
      if (!tb) return -1;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });

  const truncate = (text: string, max = 36) =>
    text?.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div
      className={`chat-page ${showSidebar ? "show-sidebar" : "show-chat"}`}
      style={{
        height: embeddedRoomId ? "100%" : "calc(100vh - 120px)", display: "flex", background: "#fff",
        borderRadius: "20px", overflow: "hidden",
        boxShadow: embeddedRoomId ? "none" : "0 10px 40px rgba(0,0,0,0.05)", 
        border: embeddedRoomId ? "none" : "1px solid #f1f5f9",
        position: "relative", width: "100%", minWidth: 0,
      }}
    >
      <div
        className="chat-sidebar"
        style={{
          width: isMobile ? "100%" : "320px", borderRight: "1px solid #f1f5f9",
          display: embeddedRoomId ? "none" : (isMobile && !showSidebar ? "none" : "flex"),
          flexDirection: "column", background: "#fdfdff", flexShrink: 0,
        }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>Tin nhắn</h2>
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
              const rId = getRoomId(room);
              const latest = latestMsgMap[rId];
              const latestContent = getProp(latest, 'noidung') ?? "";
              const latestTime = getProp(latest, 'thoigiangui') ?? getProp(latest, 'THOI_GIAN') ?? "";
              const isSelected = getRoomId(selectedRoom) === rId;

              return (
                <div
                  key={rId}
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
                  <div style={{ position: "relative" }}>
                    {getRoomType(room) === 1 ? (
                      <Avatar name={getDisplayName(room)} size="md" />
                    ) : (
                      <div style={{
                        width: "52px", height: "52px", borderRadius: "14px",
                        background: isSelected ? "#fff" : "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
                        boxShadow: isSelected ? "0 4px 6px -1px rgb(0 0 0 / 0.1)" : "none",
                        flexShrink: 0,
                      }}>
                        {getRoomIcon(getRoomType(room))}
                      </div>
                    )}
                  </div>

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
                        : getProp(room, 'MO_TA') || "Bắt đầu trò chuyện..."}
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
                  <Btn
                    onClick={() => setShowSidebar(true)}
                    style={{ border: "none", background: "none", padding: "8px", cursor: "pointer", color: "#64748b" }}
                  >
                    <Plus size={20} style={{ transform: "rotate(45deg)" }} />
                  </Btn>
                )}
                {getRoomType(selectedRoom) === 1 ? (
                  <Avatar name={getDisplayName(selectedRoom)} size="md" />
                ) : (
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "12px", background: "#f8fafc",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#334155",
                    border: "1px solid #f1f5f9", flexShrink: 0,
                  }}>
                    {getRoomIcon(getRoomType(selectedRoom))}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {getDisplayName(selectedRoom)}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>Đang hoạt động</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                {/* ← Nút tìm kiếm tin nhắn */}
                <Btn
                  variant="ghost"
                  className="chat-action-btn"
                  onClick={showSearch ? closeSearch : openSearch}
                  style={{ width: 36, height: 36, padding: 0, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", background: showSearch ? "#f1f5f9" : "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                  title="Tìm kiếm tin nhắn"
                >
                  <Search size={18} />
                </Btn>
                {(!isMobile && !embeddedRoomId) && (
                  <>
                    <Btn variant="ghost" className="chat-action-btn" onClick={() => toast.info("Tính năng cuộc gọi đang được phát triển")} style={{ width: 36, height: 36, padding: 0, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}><Phone size={18} /></Btn>
                    <Btn variant="ghost" className="chat-action-btn" onClick={() => toast.info("Tính năng cuộc gọi video đang được phát triển")} style={{ width: 36, height: 36, padding: 0, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}><Video size={18} /></Btn>
                  </>
                )}
                <Btn
                  variant="ghost"
                  className="chat-action-btn"
                  onClick={() => setShowRoomInfo(!showRoomInfo)}
                  style={{ width: 36, height: 36, padding: 0, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", background: showRoomInfo ? "#f1f5f9" : "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                  title="Thông tin nhóm"
                >
                  <Info size={18} />
                </Btn>
                {(!isMobile || !showRoomInfo) && (
                  <Btn variant="ghost" className="chat-action-btn" onClick={() => toast.info("Tính năng đang được phát triển")} style={{ width: 36, height: 36, padding: 0, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}><MoreVertical size={18} /></Btn>
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
                      <Btn
                        onClick={() => { setSearchKeyword(""); setSearchResults([]); setSearchDone(false); }}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}
                      >
                        <X size={14} />
                      </Btn>
                    )}
                  </div>
                  <Btn
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
                  </Btn>
                  <Btn
                    onClick={closeSearch}
                    style={{
                      width: 36, height: 36, borderRadius: 10, border: "none",
                      background: "#e2e8f0", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", color: "#64748b",
                    }}
                  >
                    <ChevronDown size={16} />
                  </Btn>
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
                          const maNvGui = getProp(msg, 'manv_gui') ?? getProp(msg, 'manvgui') ?? getProp(msg, 'MA_NV');
                          const isMine = maNvGui === myMaNv;
                          const content = getProp(msg, 'noidung') ?? "";
                          const time = getProp(msg, 'thoigiangui') ?? getProp(msg, 'THOI_GIAN');
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
                              key={getProp(msg, 'MaTN') ?? i}
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
                                {isMine ? "T" : (getProp(msg, 'manv_gui') ?? getProp(msg, 'manvgui') ?? "?").charAt(0)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                                    {isMine ? "Bạn" : (getProp(msg, 'manv_gui') ?? getProp(msg, 'manvgui') ?? "Người dùng")}
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
                  const maNvGui = getProp(msg, 'manv_gui') ?? getProp(msg, 'manvgui') ?? getProp(msg, 'MA_NV');
                  const isMine = maNvGui === myMaNv;
                  const noiDung = getProp(msg, 'noidung') ?? "";
                  const THOI_GIAN = getProp(msg, 'thoigiangui') ?? getProp(msg, 'THOI_GIAN');
                  let tenNv = getProp(msg, 'tennguoigui') ?? getProp(msg, 'tennhanvien');
                  if (!tenNv) {
                    if (isMine) tenNv = getUserName(user) || "Tôi";
                    else if (getRoomType(selectedRoom) === 1) tenNv = getDisplayName(selectedRoom);
                    else tenNv = "User";
                  }
                  return (
                    <div
                      key={getProp(msg, 'MaTN') || getProp(msg, 'MaTinNhan') || idx}
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
                          {getProp(msg, 'fileurl') ? (
                            <div style={{ marginBottom: noiDung ? 8 : 0 }}>
                              {getProp(msg, 'filetype')?.startsWith('image/') ? (
                                <img src={`${API_URL}${getProp(msg, 'fileurl')}`} alt="attachment" style={{ maxWidth: 200, borderRadius: 8 }} />
                              ) : (
                                <a href={`${API_URL}${getProp(msg, 'fileurl')}`} target="_blank" rel="noreferrer" style={{ color: isMine ? "#fff" : "#2563eb", textDecoration: "underline", display: "flex", alignItems: "center", gap: 4 }}>
                                  <Paperclip size={14} /> Tệp đính kèm
                                </a>
                              )}
                            </div>
                          ) : null}
                          {noiDung}
                        </div>
                        <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px", padding: "0 4px" }}>
                          {formatDate(THOI_GIAN)}
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
              {attachedFile && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f1f5f9", borderRadius: 8, marginBottom: 12, width: "fit-content" }}>
                  <Paperclip size={14} color="#64748b" />
                  <span style={{ fontSize: 13, color: "#475569" }}>{attachedFile.file.name}</span>
                  <Btn type="button" onClick={() => setAttachedFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", padding: 4 }}>
                    <X size={14} />
                  </Btn>
                </div>
              )}
              <form
                onSubmit={handleSendMessage}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc",
                  padding: "8px 16px", borderRadius: "16px", border: "1px solid #e2e8f0",
                }}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                {(!isMobile && !embeddedRoomId) && (
                  <Btn type="button" className="input-action-btn" onClick={() => toast.info("Tính năng gửi icon đang được phát triển")}><Smile size={20} /></Btn>
                )}
                <Btn type="button" className="input-action-btn" onClick={() => fileInputRef.current?.click()} style={{ flexShrink: 0 }}>
                  {uploading ? <Spinner size={20} color="#64748b" /> : <Paperclip size={20} />}
                </Btn>
                <input
                  placeholder="Viết tin nhắn..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  style={{ flex: 1, border: "none", background: "none", outline: "none", padding: "10px 0", fontSize: "14px", minWidth: "60px" }}
                />
                {(!isMobile && !embeddedRoomId) && (
                  <Btn type="button" className="input-action-btn" onClick={() => toast.info("Tính năng gửi hình ảnh đang được phát triển")}><ImageIcon size={20} /></Btn>
                )}
                <Btn
                  type="submit"
                  disabled={(!messageInput.trim() && !attachedFile) || uploading}
                  style={{
                    width: "40px", height: "40px", borderRadius: "12px", background: "#111", flexShrink: 0,
                    color: "#fff", border: "none", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                    opacity: (messageInput.trim() || attachedFile) && !uploading ? 1 : 0.5,
                  }}
                >
                  <Send size={18} />
                </Btn>
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
            <Btn
              onClick={() => setShowRoomInfo(false)}
              style={{ position: "absolute", top: "20px", left: "20px", border: "none", background: "#f1f5f9", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Plus size={20} style={{ transform: "rotate(45deg)" }} />
            </Btn>
          )}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "24px", background: "#f8fafc",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#334155",
              border: "1px solid #f1f5f9", margin: "0 auto 16px",
            }}>
              {getRoomIcon(getRoomType(selectedRoom))}
            </div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 600, color: "#1e293b", textAlign: "center" }}>
              {getDisplayName(selectedRoom)}
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              {getRoomType(selectedRoom) === 1 ? "Cá nhân" : getRoomType(selectedRoom) === 2 ? "Dự án" : "Nhóm"}
            </p>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Thông tin</p>
            <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
              {getProp(selectedRoom, 'MO_TA') || "Không có mô tả chi tiết."}
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
