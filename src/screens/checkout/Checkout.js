import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, ScrollView, StyleSheet, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { orderApi } from '~/apis';
import {
  Button,
  Divider,
  Header,
  Input,
  KeyboardAvoidingScrollView,
  Pressable,
  Text,
  TextArea,
} from '~/components';
import { SCREENS } from '~/constants';
import { useLoading } from '~/hooks';
import { authActions, selectCart, selectCartTotalAmount, selectUser } from '~/redux';
import { colors } from '~/styles';
import { moneyFormat, showMessage } from '~/utils';
import { phoneRegExp } from '~/utils/formats';

export const Checkout = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { showLoading, hideLoading } = useLoading();

  const cartData = useSelector(selectCart);
  const user = useSelector(selectUser);
  const totalAmount = useSelector(selectCartTotalAmount);

  const { params } = route;
  const { fromCart } = params || {};

  const validationSchema = yup.object().shape({
    fullname: yup.string().required(t('required')),
    phoneNumber: yup
      .string()
      .matches(phoneRegExp, t('invalidPhoneNumber'))
      .required(t('required')),
    address: yup.string().required(t('required')),
    note: yup.string().optional(),
  });

  const getInitialValues = () => ({
    fullname: user?.fullname || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    note: '',
  });

  const {
    values,
    touched,
    errors,
    setFieldTouched,
    setFieldValue,
    handleBlur,
    handleSubmit,
  } = useFormik({
    initialValues: getInitialValues(),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      Keyboard.dismiss();
      await handleCreateOrder(values);
    },
  });

  const handleCreateOrder = async (shippingInfo) => {
    if (cartData.length === 0) {
      showMessage(t('noItemsInCart'));
      return;
    }

    showLoading();
    try {
      // Cập nhật thông tin user nếu có thay đổi
      if (
        shippingInfo.fullname !== user?.fullname ||
        shippingInfo.phoneNumber !== user?.phoneNumber ||
        shippingInfo.address !== user?.address
      ) {
        // Update user info temporarily (hoặc lưu vào order riêng)
        // Ở đây chúng ta sẽ lưu vào order
      }

      const response = await orderApi.add(user.uid, cartData, shippingInfo);

      if (response?.status === 'success' && response?.data?.orderId) {
        // Serialize cartData to avoid non-serializable values warning
        const serializedCartData = cartData.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          priceOld: item.priceOld,
          quantity: item.quantity,
          image: item.image,
        }));

        // Chuyển đến màn hình chọn phương thức thanh toán
        navigation.navigate(SCREENS.PAYMENT_METHOD_SELECTION, {
          orderId: response.data.orderId,
          orderCode: response.data.orderCode,
          totalAmount,
          cartData: serializedCartData,
        });
      } else {
        showMessage(response?.message || t('paymentFailedMessage'));
      }
    } catch (error) {
      console.error('Create order error:', error);
      showMessage(error?.message || 'Failed to create order');
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Header title={t('checkout') || 'Thanh toán'} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingScrollView style={styles.scrollView}>
          {/* Shipping Information */}
          <View style={styles.section}>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              {t('shippingInformation') || 'Thông tin giao hàng'}
            </Text>

            <Input
              value={values.fullname}
              onChangeText={(text) => {
                setFieldTouched('fullname', true);
                setFieldValue('fullname', text);
              }}
              hasError={!!(touched.fullname && errors.fullname)}
              errorMessage={touched.fullname && errors.fullname}
              onBlur={handleBlur('fullname')}
              label={t('fullname')}
              placeholder={t('pleaseInput')}
              style={styles.input}
              required
            />

            <Input
              value={values.phoneNumber}
              onChangeText={(text) => {
                setFieldTouched('phoneNumber', true);
                setFieldValue('phoneNumber', text);
              }}
              hasError={!!(touched.phoneNumber && errors.phoneNumber)}
              errorMessage={touched.phoneNumber && errors.phoneNumber}
              onBlur={handleBlur('phoneNumber')}
              label={t('phoneNumber')}
              placeholder={t('pleaseInput')}
              style={styles.input}
              keyboardType='phone-pad'
              required
            />

            <Input
              value={values.address}
              onChangeText={(text) => {
                setFieldTouched('address', true);
                setFieldValue('address', text);
              }}
              hasError={!!(touched.address && errors.address)}
              errorMessage={touched.address && errors.address}
              onBlur={handleBlur('address')}
              label={t('address')}
              placeholder={t('pleaseInput')}
              style={styles.input}
              multiline
              numberOfLines={3}
              required
            />

            <TextArea
              value={values.note}
              onChangeText={(text) => {
                setFieldTouched('note', true);
                setFieldValue('note', text);
              }}
              label={t('note') || 'Ghi chú'}
              placeholder={t('orderNotePlaceholder') || 'Ghi chú cho đơn hàng (tùy chọn)'}
              style={styles.input}
              numberOfLines={3}
            />
          </View>

          <Divider />

          {/* Order Summary */}
          <View style={styles.section}>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              {t('orderSummary') || 'Tóm tắt đơn hàng'}
            </Text>

            <FlatList
              data={cartData}
              renderItem={({ item }) => (
                <View style={styles.orderItem}>
                  <Text numberOfLines={2} style={styles.productName}>
                    {item.name}
                  </Text>
                  <View style={styles.orderItemRow}>
                    <Text style={styles.quantity}>
                      {t('quantity') || 'Số lượng'}: {item.quantity}
                    </Text>
                    <Text style={styles.price}>
                      {moneyFormat(item.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              )}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              scrollEnabled={false}
            />
          </View>

          <Divider />

          {/* Total */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text variant='titleMedium'>{t('totalMoney')}:</Text>
              <Text variant='titleLarge' style={styles.totalAmount}>
                {moneyFormat(totalAmount)}
              </Text>
            </View>
          </View>
        </KeyboardAvoidingScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <Button
            title={t('continue') || 'Tiếp tục thanh toán'}
            onPress={handleSubmit}
            block
            style={styles.checkoutButton}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    marginBottom: 16,
    color: colors.primaryText,
  },
  input: {
    marginBottom: 16,
  },
  orderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  productName: {
    marginBottom: 8,
    color: colors.primaryText,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    color: colors.secondaryText,
  },
  price: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  totalSection: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkoutButton: {
    // Button styles
  },
});

