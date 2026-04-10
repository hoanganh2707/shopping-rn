import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { orderApi, paymentApi } from '~/apis';
import { Button, Header, Text } from '~/components';
import { SCREENS } from '~/constants';
import { useLoading } from '~/hooks';
import { cartActions } from '~/redux';
import { colors } from '~/styles';
import { showMessage } from '~/utils';
import {
  checkTransactionStatus,
  getResponseMessage as getVNPayResponseMessage,
  verifyReturnUrl,
} from '~/utils/vnpayUtils';

const USE_MOCK = true; // ⚠️ Dùng để test khi không có backend

// Close WebBrowser when component unmounts
WebBrowser.maybeCompleteAuthSession();

export const VNPayPayment = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { showLoading, hideLoading } = useLoading();
  const dispatch = useDispatch();

  const { params } = route;
  const { paymentUrl, orderId, totalAmount, cartData } = params;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleOpenPayment();
  }, []);

  const handleOpenPayment = async () => {
    // Nếu dùng mock, không mở browser thật (vì URL mock sẽ lỗi)
    if (USE_MOCK) {
      setLoading(false);
      hideLoading();
      return; // Hiển thị mock buttons
    }

    try {
      setLoading(true);
      showLoading();

      // Mở browser để thanh toán (chỉ khi không dùng mock)
      const result = await WebBrowser.openBrowserAsync(paymentUrl, {
        // iOS options
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        // Android options
        showTitle: true,
        enableBarCollapsing: false,
        // Universal options
        createTask: false,
      });

      // ⚠️ QUAN TRỌNG: Xử lý kết quả từ WebBrowser
      console.log('WebBrowser result type:', result.type);
      console.log('WebBrowser result URL:', result.url);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        // User đóng browser hoặc browser dismissed → HỦY THANH TOÁN (KHÔNG phải success)
        console.log('User canceled payment');
        await handlePaymentCanceled();
      } else if (result.type === 'opened') {
        // Browser đã mở, nhưng chưa có kết quả
        // Nếu có URL return thì xử lý, nếu không → canceled
        const url = result.url || '';
        if (url && (url.includes('vnp_ResponseCode') || url.includes('payment/return'))) {
          await handlePaymentReturn(url);
        } else {
          // Không có URL hợp lệ → user có thể đã đóng browser → HỦY
          console.log('Browser opened but no valid return URL - canceled');
          await handlePaymentCanceled();
        }
      } else {
        // Các trường hợp khác: kiểm tra URL
        const url = result.url || '';
        if (url && (url.includes('vnp_ResponseCode') || url.includes('payment/return'))) {
          await handlePaymentReturn(url);
        } else {
          // Không có URL hợp lệ → HỦY thanh toán (KHÔNG phải success)
          console.log('No valid return URL - payment canceled');
          await handlePaymentCanceled();
        }
      }
    } catch (error) {
      console.error('Open browser error:', error);
      hideLoading();
      await handlePaymentError(t('paymentFailedMessage'));
    } finally {
      setLoading(false);
      if (!USE_MOCK) {
        hideLoading();
      }
    }
  };

  const handlePaymentReturn = async (url) => {
    // ⚠️ QUAN TRỌNG: Xử lý theo đúng hướng dẫn VNPay
    
    // Nếu không có URL hoặc URL không hợp lệ → thanh toán KHÔNG thành công
    if (!url) {
      console.log('No return URL - payment canceled/failed');
      await handlePaymentCanceled();
      return;
    }

    // Kiểm tra xem có phải URL return từ VNPay không
    // VNPay return URL thường chứa vnp_ResponseCode
    if (!url.includes('vnp_ResponseCode') && !url.includes('payment/return')) {
      console.log('Invalid return URL format - payment canceled/failed');
      await handlePaymentCanceled();
      return;
    }

    try {
      // Parse URL
      const urlParts = url.split('?');
      if (urlParts.length < 2) {
        console.log('URL has no query params - payment failed');
        await handlePaymentFailed(orderId, '99');
        return;
      }

      // Extract params từ URL
      const urlParamsString = urlParts[1];
      const urlParams = {};
      urlParamsString.split('&').forEach((param) => {
        const [key, value] = param.split('=');
        urlParams[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });

      // ⚠️ QUAN TRỌNG: Verify signature (theo hướng dẫn VNPay)
      // Trong mock mode, bỏ qua verify vì không có hash secret thật
      // Trong production, backend sẽ verify signature
      const isValidSignature = USE_MOCK
        ? true // Bỏ qua verify trong mock mode
        : verifyReturnUrl(urlParams, null); // null = dùng default config

      if (!isValidSignature && !USE_MOCK) {
        console.log('Invalid signature - payment failed');
        await handlePaymentFailed(orderId, '99');
        return;
      }

      // ⚠️ QUAN TRỌNG: Kiểm tra response code
      const responseCode = urlParams['vnp_ResponseCode'];
      if (!responseCode) {
        // Không có response code → LỖI, không phải success
        console.log('No response code in URL - payment failed');
        await handlePaymentFailed(orderId, '99');
        return;
      }

      console.log('VNPay Response Code:', responseCode);

      // ⚠️ Sử dụng checkTransactionStatus theo hướng dẫn
      const transactionStatus = checkTransactionStatus(urlParams);

      // ⚠️ CHỈ THÀNH CÔNG KHI responseCode === '00'
      if (transactionStatus.success && responseCode === '00') {
        // Thanh toán thành công - CHỈ KHI responseCode = '00'
        await handlePaymentSuccess(orderId, urlParams);
      } else {
        // Thanh toán thất bại - BẤT KỲ code nào khác '00'
        console.log('Payment failed:', transactionStatus.message);
        await handlePaymentFailed(orderId, responseCode);
      }
    } catch (error) {
      console.error('Payment return error:', error);
      // Lỗi khi parse → thanh toán thất bại
      await handlePaymentError(t('paymentFailedMessage'));
    }
  };

  const handlePaymentCanceled = async () => {
    try {
      showLoading();
      
      // ⚠️ QUAN TRỌNG: Hủy thanh toán → paymentStatus = 'failed' (KHÔNG phải 'paid')
      await orderApi.updatePaymentStatus(orderId, 'failed');
      
      hideLoading();

      // ⚠️ CHUYỂN ĐẾN PAYMENT_FAILED, KHÔNG phải PAYMENT_SUCCESS
      navigation.replace(SCREENS.PAYMENT_FAILED, {
        orderId,
        message: t('paymentCanceled') || 'Thanh toán đã bị hủy',
      });
    } catch (error) {
      console.error('Update canceled status error:', error);
      hideLoading();
      // ⚠️ LUÔN chuyển đến PAYMENT_FAILED khi hủy
      navigation.replace(SCREENS.PAYMENT_FAILED, {
        orderId,
        message: t('paymentCanceled') || 'Thanh toán đã bị hủy',
      });
    }
  };

  const handlePaymentSuccessMock = async (orderId) => {
    // Mock success cho testing khi không có backend
    try {
      showLoading();

      const paymentDetails = {
        transactionId: `MOCK${Date.now()}`,
        paymentDate: new Date(),
        bankCode: null,
        cardType: null,
        amount: totalAmount || 0,
      };

      await orderApi.updatePaymentStatus(orderId, 'paid', paymentDetails);

      if (cartData) {
        dispatch(cartActions.removeAll());
      }

      hideLoading();

      navigation.replace(SCREENS.PAYMENT_SUCCESS, {
        orderId,
        transactionNo: paymentDetails.transactionId,
      });
    } catch (error) {
      console.error('Mock payment success error:', error);
      hideLoading();
      showMessage(t('paymentFailedMessage'));
      navigation.replace(SCREENS.PAYMENT_FAILED, {
        orderId,
        message: t('paymentFailedMessage'),
      });
    }
  };

  const handlePaymentSuccess = async (orderId, urlParams) => {
    try {
      showLoading();

      // Lấy thông tin transaction từ VNPay response
      const transactionNo = urlParams.get('vnp_TransactionNo');
      const bankCode = urlParams.get('vnp_BankCode');
      const cardType = urlParams.get('vnp_CardType');
      const amount = urlParams.get('vnp_Amount');

      const paymentDetails = {
        transactionId: transactionNo,
        paymentDate: new Date(),
        bankCode: bankCode || null,
        cardType: cardType || null,
        amount: amount ? parseInt(amount) / 100 : null, // VNPay trả về amount * 100
      };

      // Cập nhật trạng thái thanh toán trong database
      await orderApi.updatePaymentStatus(orderId, 'paid', paymentDetails);

      // Xóa giỏ hàng
      if (cartData) {
        dispatch(cartActions.removeAll());
      }

      hideLoading();

      // Chuyển đến màn hình thành công
      navigation.replace(SCREENS.PAYMENT_SUCCESS, {
        orderId,
        transactionNo,
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      hideLoading();
      showMessage(t('paymentFailedMessage'));
      navigation.replace(SCREENS.PAYMENT_FAILED, {
        orderId,
        message: t('paymentFailedMessage'),
      });
    }
  };

  const handlePaymentFailed = async (orderId, responseCode) => {
    try {
      showLoading();

      // Cập nhật trạng thái thanh toán thất bại
      await orderApi.updatePaymentStatus(orderId, 'failed');

      hideLoading();

      // Sử dụng hàm từ utils theo đúng hướng dẫn VNPay
      const message = getVNPayResponseMessage(responseCode);
      navigation.replace(SCREENS.PAYMENT_FAILED, {
        orderId,
        message: message || t('paymentFailedMessage'),
      });
    } catch (error) {
      console.error('Update payment failed status error:', error);
      hideLoading();
      navigation.replace(SCREENS.PAYMENT_FAILED, {
        orderId,
        message: t('paymentFailedMessage'),
      });
    }
  };

  const handlePaymentError = async (errorMessage) => {
    try {
      showLoading();
      await orderApi.updatePaymentStatus(orderId, 'failed');
      hideLoading();
      
      navigation.replace(SCREENS.PAYMENT_FAILED, {
        orderId,
        message: errorMessage || t('paymentFailedMessage'),
      });
    } catch (error) {
      console.error('Handle payment error:', error);
      hideLoading();
      navigation.replace(SCREENS.PAYMENT_FAILED, {
        orderId,
        message: errorMessage || t('paymentFailedMessage'),
      });
    }
  };


  const handleGoBack = () => {
    Alert.alert(
      t('cancel'),
      'Bạn có chắc chắn muốn hủy thanh toán?',
      [
        {
          text: t('continue'),
          style: 'cancel',
        },
        {
          text: t('cancel'),
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!paymentUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text>Payment URL is missing</Text>
      </View>
    );
  }

  return (
    <>
      <Header title={t('payWithVNPay')} onBackPress={handleGoBack} />
      <View style={styles.container}>
        {!USE_MOCK && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={colors.primary} />
            <Text style={styles.loadingText}>
              {loading
                ? t('processingPayment')
                : t('redirectingToPayment')}
            </Text>
            <Text style={styles.hintText}>
              {t('paymentMethodQRDesc') || 'Đang mở trình duyệt thanh toán...'}
            </Text>
          </View>
        )}
        
        {USE_MOCK && (
          <View style={styles.mockContainer}>
            <Text variant='titleMedium' style={styles.mockTitle}>
              🧪 Mock Payment (Test Mode)
            </Text>
            <Text style={styles.mockDescription}>
              Bạn đang ở chế độ test. Vì không có backend, bạn có thể test flow thanh toán.
            </Text>
            
            <View style={styles.mockButtons}>
              <Button
                title='✅ Thanh toán thành công (Test)'
                onPress={async () => {
                  showLoading();
                  await handlePaymentSuccessMock(orderId);
                }}
                style={styles.mockButton}
                block
              />
              <View style={styles.spacer} />
              <Button
                title='❌ Thanh toán thất bại (Test)'
                onPress={async () => {
                  showLoading();
                  await handlePaymentFailed(orderId, '99');
                }}
                style={[styles.mockButton, styles.mockButtonFailed]}
                variant='outline'
                block
              />
              <View style={styles.spacer} />
              <Button
                title='🚫 Hủy thanh toán (Test)'
                onPress={async () => {
                  showLoading();
                  await handlePaymentCanceled();
                }}
                style={[styles.mockButton, styles.mockButtonFailed]}
                variant='outline'
                block
              />
            </View>
            
            <Text style={styles.mockNote}>
              💡 Trong production, trình duyệt sẽ mở VNPay payment page
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  hintText: {
    marginTop: 8,
    color: colors.secondaryText,
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  mockContainer: {
    padding: 24,
    alignItems: 'center',
  },
  mockTitle: {
    marginBottom: 12,
    color: colors.primaryText,
    textAlign: 'center',
  },
  mockDescription: {
    marginBottom: 24,
    color: colors.secondaryText,
    textAlign: 'center',
    fontSize: 14,
  },
  mockButtons: {
    width: '100%',
    marginBottom: 16,
  },
  mockButton: {
    marginBottom: 12,
  },
  mockButtonFailed: {
    marginBottom: 0,
  },
  mockNote: {
    marginTop: 16,
    color: colors.secondaryText,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  spacer: {
    height: 8,
  },
});

