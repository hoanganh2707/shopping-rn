import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { ratingApi } from '~/apis';
import { Button, Header, Pressable, Rating, Text } from '~/components';
import { useLoading } from '~/hooks';
import { selectUser } from '~/redux';
import { colors } from '~/styles';

export const UserRating = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const { showLoading, hideLoading } = useLoading();
  const { params } = route;
  const id = params.id;

  const [hasData, setHasData] = useState(false);
  const [value, setValue] = useState();

  const handleContinue = () => {
    if (value) {
      if (hasData) {
        handleUpdate();
      } else {
        handleAdd();
      }
    }
  };

  const handleUpdate = async () => {
    showLoading();
    await ratingApi.update(id, value);
    hideLoading();
  };

  const handleAdd = async () => {
    showLoading();
    const response = await ratingApi.add(user.uid, id, value);
    if (response?.status === 'success') {
      setHasData(true);
    }
    hideLoading();
  };

  const getData = async () => {
    showLoading();
    const response = await ratingApi.getOne(id);
    if (response?.data) {
      setValue(response?.data?.rating);
      setHasData(true);
    }
    hideLoading();
  };

  useEffect(() => {
    getData();
  }, []);

  const handleDelete = async () => {
    Alert.alert(t('delete'), t('deleteMessage'), [
      {
        text: t('cancel'),
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: t('ok'),
        onPress: () => deleteComment(),
        style: 'destructive',
      },
    ]);
  };

  const deleteComment = async () => {
    const response = await ratingApi.delete(id);
    if (response.status === 'success') {
      setHasData(false);
      setValue(0);
    }
  };

  return (
    <>
      <Header
        title={t('screenNames.userRating')}
        rightComponent={
          hasData && (
            <Pressable onPress={handleDelete}>
              <Text color={colors.primary}>{t('delete')}</Text>
            </Pressable>
          )
        }
      />
      <View style={styles.container}>
        <Rating value={value} onChangeValue={setValue} />
        <Button
          onPress={handleContinue}
          block
          title={t('continue')}
          style={styles.button}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: 16,
  },
});
