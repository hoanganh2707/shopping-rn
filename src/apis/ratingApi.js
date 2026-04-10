import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import i18n from 'i18next';

import { db } from '~/config';
import { COLLECTIONS } from '~/constants';

const add = async (uid, id, rating) => {
  try {
    // Thêm thông tin mới
    await setDoc(doc(db, COLLECTIONS.RATINGS, id), {
      id: id,
      rating,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      uid: uid,
    });

    return {
      status: 'success',
    };
  } catch (error) {}
};

const getOne = async (id) => {
  try {
    const docRef = doc(db, COLLECTIONS.RATINGS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        status: 'success',
        data,
      };
    } else {
    }
  } catch (error) {}
};

const update = async (docId, rating) => {
  try {
    const docRef = doc(db, COLLECTIONS.RATINGS, docId);

    // Cập nhật thông tin
    await updateDoc(docRef, {
      rating,
      updatedAt: serverTimestamp(),
    });

    return {
      status: 'success',
      message: i18n.t('successfully'),
    };
  } catch (error) {}
};

const remove = async (id) => {
  try {
    const docRef = doc(db, COLLECTIONS.RATINGS, id);

    // Xoá thông tin
    await deleteDoc(docRef);

    return {
      status: 'success',
      message: i18n.t('successfully'),
    };
  } catch (error) {}
};

export const ratingApi = {
  add,
  getOne,
  delete: remove,
  update,
};
