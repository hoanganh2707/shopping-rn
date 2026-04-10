import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '~/styles';
import { IconButton } from '../icon';

export const Rating = (props) => {
  const { value = 0, onChangeValue } = props;

  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }).map((e, index) => (
        <IconButton
          onPress={() => {
            onChangeValue?.(index + 1);
          }}
          color={value >= index + 1 ? colors.star : undefined}
          name={value >= index + 1 ? 'star' : 'star-outline'}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 4,
  },
});

Rating.propTypes = {
  value: PropTypes.number,
  onChangeValue: PropTypes.func,
};
