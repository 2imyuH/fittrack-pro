import React, { useState } from 'react';
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

  const handleLogin = () => {
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (user) {
      onLogin(user);
    } else {
      alert('Email hoặc mật khẩu không đúng!');
    }
  };

  const handleRegister = async () => {
    const emailExists = users.some(u => u.email === newUser.email);
    if (emailExists) {
      setRegisterStatus('Email đã tồn tại!');
      return;
    }
    const updatedUsers = [...users, newUser];
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
          workouts
        })
      });
      if (res.ok) {
        setRegisterStatus('Đăng ký thành công!');
        setShowRegister(false);
      } else {
        setRegisterStatus('Đăng ký thất bại!');
      }
    } catch (error) {
      setRegisterStatus('Lỗi kết nối API!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">FitTrack Pro</h1>
          <p className="text-gray-600 mt-2">Quản lý lịch tập thông minh</p>
        </div>

        {!showRegister ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={loginForm.email} 
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                placeholder="your@email.com" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <input 
                type="password" 
                value={loginForm.password} 
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="••••••••" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()} 
              />
            </div>
            <button 
              onClick={handleLogin} 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => setShowRegister(true)} 
              className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Đăng ký tài khoản mới
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <input 
                type="text" 
                value={newUser.name} 
                onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                placeholder="Nguyễn Văn A" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={newUser.email} 
                onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                placeholder="your@email.com" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <input 
                type="password" 
                value={newUser.password} 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                placeholder="••••••••" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn avatar</label>
              <div className="grid grid-cols-7 gap-2">
                {avatarOptions.map(av => (
                  <button 
                    key={av} 
                    type="button" 
                    onClick={() => setNewUser({...newUser, avatar: av})}
                    className={`text-2xl p-2 rounded-lg border-2 transition ${newUser.avatar === av ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 Sau khi đăng ký, bạn có thể cập nhật lịch tập và mục tiêu trong mục <strong>Profile</strong>
              </p>
            </div>
            <button 
              onClick={handleRegister} 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Đăng ký
            </button>
            {registerStatus && (
              <div className="text-center text-sm mt-2">
                {registerStatus}
              </div>
            )}
            <button 
              onClick={() => setShowRegister(false)} 
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Quay lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginScreen;