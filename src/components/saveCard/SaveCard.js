import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { SAVE_CARD_HEIGHT } from '~/constants';
import { colors } from '~/styles';
import { moneyFormat } from '~/utils';
import { Icon } from '../icon';
import { Text } from '../text';

export const SaveCard = (props) => {
  const { t } = useTranslation();
  const { money, style } = props;

  return (
    <View style={[styles.container]}>
      <LinearGradient
        active
        colors={['#aa20ff', '#413fff']}
        style={[styles.background, style]}>
        <View style={styles.content}>
          <View>
            <Text variant='labelSmall' style={styles.save}>
              {t('saveMoney')}
            </Text>
            <Text numberOfLines={1} style={styles.money}>
              {moneyFormat(money)}
            </Text>
          </View>
        </View>
        <Icon
          style={styles.iconFlash}
          color={colors.text}
          name={'flash'}
          size={30}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'baseline',
  },
  content: {
    marginHorizontal: 8,
    marginTop: 2,
    marginBottom: 4,
    flexDirection: 'row',
  },
  background: {
    borderRadius: 4,
    height: SAVE_CARD_HEIGHT,
  },
  save: {
    color: '#ffd591',
    textTransform: 'uppercase',
  },
  money: {
    color: colors.light,
  },
  iconFlash: {
    top: -40,
    right: -4,
    opacity: 0.2,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});

SaveCard.propTypes = {
  money: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
