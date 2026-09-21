import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  addCartItem,
  clearCart,
  deleteCartItem,
  getCart,
  updateCartItem,
} from '../services/cartService.js';

const initialState = {
  cart: null,
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      return await getCart();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Không thể tải giỏ hàng.',
      );
    }
  },
);

export const addItem = createAsyncThunk(
  'cart/addItem',
  async ({ productVariantId, quantity }, { rejectWithValue }) => {
    try {
      return await addCartItem(productVariantId, quantity);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Không thể thêm sản phẩm vào giỏ hàng.',
      );
    }
  },
);

export const updateItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      return await updateCartItem(itemId, quantity);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Không thể cập nhật số lượng.',
      );
    }
  },
);

export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      return await deleteCartItem(itemId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Không thể xóa sản phẩm khỏi giỏ hàng.',
      );
    }
  },
);

export const removeAllItems = createAsyncThunk(
  'cart/removeAllItems',
  async (_, { rejectWithValue }) => {
    try {
      return await clearCart();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Không thể xóa giỏ hàng.',
      );
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,

  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },

    resetCart: (state) => {
      state.cart = null;
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // =========================
      // GET CART
      // =========================
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })

      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // ADD ITEM
      // =========================
      .addCase(addItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(addItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.cart = action.payload;
      })

      .addCase(addItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // =========================
      // UPDATE ITEM
      // =========================
      .addCase(updateItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(updateItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.cart = action.payload;
      })

      .addCase(updateItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // =========================
      // REMOVE ITEM
      // =========================
      .addCase(removeItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(removeItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.cart = action.payload;
      })

      .addCase(removeItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // =========================
      // CLEAR CART
      // =========================
      .addCase(removeAllItems.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(removeAllItems.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.cart = action.payload;
      })

      .addCase(removeAllItems.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCartError,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;