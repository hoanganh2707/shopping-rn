import React, { useEffect } from 'react';
import { Keyboard, StyleSheet } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { authApi } from '~/apis';
import {
  Button,
  Header,
  Input,
  KeyboardAvoidingScrollView,
  Text,
} from '~/components';
import { useLoading } from '~/hooks';
import { authActions, selectUser } from '~/redux';
import { colors } from '~/styles';
import { phoneRegExp, showMessage } from '~/utils';

export const UserInfo = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userData = useSelector(selectUser);

  const { showLoading, hideLoading } = useLoading();

  const validationSchema = yup.object().shape({
    name: yup.string().required(t('required')),
    phoneNumber: yup
      .string()
      .matches(phoneRegExp, t('invalidPhoneNumber'))
      .required(t('required')),
    address: yup.string().required(t('required')),
  });

  const initialValues = {
    name: undefined,
    phoneNumber: undefined,
    email: undefined,
    address: undefined,
  };

  const {
    values,
    touched,
    errors,
    setFieldTouched,
    setFieldValue,
    handleBlur,
    handleSubmit,
  } = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      Keyboard.dismiss();
      onSubmit();
    },
  });

  const getUserInfo = async () => {
    const response = await authApi.getUserProfile(userData.uid);
    if (response?.data) {
      const user = response.data;
      setFieldValue('name', user.fullname);
      setFieldValue('phoneNumber', user.phoneNumber);
      setFieldValue('email', user.email);
      setFieldValue('address', user.address);
      dispatch(authActions.updateUser(user));
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const onSubmit = async () => {
    showLoading();
    const response = await authApi.updateUserProfile({
      fullname: values.name,
      phoneNumber: values.phoneNumber,
      address: values.address,
    });
    hideLoading();
    showMessage(response?.message);
    if (response?.status === 'success') {
      const data = response?.data;
      dispatch(authActions.updateUser(data));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Header title={t('screenNames.userInfo')} />
      <KeyboardAvoidingScrollView
        contentContainerStyle={styles.container}
        stickyFooter={
          <Button
            title={t('confirm')}
            block
            style={styles.button}
            onPress={handleSubmit}
          />
        }>
        <Text variant='labelMedium' style={styles.personalInformation}>
          {t('personalInformation')}
        </Text>
        <Input
          value={values.name}
          defaultValue={userData.fullname}
          onChangeText={(text) => {
            setFieldTouched('name', true);
            setFieldValue('name', text);
          }}
          hasError={!!(touched.name && errors.name)}
          errorMessage={touched.name && errors.name && errors.name}
          onBlur={handleBlur('name')}
          label={t('fullname')}
          autoCapitalize='words'
          returnKeyType='done'
          style={styles.input}
        />
        <Input
          value={values.phoneNumber}
          defaultValue={userData.phoneNumber}
          onChangeText={(text) => {
            setFieldTouched('phoneNumber', true);
            setFieldValue('phoneNumber', text);
          }}
          hasError={!!(touched.phoneNumber && errors.phoneNumber)}
          errorMessage={
            touched.phoneNumber && errors.phoneNumber && errors.phoneNumber
          }
          onBlur={handleBlur('phoneNumber')}
          label={t('phoneNumber')}
          keyboardType='phone-pad'
          style={styles.input}
        />
        <Input
          disabled
          value={values.email}
          defaultValue={userData?.email}
          label={t('email')}
          style={styles.input}
        />
        <Input
          value={values.address}
          defaultValue={userData?.address}
          onChangeText={(text) => {
            setFieldTouched('address', true);
            setFieldValue('address', text);
          }}
          hasError={!!(touched.address && errors.address)}
          errorMessage={touched.address && errors.address && errors.address}
          onBlur={handleBlur('address')}
          label={t('address')}
          style={styles.input}
        />
      </KeyboardAvoidingScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.surface,
  },
  personalInformation: {
    marginBottom: 20,
    color: colors.tertiaryText,
    textTransform: 'uppercase',
  },
  input: {
    marginBottom: 8,
  },
  button: {},
});
