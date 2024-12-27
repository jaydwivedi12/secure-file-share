import React from "react";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import { Navigate } from "react-router";
import { Routes, Route } from "react-router";
import GuestViewfile from "./pages/GuestViewfile";
import ChangePasswordPage from "./pages/ChangePassword";

const App = () => {
  return (

        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/share/:link_id" element={<GuestViewfile/>}/>
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['regular']} />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
  );
};

export default App;
