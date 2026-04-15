import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Array of product objects
};

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    addViewedProduct: (state, action) => {
      const product = action.payload;
      // Remove if it already exists
      const existingIndex = state.items.findIndex((item) => item.id === product.id);
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      }
      // Add to the beginning
      state.items.unshift(product);
      // Keep only the latest 20 items
      if (state.items.length > 20) {
        state.items.pop();
      }
    },
    clearRecentlyViewed: (state) => {
      state.items = [];
    },
  },
});

export const { addViewedProduct, clearRecentlyViewed } = recentlyViewedSlice.actions;

export const recentlyViewedReducer = recentlyViewedSlice.reducer;
