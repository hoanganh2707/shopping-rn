import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const initialState = {
  items: [],
  badge: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Dùng dể thay thế tất cả dữ liệu hiện có trong giỏ hàng
     */
    replaceAll: (state, action) => {
      state.items = action.payload || [];
      state.badge = action.payload?.length || 0;
    },

    /**
     * Xoá giỏ hàng hiện tại
     */
    removeAll: (state) => {
      state.items = [];
      state.badge = 0;
    },

    /**
     * Xoá 1 mục sản phẩm
     */
    removeItem: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.id !== productId);
      --state.badge;
    },

    /**
     * Tăng số lượng của 1 mục sản phẩm lên 1
     */
    increase: (state, action) => {
      const productId = action.payload;
      const item = state.items.find((item) => item.id === productId);
      ++item.quantity;
    },

    /**
     * Giảm số lượng của 1 mục sản phẩm đi 1
     */
    decrease: (state, action) => {
      const productId = action.payload;
      const item = state.items.find((item) => item.id === productId);
      --item.quantity;
    },

    /**
     * Thêm sản phẩm vô giỏ hàng
     * Nếu sản phẩm chưa có thì thêm mục mới vô cuối mảng, nếu sản phẩm đã được thêm trước đó
     * thì tăng số lượng lên 1
     */
    addToCart: (state, action) => {
      const product = action.payload;

      // find item found
      const isItemExist = state.items.find((item) => item.id === product.id);

      // if not found
      if (!isItemExist) {
        state.items = [
          ...state.items,
          {
            ...product,
            quantity: 1,
          },
        ];
        ++state.badge;
      }
      // found
      else {
        state.items = state.items.map((item) => {
          if (item.id === product.id) {
            return {
              ...item,
              quantity: item.quantity + 1,
            };
          } else {
            return item;
          }
        });
      }
    },
  },
});

// reducer
export const cartReducer = cartSlice.reducer;
// actions
export const cartActions = cartSlice.actions;

// selectors
const badge = (state) => state.cart.badge;
export const selectBadge = createSelector([badge], (state) => {
  if (state === 0) return null;
  return state;
});

export const selectCart = (state) => state.cart.items;

// Tính tổng số tiền
export const selectCartTotalAmount = createSelector([selectCart], (state) => {
  return state.reduce(
    (accumulator, currentValue) =>
      accumulator + currentValue.price * currentValue.quantity,
    0,
  );
});
