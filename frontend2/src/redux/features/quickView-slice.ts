import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState: InitialState = {
  value: {
    id: "",
    producer_id: "",
    name: "",
    description: "",
    category: "",
    price: 0,
    discountedPrice: 0,
    quantity_available: 0,
    unit: "",
    is_available: false,
    created_at: "",
    modified_at: "",
    product_images: [],
  },
};

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (_, action: PayloadAction<Product>) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },

    resetQuickView: () => {
      return {
        value: initialState.value,
      };
    },
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;
