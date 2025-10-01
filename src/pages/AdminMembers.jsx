import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Music,
  Crown,
  User,
  UserCheck,
  Upload,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminMembers = () => {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    birthDate: '',
    instrument: '',
    experience: 'beginner',
    role: 'member',
    phoneNumber: '',
    studentId: '',
    major: '',
    year: 1,
    bio: '',
    achievements: [],
    isActive: true
  });

  // Danh sách vai trò nhạc cụ
  const instruments = [
    'Guitar', 'Piano', 'Vocalist', 'Drums', 'Bass Guitar', 
    'Violin', 'Saxophone', 'Trumpet', 'Ukulele', 'Keyboard',
    'Flute', 'Clarinet', 'Cello', 'Harmonica', 'DJ/Producer'
  ];

  // Danh sách chức vụ
  const roles = [
    { value: 'admin', label: 'Quản trị viên', icon: Crown },
    { value: 'president', label: 'Trưởng câu lạc bộ', icon: UserCheck },
    { value: 'vice-president', label: 'Phó câu lạc bộ', icon: User },
    { value: 'moderator', label: 'Điều phối viên', icon: Users },
    { value: 'member', label: 'Thành viên', icon: User }
  ];

  // Mức độ kinh nghiệm
  const experiences = [
    { value: 'beginner', label: 'Mới bắt đầu' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' },
    { value: 'expert', label: 'Chuyên gia' }
  ];

  // Fetch members từ Firebase
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const membersRef = collection(db, 'members');
      const q = query(membersRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const membersList = [];
      querySnapshot.forEach((doc) => {
        membersList.push({ id: doc.id, ...doc.data() });
      });
      
      setMembers(membersList);
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Lỗi khi tải danh sách thành viên');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      avatar: '',
      birthDate: '',
      instrument: '',
      experience: 'beginner',
      role: 'member',
      phoneNumber: '',
      studentId: '',
      major: '',
      year: 1,
      bio: '',
      achievements: [],
      isActive: true
    });
    setEditingMember(null);
    setShowAddForm(false);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.instrument) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      if (editingMember) {
        // Update member
        await updateDoc(doc(db, 'members', editingMember.id), {
          ...formData,
          updatedAt: new Date()
        });
        alert('Cập nhật thành viên thành công!');
      } else {
        // Add new member
        await addDoc(collection(db, 'members'), {
          ...formData,
          joinDate: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          createdBy: currentUser.email
        });
        alert('Thêm thành viên thành công!');
      }
      
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Có lỗi xảy ra khi lưu thành viên');
    }
  };

  // Handle edit
  const handleEdit = (member) => {
    setFormData({
      name: member.name || '',
      email: member.email || '',
      avatar: member.avatar || '',
      birthDate: member.birthDate || '',
      instrument: member.instrument || '',
      experience: member.experience || 'beginner',
      role: member.role || 'member',
      phoneNumber: member.phoneNumber || '',
      studentId: member.studentId || '',
      major: member.major || '',
      year: member.year || 1,
      bio: member.bio || '',
      achievements: member.achievements || [],
      isActive: member.isActive !== undefined ? member.isActive : true
    });
    setEditingMember(member);
    setShowAddForm(true);
  };

  // Handle delete
  const handleDelete = async (memberId, memberName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${memberName}"?`)) {
      try {
        await deleteDoc(doc(db, 'members', memberId));
        alert('Xóa thành viên thành công!');
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Có lỗi xảy ra khi xóa thành viên');
      }
    }
  };

  // Filter members based on search
  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.instrument?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user is admin
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8" />
              Quản lý Thành viên
            </h1>
            <p className="mt-2 text-blue-100">
              Thêm, sửa, xóa thông tin thành viên câu lạc bộ
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thành viên..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Add Member Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Thêm thành viên
              </motion.button>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tổng thành viên</p>
                    <p className="text-xl font-bold text-blue-600">{members.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Đang hoạt động</p>
                    <p className="text-xl font-bold text-green-600">
                      {members.filter(m => m.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ban quản trị</p>
                    <p className="text-xl font-bold text-purple-600">
                      {members.filter(m => ['admin', 'president', 'vice-president'].includes(m.role)).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                      {editingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Họ và tên */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="example@dlu.edu.vn"
                      />
                    </div>

                    {/* Avatar URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hình ảnh (URL)
                      </label>
                      <input
                        type="url"
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>

                    {/* Ngày sinh */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Vai trò nhạc cụ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vai trò nhạc cụ *
                      </label>
                      <select
                        required
                        value={formData.instrument}
                        onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Chọn nhạc cụ</option>
                        {instruments.map(instrument => (
                          <option key={instrument} value={instrument}>{instrument}</option>
                        ))}
                      </select>
                    </div>

                    {/* Chức vụ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chức vụ *
                      </label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Kinh nghiệm */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mức độ kinh nghiệm
                      </label>
                      <select
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {experiences.map(exp => (
                          <option key={exp.value} value={exp.value}>{exp.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+84 xxx xxx xxx"
                      />
                    </div>

                    {/* MSSV */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã số sinh viên
                      </label>
                      <input
                        type="text"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="DLU001"
                      />
                    </div>

                    {/* Ngành học */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngành học
                      </label>
                      <input
                        type="text"
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Công nghệ thông tin"
                      />
                    </div>

                    {/* Năm học */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Năm học
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={1}>Năm 1</option>
                        <option value={2}>Năm 2</option>
                        <option value={3}>Năm 3</option>
                        <option value={4}>Năm 4</option>
                        <option value={5}>Năm 5</option>
                      </select>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiểu sử
                    </label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mô tả ngắn về thành viên..."
                    />
                  </div>

                  {/* Status */}
                  <div className="mt-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Thành viên đang hoạt động</span>
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="mt-8 flex justify-end gap-4">
                    <motion.button
                      type="button"
                      onClick={resetForm}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      {editingMember ? 'Cập nhật' : 'Thêm mới'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Members List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Danh sách thành viên ({filteredMembers.length})
            </h2>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Không tìm thấy thành viên nào' : 'Chưa có thành viên nào'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => {
                  const roleInfo = roles.find(r => r.value === member.role) || roles.find(r => r.value === 'member');
                  const RoleIcon = roleInfo.icon;

                  return (
                    <motion.div
                      key={member.id}
                      whileHover={{ y: -4 }}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <div className="p-6">
                        {/* Avatar và thông tin chính */}
                        <div className="flex items-start gap-4 mb-4">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                            alt={member.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {member.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">{member.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <RoleIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">
                                {roleInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Thông tin chi tiết */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Music className="w-4 h-4" />
                            <span>{member.instrument || 'Chưa cập nhật'}</span>
                          </div>
                          {member.birthDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(member.birthDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              member.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.isActive ? 'Đang hoạt động' : 'Tạm nghỉ'}
                            </span>
                          </div>
                        </div>

                        {/* Bio */}
                        {member.bio && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {member.bio}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(member)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Sửa
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(member.id, member.name)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMembers;