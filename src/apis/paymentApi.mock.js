/**
 * MOCK Payment API
 * Dùng khi không có backend
 * Sử dụng VNPay Utils theo đúng hướng dẫn
 */

import { createPaymentUrl } from '~/utils/vnpayUtils';
import { getPaymentReturnUrl } from '~/utils/linkingService';

/**
 * Tạo mock VNPay payment URL
 * Sử dụng utils theo đúng format VNPay
 * ⚠️ CHỈ DÙNG CHO TEST - KHÔNG THỰC SỰ THANH TOÁN (vì dùng mock secret)
 */
const createMockVNPayPaymentUrl = (orderCode, amount, bankCode = null) => {
  // ⚠️ LƯU Ý: Mock URL này dùng MOCK_SECRET → sẽ không verify được với VNPay thật
  // Chỉ dùng để test flow, không mở browser thật
  
  // Tạo return URL với deep link
  const returnUrl = getPaymentReturnUrl(orderCode);
  
  const orderData = {
    orderCode: orderCode || `ORD${Date.now()}`,
    amount: amount || 0,
    orderInfo: `Thanh toan don hang ${orderCode}`,
    ipAddr: '127.0.0.1',
    locale: 'vn',
    bankCode: bankCode, // Sẽ được validate trong createPaymentUrl
    returnUrl: returnUrl, // Deep link return URL
  };

  // Sử dụng utils theo đúng hướng dẫn VNPay
  // Sử dụng hashSecret từ config (đã được user cập nhật với secret thật)
  const paymentUrl = createPaymentUrl(orderData);

  return paymentUrl;
};

/**
 * Mock: Tạo URL thanh toán VNPay
 * Theo đúng hướng dẫn VNPay Integration Guide
 * 
 * @param {string} orderId - ID đơn hàng
 * @param {number} totalAmount - Tổng tiền (VND)
 * @param {string|null} bankCode - Mã ngân hàng (optional). 
 *                                  CHỈ gửi nếu là bank code hợp lệ (NCB, VCB, etc.)
 *                                  KHÔNG gửi payment methods (VNPAYQR, VNBANK, INTCARD)
 * @param {string} orderCode - Mã đơn hàng (optional, default: orderId)
 */
export const createVNPayPayment = async (
  orderId,
  totalAmount,
  bankCode = null,
  orderCode = null
) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Validate và sử dụng orderCode
  const finalOrderCode = orderCode || orderId;
  const finalAmount = totalAmount || 0;

  // Tạo payment URL theo đúng format VNPay
  const paymentUrl = createMockVNPayPaymentUrl(finalOrderCode, finalAmount, bankCode);

  return {
    status: 'success',
    message: 'Payment URL created successfully',
    data: {
      paymentUrl,
    },
  };
};

/**
 * Mock: Kiểm tra trạng thái thanh toán
 */
export const checkPaymentStatus = async (orderId) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    status: 'success',
    data: {
      orderId,
      paymentStatus: 'unpaid', // Mock status
    },
  };
};

export const paymentApiMock = {
  createVNPayPayment,
  checkPaymentStatus,
};

