import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HEADER_HEIGHT, IS_IOS, STATUS_BAR_HEIGHT } from '~/constants';
import { goBack } from '~/navigators';
import { colors } from '~/styles';
import { IconButton } from '../icon';
import { Text } from '../text';

export const Header = (props) => {
  const {
    title,
    titleStyle,
    backIcon,
    isBackVisible = true,
    rightComponent,
    onBackPressed,
    style,
    backgroundColor = colors.surface,
    presentationModal,
    titleComponent,
  } = props;

  const onBack = () => {
    if (!onBackPressed) {
      goBack();
    }
    onBackPressed?.();
  };

  const getHeight = () => {
    if (presentationModal === true && IS_IOS) return HEADER_HEIGHT;
    else return STATUS_BAR_HEIGHT + HEADER_HEIGHT;
  };

  return (
    <View
      style={[
        styles.container,
        style,
        {
          height: getHeight(),
          backgroundColor,
        },
      ]}>
      <View style={styles.left}>
        {isBackVisible && (
          <IconButton onPress={onBack} name={backIcon ?? 'back'} />
        )}
      </View>
      {!titleComponent ? (
        <Text variant='titleMedium' style={[styles.title, titleStyle]}>
          {title}
        </Text>
      ) : (
        titleComponent
      )}
      <View style={styles.right}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    paddingBottom: 12,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    flex: 3,
    textAlign: 'center',
  },
});

Header.propTypes = {
  /**
   * @platform ios
   */
  presentationModal: PropTypes.bool,
};
