import React from 'react';
import { Image } from 'react-native';

import { SCREEN_WIDTH } from '~/constants';

export const Banner = (props) => {
  const { gapHorizontal = 16, borderRadius = 10 } = props;

  const imageURI =
    'https://thietkekhainguyen.com/wp-content/uploads/2018/12/poster-cafe-tra-sua-min-788x400.jpg';

  return (
    <Image
      resizeMode='cover'
      style={{
        width: SCREEN_WIDTH - gapHorizontal * 2,
        height: SCREEN_WIDTH * 0.35,
        marginHorizontal: gapHorizontal,
        borderRadius: borderRadius,
      }}
      source={{
        uri: imageURI,
      }}
    />
  );
};
