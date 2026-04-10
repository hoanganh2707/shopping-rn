import PropTypes from 'prop-types';
import React from 'react';

import { Icon } from './Icon';
import { Pressable } from '../pressable';

export const IconButton = (props) => {
  const { onPress, disabled, ...rest } = props;

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Icon {...rest} />
    </Pressable>
  );
};

IconButton.propTypes = {
  onPress: PropTypes.func,
  disabled: PropTypes.bool,
  ...Icon.propTypes,
};
