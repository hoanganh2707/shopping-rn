/**
 * Coupon / Voucher API
 * Manages discount coupons stored in Firestore
 */

import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '~/config/firebase';

/**
 * Lấy danh sách coupon còn hiệu lực
 */
const getAvailableCoupons = async () => {
  try {
    const couponsRef = collection(db, 'coupons');
    const now = new Date();
    const snapshot = await getDocs(couponsRef);
    
    const coupons = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const expiryDate = data.expiryDate?.toDate ? data.expiryDate.toDate() : new Date(data.expiryDate);
      if (expiryDate > now && data.isActive !== false) {
        coupons.push({ id: doc.id, ...data });
      }
    });
    
    return { status: 'success', data: coupons };
  } catch (error) {
    console.error('Get coupons error:', error);
    // Return mock coupons for demo
    return {
      status: 'success',
      data: getMockCoupons(),
    };
  }
};

/**
 * Validate coupon code
 */
const validateCoupon = async (code, orderTotal) => {
  try {
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Try mock coupons
      return validateMockCoupon(code, orderTotal);
    }
    
    const couponDoc = snapshot.docs[0];
    const coupon = { id: couponDoc.id, ...couponDoc.data() };
    
    // Check expiry
    const expiryDate = coupon.expiryDate?.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
    if (expiryDate < new Date()) {
      return { status: 'error', message: 'Mã giảm giá đã hết hạn' };
    }
    
    // Check minimum order
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      return { status: 'error', message: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString()}đ` };
    }
    
    return { status: 'success', data: coupon };
  } catch (error) {
    console.error('Validate coupon error:', error);
    return validateMockCoupon(code, orderTotal);
  }
};

// Mock coupons for demo
const getMockCoupons = () => [
  {
    id: '1',
    code: 'WELCOME10',
    discountType: 'percent',
    discountValue: 10,
    maxDiscount: 50000,
    minOrderAmount: 100000,
    description: 'Giảm 10% cho đơn hàng đầu tiên',
    descriptionEn: '10% off your first order',
    expiryDate: '2027-12-31',
    isActive: true,
  },
  {
    id: '2',
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 30000,
    maxDiscount: 30000,
    minOrderAmount: 200000,
    description: 'Miễn phí vận chuyển',
    descriptionEn: 'Free shipping',
    expiryDate: '2027-12-31',
    isActive: true,
  },
  {
    id: '3',
    code: 'SAVE50K',
    discountType: 'fixed',
    discountValue: 50000,
    maxDiscount: 50000,
    minOrderAmount: 500000,
    description: 'Giảm 50.000đ cho đơn từ 500.000đ',
    descriptionEn: '50,000đ off orders over 500,000đ',
    expiryDate: '2027-12-31',
    isActive: true,
  },
];

const validateMockCoupon = (code, orderTotal) => {
  const mockCoupons = getMockCoupons();
  const coupon = mockCoupons.find((c) => c.code === code.toUpperCase());
  
  if (!coupon) {
    return { status: 'error', message: 'Mã giảm giá không hợp lệ' };
  }
  if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
    return {
      status: 'error',
      message: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString()}đ`,
    };
  }
  return { status: 'success', data: coupon };
};

/**
 * Calculate discount amount
 */
const calculateDiscount = (coupon, orderTotal) => {
  if (!coupon) return 0;
  
  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = (orderTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }
  return Math.min(discount, orderTotal);
};

export const couponApi = {
  getAvailableCoupons,
  validateCoupon,
  calculateDiscount,
};
