import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Music, 
  Calendar,
  X,
  Upload,
  User,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  onSnapshot
} from 'firebase/firestore';
// Using optimized Base64 for image storage - no Firebase Storage needed
import { db } from '../config/firebase';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    studentId: '',
    major: '',
    profileImageUrl: '',
    notes: ''
  });

  const { currentUser: user, userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  // Debug: Check admin status
  console.log('🔍 Current user:', user?.email);
  console.log('🔑 User Role:', userRole);
  console.log('🔑 Is Admin:', isAdmin);

  // Sample data for fallback
  const sampleMembers = [
    {
      id: 'sample1',
      fullName: 'Nguyễn Văn An',
      dateOfBirth: new Date('1998-03-15'),
      phoneNumber: '0901234567',
      email: 'nguyenvanan@dalat.university',
      studentId: 'DLU2021001',
      major: 'Công nghệ thông tin',
      profileImageUrl: 'https://placehold.co/400x400/8B5CF6/FFFFFF?text=Nguyen+Van+An',
      joinedAt: new Date('2023-01-15'),
      isActive: true
    },
    {
      id: 'sample2',
      fullName: 'Trần Thị Bình',
      dateOfBirth: new Date('1999-07-22'),
      phoneNumber: '0912345678',
      email: 'tranthibinh@dalat.university',
      studentId: 'DLU2021002',
      major: 'Thiết kế đồ họa',
      profileImageUrl: 'https://placehold.co/400x400/10B981/FFFFFF?text=Tran+Thi+Binh',
      joinedAt: new Date('2023-02-01'),
      isActive: true
    },
    {
      id: 'sample3',
      fullName: 'Lê Minh Cường',
      dateOfBirth: new Date('1997-11-08'),
      phoneNumber: '0923456789',
      email: 'leminhcuong@dalat.university',
      studentId: 'DLU2020001',
      major: 'Kinh tế',
      profileImageUrl: 'https://placehold.co/400x400/F59E0B/FFFFFF?text=Le+Minh+Cuong',
      joinedAt: new Date('2023-01-20'),
      isActive: true
    },
    {
      id: 'sample4',
      fullName: 'Phạm Thị Dung',
      dateOfBirth: new Date('2000-05-12'),
      phoneNumber: '0934567890',
      email: 'phamthidung@dalat.university',
      studentId: 'DLU2022001',
      major: 'Văn học',
      profileImageUrl: 'https://placehold.co/400x400/EF4444/FFFFFF?text=Pham+Thi+Dung',
      joinedAt: new Date('2023-03-10'),
      isActive: true
    },
    {
      id: 'sample5',
      fullName: 'Võ Thanh Bình',
      dateOfBirth: new Date('1999-09-30'),
      phoneNumber: '0945678901',
      email: 'vothanhbinh@dalat.university',
      studentId: 'DLU2021003',
      major: 'Kiến trúc',
      profileImageUrl: 'https://placehold.co/400x400/8B5CF6/FFFFFF?text=Vo+Thanh+Binh',
      joinedAt: new Date('2023-01-30'),
      isActive: true
    }
  ];

  // Fetch members from Firestore with realtime updates
  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Setup realtime listener
      const membersRef = collection(db, 'members');
      const unsubscribe = onSnapshot(membersRef, (querySnapshot) => {
        const fetchedMembers = [];
        querySnapshot.forEach((doc) => {
          fetchedMembers.push({ id: doc.id, ...doc.data() });
        });
        
        // If no members in Firestore, use sample data
        if (fetchedMembers.length === 0) {
          setMembers(sampleMembers);
          console.log('📝 Using sample data - no members found in Firestore');
        } else {
          setMembers(fetchedMembers);
          console.log(`📊 Loaded ${fetchedMembers.length} members from Firestore`);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error fetching members:', error);
        // Fallback to sample data on error
        setMembers(sampleMembers);
        setLoading(false);
      });
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up members listener:', error);
      // Fallback to sample data on error
      setMembers(sampleMembers);
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe;
    
    const setupListener = async () => {
      unsubscribe = await fetchMembers();
    };
    
    setupListener();
    
    // Cleanup function
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('❌ Vui lòng chọn file ảnh (JPG, PNG, GIF, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Optimized image compression and conversion to Base64
  const processImageToBase64 = (file, maxWidth = 300, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to optimized base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        console.log(`🎯 Image optimized: ${img.width}x${img.height} → ${canvas.width}x${canvas.height}`);
        console.log(`📦 Base64 size: ${(compressedBase64.length / 1024).toFixed(1)}KB`);
        resolve(compressedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName.trim()) {
      alert('❌ Vui lòng nhập họ tên!');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('❌ Vui lòng nhập email!');
      return;
    }
    
    try {
      let imageUrl = formData.profileImageUrl;
      
      // Process image if selected
      if (selectedImage) {
        console.log('📤 Processing image...');
        setUploadingImage(true);
        
        // Process image to optimized Base64 (300px, 70% quality)
        imageUrl = await processImageToBase64(selectedImage, 300, 0.7);
        console.log('✅ Image processed and optimized successfully!');
        
        setUploadingImage(false);
      }

      const memberData = {
        ...formData,
        profileImageUrl: imageUrl || '',
        updatedAt: new Date(),
        isActive: true
      };

      if (editingMember) {
        // Update member
        await updateDoc(doc(db, 'members', editingMember.id), memberData);
        console.log('✅ Member updated successfully');
        alert('✅ Cập nhật thành viên thành công!');
      } else {
        // Add new member
        await addDoc(collection(db, 'members'), {
          ...memberData,
          joinedAt: new Date(),
          createdAt: new Date()
        });
        console.log('✅ Member added successfully');
        alert('✅ Thêm thành viên thành công!');
      }

      // Reset form
      setFormData({
        fullName: '',
        dateOfBirth: '',
        phoneNumber: '',
        email: '',
        studentId: '',
        major: '',
        profileImageUrl: '',
        notes: ''
      });
      setSelectedImage(null);
      setImagePreview('');
      setShowModal(false);
      setEditingMember(null);
      
    } catch (error) {
      console.error('Error saving member:', error);
      alert(`❌ Lỗi lưu thành viên: ${error.message}`);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName || '',
      dateOfBirth: member.dateOfBirth ? 
        (member.dateOfBirth.toDate ? member.dateOfBirth.toDate().toISOString().split('T')[0] : 
         member.dateOfBirth instanceof Date ? member.dateOfBirth.toISOString().split('T')[0] : 
         member.dateOfBirth) : '',
      phoneNumber: member.phoneNumber || '',
      email: member.email || '',
      studentId: member.studentId || '',
      major: member.major || '',
      profileImageUrl: member.profileImageUrl || '',
      notes: member.notes || ''
    });
    setImagePreview(member.profileImageUrl || '');
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ Bạn có chắc chắn muốn xóa thành viên này?')) {
      try {
        await deleteDoc(doc(db, 'members', id));
        console.log('✅ Member deleted successfully');
        alert('✅ Xóa thành viên thành công!');
      } catch (error) {
        console.error('Error deleting member:', error);
        alert(`❌ Lỗi xóa thành viên: ${error.message}`);
      }
    }
  };

  const filteredMembers = members.filter(member =>
    (member.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu thành viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Music className="mr-3 text-purple-600" size={32} />
                Thành viên CLB Âm nhạc
              </h1>
              <p className="text-gray-600 mt-2">
                {isAdmin ? 'Quản lý thành viên câu lạc bộ' : 'Danh sách thành viên câu lạc bộ'} - 
                Tổng: {filteredMembers.length} thành viên
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm thành viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Add Member Button - Only for Admin */}
              {isAdmin && (
                <motion.button
                  onClick={() => {
                    setEditingMember(null);
                    setFormData({
                      fullName: '',
                      dateOfBirth: '',
                      phoneNumber: '',
                      email: '',
                      studentId: '',
                      major: '',
                      profileImageUrl: '',
                      notes: ''
                    });
                    setSelectedImage(null);
                    setImagePreview('');
                    setShowModal(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    background: "linear-gradient(45deg, #9333ea, #ec4899)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: 0.2
                  }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Plus size={20} />
                  </motion.div>
                  Thêm thành viên
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <User size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy thành viên</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy thêm thành viên đầu tiên!'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100 
                }}
                whileHover={{ 
                  y: -10,
                  rotateY: 5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                style={{
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Member Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                  <img
                    src={member.profileImageUrl || 'https://placehold.co/400x400/8B5CF6/FFFFFF?text=No+Image'}
                    alt={member.fullName || 'Thành viên'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x400/8B5CF6/FFFFFF?text=No+Image';
                    }}
                  />
                  
                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <motion.button
                        onClick={() => handleEdit(member)}
                        className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(member.id)}
                        className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Member Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{member.fullName || 'Chưa có tên'}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>MSSV:</strong> {member.studentId || 'Chưa có'}</p>
                    <p><strong>Ngành:</strong> {member.major || 'Chưa có'}</p>
                    <p><strong>Email:</strong> {member.email || 'Chưa có'}</p>
                    <p><strong>SĐT:</strong> {member.phoneNumber || 'Chưa có'}</p>
                    {member.joinedAt && (
                      <p className="flex items-center mt-2">
                        <Calendar size={14} className="mr-1 text-purple-500" />
                        <strong>Tham gia:</strong> {' '}
                        {member.joinedAt.toDate ? 
                          member.joinedAt.toDate().toLocaleDateString('vi-VN') : 
                          new Date(member.joinedAt).toLocaleDateString('vi-VN')
                        }
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Member Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowModal(false);
                }
              }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {editingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Image Info */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-semibold text-green-800">✅ Hệ thống Upload Tối ưu</h4>
                        <div className="mt-1 text-sm text-green-700 space-y-1">
                          <p>
                            <strong>🎯 Phương thức:</strong> Base64 tối ưu hóa (300px, 70% chất lượng)
                          </p>
                          <p>
                            <strong>💡 Ưu điểm:</strong> Không cần Firebase Storage - hoàn toàn miễn phí
                          </p>
                          <p>
                            <strong>⚡ Hiệu suất:</strong> Nhanh, ổn định, không phụ thuộc dịch vụ ngoài
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ảnh đại diện
                      </label>
                      <div className="flex items-center space-x-4">
                        {/* Image Preview */}
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <User className="text-gray-400" size={32} />
                          )}
                        </div>
                        
                        {/* Upload Button */}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                          >
                            <Upload size={20} className="mr-2" />
                            {uploadingImage ? 'Đang xử lý...' : 'Chọn ảnh'}
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Định dạng: JPG, PNG, GIF. Tối đa 5MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Nhập họ tên đầy đủ"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0901234567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="example@dalat.university"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mã sinh viên
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="DLU2023001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chuyên ngành
                        </label>
                        <input
                          type="text"
                          name="major"
                          value={formData.major}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Công nghệ thông tin"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ghi chú thêm về thành viên..."
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <motion.button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Hủy
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={uploadingImage}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {uploadingImage ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Đang xử lý ảnh...
                          </div>
                        ) : editingMember ? 'Cập nhật' : 'Thêm thành viên'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Members;