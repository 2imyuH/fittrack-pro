import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

const API_CONFIG = {
  binId: '68edbaefd0ea881f40a182ab',
  apiKey: '$2a$10$dHnng3RdRYlhAxHnRKQcJOgwgnnWXfzpy6cee.NDyjHFZ1BqaNq.a',
  baseUrl: 'https://api.jsonbin.io/v3/b'
};

const avatarOptions = ['👨', '👩', '👨‍💼', '👩‍💼', '🧑', '👨‍🎓', '👩‍🎓', '🧔', '👴', '👵', '💪', '🏃', '🚴', '🏋️'];

function LoginScreen({ onLogin, users, setUsers, workouts }) {
  const [showRegister, setShowRegister] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [newUser, setNewUser] = useState({
    name: '', 
    email: '', 
    password: '', 
    role: 'member', 
    goal: 16, 
    group: 'Team A',
    avatar: '👤', 
    phone: '', 
    weeklySchedule: [1, 3, 5],
    streakData: { 
      currentStreak: 0, 
      longestStreak: 0, 
      recoveryChances: 3, 
      lastWorkoutDate: null, 
      weeksMissed: [] 
    }
  });
  const [registerStatus, setRegisterStatus] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Load Google Identity Services
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // ✅ FIX: Hàm xử lý đăng nhập Google
  const handleGoogleLogin = async (response) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const googleEmail = payload.email;
      const googleName = payload.name;
      const googlePicture = payload.picture;

      // Tìm user hiện tại
      let existingUser = users.find(u => u.email === googleEmail);
      let updatedUsers = [...users];
      let currentUser;

      if (!existingUser) {
        // Tạo user mới nếu chưa tồn tại
        const newGoogleUser = {
          id: Date.now(),
          name: googleName,
          email: googleEmail,
          password: 'google-oauth',
          role: 'member',
          goal: 16,
          group: 'Team A',
          avatar: '👤',
          googleAvatar: googlePicture,
          googleName: googleName,
          phone: '',
          weeklySchedule: [1, 3, 5],
          streakData: {
            currentStreak: 0,
            longestStreak: 0,
            recoveryChances: 3,
            lastWorkoutDate: null,
            weeksMissed: [],
            lastUpdated: new Date().toISOString()
          },
          isGoogleAccount: true,
          workouts: []
        };

        updatedUsers.push(newGoogleUser);
        currentUser = newGoogleUser;
      } else {
        // ✅ User đã tồn tại -> DÙNG DỮ LIỆU CŨ, chỉ cập nhật ảnh avatar mới nhất
        const updatedExistingUser = {
          ...existingUser,
          googleAvatar: googlePicture // Chỉ cập nhật ảnh Google mới nhất
        };
        
        updatedUsers = users.map(u => 
          u.email === googleEmail ? updatedExistingUser : u
        );
        currentUser = updatedExistingUser;
      }

      // ✅ LƯU TRƯỚC KHI LOGIN
      setUsers(updatedUsers);

      try {
        await fetch(`${API_CONFIG.baseUrl}/${API_CONFIG.binId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_CONFIG.apiKey
          },
          body: JSON.stringify({
            users: updatedUsers,
            lastUpdated: new Date().toISOString()
          })
        });
      } catch (err) {
        console.error('Failed to save to JSONBin:', err);
      }

      // ✅ Gọi onLogin SAU KHI đã lưu
      onLogin(currentUser);
      
    } catch (error) {
      console.error('Google login error:', error);
      alert('Đăng nhập Google thất bại!');
    }
  };

  // Initialize Google Sign-In button
  useEffect(() => {
    if (googleLoaded && window.google && !showRegister) {
      try {
        const GOOGLE_CLIENT_ID = '694684260774-b5h4q5oajijuofjvigivqc9fag1ba5q6.apps.googleusercontent.com';
        
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const buttonDiv = document.getElementById('googleSignInButton');
        if (buttonDiv) {
          buttonDiv.innerHTML = '';
          window.google.accounts.id.renderButton(
            buttonDiv,
            { 
              theme: 'outline', 
              size: 'large', 
              width: buttonDiv.offsetWidth,
              text: 'continue_with',
              locale: 'vi',
              shape: 'rectangular'
            }
          );
        }
      } catch (err) {
        console.error('Google button render error:', err);
      }
    }
  }, [googleLoaded, showRegister, users]);

  // ✅ FIX: Hàm đăng nhập thông thường
  const handleLogin = () => {
    if (!loginForm.email || !loginForm.password) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }

    const user = users.find(u => 
      u.email === loginForm.email && u.password === loginForm.password
    );
    
    if (user) {
      onLogin(user);
    } else {
      alert('Email hoặc mật khẩu không đúng!');
    }
  };

  // ✅ FIX: Hàm đăng ký
  const handleRegister = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setRegisterStatus('⚠️ Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setRegisterStatus('⚠️ Email không hợp lệ!');
      return;
    }

    // Kiểm tra mật khẩu tối thiểu 6 ký tự
    if (newUser.password.length < 6) {
      setRegisterStatus('⚠️ Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    // Kiểm tra email trùng lặp
    const emailExists = users.some(u => u.email === newUser.email);
    if (emailExists) {
      setRegisterStatus('⚠️ Email đã tồn tại!');
      return;
    }

    // Tạo user mới với đầy đủ thông tin
    const userToAdd = {
      ...newUser,
      id: Date.now(),
      workouts: [],
      isGoogleAccount: false,
      streakData: {
        ...newUser.streakData,
        lastUpdated: new Date().toISOString()
      }
    };

    const updatedUsers = [...users, userToAdd];
    setUsers(updatedUsers);

    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/${API_CONFIG.binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_CONFIG.apiKey
        },
        body: JSON.stringify({
          users: updatedUsers,
          lastUpdated: new Date().toISOString()
        })
      });
      
      if (res.ok) {
        setRegisterStatus('✓ Đăng ký thành công!');
        setTimeout(() => {
          setShowRegister(false);
          setRegisterStatus('');
          // Reset form
          setNewUser({
            name: '', 
            email: '', 
            password: '', 
            role: 'member', 
            goal: 16, 
            group: 'Team A',
            avatar: '👤', 
            phone: '', 
            weeklySchedule: [1, 3, 5],
            streakData: { 
              currentStreak: 0, 
              longestStreak: 0, 
              recoveryChances: 3, 
              lastWorkoutDate: null, 
              weeksMissed: [] 
            }
          });
        }, 1500);
      } else {
        setRegisterStatus('✗ Đăng ký thất bại!');
      }
    } catch (error) {
      console.error('Register error:', error);
      setRegisterStatus('✗ Lỗi kết nối API!');
    }
  };

  // ✅ Xử lý Enter key
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💪</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {showRegister ? 'Đăng Ký' : 'Đăng Nhập'}
          </h1>
          <p className="text-gray-600">
            {showRegister 
              ? 'Tạo tài khoản mới để bắt đầu' 
              : 'Chào mừng trở lại!'}
          </p>
        </div>

        {!showRegister ? (
          // ========== FORM ĐĂNG NHẬP ==========
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
            >
              Đăng Nhập
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            {/* Google Sign-In */}
            <div id="googleSignInButton" className="w-full"></div>

            {/* Register Link */}
            <p className="text-center text-gray-600 mt-6">
              Chưa có tài khoản?{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        ) : (
          // ========== FORM ĐĂNG KÝ ==========
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  onKeyPress={(e) => handleKeyPress(e, handleRegister)}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showRegisterPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tối thiểu 6 ký tự
              </p>
            </div>

            {/* Status Message */}
            {registerStatus && (
              <div className={`text-center py-2 px-4 rounded-lg ${
                registerStatus.includes('✓') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {registerStatus}
              </div>
            )}

            {/* Register Button */}
            <button
              onClick={handleRegister}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
            >
              Đăng Ký
            </button>

            {/* Back to Login */}
            <button
              onClick={() => {
                setShowRegister(false);
                setRegisterStatus('');
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition duration-200"
            >
              ← Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginScreen;