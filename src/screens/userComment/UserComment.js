import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, StyleSheet, View } from 'react-native';

import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { commentApi } from '~/apis';
import { Button, Header, Pressable, Text, TextArea } from '~/components';
import { useLoading } from '~/hooks';
import { selectUser } from '~/redux';
import { colors } from '~/styles';

export const UserComment = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const { showLoading, hideLoading } = useLoading();
  const { params } = route;
  const id = params.id;

  const [hasData, setHasData] = useState(false);
  const [value, setValue] = useState();

  const handleContinue = () => {
    if (value?.trim() !== '') {
      if (hasData) {
        handleUpdate();
      } else {
        handleAdd();
      }
    }
  };

  const handleUpdate = async () => {
    Keyboard.dismiss();
    showLoading();
    await commentApi.update(id, value);
    hideLoading();
  };

  const handleAdd = async () => {
    Keyboard.dismiss();
    showLoading();
    const response = await commentApi.add(user.uid, id, value);
    if (response?.status === 'success') {
      setHasData(true);
    }
    hideLoading();
  };

  const getData = async () => {
    showLoading();
    const response = await commentApi.getOne(id);
    if (response?.data) {
      setValue(response?.data?.comment);
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
    showLoading();
    const response = await commentApi.delete(id);
    if (response.status === 'success') {
      setHasData(false);
      setValue();
    }
    hideLoading();
  };

  return (
    <>
      <Header
        title={t('screenNames.userComment')}
        rightComponent={
          hasData && (
            <Pressable onPress={handleDelete}>
              <Text color={colors.primary}>{t('delete')}</Text>
            </Pressable>
          )
        }
      />
      <View style={styles.container}>
        <TextArea value={value} onChangeText={setValue} />
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
    flex: 1,
    padding: 16,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: 16,
  },
});
