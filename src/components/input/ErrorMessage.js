import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { colors } from '~/styles';
import { Text } from '../text';

export const ErrorMessage = (props) => {
  const { text, style } = props;
  return (
    <Text variant='bodySmall' style={[styles.error, style]}>
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  error: {
    color: colors.error,
    marginTop: 4,
  },
});

ErrorMessage.propTypes = {
  text: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
