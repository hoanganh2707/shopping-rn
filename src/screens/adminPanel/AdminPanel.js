import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { Header } from '~/components';
import { SCREENS } from '~/constants';
import { authActions } from '~/redux';
import { colors } from '~/styles';
import { Card } from './components';
import { authApi } from '~/apis';

const ITEM_GAP = 12;

export const AdminPanel = () => {
  const { t } = useTranslation([]);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const data = [
    {
      icon: 'account',
      label: t('adminPanelScreen.users'),
      onPress: () => {
        navigation.navigate(SCREENS.USER_LIST);
      },
    },
    {
      icon: 'category',
      label: t('adminPanelScreen.categories'),
      onPress: () => {
        navigation.navigate(SCREENS.CATEGORY_LIST);
      },
    },
    {
      icon: 'home',
      label: t('adminPanelScreen.products'),
      onPress: () => {
        navigation.navigate(SCREENS.PRODUCT_LIST);
      },
    },
    {
      icon: 'cart',
      label: t('adminPanelScreen.orders'),
      onPress: () => {
        navigation.navigate(SCREENS.ORDER_LIST);
      },
    },
    {
      icon: 'rating',
      label: t('adminPanelScreen.ratings'),
      onPress: () => {
        navigation.navigate(SCREENS.RATING_LIST);
      },
    },
    {
      icon: 'comment',
      label: t('adminPanelScreen.comments'),
      onPress: () => {
        navigation.navigate(SCREENS.COMMENT_LIST);
      },
    },
    {
      icon: 'chart',
      label: t('adminPanelScreen.chart'),
      onPress: () => {
        navigation.navigate(SCREENS.CHART);
      },
    },
    {
      icon: 'logout',
      label: t('adminPanelScreen.logout'),
      onPress: () => handleLogout(),
    },
  ];

  const handleLogout = () => {
    Alert.alert(t(''), t('logout'), [
      {
        text: t('cancel'),
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: t('ok'),
        onPress: () => {
          authApi.logout();
          dispatch(authActions.removeUser());
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <>
      <Header title={t('adminPanelScreen.admin')} isBackVisible={false} />
      <View style={styles.container}>
        <FlatList
          scrollEnabled={false}
          data={data}
          numColumns={2}
          columnWrapperStyle={{
            gap: ITEM_GAP,
          }}
          contentContainerStyle={{
            gap: ITEM_GAP,
          }}
          renderItem={({ item, index }) => <Card {...item} />}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    flex: 1,
  },
});
