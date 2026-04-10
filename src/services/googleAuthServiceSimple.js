/**
 * Google Authentication Service - Version Đơn Giản
 * Sử dụng WebBrowser trực tiếp với Google OAuth URL
 * Không cần cấu hình redirect URI phức tạp
 */

import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Linking } from 'react-native';
import i18n from 'i18next';

import { auth, db } from '~/config';
import { COLLECTIONS } from '~/constants';
import { getAvatarLink } from '~/utils';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '518885324251-er0c78jre057gbjvrhta4emej0p0t1tv.apps.googleusercontent.com';

/**
 * Tạo Google OAuth URL đơn giản
 */
const createGoogleAuthUrl = () => {
  const redirectUri = 'https://app-order-79cb0.firebaseapp.com/__/auth/handler'; // Dùng Firebase redirect URI
  const scopes = 'openid profile email';
  const responseType = 'id_token'; // Implicit flow - không cần PKCE
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scopes,
    nonce: Math.random().toString(36).substring(7), // Random nonce
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Parse id_token từ redirect URL
 */
const parseIdTokenFromUrl = (url) => {
  try {
    if (url.includes('#id_token=')) {
      const idToken = url.split('#id_token=')[1].split('&')[0];
      return decodeURIComponent(idToken);
    }
    if (url.includes('id_token=')) {
      const params = new URLSearchParams(url.split('?')[1] || url.split('#')[1] || '');
      return params.get('id_token');
    }
    return null;
  } catch (error) {
    console.error('Parse id_token error:', error);
    return null;
  }
};

/**
 * Đăng nhập/Đăng ký bằng Google - Version Đơn Giản
 */
export const signInWithGoogleSimple = async () => {
  try {
    // Kiểm tra Client ID
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('xxxxx')) {
      return {
        status: 'error',
        message: 'Google Client ID chưa được cấu hình.',
      };
    }

    const authUrl = createGoogleAuthUrl();
    
    console.log('Opening Google Auth URL...');

    // Mở browser với Google OAuth URL
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      'https://app-order-79cb0.firebaseapp.com/__/auth/handler'
    );

    if (result.type === 'success' && result.url) {
      // Parse id_token từ URL
      const idToken = parseIdTokenFromUrl(result.url);

      if (!idToken) {
        return {
          status: 'error',
          message: 'Không nhận được token từ Google',
        };
      }

      // Tạo credential từ Google id_token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Đăng nhập với Firebase
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;
      const uid = user.uid;

      // Kiểm tra xem user đã tồn tại trong Firestore chưa
      const userDocRef = doc(db, COLLECTIONS.USERS, uid);
      const userDoc = await getDoc(userDocRef);

      const isNewUser = !userDoc.exists();

      if (isNewUser) {
        // Tạo tài khoản mới nếu chưa tồn tại
        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        const photoURL = user.photoURL || getAvatarLink(displayName);

        await setDoc(userDocRef, {
          uid,
          fullname: displayName,
          email: user.email,
          photoURL: photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isAdmin: false,
        });
      } else {
        // Cập nhật thông tin nếu đã tồn tại
        if (user.photoURL) {
          await setDoc(
            userDocRef,
            {
              photoURL: user.photoURL,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }

      // Lấy thông tin user từ Firestore
      const updatedUserDoc = await getDoc(userDocRef);

      if (updatedUserDoc.exists()) {
        return {
          status: 'success',
          message: isNewUser 
            ? i18n.t('signUpSuccessfully') || 'Đăng ký thành công!' 
            : i18n.t('loginSuccessfully') || 'Đăng nhập thành công!',
          data: updatedUserDoc.data(),
        };
      }
    } else if (result.type === 'cancel' || result.type === 'dismiss') {
      return {
        status: 'cancel',
        message: 'Đăng nhập đã bị hủy',
      };
    } else {
      return {
        status: 'error',
        message: 'Đăng nhập thất bại. Vui lòng thử lại.',
      };
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    
    return {
      status: 'error',
      message: error.message || 'Đã có lỗi xảy ra khi đăng nhập với Google',
    };
  }
};

export default {
  signInWithGoogleSimple,
};

