import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import i18n from 'i18next';

import { db } from '../config';
import { COLLECTIONS } from '../constants';

const getAll = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CATEGORIES),
      orderBy('createdAt'),
    );
    const querySnapshot = await getDocs(q);

    const documents = querySnapshot.docs.map((doc) => doc.data());

    return {
      status: 'success',
      data: documents,
    };
  } catch (error) {}
};

const add = async (data) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // console.log('Document written with ID: ', docRef.id);

    // Add the id field
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
    const docRef = doc(db, COLLECTIONS.CATEGORIES, docId);

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
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
    const docRef = doc(db, COLLECTIONS.CATEGORIES, id);

    await deleteDoc(docRef);

    return {
      status: 'success',
      message: i18n.t('successfully'),
    };
  } catch (error) {}
};

export const categoryApi = {
  getAll,
  add,
  update,
  delete: remove,
};
