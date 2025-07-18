import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import FormBuilder from "./FormBuilder";
import FormResponses from "./FormResponses";
import FormSummary from "./FormSummary";
import PublicForm from "./PublicForm";
import FormDetails from "./FormDetails";
import { useAuth } from "../hooks/useAuth";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen w-full font-sans bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-[#181c2f] dark:via-[#232a47] dark:to-[#2d1e3a] text-gray-900 dark:text-gray-100 transition-colors duration-500 flex flex-col">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/forms/new"
          element={isAuthenticated ? <FormBuilder /> : <Navigate to="/login" />}
        />
        <Route
          path="/forms/:id/edit"
          element={isAuthenticated ? <FormBuilder editMode /> : <Navigate to="/login" />}
        />
        <Route
          path="/forms/:id/responses"
          element={isAuthenticated ? <FormResponses /> : <Navigate to="/login" />}
        />
        <Route
          path="/forms/:id/summary"
          element={isAuthenticated ? <FormSummary /> : <Navigate to="/login" />}
        />
        <Route path="/forms/:id" element={<PublicForm />} />
        <Route path="/forms/:id/details" element={isAuthenticated ? <FormDetails /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
};

export default App; 