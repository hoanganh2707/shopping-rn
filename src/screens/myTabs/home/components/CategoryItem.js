import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { Pressable, Text } from '~/components';
import { SCREEN_WIDTH } from '~/constants';

export const CategoryItem = (props) => {
  const { data, onPress, numColumns } = props;

  const itemWidth = (SCREEN_WIDTH - 32) / numColumns;

  const imageSize = itemWidth * 0.65;
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          width: itemWidth,
        },
        styles.container,
      ]}>
      <Image
        source={{ uri: data?.image }}
        style={{
          width: imageSize,
          height: imageSize,
          marginHorizontal: 16,
        }}
      />
      <Text numberOfLines={2} style={styles.label}>
        {data?.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  label: {
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
});

CategoryItem.propTypes = {
  data: PropTypes.object,
  onPress: PropTypes.func,
  gap: PropTypes.number,
  numColumns: PropTypes.number,
};
