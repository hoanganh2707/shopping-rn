import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { ROLES, SCREENS } from '~/constants';
import { selectRole } from '~/redux';
import { useTheme } from '~/config/ThemeContext';
import {
  AdminPanel,
  Cart,
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
  ChangeLanguage,
  Chart,
  Chatbot,
  Checkout,
  CommentList,
  CommentReply,
  Login,
  MyCommentList,
  OrderEdit,
  OrderList,
  OrderManagement,
  PaymentFailed,
  PaymentMethodSelection,
  PaymentPending,
  PaymentSuccess,
  VNPayWebView,
  ProductCreate,
  ProductDetail,
  ProductEdit,
  ProductList,
  ProductsByCategory,
  RatingList,
  Search,
  SignUp,
  UserComment,
  UserInfo,
  UserList,
  UserRating,
  Wishlist,
  AddressBook,
  RewardPoints,
  OrderTracking,
  BannerList,
} from '~/screens';

import { MyTabs } from './MyTabs';
import { navigationRef } from './navigationService';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const role = useSelector(selectRole);
  const { colors, isDark } = useTheme();

  const navTheme = {
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.primaryText || colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  const adminStackScreens = [
    <>
      <Stack.Screen name={SCREENS.ADMIN_PANEL} component={AdminPanel} />
      <Stack.Screen name={SCREENS.USER_LIST} component={UserList} />
      <Stack.Screen name={SCREENS.CATEGORY_CREATE} component={CategoryCreate} />
      <Stack.Screen name={SCREENS.CATEGORY_EDIT} component={CategoryEdit} />
      <Stack.Screen name={SCREENS.CATEGORY_LIST} component={CategoryList} />
      <Stack.Screen name={SCREENS.CATEGORY_SHOW} component={CategoryShow} />
      <Stack.Screen name={SCREENS.PRODUCT_CREATE} component={ProductCreate} />
      <Stack.Screen name={SCREENS.PRODUCT_LIST} component={ProductList} />
      <Stack.Screen name={SCREENS.PRODUCT_EDIT} component={ProductEdit} />
      <Stack.Screen name={SCREENS.RATING_LIST} component={RatingList} />
      <Stack.Screen name={SCREENS.COMMENT_LIST} component={CommentList} />
      <Stack.Screen name={SCREENS.ORDER_LIST} component={OrderList} />
      <Stack.Screen name={SCREENS.CHART} component={Chart} />
      <Stack.Screen name={SCREENS.ORDER_EDIT} component={OrderEdit} />
      <Stack.Screen name={SCREENS.COMMENT_REPLY} component={CommentReply} />
      <Stack.Screen name="BannerList" component={BannerList} />
    </>,
  ];

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {role !== ROLES.ADMIN && (
          <Stack.Group>
            <Stack.Screen name='MyTabs' component={MyTabs} />
            <Stack.Screen
              name={SCREENS.PRODUCTS_BY_CATEGORY}
              component={ProductsByCategory}
            />
            <Stack.Screen name={SCREENS.USER_INFO} component={UserInfo} />
            <Stack.Screen
              name={SCREENS.ORDER_MANAGEMENT}
              component={OrderManagement}
            />
            <Stack.Screen name={SCREENS.USER_COMMENT} component={UserComment} />
            <Stack.Screen name={SCREENS.USER_RATING} component={UserRating} />
            <Stack.Screen
              name={SCREENS.PRODUCT_DETAIL}
              component={ProductDetail}
            />
            <Stack.Screen
              initialParams={{ isShowBack: true }}
              name={SCREENS.CART}
              component={Cart}
            />
            <Stack.Screen name={SCREENS.SEARCH} component={Search} />
            <Stack.Screen
              name={SCREENS.CHANGE_LANGUAGE}
              component={ChangeLanguage}
            />
            <Stack.Screen
              name={SCREENS.MY_COMMENT_LIST}
              component={MyCommentList}
            />
            <Stack.Screen
              name={SCREENS.CHECKOUT}
              component={Checkout}
            />
            <Stack.Screen
              name={SCREENS.PAYMENT_METHOD_SELECTION}
              component={PaymentMethodSelection}
            />
            <Stack.Screen
              name={SCREENS.VNPAY_WEBVIEW}
              component={VNPayWebView}
            />
            <Stack.Screen
              name={SCREENS.PAYMENT_PENDING}
              component={PaymentPending}
            />
            <Stack.Screen
              name={SCREENS.PAYMENT_SUCCESS}
              component={PaymentSuccess}
            />
            <Stack.Screen
              name={SCREENS.PAYMENT_FAILED}
              component={PaymentFailed}
            />
            <Stack.Screen
              name={SCREENS.CHATBOT}
              component={Chatbot}
            />
            <Stack.Screen
              name={SCREENS.WISHLIST}
              component={Wishlist}
            />
            <Stack.Screen
              name={SCREENS.ADDRESS_BOOK}
              component={AddressBook}
            />
            <Stack.Screen
              name={SCREENS.REWARD_POINTS}
              component={RewardPoints}
            />
            <Stack.Screen
              name={SCREENS.ORDER_TRACKING}
              component={OrderTracking}
            />
          </Stack.Group>
        )}
        {role === ROLES.ADMIN && adminStackScreens}
        {role === ROLES.GUEST && (
          <Stack.Group>
            <Stack.Screen
              options={{
                presentation: 'modal',
              }}
              name={SCREENS.LOGIN}
              component={Login}
            />
            <Stack.Screen
              options={{
                presentation: 'modal',
              }}
              name={SCREENS.SIGN_UP}
              component={SignUp}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
