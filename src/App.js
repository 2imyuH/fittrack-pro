import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, BarChart3, TrendingUp, Target, Award, Plus, Edit2, Trash2, Bell, CheckCircle, XCircle, Flame, Key, Save } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// API Configuration - Thay đổi 2 dòng này
const API_CONFIG = {
  binId: 'T68ecae5e43b1c97be965256f', // VD: '6763a1b2ad19ca34f8d4e8c9'
  apiKey: '$2a$10$Qf0.pmWvc6etTO/18Qj/nupFDsF9Up8l7efIR7wu7a78XUnU1CQsy', // VD: '$2a$10$...'
  baseUrl: 'https://api.jsonbin.io/v3/b'
};

const initialWorkouts = [
  { id: 1, userId: 1, date: '2025-10-01', type: 'Gym', status: 'completed', duration: 90, notes: 'Tập tay và vai', muscleGroups: ['Tay', 'Vai'] },
  { id: 2, userId: 1, date: '2025-10-03', type: 'Cardio', status: 'completed', duration: 45, notes: 'Chạy bộ 5km', muscleGroups: [] },
  { id: 3, userId: 1, date: '2025-10-05', type: 'Gym', status: 'completed', duration: 85, notes: 'Tập chân', muscleGroups: ['Chân'] },
];

const initialUsers = [
  { id: 1, name: 'Nguyễn Văn An', email: 'an@example.com', role: 'admin', avatar: '👨', goal: 20, group: 'Team A', phone: '0901234567' },
];

const workoutTypes = ['Gym', 'Cardio', 'Yoga', 'Swimming', 'Boxing', 'Cycling'];
const muscleGroups = ['Ngực', 'Lưng', 'Vai', 'Tay', 'Chân', 'Bụng', 'Mông'];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
const avatarOptions = ['👨', '👩', '👨‍💼', '👩‍💼', '🧑', '👨‍🎓', '👩‍🎓', '🧔', '👴', '👵'];

function App() {
  const [currentUser] = useState(initialUsers[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [users, setUsers] = useState(initialUsers);
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  
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
    loadDataFromAPI();
  }, []);

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
        setSaveStatus('✓ Đã lưu thành công');
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

  const handleAddWorkout = async () => {
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
    await saveDataToAPI();
  };

  const handleEditWorkout = async () => {
    if (!editingWorkout) return;
    
    setWorkouts(workouts.map(w => 
      w.id === editingWorkout.id ? { ...editingWorkout } : w
    ));
    setShowEditModal(false);
    setEditingWorkout(null);
    await saveDataToAPI();
  };

  const handleDeleteWorkout = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa buổi tập này?')) {
      setWorkouts(workouts.filter(w => w.id !== id));
      await saveDataToAPI();
    }
  };

  const stats = useMemo(() => {
    const currentMonthWorkouts = workouts.filter(w => 
      w.userId === currentUser.id && w.date.startsWith(selectedMonth)
    );
    
    const completed = currentMonthWorkouts.filter(w => w.status === 'completed').length;
    const missed = currentMonthWorkouts.filter(w => w.status === 'missed').length;
    const percentage = currentUser.goal > 0 ? Math.round((completed / currentUser.goal) * 100) : 0;
    
    const typeCount = {};
    currentMonthWorkouts.forEach(w => {
      if (w.status === 'completed') {
        typeCount[w.type] = (typeCount[w.type] || 0) + 1;
      }
    });
    
    return { completed, missed, percentage, typeCount };
  }, [workouts, currentUser, selectedMonth]);

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
              <button 
                onClick={saveDataToAPI}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Đang lưu...' : 'Lưu dữ liệu'}
              </button>
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
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Buổi Hoàn Thành</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.completed}</h3>
                    <p className="text-green-100 text-xs mt-1">/ {currentUser.goal} mục tiêu</p>
                  </div>
                  <CheckCircle className="w-12 h-12 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Hoàn Thành</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.percentage}%</h3>
                    <p className="text-blue-100 text-xs mt-1">tháng này</p>
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

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Lịch Tập Gần Đây</h3>
              <div className="space-y-2">
                {workouts
                  .filter(w => w.userId === currentUser.id)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5)
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
                {Array.from({ length: 31 }, (_, i) => {
                  const date = selectedMonth + '-' + String(i + 1).padStart(2, '0');
                  const dayWorkouts = workouts.filter(w => w.userId === currentUser.id && w.date === date);
                  const hasCompleted = dayWorkouts.some(w => w.status === 'completed');
                  const hasMissed = dayWorkouts.some(w => w.status === 'missed');
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square border rounded-lg p-2 ${
                        hasCompleted ? 'bg-green-50 border-green-500' :
                        hasMissed ? 'bg-red-50 border-red-500' :
                        'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium">{i + 1}</div>
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
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
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

      {showEditModal && editingWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
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