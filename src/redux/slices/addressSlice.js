import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  addresses: [],
  defaultAddressId: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    addAddress: (state, action) => {
      const newAddress = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      };
      state.addresses.push(newAddress);
      if (state.addresses.length === 1) {
        state.defaultAddressId = newAddress.id;
      }
    },
    editAddress: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.addresses.findIndex((a) => a.id === id);
      if (index >= 0) {
        state.addresses[index] = { ...state.addresses[index], ...updates };
      }
    },
    deleteAddress: (state, action) => {
      const id = action.payload;
      state.addresses = state.addresses.filter((a) => a.id !== id);
      if (state.defaultAddressId === id) {
        state.defaultAddressId = state.addresses.length > 0 ? state.addresses[0].id : null;
      }
    },
    setDefaultAddress: (state, action) => {
      state.defaultAddressId = action.payload;
    },
    clearAddresses: (state) => {
      state.addresses = [];
      state.defaultAddressId = null;
    },
  },
});

export const addressActions = addressSlice.actions;
export const { addAddress, editAddress, deleteAddress, setDefaultAddress, clearAddresses } = addressSlice.actions;

export const selectAddresses = (state) => state.address?.addresses || [];
export const selectDefaultAddressId = (state) => state.address?.defaultAddressId;
export const selectDefaultAddress = (state) => {
  const addresses = state.address?.addresses || [];
  const defaultId = state.address?.defaultAddressId;
  return addresses.find((a) => a.id === defaultId) || null;
};

export const addressReducer = addressSlice.reducer;
