import React, { useEffect } from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, View } from 'react-native';
import { Divider, FixedBottom, Header, LoadingIndicator } from '~/components';
import { ORDER_STATUSES, SCREENS } from '~/constants';
import { useGetListOrderRealtime } from '~/hooks';
import { selectUser } from '~/redux';
import { OrderItem } from './components';

const Tab = createMaterialTopTabNavigator();

export const OrderList = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useSelector(selectUser);

  const data = useGetListOrderRealtime();

  useEffect(() => {}, []);

  const getData = (status) => {
    return data?.filter((item) => item.status === status);
  };

  const handleEdit = (item) => {
    navigation.navigate(SCREENS.ORDER_EDIT, {
      data: item,
    });
  };

  const RenderScreen = ({ status }) => {
    return (
      <>
        <FlatList
          data={getData(status)}
          renderItem={({ item }) => (
            <OrderItem
              onEdit={() => {
                handleEdit(item);
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
      <Header title={t('screenNames.orderList')} />
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
