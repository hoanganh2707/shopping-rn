import React, { useRef } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as yup from 'yup';

import { authApi } from '~/apis';
import { Button, Header, Input, Pressable, Text, Icon } from '~/components';
import { MIN_PASSWORD_LENGTH } from '~/constants';
import { useLoading } from '~/hooks';
import { signInWithGoogle } from '~/services';
import { colors } from '~/styles';
import { showMessage } from '~/utils';
import { useDispatch } from 'react-redux';
import { authActions } from '~/redux';

export const SignUp = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showLoading, hideLoading } = useLoading();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const loginSchema = yup.object().shape({
    fullname: yup.string().required(t('required')),
    email: yup.string().email(t('invalidEmail')).required(t('required')),
    password: yup
      .string()
      .min(MIN_PASSWORD_LENGTH, t('weakPassword'))
      .required(t('required')),
  });

  const initialValues = {
    fullname: undefined,
    email: undefined,
    password: undefined,
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
    validationSchema: loginSchema,
    onSubmit: (values) => {
      Keyboard.dismiss();
      onSubmit();
    },
  });

  const onSubmit = async () => {
    showLoading();
    const response = await authApi.signUp(
      values.fullname,
      values.email,
      values.password,
    );
    hideLoading();
    showMessage(response?.message);
    if (response?.status === 'success') {
      navigation.goBack();
    }
  };

  const navigateToLogin = () => {
    navigation.goBack();
  };

  const handleGoogleSignIn = async () => {
    showLoading();
    try {
      const response = await signInWithGoogle();
      hideLoading();
      
      if (response.status === 'cancel') {
        // User cancelled, không cần hiển thị thông báo
        return;
      }
      
      showMessage(response.message);
      
      if (response.status === 'success' && response.data) {
        dispatch(authActions.addUser(response.data));
        navigation.goBack();
      }
    } catch (error) {
      hideLoading();
      console.error('Google Sign-In Error:', error);
      showMessage('Đã có lỗi xảy ra khi đăng ký với Google');
    }
  };

  return (
    <>
      <Header presentationModal backIcon='close' />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        style={styles.container}>
        <Text variant='titleLarge' style={styles.title}>
          {t('signUp')}
        </Text>
        <Input
          value={values.fullname}
          onChangeText={(text) => {
            setFieldTouched('fullname', true);
            setFieldValue('fullname', text);
          }}
          autoCapitalize='words'
          hasError={!!(touched.fullname && errors.fullname)}
          errorMessage={touched.fullname && errors.fullname && errors.fullname}
          onBlur={handleBlur('fullname')}
          label={t('fullname')}
          blurOnSubmit={false}
          returnKeyType='next'
          onSubmitEditing={() => {
            !errors.fullname && emailRef.current?.focus();
          }}
          style={styles.input}
        />
        <Input
          ref={emailRef}
          value={values.email}
          onChangeText={(text) => {
            setFieldTouched('email', true);
            setFieldValue('email', text);
          }}
          hasError={!!(touched.email && errors.email)}
          errorMessage={touched.email && errors.email && errors.email}
          onBlur={handleBlur('email')}
          label={t('email')}
          blurOnSubmit={false}
          returnKeyType='next'
          keyboardType='email-address'
          onSubmitEditing={() => {
            !errors.email && passwordRef.current?.focus();
          }}
          style={styles.input}
        />
        <Input
          ref={passwordRef}
          value={values.password}
          onChangeText={(text) => {
            setFieldTouched('password', true);
            setFieldValue('password', text);
          }}
          hasError={!!(touched.password && errors.password)}
          errorMessage={touched.password && errors.password && errors.password}
          onBlur={handleBlur('password')}
          icon='password'
          label={t('password')}
          secureTextEntry
          style={styles.input}
        />
        <Button
          title={t('continue')}
          block
          style={styles.button}
          onPress={handleSubmit}
        />
        
        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text variant='labelMedium' style={styles.dividerText}>
            {t('or') || 'Hoặc'}
          </Text>
          <View style={styles.divider} />
        </View>

        {/* Google Sign-In Button */}
        <Pressable style={styles.googleButton} onPress={handleGoogleSignIn}>
          <Icon name='google' size={24} color='#4285F4' style={styles.googleIcon} />
          <Text variant='labelLarge' style={styles.googleButtonText}>
            {t('signUpWithGoogle') || 'Đăng ký bằng Google'}
          </Text>
        </Pressable>

        <View style={styles.accountContainer}>
          <Text variant='labelMedium'>{t('haveAccount')}&nbsp;</Text>
          <Pressable onPress={navigateToLogin}>
            <Text variant='labelMedium' color={colors.primary}>
              {t('loginNow')}
            </Text>
          </Pressable>
        </View>
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
  title: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
  },
  accountContainer: {
    marginTop: 24,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: colors.tertiaryText,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
});
