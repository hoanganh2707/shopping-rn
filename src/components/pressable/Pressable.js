import React from 'react';
import { Pressable as RNPressable } from 'react-native';

export const Pressable = (props) => {
  const { onPress, disabled, children, ...rest } = props;

  return (
    <RNPressable {...rest} onPress={onPress} disabled={disabled}>
      {children}
    </RNPressable>
  );
};
