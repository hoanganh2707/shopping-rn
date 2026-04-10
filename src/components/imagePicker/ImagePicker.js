import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import * as ExpoImagePicker from 'expo-image-picker';

import { Avatar } from '../avatar';

export const ImagePicker = (props) => {
  const { uri, onChange, style, onCancel } = props;

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      // quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const assetBase64 = result.assets[0].base64;

      const outputUri = 'data:image/jpeg;base64,' + assetBase64;

      onChange?.(outputUri);
    }

    if (result.canceled) {
      onCancel?.();
    }
  };

  return (
    <View style={style}>
      <Avatar
        source={{ uri: uri ?? undefined }}
        size='large'
        onPress={pickImage}
        icon='camera'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  image: {
    width: 200,
    height: 200,
  },
});

ImagePicker.propTypes = {
  uri: PropTypes.string,
  onChange: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onCancel: PropTypes.func,
};
