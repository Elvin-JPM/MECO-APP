import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./UserProvider";

export const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { userData, user, loading } = useUser();

  // While loading, show nothing or a spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user exists, render the protected children
  if (userData) {
    return children;
  }
  console.log("requireAuth: ", userData);

  // Otherwise, redirect to login
  return <Navigate to="/login" state={{ from: location }} />;
};
