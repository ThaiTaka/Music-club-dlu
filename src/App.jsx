import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import About from './pages/About';
import Members from './pages/Members';
import Events from './pages/Events';
import Statistics from './pages/Statistics';
import AdminSetup from './pages/AdminSetup';
import AdminMembers from './pages/AdminMembers';
import Attendance from './pages/Attendance';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Homepage />} />
            
            {/* Auth routes - redirect to home if already authenticated */}
            <Route path="/dang-nhap" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/dang-ky" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/quen-mat-khau" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />

            {/* Protected routes - require authentication */}
            <Route path="/admin/setup" element={
              <ProtectedRoute>
                <AdminSetup />
              </ProtectedRoute>
            } />

            <Route path="/admin/thanh-vien" element={
              <ProtectedRoute>
                <AdminMembers />
              </ProtectedRoute>
            } />
            
            <Route path="/cai-dat/*" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Trang Cài đặt
                    </h1>
                    <p className="text-gray-600">
                      Tính năng đang được phát triển...
                    </p>
                  </div>
                </div>
              </ProtectedRoute>
            } />

            {/* Other routes */}
            <Route path="/su-kien" element={<Events />} />

            <Route path="/thanh-vien" element={<Members />} />

            <Route path="/diem-danh" element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            } />

            <Route path="/gioi-thieu" element={<About />} />

            <Route path="/thong-ke" element={<Statistics />} />

            {/* 404 route */}
            <Route path="*" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600">Trang không tìm thấy</p>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
