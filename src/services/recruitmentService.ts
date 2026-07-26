import axiosClient from "./axiosClient";

const recruitmentService = {
  getCampaigns: () => axiosClient.get("/recruitment/campaigns"),
  getCampaignById: (id: string) => axiosClient.get(`/recruitment/campaigns/${id}`),
  createCampaign: (data: any) => axiosClient.post("/recruitment/campaigns", data),
  updateCampaign: (id: string, data: any) => axiosClient.put(`/recruitment/campaigns/${id}`, data),
  deleteCampaign: (id: string) => axiosClient.delete(`/recruitment/campaigns/${id}`),
  getApplicants: (MA_CD?: string) => axiosClient.get(`/recruitment/applicants`, { params: { MA_CD } }),
  updateApplicantStatus: (id: string, status: string, notes?: string) => 
    axiosClient.put(`/recruitment/applicants/${id}/status`, { TRANG_THAI: status, GHI_CHU: notes }),
  hireApplicant: (id: string, MA_NV: string, MA_PHG: number) => 
    axiosClient.post(`/recruitment/applicants/${id}/hire`, { MA_NV, MA_PHG }),
};

export default recruitmentService;
