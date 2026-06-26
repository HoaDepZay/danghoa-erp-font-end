import axiosClient from "./axiosClient";

const authService = {
  register: (data: any) => axiosClient.post("/auth/register", data),
  verifyOtp: (data: any) => axiosClient.post("/auth/verify-otp", data),
  login: (data: any) => axiosClient.post("/auth/login", data),
  refreshToken: (data: any) => axiosClient.post("/auth/refresh-token", data),
  logout: () => axiosClient.post("/auth/logout"),
  changePassword: (data: any) => axiosClient.put("/auth/change-password", data),
  updateProfile: (data: any) => axiosClient.put("/auth/update-profile", data),
  forgotPassword: (data: any) => axiosClient.post("/auth/forgot-password", data),
  resetPassword: (data: any) => axiosClient.post("/auth/reset-password", data),
};

export default authService;
