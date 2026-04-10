import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button, Pressable, SaveCard, Text } from '~/components';
import { SAVE_CARD_HEIGHT, SCREEN_WIDTH } from '~/constants';
import { colors } from '~/styles';
import { getPercentPriceReduction, moneyFormat } from '~/utils';

const ITEM_WIDTH = SCREEN_WIDTH * 0.5;
const IMAGE_SIZE = ITEM_WIDTH;

export const ProductItem = (props) => {
  const { t } = useTranslation();
  const { data, onDetail, onAddToCart } = props;

  const saveMoney = () => {
    return data.priceOld - data.price;
  };

  const isOutOfStock = data?.outOfStock === true;

  // Debug log
  console.log('🏠 Home ProductItem:', {
    id: data?.id?.slice(-6),
    name: data?.name?.slice(0, 20),
    outOfStock: data?.outOfStock,
    isOutOfStock: isOutOfStock,
  });

  return (
    <Pressable onPress={onDetail} style={styles.container}>
      <View>
        <Image source={{ uri: data?.image }} style={[styles.image, isOutOfStock && styles.imageOutOfStock]} />
        {isOutOfStock ? (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>{t('outOfStock') || 'Hết hàng'}</Text>
          </View>
        ) : (
          <SaveCard style={styles.save} money={saveMoney()} />
        )}
        <Text numberOfLines={2} style={styles.name}>
          {data?.name}
        </Text>
      </View>
      <View>
        <Text style={styles.price}>
          {data?.price && moneyFormat(data?.price)}
        </Text>
        <Text>
          <Text style={styles.priceOld}>
            {data?.priceOld && moneyFormat(data?.priceOld)}
          </Text>
          <Text style={styles.percent}>
            {getPercentPriceReduction(data?.price, data?.priceOld)}
          </Text>
        </Text>
        <Button
          onPress={onAddToCart}
          block
          size='small'
          variant='outline'
          title={isOutOfStock ? (t('outOfStock') || 'Hết hàng') : t('aadToCart')}
          style={styles.button}
          disabled={isOutOfStock}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 4,
    justifyContent: 'space-between',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    alignSelf: 'center',
  },
  imageOutOfStock: {
    opacity: 0.5,
  },
  save: {
    position: 'absolute',
    top: -SAVE_CARD_HEIGHT,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    backgroundColor: colors.error + 'DD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  outOfStockText: {
    color: colors.light,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  name: {
    marginTop: 8,
    marginBottom: 24,
  },
  price: {
    color: colors.primary,
  },
  priceOld: {
    marginTop: 4,
    textDecorationLine: 'line-through',
    color: colors.tertiaryText,
  },
  button: { marginTop: 8 },
  percent: {
    color: colors.error,
  },
});

ProductItem.propTypes = {
  data: PropTypes.object,
  onDetail: PropTypes.func,
  onAddToCart: PropTypes.func,
};
