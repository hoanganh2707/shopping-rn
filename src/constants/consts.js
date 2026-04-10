import { Dimensions, Platform } from 'react-native';
import Constants from 'expo-constants';

// Hằng số vai trò
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  GUEST: 'GUEST',
};

// Hằng số trạng thái đơn hàng
export const ORDER_STATUSES = {
  PENDING: 'pending',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('screen');

export const STATUS_BAR_HEIGHT = Constants.statusBarHeight;
export const HEADER_HEIGHT = 50;

// Nền tảng
export const IS_ANDROID = Platform.OS === 'android';
export const IS_IOS = Platform.OS === 'ios';

export const MIN_PASSWORD_LENGTH = 6;
export const SAVE_CARD_HEIGHT = 35;
