import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../services/api.js";

const savedToken = localStorage.getItem("accessToken");
const savedUser = localStorage.getItem("user");

const parseSavedUser = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Thông tin user trong localStorage không hợp lệ:", error);

    localStorage.removeItem("user");

    return null;
  }
};

const initialState = {
  token: savedToken || null,
  user: parseSavedUser(savedUser),
  isAuthenticated: Boolean(savedToken),
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async (registerData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", registerData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Đăng ký thất bại.",
      );
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", loginData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Đăng nhập thất bại.",
      );
    }
  },
);

const getTokenFromResponse = (data) => {
  return data?.token || data?.accessToken || data?.jwt || null;
};

const getUserFromResponse = (data) => {
  return (
    data?.user || {
      id: data?.id || data?.userId || null,
      fullName: data?.fullName || "",
      email: data?.email || "",
      role: data?.role || "USER",
    }
  );
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })

      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const token = getTokenFromResponse(action.payload);
        const user = getUserFromResponse(action.payload);

        state.token = token;
        state.user = user;
        state.isAuthenticated = Boolean(token);

        if (token) {
          localStorage.setItem("accessToken", token);
        }

        localStorage.setItem("user", JSON.stringify(user));
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
