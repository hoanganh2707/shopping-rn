import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Divider, IconButton, Text } from '~/components';
import { colors } from '~/styles';
import { moneyFormat } from '~/utils';

const IMAGE_SIZE = 70;

export const OrderItem = (props) => {
  const { t } = useTranslation();
  const { data, onEdit } = props;

  console.log(data);

  const items = data.items;

  const getNumItems = () => {
    return items?.reduce(
      (accumulator, currentValue) => accumulator + currentValue.quantity,
      0,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <Image
            source={{ uri: data?.items[0]?.product?.image }}
            style={styles.image}
          />
          <View style={{ flex: 1 }}>
            {items.map((item) => (
              <View style={styles.productItem}>
                <Text numberOfLines={1} style={{ flex: 1 }}>
                  {item?.product?.name}:&nbsp;
                </Text>
                <View style={styles.quantityRow}>
                  <Text style={{ flex: 1 }}>{`(x${item?.quantity})`}</Text>
                  <Text>&nbsp;{moneyFormat(item?.price)}</Text>
                </View>
                <Divider />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.row}>
          <Text style={{ flex: 1 }}>{t('fullname')}:&nbsp;</Text>
          <Text>{data?.address?.fullname}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ flex: 1 }}>{t('phoneNumber')}:&nbsp;</Text>
          <Text>{data?.address?.phoneNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ flex: 1 }}>{t('address')}:&nbsp;</Text>
          <Text>{data?.address?.address}</Text>
        </View>
        <Divider />
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
      <IconButton onPress={onEdit} name='update' />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
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
    marginTop: 4,
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginVertical: 2,
  },
});

OrderItem.propTypes = {
  data: PropTypes.object,
  onEdit: PropTypes.func,
};
