import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, Pressable, Text } from '~/components';
import { colors } from '~/styles';

export const Checkbox = (props) => {
  const { label, value, onValueChange, style, disabled } = props;

  const handlePress = () => {
    if (!disabled) {
      onValueChange && onValueChange(!value);
    }
  };

  return (
    <Pressable onPress={handlePress} style={[styles.container, style]} disabled={disabled}>
      <View style={[styles.checkbox, value && styles.checkboxChecked, disabled && styles.checkboxDisabled]}>
        {value && <Icon name='checkmark' size={16} color={colors.light} />}
      </View>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  labelDisabled: {
    color: colors.tertiaryText,
  },
});

Checkbox.propTypes = {
  label: PropTypes.string,
  value: PropTypes.bool,
  onValueChange: PropTypes.func,
  style: PropTypes.object,
  disabled: PropTypes.bool,
};

Checkbox.defaultProps = {
  value: false,
  disabled: false,
};

