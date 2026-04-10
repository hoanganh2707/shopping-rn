import {
  FieldValue,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteField,
} from 'firebase/firestore';
import i18n from 'i18next';

import { db } from '~/config';
import { COLLECTIONS } from '~/constants';

const add = async (uid, id, comment) => {
  try {
    // Thêm tài liệu
    await setDoc(doc(db, COLLECTIONS.COMMENTS, id), {
      id: id,
      comment: comment,
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
    const docRef = doc(db, COLLECTIONS.COMMENTS, id);

    // Nhận 1 tài liệu
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        status: 'success',
        data,
      };
    } else {
      return {
        status: 'success',
      };
    }
  } catch (error) {}
};

const update = async (docId, comment) => {
  try {
    const docRef = doc(db, COLLECTIONS.COMMENTS, docId);

    // Cập nhật 1 tài liệu
    await updateDoc(docRef, {
      comment,
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
    const docRef = doc(db, COLLECTIONS.COMMENTS, id);

    // Xoá 1 tài liệu
    await deleteDoc(docRef);

    return {
      status: 'success',
      message: i18n.t('successfully'),
    };
  } catch (error) {}
};

const addReply = async (docId, reply) => {
  try {
    const docRef = doc(db, COLLECTIONS.COMMENTS, docId);

    // Cập nhật 1 tài liệu
    await updateDoc(docRef, {
      reply: {
        text: reply,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    });

    return {
      status: 'success',
      message: i18n.t('successfully'),
    };
  } catch (error) {}
};

const updateReply = async (docId, reply) => {
  try {
    const docRef = doc(db, COLLECTIONS.COMMENTS, docId);

    // Cập nhật 1 tài liệu
    await updateDoc(docRef, {
      reply: {
        text: reply,
        updatedAt: serverTimestamp(),
      },
    });

    return {
      status: 'success',
      message: i18n.t('successfully'),
    };
  } catch (error) {}
};

const deleteReply = async (docId) => {
  try {
    const docRef = doc(db, COLLECTIONS.COMMENTS, docId);

    // Xoá trường `reply` khỏi tài liệu
    await updateDoc(docRef, {
      reply: deleteField(),
    });

    return {
      status: 'success',
      message: i18n.t('successfully'),
    };
  } catch (error) {
    console.log(error);
  }
};

export const commentApi = {
  add,
  getOne,
  delete: remove,
  update,
  addReply,
  updateReply,
  deleteReply,
};
