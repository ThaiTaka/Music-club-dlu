import { collection, addDoc, doc, setDoc, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../config/firebase';

// Tạo sample data cho Events
export const createSampleEvents = async () => {
  const events = [
    {
      id: 'event-1',
      title: 'Đêm nhạc Acoustic tháng 10',
      description: 'Một buổi biểu diễn nhạc Acoustic ấm cúng với các thành viên câu lạc bộ',
      date: '2025-10-15',
      time: '19:00',
      location: 'Hội trường A, Đại học Đà Lạt',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      organizer: 'Music Club DLU',
      maxParticipants: 100,
      currentParticipants: 0,
      status: 'upcoming',
      createdAt: new Date(),
      createdBy: 'admin@dlu.edu.vn'
    },
    {
      id: 'event-2', 
      title: 'Workshop Guitar cơ bản',
      description: 'Khóa học guitar cơ bản dành cho người mới bắt đầu',
      date: '2025-10-22',
      time: '14:00',
      location: 'Phòng nhạc B201',
      image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800',
      organizer: 'Nguyễn Văn A',
      maxParticipants: 20,
      currentParticipants: 0,
      status: 'upcoming',
      createdAt: new Date(),
      createdBy: 'admin@dlu.edu.vn'
    },
    {
      id: 'event-3',
      title: 'Buổi biểu diễn cuối tháng',
      description: 'Showcase các tài năng âm nhạc của thành viên câu lạc bộ',
      date: '2025-10-30',
      time: '18:30',
      location: 'Sân khấu chính, Đại học Đà Lạt',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
      organizer: 'Music Club DLU',
      maxParticipants: 200,
      currentParticipants: 0,
      status: 'upcoming',
      createdAt: new Date(),
      createdBy: 'admin@dlu.edu.vn'
    }
  ];

  try {
    let successCount = 0;
    let failedEvents = [];
    
    for (const event of events) {
      try {
        await setDoc(doc(db, 'events', event.id), event);
        console.log(`✅ Created event: ${event.title}`);
        successCount++;
      } catch (eventError) {
        console.error(`❌ Failed to create event ${event.title}:`, eventError);
        failedEvents.push({ title: event.title, error: eventError.message });
      }
    }
    
    if (failedEvents.length > 0) {
      console.warn(`⚠️ ${failedEvents.length} events failed to create`);
    }
    
    console.log(`🎉 Successfully created ${successCount}/${events.length} sample events!`);
    
    if (failedEvents.length === events.length) {
      throw new Error('All events failed to create');
    }
  } catch (error) {
    console.error('❌ Critical error creating sample events:', error);
    throw error;
  }
};

// Tạo sample data cho Members
export const createSampleMembers = async () => {
  const members = [
    {
      id: 'member-1',
      name: 'Nguyễn Văn Admin',
      email: 'admin@dlu.edu.vn',
      role: 'admin',
      instrument: 'Guitar, Piano',
      experience: 'advanced',
      joinDate: '2024-01-15',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: 'Founder và quản trị viên của Music Club. Có kinh nghiệm 8 năm chơi guitar và piano.',
      phoneNumber: '+84 123 456 789',
      studentId: 'DLU001',
      major: 'Công nghệ thông tin',
      year: 4,
      isActive: true,
      achievements: ['Giải nhất Guitar Contest 2023', 'Best Performance Award 2024']
    },
    {
      id: 'member-2',
      name: 'Trần Thị Bích',
      email: 'bich.tran@dlu.edu.vn',
      role: 'member',
      instrument: 'Vocals, Ukulele',
      experience: 'intermediate',
      joinDate: '2024-03-10',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      bio: 'Ca sĩ chính của câu lạc bộ, đam mê âm nhạc pop và acoustic.',
      phoneNumber: '+84 987 654 321',
      studentId: 'DLU002',
      major: 'Văn học',
      year: 3,
      isActive: true,
      achievements: ['Best Vocalist 2024']
    },
    {
      id: 'member-3',
      name: 'Lê Minh Hoàng',
      email: 'hoang.le@dlu.edu.vn',
      role: 'member',
      instrument: 'Drums',
      experience: 'advanced',
      joinDate: '2024-02-20',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Drummer có kinh nghiệm, chuyên rock và jazz.',
      phoneNumber: '+84 456 789 123',
      studentId: 'DLU003',
      major: 'Âm nhạc',
      year: 2,
      isActive: true,
      achievements: ['Rhythm Master Award 2024']
    },
    {
      id: 'member-4',
      name: 'Phạm Thu Hương',
      email: 'huong.pham@dlu.edu.vn',
      role: 'member',
      instrument: 'Piano, Keyboard',
      experience: 'intermediate',
      joinDate: '2024-04-05',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      bio: 'Pianist tài năng, yêu thích nhạc cổ điển và ballad.',
      phoneNumber: '+84 321 654 987',
      studentId: 'DLU004',
      major: 'Kinh tế',
      year: 1,
      isActive: true,
      achievements: []
    },
    {
      id: 'member-5',
      name: 'Võ Đăng Khoa',
      email: 'khoa.vo@dlu.edu.vn',
      role: 'moderator',
      instrument: 'Bass Guitar',
      experience: 'advanced',
      joinDate: '2024-01-30',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      bio: 'Bass player chính, phụ trách tổ chức sự kiện và workshop.',
      phoneNumber: '+84 789 123 456',
      studentId: 'DLU005',
      major: 'Âm nhạc',
      year: 4,
      isActive: true,
      achievements: ['Event Organizer of the Year 2024']
    }
  ];

  try {
    for (const member of members) {
      await setDoc(doc(db, 'members', member.id), member);
      console.log(`✅ Created member: ${member.name}`);
    }
    console.log('🎉 All sample members created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample members:', error);
  }
};

// Tạo club settings
export const createClubSettings = async () => {
  const settings = {
    clubName: 'Music Club - Đại học Đà Lạt',
    description: 'Câu lạc bộ âm nhạc của sinh viên Đại học Đà Lạt',
    establishedYear: 2020,
    totalMembers: 5,
    totalEvents: 3,
    contactEmail: 'musicclub@dlu.edu.vn',
    contactPhone: '+84 263 3822 246',
    address: 'Đại học Đà Lạt, 1 Phù Đổng Thiên Vương, Phường 8, Đà Lạt',
    socialMedia: {
      facebook: 'https://facebook.com/musicclubdlu',
      instagram: 'https://instagram.com/musicclubdlu',
      youtube: 'https://youtube.com/@musicclubdlu'
    },
    rules: [
      'Tham gia đầy đủ các buổi họp định kỳ',
      'Tôn trọng các thành viên khác trong câu lạc bộ',
      'Đóng phí câu lạc bộ đúng hạn',
      'Tích cực tham gia các hoạt động và sự kiện'
    ],
    updatedAt: new Date()
  };

  try {
    await setDoc(doc(db, 'settings', 'club-info'), settings);
    console.log('✅ Club settings created successfully!');
  } catch (error) {
    console.error('❌ Error creating club settings:', error);
  }
};

// Chạy tất cả setup functions
export const initializeFirebaseData = async () => {
  console.log('🔥 Starting Firebase data initialization...');
  
  try {
    // Kiểm tra Firebase connection trước
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    
    // Test kết nối Firebase trước khi tạo data
    console.log('🔗 Testing Firebase connection...');
    
    // Thử tạo một test document để kiểm tra kết nối
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Connection test'
    };
    
    try {
      await setDoc(doc(db, 'test', 'connection-test'), testDoc);
      console.log('✅ Firebase connection successful!');
    } catch (connectionError) {
      console.error('❌ Firebase connection failed:', connectionError);
      
      // Thông báo lỗi chi tiết cho user
      let errorMessage = '❌ Không thể kết nối đến Firebase!\n\n';
      
      if (connectionError.code === 'permission-denied') {
        errorMessage += '🔒 Lỗi phân quyền: Firestore Security Rules có thể đang chặn truy cập.\n\n';
        errorMessage += '💡 Giải pháp:\n';
        errorMessage += '1. Vào Firebase Console > Firestore Database > Rules\n';
        errorMessage += '2. Tạm thời set rules như sau:\n';
        errorMessage += 'rules_version = "2";\n';
        errorMessage += 'service cloud.firestore {\n';
        errorMessage += '  match /databases/{database}/documents {\n';
        errorMessage += '    match /{document=**} {\n';
        errorMessage += '      allow read, write: if true;\n';
        errorMessage += '    }\n';
        errorMessage += '  }\n';
        errorMessage += '}\n\n';
        errorMessage += '⚠️ Lưu ý: Đây chỉ là rules tạm thời cho development!';
      } else if (connectionError.code === 'unavailable') {
        errorMessage += '🌐 Lỗi kết nối mạng hoặc Firebase service unavailable.\n\n';
        errorMessage += '💡 Giải pháp:\n';
        errorMessage += '1. Kiểm tra kết nối internet\n';
        errorMessage += '2. Thử lại sau vài phút\n';
        errorMessage += '3. Kiểm tra Firebase Console xem service có hoạt động không';
      } else if (connectionError.code === 'failed-precondition') {
        errorMessage += '⚠️ Firestore chưa được khởi tạo hoặc config sai.\n\n';
        errorMessage += '� Giải pháp:\n';
        errorMessage += '1. Vào Firebase Console > Firestore Database\n';
        errorMessage += '2. Nếu chưa có database, click "Create database"\n';
        errorMessage += '3. Chọn location gần nhất (asia-southeast1)\n';
        errorMessage += '4. Chọn "Start in test mode" để bắt đầu';
      } else {
        errorMessage += `🔍 Chi tiết lỗi: ${connectionError.message}\n`;
        errorMessage += `📝 Error Code: ${connectionError.code}\n\n`;
        errorMessage += '💡 Giải pháp chung:\n';
        errorMessage += '1. Kiểm tra Firebase config trong firebase.js\n';
        errorMessage += '2. Đảm bảo project ID đúng\n';
        errorMessage += '3. Kiểm tra API keys\n';
        errorMessage += '4. Xem Console để biết thêm chi tiết';
      }
      
      return {
        success: false,
        message: errorMessage,
        errorCode: connectionError.code,
        originalError: connectionError.message
      };
    }
    
    console.log('�📝 Creating sample events...');
    await createSampleEvents();
    
    console.log('👥 Creating sample members...');
    await createSampleMembers();  
    
    console.log('⚙️ Creating club settings...');
    await createClubSettings();
    
    // Xóa test document
    try {
      await setDoc(doc(db, 'test', 'connection-test'), { deleted: true });
      console.log('🧹 Cleaned up test data');
    } catch (cleanupError) {
      console.log('ℹ️ Test cleanup failed, but main data creation succeeded');
    }
    
    console.log('🎉 Firebase data initialization completed successfully!');
    return {
      success: true,
      message: '✅ Đã tạo thành công sample data cho Firebase!\n\n� Dữ liệu đã tạo:\n�📝 3 Events mẫu\n👥 5 Members mẫu\n⚙️ Club Settings\n\n🔍 Kiểm tra Firestore Database để xem các collections:\n- events\n- members\n- settings\n\n🎉 Website đã sẵn sàng sử dụng!'
    };
  } catch (error) {
    console.error('❌ Error initializing Firebase data:', error);
    
    let errorMessage = `❌ Có lỗi khi tạo sample data!\n\n`;
    errorMessage += `🔍 Chi tiết lỗi: ${error.message}\n\n`;
    errorMessage += `📋 Checklist khắc phục:\n`;
    errorMessage += `✓ Kiểm tra Firebase config trong firebase.js\n`;
    errorMessage += `✓ Đảm bảo Firestore Database đã được enable\n`;
    errorMessage += `✓ Kiểm tra Security Rules (có thể cần set thành public tạm thời)\n`;
    errorMessage += `✓ Kiểm tra kết nối internet\n`;
    errorMessage += `✓ Xem Console để biết thêm chi tiết\n\n`;
    errorMessage += `🔗 Firebase Console: https://console.firebase.google.com/project/music-club-dlu`;
    
    return {
      success: false,
      message: errorMessage,
      errorDetails: error.message,
      stackTrace: error.stack
    };
  }
};