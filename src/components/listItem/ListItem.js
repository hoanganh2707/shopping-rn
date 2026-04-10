import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '~/styles';
import { Divider } from '../divider';
import { Icon } from '../icon';
import { Pressable } from '../pressable';
import { Text } from '../text';

export const ListItem = (props) => {
  const { icon, title, onPress, bottomDivider } = props;
  return (
    <>
      <Pressable onPress={onPress} style={styles.container}>
        <Icon color={colors.tertiaryText} name={icon} />
        <View style={[styles.content]}>
          <Text numberOfLines={1}>{title}</Text>
        </View>
        <Icon color={colors.tertiaryText} size={'small'} name={'arrow-next'} />
      </Pressable>
      {bottomDivider && <Divider style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginHorizontal: 20,
  },
  divider: {
    marginHorizontal: 16,
  },
});

ListItem.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  onPress: PropTypes.func,
  bottomDivider: PropTypes.bool,
};
