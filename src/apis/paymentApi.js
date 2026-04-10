import { axiosInstance } from './axiosClient';

// ⚠️ IMPORTANT: Nếu không có backend, sử dụng MOCK API
// Đổi import này để dùng mock:
// import { paymentApiMock as paymentApi } from './paymentApi.mock';

/**
 * Payment API
 * Tích hợp VNPay Payment Gateway
 * 
 * ⚠️ LƯU Ý: Nếu không có backend, hãy dùng paymentApiMock từ paymentApi.mock.js
 */

const USE_MOCK_API = true; // ⚠️ Đổi thành false khi có backend

/**
 * Tạo URL thanh toán VNPay
 * Theo đúng hướng dẫn VNPay Integration Guide
 * 
 * @param {string} orderId - ID đơn hàng
 * @param {number} totalAmount - Tổng tiền (VND)
 * @param {string|null} bankCode - Mã ngân hàng (optional). 
 *                                  Chỉ gửi nếu là mã ngân hàng hợp lệ (NCB, VCB, etc.)
 *                                  KHÔNG gửi payment methods (VNPAYQR, VNBANK, INTCARD) như bankCode
 * @param {string} orderCode - Mã đơn hàng (optional, default: orderId)
 * @returns {Promise} Response chứa paymentUrl
 */
const createVNPayPayment = async (orderId, totalAmount, bankCode = null, orderCode = null) => {
  if (USE_MOCK_API) {
    // Sử dụng mock API nếu không có backend
    const { paymentApiMock } = require('./paymentApi.mock');
    return paymentApiMock.createVNPayPayment(orderId, totalAmount, bankCode, orderCode);
  }

  const payload = { orderId };
  
  // Chỉ thêm bankCode nếu nó là mã ngân hàng hợp lệ (không phải payment method)
  const validBankCodes = [
    'NCB', 'VCB', 'TCB', 'VTB', 'DAB', 'MB', 'VPB', 'MSB',
    'HDB', 'OCB', 'TPB', 'STB', 'ACB', 'EIB', 'VIB', 'SHB',
    'SCB', 'BID', 'SEAB', 'PGB', 'GPB', 'AGB', 'BAB', 'NAB',
    'OJB', 'PUB', 'VAB', 'BVB', 'SGB', 'IVB', 'KLB', 'LPB',
    'VCCB', 'VDB', 'EXIMBANK', 'MBB', 'VIETBANK',
    'BAOVIETBANK', 'PVCOMBANK'
  ];
  
  if (bankCode && validBankCodes.includes(bankCode.toUpperCase())) {
    payload.bankCode = bankCode;
  }
  
  return axiosInstance.post('/payments/vnpay/create', payload);
};

/**
 * Kiểm tra trạng thái thanh toán
 * @param {string} orderId - ID đơn hàng
 * @returns {Promise} Response chứa payment status
 */
const checkPaymentStatus = async (orderId) => {
  if (USE_MOCK_API) {
    const { paymentApiMock } = require('./paymentApi.mock');
    return paymentApiMock.checkPaymentStatus(orderId);
  }

  return axiosInstance.get(`/payments/status/${orderId}`);
};

export const paymentApi = {
  createVNPayPayment,
  checkPaymentStatus,
};

