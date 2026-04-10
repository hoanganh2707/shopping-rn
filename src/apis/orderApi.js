import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import i18n from 'i18next';
import { pick } from 'lodash';

import { db } from '~/config';
import { COLLECTIONS, ORDER_STATUSES } from '~/constants';

const add = async (userId, data, shippingInfo = null) => {
  try {
    const items = data.map((element) => {
      return pick(element, ['id', 'price', 'priceOld', 'quantity']);
    });

    const totalAmount = items.reduce(
      (accumulator, currentValue) =>
        accumulator + currentValue.price * currentValue.quantity,
      0,
    );

    // Sử dụng shippingInfo nếu có, nếu không thì lấy từ user
    let addressInfo;
    if (shippingInfo) {
      addressInfo = {
        fullname: shippingInfo.fullname,
        address: shippingInfo.address,
        phoneNumber: shippingInfo.phoneNumber,
      };
    } else {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(userRef);
      const user = docSnap.data();
      addressInfo = pick(user, ['fullname', 'address', 'phoneNumber']);
    }

    const orderData = {
      uid: userId,
      items: items,
      status: ORDER_STATUSES.PENDING,
      totalAmount: totalAmount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      address: addressInfo,
    };

    // Thêm note nếu có
    if (shippingInfo?.note) {
      orderData.note = shippingInfo.note;
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), orderData);

    // Generate order code
    const orderCode = `ORD${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    // Add the id field and orderCode
    await updateDoc(docRef, {
      id: docRef.id,
      orderCode,
      paymentStatus: 'unpaid', // unpaid, paid, failed
    });

    return {
      status: 'success',
      data: {
        orderId: docRef.id,
        orderCode,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

/**
 * Cập nhật lại trạng thái đơn hàng với vai trò Admin
 */
const updateStatus = async (docId, status) => {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, docId);

    // Cập nhật field status
    await updateDoc(docRef, {
      status,
    });
    return {
      status: 'success',
      message: i18n.t('successfully'),
    };
  } catch (error) {}
};

/**
 * Cập nhật trạng thái thanh toán
 */
const updatePaymentStatus = async (orderId, paymentStatus, paymentDetails = {}) => {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);

    const updateData = {
      paymentStatus,
      updatedAt: serverTimestamp(),
    };

    if (paymentStatus === 'paid' && paymentDetails) {
      updateData.paymentDetails = paymentDetails;
      // Nếu thanh toán thành công, chuyển đơn hàng sang trạng thái đang giao
      updateData.status = ORDER_STATUSES.DELIVERING;
    }

    await updateDoc(docRef, updateData);

    return {
      status: 'success',
      message: i18n.t('successfully'),
    };
  } catch (error) {
    console.log('Update payment status error:', error);
    return {
      status: 'error',
      message: 'Failed to update payment status',
    };
  }
};

/**
 * Lấy danh sách đơn hàng của user
 */
const getUserOrders = async (userId) => {
  try {
    const { query, getDocs } = await import('firebase/firestore');
    
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const q = query(ordersRef, where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sắp xếp theo thời gian tạo mới nhất
    orders.sort((a, b) => {
      if (b.createdAt && a.createdAt) {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
      return 0;
    });

    return {
      status: 'success',
      data: orders,
    };
  } catch (error) {
    console.log('Get user orders error:', error);
    return {
      status: 'error',
      message: 'Failed to get orders',
      data: [],
    };
  }
};

export const orderApi = {
  add,
  updateStatus,
  updatePaymentStatus,
  getUserOrders,
};
