import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import { appReducer, authReducer, cartReducer } from './slices';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1,
  blacklist: ['app'],
};

const appPersistConfig = {
  key: 'app',
  storage: AsyncStorage,
  blacklist: ['isLoading'],
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  app: persistReducer(appPersistConfig, appReducer),
  auth: persistReducer(authPersistConfig, authReducer),
  cart: cartReducer,
});

export const persistedReducer = persistReducer(persistConfig, rootReducer);
