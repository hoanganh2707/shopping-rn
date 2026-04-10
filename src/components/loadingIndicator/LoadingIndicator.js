import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { colors } from '~/styles';

export const LoadingIndicator = (props) => {
  const { color = colors.primary, size } = props;

  return <ActivityIndicator color={color} size={size} />;
};

LoadingIndicator.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'large']),
};
