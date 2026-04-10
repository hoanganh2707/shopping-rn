import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { orderApi } from '~/apis';
import { Button, Header, Text } from '~/components';
import { SCREENS } from '~/constants';
import { colors } from '~/styles';
import { showMessage } from '~/utils';

export const PaymentPending = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { params } = route;
  const { orderId, orderCode } = params || {};
  
  const [checking, setChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Auto check payment status sau 3s
    const timer = setTimeout(() => {
      checkPaymentStatus();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const checkPaymentStatus = async () => {
    if (!orderId) {
      showMessage('Không tìm thấy mã đơn hàng', 'error');
      return;
    }

    setChecking(true);

    try {
      // Lấy thông tin order từ Firestore
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('~/config');
      const { COLLECTIONS } = await import('~/constants');
      
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        throw new Error('Không tìm thấy đơn hàng');
      }

      const orderData = orderSnap.data();
      const paymentStatus = orderData.paymentStatus;

      console.log('Payment status check:', paymentStatus);

      if (paymentStatus === 'paid') {
        // Thanh toán thành công
        showMessage('Thanh toán thành công!', 'success');
        navigation.replace(SCREENS.PAYMENT_SUCCESS, {
          orderId,
          orderCode,
        });
      } else if (paymentStatus === 'failed') {
        // Thanh toán thất bại
        showMessage('Thanh toán thất bại', 'error');
        navigation.replace(SCREENS.PAYMENT_FAILED, {
          orderId,
          message: 'Thanh toán thất bại',
        });
      } else {
        // Vẫn pending, cho phép retry
        setRetryCount(prev => prev + 1);
        showMessage('Đơn hàng đang chờ xử lý. Vui lòng kiểm tra lại.', 'info');
      }
    } catch (error) {
      console.error('Check payment status error:', error);
      showMessage('Không thể kiểm tra trạng thái thanh toán', 'error');
    } finally {
      setChecking(false);
    }
  };

  const handleBackToOrders = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MyTabs', params: { screen: SCREENS.ACCOUNT } }],
    });
    
    setTimeout(() => {
      navigation.navigate(SCREENS.ORDER_MANAGEMENT);
    }, 500);
  };

  return (
    <>
      <Header title="Đang xử lý thanh toán" />
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          
          <Text variant='titleLarge' style={styles.title}>
            Đang kiểm tra trạng thái thanh toán
          </Text>

          <Text variant='bodyMedium' style={styles.message}>
            Vui lòng đợi trong giây lát...
          </Text>

          {orderCode && (
            <View style={styles.infoContainer}>
              <Text variant='bodySmall' style={styles.infoLabel}>
                Mã đơn hàng:
              </Text>
              <Text variant='bodyMedium' style={styles.infoValue}>
                {orderCode}
              </Text>
            </View>
          )}

          {retryCount > 0 && (
            <Text variant='bodySmall' style={styles.retryText}>
              Đã kiểm tra {retryCount} lần
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            title="Kiểm tra lại"
            onPress={checkPaymentStatus}
            disabled={checking}
            style={styles.button}
            block
          />
          <View style={styles.spacer} />
          <Button
            title="Xem đơn hàng"
            onPress={handleBackToOrders}
            variant='outline'
            style={styles.button}
            block
          />
        </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginTop: 24,
    marginBottom: 12,
    color: colors.primaryText,
    textAlign: 'center',
  },
  message: {
    marginBottom: 32,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoLabel: {
    marginBottom: 4,
    color: colors.secondaryText,
  },
  infoValue: {
    color: colors.primaryText,
    fontWeight: 'bold',
  },
  retryText: {
    marginTop: 16,
    color: colors.secondaryText,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    marginBottom: 0,
  },
  spacer: {
    height: 12,
  },
});
