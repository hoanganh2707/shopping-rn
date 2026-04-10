import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button, Divider, Text } from '~/components';
import { ORDER_STATUSES } from '~/constants';
import { colors } from '~/styles';
import { moneyFormat } from '~/utils';

const IMAGE_SIZE = 70;

export const OrderItem = (props) => {
  const { t } = useTranslation();
  const { data, onComment, onRating } = props;

  const items = data.items;

  const getNumItems = () => {
    return items?.reduce(
      (accumulator, currentValue) => accumulator + currentValue.quantity,
      0,
    );
  };

  return (
    <View style={styles.container}>
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
                <Text style={{ flex: 1 }}>{`(x${item.quantity})`}</Text>
                <Text>&nbsp;{moneyFormat(item?.price)}</Text>
              </View>
              <Divider />
            </View>
          ))}
        </View>
      </View>
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
      {data?.status === ORDER_STATUSES.COMPLETED && (
        <View style={styles.buttons}>
          <Button
            onPress={onComment}
            size='small'
            variant='outline'
            title={t('comment')}
          />
          <Button
            onPress={onRating}
            size='small'
            variant='outline'
            title={t('rating')}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 12,
  },
});

OrderItem.propTypes = {
  data: PropTypes.object,
  onComment: PropTypes.func,
  onRating: PropTypes.func,
};
