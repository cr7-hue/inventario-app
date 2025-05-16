import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAVAgIPhNutnNhTzMIYAR6Mjr1blth-0Tc",
  authDomain: "inventario-app-dfe84.firebaseapp.com",
  projectId: "inventario-app-dfe84",
  storageBucket: "inventario-app-dfe84.firebasestorage.app",
  messagingSenderId: "35880036842",
  appId: "1:35880036842:web:a44aa6e6c2fce33e7aaa93",
  measurementId: "G-GWCN3ML1XB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);