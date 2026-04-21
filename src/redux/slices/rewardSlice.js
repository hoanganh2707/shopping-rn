import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  points: 0,
  history: [], // { id, type: 'earn'|'redeem', points, description, date }
};

const rewardSlice = createSlice({
  name: 'reward',
  initialState,
  reducers: {
    setPoints: (state, action) => {
      state.points = action.payload;
    },
    addPoints: (state, action) => {
      const { points, description } = action.payload;
      state.points += points;
      state.history.unshift({
        id: Date.now().toString(),
        type: 'earn',
        points,
        description: description || 'Tích điểm từ đơn hàng',
        date: new Date().toISOString(),
      });
    },
    redeemPoints: (state, action) => {
      const { points, description } = action.payload;
      if (state.points >= points) {
        state.points -= points;
        state.history.unshift({
          id: Date.now().toString(),
          type: 'redeem',
          points,
          description: description || 'Sử dụng điểm giảm giá',
          date: new Date().toISOString(),
        });
      }
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    clearRewards: (state) => {
      state.points = 0;
      state.history = [];
    },
  },
});

export const rewardActions = rewardSlice.actions;
export const { setPoints, addPoints, redeemPoints, setHistory, clearRewards } = rewardSlice.actions;

export const selectRewardPoints = (state) => state.reward?.points || 0;
export const selectRewardHistory = (state) => state.reward?.history || [];

export const rewardReducer = rewardSlice.reducer;
