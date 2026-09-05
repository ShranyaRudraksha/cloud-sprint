import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getRequests = () => api.get("/requests").then(r => r.data);
export const createRequest = (data) => api.post("/requests", data).then(r => r.data);
export const decideRequest = (id, decision, approver_name, remarks) =>
  api.patch(`/requests/${id}/decision`, { decision, approver_name, remarks }).then(r => r.data);
export const teardownRequest = (id, actor) =>
  api.post(`/requests/${id}/teardown`, { actor }).then(r => r.data);
export const getRequestLogs = (id) =>
  api.get(`/requests/${id}/logs`).then(r => r.data);
export const getOrgAdmins = () =>
  api.get(`/requests/org-admins`).then(r => r.data);