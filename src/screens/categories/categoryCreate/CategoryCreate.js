import React from 'react';
import { Keyboard, StyleSheet } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as yup from 'yup';

import { categoryApi } from '~/apis';
import { Button, ErrorMessage, Header, ImagePicker, Input } from '~/components';
import { useLoading } from '~/hooks';
import { colors } from '~/styles';
import { showMessage } from '~/utils';

export const CategoryCreate = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { showLoading, hideLoading } = useLoading();

  const validationSchema = yup.object().shape({
    name: yup.string().required(t('required')),
    image: yup.string().required(t('pleaseChooseImage')),
  });

  const initialValues = {
    name: '',
    image: '',
  };

  const {
    values,
    touched,
    errors,
    setFieldTouched,
    setFieldValue,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      Keyboard.dismiss();
      onSubmit();
    },
  });

  const onSubmit = async () => {
    showLoading();
    const response = await categoryApi.add({
      name: values.name,
      image: values.image,
    });
    hideLoading();
    response?.message && showMessage(response?.message);
    // const data = response.data;
    if (response?.status === 'success') {
      resetForm();
    }
  };

  return (
    <>
      <Header title={t('screenNames.categoryCreate')} />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={styles.container}>
        <ImagePicker
          style={styles.avatar}
          uri={values.image}
          onChange={(image) => {
            setFieldTouched('image', true);
            setFieldValue('image', image);
          }}
          onCancel={() => {
            setFieldTouched('image', true);
          }}
        />
        {touched.image && errors.image && (
          <ErrorMessage text={errors.image} style={styles.avatarError} />
        )}
        <Input
          value={values.name}
          onChangeText={(text) => {
            setFieldTouched('name', true);
            setFieldValue('name', text);
          }}
          hasError={!!(touched.name && errors.name)}
          errorMessage={touched.name && errors.name && errors.name}
          onBlur={handleBlur('name')}
          label={t('categoryName')}
          autoCapitalize='sentences'
        />

        <Button
          title={t('continue')}
          block
          style={styles.button}
          onPress={handleSubmit}
        />
      </KeyboardAwareScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: 24,
  },
  avatar: {
    alignSelf: 'center',
  },
  avatarError: {
    marginTop: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
});
