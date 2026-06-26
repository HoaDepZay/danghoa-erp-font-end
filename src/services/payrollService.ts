import axiosClient from "./axiosClient";

const payrollService = {
  getPayroll: (year: number, month: number) => axiosClient.get(`/payroll/${year}/${month}`),
  getMyPayroll: (id: string, year: number, month: number) => axiosClient.get(`/payroll/employee/${id}`, { params: { year, month } }),
  updatePayroll: (id: string, data: any) => axiosClient.put(`/payroll/salary/${id}`, data),
  checkIn: (data: any) => axiosClient.post("/payroll/check-in", data),
  checkOut: (data: any) => axiosClient.post("/payroll/check-out", data),
  closePayrollForMonth: (year: number, month: number) => axiosClient.post(`/payroll/close/${year}/${month}`),
  checkIfPayrollClosed: (year: number, month: number) => axiosClient.get(`/payroll/status/${year}/${month}`),
  
  getAttendanceByDate: (date: string) => axiosClient.get(`/payroll/attendance/${date}`),
  getAttendanceEmployee: (id: string, params?: any) => axiosClient.get(`/payroll/attendance/employee/${id}`, { params }),
  
  getShifts: () => axiosClient.get("/shifts"),
  getShiftAssignments: (params?: any) => axiosClient.get("/shifts/assignments", { params }),
  createShiftAssignment: (data: any) => axiosClient.post("/shifts/assignments", data),
  deleteShiftAssignment: (id: string | number) => axiosClient.delete(`/shifts/assignments/${id}`),

  getLeaves: (params?: any) => axiosClient.get("/leaves", { params }),
  getLeaveTypes: () => axiosClient.get("/leaves/types"),
  getMyLeaves: () => axiosClient.get("/leaves/my"),
  submitLeave: (data: any) => axiosClient.post("/leaves", data),
  approveLeave: (data: any) => axiosClient.post("/leaves/approve", data),
};

export default payrollService;
