import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { orderApi, emailApi } from '~/apis';
import { Header, Text } from '~/components';
import { SCREENS } from '~/constants';
import { cartActions, store } from '~/redux';
import { colors } from '~/styles';
import { showMessage } from '~/utils';

export const VNPayWebView = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const webViewRef = useRef(null);

  const { params } = route;
  const { paymentUrl, orderId, orderCode, totalAmount, cartData } = params || {};

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // JavaScript inject vào WebView để detect redirect
  const injectedJavaScript = `
    (function() {
      // Override window.location để detect redirect
      var originalLocation = window.location;
      
      // Check for vnpay:// redirect mỗi 500ms
      setInterval(function() {
        try {
          var currentUrl = window.location.href;
          
          // Gửi URL về React Native
          if (currentUrl && (currentUrl.includes('vnpay://') || currentUrl.includes('vnp_ResponseCode'))) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_RETURN',
              url: currentUrl
            }));
          }
        } catch (e) {
          // Ignore errors
        }
      }, 500);

      // Intercept clicks that might trigger vnpay:// redirect
      document.addEventListener('click', function(e) {
        setTimeout(function() {
          try {
            var url = window.location.href;
            if (url.startsWith('vnpay://')) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_RETURN',
                url: url
              }));
            }
          } catch (err) {}
        }, 100);
      }, true);
    })();
    true;
  `;

  // Xử lý khi WebView sắp load một URL mới
  const handleShouldStartLoadWithRequest = (request) => {
    const { url } = request;
    console.log('WebView attempting to load URL:', url);

    // Detect payment return URL (HTTP hoặc vnpay://)
    const isPaymentReturn = 
      url.includes('localhost/vnpay_return') || 
      url.includes('vnp_ResponseCode') ||
      url.startsWith('vnpay://');

    if (isPaymentReturn) {
      console.log('Intercepted payment return URL:', url);
      handlePaymentReturn(url);
      return false; // Prevent WebView from loading this URL
    }

    // Cho phép load các URL khác
    return true;
  };

  // Xử lý payment return
  const handlePaymentReturn = async (url) => {
    console.log('Payment return detected!');
    console.log('Return URL:', url);
    
    if (processing) {
      console.log('Already processing, skipping...');
      return;
    }
    
    setProcessing(true);

    try {
      // Parse URL để lấy parameters - handle cả HTTP và vnpay:// scheme
      let urlToParse = url;
      if (url.startsWith('vnpay://')) {
        urlToParse = url.replace('vnpay://', 'https://dummy.com/');
      }
      
      const urlObj = new URL(urlToParse);
      const vnp_ResponseCode = urlObj.searchParams.get('vnp_ResponseCode');
      const vnp_TransactionNo = urlObj.searchParams.get('vnp_TransactionNo');
      const vnp_Amount = urlObj.searchParams.get('vnp_Amount');
      const vnp_BankCode = urlObj.searchParams.get('vnp_BankCode');

      console.log('Parsed payment params:');
      console.log('- ResponseCode:', vnp_ResponseCode);
      console.log('- TransactionNo:', vnp_TransactionNo);
      console.log('- Amount:', vnp_Amount);
      console.log('- BankCode:', vnp_BankCode);

      if (vnp_ResponseCode === '00') {
        // Thanh toán thành công
        console.log('Payment successful!');

        const paymentDetails = {
          transactionId: vnp_TransactionNo || `TXN_${Date.now()}`,
          paymentDate: new Date(),
          bankCode: vnp_BankCode || null,
          amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : totalAmount,
        };

        // Cập nhật trạng thái thanh toán
        await orderApi.updatePaymentStatus(orderId, 'paid', paymentDetails);
        console.log('Payment status updated to paid');

        // Gửi email thông báo
        try {
          const userState = store.getState();
          const currentUser = userState.auth?.user;

          if (currentUser?.email) {
            console.log('Sending payment success email...');
            await emailApi.sendPaymentSuccessEmail(currentUser.email, {
              orderId,
              orderCode,
              amount: paymentDetails.amount,
              transactionId: paymentDetails.transactionId,
              paymentDate: paymentDetails.paymentDate,
            });
          }
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }

        // Xóa giỏ hàng
        if (cartData && cartData.length > 0) {
          dispatch(cartActions.removeAll());
          console.log('Cart cleared');
        }

        // Hiển thị thông báo
        showMessage('Thanh toán thành công!', 'success');

        // Navigate to success screen
        navigation.replace(SCREENS.PAYMENT_SUCCESS, {
          orderId,
          orderCode,
          transactionNo: paymentDetails.transactionId,
        });
      } else {
        // Thanh toán thất bại
        console.log('Payment failed with code:', vnp_ResponseCode);

        await orderApi.updatePaymentStatus(orderId, 'failed');

        const errorMessages = {
          '24': 'Khách hàng hủy giao dịch',
          '11': 'Đã hết hạn chờ thanh toán',
          '12': 'Thẻ/Tài khoản bị khóa',
          '13': 'Sai mật khẩu OTP',
          '51': 'Tài khoản không đủ số dư',
          '65': 'Vượt quá hạn mức giao dịch',
        };

        const errorMessage = errorMessages[vnp_ResponseCode] || 'Thanh toán thất bại';

        showMessage(errorMessage, 'error');

        navigation.replace(SCREENS.PAYMENT_FAILED, {
          orderId,
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error('Process payment return error:', error);
      showMessage('Có lỗi xảy ra khi xử lý thanh toán', 'error');

      navigation.replace(SCREENS.PAYMENT_FAILED, {
        orderId,
        message: 'Có lỗi xảy ra khi xử lý thanh toán',
      });
    }
  };

  // Xử lý messages từ injected JavaScript
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Received message from WebView:', data);

      if (data.type === 'PAYMENT_RETURN' && data.url) {
        console.log('Payment return URL from injected JS:', data.url);
        handlePaymentReturn(data.url);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    // Nếu error là do vnpay:// URL, xử lý nó
    if (nativeEvent.description && nativeEvent.description.includes('vnpay://')) {
      const urlMatch = nativeEvent.description.match(/vnpay:\/\/[^\s]+/);
      if (urlMatch) {
        console.log('Extracted vnpay URL from error:', urlMatch[0]);
        handlePaymentReturn(urlMatch[0]);
        return;
      }
    }
    
    showMessage('Không thể tải trang thanh toán', 'error');
  };

  if (!paymentUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không tìm thấy URL thanh toán</Text>
      </View>
    );
  }

  return (
    <>
      <Header 
        title="Thanh toán VNPay" 
        onBack={() => {
          navigation.goBack();
        }}
      />
      <View style={styles.container}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={handleError}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="always"
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
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 16,
    color: colors.secondaryText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
