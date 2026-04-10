import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

import { db } from '~/config';
import { COLLECTIONS } from '~/constants';

const getAll = async () => {
  try {
    /**
     * Lấy danh sách User, với điều kiện không phải admin
     */
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('isAdmin', '==', false),
      orderBy('createdAt'),
    );

    const querySnapshot = await getDocs(q);

    const documents = querySnapshot.docs.map((doc) => doc.data());

    return {
      status: 'success',
      data: documents,
    };
  } catch (error) {
    return {
      status: 'error',
    };
  }
};

export const userApi = {
  getAll,
};
