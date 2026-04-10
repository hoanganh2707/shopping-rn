import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '~/styles';

export const Divider = (props) => {
  const { style } = props;
  return <View style={[styles.divider, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
});

Divider.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
