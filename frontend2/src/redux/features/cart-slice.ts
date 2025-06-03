import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type CartItem = {
  id: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  image?: string;
};

type InitialState = {
  items: CartItem[];
  groupOrderId: string | null;
};

const initialState: InitialState = {
  items: [],
  groupOrderId: null,
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      if (state.groupOrderId) {
        console.error("Cannot add normal items to a group order cart!");
        return;
      }
      const { id, title, price, quantity, discountedPrice, imgs } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ id, title, price, quantity, discountedPrice, imgs });
      }
    },

    addGroupOrderItem: (
      state,
      action: PayloadAction<CartItem & { groupOrderId: string }>
    ) => {
      const { groupOrderId, ...item } = action.payload;

      if (state.items.length === 0) {
        state.groupOrderId = groupOrderId;
      } else if (state.groupOrderId !== groupOrderId) {
        console.error("Cannot mix items from different group orders!");
        return;
      }

      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
    },

    removeItemFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.items.length === 0) {
        state.groupOrderId = null;
      }
    },

    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) item.quantity = quantity;
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
      state.groupOrderId = null;
    },

    setGroupOrder: (state, action: PayloadAction<string>) => {
      if (state.items.length > 0 && !state.groupOrderId) {
        console.error("Cannot convert existing normal cart to group order!");
        return;
      }
      state.groupOrderId = action.payload;
    },

    clearGroupOrder: (state) => {
      state.groupOrderId = null;
    },
  },
});

// Selectors
export const selectCartItems = (state: RootState) => state.cartReducer.items;
export const selectGroupOrderId = (state: RootState) =>
  state.cartReducer.groupOrderId;
export const selectIsGroupOrder = createSelector(
  [selectGroupOrderId],
  (groupOrderId) => !!groupOrderId
);

export const selectTotalPrice = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.discountedPrice * item.quantity, 0)
);

export const selectSubtotalPrice = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const selectTotalDiscount = createSelector(
  [selectSubtotalPrice, selectTotalPrice],
  (subtotal, total) => subtotal - total
);

export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + item.quantity, 0)
);

export const {
  addItemToCart,
  addGroupOrderItem,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  setGroupOrder,
  clearGroupOrder,
} = cart.actions;

export default cart.reducer;
