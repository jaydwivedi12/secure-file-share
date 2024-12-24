import React from "react";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotAuthorized from "./pages/NotAuthorized";
import ProtectedRoute from "./routes/ProtectedRoute";

import { Routes, Route } from "react-router";

const App = () => {
  return (

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['regular']} />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
          </Route>
        </Routes>
  );
};

export default App;
