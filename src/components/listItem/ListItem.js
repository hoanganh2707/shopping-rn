import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '~/config/ThemeContext';
import { Divider } from '../divider';
import { Icon } from '../icon';
import { Pressable } from '../pressable';
import { Text } from '../text';

export const ListItem = (props) => {
  const { icon, title, onPress, bottomDivider, rightComponent } = props;
  const { colors } = useTheme();

  return (
    <>
      <Pressable onPress={onPress} style={[styles.container, { backgroundColor: colors.surface }]}>
        <Icon color={colors.tertiaryText} name={icon} />
        <View style={[styles.content]}>
          <Text numberOfLines={1} style={{ color: colors.primaryText || colors.text }}>
            {title}
          </Text>
        </View>
        {rightComponent || (
          <Icon color={colors.tertiaryText} size={'small'} name={'arrow-next'} />
        )}
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
  rightComponent: PropTypes.element,
};
