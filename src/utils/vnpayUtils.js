/**
 * VNPay Utilities
 * Theo đúng hướng dẫn từ VNPAY_INTEGRATION_GUIDE.md
 * 
 * ⚠️ LƯU Ý: Đây là React Native, một số hàm sẽ cần điều chỉnh
 */

import CryptoJS from 'crypto-js';
import moment from 'moment';

// ⚠️ Mock config - Trong production cần lấy từ backend hoặc env
const VNPAY_CONFIG = {
  vnp_TmnCode: '9CCYIHDA', // Trong production: lấy từ backend
  vnp_HashSecret: 'H014UNCKCUVP0VXFEMVM8UC6NA9CE484', // Trong production: KHÔNG lưu trong frontend
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: 'https://localhost/vnpay_return', // HTTP URL - WebView sẽ intercept
  vnp_ApiUrl: 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
};

/**r
 * Sort object keys theo alphabet
 * Theo đúng hướng dẫn VNPay
 */
export const sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  
  str.sort();
  
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  
  return sorted;
};

/**
 * Tạo VNPay Payment URL
 * Theo đúng format từ hướng dẫn
 * 
 * @param {Object} orderData - Thông tin đơn hàng
 * @param {string} orderData.orderCode - Mã đơn hàng (vnp_TxnRef)
 * @param {number} orderData.amount - Số tiền (VND)
 * @param {string} orderData.orderInfo - Thông tin đơn hàng
 * @param {string} orderData.ipAddr - IP address
 * @param {string} orderData.locale - Locale (vn/en)
 * @param {string|null} orderData.bankCode - Mã ngân hàng (optional, chỉ nếu là bank code hợp lệ)
 * @param {string} hashSecret - Hash secret từ backend (nếu có)
 * @returns {string} Payment URL
 */
export const createPaymentUrl = (orderData, hashSecret = null) => {
  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const orderId = orderData.orderCode || moment(date).format('DDHHmmss');

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = orderData.tmnCode || VNPAY_CONFIG.vnp_TmnCode;
  vnp_Params['vnp_Locale'] = orderData.locale || 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderData.orderInfo || 'Thanh toan don hang';
  vnp_Params['vnp_OrderType'] = 'billpayment';
  vnp_Params['vnp_Amount'] = (orderData.amount || 0) * 100; // VNPay requires amount in smallest currency unit
  vnp_Params['vnp_ReturnUrl'] = orderData.returnUrl || VNPAY_CONFIG.vnp_ReturnUrl;
  vnp_Params['vnp_IpAddr'] = orderData.ipAddr || '127.0.0.1';
  vnp_Params['vnp_CreateDate'] = createDate;

  // ⚠️ IMPORTANT: Only add bankCode if it's a valid bank code
  // Payment methods (VNPAYQR, VNBANK, INTCARD) should NOT be sent as bankCode
  if (orderData.bankCode && orderData.bankCode.trim() !== '') {
    const bankCode = orderData.bankCode.trim();
    const paymentMethods = ['VNPAYQR', 'VNBANK', 'INTCARD'];
    
    if (!paymentMethods.includes(bankCode.toUpperCase())) {
      vnp_Params['vnp_BankCode'] = bankCode;
      console.log('Adding bankCode to VNPay params:', bankCode);
    } else {
      console.log(
        'Skipping bankCode - this is a payment method, not a bank code:',
        bankCode
      );
    }
  } else {
    console.log('No bankCode provided - VNPay will show payment method selection');
  }

  // Sort params and create signature
  vnp_Params = sortObject(vnp_Params);
  
  // Create query string (không encode)
  const signData = Object.keys(vnp_Params)
    .map((key) => `${key}=${vnp_Params[key]}`)
    .join('&');

  // Create HMAC SHA512 signature
  const secret = hashSecret || VNPAY_CONFIG.vnp_HashSecret;
  const hmac = CryptoJS.HmacSHA512(signData, secret);
  const signed = hmac.toString(CryptoJS.enc.Hex);
  
  vnp_Params['vnp_SecureHash'] = signed;

  // Build final URL
  const queryString = Object.keys(vnp_Params)
    .map((key) => `${key}=${vnp_Params[key]}`)
    .join('&');

  const baseUrl = orderData.baseUrl || VNPAY_CONFIG.vnp_Url;
  const paymentUrl = `${baseUrl}?${queryString}`;

  return paymentUrl;
};

/**
 * Verify VNPay Return URL signature
 * Theo đúng hướng dẫn VNPay
 * 
 * @param {Object} vnpParams - Parameters từ VNPay return URL
 * @param {string} hashSecret - Hash secret để verify
 * @returns {boolean} True nếu signature hợp lệ
 */
export const verifyReturnUrl = (vnpParams, hashSecret = null) => {
  const secureHash = vnpParams['vnp_SecureHash'];
  const secureHashType = vnpParams['vnp_SecureHashType'];

  // Tạo bản copy và xóa hash fields
  const params = { ...vnpParams };
  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];

  // Sort params
  const sortedParams = sortObject(params);

  // Create query string
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');

  // Create HMAC SHA512
  const secret = hashSecret || VNPAY_CONFIG.vnp_HashSecret;
  const hmac = CryptoJS.HmacSHA512(signData, secret);
  const signed = hmac.toString(CryptoJS.enc.Hex);

  return secureHash === signed;
};

/**
 * Get response message từ VNPay response code
 * 
 * @param {string} code - VNPay response code
 * @returns {string} Message tương ứng
 */
export const getResponseMessage = (code) => {
  const messages = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
    '99': 'Các lỗi khác',
  };

  return messages[code] || 'Lỗi không xác định';
};

/**
 * Check transaction status from VNPay response
 * 
 * @param {Object} vnpParams - Parameters từ VNPay return URL
 * @returns {Object} { success: boolean, message: string }
 */
export const checkTransactionStatus = (vnpParams) => {
  const responseCode = vnpParams['vnp_ResponseCode'];

  if (responseCode === '00') {
    return {
      success: true,
      message: 'Giao dịch thành công',
    };
  } else {
    return {
      success: false,
      message: getResponseMessage(responseCode),
    };
  }
};

