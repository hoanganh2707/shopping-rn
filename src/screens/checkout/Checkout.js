import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, ScrollView, StyleSheet, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { orderApi, couponApi } from '~/apis';
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
import { authActions, selectCart, selectCartTotalAmount, selectUser, selectAppliedCoupon, couponActions, selectRewardPoints, rewardActions, selectDefaultAddress, selectAddresses } from '~/redux';
import { useTheme } from '~/config/ThemeContext';
import { moneyFormat, showMessage } from '~/utils';
import { phoneRegExp } from '~/utils/formats';

export const Checkout = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { showLoading, hideLoading } = useLoading();
  const { colors } = useTheme();

  const cartData = useSelector(selectCart);
  const user = useSelector(selectUser);
  const totalAmount = useSelector(selectCartTotalAmount);
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const rewardPoints = useSelector(selectRewardPoints);
  const defaultAddress = useSelector(selectDefaultAddress);
  const savedAddresses = useSelector(selectAddresses);

  const { params } = route;
  const { fromCart } = params || {};

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [usePoints, setUsePoints] = useState(false);

  // Calculate discount
  const couponDiscount = appliedCoupon ? couponApi.calculateDiscount(appliedCoupon, totalAmount) : 0;
  const pointsToUse = usePoints ? Math.min(rewardPoints, Math.floor(totalAmount / 100)) : 0;
  const pointsDiscount = pointsToUse * 100; // 1 point = 100đ
  const finalTotal = Math.max(0, totalAmount - couponDiscount - pointsDiscount);

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
    fullname: defaultAddress?.fullname || user?.fullname || '',
    phoneNumber: defaultAddress?.phone || user?.phoneNumber || '',
    address: defaultAddress?.address || user?.address || '',
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    
    const result = await couponApi.validateCoupon(couponCode.trim(), totalAmount);
    if (result.status === 'success') {
      dispatch(couponActions.applyCoupon(result.data));
      showMessage(t('couponApplied') || 'Coupon applied!', 'success');
      Keyboard.dismiss();
    } else {
      setCouponError(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(couponActions.removeCoupon());
    setCouponCode('');
    setCouponError('');
  };

  const handleSelectAddress = (addr) => {
    setFieldValue('fullname', addr.fullname);
    setFieldValue('phoneNumber', addr.phone);
    setFieldValue('address', addr.address);
    setFieldTouched('fullname', false);
    setFieldTouched('phoneNumber', false);
    setFieldTouched('address', false);
  };

  const handleCreateOrder = async (shippingInfo) => {
    if (cartData.length === 0) {
      showMessage(t('noItemsInCart'));
      return;
    }

    showLoading();
    try {
      const response = await orderApi.add(user.uid, cartData, shippingInfo);

      if (response?.status === 'success' && response?.data?.orderId) {
        // Award reward points (1% of total)
        const earnedPoints = Math.floor(finalTotal / 100);
        if (earnedPoints > 0) {
          dispatch(rewardActions.addPoints({
            points: earnedPoints,
            description: `Tích điểm đơn hàng ${response.data.orderCode}`,
          }));
        }

        // Deduct used points
        if (usePoints && pointsToUse > 0) {
          dispatch(rewardActions.redeemPoints({
            points: pointsToUse,
            description: `Sử dụng điểm cho đơn hàng ${response.data.orderCode}`,
          }));
        }

        // Clear coupon
        dispatch(couponActions.removeCoupon());

        // Serialize cartData
        const serializedCartData = cartData.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          priceOld: item.priceOld,
          quantity: item.quantity,
          image: item.image,
        }));

        navigation.navigate(SCREENS.PAYMENT_METHOD_SELECTION, {
          orderId: response.data.orderId,
          orderCode: response.data.orderCode,
          totalAmount: finalTotal,
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

  const styles = createStyles(colors);

  return (
    <>
      <Header title={t('checkout') || 'Thanh toán'} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <KeyboardAvoidingScrollView style={styles.scrollView}>
          {/* Saved Addresses */}
          {savedAddresses.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text variant='titleSmall' style={[styles.sectionTitle, { color: colors.primaryText }]}>
                {t('selectFromSaved') || 'Chọn từ địa chỉ đã lưu'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.addressScroll}>
                {savedAddresses.map((addr) => (
                  <Pressable
                    key={addr.id}
                    onPress={() => handleSelectAddress(addr)}
                    style={[styles.addressChip, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <Text style={[styles.addressChipLabel, { color: colors.primary }]}>
                      {addr.label || 'Home'}
                    </Text>
                    <Text numberOfLines={1} style={[styles.addressChipText, { color: colors.secondaryText }]}>
                      {addr.fullname} - {addr.address}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Shipping Information */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text variant='titleMedium' style={[styles.sectionTitle, { color: colors.primaryText }]}>
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

          {/* Coupon Code */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text variant='titleMedium' style={[styles.sectionTitle, { color: colors.primaryText }]}>
              {t('couponCode') || 'Mã giảm giá'}
            </Text>
            {appliedCoupon ? (
              <View style={[styles.appliedCoupon, { backgroundColor: colors.background }]}>
                <View style={styles.couponInfo}>
                  <Text style={[styles.couponBadge, { backgroundColor: colors.primary + '20', color: colors.primary }]}>
                    {appliedCoupon.code}
                  </Text>
                  <Text style={[styles.couponDesc, { color: colors.secondaryText }]}>
                    {appliedCoupon.description || `Giảm ${appliedCoupon.discountValue}${appliedCoupon.discountType === 'percent' ? '%' : 'đ'}`}
                  </Text>
                </View>
                <Pressable onPress={handleRemoveCoupon}>
                  <Text style={{ color: colors.error }}>{t('removeCoupon') || 'Xoá'}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.couponRow}>
                <Input
                  value={couponCode}
                  onChangeText={(text) => {
                    setCouponCode(text.toUpperCase());
                    setCouponError('');
                  }}
                  placeholder={t('enterCouponCode') || 'Nhập mã giảm giá'}
                  style={styles.couponInput}
                  hasError={!!couponError}
                  errorMessage={couponError}
                />
                <Button
                  title={t('applyCoupon') || 'Áp dụng'}
                  onPress={handleApplyCoupon}
                  size='small'
                  style={styles.couponBtn}
                />
              </View>
            )}
          </View>

          <Divider />

          {/* Reward Points */}
          {rewardPoints > 0 && (
            <>
              <View style={[styles.section, { backgroundColor: colors.surface }]}>
                <Pressable
                  onPress={() => setUsePoints(!usePoints)}
                  style={styles.pointsRow}>
                  <View>
                    <Text variant='titleSmall' style={{ color: colors.primaryText }}>
                      {t('useRewardPoints') || 'Sử dụng điểm thưởng'}
                    </Text>
                    <Text style={[styles.pointsAvailable, { color: colors.secondaryText }]}>
                      {t('yourPoints')}: {rewardPoints} ({moneyFormat(rewardPoints * 100)})
                    </Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    {
                      backgroundColor: usePoints ? colors.primary : 'transparent',
                      borderColor: usePoints ? colors.primary : colors.border,
                    },
                  ]}>
                    {usePoints && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </Pressable>
              </View>
              <Divider />
            </>
          )}

          {/* Order Summary */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text variant='titleMedium' style={[styles.sectionTitle, { color: colors.primaryText }]}>
              {t('orderSummary') || 'Tóm tắt đơn hàng'}
            </Text>

            <FlatList
              data={cartData}
              renderItem={({ item }) => (
                <View style={[styles.orderItem, { borderBottomColor: colors.border }]}>
                  <Text numberOfLines={2} style={[styles.productName, { color: colors.primaryText }]}>
                    {item.name}
                  </Text>
                  <View style={styles.orderItemRow}>
                    <Text style={{ color: colors.secondaryText }}>
                      {t('quantity') || 'Số lượng'}: {item.quantity}
                    </Text>
                    <Text style={[styles.price, { color: colors.primaryText }]}>
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
          <View style={[styles.totalSection, { backgroundColor: colors.surface }]}>
            <View style={styles.totalRow}>
              <Text style={{ color: colors.secondaryText }}>{t('subtotal') || 'Tạm tính'}:</Text>
              <Text style={{ color: colors.primaryText }}>{moneyFormat(totalAmount)}</Text>
            </View>
            {couponDiscount > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ color: colors.success || '#4caf50' }}>{t('discount') || 'Giảm giá'}:</Text>
                <Text style={{ color: colors.success || '#4caf50' }}>-{moneyFormat(couponDiscount)}</Text>
              </View>
            )}
            {pointsDiscount > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ color: colors.success || '#4caf50' }}>{t('pointsDiscount') || 'Giảm từ điểm'}:</Text>
                <Text style={{ color: colors.success || '#4caf50' }}>-{moneyFormat(pointsDiscount)}</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.totalFinal]}>
              <Text variant='titleMedium' style={{ color: colors.primaryText }}>{t('totalMoney')}:</Text>
              <Text variant='titleLarge' style={[styles.totalAmount, { color: colors.primary }]}>
                {moneyFormat(finalTotal)}
              </Text>
            </View>
          </View>
        </KeyboardAvoidingScrollView>

        {/* Footer Button */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
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

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  section: { padding: 16 },
  sectionTitle: { marginBottom: 16 },
  input: { marginBottom: 16 },
  addressScroll: { marginBottom: 8 },
  addressChip: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    width: 180,
  },
  addressChipLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  addressChipText: { fontSize: 12 },
  couponRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  couponInput: { flex: 1 },
  couponBtn: { marginTop: 20 },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  couponInfo: { flex: 1 },
  couponBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    overflow: 'hidden',
  },
  couponDesc: { fontSize: 12 },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsAvailable: { fontSize: 12, marginTop: 4 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  orderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  productName: { marginBottom: 8 },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontWeight: '600' },
  totalSection: { padding: 16 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalFinal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalAmount: { fontWeight: 'bold' },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  checkoutButton: {},
});
