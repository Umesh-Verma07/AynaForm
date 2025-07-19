import { useState, useEffect, useCallback } from "react";

// Custom event for authentication state changes
const AUTH_EVENT = 'auth-state-changed';

// Custom hook to manage authentication state
export function useAuth() {
  // State: is the user authenticated?
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // Login: store token and update state
  const login = useCallback((token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { 
      detail: { isAuthenticated: true } 
    }));
  }, []);

  // Logout: remove token and update state
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { 
      detail: { isAuthenticated: false } 
    }));
  }, []);

  // Listen for changes to localStorage (e.g., login/logout in other tabs)
  useEffect(() => {
    const handler = () => {
      const newAuthState = !!localStorage.getItem("token");
      setIsAuthenticated(newAuthState);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Listen for custom auth events
  useEffect(() => {
    const handleAuthEvent = (event) => {
      setIsAuthenticated(event.detail.isAuthenticated);
    };
    
    window.addEventListener(AUTH_EVENT, handleAuthEvent);
    return () => window.removeEventListener(AUTH_EVENT, handleAuthEvent);
  }, []);

  // Return authentication state and handlers
  return { isAuthenticated, login, logout };
} 