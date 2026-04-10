import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { colors } from '~/styles';
import { LoadingIndicator } from '../loadingIndicator';

export const LoadingOverlay = () => {
  return (
    <Modal transparent>
      <View style={styles.container}>
        <View style={styles.content}>
          <LoadingIndicator />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backdrop,
    flex: 1,
  },
  content: {
    backgroundColor: colors.light,
    padding: 30,
    borderRadius: 10,
  },
});
