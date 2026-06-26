import axiosClient from "./axiosClient";

const projectService = {
  getProjects: () => axiosClient.get("/projects"),
  getProject: (id: string | number) => axiosClient.get(`/projects/${id}`),
  createProject: (data: any) => axiosClient.post("/projects", data),
  updateProject: (id: string | number, data: any) => axiosClient.put(`/projects/${id}`, data),
  deleteProject: (id: string | number) => axiosClient.delete(`/projects/${id}`),
  getMyProjects: (MA_NV: string) => axiosClient.get(`/projects/employee/${MA_NV}`),
  addProjectMember: (id: string | number, data: any) => axiosClient.post(`/projects/${id}/members`, data),
  removeProjectMember: (id: string | number, employeeId: string) => axiosClient.delete(`/projects/${id}/members/${employeeId}`),
  getMyProjectsFull: () => axiosClient.get("/projects/my-projects/full"),
  getProjectTasks: (id: string | number) => axiosClient.get(`/projects/${id}/tasks`),
  createProjectTask: (id: string | number, data: any) => axiosClient.post(`/projects/${id}/tasks`, data),
  updateProjectTask: (id: string | number, taskId: string | number, data: any) => axiosClient.put(`/projects/${id}/tasks/${taskId}`, data),
  getProjectRoles: () => axiosClient.get("/projects/roles/all"),
  createProjectRole: (id: string | number, data: any) => axiosClient.post(`/projects/${id}/roles`, data),
};

export default projectService;
