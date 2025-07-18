import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "../services/auth";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginApi(username, password);
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-[#1812f] dark:via-[#232a47] dark:to-[#23 transition-colors duration-500">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-#232 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 max-w-sm relative overflow-hidden"
      >
        {/* Accent bar */}
        <div className="h-2 w-full bg-purple-500 absolute top-0 left-0"></div>
        <div className="pt-2">
          <h2 className="text-3xl font-bold mb-4 text-center text-purple-600 dark:text-purple-400">Login</h2>
          {error && <div className="text-red-500 dark:text-red-300 mb-4 p-3 bg-red-50 rounded-lg">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-90 dark:text-white placeholder-gray-500 k:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-90 dark:text-white placeholder-gray-500 k:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 dark:bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-400 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400">
            Login
          </button>
          <div className="mt-6 text-center">
            <Link to="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
              Register as Admin
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login; 