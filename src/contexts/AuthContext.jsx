import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Register new user
  const signup = async (email, password, displayName) => {
    try {
      setError('');
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'user', // Default role
        createdAt: new Date(),
        profileImageUrl: ''
      });
      
      return userCredential;
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in user
  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out user
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  // Update user password
  const changePassword = async (newPassword) => {
    try {
      setError('');
      await updatePassword(currentUser, newPassword);
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName, profileImageUrl) => {
    try {
      setError('');
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: displayName,
        photoURL: profileImageUrl
      });
      
      // Update Firestore document
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: displayName,
        profileImageUrl: profileImageUrl
      }, { merge: true });
      
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  // Get user role from email (simplified approach)
  const getUserRole = async (user) => {
    try {
      // Check if user email contains admin
      if (user.email && user.email.includes('admin')) {
        return 'admin';
      }
      
      // Try to get role from Firestore users collection
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data().role || 'user';
      }
      
      return 'user';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'user';
    }
  };

  // Convert Firebase error codes to user-friendly Vietnamese messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Không tìm thấy tài khoản với email này.';
      case 'auth/wrong-password':
        return 'Mật khẩu không chính xác.';
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng cho tài khoản khác.';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
      case 'auth/invalid-email':
        return 'Địa chỉ email không hợp lệ.';
      case 'auth/too-many-requests':
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
      default:
        return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        // Get user role - simplified check
        const role = await getUserRole(user);
        setUserRole(role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    error,
    signup,
    login,
    logout,
    resetPassword,
    changePassword,
    updateUserProfile,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};