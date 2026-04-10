import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '../text';

export const Label = (props) => {
  const { text, style, required = true } = props;
  const { t } = useTranslation();

  return (
    <Text>
      <Text style={style}>{text}</Text>
      {!required && (
        <Text>
          {` (`}
          {t('optional')}
          {`) `}
        </Text>
      )}
    </Text>
  );
};

const styles = StyleSheet.create({});

Label.propTypes = {
  text: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  required: PropTypes.bool,
};
