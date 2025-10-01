# Website Câu lạc bộ Âm nhạc Trường Đại học Đà Lạt

Đây là website chính thức của Câu lạc bộ Âm nhạc Trường Đại học Đà Lạt, được xây dựng với React.js, Firebase, và Tailwind CSS.

## 🎵 Tính năng chính

### Cho tất cả người dùng:
- **Trang chủ**: Hero section, sự kiện sắp tới, giới thiệu câu lạc bộ
- **Trang Sự kiện**: Xem danh sách các sự kiện âm nhạc
- **Trang Thành viên**: Gặp gỡ các thành viên của câu lạc bộ
- **Trang Giới thiệu**: Lịch sử, sứ mệnh, tầm nhìn và ban lãnh đạo
- **Trang Thống kê**: Biểu đồ và số liệu thống kê
- **Xác thực người dùng**: Đăng ký, đăng nhập, quên mật khẩu

### Cho người dùng đã đăng nhập:
- **Gửi góp ý**: Chia sẻ ý kiến về hoạt động của câu lạc bộ
- **Cài đặt tài khoản**: Chỉnh sửa thông tin cá nhân, đổi mật khẩu

### Cho Admin:
- **Quản lý sự kiện**: Thêm, sửa, xóa sự kiện
- **Quản lý thành viên**: Thêm, sửa, xóa thông tin thành viên
- **Upload hình ảnh**: Tải ảnh cho sự kiện và thành viên

## 🛠 Công nghệ sử dụng

- **Frontend**: React.js 19 với Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Routing**: React Router DOM
- **Form handling**: React Hook Form
- **Charts**: Chart.js với React-Chartjs-2

## 🚀 Cài đặt và Chạy dự án

### Yêu cầu hệ thống:
- Node.js 18+ 
- npm hoặc yarn

### Bước 1: Clone repository
\`\`\`bash
git clone <repository-url>
cd music-club-website
\`\`\`

### Bước 2: Cài đặt dependencies
\`\`\`bash
npm install
\`\`\`

### Bước 3: Cấu hình Firebase

1. Tạo một dự án Firebase mới tại [Firebase Console](https://console.firebase.google.com/)

2. Bật các dịch vụ sau:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**

3. Cập nhật file `src/config/firebase.js` với thông tin cấu hình Firebase của bạn:

\`\`\`javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};
\`\`\`

### Bước 4: Thiết lập cơ sở dữ liệu

Tạo các collections sau trong Firestore:

#### Collection: `users`
- `uid`: string (từ Firebase Auth)
- `email`: string
- `displayName`: string
- `role`: string ('admin' hoặc 'user')
- `createdAt`: timestamp
- `profileImageUrl`: string

#### Collection: `events`
- `title`: string
- `description`: string
- `date`: timestamp
- `location`: string
- `imageUrl`: string
- `createdBy`: string (uid của admin)

#### Collection: `members`
- `fullName`: string
- `dateOfBirth`: string
- `skills`: string (ví dụ: "Piano, Guitar")
- `bio`: string
- `profileImageUrl`: string
- `joinedAt`: timestamp

#### Collection: `feedback`
- `content`: string
- `submittedBy`: string (uid của người dùng)
- `submittedAt`: timestamp

### Bước 5: Tạo tài khoản Admin
1. Chạy ứng dụng và đăng ký tài khoản bình thường
2. Vào Firestore Console, tìm document của user vừa tạo trong collection `users`
3. Thay đổi field `role` từ `'user'` thành `'admin'`

### Bước 6: Chạy ứng dụng
\`\`\`bash
npm run dev
\`\`\`

Ứng dụng sẽ chạy tại: `http://localhost:5173`

## 👥 Tài khoản Demo

Để test ứng dụng, bạn có thể tạo các tài khoản sau:

**Admin Account:**
- Email: admin@dlu.edu.vn
- Password: AdminPassword123
- Role: admin

**User Account:**
- Email: user@dlu.edu.vn  
- Password: UserPassword123
- Role: user

## 📁 Cấu trúc dự án

\`\`\`
music-club-website/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Homepage.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── About.jsx
│   │   └── Members.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── README.md
\`\`\`

## 🎯 Tính năng nổi bật

### 1. Responsive Design
- Tối ưu cho mobile, tablet và desktop
- Sử dụng Tailwind CSS Grid và Flexbox

### 2. Animations
- Smooth transitions với Framer Motion
- Hover effects và loading states
- Page transitions

### 3. Security
- Firebase Authentication
- Role-based access control (RBAC)
- Protected routes

### 4. User Experience
- Loading states và error handling
- Search và filter functionality
- Intuitive navigation

## 🔧 Scripts có sẵn

\`\`\`bash
# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
\`\`\`

## 🌐 Deploy

### Vercel (Recommended)
1. Push code lên GitHub
2. Kết nối repository với Vercel
3. Thêm environment variables cho Firebase config

### Firebase Hosting
\`\`\`bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build and deploy
npm run build
firebase deploy
\`\`\`

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Dự án được phát hành dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Liên hệ

- **Câu lạc bộ Âm nhạc DLU**
- Email: musicclub@dlu.edu.vn
- Hotline: 0123 456 789
- Website: [https://dlu.edu.vn](https://dlu.edu.vn)

---

Made with ❤️ by Music Club DLU Team+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
