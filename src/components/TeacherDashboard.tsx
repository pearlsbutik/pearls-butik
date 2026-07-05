import React, { useState } from 'react';
import { Calendar, Clock, Plus, Video, Search, Filter, Trash2, Edit, Sparkles, TrendingUp, Users, History, FileText } from 'lucide-react';
import LiveClassCard, { LiveClass } from './LiveClassCard';
import ScheduleClass from './ScheduleClass';
import AttendanceTable from './AttendanceTable';

interface Course {
  id: string;
  title: string;
  image?: string;
}

interface TeacherDashboardProps {
  liveClasses: LiveClass[];
  courses: Course[];
  onScheduleClass: (formData: any) => Promise<void>;
  onUpdateClass: (classId: string, updatedData: any) => Promise<void>;
  onDeleteClass: (classId: string) => Promise<void>;
  onViewDetails: (session: LiveClass) => void;
}

export default function TeacherDashboard({
  liveClasses,
  courses,
  onScheduleClass,
  onUpdateClass,
  onDeleteClass,
  onViewDetails
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'schedule' | 'attendance'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  // Metrics calculations
  const totalClasses = liveClasses.length;
  const liveCount = liveClasses.filter(c => (c.status as string) === 'live').length;
  const scheduledCount = liveClasses.filter(c => (c.status as string) === 'scheduled').length;
  const completedCount = liveClasses.filter(c => (c.status as string) === 'completed').length;

  const filteredClasses = liveClasses.filter(c => {
    const matchesSearch = c.topic.toLowerCase().includes(searchTerm.toLowerCase()) || c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const isCompleted = (c.status as string) === 'completed';
    const matchesTab = activeTab === 'upcoming' ? !isCompleted : isCompleted;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Virtual Academy Coordinates</h2>
          <p className="text-stone-500 text-xs font-light mt-1">
            Publish lectures, track attendance logs, upload video recordings, and manage live state controls.
          </p>
        </div>
        
        {activeTab !== 'schedule' && (
          <button
            onClick={() => setActiveTab('schedule')}
            className="inline-flex items-center gap-2 bg-[#111111] hover:bg-[#D4AF37] text-white hover:text-black py-2.5 px-5 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Lecture</span>
          </button>
        )}
      </div>

      {/* Analytical Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-stone-400 font-mono text-[9px] uppercase">Total Sessions</p>
            <p className="font-serif text-lg font-bold text-stone-900">{totalClasses}</p>
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-500/10 text-red-600 rounded-lg animate-pulse">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <p className="text-stone-400 font-mono text-[9px] uppercase">Live Now</p>
            <p className="font-serif text-lg font-bold text-red-600">{liveCount}</p>
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-stone-400 font-mono text-[9px] uppercase">Scheduled</p>
            <p className="font-serif text-lg font-bold text-stone-900">{scheduledCount}</p>
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="text-stone-400 font-mono text-[9px] uppercase">Concluded</p>
            <p className="font-serif text-lg font-bold text-stone-900">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Sub-tab Selection bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-2 border-b border-stone-100">
        <div className="flex bg-stone-100 p-1 rounded-xl w-max self-start">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'upcoming' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Upcoming Class Desk
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'completed' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Completed Archive
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'attendance' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Live Logs
          </button>
        </div>

        {activeTab !== 'schedule' && activeTab !== 'attendance' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-stone-50 border border-stone-200 p-2.5 pl-9 rounded-xl focus:outline-none focus:border-[#D4AF37] font-sans text-xs w-full sm:w-48"
            />
          </div>
        )}
      </div>

      {/* Selected screen display */}
      {activeTab === 'schedule' ? (
        <ScheduleClass 
          courses={courses} 
          onSubmit={async (formData) => {
            await onScheduleClass(formData);
            setActiveTab('upcoming');
          }}
          onCancel={() => setActiveTab('upcoming')}
        />
      ) : activeTab === 'attendance' ? (
        <AttendanceTable 
          records={[]} // Will fetch details dynamically, but we can pass mock or feed standard joins
          classTopic="All Active Sessions"
        />
      ) : (
        <div className="space-y-4">
          {filteredClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((session) => (
                <LiveClassCard
                  key={session.id}
                  session={session}
                  isEnrolled={true}
                  userRole="Admin"
                  onJoin={onViewDetails}
                  onEdit={onViewDetails}
                  onDelete={async (sess) => {
                    if (confirm(`Are you sure you want to delete "${sess.topic}" scheduled lecture?`)) {
                      await onDeleteClass(sess.id);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center space-y-3 max-w-md mx-auto">
              <Sparkles className="w-10 h-10 text-[#D4AF37]/30 mx-auto" />
              <h4 className="font-serif text-base font-bold text-stone-900">Desk Archive Empty</h4>
              <p className="text-stone-500 text-xs font-light">
                No active lectures available in this category matching your criteria. Click "Schedule" to create one.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
