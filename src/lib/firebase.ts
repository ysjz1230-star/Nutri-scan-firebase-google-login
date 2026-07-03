import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCUBe32mVBI2foq8G0LG922ifsHBOKC6Tk',
  authDomain: 'ai-yz-2026.firebaseapp.com',
  projectId: 'ai-yz-2026',
  storageBucket: 'ai-yz-2026.firebasestorage.app',
  messagingSenderId: '826919619088',
  appId: '1:826919619088:web:234ce3ea868b2392b4d895',
  measurementId: 'G-TV0SD032NM',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
