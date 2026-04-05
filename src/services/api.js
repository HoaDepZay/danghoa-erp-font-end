import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// ── Token helpers ────────────────────────────────────────────────────────────
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token"); // xóa luôn token cũ nếu còn
    localStorage.removeItem("user");
  },
};

// ── Axios instance ────────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: gắn accessToken vào header ──────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // Ưu tiên accessToken mới, fallback sang token cũ để tương thích
    const token =
      tokenStorage.getAccessToken() || localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Biến tránh gọi refresh nhiều lần đồng thời ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Response interceptor: tự động refresh khi hết hạn ────────────────────────
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    // Danh sách endpoint công khai (không cần refresh)
    const isPublicAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/verify-otp") ||
      requestUrl.includes("/auth/refresh-token");

    // Chỉ xử lý 401/403 với request được bảo vệ và chưa retry
    if (
      (status === 401 || status === 403) &&
      !isPublicAuthRequest &&
      !originalRequest._retry
    ) {
      const refreshToken = tokenStorage.getRefreshToken();

      // Không có refresh token → logout ngay
      if (!refreshToken) {
        tokenStorage.clearTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(error);
      }

      // Nếu đang refresh rồi, đưa request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token
        const refreshRes = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const newAccessToken =
          refreshRes.data?.accessToken || refreshRes.data?.token;
        const newRefreshToken =
          refreshRes.data?.refreshToken || refreshToken;

        // Lưu token mới
        tokenStorage.setTokens(newAccessToken, newRefreshToken);
        // Tương thích ngược: cập nhật cả "token" cũ
        if (newAccessToken) localStorage.setItem("token", newAccessToken);

        processQueue(null, newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clearTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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

  // POST /api/auth/refresh-token  { refreshToken }
  refreshToken: (data) => axiosInstance.post("/auth/refresh-token", data),

  // POST /api/auth/logout
  logout: () => axiosInstance.post("/auth/logout"),

  // PUT  /api/auth/change-password { email, oldPassword, newPassword }
  changePassword: (data) => axiosInstance.put("/auth/change-password", data),

  // PUT  /api/auth/update-profile  { email, ...fields }
  updateProfile: (data) => axiosInstance.put("/auth/update-profile", data),

  // (legacy alias – giữ để không break ForgotPassword.jsx)
  forgotPassword: (data) => axiosInstance.post("/auth/forgot-password", data),

  // GET  /api/dashboard/realtime
  getDashboardRealtime: () => axiosInstance.get("/dashboard/realtime"),

  // POST /api/auth/reset-password  { email, otpCode, newPassword }
  resetPassword: (data) => axiosInstance.post("/auth/reset-password", data),

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

  // GET  /api/projects/my-projects/full
  getMyProjectsFull: () => axiosInstance.get("/projects/my-projects/full"),

  // ───── PROJECT TASKS ────────────────────────────────────────────────────────
  // GET  /api/projects/:id/tasks
  getProjectTasks: (id) => axiosInstance.get(`/projects/${id}/tasks`),

  // POST /api/projects/:id/tasks
  createProjectTask: (id, data) => axiosInstance.post(`/projects/${id}/tasks`, data),

  // PUT  /api/projects/:id/tasks/:taskId
  updateProjectTask: (id, taskId, data) =>
    axiosInstance.put(`/projects/${id}/tasks/${taskId}`, data),

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
