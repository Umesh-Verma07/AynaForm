import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

// Navigation bar component for the app
const Navbar = () => {
  // Get authentication state and logout function
  const { isAuthenticated, logout } = useAuth();
  // Get theme state and toggle function
  const { theme, toggleTheme } = useTheme();
  // React Router navigation
  const navigate = useNavigate();

  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-purple-600 dark:bg-gray-900 shadow-lg px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center transition-colors duration-300 backdrop-blur-lg">
      {/* App logo/title links to dashboard */}
      <Link to="/dashboard" className="font-bold text-lg sm:text-xl text-white">
        AynaForm
      </Link>
      <div className="flex gap-2 sm:gap-4 items-center">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            // Sun icon for dark mode
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M7.05 4.93l-.71-.71M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
          ) : (
            // Moon icon for light mode
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
          )}
        </button>
        {/* Show dashboard and logout if authenticated */}
        {isAuthenticated && (
          <>
            <Link to="/dashboard" className="text-white hover:text-purple-200 transition-colors text-sm sm:text-base hidden sm:block">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm sm:text-base"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 