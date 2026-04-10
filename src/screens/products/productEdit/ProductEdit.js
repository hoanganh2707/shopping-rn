import React from 'react';
import { Keyboard, StyleSheet } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as yup from 'yup';

import { productApi } from '~/apis';
import {
  Button,
  Checkbox,
  DropDownPicker,
  ErrorMessage,
  Header,
  ImagePicker,
  Input,
  TextArea,
} from '~/components';
import { useGetListCategoryRealtime, useLoading } from '~/hooks';
import { colors } from '~/styles';
import { showMessage } from '~/utils';

export const ProductEdit = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { showLoading, hideLoading } = useLoading();

  const params = route.params;
  const data = params.data;

  const categoryList = useGetListCategoryRealtime();

  const validationSchema = yup.object().shape({
    category: yup.string().required(t('required')),
    name: yup.string().required(t('required')),
    image: yup.string().required(t('pleaseChooseImage')),
    price: yup
      .number()
      .integer()
      .typeError(t('mustBeANumber'))
      .required(t('required')),
    priceOld: yup
      .number()
      .integer()
      .typeError(t('mustBeANumber'))
      .required(t('required')),
  });

  const initialValues = {
    category: data?.category?.id,
    name: data?.name,
    image: data?.image,
    price: data?.price?.toString(),
    priceOld: data?.priceOld?.toString(),
    description: data?.description,
    outOfStock: data?.outOfStock || false,
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
    const response = await productApi.update(data.id, {
      category: values.category,
      name: values.name,
      price: Number(values.price),
      priceOld: Number(values.priceOld),
      description: values.description,
      image: values.image,
      outOfStock: values.outOfStock,
    });
    hideLoading();
    showMessage(response.message);
    // const data = response.data;
    if (response.status === 'success') {
    }
  };

  return (
    <>
      <Header title={t('screenNames.productEdit')} />
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
        <DropDownPicker
          label={t('category')}
          onClose={() => {
            setFieldTouched('category', true);
          }}
          data={categoryList}
          schema={{
            value: 'id',
            label: 'name',
          }}
          value={values.category}
          defaultValue={data?.category?.name}
          onChangeValue={(value) => {
            setFieldTouched('category', true);
            setFieldValue('category', value);
          }}
          hasError={!!(touched.category && errors.category)}
          errorMessage={touched.category && errors.category && errors.category}
          style={styles.inputSpacing}
        />
        <Input
          value={values.name}
          onChangeText={(text) => {
            setFieldTouched('name', true);
            setFieldValue('name', text);
          }}
          label={t('name')}
          hasError={!!(touched.name && errors.name)}
          errorMessage={touched.name && errors.name && errors.name}
          onBlur={handleBlur('name')}
          returnKeyType='next'
          autoCapitalize='sentences'
          style={styles.inputSpacing}
        />
        <Input
          value={values.price}
          onChangeText={(text) => {
            setFieldTouched('price', true);
            setFieldValue('price', text);
          }}
          label={t('price')}
          hasError={!!(touched.price && errors.price)}
          errorMessage={touched.price && errors.price && errors.price}
          onBlur={handleBlur('price')}
          returnKeyType='next'
          keyboardType='numeric'
          style={styles.inputSpacing}
        />
        <Input
          value={values.priceOld}
          onChangeText={(text) => {
            setFieldTouched('priceOld', true);
            setFieldValue('priceOld', text);
          }}
          label={t('priceOld')}
          hasError={!!(touched.priceOld && errors.priceOld)}
          errorMessage={touched.priceOld && errors.priceOld && errors.priceOld}
          onBlur={handleBlur('priceOld')}
          returnKeyType='next'
          keyboardType='numeric'
          style={styles.inputSpacing}
        />
        <TextArea
          value={values.description}
          onChangeText={(text) => {
            setFieldTouched('description', true);
            setFieldValue('description', text);
          }}
          label={t('description')}
          hasError={!!(touched.description && errors.description)}
          errorMessage={
            touched.description && errors.description && errors.description
          }
          onBlur={handleBlur('description')}
          returnKeyType='next'
          keyboardType='numeric'
          style={styles.inputSpacing}
        />
        <Checkbox
          label={t('outOfStock') || 'Hết hàng'}
          value={values.outOfStock}
          onValueChange={(value) => {
            setFieldTouched('outOfStock', true);
            setFieldValue('outOfStock', value);
          }}
          style={styles.checkbox}
        />
        <Button
          title={t('continue')}
          block
          onPress={handleSubmit}
          style={styles.button}
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
  inputSpacing: {
    marginBottom: 8,
  },
  checkbox: {
    marginTop: 8,
    marginBottom: 8,
  },
});
