import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Header, Text } from '~/components';
import { ProductList } from '~/components/productList';
import { colors } from '~/styles';

export const Wishlist = () => {
  const { t } = useTranslation();
  const wishlistItems = useSelector((state) => state.wishlist.items || []);

  return (
    <>
      <Header
        isBackVisible={true}
        title={t('wishlist') || 'Danh sách yêu thích'}
      />
      <View style={styles.container}>
        {wishlistItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('emptyWishlist') || 'Bạn chưa có sản phẩm yêu thích nào.'}
            </Text>
          </View>
        ) : (
          <ProductList data={wishlistItems} />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.secondaryText,
    fontSize: 16,
  },
});
