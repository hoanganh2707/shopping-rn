import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXH7N7_O-a6gBSiGmaDMDTTHEIWgo0o3E",
  authDomain: "app-order-79cb0.firebaseapp.com",
  databaseURL: "https://app-order-79cb0-default-rtdb.firebaseio.com",
  projectId: "app-order-79cb0",
  storageBucket: "app-order-79cb0.firebasestorage.app",
  messagingSenderId: "518885324251",
  appId: "1:518885324251:web:f1cb5dbdcafc89a2cf63fe",
  measurementId: "G-7ZSZ9GGQ0H"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

let initializedAuth = null;
try {
  initializedAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If it throws already-initialized, fallback to getting the existing auth
  initializedAuth = getAuth(app);
}
export const auth = initializedAuth;
export const db = getFirestore(app);