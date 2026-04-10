import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { useNavigation } from '@react-navigation/native';
import { images } from '~/assets';
import { Button } from '~/components';
import { SCREENS } from '~/constants';
import { colors } from '~/styles';

export const Empty = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate(SCREENS.HOME);
  };

  return (
    <View style={styles.container}>
      <Image source={images.emptyCart} style={styles.image} />
      <Text>{t('noItemsInCart')}</Text>
      <Button onPress={handlePress} title={t('buyNow')} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surface,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  button: {
    marginTop: 24,
  },
});
