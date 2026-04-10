import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { SCREENS } from '~/constants';
import { selectBadge } from '~/redux';
import { colors } from '~/styles';
import { IconButton } from '../icon';
import { Text } from '../text';

const BADGE = 16;

export const CartBadge = () => {
  const navigation = useNavigation();
  const num = useSelector(selectBadge);

  const navigateToCart = () => {
    navigation.navigate(SCREENS.CART);
  };

  return (
    <View>
      <IconButton onPress={navigateToCart} name={'cart'} />
      {num && (
        <View style={styles.badge}>
          <Text style={styles.text}>{num}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    backgroundColor: colors.notification,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    right: -BADGE / 4,
    top: -BADGE / 4,
  },
  text: {
    color: colors.light,
  },
});
