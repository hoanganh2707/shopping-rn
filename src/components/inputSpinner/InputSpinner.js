import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors } from '~/styles';
import { IconButton } from '../icon';

const HEIGHT = 30;

export const InputSpinner = (props) => {
  const { value, defaultValue, onDecrease, onIncrease } = props;

  return (
    <View style={styles.container}>
      <IconButton
        disabled={value === '1'}
        onPress={onDecrease}
        size='xSmall'
        name='minus'
        style={styles.icon}
        color={value === '1' ? colors.border : undefined}
      />
      <TextInput
        value={value}
        defaultValue={defaultValue}
        editable={false}
        style={styles.value}></TextInput>
      <IconButton
        onPress={onIncrease}
        size='xSmall'
        name='plus'
        style={styles.icon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
    alignItems: 'center',
    height: HEIGHT,
    borderRadius: 4,
  },
  value: {
    height: HEIGHT,
    minWidth: HEIGHT * 1.2,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  icon: {
    marginHorizontal: 2,
  },
});

InputSpinner.propTypes = {
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
};
