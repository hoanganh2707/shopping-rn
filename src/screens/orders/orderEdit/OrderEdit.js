import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { orderApi } from '~/apis';
import {
  Button,
  Divider,
  DropDownPicker,
  Header,
  KeyboardAvoidingScrollView,
  Text,
} from '~/components';
import { ORDER_STATUSES } from '~/constants';
import { useLoading } from '~/hooks';
import { colors } from '~/styles';
import { moneyFormat, showMessage } from '~/utils';
import { ProductItem } from './components';

export const OrderEdit = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const { showLoading, hideLoading } = useLoading();

  const { params } = route;
  const data = params.data;
  const { items } = data;

  const [status, setStatus] = useState(data.status);

  const getNumItems = () => {
    return items?.reduce(
      (accumulator, currentValue) => accumulator + currentValue.quantity,
      0,
    );
  };

  const handleEdit = async () => {
    showLoading();
    const response = await orderApi.updateStatus(data.id, status);
    hideLoading();
    showMessage(response?.message);
  };

  const orderStatuses = [
    {
      value: ORDER_STATUSES.PENDING,
      label: t('pending'),
    },
    {
      value: ORDER_STATUSES.DELIVERING,
      label: t('delivering'),
    },
    {
      value: ORDER_STATUSES.COMPLETED,
      label: t('completed'),
    },
    {
      value: ORDER_STATUSES.CANCELED,
      label: t('canceled'),
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <Header title={t('screenNames.orderEdit')} />
      <KeyboardAvoidingScrollView
        contentContainerStyle={styles.container}
        stickyFooter={
          <Button onPress={handleEdit} block title={t('continue')} />
        }>
        <DropDownPicker
          defaultValue={t(data?.status)}
          label={t('status')}
          data={orderStatuses}
          schema={{
            value: 'value',
            label: 'label',
          }}
          value={status}
          onChangeValue={(value) => {
            setStatus(value);
          }}
          style={styles.status}
        />
        <FlatList
          scrollEnabled={false}
          data={items}
          renderItem={({ item }) => <ProductItem data={item} />}
          ItemSeparatorComponent={() => <Divider />}
        />
        <Divider />
        <View style={styles.contentContainer}>
          <View style={styles.totalRow}>
            <Text>
              {getNumItems()}&nbsp;
              {getNumItems() > 1 ? t('products') : t('product')}
            </Text>
            <Text>
              <Text>{t('totalMoney')}:&nbsp;</Text>
              <Text style={styles.totalMoney}>
                {moneyFormat(data?.totalAmount)}
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingTop: 20,
  },
  totalMoney: {
    color: colors.primary,
  },
  productItem: {
    justifyContent: 'space-between',
    gap: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  contentContainer: {
    marginHorizontal: 16,
  },
  status: {
    marginHorizontal: 16,
  },
});
