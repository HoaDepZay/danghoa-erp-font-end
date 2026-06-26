import axiosClient from "./axiosClient";

const adminService = {
  getPendingOnboarding: () => axiosClient.get("/admin/onboarding/pending"),
  acceptOnboarding: (data: any) => axiosClient.post("/admin/onboarding/accept", data),
  rejectOnboarding: (data: any) => axiosClient.post("/admin/onboarding/reject", data),
  adminUpdateEmployee: (data: any) => axiosClient.put("/admin/nhan-vien/edit", data),
  adminDeleteEmployee: (MA_NV: string) => axiosClient.delete(`/admin/nhan-vien/${MA_NV}`),
  adminGetDepartments: () => axiosClient.get("/admin/phong-ban"),
  adminCreateDepartment: (data: any) => axiosClient.post("/admin/phong-ban/create", data),
  adminUpdateDepartment: (data: any) => axiosClient.put("/admin/phong-ban/edit", data),
  adminDeleteDepartment: (MA_PHG: string | number) => axiosClient.delete(`/admin/phong-ban/${MA_PHG}`),
};

export default adminService;
