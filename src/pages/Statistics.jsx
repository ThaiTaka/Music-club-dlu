import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar,
  TrendingUp,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    membersByMajor: {},
    recentActivities: []
  });

  const { currentUser: user, userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch members
      const membersSnapshot = await getDocs(collection(db, 'members'));
      const membersData = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate statistics
      const membersByMajor = {};
      membersData.forEach(member => {
        const major = member.major || 'Chưa xác định';
        membersByMajor[major] = (membersByMajor[major] || 0) + 1;
      });

      const upcomingEvents = eventsData.filter(event => event.status === 'upcoming').length;
      const completedEvents = eventsData.filter(event => event.status === 'completed').length;

      // Create recent activities
      const recentActivities = [
        ...membersData.slice(0, 3).map(m => ({
          type: 'member',
          title: `${m.fullName} đã tham gia CLB`,
          time: m.joinedAt || m.createdAt,
          icon: 'user'
        })),
        ...eventsData.slice(0, 3).map(e => ({
          type: 'event',
          title: e.title,
          time: e.createdAt,
          icon: 'calendar'
        }))
      ].sort((a, b) => {
        const timeA = a.time?.toDate ? a.time.toDate() : new Date(a.time);
        const timeB = b.time?.toDate ? b.time.toDate() : new Date(b.time);
        return timeB - timeA;
      }).slice(0, 5);

      setStats({
        totalMembers: membersData.length,
        upcomingEvents,
        completedEvents,
        membersByMajor,
        recentActivities
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  // Generate colors for chart
  const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#14B8A6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 flex items-center mb-2">
            <BarChart3 className="mr-3 text-purple-600" size={40} />
            Thống kê & Báo cáo
          </h1>
          <p className="text-gray-600">
            Tổng quan hoạt động của CLB Âm nhạc Đại học Đà Lạt
          </p>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Members Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white p-3 rounded-lg shadow-inner">
                <Users size={36} className="text-purple-600" strokeWidth={2.5} />
              </div>
              <TrendingUp size={28} className="text-purple-100" strokeWidth={2} />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.totalMembers}</h3>
            <p className="text-purple-100">Tổng thành viên</p>
          </motion.div>

          {/* Upcoming Events Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white p-3 rounded-lg shadow-inner">
                <Calendar size={36} className="text-pink-600" strokeWidth={2.5} />
              </div>
              <Clock size={28} className="text-pink-100" strokeWidth={2} />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.upcomingEvents}</h3>
            <p className="text-pink-100">Sự kiện sắp tới</p>
          </motion.div>

          {/* Completed Events Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white p-3 rounded-lg shadow-inner">
                <CheckCircle size={36} className="text-green-600" strokeWidth={2.5} />
              </div>
              <Award size={28} className="text-green-100" strokeWidth={2} />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.completedEvents}</h3>
            <p className="text-green-100">Sự kiện đã tổ chức</p>
          </motion.div>

          {/* Total Events Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white p-3 rounded-lg shadow-inner">
                <Activity size={36} className="text-blue-600" strokeWidth={2.5} />
              </div>
              <BarChart3 size={28} className="text-blue-100" strokeWidth={2} />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.upcomingEvents + stats.completedEvents}</h3>
            <p className="text-blue-100">Tổng sự kiện</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members by Major Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-6">
              <PieChart className="text-purple-600 mr-3" size={28} strokeWidth={2.5} />
              <h2 className="text-xl font-bold text-gray-800">Thành viên theo Chuyên ngành</h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(stats.membersByMajor).map(([major, count], index) => {
                const percentage = ((count / stats.totalMembers) * 100).toFixed(1);
                const color = colors[index % colors.length];
                
                return (
                  <motion.div
                    key={major}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{major}</span>
                      <span className="text-gray-600">{count} người ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
              
              {Object.keys(stats.membersByMajor).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Chưa có dữ liệu thành viên</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-6">
              <Activity className="text-green-600 mr-3" size={28} strokeWidth={2.5} />
              <h2 className="text-xl font-bold text-gray-800">Hoạt động gần đây</h2>
            </div>
            
            <div className="space-y-4">
              {stats.recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex-shrink-0 p-2.5 rounded-full ${
                    activity.icon === 'user' ? 'bg-purple-100' : 'bg-pink-100'
                  }`}>
                    {activity.icon === 'user' ? (
                      <Users size={18} className="text-purple-600" strokeWidth={2.5} />
                    ) : (
                      <Calendar size={18} className="text-pink-600" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.time ? (
                        activity.time.toDate ? 
                          activity.time.toDate().toLocaleDateString('vi-VN') :
                          new Date(activity.time).toLocaleDateString('vi-VN')
                      ) : 'Gần đây'}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {stats.recentActivities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Chưa có hoạt động nào</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Additional Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Event Status Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="mr-2 text-purple-600" size={24} strokeWidth={2.5} />
              Phân bố Sự kiện
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sắp diễn ra</span>
                <span className="text-yellow-600 font-bold">{stats.upcomingEvents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Đã hoàn thành</span>
                <span className="text-green-600 font-bold">{stats.completedEvents}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-semibold">Tổng cộng</span>
                  <span className="text-purple-600 font-bold text-lg">
                    {stats.upcomingEvents + stats.completedEvents}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Indicators */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="mr-2 text-green-600" size={24} strokeWidth={2.5} />
              Chỉ số Tăng trưởng
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Thành viên hoạt động</span>
                <span className="text-green-600 font-bold">
                  {Math.round((stats.totalMembers * 0.85))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tham gia/tháng</span>
                <span className="text-blue-600 font-bold">+{Math.round(stats.totalMembers / 6)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-semibold">Tỷ lệ tham gia</span>
                  <span className="text-purple-600 font-bold text-lg">85%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Award className="mr-2 text-yellow-600" size={24} strokeWidth={2.5} />
              Thống kê Nhanh
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Chuyên ngành</span>
                <span className="text-purple-600 font-bold">
                  {Object.keys(stats.membersByMajor).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Trung bình/ngành</span>
                <span className="text-blue-600 font-bold">
                  {Object.keys(stats.membersByMajor).length > 0 
                    ? Math.round(stats.totalMembers / Object.keys(stats.membersByMajor).length)
                    : 0}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-semibold">Sự kiện/tháng</span>
                  <span className="text-pink-600 font-bold text-lg">
                    {Math.round((stats.upcomingEvents + stats.completedEvents) / 3)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 text-center"
        >
          <p className="text-gray-700">
            📊 Dữ liệu được cập nhật từ Firebase Firestore • 
            <span className="font-semibold ml-2">CLB Âm nhạc Đại học Đà Lạt</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;
