import axiosClient from "./axiosClient";

const departmentService = {
  getDepartments: () => axiosClient.get("/departments"),
  getDepartment: (id: string | number) => axiosClient.get(`/departments/${id}`),
  createDepartment: (data: any) => axiosClient.post("/departments", data),
  updateDepartment: (id: string | number, data: any) => axiosClient.put(`/departments/${id}`, data),
  deleteDepartment: (id: string | number) => axiosClient.delete(`/departments/${id}`),
  getEmployeeDepartments: (id: string | number) => axiosClient.get(`/departments/employee/${id}`),
  getEmployeeDepartmentDetail: (id: string | number) => axiosClient.get(`/departments/employee/${id}/detail`),
};

export default departmentService;
