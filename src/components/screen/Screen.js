import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export const Screen = (props) => {
  const { children, style, edges = ['bottom'], ...rest } = props;
  return (
    <>
      <SafeAreaView
        {...rest}
        edges={['bottom']}
        style={[styles.container, style]}>
        {children}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

Screen.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
