import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { colors } from '~/styles';
import { getIconType } from './getIconType';
import { icons } from './iconSource';

export const Icon = (props) => {
  const { name, size = 'medium', color = colors.secondaryText, style } = props;

  const iconType = icons[name]?.type;
  const iconName = icons[name]?.name;

  const IconComponent = getIconType(iconType);

  const sizes = {
    xSmall: 18,
    small: 20,
    medium: 24,
    large: 32,
  };

  if (!iconName) return null;

  const getSize = () => {
    if (typeof size === 'number') return size;
    else return sizes[size];
  };

  return (
    <View style={style}>
      <IconComponent name={iconName} size={getSize()} color={color} />
    </View>
  );
};

Icon.propTypes = {
  name: PropTypes.string,
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large']),
    PropTypes.number,
  ]),
  color: PropTypes.string,
};
