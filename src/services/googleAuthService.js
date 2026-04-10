/**
 * Google Authentication Service
 * Xử lý đăng nhập/đăng ký bằng Google với Firebase
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import i18n from 'i18next';

import { auth, db } from '~/config';
import { COLLECTIONS } from '~/constants';
import { getAvatarLink } from '~/utils';

// Cần để WebBrowser hoàn tất authentication
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// ⚠️ QUAN TRỌNG: Cần cấu hình Google OAuth Web Client ID trong Firebase Console
// Firebase Console > Authentication > Sign-in method > Google > Web client ID
// Format: xxxxxx-xxxxx.apps.googleusercontent.com
// 
// HƯỚNG DẪN LẤY CLIENT ID:
// 1. Vào Firebase Console: https://console.firebase.google.com/
// 2. Chọn project: app-order-79cb0
// 3. Vào Authentication > Sign-in method > Google
// 4. Bật Google Sign-In (nếu chưa bật)
// 5. Copy "Web client ID" (không phải Web client secret)
// 6. Dán vào dòng dưới đây
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '518885324251-er0c78jre057gbjvrhta4emej0p0t1tv.apps.googleusercontent.com';

/**
 * Đăng nhập/Đăng ký bằng Google
 * @returns {Promise<Object>} Kết quả đăng nhập
 */
export const signInWithGoogle = async () => {
  try {
    // Kiểm tra Client ID
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('xxxxx')) {
      return {
        status: 'error',
        message: 'Google Client ID chưa được cấu hình. Vui lòng thêm Web Client ID từ Firebase Console vào file src/services/googleAuthService.js',
      };
    }

    // Luôn dùng Expo proxy để nhận được https:// URI (Google Web OAuth không hỗ trợ exp://)
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: undefined, // Không dùng custom scheme
      useProxy: true, // Luôn dùng Expo proxy
      preferLocalhost: false, // Không dùng localhost
    });

    console.log('Google OAuth Config:', {
      clientId: GOOGLE_CLIENT_ID.substring(0, 20) + '...',
      redirectUri,
      note: 'Should be https://auth.expo.io/@... (NOT exp://)',
    });

    // Cấu hình request
    // Dùng responseType: IdToken và tắt PKCE bằng cách set codeChallengeMethod
    // Google OAuth với responseType: IdToken không hỗ trợ PKCE
    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri: redirectUri,
      extraParams: {},
      additionalParameters: {
        // Tắt PKCE bằng cách không set code_challenge_method
      },
      // Tắt PKCE bằng cách override codeChallenge
      codeChallenge: undefined,
      codeChallengeMethod: undefined,
    });

    // Override để tắt PKCE hoàn toàn
    request.codeChallenge = undefined;
    request.codeChallengeMethod = undefined;

    // Khởi tạo auth request
    const result = await request.promptAsync(discovery, {
      showInRecents: true,
    });

    if (result.type === 'success') {
      const { id_token } = result.params;

      if (!id_token) {
        return {
          status: 'error',
          message: 'Không nhận được token từ Google',
        };
      }

      // Tạo credential từ Google id_token
      const googleCredential = GoogleAuthProvider.credential(id_token);

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
        // Cập nhật thông tin nếu đã tồn tại (có thể cập nhật avatar)
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
    
    let message = 'Đã có lỗi xảy ra khi đăng nhập với Google';
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'Đăng nhập đã bị đóng';
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      message = 'Tài khoản này đã được đăng ký với phương thức khác';
    } else if (error.message) {
      message = error.message;
    }

    return {
      status: 'error',
      message: message,
    };
  }
};

/**
 * Lấy Web Client ID từ Firebase config
 * Có thể lấy từ Firebase Console > Authentication > Sign-in method > Google > Web client ID
 */
export const getGoogleClientId = () => {
  return GOOGLE_CLIENT_ID;
};

export default {
  signInWithGoogle,
  getGoogleClientId,
};

