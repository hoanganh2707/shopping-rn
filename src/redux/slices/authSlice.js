import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

import { ROLES } from '~/constants';

const initialState = {
  user: undefined,
};

const appSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Thêm thông tin người dùng
    addUser: (state, action) => {
      state.user = action.payload;
    },

    // Xoá thông tin người dùng
    removeUser: (state, action) => {
      state.user = undefined;
    },

    // Cập nhật thông tin người dùng khi call lại api liên quan tới người dùng
    updateUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

// reducer
export const authReducer = appSlice.reducer;
// actions
export const authActions = appSlice.actions;

// selectors
export const selectUser = (state) => state.auth?.user;

// Lấy vai trò của user
export const selectRole = createSelector([selectUser], (user) => {
  if (!user) {
    return ROLES.GUEST;
  } else if (user.isAdmin === true) return ROLES.ADMIN;
  return ROLES.USER;
});
