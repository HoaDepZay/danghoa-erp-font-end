import React, { useState, useEffect, useRef } from "react";
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
  MessageSquare
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { api, tokenStorage } from "../../services/api";
import { toast, formatDate } from "../../utils/helpers";
import { Spinner } from "../../components/UI";
import { getManv, toArray } from "../../utils/user";

const Chat = ({ user }: { user: any }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const myMaNv = getManv(user);

  // 1. Kết nối Socket khi vào trang Chat
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("Socket error:", err.message));

    // Lắng nghe tin nhắn mới
    socket.on("chat:new_message", (newMsg) => {
      setMessages((prev) => {
        const maTN = newMsg.MaTN || newMsg.MaTinNhan || newMsg.maTN;
        const exists = prev.some(m => (m.MaTN || m.MaTinNhan || m.maTN) === maTN);
        if (exists) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // 2. Lấy tin nhắn (REST) - Luôn chạy khi đổi room
  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.MaPhong);
    }
  }, [selectedRoom]);

  // 3. Join/Leave room (Socket) - Chạy khi có room VÀ socket sẵn sàng
  useEffect(() => {
    if (selectedRoom && socketRef.current) {
      const socket = socketRef.current;
      socket.emit("chat:join_room", { maPhong: selectedRoom.MaPhong }, (ack: any) => {
        if (!ack.success) console.warn("Join room failed:", ack.message);
      });

      return () => {
        socket.emit("chat:leave_room", { maPhong: selectedRoom.MaPhong });
      }
    }
  }, [selectedRoom, socketRef.current]);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.getChatRooms();
      const roomsData = toArray(res.data);
      setRooms(roomsData);
      
      // Tự động chọn phòng đầu tiên khi mới vào trang (F5)
      if (roomsData.length > 0 && !selectedRoom) {
        setSelectedRoom(roomsData[0]);
      }
    } catch (err) {
      console.error("Fetch rooms error", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: number) => {
    setLoadingMessages(true);
    try {
      const res = await api.getMessages(roomId);
      // Backend thường trả mảng tin nhắn trong 'data' hoặc trực tiếp
      const messagesData = toArray(res.data);
      console.log(`Fetched ${messagesData.length} messages for room ${roomId}`);
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

    // Sử dụng Socket để gửi tin nhắn realtime
    socketRef.current.emit("chat:send_message", { 
      maPhong: selectedRoom.MaPhong, 
      noiDung: currentMsg 
    }, (ack: any) => {
      if (!ack.success) {
        toast.error("Gửi tin nhắn thất bại!");
        setMessageInput(currentMsg); // Restore input on error
      }
    });
  };

  const getRoomIcon = (type: number) => {
    switch (type) {
      case 1: return <User size={18} />;
      case 2: return <Hash size={18} />;
      case 3: return <Users size={18} />;
      default: return <Hash size={18} />;
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.TenPhong?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-page" style={{ 
      height: "calc(100vh - 120px)", 
      display: "flex", 
      background: "#fff", 
      borderRadius: "20px", 
      overflow: "hidden", 
      boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
      border: "1px solid #f1f5f9"
    }}>
      {/* Sidebar - Rooms List */}
      <div style={{ 
        width: "320px", 
        borderRight: "1px solid #f1f5f9", 
        display: "flex", 
        flexDirection: "column",
        background: "#fdfdff"
      }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>Tin nhắn</h2>
            <button style={{ 
              width: "36px", height: "36px", borderRadius: "10px", background: "#f1f5f9", 
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#64748b"
            }}>
              <Plus size={20} />
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input 
              placeholder="Tìm kiếm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: "100%", padding: "10px 12px 10px 38px", background: "#fff", border: "1px solid #e2e8f0", 
                borderRadius: "12px", fontSize: "14px", outline: "none"
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
            filteredRooms.map((room) => (
              <div 
                key={room.MaPhong}
                onClick={() => setSelectedRoom(room)}
                style={{ 
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", 
                  cursor: "pointer", transition: "all 0.2s",
                  background: selectedRoom?.MaPhong === room.MaPhong ? "#f1f5f9" : "transparent"
                }}
                className="room-item"
              >
                <div style={{ 
                  width: "48px", height: "48px", borderRadius: "14px", 
                  background: selectedRoom?.MaPhong === room.MaPhong ? "#fff" : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
                  boxShadow: selectedRoom?.MaPhong === room.MaPhong ? "0 4px 6px -1px rgb(0 0 0 / 0.1)" : "none"
                }}>
                  {getRoomIcon(room.LoaiPhong)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {room.TenPhong}
                    </h4>
                    {/* <span style={{ fontSize: "10px", color: "#94a3b8" }}>12:30</span> */}
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {room.TinNhanGanNhat || room.MoTa || "Bắt đầu trò chuyện..."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div style={{ 
              padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", 
              justifyContent: "space-between", alignItems: "center",
              background: "#fff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ 
                  width: "40px", height: "40px", borderRadius: "12px", background: "#f8fafc",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#334155",
                  border: "1px solid #f1f5f9"
                }}>
                  {getRoomIcon(selectedRoom.LoaiPhong)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>{selectedRoom.TenPhong}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></div>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Đang hoạt động</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="chat-action-btn"><Phone size={18} /></button>
                <button className="chat-action-btn"><Video size={18} /></button>
                <button 
                  className="chat-action-btn"
                  onClick={() => setShowRoomInfo(!showRoomInfo)}
                  style={{ background: showRoomInfo ? "#f1f5f9" : "transparent" }}
                >
                  <Info size={18} />
                </button>
                <button className="chat-action-btn"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#fcfcfd" }}>
              {loadingMessages ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Spinner size={24} /></div>
              ) : messages.length === 0 ? (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                  <img src="/chat-welcome.svg" alt="Welcome" style={{ width: "120px", opacity: 0.5, marginBottom: "16px" }} />
                  <p>Hãy gửi lời chào đầu tiên!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const maNvGui = msg.MaNV_Gui || msg.maNvGui || msg.MaNV || msg.manv;
                  const isMine = maNvGui === myMaNv;
                  const noiDung = msg.NoiDung || msg.noiDung;
                  const thoiGian = msg.ThoiGianGui || msg.thoiGianGui || msg.ThoiGian;
                  const tenNv = msg.TenNguoiGui || msg.TenNhanVien || msg.tenNhanVien || "User";

                  return (
                    <div 
                      key={msg.MaTN || msg.MaTinNhan || idx}
                      style={{ 
                        display: "flex", 
                        flexDirection: isMine ? "row-reverse" : "row", 
                        marginBottom: "16px",
                        gap: "12px"
                      }}
                    >
                      {!isMine && (
                         <div style={{ 
                          width: "32px", height: "32px", borderRadius: "8px", background: "#334155", 
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px",
                          color: "#fff", fontWeight: 700, flexShrink: 0
                        }}>
                          {tenNv.charAt(0)}
                        </div>
                      )}
                      <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                        {!isMine && <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginLeft: "4px", marginBottom: "4px" }}>{tenNv}</span>}
                        <div style={{ 
                          padding: "10px 16px", 
                          borderRadius: isMine ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                          background: isMine ? "#111" : "#fff",
                          color: isMine ? "#fff" : "#1e293b",
                          fontSize: "14px",
                          lineHeight: "1.5",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          border: isMine ? "none" : "1px solid #f1f5f9"
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
                  padding: "8px 16px", borderRadius: "16px", border: "1px solid #e2e8f0"
                }}
              >
                <button type="button" className="input-action-btn"><Smile size={20} /></button>
                <button type="button" className="input-action-btn"><Paperclip size={20} /></button>
                <input 
                  placeholder="Viết tin nhắn..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  style={{ 
                    flex: 1, border: "none", background: "none", outline: "none", 
                    padding: "10px 0", fontSize: "14px" 
                  }}
                />
                <button type="button" className="input-action-btn"><ImageIcon size={20} /></button>
                <button 
                  type="submit"
                  disabled={!messageInput.trim()}
                  style={{ 
                    width: "40px", height: "40px", borderRadius: "12px", background: "#111", 
                    color: "#fff", border: "none", cursor: "pointer", display: "flex", 
                    alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                    opacity: messageInput.trim() ? 1 : 0.5
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
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)", marginBottom: "24px"
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
        <div style={{ width: "280px", borderLeft: "1px solid #f1f5f9", background: "#fff", padding: "24px", overflowY: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ 
              width: "80px", height: "80px", borderRadius: "24px", background: "#f8fafc",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#334155",
              border: "1px solid #f1f5f9", margin: "0 auto 16px"
            }}>
              {getRoomIcon(selectedRoom.LoaiPhong)}
            </div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 800 }}>{selectedRoom.TenPhong}</h3>
            <span className="badge badge-gray">{selectedRoom.LoaiPhong === 1 ? "Cá nhân" : selectedRoom.LoaiPhong === 2 ? "Dự án" : "Nhóm"}</span>
          </div>

          <div style={{ marginBottom: "24px" }}>
             <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Thông tin</p>
             <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
               {selectedRoom.MoTa || "Không có mô tả chi tiết."}
             </div>
          </div>

          <div>
             <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Thành viên</p>
             {/* List of members would go here */}
             <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "12px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>
               Chưa hiển thị danh sách
             </div>
          </div>
        </div>
      )}

      <style>{`
        .chat-action-btn, .input-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }
        .chat-action-btn:hover, .input-action-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .room-item:hover {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
};

export default Chat;
