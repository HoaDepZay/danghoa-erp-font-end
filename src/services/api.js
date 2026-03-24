import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Auto-attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Auto logout on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isPublicAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/verify-otp");

    // Only force logout/reload for protected requests.
    if (status === 401 && !isPublicAuthRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export const api = {
  // ───── AUTH ─────────────────────────────────────────────────────────────────
  // POST /api/auth/register       { email, password, manv, username, ... }
  register: (data) => axiosInstance.post("/auth/register", data),

  // POST /api/auth/verify-otp     { email, otpCode }
  verifyOtp: (data) => axiosInstance.post("/auth/verify-otp", data),

  // POST /api/auth/login          { email, password }
  login: (data) => axiosInstance.post("/auth/login", data),

  // PUT  /api/auth/change-password { email, oldPassword, newPassword }
  changePassword: (data) => axiosInstance.put("/auth/change-password", data),

  // PUT  /api/auth/update-profile  { email, ...fields }
  updateProfile: (data) => axiosInstance.put("/auth/update-profile", data),

  // (legacy alias – giữ để không break ForgotPassword.jsx)
  forgotPassword: (data) => axiosInstance.post("/auth/forgot-password", data),

  // ───── EMPLOYEES ─────────────────────────────────────────────────────────────
  // GET  /api/employees            (params: page, pageSize, search)
  getEmployees: (params) => axiosInstance.get("/employees", { params }),

  // GET  /api/employees/:id
  getEmployee: (id) => axiosInstance.get(`/employees/${id}`),

  // POST /api/employees
  createEmployee: (data) => axiosInstance.post("/employees", data),

  // PUT  /api/employees/:id
  updateEmployee: (id, data) => axiosInstance.put(`/employees/${id}`, data),

  // DELETE /api/employees/:id
  deleteEmployee: (id) => axiosInstance.delete(`/employees/${id}`),

  // GET  /api/employees/:manv   (cần Token)
  getProfile: (manv) => axiosInstance.get(`/employees/${manv}`),

  // GET  /api/projects/employee/:id  — dự án của một nhân viên
  getMyProjects: (manv) => axiosInstance.get(`/projects/employee/${manv}`),

  // GET  /api/employees/coworkers/:maphg  (cần Token)
  getCoworkers: (maphg) => axiosInstance.get(`/employees/coworkers/${maphg}`),

  // PUT  /api/employees/update-info       { email, ... }
  updateEmployeeInfo: (data) =>
    axiosInstance.put("/employees/update-info", data),

  // ───── ADMIN ─────────────────────────────────────────────────────────────────
  // GET  /api/admin/onboarding/pending
  getPendingOnboarding: () =>
    axiosInstance.get("/admin/onboarding/pending"),

  // POST /api/admin/onboarding/accept   { email, approvedBy, maphg, luong, chucvu }
  acceptOnboarding: (data) =>
    axiosInstance.post("/admin/onboarding/accept", data),

  // POST /api/admin/onboarding/reject   { email, rejectedBy, reason }
  rejectOnboarding: (data) =>
    axiosInstance.post("/admin/onboarding/reject", data),

  // PUT  /api/admin/nhan-vien/edit  { manv, hoten, maphg, luong, chucvu }
  adminUpdateEmployee: (data) =>
    axiosInstance.put("/admin/nhan-vien/edit", data),

  // DELETE /api/admin/nhan-vien/:manv
  adminDeleteEmployee: (manv) =>
    axiosInstance.delete(`/admin/nhan-vien/${manv}`),

  // GET  /api/admin/phong-ban
  adminGetDepartments: () => axiosInstance.get("/admin/phong-ban"),

  // POST /api/admin/phong-ban/create   { tenpb }
  adminCreateDepartment: (data) =>
    axiosInstance.post("/admin/phong-ban/create", data),

  // PUT  /api/admin/phong-ban/edit     { maphg, tenpb }
  adminUpdateDepartment: (data) =>
    axiosInstance.put("/admin/phong-ban/edit", data),

  // DELETE /api/admin/phong-ban/:maphg
  adminDeleteDepartment: (maphg) =>
    axiosInstance.delete(`/admin/phong-ban/${maphg}`),

  // ───── DEPARTMENTS ───────────────────────────────────────────────────────────
  // GET  /api/departments  → { success, data: [{ MAPHG, TENPB, NG_THANHLAP, MaTruongPhg, TenTruongPhong }] }
  getDepartments: () => axiosInstance.get("/departments"),

  // GET  /api/departments/:id  → { success, data: { ...dept, nhanVien: [] } }
  getDepartment: (id) => axiosInstance.get(`/departments/${id}`),

  // POST /api/departments  body: { maphg?, tenpb, matruongphg?, ng_thanhlap? }
  createDepartment: (data) => axiosInstance.post("/departments", data),

  // PUT  /api/departments/:id  body: { tenpb?, matruongphg? }
  updateDepartment: (id, data) => axiosInstance.put(`/departments/${id}`, data),

  // DELETE /api/departments/:id
  deleteDepartment: (id) => axiosInstance.delete(`/departments/${id}`),

  // ───── PROJECTS ──────────────────────────────────────────────────────────────
  // GET  /api/projects
  getProjects: () => axiosInstance.get("/projects"),

  // GET  /api/projects/:id
  getProject: (id) => axiosInstance.get(`/projects/${id}`),

  // POST /api/projects
  createProject: (data) => axiosInstance.post("/projects", data),

  // PUT  /api/projects/:id
  updateProject: (id, data) => axiosInstance.put(`/projects/${id}`, data),

  // DELETE /api/projects/:id
  deleteProject: (id) => axiosInstance.delete(`/projects/${id}`),

  // GET  /api/projects/employee/:id
  getProjectsByEmployee: (id) => axiosInstance.get(`/projects/employee/${id}`),

  // POST /api/projects/:id/members   { manv, vaitroduan }
  addProjectMember: (id, data) =>
    axiosInstance.post(`/projects/${id}/members`, data),

  // DELETE /api/projects/:id/members/:employeeId
  removeProjectMember: (id, employeeId) =>
    axiosInstance.delete(`/projects/${id}/members/${employeeId}`),

  // ───── PAYROLL ───────────────────────────────────────────────────────────────
  // GET  /api/payroll/:year/:month
  getPayroll: (year, month) => axiosInstance.get(`/payroll/${year}/${month}`),

  // GET  /api/payroll/employee/:id
  getMyPayroll: (id, year, month) =>
    axiosInstance.get(`/payroll/employee/${id}`, { params: { year, month } }),

  // POST /api/payroll/generate   { month, year }
  generatePayroll: (data) => axiosInstance.post("/payroll/generate", data),

  // PUT  /api/payroll/:maBl      { Thuong, KhauTruBH }
  updatePayroll: (maBl, data) => axiosInstance.put(`/payroll/${maBl}`, data),
};

export default axiosInstance;
