import React from "react";
import { Navigate } from "react-router-dom";
import { useCustomerAuth } from "../../hooks/useCustomerAuth";
import toast from "react-hot-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean; // Optional prop to determine if auth is required
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = true,
}) => {
  const { isAuthenticated } = useCustomerAuth();

  if (requiresAuth && !isAuthenticated) {
    toast.error("You must be logged in to access this page");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
