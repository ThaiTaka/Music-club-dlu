import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { initializeFirebaseData } from '../utils/firebaseSetup';
import { createAdminAccount, testAdminPermissions } from '../utils/adminSetup';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { Database, Users, Calendar, Settings, Play, CheckCircle, UserPlus, TestTube } from 'lucide-react';

const AdminSetup = () => {
  const { currentUser, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const handleInitializeData = async () => {
    if (!currentUser || !currentUser.email.includes('admin')) {
      alert('❌ Chỉ admin mới có thể thực hiện chức năng này!');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Starting data initialization...');
      console.log('📋 Current user:', currentUser?.email);
      console.log('🔥 Firebase db:', !!db);
      
      const result = await initializeFirebaseData();
      console.log('📊 Result:', result);
      
      if (result && result.success) {
        setSetupComplete(true);
        alert(result.message);
        
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        const errorMsg = result?.message || 'Unknown error occurred';
        setError(errorMsg);
        
        // Tạo popup với thông tin chi tiết
        const detailedMessage = `${errorMsg}\n\n`;
        let additionalInfo = '';
        
        if (result?.errorCode === 'permission-denied') {
          additionalInfo = '🔧 CÁCH KHẮC PHỤC:\n\n';
          additionalInfo += '1. Vào Firebase Console\n';
          additionalInfo += '2. Chọn Firestore Database > Rules\n';
          additionalInfo += '3. Copy rules từ file firestore-rules-development.txt\n';
          additionalInfo += '4. Click Publish\n\n';
          additionalInfo += '📋 Hoặc tạm thời set rules thành:\n';
          additionalInfo += 'allow read, write: if true;';
        } else if (result?.errorCode === 'failed-precondition') {
          additionalInfo = '🔧 CÁCH KHẮC PHỤC:\n\n';
          additionalInfo += '1. Vào Firebase Console\n';
          additionalInfo += '2. Chọn Firestore Database\n';
          additionalInfo += '3. Nếu chưa có, click "Create database"\n';
          additionalInfo += '4. Chọn "Start in test mode"\n';
          additionalInfo += '5. Chọn location: asia-southeast1';
        }
        
        alert(detailedMessage + additionalInfo);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      const errorMessage = `❌ Lỗi không mong đợi: ${error.message}\n\n🔧 Kiểm tra:\n- Kết nối internet\n- Firebase console\n- Developer tools (F12) để xem lỗi chi tiết`;
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setIsCreatingAdmin(true);
    setError(null);
    
    try {
      console.log('🚀 Creating new admin account...');
      const result = await createAdminAccount();
      
      if (result.success) {
        alert(`✅ Tài khoản admin mới đã được tạo thành công!\n\n📧 Email: ${result.email}\n🔑 Password: ${result.password}\n\nBạn có thể đăng nhập ngay bây giờ!`);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setError(`❌ Lỗi tạo tài khoản admin: ${error.message}`);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleTestAdmin = () => {
    const isAdmin = testAdminPermissions(currentUser, userRole);
    alert(`🔍 Kết quả test admin permissions:

👤 Email: ${currentUser?.email || 'Chưa đăng nhập'}
🎭 Role: ${userRole || 'Không xác định'}
✅ Is Admin: ${isAdmin ? 'YES' : 'NO'}

${isAdmin ? '🎉 Bạn có quyền admin!' : '❌ Bạn không có quyền admin'}`);
  };

  if (!currentUser || !currentUser.email.includes('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>Chỉ Admin mới có thể truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
              <Settings className="w-8 h-8 text-white" />
              Firebase Setup - Admin Panel
            </h1>
            <p className="mt-2 text-blue-100">
              Khởi tạo dữ liệu mẫu cho Music Club Database
            </p>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 font-bold">Dữ liệu sẽ được tạo:</span>
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Events Collection</h3>
                      <p className="text-sm text-gray-700">3 sự kiện mẫu</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Members Collection</h3>
                      <p className="text-sm text-gray-700">5 thành viên mẫu</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Club Settings</h3>
                      <p className="text-sm text-gray-700">Thông tin câu lạc bộ</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 font-bold">
                  Hướng dẫn:
                </h2>
                
                <div className="space-y-2 text-sm text-gray-800">
                  <p className="font-medium">• Nhấn nút "Khởi tạo dữ liệu" bên dưới</p>
                  <p className="font-medium">• Chờ quá trình tạo dữ liệu hoàn tất</p>
                  <p className="font-medium">• Kiểm tra Firebase Console để xác nhận</p>
                  <p className="font-medium">• Trang web sẽ tự động reload sau khi hoàn thành</p>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-900 font-semibold">
                    <strong>⚠️ Lưu ý:</strong> Chỉ chạy một lần để tránh tạo dữ liệu trùng lặp.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                </div>
              )}
              
              {!setupComplete ? (
                <motion.button
                  onClick={handleInitializeData}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-0"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white font-semibold">Đang khởi tạo dữ liệu...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold">Khởi tạo dữ liệu Firebase</span>
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg"
                >
                  <CheckCircle className="w-6 h-6" />
                  Setup hoàn tất! Đang reload trang...
                </motion.div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateAdmin}
                disabled={isCreatingAdmin}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isCreatingAdmin ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Tạo Admin backup</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTestAdmin}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <TestTube className="w-5 h-5" />
                <span>Test Admin</span>
              </motion.button>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
              <p className="text-sm text-gray-900 text-center font-semibold">
                Đăng nhập với tài khoản: <strong className="text-blue-600">{currentUser?.email}</strong>
              </p>
              <p className="text-xs text-gray-600 text-center mt-1">
                Role: <strong>{userRole || 'Đang tải...'}</strong> | 
                Admin: <strong>{(currentUser?.email?.includes('admin') || userRole === 'admin') ? 'YES' : 'NO'}</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSetup;