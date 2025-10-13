import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, BarChart3, TrendingUp, Target, Award, Plus, Edit2, Trash2, Bell, CheckCircle, XCircle, Flame, Key, Save, LogOut, UserPlus, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_CONFIG = {
  binId: 'T68ecae5e43b1c97be965256f',
  apiKey: '$2a$10$Qf0.pmWvc6etTO/18Qj/nupFDsF9Up8l7efIR7wu7a78XUnU1CQsy',
  baseUrl: 'https://api.jsonbin.io/v3/b'
};

const initialWorkouts = [
  { id: 1, userId: 1, date: '2025-10-01', type: 'Gym', status: 'completed', duration: 90, notes: 'Tập tay và vai', muscleGroups: ['Tay', 'Vai'] },
  { id: 2, userId: 1, date: '2025-10-03', type: 'Cardio', status: 'completed', duration: 45, notes: 'Chạy bộ 5km', muscleGroups: [] },
  { id: 3, userId: 1, date: '2025-10-05', type: 'Gym', status: 'completed', duration: 85, notes: 'Tập chân', muscleGroups: ['Chân'] },
  { id: 4, userId: 2, date: '2025-10-02', type: 'Gym', status: 'completed', duration: 60, notes: 'Tập ngực', muscleGroups: ['Ngực'] },
  { id: 5, userId: 2, date: '2025-10-04', type: 'Yoga', status: 'completed', duration: 60, notes: 'Yoga buổi sáng', muscleGroups: [] },
];

const initialUsers = [
  { id: 1, name: 'Nguyễn Văn An', email: 'an@example.com', password: '123456', role: 'admin', avatar: '👨', goal: 20, group: 'Team A', phone: '0901234567' },
  { id: 2, name: 'Trần Thị Bình', email: 'binh@example.com', password: '123456', role: 'member', avatar: '👩', goal: 16, group: 'Team A', phone: '0901234568' },
];

const workoutTypes = ['Gym', 'Cardio', 'Yoga', 'Swimming', 'Boxing', 'Cycling'];
const muscleGroups = ['Ngực', 'Lưng', 'Vai', 'Tay', 'Chân', 'Bụng', 'Mông'];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
const avatarOptions = ['👨', '👩', '👨‍💼', '👩‍💼', '🧑', '👨‍🎓', '👩‍🎓', '🧔', '👴', '👵'];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [users, setUsers] = useState(initialUsers);
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [statsRange, setStatsRange] = useState(1);
  const [compareUsers, setCompareUsers] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState('');
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  
  const [newWorkout, setNewWorkout] = useState({
    date: '',
    type: 'Gym',
    duration: 60,
    notes: '',
    status: 'completed',
    muscleGroups: []
  });
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    goal: 16,
    group: 'Team A',
    avatar: '👤',
    phone: ''
  });

  useEffect(() => {
    const savedAuth = localStorage.getItem('fittrack_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      const user = users.find(u => u.email === authData.email);
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
    }
    loadDataFromAPI();
  }, []);

  useEffect(() => {
    if (isLoggedIn && workouts.length > 0) {
      saveDataToAPI();
    }
  }, [workouts]);

  const loadDataFromAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.baseUrl}/${API_CONFIG.binId}/latest`, {
        headers: {
          'X-Master-Key': API_CONFIG.apiKey
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.record) {
          setWorkouts(data.record.workouts || initialWorkouts);
          setUsers(data.record.users || initialUsers);
          setSaveStatus('✓ Đã tải dữ liệu');
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setSaveStatus('✗ Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const saveDataToAPI = async () => {
    try {
      setLoading(true);
      setSaveStatus('Đang lưu...');
      
      const response = await fetch(`${API_CONFIG.baseUrl}/${API_CONFIG.binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_CONFIG.apiKey
        },
        body: JSON.stringify({
          workouts,
          users,
          lastUpdated: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setSaveStatus('✓ Đã lưu tự động');
      } else {
        setSaveStatus('✗ Lỗi khi lưu');
      }
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu:', error);
      setSaveStatus('✗ Lỗi kết nối');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleLogin = () => {
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('fittrack_auth', JSON.stringify({ email: user.email }));
      setLoginForm({ email: '', password: '' });
    } else {
      alert('Email hoặc mật khẩu không đúng!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('fittrack_auth');
    setActiveTab('dashboard');
  };

  const handleRegister = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    if (users.find(u => u.email === newUser.email)) {
      alert('Email đã tồn tại!');
      return;
    }

    const user = {
      id: Date.now(),
      ...newUser
    };
    
    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    
    // Lưu vào API
    try {
      await fetch(`${API_CONFIG.baseUrl}/${API_CONFIG.binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_CONFIG.apiKey
        },
        body: JSON.stringify({
          workouts,
          users: updatedUsers,
          lastUpdated: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
    }
    
    setShowRegister(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'member',
      goal: 16,
      group: 'Team A',
      avatar: '👤',
      phone: ''
    });
    
    // Hiển thị thông báo thành công rõ ràng
    setLoginForm({ email: user.email, password: '' });
    setTimeout(() => {
      alert('🎉 Đăng ký thành công!\n\nEmail: ' + user.email + '\n\nVui lòng nhập mật khẩu để đăng nhập.');
    }, 100);
  };

  const toggleMuscleGroup = (group) => {
    const current = newWorkout.muscleGroups || [];
    if (current.includes(group)) {
      setNewWorkout({
        ...newWorkout,
        muscleGroups: current.filter(g => g !== group)
      });
    } else {
      setNewWorkout({
        ...newWorkout,
        muscleGroups: [...current, group]
      });
    }
  };

  const toggleEditMuscleGroup = (group) => {
    if (!editingWorkout) return;
    const current = editingWorkout.muscleGroups || [];
    if (current.includes(group)) {
      setEditingWorkout({
        ...editingWorkout,
        muscleGroups: current.filter(g => g !== group)
      });
    } else {
      setEditingWorkout({
        ...editingWorkout,
        muscleGroups: [...current, group]
      });
    }
  };

  const handleAddWorkout = () => {
    if (!newWorkout.date) {
      alert('Vui lòng chọn ngày tập!');
      return;
    }
    
    const workout = {
      id: Date.now(),
      userId: currentUser.id,
      ...newWorkout,
      muscleGroups: newWorkout.muscleGroups || []
    };
    
    setWorkouts([...workouts, workout]);
    setShowAddModal(false);
    setNewWorkout({ date: '', type: 'Gym', duration: 60, notes: '', status: 'completed', muscleGroups: [] });
  };

  const handleQuickAdd = () => {
    if (!newWorkout.muscleGroups || newWorkout.muscleGroups.length === 0) {
      alert('Vui lòng chọn ít nhất 1 nhóm cơ!');
      return;
    }
    
    const workout = {
      id: Date.now(),
      userId: currentUser.id,
      date: quickAddDate,
      type: newWorkout.type,
      duration: newWorkout.duration,
      notes: '',
      status: 'completed',
      muscleGroups: newWorkout.muscleGroups
    };
    
    setWorkouts([...workouts, workout]);
    setShowQuickAdd(false);
    setNewWorkout({ date: '', type: 'Gym', duration: 60, notes: '', status: 'completed', muscleGroups: [] });
  };

  const handleEditWorkout = () => {
    if (!editingWorkout) return;
    
    setWorkouts(workouts.map(w => 
      w.id === editingWorkout.id ? { ...editingWorkout } : w
    ));
    setShowEditModal(false);
    setEditingWorkout(null);
  };

  const handleDeleteWorkout = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa buổi tập này?')) {
      setWorkouts(workouts.filter(w => w.id !== id));
    }
  };

  const getDateRange = (months) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - months);
    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  const stats = useMemo(() => {
    if (!currentUser) return { completed: 0, missed: 0, percentage: 0, typeCount: {} };
    
    const range = getDateRange(statsRange);
    const rangeWorkouts = workouts.filter(w => 
      w.userId === currentUser.id && 
      w.date >= range.start && 
      w.date <= range.end
    );
    
    const completed = rangeWorkouts.filter(w => w.status === 'completed').length;
    const missed = rangeWorkouts.filter(w => w.status === 'missed').length;
    const targetDays = statsRange * 30;
    const percentage = Math.round((completed / (currentUser.goal * statsRange)) * 100);
    
    const typeCount = {};
    rangeWorkouts.forEach(w => {
      if (w.status === 'completed') {
        typeCount[w.type] = (typeCount[w.type] || 0) + 1;
      }
    });
    
    return { completed, missed, percentage, typeCount, rangeWorkouts };
  }, [workouts, currentUser, statsRange]);

  const comparisonStats = useMemo(() => {
    const range = getDateRange(statsRange);
    const selectedUsers = compareUsers.length > 0 ? compareUsers : users.map(u => u.id);
    
    return selectedUsers.map(userId => {
      const user = users.find(u => u.id === userId);
      const userWorkouts = workouts.filter(w => 
        w.userId === userId && 
        w.date >= range.start && 
        w.date <= range.end &&
        w.status === 'completed'
      );
      
      return {
        name: user?.name || 'Unknown',
        workouts: userWorkouts.length,
        totalDuration: userWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        avatar: user?.avatar || '👤'
      };
    });
  }, [workouts, users, statsRange, compareUsers]);

  if (!isLoggedIn) {
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="text-center text-sm text-gray-600 mt-4">
                <p>Demo: an@example.com / 123456</p>
              </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mục tiêu tháng</label>
                <input
                  type="number"
                  value={newUser.goal}
                  onChange={(e) => setNewUser({...newUser, goal: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleRegister}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Đăng ký
              </button>
              <button
                onClick={() => setShowRegister(false)}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Quay lại đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">FitTrack Pro</h1>
                <p className="text-sm text-gray-500">Quản lý lịch tập thông minh</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {saveStatus && (
                <span className={`text-sm font-medium ${saveStatus.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveStatus}
                </span>
              )}
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  {currentUser.avatar}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Đăng xuất"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 border">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Lịch Tập
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              activeTab === 'compare' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            So Sánh
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Thống kê:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 6].map(month => (
                    <button
                      key={month}
                      onClick={() => setStatsRange(month)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        statsRange === month
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {month} tháng
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Buổi Hoàn Thành</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.completed}</h3>
                    <p className="text-green-100 text-xs mt-1">/ {currentUser.goal * statsRange} mục tiêu</p>
                  </div>
                  <CheckCircle className="w-12 h-12 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Hoàn Thành</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.percentage}%</h3>
                    <p className="text-blue-100 text-xs mt-1">{statsRange} tháng qua</p>
                  </div>
                  <Target className="w-12 h-12 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Bỏ Lỡ</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.missed}</h3>
                    <p className="text-red-100 text-xs mt-1">buổi tập</p>
                  </div>
                  <XCircle className="w-12 h-12 opacity-80" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Phân Bố Loại Bài Tập</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.typeCount).map(([type, count]) => ({
                        name: type,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(stats.typeCount).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Xu Hướng Tập Luyện</h3>
                <div className="space-y-3">
                  {Object.entries(stats.typeCount)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, count]) => {
                      const percentage = (count / stats.completed) * 100;
                      return (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{type}</span>
                            <span className="text-gray-600">{count} buổi</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Lịch Tập Gần Đây</h3>
              <div className="space-y-2">
                {workouts
                  .filter(w => w.userId === currentUser.id)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map(workout => (
                  <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${workout.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium">{workout.type}</p>
                        <p className="text-sm text-gray-500">{workout.date} • {workout.duration} phút</p>
                        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {workout.muscleGroups.map(group => (
                              <span key={group} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {group}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingWorkout({ ...workout });
                          setShowEditModal(true);
                        }}
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="p-2 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex justify-between items-center">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  Thêm Buổi Tập
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const [year, month] = selectedMonth.split('-').map(Number);
                  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = CN, 1 = T2, ...
                  const daysInMonth = new Date(year, month, 0).getDate();
                  const cells = [];
                  
                  // Thêm ô trống cho các ngày trước ngày 1
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(
                      <div key={`empty-${i}`} className="aspect-square border border-transparent p-2"></div>
                    );
                  }
                  
                  // Thêm các ngày trong tháng
                  for (let i = 1; i <= daysInMonth; i++) {
                    const date = selectedMonth + '-' + String(i).padStart(2, '0');
                    const dayWorkouts = workouts.filter(w => w.userId === currentUser.id && w.date === date);
                    const hasCompleted = dayWorkouts.some(w => w.status === 'completed');
                    const hasMissed = dayWorkouts.some(w => w.status === 'missed');
                    
                    cells.push(
                      <div
                        key={i}
                        onClick={() => {
                          setQuickAddDate(date);
                          setShowQuickAdd(true);
                          setNewWorkout({ date: '', type: 'Gym', duration: 60, notes: '', status: 'completed', muscleGroups: [] });
                        }}
                        className={`aspect-square border rounded-lg p-2 cursor-pointer transition ${
                          hasCompleted ? 'bg-green-50 border-green-500 hover:bg-green-100' :
                          hasMissed ? 'bg-red-50 border-red-500 hover:bg-red-100' :
                          'bg-white hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-sm font-medium">{i}</div>
                        <div className="mt-1 space-y-1">
                          {dayWorkouts.map(w => (
                            <div key={w.id} className="text-xs">
                              <div className="truncate font-medium">{w.type}</div>
                              {w.muscleGroups && w.muscleGroups.length > 0 && (
                                <div className="text-[10px] text-gray-600 truncate">
                                  {w.muscleGroups.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return cells;
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Khoảng thời gian:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 6].map(month => (
                    <button
                      key={month}
                      onClick={() => setStatsRange(month)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        statsRange === month
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {month} tháng
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Chọn người dùng so sánh:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCompareUsers([])}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      compareUsers.length === 0
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  {users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        if (compareUsers.includes(user.id)) {
                          setCompareUsers(compareUsers.filter(id => id !== user.id));
                        } else {
                          setCompareUsers([...compareUsers, user.id]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        compareUsers.includes(user.id) || compareUsers.length === 0
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{user.avatar}</span>
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Số Buổi Tập</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="workouts" fill="#3b82f6" name="Buổi tập" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Tổng Thời Gian (phút)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalDuration" fill="#10b981" name="Phút" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Bảng Xếp Hạng</h3>
              <div className="space-y-3">
                {comparisonStats
                  .sort((a, b) => b.workouts - a.workouts)
                  .map((user, index) => (
                    <div key={user.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-400 text-white' :
                          index === 1 ? 'bg-gray-300 text-white' :
                          index === 2 ? 'bg-orange-400 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="text-2xl">{user.avatar}</div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.workouts} buổi • {user.totalDuration} phút</p>
                        </div>
                      </div>
                      {index === 0 && <Award className="w-8 h-8 text-yellow-500" />}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Thêm Buổi Tập Mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ngày tập *</label>
                <input
                  type="date"
                  value={newWorkout.date}
                  onChange={(e) => setNewWorkout({...newWorkout, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loại bài tập</label>
                <select
                  value={newWorkout.type}
                  onChange={(e) => setNewWorkout({...newWorkout, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {workoutTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thời gian (phút)</label>
                <input
                  type="number"
                  value={newWorkout.duration}
                  onChange={(e) => setNewWorkout({...newWorkout, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nhóm cơ tập</label>
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map(group => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => toggleMuscleGroup(group)}
                      className={`px-3 py-1 text-sm rounded-full border-2 ${
                        (newWorkout.muscleGroups || []).includes(group)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddWorkout}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thêm
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Thêm Buổi Tập - {quickAddDate}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Loại bài tập</label>
                <select
                  value={newWorkout.type}
                  onChange={(e) => setNewWorkout({...newWorkout, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {workoutTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thời gian (phút)</label>
                <input
                  type="number"
                  value={newWorkout.duration}
                  onChange={(e) => setNewWorkout({...newWorkout, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nhóm cơ tập *</label>
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map(group => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => toggleMuscleGroup(group)}
                      className={`px-3 py-1 text-sm rounded-full border-2 ${
                        (newWorkout.muscleGroups || []).includes(group)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>
              
              {workouts.filter(w => w.userId === currentUser.id && w.date === quickAddDate).length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Buổi tập đã có:</h4>
                  <div className="space-y-2">
                    {workouts
                      .filter(w => w.userId === currentUser.id && w.date === quickAddDate)
                      .map(w => (
                        <div key={w.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{w.type}</p>
                            <p className="text-xs text-gray-600">
                              {w.muscleGroups && w.muscleGroups.length > 0 ? w.muscleGroups.join(', ') : 'Không có nhóm cơ'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingWorkout({ ...w });
                                setShowQuickAdd(false);
                                setShowEditModal(true);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteWorkout(w.id);
                              }}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thêm
                </button>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    setNewWorkout({ date: '', type: 'Gym', duration: 60, notes: '', status: 'completed', muscleGroups: [] });
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Chỉnh Sửa Buổi Tập</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ngày tập *</label>
                <input
                  type="date"
                  value={editingWorkout.date}
                  onChange={(e) => setEditingWorkout({...editingWorkout, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loại bài tập</label>
                <select
                  value={editingWorkout.type}
                  onChange={(e) => setEditingWorkout({...editingWorkout, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {workoutTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thời gian (phút)</label>
                <input
                  type="number"
                  value={editingWorkout.duration}
                  onChange={(e) => setEditingWorkout({...editingWorkout, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nhóm cơ tập</label>
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map(group => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => toggleEditMuscleGroup(group)}
                      className={`px-3 py-1 text-sm rounded-full border-2 ${
                        (editingWorkout.muscleGroups || []).includes(group)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditWorkout}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lưu
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingWorkout(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;