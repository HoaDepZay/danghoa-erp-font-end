import axiosClient from "./axiosClient";

const contractService = {
  getContracts: (params?: any) => axiosClient.get("/contracts", { params }),
  getExpiringContracts: (soNgay: number = 30) => axiosClient.get(`/contracts/expiring?soNgay=${soNgay}`),
  createContract: (data: any) => axiosClient.post("/contracts", data),
  updateEmployeeLegal: (data: any) => axiosClient.put("/contracts/legal", data),
};

export default contractService;
