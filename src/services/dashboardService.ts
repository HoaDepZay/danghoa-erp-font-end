import axiosClient from "./axiosClient";

const dashboardService = {
  getDashboardRealtime: () => axiosClient.get("/dashboard/realtime"),
  getDashboardSummary: () => axiosClient.get("/dashboard/summary"),
  getDashboardAnalytics: () => axiosClient.get("/dashboard/analytics"),
  getAnalyticsSalaryCost: (year: number) => axiosClient.get("/dashboard/analytics/salary-cost", { params: { year } }),
  getAnalyticsAttendance: (year: number, month: number) => axiosClient.get("/dashboard/analytics/attendance", { params: { year, month } }),
  getAnalyticsSummary: () => axiosClient.get("/dashboard/analytics/summary"),
};

export default dashboardService;
