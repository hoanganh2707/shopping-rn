import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors } from '~/styles';
import { Text } from '../text';

export const Button = (props) => {
  const {
    variant = 'solid',
    size = 'medium',
    disabled,
    block = false,
    title,
    onPress,
    color = 'primary',
    style,
  } = props;

  const getBackground = () => {
    if (!disabled) {
      if (color === 'primary') {
        if (variant === 'solid') return colors.primary;
        return null;
      }
      if (color === 'light') {
        return colors.light;
      }
    }
  };

  const paddings = {
    small: 8,
    medium: 12,
    large: 16,
  };

  const textVariants = {
    small: 'labelLarge',
    medium: 'labelLarge',
    large: 'labelLarge',
  };

  const getTextColor = () => {
    if (!disabled) {
      if (color === 'primary') {
        if (variant === 'solid') return colors.light;
        else return colors.primary;
      } else return colors.primary;
    }
    return null;
  };

  if (!title) return null;

  return (
    <View style={[styles.row]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.container,
          {
            backgroundColor: getBackground(),
            padding: paddings[size],
          },
          block && {
            flex: 1,
          },
          variant === 'outline' && styles.borderStyle,
          style,
        ]}>
        <Text
          variant={textVariants[size]}
          style={{
            color: getTextColor(),
          }}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
  },
  borderStyle: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
});

Button.propTypes = {
  color: PropTypes.oneOf(['primary', 'light']),
  variant: PropTypes.oneOf(['solid', 'outline', 'clear']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  onPress: PropTypes.func,
  title: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
