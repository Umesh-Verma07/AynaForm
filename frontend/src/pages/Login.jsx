import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const Login = () => {
  // State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Navigate to dashboard when authenticated during login process
  useEffect(() => {
    if (isAuthenticated && isLoggingIn) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoggingIn, navigate]);

  // Handle login form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    try {
      const res = await loginApi(username, password);
      login(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-[#181c2f] dark:via-[#232a47] dark:to-[#2d1e3a] transition-colors duration-500 px-4">
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-full p-2 sm:p-3 bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors backdrop-blur-lg"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M7.05 4.93l-.71-.71M12 5a7 7 0 100 14 7 7 0 000-14z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
        )}
      </button>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 w-full max-w-sm relative overflow-hidden"
      >
        {/* Accent bar */}
        <div className="h-2 w-full bg-purple-500 absolute top-0 left-0"></div>
        <div className="pt-2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-purple-600 dark:text-purple-400">Login</h2>
          {error && <div className="text-red-500 dark:text-red-300 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-base"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-purple-600 dark:bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-400 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-base">
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
          <div className="mt-6 text-center">
            <Link to="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors text-sm sm:text-base">
              Register as Admin
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login; 