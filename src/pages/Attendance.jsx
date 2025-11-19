import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Users, 
  Calendar,
  Check,
  X,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const Attendance = () => {
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, present, absent
  const [showStats, setShowStats] = useState(true);

  const { currentUser: user, userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  // Fetch events from Firestore
  useEffect(() => {
    const eventsRef = collection(db, 'events');
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = [];
      snapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by date (newest first)
      eventsData.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });
      
      setEvents(eventsData);
      
      // Auto-select first event if none selected
      if (eventsData.length > 0 && !selectedEvent) {
        setSelectedEvent(eventsData[0]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch members from Firestore
  useEffect(() => {
    const membersRef = collection(db, 'members');
    const unsubscribe = onSnapshot(membersRef, (snapshot) => {
      const membersData = [];
      snapshot.forEach((doc) => {
        membersData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by name
      membersData.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
      
      setMembers(membersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch attendances for selected event
  useEffect(() => {
    if (!selectedEvent) {
      setAttendances([]);
      return;
    }

    const attendancesRef = collection(db, 'attendances');
    const q = query(attendancesRef, where('eventId', '==', selectedEvent.id));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attendancesData = [];
      snapshot.forEach((doc) => {
        attendancesData.push({ id: doc.id, ...doc.data() });
      });
      setAttendances(attendancesData);
    });

    return () => unsubscribe();
  }, [selectedEvent]);

  // Check if member is checked in
  const isCheckedIn = (memberId) => {
    return attendances.some(att => att.memberId === memberId && att.status === 'present');
  };

  // Get attendance record for member
  const getAttendance = (memberId) => {
    return attendances.find(att => att.memberId === memberId);
  };

  // Handle check-in
  const handleCheckIn = async (member) => {
    if (!selectedEvent) {
      alert('⚠️ Vui lòng chọn sự kiện để điểm danh!');
      return;
    }

    try {
      const existingAttendance = getAttendance(member.id);

      if (existingAttendance) {
        // Update existing attendance
        if (existingAttendance.status === 'present') {
          // Mark as absent
          await updateDoc(doc(db, 'attendances', existingAttendance.id), {
            status: 'absent',
            updatedAt: Timestamp.now(),
            updatedBy: user?.email || 'unknown'
          });
          console.log(`✅ ${member.fullName} đã được đánh dấu vắng mặt`);
        } else {
          // Mark as present
          await updateDoc(doc(db, 'attendances', existingAttendance.id), {
            status: 'present',
            checkedInAt: Timestamp.now(),
            checkedInBy: user?.email || 'unknown',
            updatedAt: Timestamp.now(),
            updatedBy: user?.email || 'unknown'
          });
          console.log(`✅ ${member.fullName} đã điểm danh thành công`);
        }
      } else {
        // Create new attendance record
        await addDoc(collection(db, 'attendances'), {
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          memberId: member.id,
          memberName: member.fullName,
          memberEmail: member.email,
          studentId: member.studentId,
          status: 'present',
          checkedInAt: Timestamp.now(),
          checkedInBy: user?.email || 'unknown',
          createdAt: Timestamp.now()
        });
        console.log(`✅ ${member.fullName} đã điểm danh thành công`);
      }
    } catch (error) {
      console.error('Error checking in:', error);
      alert(`❌ Lỗi điểm danh: ${error.message}`);
    }
  };

  // Calculate statistics
  const getStats = () => {
    const totalMembers = members.length;
    const presentCount = attendances.filter(att => att.status === 'present').length;
    const absentCount = totalMembers - presentCount;
    const percentage = totalMembers > 0 ? ((presentCount / totalMembers) * 100).toFixed(1) : 0;

    return {
      totalMembers,
      presentCount,
      absentCount,
      percentage
    };
  };

  // Filter members based on search and status
  const getFilteredMembers = () => {
    let filtered = members.filter(member =>
      (member.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus === 'present') {
      filtered = filtered.filter(member => isCheckedIn(member.id));
    } else if (filterStatus === 'absent') {
      filtered = filtered.filter(member => !isCheckedIn(member.id));
    }

    return filtered;
  };

  // Export attendance to CSV
  const exportToCSV = () => {
    if (!selectedEvent) {
      alert('⚠️ Vui lòng chọn sự kiện!');
      return;
    }

    const stats = getStats();
    const csvData = [];
    
    // Header
    csvData.push(['Báo cáo điểm danh sự kiện']);
    csvData.push(['Sự kiện:', selectedEvent.title]);
    csvData.push(['Ngày:', selectedEvent.date ? new Date(selectedEvent.date.toDate ? selectedEvent.date.toDate() : selectedEvent.date).toLocaleDateString('vi-VN') : '']);
    csvData.push(['Tổng số thành viên:', stats.totalMembers]);
    csvData.push(['Có mặt:', stats.presentCount]);
    csvData.push(['Vắng mặt:', stats.absentCount]);
    csvData.push(['Tỷ lệ:', `${stats.percentage}%`]);
    csvData.push([]); // Empty row
    
    // Table header
    csvData.push(['STT', 'Họ tên', 'MSSV', 'Email', 'Trạng thái', 'Thời gian điểm danh', 'Người điểm danh']);
    
    // Data rows
    members.forEach((member, index) => {
      const attendance = getAttendance(member.id);
      const status = attendance?.status === 'present' ? 'Có mặt' : 'Vắng mặt';
      const checkedInAt = attendance?.checkedInAt ? 
        new Date(attendance.checkedInAt.toDate()).toLocaleString('vi-VN') : '';
      const checkedInBy = attendance?.checkedInBy || '';
      
      csvData.push([
        index + 1,
        member.fullName || '',
        member.studentId || '',
        member.email || '',
        status,
        checkedInAt,
        checkedInBy
      ]);
    });

    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `diem-danh-${selectedEvent.title.replace(/\s+/g, '-')}-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Đã xuất file CSV thành công');
  };

  const stats = getStats();
  const filteredMembers = getFilteredMembers();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu điểm danh...</p>
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
                <UserCheck className="mr-3 text-purple-600" size={32} />
                Điểm danh sự kiện
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý điểm danh thành viên tham gia sự kiện
              </p>
            </div>
          </div>
        </motion.div>

        {/* Event Selection */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn sự kiện để điểm danh
          </label>
          <select
            value={selectedEvent?.id || ''}
            onChange={(e) => {
              const event = events.find(ev => ev.id === e.target.value);
              setSelectedEvent(event);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {events.length === 0 ? (
              <option value="">Không có sự kiện nào</option>
            ) : (
              events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {event.date ? 
                    new Date(event.date.toDate ? event.date.toDate() : event.date).toLocaleDateString('vi-VN') : 
                    'Chưa có ngày'
                  }
                </option>
              ))
            )}
          </select>
        </motion.div>

        {/* Statistics */}
        {selectedEvent && (
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <AlertCircle className="mr-2 text-purple-600" size={24} />
                Thống kê điểm danh
              </h2>
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                {showStats ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>

            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Members */}
                    <motion.div 
                      className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Tổng số</p>
                          <p className="text-3xl font-bold text-blue-700">{stats.totalMembers}</p>
                        </div>
                        <Users className="text-blue-500" size={40} />
                      </div>
                    </motion.div>

                    {/* Present */}
                    <motion.div 
                      className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Có mặt</p>
                          <p className="text-3xl font-bold text-green-700">{stats.presentCount}</p>
                        </div>
                        <CheckCircle className="text-green-500" size={40} />
                      </div>
                    </motion.div>

                    {/* Absent */}
                    <motion.div 
                      className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-red-600 font-medium">Vắng mặt</p>
                          <p className="text-3xl font-bold text-red-700">{stats.absentCount}</p>
                        </div>
                        <XCircle className="text-red-500" size={40} />
                      </div>
                    </motion.div>

                    {/* Percentage */}
                    <motion.div 
                      className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Tỷ lệ</p>
                          <p className="text-3xl font-bold text-purple-700">{stats.percentage}%</p>
                        </div>
                        <Calendar className="text-purple-500" size={40} />
                      </div>
                    </motion.div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Tiến độ điểm danh</span>
                      <span>{stats.presentCount}/{stats.totalMembers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Filters and Search */}
        {selectedEvent && (
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm thành viên (tên, MSSV, email)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filter by Status */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter size={16} className="inline mr-1" />
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterStatus('present')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'present'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle size={16} className="inline mr-1" />
                  Có mặt
                </button>
                <button
                  onClick={() => setFilterStatus('absent')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'absent'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <XCircle size={16} className="inline mr-1" />
                  Vắng mặt
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Xuất CSV
              </button>
            </div>
          </motion.div>
        )}

        {/* Members List */}
        {!selectedEvent ? (
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa chọn sự kiện</h3>
            <p className="text-gray-500">
              Vui lòng chọn sự kiện để bắt đầu điểm danh
            </p>
          </motion.div>
        ) : filteredMembers.length === 0 ? (
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy thành viên</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có thành viên nào trong hệ thống'}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Ảnh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Họ tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      MSSV
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member, index) => {
                    const checkedIn = isCheckedIn(member.id);
                    const attendance = getAttendance(member.id);
                    
                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`hover:bg-gray-50 transition-colors ${
                          checkedIn ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={member.profileImageUrl || 'https://placehold.co/40x40/8B5CF6/FFFFFF?text=User'}
                            alt={member.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/40x40/8B5CF6/FFFFFF?text=User';
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{member.fullName}</div>
                          <div className="text-sm text-gray-500">{member.major}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.studentId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {checkedIn ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <CheckCircle size={16} className="mr-1" />
                              Có mặt
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              <XCircle size={16} className="mr-1" />
                              Vắng mặt
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance?.checkedInAt ? (
                            <div>
                              <div className="flex items-center text-gray-700">
                                <Clock size={14} className="mr-1" />
                                {new Date(attendance.checkedInAt.toDate()).toLocaleTimeString('vi-VN')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(attendance.checkedInAt.toDate()).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <motion.button
                            onClick={() => handleCheckIn(member)}
                            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                              checkedIn
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {checkedIn ? (
                              <>
                                <X size={16} className="mr-1" />
                                Hủy
                              </>
                            ) : (
                              <>
                                <Check size={16} className="mr-1" />
                                Điểm danh
                              </>
                            )}
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
