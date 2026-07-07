import axiosClient from "./axiosClient";

const chatService = {
  getChatRooms: () => axiosClient.get("/chat/rooms"),
  createDirectRoom: (data: any) => axiosClient.post("/chat/direct-room", data),
  getMessages: (roomId: string | number, params = { limit: 50 }) => axiosClient.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage: (roomId: string | number, data: any) => axiosClient.post(`/chat/rooms/${roomId}/messages`, data),
  getLatestMessage: (roomId: string | number) => axiosClient.get(`/chat/rooms/${roomId}/messages/latest`),
  searchMessages: (roomId: string | number, keyword: string) => axiosClient.get(`/chat/rooms/${roomId}/messages/search`, { params: { keyword } }),
  createChatGroup: (data: any) => axiosClient.post("/chat/groups", data),
  addChatGroupMember: (roomId: string | number, data: any) => axiosClient.post(`/chat/groups/${roomId}/members`, data),
  removeChatGroupMember: (roomId: string | number, memberId: string | number) => axiosClient.delete(`/chat/groups/${roomId}/members/${memberId}`),
  getProjectChatRoom: (projectId: string | number) => axiosClient.get(`/chat/projects/${projectId}/room`),
  getDepartmentChatRoom: (departmentId: string | number) => axiosClient.get(`/chat/departments/${departmentId}/room`),
  editMessage: (messageId: string | number, noiDung: string) => axiosClient.put(`/chat/messages/${messageId}`, { noiDung }),
  revokeMessage: (messageId: string | number) => axiosClient.delete(`/chat/messages/${messageId}/revoke`),
  deleteMessageForMe: (messageId: string | number) => axiosClient.delete(`/chat/messages/${messageId}/delete-for-me`),
};

export default chatService;
