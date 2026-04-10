import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import i18n from 'i18next';

import { auth, db } from '../config';
import { COLLECTIONS } from '../constants';
import { getAvatarLink } from '../utils';

const login = async (email, password) => {
  try {
    const response = await signInWithEmailAndPassword(auth, email, password);

    // thông tin người dùng
    const userCredential = response.user;
    const uid = userCredential.uid;

    const docRef = doc(db, COLLECTIONS.USERS, uid);

    const docSnap = await getDoc(docRef);

    // check tài liệu tồn tại hay không?
    if (docSnap.exists()) {
      const data = docSnap.data();

      return {
        status: 'success',
        message: i18n.t('loginSuccessfully'),
        data,
      };
    } else {
      // docSnap.data() will be undefined in this case
      // console.log('No such document!');
    }
  } catch (error) {
    let message = error.code;

    if (message === 'auth/invalid-email') message = i18n.t('invalidEmail');
    if (message === 'auth/invalid-credential')
      message = i18n.t('invalidCredential');

    return { status: 'error', message };
  }
};

const signUp = async (fullname, email, password) => {
  try {
    const response = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // thông tin người dùng
    const userCredential = response.user;
    const uid = userCredential.uid;

    const docRef = doc(db, COLLECTIONS.USERS, uid);

    // thực hiện thêm thông tin mới
    await setDoc(docRef, {
      uid,
      fullname,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      photoURL: getAvatarLink(fullname),
      isAdmin: false,
    });

    // lấy lại thông tin sau khi thêm
    const docSnap = await getDoc(docRef);

    // check tài liệu tồn hay không?
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        status: 'success',
        message: i18n.t('signUpSuccessfully'),
        data,
      };
    } else {
      // docSnap.data() will be undefined in this case
      // console.log('No such document!');
    }
  } catch (error) {
    let message = error.code;

    if (message === 'auth/email-already-in-use')
      message = i18n.t('emailAlreadyInUse');
    if (message === 'auth/invalid-email') message = i18n.t('invalidEmail');
    if (message === 'auth/weak-password') message = i18n.t('weakPassword');

    return { status: 'error', message };
  }
};

const logout = async () => {
  try {
    signOut(auth);
    return {
      status: 'success',
    };
  } catch (error) {
    return {
      status: 'error',
    };
  }
};

const updateUserProfile = async (newInformation) => {
  try {
    // lấy thông tin người dùng
    const user = auth.currentUser;
    const uid = user.uid;

    const docRef = doc(db, COLLECTIONS.USERS, uid);

    // cập nhật thông tin người dùng
    await updateDoc(docRef, {
      ...newInformation,
      updatedAt: serverTimestamp(),
    });

    const docSnap = await getDoc(docRef);

    // check tài liệu tồn tại hay không?
    if (docSnap.exists()) {
      const data = docSnap.data();

      return {
        status: 'success',
        message: i18n.t('successfully'),
        data,
      };
    } else {
      // docSnap.data() will be undefined in this case
      // console.log('No such document!');
    }
  } catch (error) {
    console.log(error);
    return {
      status: 'error',
    };
  }
};

const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, uid);

    const docSnap = await getDoc(docRef);

    // check tài liệu tồn tại hay không?
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        status: 'success',
        message: i18n.t('loginSuccessfully'),
        data,
      };
    } else {
      // docSnap.data() will be undefined in this case
      // console.log('No such document!');
    }
  } catch (error) {
    // console.log(error);
    return {
      status: 'error',
    };
  }
};

export const authApi = {
  login,
  signUp,
  logout,
  updateUserProfile,
  getUserProfile,
};
