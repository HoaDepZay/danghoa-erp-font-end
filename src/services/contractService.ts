import axiosClient from "./axiosClient";

const contractService = {
  getContracts: (params?: any) => axiosClient.get("/contracts", { params }),
  getContractByMaNV: (maNV: string) => axiosClient.get(`/contracts/${maNV}`),
  getExpiringContracts: (soNgay: number = 30) => axiosClient.get(`/contracts/expiring?soNgay=${soNgay}`),
  createContract: (data: any) => axiosClient.post("/contracts", data),
  updateContract: (id: string, data: any) => axiosClient.put(`/contracts/${id}`, data),
  updateContractStatus: (id: string, status: string) => axiosClient.put(`/contracts/${id}/status`, { TRANG_THAI: status }),
  getContractHistory: (id: string) => axiosClient.get(`/contracts/${id}/history`),
  updateEmployeeLegal: (data: any) => axiosClient.put("/contracts/legal", data),
};

export default contractService;
