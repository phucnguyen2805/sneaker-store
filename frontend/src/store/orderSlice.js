import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  checkoutOrder,
  getMyOrderById,
  getMyOrders,
} from "../services/orderService.js";

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  actionLoading: false,
  error: null,
};

export const checkout = createAsyncThunk(
  "order/checkout",
  async (_, { rejectWithValue }) => {
    try {
      return await checkoutOrder();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo đơn hàng.",
      );
    }
  },
);

export const fetchMyOrders = createAsyncThunk(
  "order/fetchMyOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyOrders();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải lịch sử đơn hàng.",
      );
    }
  },
);

export const fetchMyOrderById = createAsyncThunk(
  "order/fetchMyOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      return await getMyOrderById(orderId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thông tin đơn hàng.",
      );
    }
  },
);

const orderSlice = createSlice({
  name: "order",

  initialState,

  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },

    resetOrder: (state) => {
      state.orders = [];
      state.currentOrder = null;
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // =========================
      // CHECKOUT
      // =========================
      .addCase(checkout.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(checkout.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })

      .addCase(checkout.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // =========================
      // GET MY ORDERS
      // =========================
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // GET ORDER DETAIL
      // =========================
      .addCase(fetchMyOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })

      .addCase(fetchMyOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, resetOrder } = orderSlice.actions;

export default orderSlice.reducer;
