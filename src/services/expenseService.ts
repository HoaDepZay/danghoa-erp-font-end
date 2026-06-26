import axiosClient from "./axiosClient";

const expenseService = {
  getExpenses: () => axiosClient.get("/expenses"),
  getExpense: (id: string | number) => axiosClient.get(`/expenses/${id}`),
  createExpense: (data: any) => axiosClient.post("/expenses", data),
  updateExpense: (id: string | number, data: any) => axiosClient.put(`/expenses/${id}`, data),
  deleteExpense: (id: string | number) => axiosClient.delete(`/expenses/${id}`),
};

export default expenseService;
