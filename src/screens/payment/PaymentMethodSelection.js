import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { orderApi, paymentApi } from '~/apis';
import { RadioButton } from 'react-native-radio-buttons-group';

import { Button, Header, Pressable, Text } from '~/components';
import { SCREENS } from '~/constants';
import { useLoading } from '~/hooks';
import { cartActions } from '~/redux';
import { colors } from '~/styles';
import { showMessage } from '~/utils';

const PAYMENT_METHODS = [
  {
    value: null, // null = hiển thị tất cả options
    label: 'paymentMethodQR',
    description: 'paymentMethodQRDesc',
    icon: '📱',
  },
  {
    value: 'VNBANK',
    label: 'paymentMethodATM',
    description: 'paymentMethodATMDesc',
    icon: '🏦',
    note: 'Note: VNBANK is a payment method, not a bank code',
  },
  {
    value: 'INTCARD',
    label: 'paymentMethodInternational',
    description: 'paymentMethodInternationalDesc',
    icon: '💳',
    note: 'Note: INTCARD is a payment method, not a bank code',
  },
];

export const PaymentMethodSelection = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { showLoading, hideLoading } = useLoading();
  const dispatch = useDispatch();

  const { params } = route;
  const { orderId, orderCode, totalAmount, cartData } = params;

  const [selectedMethod, setSelectedMethod] = useState(null); // null = hiển thị tất cả payment methods

  const handleProceedToPayment = async () => {
    if (!orderId) {
      showMessage('Order ID is required');
      return;
    }

    try {
      showLoading();
      
      // Gọi API để lấy payment URL từ backend
      const bankCode = selectedMethod; // null = hiển thị tất cả options
      
      const response = await paymentApi.createVNPayPayment(
        orderId,
        totalAmount,
        bankCode,
        orderCode
      );

      hideLoading();

      if (response?.status === 'success' && response?.data?.paymentUrl) {
        const paymentUrl = response.data.paymentUrl;
        
        console.log('Navigating to VNPay WebView with URL:', paymentUrl);
        
        // Navigate to WebView screen để thanh toán
        navigation.navigate(SCREENS.VNPAY_WEBVIEW, {
          paymentUrl,
          orderId,
          orderCode,
          totalAmount,
          cartData,
        });
      } else {
        showMessage(response?.message || t('paymentFailedMessage'));
        await orderApi.updatePaymentStatus(orderId, 'failed');
        navigation.replace(SCREENS.PAYMENT_FAILED, {
          orderId,
          message: response?.message || t('paymentFailedMessage'),
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      hideLoading();
      showMessage(error?.message || t('paymentFailedMessage'));
      
      // Cập nhật trạng thái thanh toán thất bại
      try {
        await orderApi.updatePaymentStatus(orderId, 'failed');
        navigation.replace(SCREENS.PAYMENT_FAILED, {
          orderId,
          message: error?.message || t('paymentFailedMessage'),
        });
      } catch (updateError) {
        console.error('Update payment status error:', updateError);
      }
    }
  };

  return (
    <>
      <Header title={t('selectPaymentMethod')} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text variant='titleMedium' style={styles.sectionTitle}>
            {t('paymentMethod')}
          </Text>

          {PAYMENT_METHODS.map((method, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedMethod(method.value)}
              style={[
                styles.methodCard,
                (selectedMethod === method.value || 
                 (selectedMethod === null && method.value === null)) && styles.methodCardSelected,
              ]}>
              <View style={styles.methodContent}>
                <View style={styles.methodIcon}>
                  <Text style={styles.iconText}>{method.icon}</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text variant='titleSmall' style={styles.methodLabel}>
                    {t(method.label)}
                  </Text>
                  <Text variant='bodySmall' style={styles.methodDescription}>
                    {t(method.description)}
                  </Text>
                </View>
                <RadioButton
                  size={20}
                  selected={selectedMethod === method.value}
                  color={colors.primary}
                  borderSize={2}
                />
              </View>
            </Pressable>
          ))}

          <View style={styles.infoBox}>
            <Text variant='bodySmall' style={styles.infoText}>
              💡 {t('selectPaymentMethod')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('continue')}
          onPress={handleProceedToPayment}
          disabled={false} // Luôn cho phép tiếp tục, null = hiển thị tất cả
          block
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: colors.primaryText,
  },
  methodCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: colors.primary,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    marginBottom: 4,
    color: colors.primaryText,
  },
  methodDescription: {
    color: colors.secondaryText,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    color: colors.secondaryText,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

