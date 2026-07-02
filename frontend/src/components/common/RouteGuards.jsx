import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsLoggedIn, selectIsAdmin } from "../../features/auth/authSlice";

// initialized ab hamesha true hai (sessionStorage se seedha), 
// isliye koi loading check ki zaroorat nahi

export function ProtectedRoute({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const location   = useLocation();
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function AdminRoute({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isAdmin    = useSelector(selectIsAdmin);
  const location   = useLocation();
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin)    return <Navigate to="/" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  if (isLoggedIn) return <Navigate to="/" replace />;
  return children;
}
