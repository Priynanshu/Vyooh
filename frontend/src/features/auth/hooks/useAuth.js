import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginUser, registerUser, logoutUser,
  selectUser, selectIsAdmin, selectIsLoggedIn,
  selectAuthLoading, selectAuthError, clearError,
} from "../authSlice";

export function useAuth() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const user       = useSelector(selectUser);
  const isAdmin    = useSelector(selectIsAdmin);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const loading    = useSelector(selectAuthLoading);
  const error      = useSelector(selectAuthError);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      navigate("/");
      return true;
    }
    return false;
  };

  const register = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      navigate("/login");
      return true;
    }
    return false;
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return { user, isAdmin, isLoggedIn, loading, error,
    login, register, logout,
    dismissError: () => dispatch(clearError()),
  };
}
