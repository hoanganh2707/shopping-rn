import PropTypes from 'prop-types';
import React, { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { colors } from '~/styles';
import { IconButton } from '../icon';
import { Pressable } from '../pressable';
import { ErrorMessage } from './ErrorMessage';
import { Label } from './Label';

export const Input = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const {
    disabled,
    label,
    labelStyle,
    required,
    errorMessage,
    allowClear = !disabled ?? true,
    hasError,
    secureTextEntry,
    onFocus,
    onBlur,
    value,
    onChangeText,
    style,
    rightComponent,
    onPress,

    placeholder = t('pleaseInput'),
    ...inputProps
  } = props;

  const [hidePass, setHidePass] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  const handleShowHide = () => {
    setHidePass(!hidePass);
  };

  const handleClearText = () => {
    onChangeText?.('');
  };

  const handleFocus = (event) => {
    setHasFocus(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setHasFocus(false);
    onBlur?.(event);
  };

  const inputHeight = 40;

  const inputPaddingHorizontal = 12;

  const rightIconStyle = {
    gap: inputPaddingHorizontal,
    paddingRight: inputPaddingHorizontal,
  };

  const renderInputUi = () => {
    return (
      <View
        style={[
          styles.inputContainer,
          {
            height: inputHeight,
          },
          hasFocus && {
            borderColor: colors.primary,
          },
          hasError && {
            borderColor: colors.error,
          },
          disabled && styles.disabledBackground,
        ]}>
        <TextInput
          editable={!disabled}
          pointerEvents={onPress && 'none'}
          value={value}
          onChangeText={onChangeText}
          cursorColor={colors.cursor}
          placeholderTextColor={colors.placeholderText}
          autoCapitalize='none'
          autoComplete='off'
          textContentType='oneTimeCode' // disabled autofill
          importantForAutofill='no'
          secureTextEntry={secureTextEntry && !hidePass}
          placeholder={placeholder}
          {...inputProps}
          multiline={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={ref}
          style={[
            styles.input,
            {
              height: inputHeight,
              paddingHorizontal: inputPaddingHorizontal,
            },
          ]}
        />
        <View style={[styles.iconContainer, rightIconStyle]}>
          {value && allowClear && (
            <IconButton
              name='close-circle'
              size='small'
              onPress={handleClearText}
            />
          )}
          {secureTextEntry && (
            <IconButton
              name={hidePass ? 'eye-off' : 'eye'}
              size='small'
              onPress={handleShowHide}
            />
          )}
          {rightComponent}
        </View>
      </View>
    );
  };

  const renderInput = () => {
    if (onPress) {
      return <Pressable onPress={onPress}>{renderInputUi()}</Pressable>;
    }
    return renderInputUi();
  };

  return (
    <View style={style}>
      <Label text={label} style={labelStyle} required={required} />
      {renderInput()}
      {errorMessage && <ErrorMessage text={errorMessage} />}
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBackground: {
    backgroundColor: colors.disabledInputBackground,
  },
  input: {
    flex: 1,
    lineHeight: 16,
    padding: 0,
    margin: 0,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

Input.propTypes = {
  label: PropTypes.string,
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  required: PropTypes.bool,
  errorMessage: PropTypes.string,
  allowClear: PropTypes.bool,
  onChangeText: PropTypes.func,
  hasError: PropTypes.bool,
  secureTextEntry: PropTypes.bool,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  value: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onPress: PropTypes.func,
};
