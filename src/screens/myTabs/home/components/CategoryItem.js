import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Pressable, Text } from '~/components';
import { SCREEN_WIDTH } from '~/constants';
import { useTheme } from '~/config/ThemeContext';

export const CategoryItem = (props) => {
  const { data, onPress, numColumns } = props;
  const { colors } = useTheme();

  const itemWidth = (SCREEN_WIDTH - 32) / numColumns;
  const imageSize = 32; 

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          width: itemWidth,
        },
        styles.container,
      ]}>
      {/* Add a subtle background circle behind the category icon */}
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Image
          source={{ uri: data?.image }}
          style={{
            width: imageSize,
            height: imageSize,
            resizeMode: 'contain'
          }}
        />
      </View>
      <Text numberOfLines={2} style={[styles.label, { color: colors.primaryText }]}>
        {data?.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8, // Reduced padding
    alignItems: 'center',
  },
  iconContainer: {
    width: 44, // Reduced from 50
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  label: {
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '500',
  },
});

CategoryItem.propTypes = {
  data: PropTypes.object,
  onPress: PropTypes.func,
  gap: PropTypes.number,
  numColumns: PropTypes.number,
};
