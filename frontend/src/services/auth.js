import api from "./api";

// Register a new user
export const register = (username, password) =>
  api.post("/auth/register", { username, password });

// Login a user
export const login = (username, password) =>
  api.post("/auth/login", { username, password }); 