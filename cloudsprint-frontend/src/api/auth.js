import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const registerUser = (data) => api.post("/auth/register", data).then(r => r.data);
export const loginUser = (data) => api.post("/auth/login", data).then(r => r.data);