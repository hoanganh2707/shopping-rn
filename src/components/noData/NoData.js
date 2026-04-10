import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../text';

export const NoData = () => {
  return (
    <View style={styles.container}>
      <Text>NO DATA</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignSelf: 'center',
  },
});
