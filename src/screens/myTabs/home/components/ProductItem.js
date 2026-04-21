import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Pressable, Text, Icon } from '~/components';
import { useTheme } from '~/config/ThemeContext';
import { getPercentPriceReduction, moneyFormat } from '~/utils';

export const ProductItem = (props) => {
  const { t } = useTranslation();
  const { data, onDetail, onAddToCart } = props;
  const { colors, isDark } = useTheme();

  const isOutOfStock = data?.outOfStock === true;

  return (
    <Pressable onPress={onDetail} style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: data?.image }} 
          style={[styles.image, isOutOfStock && styles.imageOutOfStock, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]} 
        />
        {isOutOfStock && (
          <View style={[styles.outOfStockBadge, { backgroundColor: colors.error + 'DD' }]}>
            <Text style={styles.outOfStockText}>Hết</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <View>
          <Text style={[styles.name, { color: colors.primaryText || colors.text }]} numberOfLines={2}>
            {data?.name}
          </Text>
          {data?.priceOld && data?.price < data?.priceOld && (
            <Text style={styles.oldPrice}>
              <Text style={{textDecorationLine: 'line-through'}}>{moneyFormat(data?.priceOld)}</Text>
              <Text style={[styles.percent, { color: colors.error }]}>
                {'  -' + getPercentPriceReduction(data?.price, data?.priceOld)}
              </Text>
            </Text>
          )}
        </View>
        
        <View style={styles.bottomRow}>
          <Text style={[styles.price, { color: colors.primary }]}>
             {data?.price && moneyFormat(data?.price)}
          </Text>

          <Pressable 
            disabled={isOutOfStock} 
            onPress={onAddToCart} 
            style={[
              styles.addButton, 
              isOutOfStock && styles.addButtonDisabled, 
              { backgroundColor: isOutOfStock ? colors.disabled || '#999' : colors.primary }
            ]}
          >
            <Icon name="plus" size={16} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  image: {
    width: 86,
    height: 86,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imageOutOfStock: {
    opacity: 0.5,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
  },
  oldPrice: {
    fontSize: 13,
    color: '#888',
  },
  percent: {
    fontWeight: '600',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  addButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  }
});

ProductItem.propTypes = {
  data: PropTypes.object,
  onDetail: PropTypes.func,
  onAddToCart: PropTypes.func,
};
