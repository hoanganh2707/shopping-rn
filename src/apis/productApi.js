import {
  addDoc,
  and,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import i18n from 'i18next';

import { db } from '~/config';
import { COLLECTIONS } from '~/constants';

const add = async (data) => {
  try {
    // Thêm thông tin
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      category: doc(db, COLLECTIONS.CATEGORIES, data.category),
      outOfStock: data.outOfStock || false, // Mặc định là còn hàng
    });

    // Thêm trường id vô tài liệu
    await updateDoc(docRef, {
      id: docRef.id,
    });

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log('Document data:', docSnap.data());
      return {
        status: 'success',
        message: i18n.t('successfully'),
        data: docSnap.data(),
      };
    } else {
      // docSnap.data() will be undefined in this case
      // console.log('No such document!');
    }
  } catch (error) {
    console.log(error);
  }
};

const update = async (docId, data) => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, docId);

    // Cập nhật thông tin
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      category: doc(db, COLLECTIONS.CATEGORIES, data.category),
    });

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log('Document data:', docSnap.data());
      return {
        status: 'success',
        message: i18n.t('successfully'),
        data: docSnap.data(),
      };
    } else {
      // docSnap.data() will be undefined in this case
      // console.log('No such document!');
    }
  } catch (error) {}
};

const remove = async (id) => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);

    // Xoá thông tin
    await deleteDoc(docRef);

    return {
      status: 'success',
      message: i18n.t('successfully'),
    };
  } catch (error) {}
};

const getListByCategoryId = async (categoryId) => {
  try {
    // Tạo tham chiếu bộ sưu tập Sản Phẩm
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);

    const categoryDocRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);

    // Tạo truy vấn với bộ sưu tập
    const q = query(productsRef, where('category', '==', categoryDocRef));
    const querySnapshot = await getDocs(q);

    const documents = querySnapshot.docs.map((doc) => doc.data());

    return {
      status: 'success',
      data: documents,
    };
  } catch (error) {}
};

const getOne = async (id) => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);

    // Lấy thông tin 1 tài liệu
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        status: 'success',
        data,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

const searchByName = async (searchText) => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);

    // Tìm kiếm theo searchText
    const q = query(
      productsRef,
      or(
        and(
          where('name', '>=', searchText),
          where('name', '<=', searchText + '\uf8ff'),
        ),
        and(where('name', '==', searchText)),
      ),
    );

    const querySnapshot = await getDocs(q);

    const documents = querySnapshot.docs.map((doc) => doc.data());

    return {
      status: 'success',
      data: documents,
    };
  } catch (error) {
    console.log(error);
  }
};

export const productApi = {
  add,
  update,
  delete: remove,
  getListByCategoryId,
  getOne,
  searchByName,
};
