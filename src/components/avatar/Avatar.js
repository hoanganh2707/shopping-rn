import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { colors } from '~/styles';
import { Icon } from '../icon';
import { Pressable } from '../pressable';

export const Avatar = (props) => {
  const {
    size = 'medium',
    source,
    style,
    onPress,
    icon,
    ...imageProps
  } = props;

  const avatarSizes = {
    small: 34,
    medium: 50,
    large: 75,
    xLarge: 100,
  };

  return (
    <Pressable onPress={onPress} style={style}>
      <Image
        {...imageProps}
        source={source}
        style={[
          styles.image,
          {
            width: avatarSizes[size],
            height: avatarSizes[size],
            borderRadius: avatarSizes[size] / 2,
          },
        ]}
      />
      {icon && (
        <Icon
          name={icon}
          size={'xSmall'}
          color={colors.light}
          style={styles.iconContainer}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.placeholderImage,
  },
  iconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 4,
  },
});

Avatar.propTypes = {
  size: PropTypes.oneOf(['small' | 'medium' | 'large' | 'xLarge']),
  source: PropTypes.any,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onPress: PropTypes.func,
  icon: PropTypes.string,
};
