import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button } from '~/components';
import { HEADER_HEIGHT, STATUS_BAR_HEIGHT } from '~/constants';
import { colors } from '~/styles';

export const Header = (props) => {
  const { onPress } = props;
  const { t } = useTranslation();

  const getHeight = () => {
    return STATUS_BAR_HEIGHT + HEADER_HEIGHT + 20;
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: getHeight(),
        },
      ]}>
      <Button
        onPress={onPress}
        title={t('accountScreen.registerOrLogin')}
        block
        color='light'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    alignItems: 'flex-end',
    paddingBottom: 12,
    backgroundColor: colors.primary,
  },
});

Header.propTypes = {
  onPress: PropTypes.func,
};
