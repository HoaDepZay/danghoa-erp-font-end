import axiosClient from "../axiosClient";

const phaseService = {
  getPhasesByProject: (projectId: string | number) => axiosClient.get(`/phases/project/${projectId}`),
  getPhase: (phaseId: number | string) => axiosClient.get(`/phases/${phaseId}`),
  createPhase: (projectId: string | number, data: any) => axiosClient.post(`/phases/project/${projectId}`, data),
  updatePhase: (phaseId: string | number, data: any) => axiosClient.put(`/phases/${phaseId}`, data),
  deletePhase: (phaseId: string | number) => axiosClient.delete(`/phases/${phaseId}`),
  
  getPhaseAssignments: (phaseId: string | number) => axiosClient.get(`/phases/${phaseId}/assignments`),
  addPhaseAssignment: (phaseId: string | number, data: any) => axiosClient.post(`/phases/${phaseId}/assignments`, data),
  removePhaseAssignment: (phaseId: string | number, employeeId: string) => axiosClient.delete(`/phases/${phaseId}/assignments/${employeeId}`),

  getTasksByPhase: (phaseId: string | number) => axiosClient.get(`/phases/${phaseId}/tasks`),
  createTask: (phaseId: string | number, data: any) => axiosClient.post(`/phases/${phaseId}/tasks`, data),
  updateTask: (taskId: string | number, data: any) => axiosClient.put(`/phases/tasks/${taskId}`, data),
  deleteTask: (taskId: string | number) => axiosClient.delete(`/phases/tasks/${taskId}`),
};

export default phaseService;
