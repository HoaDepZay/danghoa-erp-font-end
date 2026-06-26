import axiosClient, { API_URL, tokenStorage } from "./axiosClient";
import authService from "./authService";
import employeeService from "./employeeService";
import adminService from "./adminService";
import departmentService from "./departmentService";
import projectService from "./projectService";
import payrollService from "./payrollService";
import chatService from "./chatService";
import contractService from "./contractService";
import dashboardService from "./dashboardService";
import expenseService from "./expenseService";
import notificationService from "./notificationService";

export const api = {
  ...authService,
  ...employeeService,
  ...adminService,
  ...departmentService,
  ...projectService,
  ...payrollService,
  ...chatService,
  ...contractService,
  ...dashboardService,
  ...expenseService,
  ...notificationService,
};

export { API_URL, tokenStorage };
export default axiosClient;
