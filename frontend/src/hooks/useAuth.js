import { useState, useEffect } from "react";

// Custom hook to manage authentication state
export function useAuth() {
  // State: is the user authenticated?
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // Listen for changes to localStorage (e.g., login/logout in other tabs)
  useEffect(() => {
    const handler = () => setIsAuthenticated(!!localStorage.getItem("token"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Login: store token and update state
  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  // Logout: remove token and update state
  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // Return authentication state and handlers
  return { isAuthenticated, login, logout };
} 