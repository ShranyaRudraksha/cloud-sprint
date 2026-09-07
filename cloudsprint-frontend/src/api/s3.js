import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getUploadUrl = (bucket_name, file_name, content_type) =>
  api.post("/s3/upload-url", { bucket_name, file_name, content_type }).then(r => r.data.upload_url);
