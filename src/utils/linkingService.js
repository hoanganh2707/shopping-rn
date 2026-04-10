/**
 * Deep Linking Service
 * Xử lý deep links từ VNPay return URL
 */

import { Linking } from 'react-native';

// App scheme - cần khớp với app.json
export const APP_SCHEME = 'shopping-app';

/**
 * Tạo deep link URL cho payment return
 * @param {string} orderId - ID đơn hàng
 * @returns {string} Deep link URL
 */
export const createPaymentReturnUrl = (orderId) => {
  return `${APP_SCHEME}://payment/return?orderId=${orderId}`;
};

/**
 * Parse payment return URL từ VNPay
 * Xử lý cả HTTP URL và deep link URL
 * @param {string} url - URL từ VNPay return (HTTP hoặc deep link)
 * @returns {Object} Parsed params
 */
export const parsePaymentReturnUrl = (url) => {
  try {
    // Parse URL (có thể là HTTP URL hoặc deep link)
    let queryParams = {};
    
    if (url.includes('://')) {
      // Deep link hoặc HTTP URL
      // Parse URL manually vì React Native Linking không có parse()
      const urlParts = url.split('?');
      if (urlParts.length > 1) {
        const paramsString = urlParts[1];
        const params = new URLSearchParams(paramsString);
        params.forEach((value, key) => {
          queryParams[key] = decodeURIComponent(value);
        });
      }
    } else {
      // Nếu không có scheme, giả sử là query string
      const urlObj = new URL(url, 'http://localhost');
      urlObj.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
    }

    // Extract VNPay params từ URL
    const vnpParams = {};
    
    // Lấy tất cả params có prefix vnp_
    Object.keys(queryParams).forEach((key) => {
      if (key.startsWith('vnp_')) {
        vnpParams[key] = decodeURIComponent(queryParams[key] || '');
      }
    });

    return {
      orderId: queryParams.orderId || null,
      vnpParams,
      success: vnpParams.vnp_ResponseCode === '00',
    };
  } catch (error) {
    console.error('Parse payment return URL error:', error);
    // Thử parse như query string đơn giản
    try {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const vnpParams = {};
      urlParams.forEach((value, key) => {
        if (key.startsWith('vnp_')) {
          vnpParams[key] = value;
        }
      });
      
      return {
        orderId: urlParams.get('orderId') || null,
        vnpParams,
        success: vnpParams.vnp_ResponseCode === '00',
      };
    } catch (e) {
      console.error('Fallback parse error:', e);
      return null;
    }
  }
};

/**
 * Tạo return URL cho backend VNPay config
 * Backend sẽ redirect về URL này sau khi thanh toán
 * @param {string} orderId - ID đơn hàng
 * @returns {string} Return URL
 */
export const getPaymentReturnUrl = (orderId) => {
  // Return URL cho VNPay - sử dụng config từ vnpayUtils
  // Config hiện tại: 'vnpay://return'
  // VNPay sẽ redirect về URL này với các params: vnp_ResponseCode, vnp_TransactionNo, etc.
  // Format: vnpay://return?orderId=xxx&vnp_ResponseCode=00&...
  
  // Dùng config từ vnpayUtils (null = sẽ dùng VNPAY_CONFIG.vnp_ReturnUrl)
  return null; // Sẽ dùng VNPAY_CONFIG.vnp_ReturnUrl từ vnpayUtils
  
  // Hoặc có thể override:
  // return 'vnpay://return';
};

