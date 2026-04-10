import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { useTranslation } from 'react-i18next';

import { colors } from '~/styles';
import { Icon } from '../icon';
import { Pressable } from '../pressable';
import { Text } from '../text';

export const SearchBox = (props) => {
  const { style, onPress } = props;

  const { t } = useTranslation();

  const color = '#82869E';

  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      <Icon color={color} name='search' size='xSmall' />
      <Text color={color}>&nbsp;{t('searchPlaceholder')}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 35,
    backgroundColor: colors.searchBackground,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  placeholder: {},
});

SearchBox.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
