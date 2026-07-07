import axiosClient from "./axiosClient";

const notificationService = {
  getNotifications: () => axiosClient.get("/notifications"),
  markAsRead: (id: string | number) => axiosClient.put(`/notifications/${id}/read`),
  uploadFile: (formData: FormData) => axiosClient.post("/files/upload", formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export default notificationService;
