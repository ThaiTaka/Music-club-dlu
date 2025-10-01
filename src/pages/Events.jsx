import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  X,
  Upload,
  MapPin,
  Clock,
  Users,
  Search,
  Eye,
  Image as ImageIcon
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

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    imageUrl: '',
    status: 'upcoming'
  });

  const { currentUser: user, userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  // Debug: Check admin status
  console.log('🔍 Current user:', user?.email);
  console.log('🔑 User Role:', userRole);
  console.log('🔑 Is Admin:', isAdmin);

  // Sample events data for fallback
  const sampleEvents = [
    {
      id: 'sample1',
      title: 'Concert Nhạc Acoustic',
      description: 'Một buổi tối đầy cảm xúc với những bản nhạc acoustic nhẹ nhàng từ các thành viên CLB.',
      date: new Date('2025-10-15'),
      time: '19:00',
      location: 'Hội trường A - Trường ĐH Đà Lạt',
      capacity: 200,
      imageUrl: 'https://placehold.co/800x600/8B5CF6/FFFFFF?text=Acoustic+Concert',
      status: 'upcoming',
      createdAt: new Date()
    },
    {
      id: 'sample2',
      title: 'Workshop Sáng tác nhạc',
      description: 'Học cách sáng tác và sản xuất nhạc từ những người có kinh nghiệm trong ngành.',
      date: new Date('2025-10-20'),
      time: '14:00',
      location: 'Phòng 301 - Nhà A',
      capacity: 50,
      imageUrl: 'https://placehold.co/800x600/10B981/FFFFFF?text=Music+Workshop',
      status: 'upcoming',
      createdAt: new Date()
    },
    {
      id: 'sample3',
      title: 'Giao lưu âm nhạc',
      description: 'Gặp gỡ và giao lưu với các nghệ sĩ âm nhạc trong và ngoài trường.',
      date: new Date('2025-09-10'),
      time: '18:00',
      location: 'Sân khấu ngoài trời',
      capacity: 300,
      imageUrl: 'https://placehold.co/800x600/F59E0B/FFFFFF?text=Music+Exchange',
      status: 'completed',
      createdAt: new Date()
    }
  ];

  // Fetch events from Firestore with realtime updates
  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Setup realtime listener
      const eventsRef = collection(db, 'events');
      const unsubscribe = onSnapshot(eventsRef, (querySnapshot) => {
        const fetchedEvents = [];
        querySnapshot.forEach((doc) => {
          fetchedEvents.push({ id: doc.id, ...doc.data() });
        });
        
        // If no events in Firestore, use sample data
        if (fetchedEvents.length === 0) {
          setEvents(sampleEvents);
          console.log('📝 Using sample event data - no events found in Firestore');
        } else {
          setEvents(fetchedEvents);
          console.log(`📊 Loaded ${fetchedEvents.length} events from Firestore`);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error fetching events:', error);
        // Fallback to sample data on error
        setEvents(sampleEvents);
        setLoading(false);
      });
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up events listener:', error);
      // Fallback to sample data on error
      setEvents(sampleEvents);
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe;
    
    const setupListener = async () => {
      unsubscribe = await fetchEvents();
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
  const processImageToBase64 = (file, maxWidth = 800, quality = 0.8) => {
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
        
        console.log(`🎯 Event image optimized: ${img.width}x${img.height} → ${canvas.width}x${canvas.height}`);
        console.log(`📦 Base64 size: ${(compressedBase64.length / 1024).toFixed(1)}KB`);
        resolve(compressedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('❌ Vui lòng nhập tiêu đề sự kiện!');
      return;
    }
    
    if (!formData.date) {
      alert('❌ Vui lòng chọn ngày diễn ra!');
      return;
    }
    
    try {
      let imageUrl = formData.imageUrl;
      
      // Process image if selected
      if (selectedImage) {
        console.log('📤 Processing event image...');
        setUploadingImage(true);
        
        // Process image to optimized Base64 (800px, 80% quality for events)
        imageUrl = await processImageToBase64(selectedImage, 800, 0.8);
        console.log('✅ Event image processed and optimized successfully!');
        
        setUploadingImage(false);
      }

      const eventData = {
        ...formData,
        imageUrl: imageUrl || '',
        capacity: parseInt(formData.capacity) || 0,
        updatedAt: new Date()
      };

      if (editingEvent) {
        // Update event
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
        console.log('✅ Event updated successfully');
        alert('✅ Cập nhật sự kiện thành công!');
      } else {
        // Add new event
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: new Date()
        });
        console.log('✅ Event added successfully');
        alert('✅ Thêm sự kiện thành công!');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        capacity: '',
        imageUrl: '',
        status: 'upcoming'
      });
      setSelectedImage(null);
      setImagePreview('');
      setShowModal(false);
      setEditingEvent(null);
      
    } catch (error) {
      console.error('Error saving event:', error);
      alert(`❌ Lỗi lưu sự kiện: ${error.message}`);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? 
        (event.date.toDate ? event.date.toDate().toISOString().split('T')[0] : 
         event.date instanceof Date ? event.date.toISOString().split('T')[0] : 
         event.date) : '',
      time: event.time || '',
      location: event.location || '',
      capacity: event.capacity || '',
      imageUrl: event.imageUrl || '',
      status: event.status || 'upcoming'
    });
    setImagePreview(event.imageUrl || '');
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ Bạn có chắc chắn muốn xóa sự kiện này?')) {
      try {
        await deleteDoc(doc(db, 'events', id));
        console.log('✅ Event deleted successfully');
        alert('✅ Xóa sự kiện thành công!');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert(`❌ Lỗi xóa sự kiện: ${error.message}`);
      }
    }
  };

  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const filteredEvents = events.filter(event =>
    (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu sự kiện...</p>
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
                <Calendar className="mr-3 text-purple-600" size={32} />
                Sự kiện CLB Âm nhạc
              </h1>
              <p className="text-gray-600 mt-2">
                {isAdmin ? 'Quản lý sự kiện câu lạc bộ' : 'Danh sách sự kiện câu lạc bộ'} - 
                Tổng: {filteredEvents.length} sự kiện
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Add Event Button - Only for Admin */}
              {isAdmin && (
                <motion.button
                  onClick={() => {
                    setEditingEvent(null);
                    setFormData({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      location: '',
                      capacity: '',
                      imageUrl: '',
                      status: 'upcoming'
                    });
                    setSelectedImage(null);
                    setImagePreview('');
                    setShowModal(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.95 }}
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
                  Thêm sự kiện
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sự kiện</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy thêm sự kiện đầu tiên!'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
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
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                onClick={() => !isAdmin && handleViewDetail(event)}
              >
                {/* Event Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                  <img
                    src={event.imageUrl || 'https://placehold.co/800x600/8B5CF6/FFFFFF?text=No+Image'}
                    alt={event.title || 'Sự kiện'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/800x600/8B5CF6/FFFFFF?text=No+Image';
                    }}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {event.status === 'completed' ? '✓ Đã diễn ra' : '⏰ Sắp diễn ra'}
                    </span>
                  </div>
                  
                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(event);
                        }}
                        className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event.id);
                        }}
                        className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(event);
                        }}
                        className="bg-purple-500 text-white p-2 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Eye size={16} />
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                    {event.title || 'Chưa có tiêu đề'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {event.description || 'Chưa có mô tả'}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <Calendar size={14} className="mr-2 text-purple-500" />
                      {event.date ? 
                        (event.date.toDate ? 
                          event.date.toDate().toLocaleDateString('vi-VN') : 
                          new Date(event.date).toLocaleDateString('vi-VN')
                        ) : 'Chưa có ngày'
                      }
                      {event.time && ` - ${event.time}`}
                    </p>
                    <p className="flex items-center">
                      <MapPin size={14} className="mr-2 text-red-500" />
                      {event.location || 'Chưa có địa điểm'}
                    </p>
                    {event.capacity > 0 && (
                      <p className="flex items-center">
                        <Users size={14} className="mr-2 text-green-500" />
                        Sức chứa: {event.capacity} người
                      </p>
                    )}
                  </div>
                  
                  {/* View Detail Button for non-admin */}
                  {!isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(event);
                      }}
                      className="mt-4 w-full bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Xem chi tiết
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Event Modal */}
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
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
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
                      {editingEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-semibold text-green-800">✅ Hệ thống Upload Tối ưu</h4>
                        <div className="mt-1 text-sm text-green-700">
                          <p><strong>🎯 Ảnh sự kiện:</strong> Base64 tối ưu (800px, 80% chất lượng)</p>
                          <p><strong>💡 Miễn phí:</strong> Không cần Firebase Storage</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ảnh sự kiện
                      </label>
                      <div className="flex items-center space-x-4">
                        {/* Image Preview */}
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="text-gray-400" size={32} />
                          )}
                        </div>
                        
                        {/* Upload Button */}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="event-image-upload"
                          />
                          <label
                            htmlFor="event-image-upload"
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
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Nhập tiêu đề sự kiện"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mô tả
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Mô tả chi tiết về sự kiện..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày diễn ra <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thời gian
                        </label>
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Địa điểm
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Địa điểm tổ chức"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sức chứa
                        </label>
                        <input
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Số người tối đa"
                          min="0"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="upcoming">Sắp diễn ra</option>
                          <option value="completed">Đã diễn ra</option>
                        </select>
                      </div>
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
                        ) : editingEvent ? 'Cập nhật' : 'Thêm sự kiện'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedEvent && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Event Detail Header Image */}
                <div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100">
                  <img
                    src={selectedEvent.imageUrl || 'https://placehold.co/800x600/8B5CF6/FFFFFF?text=Event'}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/800x600/8B5CF6/FFFFFF?text=Event';
                    }}
                  />
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="absolute top-4 right-4 bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedEvent.status === 'completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {selectedEvent.status === 'completed' ? '✓ Đã diễn ra' : '⏰ Sắp diễn ra'}
                    </span>
                  </div>
                </div>

                {/* Event Detail Content */}
                <div className="p-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    {selectedEvent.title}
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <Calendar className="text-purple-500 mr-3 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-gray-700">Thời gian</p>
                        <p className="text-gray-600">
                          {selectedEvent.date ? 
                            (selectedEvent.date.toDate ? 
                              selectedEvent.date.toDate().toLocaleDateString('vi-VN', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 
                              new Date(selectedEvent.date).toLocaleDateString('vi-VN', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            ) : 'Chưa có ngày'
                          }
                          {selectedEvent.time && ` - ${selectedEvent.time}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="text-red-500 mr-3 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-gray-700">Địa điểm</p>
                        <p className="text-gray-600">{selectedEvent.location || 'Chưa có địa điểm'}</p>
                      </div>
                    </div>

                    {selectedEvent.capacity > 0 && (
                      <div className="flex items-start">
                        <Users className="text-green-500 mr-3 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="font-semibold text-gray-700">Sức chứa</p>
                          <p className="text-gray-600">{selectedEvent.capacity} người</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Mô tả sự kiện</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {selectedEvent.description || 'Chưa có mô tả chi tiết.'}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                  >
                    Đóng
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Events;
