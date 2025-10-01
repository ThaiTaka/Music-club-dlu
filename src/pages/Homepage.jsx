import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Music, 
  Award, 
  ArrowRight, 
  Send,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

const Homepage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const { currentUser, userRole } = useAuth();

  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, orderBy('date', 'asc'), limit(3));
        const querySnapshot = await getDocs(q);
        
        const events = [];
        querySnapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() });
        });
        
        setUpcomingEvents(events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      setIsSubmittingFeedback(true);
      await addDoc(collection(db, 'feedback'), {
        content: feedback.trim(),
        submittedBy: currentUser.uid,
        submittedAt: new Date()
      });
      
      setFeedback('');
      setFeedbackMessage('Cảm ơn bạn đã gửi góp ý! Chúng tôi sẽ xem xét và phản hồi sớm nhất.');
      setTimeout(() => setFeedbackMessage(''), 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackMessage('Có lỗi xảy ra khi gửi góp ý. Vui lòng thử lại sau.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const stats = [
    { label: 'Thành viên', value: '50+', icon: Users },
    { label: 'Sự kiện', value: '25+', icon: Calendar },
    { label: 'Năm hoạt động', value: '5+', icon: Award },
    { label: 'Nhạc cụ', value: '15+', icon: Music }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-transparent"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 text-6xl">🎼</div>
          <div className="absolute top-40 right-32 text-4xl">🎵</div>
          <div className="absolute bottom-32 left-1/4 text-5xl">🎶</div>
          <div className="absolute bottom-20 right-20 text-3xl">🎤</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Câu lạc bộ Âm nhạc
              <br />
              <span className="text-primary-200">Trường ĐH Đà Lạt</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto"
            >
              Nơi kết nối những tâm hồn yêu âm nhạc, 
              chia sẻ đam mê và cùng nhau tạo nên những giai điệu tuyệt vời
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/su-kien"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0"
              >
                Khám phá Sự kiện
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/thanh-vien"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-semibold rounded-lg text-white bg-transparent hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                Gặp gỡ Thành viên
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4">
                    <Icon size={24} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sự kiện sắp tới
            </h2>
            <p className="text-lg text-gray-600">
              Đừng bỏ lỡ những hoạt động thú vị của câu lạc bộ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-4xl">🎪</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar size={16} className="mr-2" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin size={16} className="mr-2" />
                      {event.location}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chưa có sự kiện nào
                </h3>
                <p className="text-gray-600">
                  Các sự kiện mới sẽ được cập nhật sớm nhất
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/su-kien"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Xem tất cả sự kiện
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Về Câu lạc bộ Âm nhạc DLU
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Được thành lập từ năm 2019, Câu lạc bộ Âm nhạc Trường Đại học Đà Lạt 
                đã trở thành ngôi nhà chung của những bạn sinh viên yêu âm nhạc. 
                Chúng tôi tổ chức nhiều hoạt động đa dạng từ các buổi biểu diễn, 
                workshop đến các cuộc thi âm nhạc.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Với đội ngũ thành viên tài năng và đam mê, chúng tôi không ngừng 
                phát triển và mang đến những trải nghiệm âm nhạc tuyệt vời nhất 
                cho cộng đồng sinh viên.
              </p>
              <Link
                to="/gioi-thieu"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                Tìm hiểu thêm
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🎼</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Sứ mệnh của chúng tôi
              </h3>
              <p className="text-gray-700">
                "Kết nối những tâm hồn yêu âm nhạc, 
                tạo ra môi trường học tập và phát triển tài năng, 
                đóng góp vào đời sống văn hóa tinh thần của trường và cộng đồng."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section - Only for logged in users */}
      {currentUser && userRole === 'user' && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Gửi góp ý cho chúng tôi
              </h2>
              
              <form onSubmit={handleFeedbackSubmit}>
                <div className="mb-6">
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung góp ý
                  </label>
                  <textarea
                    id="feedback"
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Chia sẻ ý kiến, góp ý của bạn về hoạt động của câu lạc bộ..."
                    required
                  />
                </div>

                {feedbackMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 p-4 rounded-md ${
                      feedbackMessage.includes('Cảm ơn') 
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {feedbackMessage}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingFeedback || !feedback.trim()}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Gửi góp ý
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Homepage;