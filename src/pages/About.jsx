import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Award, 
  Music, 
  Calendar,
  Heart,
  Star,
  Zap
} from 'lucide-react';

const About = () => {
  const milestones = [
    {
      year: '2019',
      title: 'Thành lập CLB',
      description: 'Câu lạc bộ Âm nhạc được thành lập với 15 thành viên đầu tiên'
    },
    {
      year: '2020',
      title: 'Buổi biểu diễn đầu tiên',
      description: 'Tổ chức thành công chương trình "Đêm nhạc mùa xuân" đầu tiên'
    },
    {
      year: '2021',
      title: 'Mở rộng hoạt động',
      description: 'Phát triển thành 30+ thành viên và tổ chức nhiều workshop âm nhạc'
    },
    {
      year: '2022',
      title: 'Giải thưởng đầu tiên',
      description: 'Đạt giải Nhất cuộc thi "Tài năng âm nhạc sinh viên" toàn trường'
    },
    {
      year: '2023',
      title: 'Phát triển mạnh mẽ',
      description: 'Trở thành một trong những CLB hoạt động tích cực nhất trường'
    },
    {
      year: '2024',
      title: 'Hiện tại',
      description: '50+ thành viên tích cực, tổ chức 25+ sự kiện âm nhạc'
    }
  ];

  const leadership = [
    {
      name: 'Nguyễn Văn An',
      position: 'Chủ nhiệm CLB',
      specialty: 'Guitar, Piano',
      bio: 'Sinh viên năm 4 ngành CNTT, đam mê âm nhạc từ nhỏ. Đã có 8 năm kinh nghiệm chơi guitar và 5 năm piano.',
      image: 'https://placehold.co/300x300/3B82F6/FFFFFF?text=Nguyen+Van+An'
    },
    {
      name: 'Trần Thị Bình',
      position: 'Phó chủ nhiệm',
      specialty: 'Vocal, Ukulele',
      bio: 'Sinh viên năm 3 ngành Kinh tế, giọng ca chính của nhiều chương trình lớn của câu lạc bộ.',
      image: 'https://placehold.co/300x300/3B82F6/FFFFFF?text=Tran+Thi+Binh'
    },
    {
      name: 'Lê Minh Cường',
      position: 'Trưởng ban tổ chức',
      specialty: 'Drums, Bass',
      bio: 'Sinh viên năm 3 ngành Cơ khí, chuyên gia về rhythm và là linh hồn của mọi buổi biểu diễn.',
      image: 'https://placehold.co/300x300/3B82F6/FFFFFF?text=Le+Minh+Cuong'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Đam mê',
      description: 'Tình yêu chân thành với âm nhạc là nền tảng của mọi hoạt động'
    },
    {
      icon: Users,
      title: 'Đoàn kết',
      description: 'Xây dựng cộng đồng gắn kết, hỗ trợ lẫn nhau trong học tập và phát triển'
    },
    {
      icon: Star,
      title: 'Chất lượng',
      description: 'Không ngừng nâng cao kỹ năng và chất lượng các buổi biểu diễn'
    },
    {
      icon: Zap,
      title: 'Sáng tạo',
      description: 'Khuyến khích sự sáng tạo và đổi mới trong âm nhạc'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Về chúng tôi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto"
          >
            Câu lạc bộ Âm nhạc Trường Đại học Đà Lạt - Nơi kết nối những tâm hồn yêu âm nhạc
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-primary-50 p-8 rounded-lg"
            >
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Sứ mệnh</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Tạo ra một môi trường âm nhạc tích cực và chuyên nghiệp, nơi mà mọi sinh viên 
                có thể phát triển tài năng âm nhạc của mình, học hỏi từ nhau và cùng nhau 
                tạo nên những trải nghiệm âm nhạc đáng nhớ. Chúng tôi cam kết đóng góp 
                vào đời sống văn hóa tinh thần của trường và cộng đồng.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-blue-50 p-8 rounded-lg"
            >
              <div className="flex items-center mb-6">
                <Award className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Tầm nhìn</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Trở thành câu lạc bộ âm nhạc hàng đầu của Trường Đại học Đà Lạt, 
                được công nhận về chất lượng hoạt động và đóng góp tích cực cho 
                cộng đồng. Chúng tôi hướng tới việc tạo ra một thế hệ sinh viên 
                có tình yêu âm nhạc sâu sắc và kỹ năng âm nhạc vững vàng.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-lg text-gray-600">
              Những giá trị định hướng mọi hoạt động của câu lạc bộ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lịch sử phát triển
            </h2>
            <p className="text-lg text-gray-600">
              Hành trình 5 năm xây dựng và phát triển câu lạc bộ
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <div className="text-2xl font-bold text-primary-600 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="w-4 h-4 bg-primary-500 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                  
                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ban chủ nhiệm
            </h2>
            <p className="text-lg text-gray-600">
              Đội ngũ lãnh đạo tận tâm và nhiệt huyết
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="h-64 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {leader.name}
                  </h3>
                  <div className="text-primary-600 font-medium mb-2">
                    {leader.position}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    Chuyên môn: {leader.specialty}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {leader.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Tham gia cùng chúng tôi
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Bạn có đam mê với âm nhạc? Hãy tham gia Câu lạc bộ Âm nhạc DLU 
              để cùng chúng tôi tạo nên những khoảnh khắc âm nhạc tuyệt vời!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:musicclub@dlu.edu.vn"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-600 transition-all duration-300"
              >
                <Music className="mr-2 h-5 w-5" />
                Liên hệ: musicclub@dlu.edu.vn
              </a>
              <a
                href="tel:+84123456789"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-600 transition-all duration-300"
              >
                📞 Hotline: 0123 456 789
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;