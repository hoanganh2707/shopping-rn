import React, { forwardRef, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, typography } from '~/styles';
import { ErrorMessage } from './ErrorMessage';
import { Label } from './Label';

export const TextArea = forwardRef((props, ref) => {
  const {
    inputStyle,
    minRows = 3,
    maxRows,
    style,
    errorMessage,
    hasError,
    required = true,
    label,
    onBlur,
    onFocus,
    ...rest
  } = props;

  const [hasFocus, setHasFocus] = useState(false);

  const getInputStyle = useMemo(() => {
    return StyleSheet.flatten([styles.input, inputStyle]);
  }, []);

  const lineHeights = getInputStyle['lineHeight'];

  const paddingVertical = 12;

  const minHeight = useMemo(
    () => lineHeights * minRows + paddingVertical,
    [lineHeights],
  );

  const maxHeight = useMemo(
    () => (!!maxRows ? lineHeights * maxRows : undefined),
    [lineHeights],
  );

  const handleFocus = (event) => {
    setHasFocus(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setHasFocus(false);
    onBlur?.(event);
  };

  return (
    <View style={style}>
      {label && <Label text={label} required={required} />}
      <View
        style={[
          styles.container,
          {
            minHeight,
            maxHeight,
          },
          hasFocus && {
            borderColor: colors.primary,
          },
          hasError && {
            borderColor: colors.error,
          },
        ]}>
        <TextInput
          {...rest}
          ref={ref}
          multiline
          style={[
            {
              minHeight,
              maxHeight,
              paddingVertical,
              paddingHorizontal: 12,
            },
            getInputStyle,
          ]}
          numberOfLines={minRows}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.placeholderText}
        />
      </View>
      {errorMessage && <ErrorMessage msg={errorMessage} />}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.border,
    marginTop: 4,
  },
  input: {
    textAlignVertical: 'top',
    ...typography.bodyMedium,
  },
});
