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
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export const api = {
  // ───── AUTH ─────────────────────────────────────────
  login: (data) => axiosInstance.post("/auth/login", data),
  register: (data) => axiosInstance.post("/auth/register", data),
  verifyOtp: (data) => axiosInstance.post("/auth/verify-otp", data),
  forgotPassword: (data) => axiosInstance.post("/auth/forgot-password", data),
  changePassword: (data) => axiosInstance.post("/auth/change-password", data),

  // ───── EMPLOYEES ─────────────────────────────────────
  getEmployees: (params) => axiosInstance.get("/employees", { params }),
  getEmployee: (id) => axiosInstance.get(`/employees/${id}`),
  createEmployee: (data) => axiosInstance.post("/employees", data),
  updateEmployee: (id, data) => axiosInstance.put(`/employees/${id}`, data),

  // ───── DEPARTMENTS ───────────────────────────────────
  getDepartments: () => axiosInstance.get("/departments"),
  getDepartment: (id) => axiosInstance.get(`/departments/${id}`),
  createDepartment: (data) => axiosInstance.post("/departments", data),
  updateDepartment: (id, data) => axiosInstance.put(`/departments/${id}`, data),

  // ───── PROJECTS ──────────────────────────────────────
  getProjects: () => axiosInstance.get("/projects"),
  getProject: (id) => axiosInstance.get(`/projects/${id}`),
  getMyProjects: (id) => axiosInstance.get(`/projects/employee/${id}`),
  createProject: (data) => axiosInstance.post("/projects", data),
  addProjectMember: (id, data) => axiosInstance.post(`/projects/${id}/members`, data),
  removeProjectMember: (id, employeeId) =>
    axiosInstance.delete(`/projects/${id}/members/${employeeId}`),

  // ───── PAYROLL ───────────────────────────────────────
  getPayroll: (year, month) => axiosInstance.get(`/payroll/${year}/${month}`),
  getMyPayroll: (id, year, month) =>
    axiosInstance.get(`/payroll/employee/${id}/${year}/${month}`),
  generatePayroll: (data) => axiosInstance.post("/payroll/generate", data),
  updatePayroll: (maBl, data) => axiosInstance.put(`/payroll/${maBl}`, data),
};

export default axiosInstance;
