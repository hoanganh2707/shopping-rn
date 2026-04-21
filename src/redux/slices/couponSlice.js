import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appliedCoupon: null, // { code, discountType, discountValue, minOrderAmount, maxDiscount }
  availableCoupons: [],
};

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
    },
    setAvailableCoupons: (state, action) => {
      state.availableCoupons = action.payload;
    },
  },
});

export const couponActions = couponSlice.actions;
export const { applyCoupon, removeCoupon, setAvailableCoupons } = couponSlice.actions;

export const selectAppliedCoupon = (state) => state.coupon?.appliedCoupon;
export const selectAvailableCoupons = (state) => state.coupon?.availableCoupons || [];

export const couponReducer = couponSlice.reducer;
