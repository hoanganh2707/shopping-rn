import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon, Text } from '~/components';
import { colors } from '~/styles';

export const Card = (props) => {
  const { icon, label, onPress } = props;

  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Icon name={icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: {
    marginTop: 8,
  },
});

Card.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  onPress: PropTypes.func,
};
