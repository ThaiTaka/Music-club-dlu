import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Tạo tài khoản admin mới
export const createAdminAccount = async () => {
  const adminEmail = 'admin2@dlu.edu.vn';
  const adminPassword = 'AdminPassword456';
  const adminName = 'Super Admin';

  try {
    console.log('🔥 Creating new admin account...');
    
    // 1. Tạo tài khoản Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth account created:', user.uid);
    
    // 2. Update display name
    await updateProfile(user, {
      displayName: adminName
    });
    
    console.log('✅ Display name updated');
    
    // 3. Tạo document trong Firestore users collection
    await setDoc(doc(db, 'users', user.uid), {
      email: adminEmail,
      displayName: adminName,
      role: 'admin',
      createdAt: new Date(),
      isActive: true
    });
    
    console.log('✅ User document created in Firestore');
    
    // 4. Thêm vào members collection
    await addDoc(collection(db, 'members'), {
      name: adminName,
      email: adminEmail,
      role: 'admin',
      instrument: 'Management',
      experience: 'expert',
      joinDate: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: 'Super Administrator of Music Club DLU',
      phoneNumber: '+84 123 456 789',
      studentId: 'ADMIN002',
      major: 'Administration',
      year: 4,
      isActive: true,
      achievements: ['Admin of the Year'],
      createdAt: new Date(),
      createdBy: 'system'
    });
    
    console.log('✅ Admin member added to members collection');
    
    alert(`🎉 Tài khoản admin mới đã được tạo thành công!
    
📧 Email: ${adminEmail}
🔑 Password: ${adminPassword}
👤 Name: ${adminName}

Bạn có thể đăng nhập ngay bây giờ!`);
    
    return {
      success: true,
      email: adminEmail,
      password: adminPassword,
      name: adminName
    };
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    alert(`Lỗi tạo tài khoản admin: ${error.message}`);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function để test admin permissions
export const testAdminPermissions = (currentUser, userRole) => {
  console.log('🔍 Testing admin permissions...');
  console.log('Current User:', currentUser?.email);
  console.log('User Role:', userRole);
  console.log('Is Admin (by email):', currentUser?.email?.includes('admin'));
  console.log('Is Admin (by role):', userRole === 'admin');
  
  const isAdmin = currentUser?.email?.includes('admin') || userRole === 'admin';
  console.log('Final Admin Status:', isAdmin);
  
  return isAdmin;
};