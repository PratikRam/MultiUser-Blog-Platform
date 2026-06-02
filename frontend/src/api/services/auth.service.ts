import api from "@/src/api/axios";
import type { RegisterFormData, LoginFormData } from "@/src/types/index";

const registerUser = async (data: RegisterFormData) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

const loginUser = async (data: LoginFormData) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/authme");
  return response.data;
};

const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export { registerUser, loginUser, getCurrentUser, logoutUser };