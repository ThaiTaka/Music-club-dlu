// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Note: Storage removed - using optimized Base64 for images
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCAEs1NRp4afp_h8zL3wwWCUe2nFNFyU_U",
  authDomain: "music-club-dlu.firebaseapp.com",
  projectId: "music-club-dlu",
  storageBucket: "music-club-dlu.firebasestorage.app",
  messagingSenderId: "694390749245",
  appId: "1:694390749245:web:a39f7db4cda15aa3ac5254",
  measurementId: "G-74KTWRNJPP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Note: Using Base64 image storage for better compatibility
// No additional Firebase Storage costs required

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;