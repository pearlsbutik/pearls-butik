import React, { useState } from 'react';
import { Calendar, Clock, Video, BookOpen, Search, Filter, Sparkles, BookMarked, History } from 'lucide-react';
import LiveClassCard, { LiveClass } from './LiveClassCard';

interface Course {
  id: string;
  title: string;
}

interface StudentLiveDashboardProps {
  liveClasses: LiveClass[];
  enrolledCourseTitles: string[];
  userEmail: string;
  onJoin: (session: LiveClass) => void;
  onWatchRecording: (session: LiveClass) => void;
  onEnroll: (courseTitle: string) => void;
  courses: Course[];
}

export default function StudentLiveDashboard({
  liveClasses,
  enrolledCourseTitles,
  userEmail,
  onJoin,
  onWatchRecording,
  onEnroll,
  courses
}: StudentLiveDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  // Filter sessions
  const filteredSessions = liveClasses.filter(session => {
    const matchesSearch = session.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || session.courseTitle === selectedCourse;
    
    // Status tab filtering
    const isCompleted = session.status === 'completed';
    const matchesTab = activeTab === 'upcoming' ? !isCompleted : isCompleted;

    return matchesSearch && matchesCourse && matchesTab;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-[#D4AF37]/20 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="space-y-2 relative z-10">
          <span className="text-[#D4AF37] text-[10px] font-mono tracking-widest uppercase font-bold bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/30">
            Pearls Academy Studio
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">Interactive Live Lectures</h2>
          <p className="text-stone-400 text-xs font-light max-w-xl">
            Join scheduled, premium tailoring sessions directly inside Pearls Academy Portal. Open pattern drafts and coordinate calculations with Pratibha Ingole.
          </p>
        </div>
        
        {/* Active Class Quick Alert if any is live right now */}
        {liveClasses.some(c => c.status === 'live' && enrolledCourseTitles.includes(c.courseTitle)) && (
          <div className="bg-red-600/20 border border-red-500/40 p-4 rounded-2xl flex items-center gap-3 animate-pulse shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-white uppercase font-mono tracking-wider">Class is Live now!</p>
              <p className="text-stone-300 text-[10px] mt-0.5">Click "Join" to access current room.</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Desk & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        
        {/* Toggle Desk */}
        <div className="flex bg-stone-100 p-1 rounded-xl w-max self-start">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-lg text-xs font-mono uppercase font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>Upcoming Desk</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2.5 rounded-lg text-xs font-mono uppercase font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <History className="w-4 h-4 text-[#D4AF37]" />
            <span>Completed Lectures</span>
          </button>
        </div>

        {/* Filter Selection Group */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search bar */}
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

          {/* Course select */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl focus:outline-none focus:border-[#D4AF37] font-sans text-xs"
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.title}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Course List Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const isEnrolled = enrolledCourseTitles.includes(session.courseTitle);
            return (
              <LiveClassCard
                key={session.id}
                session={session}
                isEnrolled={isEnrolled}
                userRole="Student"
                onJoin={onJoin}
                onWatchRecording={onWatchRecording}
                onEnroll={() => onEnroll(session.courseTitle)}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <BookMarked className="w-12 h-12 text-[#D4AF37]/30 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-bold text-stone-900">No scheduled sessions in this desk</h4>
            <p className="text-stone-500 text-xs font-light">
              We couldn't find any {activeTab === 'upcoming' ? 'upcoming' : 'completed'} lectures aligning with your criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
