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
// Note: Firebase Storage removed - using optimized Base64 instead
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
    year: '',
    skills: '',
    bio: '',
    profileImageUrl: '',
    experience: 'beginner' // beginner, intermediate, advanced
  });
  const { userRole } = useAuth();

  // Sample data including Nguyễn Thanh Trúc
  const sampleMembers = [
    {
      id: 'sample-1',
      fullName: 'Nguyễn Thanh Trúc',
      dateOfBirth: '2002-09-09',
      phoneNumber: '+84 123 456 789',
      email: 'admin@dlu.edu.vn',
      studentId: 'DLU2022001',
      major: 'Công nghệ thông tin',
      year: '3',
      skills: 'Piano, Guitar',
      experience: 'advanced',
      bio: 'Một nghệ sĩ piano đầy đam mê với tình yêu dành cho âm nhạc cổ điển và đương đại. Là thành viên nòng cốt của câu lạc bộ chúng tôi.',
      profileImageUrl: 'https://placehold.co/400x400/EFEFEF/333333?text=Nguyen+Thanh+Truc',
      joinedAt: new Date('2023-01-15'),
      isActive: true
    },
    {
      id: 'sample-2',
      fullName: 'Lê Minh Đức',
      dateOfBirth: '2002-05-20',
      phoneNumber: '+84 987 654 321',
      email: 'duc.le@dlu.edu.vn',
      studentId: 'DLU2022002',
      major: 'Âm nhạc',
      year: '2',
      skills: 'Guitar, Vocal',
      experience: 'intermediate',
      bio: 'Sinh viên năm 3 ngành CNTT, đam mê guitar acoustic và rock. Thường xuyên tham gia các buổi biểu diễn của câu lạc bộ.',
      profileImageUrl: 'https://placehold.co/400x400/3B82F6/FFFFFF?text=Le+Minh+Duc',
      joinedAt: new Date('2023-03-10'),
      isActive: true
    },
    {
      id: 'sample-3',
      fullName: 'Trần Thị Lan Anh',
      dateOfBirth: '2003-12-15',
      phoneNumber: '+84 456 789 123',
      email: 'lananh.tran@dlu.edu.vn',
      studentId: 'DLU2023001',
      major: 'Âm nhạc',
      year: '1',
      skills: 'Violin, Piano',
      experience: 'advanced',
      bio: 'Có 10 năm kinh nghiệm học violin, hiện là sinh viên năm 2 ngành Âm nhạc. Đặc biệt yêu thích nhạc cổ điển và chamber music.',
      profileImageUrl: 'https://placehold.co/400x400/F59E0B/FFFFFF?text=Tran+Thi+Lan+Anh',
      joinedAt: new Date('2023-02-28'),
      isActive: true
    },
    {
      id: 'sample-4',
      fullName: 'Phạm Văn Hùng',
      dateOfBirth: '2001-08-03',
      phoneNumber: '+84 321 987 654',
      email: 'hung.pham@dlu.edu.vn',
      studentId: 'DLU2021001',
      major: 'Kinh tế',
      year: '4',
      skills: 'Drums, Percussion',
      experience: 'advanced',
      bio: 'Tay trống chính của ban nhạc câu lạc bộ. Có phong cách chơi mạnh mẽ và đầy sáng tạo, đặc biệt giỏi rock và jazz.',
      profileImageUrl: 'https://placehold.co/400x400/EF4444/FFFFFF?text=Pham+Van+Hung',
      joinedAt: new Date('2022-11-20'),
      isActive: true
    },
    {
      id: 'sample-5',
      fullName: 'Hoàng Thị Mai',
      dateOfBirth: '2003-01-25',
      phoneNumber: '+84 789 123 456',
      email: 'mai.hoang@dlu.edu.vn',
      studentId: 'DLU2023002',
      major: 'Văn học',
      year: '1',
      skills: 'Vocal, Ukulele',
      experience: 'intermediate',
      bio: 'Giọng ca ngọt ngào của câu lạc bộ. Thích hát pop ballad và acoustic. Cũng rất giỏi chơi ukulele.',
      profileImageUrl: 'https://placehold.co/400x400/10B981/FFFFFF?text=Hoang+Thi+Mai',
      joinedAt: new Date('2023-04-05'),
      isActive: true
    },
    {
      id: 'sample-6',
      fullName: 'Võ Thanh Bình',
      dateOfBirth: '2002-07-12',
      phoneNumber: '+84 654 321 987',
      email: 'binh.vo@dlu.edu.vn',
      studentId: 'DLU2022003',
      major: 'Âm nhạc',
      year: '2',
      skills: 'Bass Guitar',
      experience: 'intermediate',
      bio: 'Bass player với kỹ thuật vững vàng và groove tốt. Thường xuyên support cho các buổi recording của câu lạc bộ.',
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
      return null;
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
        
        if (storageCheck.available) {
          try {
            console.log('⚡ Firebase Storage available, attempting upload...');
            imageUrl = await uploadImage(selectedImage, formData.fullName);
            
            if (imageUrl) {
              console.log('✅ Firebase Storage upload successful!');
            } else {
              throw new Error('Upload returned empty URL');
            }
          } catch (uploadError) {
            console.warn('❌ Firebase Storage upload failed:', uploadError.message);
            
            // Fallback to base64
            console.log('🔄 Switching to base64 fallback...');
            imageUrl = await compressImageToBase64(selectedImage, 300, 0.7);
            console.log('✅ Base64 fallback successful!');
            
            // Show notification
            alert(`⚠️ Thông báo Upload\n\n✅ Ảnh đã được lưu thành công!\n🔄 Chế độ: Base64 tối ưu\n� Lý do: Firebase Storage đang gặp sự cố CORS`);
          }
        } else {
          // Storage not available, use base64 directly
          console.log('📦 Firebase Storage not available, using base64 directly...');
          imageUrl = await compressImageToBase64(selectedImage, 300, 0.7);
          console.log('✅ Base64 upload successful!');
          
          // Show notification
          alert(`ℹ️ Thông báo Upload\n\n✅ Ảnh đã được lưu thành công!\n📦 Chế độ: Base64 tối ưu\n💡 Lý do: Firebase Storage chưa được kích hoạt`);
        }
        
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
        console.log('✅ New member added successfully');
        alert('✅ Thêm thành viên mới thành công!');
      }
      
      // Reset form and close modal
      resetForm();
    } catch (error) {
      console.error('Error saving member:', error);
      alert(`❌ Có lỗi khi lưu thông tin: ${error.message}`);
      setUploadingImage(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName || '',
      dateOfBirth: member.dateOfBirth || '',
      phoneNumber: member.phoneNumber || '',
      email: member.email || '',
      studentId: member.studentId || '',
      major: member.major || '',
      year: member.year || '',
      skills: member.skills || '',
      bio: member.bio || '',
      profileImageUrl: member.profileImageUrl || '',
      experience: member.experience || 'beginner'
    });
    
    // Set image preview if exists
    if (member.profileImageUrl) {
      setImagePreview(member.profileImageUrl);
    }
    
    setShowModal(true);
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      try {
        await deleteDoc(doc(db, 'members', memberId));
        console.log('✅ Member deleted successfully');
        // No need to call fetchMembers() - realtime listener will update automatically
      } catch (error) {
        console.error('Error deleting member:', error);
        alert(`❌ Có lỗi khi xóa thành viên: ${error.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
      studentId: '',
      major: '',
      year: '',
      skills: '',
      bio: '',
      profileImageUrl: '',
      experience: 'beginner'
    });
    setEditingMember(null);
    setShowModal(false);
    setSelectedImage(null);
    setImagePreview('');
    setUploadingImage(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('vi-VN');
  };

  const filteredMembers = members.filter(member =>
    (member.fullName && member.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.skills && member.skills.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {userRole === 'admin' ? 'Quản lý thành viên' : 'Thành viên câu lạc bộ'}
            </h1>
            <p className="text-xl text-primary-100">
              {userRole === 'admin' 
                ? 'Quản lý và chỉnh sửa thông tin thành viên' 
                : 'Gặp gỡ những tài năng âm nhạc của chúng tôi'
              }
            </p>
            {userRole === 'admin' && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">🔧 Chế độ quản trị viên</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm thành viên, kỹ năng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm"
            />
          </div>

          {userRole === 'admin' && (
            <motion.button
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              whileTap={{ 
                scale: 0.95,
                rotateY: -5 
              }}
              animate={{
                background: [
                  'linear-gradient(45deg, #10B981, #059669)',
                  'linear-gradient(45deg, #059669, #047857)',
                  'linear-gradient(45deg, #047857, #10B981)',
                  'linear-gradient(45deg, #10B981, #059669)'
                ]
              }}
              transition={{
                background: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                scale: { duration: 0.2 },
                rotateY: { duration: 0.3 }
              }}
              onClick={() => setShowModal(true)}
              className="group relative inline-flex items-center px-8 py-4 text-white rounded-2xl font-bold text-lg shadow-2xl overflow-hidden transform-gpu perspective-1000"
              style={{
                background: 'linear-gradient(45deg, #10B981, #059669)',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              
              {/* Animated particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full opacity-30"
                    animate={{
                      x: [Math.random() * 300, Math.random() * 300],
                      y: [Math.random() * 60, Math.random() * 60],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>
              
              {/* Main content */}
              <div className="relative z-10 flex items-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mr-3"
                >
                  <Plus className="w-6 h-6 drop-shadow-lg" />
                </motion.div>
                
                <span className="drop-shadow-lg">Thêm thành viên mới</span>
                
                {/* Animated arrow */}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.div>
              </div>
              
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12"
                animate={{ x: [-200, 300] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.button>
          )}
        </div>

        {/* Add Member Floating Button for non-admin users to see */}
        {userRole !== 'admin' && (
          <div className="mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Chế độ sinh viên</span>
              </div>
              <p className="text-blue-700 text-sm">
                Bạn đang xem danh sách thành viên. Chỉ admin mới có thể thêm/sửa/xóa thành viên.
              </p>
            </motion.div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng số thành viên</p>
                <p className="text-3xl font-bold text-gray-900">{members.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kỹ năng đa dạng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Array.from(new Set(members.flatMap(m => m.skills ? m.skills.split(', ') : []))).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thành viên mới (2024)</p>
                <p className="text-3xl font-bold text-gray-900">
                  {members.filter(m => {
                    const joinDate = m.joinedAt?.toDate ? m.joinedAt.toDate() : new Date(m.joinedAt);
                    return joinDate.getFullYear() === 2024;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                rotateY: 2
              }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform-gpu perspective-1000 cursor-pointer"
            >
              {/* Card content with gradient overlay on hover */}
              <div className="relative">
                <div className="h-56 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center relative overflow-hidden">
                  {/* Animated background pattern */}
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    animate={{
                      background: [
                        'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {member.profileImageUrl ? (
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      src={member.profileImageUrl}
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.div 
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-white text-6xl drop-shadow-lg"
                    >
                      👤
                    </motion.div>
                  )}
                  
                  {member.fullName === 'Nguyễn Thanh Trúc' && (
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                    >
                      ⭐ Nổi bật
                    </motion.div>
                  )}
                  
                  {/* Hover overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                  />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {member.fullName || 'Chưa có tên'}
                </h3>
                
                {/* Student Info */}
                <div className="mb-3 text-sm text-gray-600">
                  <p><strong>MSSV:</strong> {member.studentId || 'N/A'}</p>
                  <p><strong>Ngành:</strong> {member.major || 'N/A'} - Năm {member.year || 'N/A'}</p>
                  {member.phoneNumber && <p><strong>SĐT:</strong> {member.phoneNumber}</p>}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {(member.skills ? member.skills.split(', ') : []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-gradient-to-r from-primary-100 to-blue-100 text-primary-800 text-sm px-3 py-1 rounded-full font-medium border border-primary-200 shadow-sm"
                    >
                      🎵 {skill}
                    </span>
                  ))}
                </div>

                {/* Experience Level */}
                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    member.experience === 'advanced' ? 'bg-green-100 text-green-800' :
                    member.experience === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {member.experience === 'advanced' ? '🏆 Nâng cao' :
                     member.experience === 'intermediate' ? '📈 Trung bình' :
                     '🌱 Mới bắt đầu'}
                  </span>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {member.bio || 'Chưa có thông tin giới thiệu'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1 text-primary-500" />
                    <span className="font-medium">{formatDate(member.joinedAt)}</span>
                  </div>
                  
                  {userRole === 'admin' && (
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ 
                          scale: 1.1, 
                          boxShadow: "0 8px 25px rgba(59, 130, 246, 0.5)",
                          backgroundColor: "#EBF8FF"
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(member)}
                        className="group relative p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border-2 border-blue-200 hover:border-blue-400 overflow-hidden"
                        title="Chỉnh sửa thành viên"
                      >
                        {/* Animated background */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-10"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Edit size={18} className="relative z-10 drop-shadow-sm" />
                        </motion.div>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ 
                          scale: 1.1, 
                          boxShadow: "0 8px 25px rgba(239, 68, 68, 0.5)",
                          backgroundColor: "#FEF2F2"
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(member.id)}
                        className="group relative p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-400 overflow-hidden"
                        title="Xóa thành viên"
                      >
                        {/* Animated background */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 opacity-0 group-hover:opacity-10"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360] 
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                        />
                        
                        <motion.div
                          whileHover={{ rotate: -15, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Trash2 size={18} className="relative z-10 drop-shadow-sm" />
                        </motion.div>
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy thành viên nào
            </h3>
            <p className="text-gray-600">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button for Admin */}
      {userRole === 'admin' && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.5 
          }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.button
            whileHover={{ 
              scale: 1.15,
              rotate: 15,
              boxShadow: "0 25px 50px rgba(16, 185, 129, 0.6)"
            }}
            whileTap={{ 
              scale: 0.9,
              rotate: -15 
            }}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.2 },
              rotate: { duration: 0.3 }
            }}
            onClick={() => setShowModal(true)}
            className="group relative w-16 h-16 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-full shadow-2xl flex items-center justify-center overflow-hidden"
            style={{
              boxShadow: '0 15px 35px rgba(16, 185, 129, 0.4), 0 5px 15px rgba(0,0,0,0.12)'
            }}
          >
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 bg-white rounded-full"
              animate={{
                scale: [1, 2.5, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Plus icon */}
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative z-10"
            >
              <Plus className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={3} />
            </motion.div>
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
            >
              Thêm thành viên mới
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </motion.div>
          </motion.button>
        </motion.div>
      )}

      {/* Modal for Add/Edit Member */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col"
            >
              <div className="flex-shrink-0 p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">

                <form id="memberForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh *
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+84 123 456 789"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="ten@dlu.edu.vn"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã số sinh viên
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        placeholder="DLU2024001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngành học
                      </label>
                      <input
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        placeholder="Công nghệ thông tin"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Năm học
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Chọn năm</option>
                        <option value="1">Năm 1</option>
                        <option value="2">Năm 2</option>
                        <option value="3">Năm 3</option>
                        <option value="4">Năm 4</option>
                        <option value="5">Năm 5</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kỹ năng (cách nhau bởi dấu phẩy) *
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="Piano, Guitar, Vocal"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trình độ
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="beginner">🌱 Mới bắt đầu</option>
                        <option value="intermediate">📈 Trung bình</option>
                        <option value="advanced">🏆 Nâng cao</option>
                      </select>
                    </div>
                  </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ảnh đại diện
                      </label>
                      
                      {/* Storage Info */}
                      <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-semibold text-yellow-800">⚠️ Thông tin Firebase Storage</h4>
                            <div className="mt-1 text-sm text-yellow-700 space-y-1">
                              <p>
                                <strong>� Tình trạng hiện tại:</strong> Storage chưa được kích hoạt hoặc cấu hình CORS
                              </p>
                              <p>
                                <strong>✅ Giải pháp:</strong> Ảnh sẽ được tối ưu và lưu dạng Base64 (300px, 70% chất lượng)
                              </p>
                              <p>
                                <strong>🎯 Kết quả:</strong> Upload ảnh vẫn hoạt động bình thường 100%!
                              </p>
                              <p>
                                <strong>🚀 Để tối ưu hơn:</strong> Kích hoạt Storage trong Firebase Console
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="mb-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                          />
                        </div>
                      )}
                      
                      {/* File Input */}
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="imageUpload"
                        />
                        <label
                          htmlFor="imageUpload"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {imagePreview ? 'Thay đổi ảnh' : 'Chọn ảnh từ máy'}
                        </label>
                        
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setSelectedImage(null);
                              setFormData({...formData, profileImageUrl: ''});
                            }}
                            className="inline-flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="mr-1 h-4 w-4" />
                            Xóa
                          </button>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Chấp nhận: JPG, PNG, GIF. Tối đa 5MB.
                      </p>
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiểu sử *
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Giới thiệu về bản thân, kinh nghiệm âm nhạc..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                </form>
              </div>
              
              {/* Fixed Bottom Buttons */}
              <div className="flex-shrink-0 flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
                  disabled={uploadingImage}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  form="memberForm"
                  disabled={uploadingImage}
                  className="inline-flex items-center px-8 py-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-lg hover:from-primary-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                >
                  {uploadingImage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Đang upload ảnh...
                    </>
                  ) : (
                    <>
                      {editingMember ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Cập nhật thành viên
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm thành viên mới
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Members;