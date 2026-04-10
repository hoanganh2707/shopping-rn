import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, IconButton, Pressable, Text } from '~/components';
import { colors } from '~/styles';

export const CategoryItem = (props) => {
  const { data, onShow, onUpdate, onDelete } = props;

  return (
    <Pressable onPress={onShow} style={styles.container}>
      <View style={styles.content}>
        <Avatar source={{ uri: data?.image }} style={styles.avatar} />
        <Text>{data?.name}</Text>
      </View>
      <View style={styles.iconContainer}>
        <IconButton name='update' onPress={onUpdate} />
        <IconButton name='remove' onPress={onDelete} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    marginRight: 16,
  },
});

CategoryItem.propTypes = {
  data: PropTypes.object,
  onShow: PropTypes.func,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
};
