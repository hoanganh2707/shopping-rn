import React from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { FlatList, StyleSheet, View } from 'react-native';
import { FixedBottom, Header, LoadingIndicator } from '~/components';
import { ORDER_STATUSES, SCREENS } from '~/constants';
import { useGetListOrderByUserIdRealtime } from '~/hooks';
import { OrderItem } from './components';

const Tab = createMaterialTopTabNavigator();

export const OrderManagement = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const data = useGetListOrderByUserIdRealtime();

  const getData = (status) => {
    return data?.filter((item) => item?.status === status);
  };

  const handleRating = (id) => {
    navigation.navigate(SCREENS.USER_RATING, {
      id,
    });
  };

  const handleComment = (id) => {
    navigation.navigate(SCREENS.USER_COMMENT, {
      id,
    });
  };

  const RenderScreen = ({ status }) => {
    return (
      <>
        <FlatList
          data={getData(status)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OrderItem
              onComment={() => {
                handleComment(item.id);
              }}
              onRating={() => {
                handleRating(item.id);
              }}
              data={item}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          contentContainerStyle={styles.list}
          ListFooterComponent={() => <FixedBottom />}
          ListEmptyComponent={!getData(status) && <LoadingIndicator />}
        />
      </>
    );
  };

  return (
    <>
      <Header title={t('screenNames.orderManagement')} />
      <Tab.Navigator
        backBehavior='none'
        screenOptions={{
          tabBarLabelStyle: {
            textTransform: 'none',
          },
        }}>
        <Tab.Screen name={t('pending')}>
          {(props) => <RenderScreen status={ORDER_STATUSES.PENDING} />}
        </Tab.Screen>
        <Tab.Screen name={t('delivering')}>
          {(props) => <RenderScreen status={ORDER_STATUSES.DELIVERING} />}
        </Tab.Screen>
        <Tab.Screen name={t('completed')}>
          {(props) => <RenderScreen status={ORDER_STATUSES.COMPLETED} />}
        </Tab.Screen>
        <Tab.Screen name={t('canceled')}>
          {(props) => <RenderScreen status={ORDER_STATUSES.CANCELED} />}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    marginBottom: 8,
  },
  list: {
    paddingTop: 8,
  },
});
