import { createSlice } from "@reduxjs/toolkit";
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
    discountedPrice: 0, // <-- Add this line
    quantity_available: 0,
    unit: "",
    is_available: false,
    created_at: "",
    modified_at: "",
    product_images: [],
  },
};

export const productDetails = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    updateproductDetails: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },
  },
});

export const { updateproductDetails } = productDetails.actions;
export default productDetails.reducer;
