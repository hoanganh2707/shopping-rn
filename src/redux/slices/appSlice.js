import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  lang: 'en',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Thay đổi trạng thái `loading` của app
    changeLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Thay đổi ngôn ngữ của apps
    changeLanguage: (state, action) => {
      state.lang = action.payload;
    },
  },
});

// reducer
export const appReducer = appSlice.reducer;
// actions
export const appActions = appSlice.actions;

// selectors
export const selectIsLoading = (state) => state.app.isLoading;
export const selectLang = (state) => state.app.lang;
