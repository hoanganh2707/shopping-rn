/**
 * Deep Linking Hook
 * Xử lý deep links từ VNPay và các URL schemes khác
 */

import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';

import { SCREENS } from '~/constants';
import { navigationRef } from '~/navigators/navigationService';
import { parsePaymentReturnUrl } from '~/utils/linkingService';
import {
  checkTransactionStatus,
  getResponseMessage as getVNPayResponseMessage,
} from '~/utils/vnpayUtils';
import { orderApi, emailApi } from '~/apis';
import { showMessage } from '~/utils';
import { store } from '~/redux';
import { cartActions } from '~/redux';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/config';
import { COLLECTIONS } from '~/constants';

// Lưu pending payment info để xử lý khi nhận deep link
let pendingPayment = null;

export const setPendingPayment = (paymentInfo) => {
  pendingPayment = paymentInfo;
};

export const getPendingPayment = () => {
  return pendingPayment;
};

export const clearPendingPayment = () => {
  pendingPayment = null;
};

export const useDeepLinking = () => {
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Xử lý initial URL khi app mở từ deep link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Get initial URL error:', error);
      }
    };

    // Xử lý URL khi app đang chạy
    const handleUrl = (event) => {
      if (event?.url) {
        handleDeepLink(event.url);
      }
    };

    // Lắng nghe deep link events
    const subscription = Linking.addEventListener('url', handleUrl);

    handleInitialURL();

    return () => {
      // Remove listener
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  const handleDeepLink = async (url) => {
    if (isProcessingRef.current) {
      console.log('Already processing a deep link, skipping...');
      return; // Tránh xử lý trùng lặp
    }

    try {
      console.log('=== Deep link received ===');
      console.log('URL:', url);

      // Kiểm tra xem có phải payment return URL không
      // Hỗ trợ cả vnpay://return và shopping-app://payment/return
      const isPaymentReturn = 
        url.includes('/payment/return') ||
        url.includes('vnp_ResponseCode') ||
        url.includes('vnpay://return') ||
        url.includes('vnpay://') ||
        url.startsWith('vnpay:');

      console.log('Is payment return URL:', isPaymentReturn);

      if (isPaymentReturn) {
        isProcessingRef.current = true;
        console.log('Processing payment return...');
        await handlePaymentReturn(url);
        isProcessingRef.current = false;
        console.log('Payment return processed successfully');
      } else {
        console.log('Not a payment return URL, ignoring');
      }
    } catch (error) {
      console.error('Deep link error:', error);
      isProcessingRef.current = false;
    }
  };

  const handlePaymentReturn = async (url) => {
    try {
      console.log('=== Handling payment return ===');
      console.log('Raw URL:', url);
      
      // Parse URL từ VNPay
      const parsedData = parsePaymentReturnUrl(url);
      console.log('Parsed data:', JSON.stringify(parsedData, null, 2));

      if (!parsedData || !parsedData.vnpParams) {
        console.log('Invalid payment return URL - no parsed data or vnpParams');
        showMessage('URL thanh toán không hợp lệ');
        return;
      }

      const { orderId, vnpParams } = parsedData;
      const responseCode = vnpParams.vnp_ResponseCode;

      console.log('Payment return details:', { 
        orderId, 
        responseCode,
        transactionNo: vnpParams.vnp_TransactionNo,
        amount: vnpParams.vnp_Amount 
      });

      // Kiểm tra transaction status
      const transactionStatus = checkTransactionStatus(vnpParams);

      // Verify signature (nếu có backend)
      // Trong mock mode, bỏ qua verify
      const isValidSignature = true; // TODO: verify với backend

      if (!isValidSignature && responseCode !== '00') {
        console.log('Invalid signature');
        // Vẫn xử lý responseCode để biết kết quả
      }

      // Lấy orderId từ pendingPayment hoặc từ URL
      const finalOrderId = orderId || pendingPayment?.orderId;

      if (!finalOrderId) {
        console.error('No orderId found');
        showMessage('Không tìm thấy mã đơn hàng');
        return;
      }

      // Xử lý kết quả
      if (transactionStatus.success && responseCode === '00') {
        console.log('Payment successful! Processing...');
        
        // Thanh toán thành công
        const paymentDetails = {
          transactionId: vnpParams.vnp_TransactionNo || `TXN_${Date.now()}`,
          paymentDate: new Date(),
          bankCode: vnpParams.vnp_BankCode || null,
          cardType: vnpParams.vnp_CardType || null,
          amount: vnpParams.vnp_Amount
            ? parseInt(vnpParams.vnp_Amount) / 100
            : null,
        };

        // Cập nhật trạng thái thanh toán
        await orderApi.updatePaymentStatus(finalOrderId, 'paid', paymentDetails);
        console.log('Payment status updated successfully');

        // Lấy thông tin user để gửi email
        try {
          const userState = store.getState();
          const currentUser = userState.auth?.user;
          
          if (currentUser?.email) {
            console.log('Sending payment success email to:', currentUser.email);
            
            // Gửi email thông báo thanh toán thành công
            await emailApi.sendPaymentSuccessEmail(currentUser.email, {
              orderId: finalOrderId,
              orderCode: pendingPayment?.orderCode || finalOrderId,
              amount: paymentDetails.amount,
              transactionId: paymentDetails.transactionId,
              paymentDate: paymentDetails.paymentDate,
            });
            
            console.log('Payment success email sent!');
          } else {
            console.log('User email not found, skipping email notification');
          }
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Continue anyway, email is not critical
        }

        // Xóa giỏ hàng nếu có
        if (pendingPayment?.cartData) {
          store.dispatch(cartActions.removeAll());
          console.log('Cart cleared');
        }

        // Hiển thị thông báo thành công
        showMessage('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.', 'success');

        // Chuyển đến màn hình thành công
        if (navigationRef.isReady()) {
          navigationRef.navigate(SCREENS.PAYMENT_SUCCESS, {
            orderId: finalOrderId,
            orderCode: pendingPayment?.orderCode,
            transactionNo: paymentDetails.transactionId,
          });
        }
        
        console.log('Navigation to success screen completed');
      } else {
        // Thanh toán thất bại
        await orderApi.updatePaymentStatus(finalOrderId, 'failed');

        const message =
          getVNPayResponseMessage(responseCode) || 'Thanh toán thất bại';

        if (navigationRef.isReady()) {
          navigationRef.navigate(SCREENS.PAYMENT_FAILED, {
            orderId: finalOrderId,
            message,
          });
        }
      }

      // Clear pending payment
      clearPendingPayment();
    } catch (error) {
      console.error('Handle payment return error:', error);
      showMessage('Có lỗi xảy ra khi xử lý thanh toán');

      // Clear pending payment
      clearPendingPayment();
    }
  };
};

