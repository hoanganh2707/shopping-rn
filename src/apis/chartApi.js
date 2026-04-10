import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from '~/config';
import { COLLECTIONS } from '~/constants';

/**
 * Truyền 2 tham số với kiểu Timestamp của firebase
 * @param start Timestamp
 * @param end Timestamp
 */
const getListOrderByDateRange = async (start, end) => {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const q = query(
      ordersRef,
      where('createdAt', '>=', start),
      where('createdAt', '<', end),
    );

    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map((doc) => doc.data());

    // Lấy danh sách Sản Phẩm không trùng lặp
    const productIds = [];
    documents?.forEach((element) => {
      element?.items?.forEach((item) => {
        if (!productIds.find((e) => e === item.id)) {
          productIds.push(item.id);
        }
      });
    });

    const productPromises = productIds.map((productId) =>
      getDoc(doc(db, COLLECTIONS.PRODUCTS, productId)),
    );

    const productDocs = await Promise.all(productPromises);

    // Lấy ra danh sách Sản Phẩm theo dạng key values
    const products = productDocs.reduce((accumulator, currentDoc) => {
      accumulator[currentDoc.id] = currentDoc.data();
      return accumulator;
    }, {});

    // Lấy ra danh sách đơn hàng với thông tin Sản Phẩm
    const newData = documents.map((element) => {
      const items = element.items.map((item) => {
        return {
          ...item,
          product: products[item.id],
        };
      });
      return { ...element, items: items };
    });

    return {
      status: 'success',
      data: newData,
    };
  } catch (error) {
    console.log(error);
  }
};
export const chartApi = {
  getListOrderByDateRange,
};
