import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Divider, IconButton, InputSpinner, Text } from '~/components';
import { colors } from '~/styles';
import { moneyFormat } from '~/utils';

const IMAGE_SIZE = 70;

export const CartItem = (props) => {
  const { data, onDecrease, onIncrease, onRemove } = props;

  return (
    <>
      <Divider />
      <View style={[styles.container]}>
        <Image source={{ uri: data?.image }} style={styles.image} />
        <View style={styles.rightContent}>
          <View style={{ flexDirection: 'row' }}>
            <Text numberOfLines={2} style={styles.label}>
              {data?.name}
            </Text>
            <IconButton
              onPress={onRemove}
              style={styles.iconX}
              size='xSmall'
              name={'close'}
            />
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.price}>
                {data?.price && moneyFormat(data?.price)}
              </Text>
              <Text>
                <Text style={styles.priceOld}>
                  {data?.priceOld && moneyFormat(data?.priceOld)}
                </Text>
              </Text>
            </View>
            <InputSpinner
              value={data?.quantity?.toString()}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  rightContent: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    marginBottom: 12,
    flex: 1,
  },
  price: {},
  priceOld: {
    marginTop: 4,
    textDecorationLine: 'line-through',
    color: colors.tertiaryText,
  },
  iconX: {
    top: -5,
    width: 25,
    height: 25,
    right: -12,
  },
});

CartItem.propTypes = {
  data: PropTypes.object,
  onPress: PropTypes.func,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  onRemove: PropTypes.func,
};
