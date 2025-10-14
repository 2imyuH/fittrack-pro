import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, BarChart3, TrendingUp, Target, Award, Plus, Edit2, Trash2, Flame, LogOut, User } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import LoginScreen from './LoginScreen';

const API_CONFIG = {
  binId: '68edbaefd0ea881f40a182ab',
  apiKey: '$2a$10$dHnng3RdRYlhAxHnRKQcJOgwgnnWXfzpy6cee.NDyjHFZ1BqaNq.a',
  baseUrl: 'https://api.jsonbin.io/v3/b'
};

const workoutTypes = ['Gym', 'Cardio', 'Swimming','Football'];
const muscleGroups = ['Ngực', 'Lưng', 'Vai', 'Tay Trước', 'Tay Sau', 'Chân', 'Bụng', 'Mông'];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
const avatarOptions = ['👨', '👩', '👨‍💼', '👩‍💼', '🧑', '👨‍🎓', '👩‍🎓', '🧔', '👴', '👵', '💪', '🏃', '🚴', '🏋️'];
const WEEKDAYS = [
  { id: 1, name: 'Thứ 2', short: 'T2' },
  { id: 2, name: 'Thứ 3', short: 'T3' },
  { id: 3, name: 'Thứ 4', short: 'T4' },
  { id: 4, name: 'Thứ 5', short: 'T5' },
  { id: 5, name: 'Thứ 6', short: 'T6' },
  { id: 6, name: 'Thứ 7', short: 'T7' },
  { id: 0, name: 'Chủ nhật', short: 'CN' }
];
export function calculateFlexibleStreak(currentUser, workouts, weekStartDate = null) {
  if (!currentUser) return 0;

  // Lọc các buổi tập hoàn thành
  const userWorkouts = workouts
    .filter(w => w.userId === currentUser.id && w.status === 'completed')
    .map(w => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d;
    })
    .sort((a, b) => a - b);

  if (userWorkouts.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scheduledDays = currentUser.weeklySchedule || [1, 3, 5];
  const workoutSet = new Set(userWorkouts.map(d => d.toISOString().split('T')[0]));

  // Xác định tuần hiện tại hoặc từ ngày bắt đầu do người dùng chọn
  const startOfWeek = weekStartDate
    ? new Date(weekStartDate)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  let streak = 0;
  
  // Tìm ngày tập gần nhất để biết "hiện tại" đến đâu
  const lastWorkoutDate = userWorkouts.length > 0 
    ? userWorkouts[userWorkouts.length - 1] 
    : startOfWeek;

  const dayCursor = new Date(startOfWeek);

  while (dayCursor <= lastWorkoutDate) {
    const dayStr = dayCursor.toISOString().split('T')[0];
    const dayOfWeek = dayCursor.getDay();
    const isTargetDay = scheduledDays.includes(dayOfWeek);
    const didWorkout = workoutSet.has(dayStr);

    if (isTargetDay && !didWorkout) {
      // ❌ Bỏ ngày mục tiêu (và đã qua ngày đó) → reset streak về 0
      streak = 0;
    } else if (didWorkout) {
      // ✅ Có đi tập → tăng streak
      streak += 1;
    }

    dayCursor.setDate(dayCursor.getDate() + 1);
  }

  return streak;
}


// Hàm phụ tính số tuần trong năm
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function CalendarGrid({ selectedMonth, workouts, onDateClick }) {
  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startDayOfWeek, year, month };
  };

  const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(selectedMonth);
  const days = [];
  
  for (let i = 0; i < (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1); i++) {
    days.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getWorkoutsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workouts.filter(w => w.date === dateStr);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">
        Tháng {month}/{year}
      </h3>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayWorkouts = getWorkoutsForDate(day);
          const today = new Date().toISOString().split('T')[0];
          const isToday = dateStr === today;
          const isPast = dateStr < today;

          return (
            <button
              key={day}
              onClick={() => onDateClick(dateStr)}
              className={`aspect-square p-2 rounded-lg border-2 transition hover:border-blue-500 ${
                isToday ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
              } ${isPast && dayWorkouts.length === 0 ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="text-sm font-medium mb-1">{day}</div>
              <div className="space-y-1">
                {dayWorkouts.slice(0, 3).map((w, i) => (
                  <div key={i} className="text-center">
                    <div className="text-lg">
                      {w.type === 'Gym' ? '💪' : w.type === 'Cardio' ? '🏃' : w.type === 'Swimming' ? '🏊' : '⚽'}
                    </div>
                    {w.type === 'Gym' && w.muscleGroups && w.muscleGroups.length > 0 && (
                      <div className="text-[9px] text-gray-600 leading-tight">
                        {w.muscleGroups.slice(0, 2).join(', ')}
                        {w.muscleGroups.length > 2 && '...'}
                      </div>
                    )}
                  </div>
                ))}
                {dayWorkouts.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayWorkouts.length - 3}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function Leaderboard({ users, workouts, selectedMonth, statsRange, compareUsers }) {
  const getDateRange = () => {
    const [yearStart, monthStart] = selectedMonth.split('-').map(Number);
    const [yearEnd, monthEnd] = statsRange.split('-').map(Number);
    
    const start = `${yearStart}-${String(monthStart).padStart(2, '0')}-01`;
    const endDate = new Date(yearEnd, monthEnd, 0);
    const end = `${yearEnd}-${String(monthEnd).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    
    return { start, end };
  };

  const range = getDateRange(statsRange);
  const selectedUsers = compareUsers.length > 0 
    ? users.filter(u => compareUsers.includes(u.id))
    : users;

  const leaderboardData = selectedUsers.map(user => {
    // Lọc buổi tập hoàn thành trong khoảng thời gian đang xem
    const userWorkouts = workouts.filter(
      w =>
        w.userId === user.id &&
        w.date >= range.start &&
        w.date <= range.end &&
        w.status === 'completed'
    );

    // ---- Dùng chung hàm calculateFlexibleStreak ----
    const calculatedStreak = calculateFlexibleStreak(user, workouts);

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      workoutCount: userWorkouts.length,
      totalDuration: userWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      currentStreak: calculatedStreak,
      longestStreak: user.streakData?.longestStreak || 0,
      recoveryChances: user.streakData?.recoveryChances || 3,
      score: userWorkouts.length * 10 + calculatedStreak * 50
    };
  }).sort((a, b) => b.score - a.score);

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Award className="w-6 h-6 text-yellow-500" />
        Bảng Xếp Hạng
      </h3>
      <div className="space-y-2">
        {leaderboardData.map((user, index) => (
          <div 
            key={user.id}
            className={`flex items-center justify-between p-4 rounded-lg transition ${
              index < 3 
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300' 
                : 'bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                index < 3 ? 'bg-yellow-100' : 'bg-gray-200'
              }`}>
                {getMedalEmoji(index)}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{user.avatar}</span>
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-gray-600">Điểm: {user.score}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{user.workoutCount}</p>
                <p className="text-xs text-gray-600">Buổi tập</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{Math.round(user.totalDuration / 60)}</p>
                <p className="text-xs text-gray-600">Giờ</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{user.currentStreak}</p>
                <p className="text-xs text-gray-600">Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{user.longestStreak}</p>
                <p className="text-xs text-gray-600">Kỷ lục</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function MainApp({ currentUser, setCurrentUser, users, setUsers, workouts, setWorkouts, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [saveStatus, setSaveStatus] = useState('');
  const [statsRange, setStatsRange] = useState(new Date().toISOString().slice(0, 7));
  const [compareUsers, setCompareUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState('');
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showStreakInfo, setShowStreakInfo] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ date: '', type: 'Gym', duration: 60, notes: '', status: 'completed', muscleGroups: [] });
  const [profileEdit, setProfileEdit] = useState({ name: '', phone: '', goal: 16, avatar: '👤', weeklySchedule: [] });
useEffect(() => {
  if (users.length > 0) {
    const timeoutId = setTimeout(() => saveDataToAPI(), 1000);
    return () => clearTimeout(timeoutId);
  }
}, [workouts, users]);
  const saveDataToAPI = async () => {
    try {
      setSaveStatus('Đang lưu...');
      const response = await fetch(`${API_CONFIG.baseUrl}/${API_CONFIG.binId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_CONFIG.apiKey },
        body: JSON.stringify({ workouts, users, lastUpdated: new Date().toISOString() })
      });
      setSaveStatus(response.ok ? '✓ Đã lưu' : '✗ Lỗi');
    } catch (error) {
      setSaveStatus('✗ Lỗi kết nối');
    } finally {
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };
useEffect(() => {
  console.log('🔍 useEffect TRIGGERED');
  console.log('currentUser:', currentUser?.name);
  console.log('workouts count:', workouts.length);

  if (!currentUser) return;

  console.log('\n🔥 === CALCULATING FLEXIBLE STREAK ===');

  const streak = calculateFlexibleStreak(currentUser, workouts);
  console.log('🏆 Calculated streak:', streak);

  const currentStreak = currentUser.streakData?.currentStreak || 0;

  if (streak !== currentStreak) {
    console.log('💾 Updating streak from', currentStreak, '→', streak);

    const longestStreak = Math.max(
      streak,
      currentUser.streakData?.longestStreak || 0
    );

    const updatedUser = {
      ...currentUser,
      streakData: {
        ...currentUser.streakData,
        currentStreak: streak,
        longestStreak,
        lastUpdated: new Date().toISOString(),
      },
    };

    setCurrentUser(updatedUser);
    setUsers(prev =>
      prev.map(u => (u.id === updatedUser.id ? updatedUser : u))
    );

    console.log('✅ Streak updated successfully!');
  } else {
    console.log('ℹ️ Streak unchanged, no update needed');
  }

  console.log('=== END CALCULATION ===\n');
}, [workouts, currentUser?.id]);

  const handleAddWorkout = () => {
    if (!newWorkout.date) return alert('Vui lòng chọn ngày!');
    if (newWorkout.type === 'Gym' && (!newWorkout.muscleGroups || newWorkout.muscleGroups.length === 0)) return alert('Vui lòng chọn nhóm cơ!');
    setWorkouts([...workouts, { id: Date.now(), userId: currentUser.id, ...newWorkout, muscleGroups: newWorkout.type === 'Gym' ? newWorkout.muscleGroups : [] }]);
    setShowAddModal(false);
    setNewWorkout({ date: '', type: 'Gym', duration: 60, notes: '', status: 'completed', muscleGroups: [] });
  };

  const handleQuickAdd = () => {
    if (newWorkout.type === 'Gym' && (!newWorkout.muscleGroups || newWorkout.muscleGroups.length === 0)) return alert('Vui lòng chọn nhóm cơ!');
    setWorkouts([...workouts, { id: Date.now(), userId: currentUser.id, date: quickAddDate, type: newWorkout.type, duration: newWorkout.duration, notes: '', status: 'completed', muscleGroups: newWorkout.type === 'Gym' ? newWorkout.muscleGroups : [] }]);
    setShowQuickAdd(false);
    setNewWorkout({ date: '', type: 'Gym', duration: 60, notes: '', status: 'completed', muscleGroups: [] });
  };

  const handleEditWorkout = () => {
    if (!editingWorkout) return;
    setWorkouts(workouts.map(w => w.id === editingWorkout.id ? { ...editingWorkout } : w));
    setShowEditModal(false);
    setEditingWorkout(null);
  };

  const handleDeleteWorkout = (id) => {
    if (window.confirm('Xóa buổi tập này?')) setWorkouts(workouts.filter(w => w.id !== id));
  };

  const handleProfileUpdate = () => {
    const updatedUser = { ...currentUser, ...profileEdit };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowProfileEdit(false);
    alert('✓ Đã cập nhật!');
  };

  const toggleMuscleGroup = (group) => {
    if (newWorkout.type === 'Cardio') return;
    const current = newWorkout.muscleGroups || [];
    setNewWorkout({ ...newWorkout, muscleGroups: current.includes(group) ? current.filter(g => g !== group) : [...current, group] });
  };

  const toggleEditMuscleGroup = (group) => {
    if (!editingWorkout || editingWorkout.type === 'Cardio') return;
    const current = editingWorkout.muscleGroups || [];
    setEditingWorkout({ ...editingWorkout, muscleGroups: current.includes(group) ? current.filter(g => g !== group) : [...current, group] });
  };

  const getDateRange = () => {
    const [yearStart, monthStart] = selectedMonth.split('-').map(Number);
    const [yearEnd, monthEnd] = statsRange.split('-').map(Number);
    
    const start = `${yearStart}-${String(monthStart).padStart(2, '0')}-01`;
    const endDate = new Date(yearEnd, monthEnd, 0); // Ngày cuối cùng của tháng
    const end = `${yearEnd}-${String(monthEnd).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    
    return { start, end };
  };

  const stats = useMemo(() => {
    if (!currentUser) return { completed: 0, missed: 0, percentage: 0, typeCount: {}, muscleCount: {}, rangeWorkouts: [] };
    const range = getDateRange();
    
    // Tính số tháng giữa 2 khoảng
    const [yearStart, monthStart] = selectedMonth.split('-').map(Number);
    const [yearEnd, monthEnd] = statsRange.split('-').map(Number);
    const monthsDiff = (yearEnd - yearStart) * 12 + (monthEnd - monthStart) + 1;
    
    const rangeWorkouts = workouts.filter(w => w.userId === currentUser.id && w.date >= range.start && w.date <= range.end);
    const completed = rangeWorkouts.filter(w => w.status === 'completed').length;
    const percentage = Math.round((completed / (currentUser.goal * monthsDiff)) * 100);
    const typeCount = {}, muscleCount = {};
    rangeWorkouts.forEach(w => {
      if (w.status === 'completed') {
        typeCount[w.type] = (typeCount[w.type] || 0) + 1;
        if (w.muscleGroups) w.muscleGroups.forEach(m => muscleCount[m] = (muscleCount[m] || 0) + 1);
      }
    });
    return { completed, percentage, typeCount, muscleCount, rangeWorkouts };
  }, [workouts, users, selectedMonth, statsRange, compareUsers]);

  const weekProgress = useMemo(() => {
    if (!currentUser) return { completed: [], remaining: [], progress: 0, scheduledDays: [] };
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    const weekWorkouts = workouts.filter(w => w.userId === currentUser.id && w.date >= startOfWeek.toISOString().split('T')[0] && w.date <= today.toISOString().split('T')[0] && w.status === 'completed');
    const scheduledDays = currentUser.weeklySchedule || [1, 3, 5];
    const completedDays = weekWorkouts.map(w => new Date(w.date).getDay());
    const completed = scheduledDays.filter(day => completedDays.includes(day));
    const progress = Math.round((completed.length / scheduledDays.length) * 100);
    return { completed, progress, scheduledDays };
  }, [workouts, currentUser]);

  const chartData = useMemo(() => {
    if (!currentUser) return [];
    const range = getDateRange();
    const data = [];
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
      const weekStart = d.toISOString().split('T')[0];
      const weekEnd = new Date(d);
      weekEnd.setDate(d.getDate() + 6);
      const weekWorkouts = workouts.filter(w => w.userId === currentUser.id && w.date >= weekStart && w.date <= weekEnd.toISOString().split('T')[0] && w.status === 'completed');
      data.push({ week: `${d.getDate()}/${d.getMonth() + 1}`, workouts: weekWorkouts.length, duration: weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) });
    }
    return data;
  }, [workouts, currentUser, selectedMonth, statsRange]);
const comparisonStats = useMemo(() => {
  const [yearStart, monthStart] = selectedMonth.split('-').map(Number);
  const [yearEnd, monthEnd] = statsRange.split('-').map(Number);
  
  const start = `${yearStart}-${String(monthStart).padStart(2, '0')}-01`;
  const endDate = new Date(yearEnd, monthEnd, 0);
  const end = `${yearEnd}-${String(monthEnd).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
  
  const selectedUsers = compareUsers.length > 0 ? compareUsers : users.map(u => u.id);
  
  return selectedUsers.map(userId => {
    const user = users.find(u => u.id === userId);
    const userWorkouts = workouts.filter(w => 
      w.userId === userId && 
      w.date >= start && 
      w.date <= end && 
      w.status === 'completed'
    );
    
    return { 
      name: user?.name || 'Unknown', 
      workouts: userWorkouts.length, 
      totalDuration: userWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0), 
      avatar: user?.avatar || '👤' 
    };
  });
}, [workouts, users, selectedMonth, statsRange, compareUsers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">FitTrack Pro</h1>
                <p className="text-sm text-gray-500">Quản lý lịch tập</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {saveStatus && <span className={`text-sm font-medium ${saveStatus.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>{saveStatus}</span>}
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-2xl">{currentUser.avatar}</div>
                <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 border shadow-sm">
          {['dashboard', 'calendar', 'compare', 'profile'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
              {tab === 'dashboard' && <BarChart3 className="w-5 h-5" />}
              {tab === 'calendar' && <Calendar className="w-5 h-5" />}
              {tab === 'compare' && <Users className="w-5 h-5" />}
              {tab === 'profile' && <User className="w-5 h-5" />}
              {tab === 'dashboard' && 'Dashboard'}
              {tab === 'calendar' && 'Lịch Tập'}
              {tab === 'compare' && 'Thống kê'}
              {tab === 'profile' && 'Profile'}
            </button>
          ))}
        </div>

    {activeTab === 'dashboard' && (
      <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium">Từ tháng:</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
          />
          <label className="text-sm font-medium">Đến tháng:</label>
          <input 
            type="month" 
            value={statsRange} 
            onChange={(e) => setStatsRange(e.target.value)} 
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
          />
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <Target className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-blue-100 text-sm">Tiến Độ Tháng Này</p>
            <div className="flex items-end gap-2 mt-2">
              <h3 className="text-4xl font-bold">{stats.completed}</h3>
              <span className="text-2xl font-medium mb-1">/ {currentUser.goal}</span>
            </div>
            <div className="mt-3 bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all" style={{width: `${Math.min(stats.percentage, 100)}%`}}></div>
            </div>
            <p className="text-blue-100 text-sm mt-2">{stats.percentage}% hoàn thành</p>
          </div>

          <div className="rounded-xl p-6 text-white shadow-lg" style={{background: 'linear-gradient(to bottom right, rgb(249, 115, 22), rgb(239, 68, 68))'}}>
            <Flame className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-orange-100 text-sm">Streak Hiện Tại</p>
            <h3 className="text-4xl font-bold mt-2">{currentUser.streakData?.currentStreak || 0}</h3>
            <p className="text-orange-100 text-xs mt-1">ngày liên tiếp</p>
            <div className="mt-3 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i < (currentUser.streakData?.recoveryChances || 3) ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-orange-100 text-xs mt-2">Kỷ lục: {currentUser.streakData?.longestStreak || 0} ngày</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
            <Calendar className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-pink-100 text-sm">Buổi Bỏ Lỡ</p>
            <h3 className="text-4xl font-bold mt-2">{Math.max(0, currentUser.goal - stats.completed)}</h3>
            <p className="text-pink-100 text-xs mt-1">so với mục tiêu</p>
            <p className="text-pink-100 text-sm mt-3">Cần tập thêm {Math.max(0, currentUser.goal - stats.completed)} buổi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Phân Bổ Loại Tập</h3>
            {Object.keys(stats.typeCount).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={Object.entries(stats.typeCount).map(([type, count]) => ({name: type, value: count}))} cx="50%" cy="50%" labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {Object.keys(stats.typeCount).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Nhóm Cơ Đã Tập</h3>
            {Object.keys(stats.muscleCount).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.muscleCount).sort((a, b) => b[1] - a[1]).map(([muscle, count], index) => (
                  <div key={muscle}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{muscle}</span>
                      <span className="text-sm text-gray-600">{count} lần</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="rounded-full h-2 transition-all" style={{width: `${(count / Math.max(...Object.values(stats.muscleCount))) * 100}%`, backgroundColor: COLORS[index % COLORS.length]}}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Lịch Sử Tập Luyện</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {stats.rangeWorkouts.sort((a, b) => b.date.localeCompare(a.date)).map(workout => (
              <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{workout.type === 'Gym' ? '💪' : workout.type === 'Cardio' ? '🏃' : workout.type === 'Swimming' ? '🏊' : '⚽'}</span>
                  </div>
                  <div>
                    <p className="font-medium">{workout.type}</p>
                    <p className="text-sm text-gray-600">{new Date(workout.date).toLocaleDateString('vi-VN')} • {workout.duration} phút</p>
                    {workout.muscleGroups && workout.muscleGroups.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{workout.muscleGroups.join(', ')}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingWorkout({...workout}); setShowEditModal(true); }} className="p-2 hover:bg-gray-200 rounded transition">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => handleDeleteWorkout(workout.id)} className="p-2 hover:bg-red-100 rounded transition">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
            {stats.rangeWorkouts.length === 0 && (
              <div className="text-center py-8 text-gray-400">Chưa có buổi tập nào trong tháng này</div>
            )}
          </div>
        </div>
      </div>
    )}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-5xl">{currentUser.avatar}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                  <p className="text-gray-600">{currentUser.email}</p>
                  <p className="text-sm text-gray-500 mt-1">Mục tiêu: {currentUser.goal} buổi/tháng</p>
                </div>
                <button onClick={() => { setProfileEdit({ name: currentUser.name, phone: currentUser.phone || '', goal: currentUser.goal, avatar: currentUser.avatar, weeklySchedule: currentUser.weeklySchedule || [1, 3, 5] }); setShowProfileEdit(true); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition">
                  <Edit2 className="w-4 h-4" />Chỉnh sửa
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Số điện thoại</label>
                    <p className="text-lg font-medium">{currentUser.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Nhóm</label>
                    <p className="text-lg font-medium">{currentUser.group}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Vai trò</label>
                    <p className="text-lg font-medium capitalize">{currentUser.role}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Lịch tập trong tuần</label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map(day => {
                      const isScheduled = (currentUser.weeklySchedule || []).includes(day.id);
                      return <div key={day.id} className={`px-4 py-2 rounded-lg ${isScheduled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{day.name}</div>;
                    })}
                  </div>
                </div>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-xl p-6 text-white shadow-lg" style={{background: 'linear-gradient(to bottom right, rgb(249, 115, 22), rgb(239, 68, 68))'}}>
            <Flame className="w-12 h-12 mb-3" />
            <p className="text-orange-100 text-sm">Streak Hiện Tại</p>
            <h3 className="text-4xl font-bold mt-1">{currentUser.streakData?.currentStreak || 0}</h3>
            <p className="text-orange-100 text-xs mt-1">ngày liên tiếp</p>
            <div className="mt-3 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i < (currentUser.streakData?.recoveryChances || 3) ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl p-6 text-white shadow-lg">
              <Award className="w-12 h-12 mb-3" />
              <p className="text-yellow-100 text-sm">Kỷ Lục Streak</p>
              <h3 className="text-4xl font-bold mt-1">{currentUser.streakData?.longestStreak || 0}</h3>
              <p className="text-yellow-100 text-xs mt-1">streak dài nhất</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
              <Target className="w-12 h-12 mb-3" />
              <p className="text-purple-100 text-sm">Cơ Hội Khôi Phục</p>
              <h3 className="text-4xl font-bold mt-1">{currentUser.streakData?.recoveryChances || 3}</h3>
              <p className="text-purple-100 text-xs mt-1">/ 3 lần trong tháng</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg">
              <Calendar className="w-12 h-12 mb-3" />
              <p className="text-blue-100 text-sm">Tuần Này</p>
              <h3 className="text-4xl font-bold mt-1">{weekProgress.completed.length}</h3>
              <p className="text-blue-100 text-xs mt-1">/ {weekProgress.scheduledDays?.length || 0} ngày</p>
            </div>
          </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Thống Kê Cá Nhân</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{workouts.filter(w => w.userId === currentUser.id && w.status === 'completed').length}</p>
                  <p className="text-sm text-gray-600 mt-1">Tổng buổi tập</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{Math.round(workouts.filter(w => w.userId === currentUser.id).reduce((sum, w) => sum + (w.duration || 0), 0) / 60)}</p>
                  <p className="text-sm text-gray-600 mt-1">Giờ tập luyện</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{new Set(workouts.filter(w => w.userId === currentUser.id).map(w => w.date)).size}</p>
                  <p className="text-sm text-gray-600 mt-1">Ngày khác nhau</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{new Set(workouts.filter(w => w.userId === currentUser.id).flatMap(w => w.muscleGroups || [])).size}</p>
                  <p className="text-sm text-gray-600 mt-1">Nhóm cơ đã tập</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {activeTab === 'calendar' && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Tháng:</label>
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
          </div>

          <CalendarGrid 
            selectedMonth={selectedMonth}
            workouts={workouts.filter(w => w.userId === currentUser.id)}
            onDateClick={(date) => {
              setQuickAddDate(date);
              setShowQuickAdd(true);
            }}
          />

          <button 
            onClick={() => setShowAddModal(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition z-40"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
      {activeTab === 'compare' && (
        <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium">Từ tháng:</label>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
            <label className="text-sm font-medium">Đến tháng:</label>
            <input 
              type="month" 
              value={statsRange} 
              onChange={(e) => setStatsRange(e.target.value)} 
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <label className="text-sm font-medium mb-3 block">Chọn thành viên để thống kê:</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCompareUsers([])}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  compareUsers.length === 0 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Tất cả
              </button>
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCompareUsers(prev => 
                      prev.includes(user.id) 
                        ? prev.filter(id => id !== user.id)
                        : [...prev, user.id]
                    );
                  }}
                  className={`px-4 py-2 rounded-lg border-2 transition flex items-center gap-2 ${
                    compareUsers.length === 0 || compareUsers.includes(user.id)
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span>{user.avatar}</span>
                  <span>{user.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Thống Kê Số Buổi Tập</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="workouts" fill="#3b82f6" name="Số buổi tập" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Thống Kê Thời Gian Tập</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalDuration" fill="#10b981" name="Tổng phút" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Leaderboard 
            users={users}
            workouts={workouts}
            selectedMonth={selectedMonth}
            statsRange={statsRange}
            compareUsers={compareUsers}
          />
        </div>
      )}
      {/* ADD WORKOUT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Thêm Buổi Tập Mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ngày tập</label>
                <input type="date" value={newWorkout.date} onChange={(e) => setNewWorkout({...newWorkout, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Loại bài tập</label>
                <select value={newWorkout.type} onChange={(e) => setNewWorkout({...newWorkout, type: e.target.value, muscleGroups: e.target.value === 'Gym' ? newWorkout.muscleGroups : []})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {workoutTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thời gian (phút)</label>
                <input type="number" value={newWorkout.duration} onChange={(e) => setNewWorkout({...newWorkout, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              {newWorkout.type === 'Gym' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Nhóm cơ tập *</label>
                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.map(group => (
                      <button key={group} type="button" onClick={() => toggleMuscleGroup(group)} className={`px-3 py-1 text-sm rounded-full border-2 transition ${(newWorkout.muscleGroups || []).includes(group) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>{group}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button onClick={handleAddWorkout} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Thêm</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD MODAL */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Thêm Buổi Tập - {quickAddDate}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Loại bài tập</label>
                <select value={newWorkout.type} onChange={(e) => setNewWorkout({...newWorkout, type: e.target.value, muscleGroups: e.target.value === 'Gym' ? newWorkout.muscleGroups : []})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {workoutTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thời gian (phút)</label>
                <input type="number" value={newWorkout.duration} onChange={(e) => setNewWorkout({...newWorkout, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              {newWorkout.type === 'Gym' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Nhóm cơ tập *</label>
                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.map(group => (
                      <button key={group} type="button" onClick={() => toggleMuscleGroup(group)} className={`px-3 py-1 text-sm rounded-full border-2 transition ${(newWorkout.muscleGroups || []).includes(group) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>{group}</button>
                    ))}
                  </div>
                </div>
              )}
              {workouts.filter(w => w.userId === currentUser.id && w.date === quickAddDate).length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Buổi tập đã có:</h4>
                  <div className="space-y-2">
                    {workouts.filter(w => w.userId === currentUser.id && w.date === quickAddDate).map(w => (
                      <div key={w.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{w.type}</p>
                          <p className="text-xs text-gray-600">{w.type === 'Gym' ? (w.muscleGroups && w.muscleGroups.length > 0 ? w.muscleGroups.join(', ') : 'Không có nhóm cơ') : w.type}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingWorkout({ ...w }); setShowQuickAdd(false); setShowEditModal(true); }} className="p-1 hover:bg-gray-200 rounded transition">
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button onClick={() => handleDeleteWorkout(w.id)} className="p-1 hover:bg-red-100 rounded transition">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button onClick={handleQuickAdd} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Thêm</button>
                <button onClick={() => { setShowQuickAdd(false); setNewWorkout({ date: '', type: 'Gym', duration: 60, notes: '', status: 'completed', muscleGroups: [] }); }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WORKOUT MODAL */}
      {showEditModal && editingWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Chỉnh Sửa Buổi Tập</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ngày tập</label>
                <input type="date" value={editingWorkout.date} onChange={(e) => setEditingWorkout({...editingWorkout, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Loại bài tập</label>
                <select value={editingWorkout.type} onChange={(e) => setEditingWorkout({...editingWorkout, type: e.target.value, muscleGroups: e.target.value === 'Gym' ? editingWorkout.muscleGroups : []})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {workoutTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thời gian (phút)</label>
                <input type="number" value={editingWorkout.duration} onChange={(e) => setEditingWorkout({...editingWorkout, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              {editingWorkout.type === 'Gym' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Nhóm cơ tập</label>
                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.map(group => (
                      <button key={group} type="button" onClick={() => toggleEditMuscleGroup(group)} className={`px-3 py-1 text-sm rounded-full border-2 transition ${(editingWorkout.muscleGroups || []).includes(group) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>{group}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button onClick={handleEditWorkout} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Lưu</button>
                <button onClick={() => { setShowEditModal(false); setEditingWorkout(null); }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* PROFILE EDIT MODAL */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Chỉnh Sửa Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Họ và tên</label>
                <input type="text" value={profileEdit.name} onChange={(e) => setProfileEdit({...profileEdit, name: e.target.value})} placeholder="Họ và tên" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                <input type="text" value={profileEdit.phone} onChange={(e) => setProfileEdit({...profileEdit, phone: e.target.value})} placeholder="Số điện thoại" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mục tiêu tháng (buổi)</label>
                <input type="number" value={profileEdit.goal} onChange={(e) => setProfileEdit({...profileEdit, goal: parseInt(e.target.value)})} placeholder="Mục tiêu tháng" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Avatar</label>
                <div className="grid grid-cols-7 gap-2">
                  {avatarOptions.map(av => (
                    <button key={av} type="button" onClick={() => setProfileEdit({...profileEdit, avatar: av})} className={`text-2xl p-2 rounded-lg border-2 transition ${profileEdit.avatar === av ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>{av}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lịch tập trong tuần</label>
                <div className="grid grid-cols-4 gap-2">
                  {WEEKDAYS.map(day => (
                    <button key={day.id} type="button" onClick={() => {
                      const schedule = profileEdit.weeklySchedule || [];
                      setProfileEdit({...profileEdit, weeklySchedule: schedule.includes(day.id) ? schedule.filter(d => d !== day.id) : [...schedule, day.id]});
                    }} className={`px-3 py-2 text-sm rounded-lg border-2 transition ${(profileEdit.weeklySchedule || []).includes(day.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>{day.short}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleProfileUpdate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Lưu</button>
                <button onClick={() => setShowProfileEdit(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STREAK INFO MODAL */}
      {showStreakInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />Hệ Thống Streak
            </h3>
            <div className="space-y-4">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <h4 className="font-semibold mb-2">🔥 Cách hoạt động:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Hoàn thành đủ các ngày đã lên lịch trong tuần để tăng streak</li>
                  <li>• Ví dụ: Lịch Thứ 2, 4, 6 → Phải tập đủ 3 ngày để giữ streak</li>
                  <li>• Mỗi tuần hoàn thành = +1 streak</li>
                </ul>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h4 className="font-semibold mb-2">💎 Cơ hội khôi phục:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Có 3 cơ hội khôi phục mỗi tháng</li>
                  <li>• Nếu bỏ lỡ tuần, có thể dùng 1 cơ hội để giữ streak</li>
                  <li>• Phải tập bù đủ số buổi đã lỡ trong tuần sau</li>
                  <li>• Cơ hội sẽ reset vào đầu tháng mới</li>
                </ul>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="font-semibold mb-2">📊 Trạng thái hiện tại:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Streak hiện tại: <strong>{currentUser.streakData?.currentStreak || 0} ngày</strong></li>
                  <li>• Kỷ lục: <strong>{currentUser.streakData?.longestStreak || 0} tuần</strong></li>
                  <li>• Cơ hội còn lại: <strong>{currentUser.streakData?.recoveryChances || 3}/3</strong></li>
                  <li>• Tuần này: <strong>{weekProgress.completed.length}/{weekProgress.scheduledDays?.length || 0} ngày</strong></li>
                </ul>
              </div>
            </div>
            <button onClick={() => setShowStreakInfo(false)} className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ROOT APP COMPONENT
function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('currentUser');
  });
  const [workouts, setWorkouts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataFromAPI();
  }, []);
  const loadDataFromAPI = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/${API_CONFIG.binId}/latest`, {
        headers: { 'X-Master-Key': API_CONFIG.apiKey }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.record) {
          setWorkouts(data.record.workouts || []);
          setUsers(data.record.users || []);
        }
      }
    } catch (error) {
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen
        users={users}
        setUsers={setUsers}
        workouts={workouts}
        onLogin={handleLogin}
      />
    );
  }

  return <MainApp currentUser={currentUser} setCurrentUser={setCurrentUser} users={users} setUsers={setUsers} workouts={workouts} setWorkouts={setWorkouts} onLogout={handleLogout} />;
}

export default App;