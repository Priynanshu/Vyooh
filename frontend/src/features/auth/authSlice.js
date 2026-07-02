import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { API } from "../../constants";

// Login — backend response: { message, user: {username, email, role}, accessToken }
export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post(API.LOGIN, credentials);
    return res.data; // { message, user, accessToken }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login fail ho gaya");
  }
});

// Register — backend response: { message, user, token }
export const registerUser = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post(API.REGISTER, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration fail ho gayi");
  }
});

// Logout
export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await api.post(API.LOGOUT);
  } catch (err) {
    // Even if fails, clear local
  }
});

// Restore session from sessionStorage
const savedUser = JSON.parse(sessionStorage.getItem("vyooh_user") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    savedUser,
    loading: false,
    error:   null,
  },
  reducers: {
    clearError: (s) => { s.error = null; },
    clearUser:  (s) => {
      s.user = null;
      sessionStorage.removeItem("vyooh_user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(loginUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user    = a.payload.user;
        sessionStorage.setItem("vyooh_user", JSON.stringify(a.payload.user));
      })
      // Register
      .addCase(registerUser.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(registerUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; })
      // Logout
      .addCase(logoutUser.fulfilled, (s) => {
        s.user = null;
        sessionStorage.removeItem("vyooh_user");
      })
      .addCase(logoutUser.rejected, (s) => {
        s.user = null;
        sessionStorage.removeItem("vyooh_user");
      });
  },
});

export const { clearError, clearUser } = authSlice.actions;
export const selectUser        = (s) => s.auth.user;
export const selectIsAdmin     = (s) => s.auth.user?.role === "admin";
export const selectAuthLoading = (s) => s.auth.loading;
export const selectAuthError   = (s) => s.auth.error;
export const selectIsLoggedIn  = (s) => !!s.auth.user;
export default authSlice.reducer;
