// ========================================
// EMAIL NOTIFICATION - Render API
// ========================================
// Sử dụng API đã deploy trên Render để gửi email
// ========================================

const EMAIL_API_URL = 'https://sendmail-wewi.onrender.com/api/send-payment-email';

/**
 * Gửi email qua API trên Render
 */
const sendEmailViaAPI = async (toEmail, orderData) => {
  console.log('📧 Sending email via API...');
  console.log('To:', toEmail);
  console.log('Order:', orderData);

  const response = await fetch(EMAIL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: toEmail,
      orderId: orderData.orderId,
      totalAmount: orderData.totalAmount,
      transactionId: orderData.transactionId,
      paymentDate: orderData.paymentDate,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || 'Failed to send email');
  }

  console.log('✅ Email API response:', result);
  return { status: 'success', message: 'Email sent successfully' };
};

/**
 * Gửi email thông báo thanh toán thành công
 * Tương tự EmailHelper.sendOrderConfirmationEmail() trong Java
 */
const sendPaymentSuccessEmail = async (userEmail, orderDetails) => {
  console.log('=== Sending payment success email ===');
  console.log('To:', userEmail);
  console.log('Order:', orderDetails);

  try {
    const result = await sendEmailViaAPI(userEmail, {
      orderId: orderDetails.orderCode || orderDetails.orderId,
      totalAmount: orderDetails.amount?.toLocaleString('vi-VN'),
      transactionId: orderDetails.transactionId,
      paymentDate: new Date(orderDetails.paymentDate).toLocaleString('vi-VN'),
    });

    console.log('✅ Email sent successfully!');
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

/**
 * Gửi email xác nhận đơn hàng
 */
const sendOrderConfirmationEmail = async (userEmail, orderData) => {
  console.log('=== Sending order confirmation email ===');
  console.log('To:', userEmail);
  console.log('Order data:', orderData);

  try {
    const result = await sendEmailViaAPI(userEmail, {
      orderId: orderData.orderCode,
      totalAmount: orderData.totalAmount?.toLocaleString('vi-VN'),
    });

    console.log('✅ Email sent successfully!');
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

export const emailApi = {
  sendPaymentSuccessEmail,
  sendOrderConfirmationEmail,
};
