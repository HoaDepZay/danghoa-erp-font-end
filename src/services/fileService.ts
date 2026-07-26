import axiosClient from "./axiosClient";

const fileService = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default fileService;
