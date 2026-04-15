import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import {
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { productApi } from '~/apis';
import {
  Button,
  CartBadge,
  FixedBottom,
  Header,
  IconButton,
  LoadingIndicator,
  Screen,
  Text,
} from '~/components';
import { SCREEN_WIDTH } from '~/constants';
import { colors } from '~/styles';
import {
  getPercentPriceReduction,
  moneyFormat,
  showMessageAddToCart,
} from '~/utils';
import { cartActions, addViewedProduct } from '~/redux';

const IMAGE_WIDTH = SCREEN_WIDTH * 0.5;

export const ProductDetail = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { params } = route;
  const id = params.data;

  const [data, setData] = useState();

  const navigateToHome = () => {
    navigation.dispatch(StackActions.popToTop());
  };

  const getData = async () => {
    const response = await productApi.getOne(id);
    if (response?.data) {
      setData(response.data);
      dispatch(addViewedProduct(response.data));
    }
  };

  const handleAddToCart = () => {
    // Kiểm tra sản phẩm hết hàng
    if (data?.outOfStock === true) {
      return; // Không làm gì nếu hết hàng
    }
    dispatch(cartActions.addToCart(data));
    showMessageAddToCart();
  };

  useEffect(() => {
    getData();
  }, []);

  const isOutOfStock = data?.outOfStock === true;

  // Debug log
  if (data) {
    console.log('📄 ProductDetail:', {
      id: data?.id?.slice(-6),
      name: data?.name?.slice(0, 20),
      outOfStock: data?.outOfStock,
      isOutOfStock: isOutOfStock,
    });
  }

  return (
    <>
      <Header
        rightComponent={
          <View style={styles.rightRow}>
            <CartBadge />
            <IconButton onPress={navigateToHome} name='goHome' />
          </View>
        }
      />
      <ScrollView style={styles.container}>
        {data && (
          <View style={styles.content}>
            <View>
              <Image 
                style={[styles.image, isOutOfStock && styles.imageOutOfStock]} 
                source={{ uri: data?.image }} 
              />
              {isOutOfStock && (
                <View style={styles.outOfStockBadge}>
                  <Text style={styles.outOfStockText}>{t('outOfStock') || 'Hết hàng'}</Text>
                </View>
              )}
            </View>
            {isOutOfStock && (
              <View style={styles.outOfStockNotice}>
                <Text style={styles.outOfStockNoticeText}>
                  ⚠️ Sản phẩm này hiện đang hết hàng
                </Text>
              </View>
            )}
            <Text variant='titleLarge' style={styles.price}>
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
            <Text variant='titleMedium'>{data?.name}</Text>
            <Text>{data?.description}</Text>
          </View>
        )}
        {!data && <LoadingIndicator />}
      </ScrollView>
      {data && (
        <>
          <Button
            onPress={handleAddToCart}
            block
            title={isOutOfStock ? (t('outOfStock') || 'Hết hàng') : t('productDetaiScreen.addProductToCart')}
            style={styles.fixedButton}
            disabled={isOutOfStock}
          />
          <FixedBottom />
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  rightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    alignSelf: 'center',
  },
  imageOutOfStock: {
    opacity: 0.5,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    backgroundColor: colors.error + 'DD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  outOfStockText: {
    color: colors.light,
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  outOfStockNotice: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  outOfStockNoticeText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    paddingTop: 8,
  },
  content: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  fixedButton: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
});
