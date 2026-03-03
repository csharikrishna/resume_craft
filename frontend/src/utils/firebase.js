import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCidYaI9wAx-yBYtEYGg71hghv2wC8dYvE',
  authDomain: 'resumecraft-1f232.firebaseapp.com',
  databaseURL: 'https://resumecraft-1f232-default-rtdb.firebaseio.com',
  projectId: 'resumecraft-1f232',
  storageBucket: 'resumecraft-1f232.firebasestorage.app',
  messagingSenderId: '708066868241',
  appId: '1:708066868241:web:97b76d2acfcf3e352f05b0',
  measurementId: 'G-PT0BVGFYSS'
};

export const firebaseApp = initializeApp(firebaseConfig);

export async function initFirebaseAnalytics() {
  if (typeof window === 'undefined') return null;
  if (!(await isSupported())) return null;
  return getAnalytics(firebaseApp);
}
