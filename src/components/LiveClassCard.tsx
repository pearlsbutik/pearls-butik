import React from 'react';
import { Calendar, Clock, User, ArrowRight, Play, FileText, Settings, Trash2, Edit, CheckCircle2, Video } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import CalendarButton from './CalendarButton';

export interface LiveClass {
  id: string;
  courseTitle: string;
  batch?: string;
  topic: string;
  description?: string;
  instructor: string;
  date: string; // YYYY-MM-DD
  time: string; // "11:00 AM - 12:00 PM"
  startTime?: string;
  endTime?: string;
  duration: string;
  meetingLink: string;
  meetingCode?: string;
  thumbnail?: string;
  notes?: { title: string; downloadUrl: string; size: string }[];
  recordings?: { title: string; videoUrl: string; duration?: string }[];
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
}

interface LiveClassCardProps {
  key?: string;
  session: LiveClass;
  isEnrolled: boolean;
  userRole: 'Admin' | 'Teacher' | 'Student' | 'Guest';
  isAttended?: boolean;
  onJoin: (session: LiveClass) => void;
  onWatchRecording?: (session: LiveClass) => void;
  onEdit?: (session: LiveClass) => void;
  onDelete?: (session: LiveClass) => void;
  onEnroll?: () => void;
}

export default function LiveClassCard({
  session,
  isEnrolled,
  userRole,
  isAttended = false,
  onJoin,
  onWatchRecording,
  onEdit,
  onDelete,
  onEnroll
}: LiveClassCardProps) {
  const isAdmin = userRole === 'Admin' || userRole === 'Teacher';
  
  // Calculate status badges
  const getStatusBadge = () => {
    switch (session.status) {
      case 'live':
        return (
          <span className="bg-red-500 text-white border border-red-600 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase font-bold animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Live Now
          </span>
        );
      case 'completed':
        return (
          <span className="bg-stone-100 text-stone-500 border border-stone-200 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase font-semibold">
            Concluded
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase font-semibold">
            Cancelled
          </span>
        );
      case 'draft':
        return (
          <span className="bg-stone-50 text-stone-500 border border-stone-200 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase font-semibold">
            Draft
          </span>
        );
      default:
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase font-bold">
            Scheduled
          </span>
        );
    }
  };

  // Check if joinable
  const isClassTime = () => {
    if (session.status === 'live') return true;
    if (session.status === 'completed' || session.status === 'cancelled' || session.status === 'draft') return false;
    
    // Check if starts in less than 20 minutes
    const dateObj = new Date(session.date);
    let hour = 12;
    let min = 0;
    const timeMatch = session.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1]);
      const m = parseInt(timeMatch[2]);
      const ampm = timeMatch[3].toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      hour = h;
      min = m;
    }
    dateObj.setHours(hour, min, 0, 0);

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    return diffMins <= 20 && diffMins >= -90; // starts in <=20 mins and isn't older than 1.5 hr
  };

  const joinable = isClassTime() && isEnrolled;

  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
      
      {/* Thumbnail Header */}
      <div className="h-44 w-full relative overflow-hidden bg-stone-100">
        <img 
          src={session.thumbnail || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'} 
          alt={session.topic}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Course badge & Status on Image */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
          <span className="text-white bg-black/50 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold">
            {session.courseTitle}
          </span>
          {getStatusBadge()}
        </div>

        {/* Batch indicator */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="text-white text-[10px] font-mono bg-[#D4AF37]/90 px-2 py-0.5 rounded font-bold">
            {session.batch || 'All Batches'}
          </div>
          {isAttended && (
            <div className="bg-green-500/90 text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3" /> Attended
            </div>
          )}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{session.instructor}</span>
            </p>
            <h4 className="font-serif text-base font-bold text-stone-900 group-hover:text-[#AA7C11] transition-all leading-snug">
              {session.topic}
            </h4>
          </div>

          {session.description && (
            <p className="text-stone-500 text-xs font-light line-clamp-2 leading-relaxed">
              {session.description}
            </p>
          )}

          {/* Time & Venue Information */}
          <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-stone-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">{session.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">{session.time}</span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Duration: <strong className="text-stone-800">{session.duration}</strong></span>
            </div>
          </div>
        </div>

        {/* Interactive Controls & Bottom */}
        <div className="space-y-4 pt-3 border-t border-stone-100">
          
          {/* Dynamic Countdown Timer for Upcoming Sessions */}
          {session.status === 'scheduled' && (
            <CountdownTimer 
              date={session.date} 
              time={session.time.split(' - ')[0]} 
            />
          )}

          {/* Buttons depending on roles & status */}
          <div className="flex flex-col gap-2">
            {isAdmin ? (
              // Admin dashboard controls
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(session)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 py-2.5 px-3 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-stone-500" />
                    <span>Manage</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(session)}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition-all cursor-pointer"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : isEnrolled ? (
              // Enrolled student controls
              <div className="space-y-2">
                {session.status === 'completed' && session.recordings && session.recordings.length > 0 ? (
                  <button
                    onClick={() => onWatchRecording && onWatchRecording(session)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-stone-900 to-stone-800 hover:brightness-110 text-white py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                    <span>Watch Recording</span>
                  </button>
                ) : (
                  <button
                    disabled={!joinable}
                    onClick={() => onJoin(session)}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition-all border ${
                      joinable
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-teal-500 hover:brightness-110 cursor-pointer shadow-md'
                        : 'bg-stone-50 text-stone-400 border-stone-100 cursor-not-allowed'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>
                      {session.status === 'live' 
                        ? 'Join Live Class' 
                        : isClassTime() 
                          ? 'Class Active - Join Now' 
                          : 'Join Live Class'}
                    </span>
                  </button>
                )}

                {/* Show Calendar Button for Scheduled upcoming classes */}
                {session.status === 'scheduled' && (
                  <div className="w-full text-center">
                    <CalendarButton liveClass={session} />
                  </div>
                )}
              </div>
            ) : (
              // Unenrolled view controls
              <div className="space-y-1">
                <button
                  onClick={onEnroll}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-stone-900 text-[#D4AF37] border border-[#D4AF37] py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition-all cursor-pointer"
                >
                  <span>Enroll to Attend</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <p className="text-[10px] text-stone-400 font-light text-center">Requires active course subscription.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
