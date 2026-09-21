import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice.js";
import cartReducer from "./cartSlice.js";
import orderReducer from "./orderSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
  },
});
