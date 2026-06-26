import axiosClient from "./axiosClient";

const employeeService = {
  getEmployees: (params?: any) => axiosClient.get("/employees", { params }),
  getEmployee: (id: string | number) => axiosClient.get(`/employees/${id}`),
  createEmployee: (data: any) => axiosClient.post("/employees", data),
  updateEmployee: (id: string | number, data: any) => axiosClient.put(`/employees/${id}`, data),
  deleteEmployee: (id: string | number) => axiosClient.delete(`/employees/${id}`),
  getProfile: (MA_NV: string) => axiosClient.get(`/employees/${MA_NV}`),
  getCoworkers: (MA_PHG: string | number) => axiosClient.get(`/employees/coworkers/${MA_PHG}`),
  updateEmployeeInfo: (data: any) => axiosClient.put("/employees/update-info", data),
};

export default employeeService;
