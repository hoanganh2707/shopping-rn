import PropTypes from 'prop-types';
import React from 'react';
import { Text as RNText } from 'react-native';

import { colors, typography } from '~/styles';
export const Text = (props) => {
  const {
    variant = 'bodyMedium',
    color,
    weight,
    style,
    children,
    ...rest
  } = props;

  const textStyle = {
    ...typography[variant],
    color,
  };

  return (
    <RNText {...rest} style={[textStyle, { color }, style]}>
      {children ?? ''}
    </RNText>
  );
};

Text.propTypes = {
  variant: PropTypes.oneOf([
    'displayLarge',
    'displayMedium',
    'displaySmall',
    'headlineLarge',
    'headlineMedium',
    'headlineSmall',
    'titleLarge',
    'titleMedium',
    'titleSmall',
    'bodyLarge',
    'bodyMedium',
    'bodySmall',
    'labelLarge',
    'labelMedium',
    'labelSmall',
  ]),
  color: PropTypes.string,
  weight: PropTypes.oneOf(['bold', 'medium', 'regular']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.array,
    PropTypes.any,
  ]),
};
