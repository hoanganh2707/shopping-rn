import PropTypes from 'prop-types';
import React from 'react';
import {
  Platform,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

export const KeyboardAvoidingScrollView = (props) => {
  const { children, stickyFooter, style, contentContainerStyle } = props;
  return (
    <RNKeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={contentContainerStyle}
        style={[styles.flex, style]}>
        {children}
      </ScrollView>
      {stickyFooter && <View style={styles.footer}>{stickyFooter}</View>}
    </RNKeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footer: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
});

KeyboardAvoidingScrollView.propTypes = {
  children: PropTypes.node,
  stickyFooter: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  contentContainerStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
};
