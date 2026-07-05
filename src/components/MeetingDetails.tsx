import React, { useState, useEffect } from 'react';
import { X, Video, FileText, Play, CheckCircle2, Copy, AlertCircle, Sparkles, Download, Plus, Trash2, Users } from 'lucide-react';
import AttendanceTable from './AttendanceTable';
import { apiFetch } from '../lib/api';

interface LiveClass {
  id: string;
  courseTitle: string;
  batch?: string;
  topic: string;
  description?: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  meetingLink: string;
  meetingCode?: string;
  thumbnail?: string;
  notes?: { title: string; downloadUrl: string; size: string }[];
  recordings?: { title: string; videoUrl: string; duration?: string }[];
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
}

interface MeetingDetailsProps {
  session: LiveClass;
  userRole: 'Admin' | 'Teacher' | 'Student' | 'Guest';
  onClose: () => void;
  onUpdate: (updatedSession: LiveClass) => void;
}

export default function MeetingDetails({ session, userRole, onClose, onUpdate }: MeetingDetailsProps) {
  const isAdmin = userRole === 'Admin' || userRole === 'Teacher';
  const [activeTab, setActiveTab] = useState<'info' | 'materials' | 'attendance'>('info');
  const [copied, setCopied] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  // Recording fields
  const [newRecTitle, setNewRecTitle] = useState('');
  const [newRecUrl, setNewRecUrl] = useState('https://www.w3schools.com/html/mov_bbb.mp4');
  const [newRecDuration, setNewRecDuration] = useState('45 Mins');

  // Materials fields
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'attendance' && isAdmin) {
      fetchAttendance();
    }
  }, [activeTab]);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch(`/api/live-class/attendance/${session.id}`);
      if (data) {
        setAttendanceRecords(data);
      }
    } catch (err) {
      console.error("Error fetching class attendance:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMeetLink = () => {
    navigator.clipboard.writeText(session.meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: 'scheduled' | 'live' | 'completed' | 'cancelled') => {
    try {
      const data = await apiFetch(`/api/live-classes/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (data && data.success) {
        onUpdate(data.liveClass);
        if (newStatus === 'live' && session.meetingLink) {
          // Open the meeting link in a new tab to bypass iframe sandbox limits
          window.open(session.meetingLink, '_blank');
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleAddRecording = async () => {
    if (!newRecTitle || !newRecUrl) return;

    const newRecordings = [
      ...(session.recordings || []),
      { title: newRecTitle, videoUrl: newRecUrl, duration: newRecDuration, uploadedAt: new Date().toLocaleDateString() }
    ];

    try {
      const data = await apiFetch(`/api/live-classes/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({ recordings: newRecordings, status: 'completed' })
      });
      if (data && data.success) {
        onUpdate(data.liveClass);
        setNewRecTitle('');
        setNewRecUrl('https://www.w3schools.com/html/mov_bbb.mp4');
      }
    } catch (err) {
      console.error("Error adding recording:", err);
    }
  };

  const handleAddDocument = async () => {
    if (!newDocTitle) return;

    const newNotes = [
      ...(session.notes || []),
      { title: newDocTitle, downloadUrl: newDocUrl || '#', size: '1.4 MB' }
    ];

    try {
      const data = await apiFetch(`/api/live-classes/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({ notes: newNotes })
      });
      if (data && data.success) {
        onUpdate(data.liveClass);
        setNewDocTitle('');
        setNewDocUrl('');
      }
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  const handleRemoveRecording = async (index: number) => {
    const updated = (session.recordings || []).filter((_, i) => i !== index);
    try {
      const data = await apiFetch(`/api/live-classes/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({ recordings: updated })
      });
      if (data && data.success) {
        onUpdate(data.liveClass);
      }
    } catch (err) {
      console.error("Error removing recording:", err);
    }
  };

  const handleRemoveNote = async (index: number) => {
    const updated = (session.notes || []).filter((_, i) => i !== index);
    try {
      const data = await apiFetch(`/api/live-classes/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({ notes: updated })
      });
      if (data && data.success) {
        onUpdate(data.liveClass);
      }
    } catch (err) {
      console.error("Error removing notes:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
        
        {/* Header bar */}
        <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#AA7C11] font-mono tracking-widest uppercase font-bold block">
                {session.courseTitle}
              </span>
              <h3 className="font-serif text-base md:text-lg font-bold text-stone-900 truncate max-w-[400px]">
                {session.topic}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 border-b border-stone-100 flex gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'info' ? 'border-[#D4AF37] text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Meeting Information
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`py-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'materials' ? 'border-[#D4AF37] text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Syllabus & Materials ({session.notes?.length || 0})
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'attendance' ? 'border-[#D4AF37] text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              Attendance Tracker
            </button>
          )}
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left col: Core Details */}
              <div className="md:col-span-2 space-y-5">
                <div className="space-y-2">
                  <h4 className="font-serif text-sm font-bold text-stone-900">Agenda & Guidelines</h4>
                  <p className="text-stone-600 text-xs font-light leading-relaxed">
                    {session.description || 'This is a premium interactive tailoring session where we construct detailed patterns under teacher guidance. Make sure to prepare paper grids, curve scales, and tailoring scissors.'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-2xl grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase">Scheduled Date</span>
                    <p className="font-semibold text-stone-800 mt-0.5">{session.date}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase">Session Timing</span>
                    <p className="font-semibold text-stone-800 mt-0.5">{session.time}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase">Teacher / Host</span>
                    <p className="font-semibold text-stone-800 mt-0.5">{session.instructor}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-mono text-[10px] uppercase">Target Batch</span>
                    <p className="font-semibold text-stone-800 mt-0.5">{session.batch || 'All Batches'}</p>
                  </div>
                </div>

                {/* Google Meet details section */}
                <div className="border border-stone-200/80 rounded-2xl p-5 bg-gradient-to-r from-stone-50 to-stone-100/50 space-y-3.5">
                  <div className="flex items-center gap-2.5 text-[#D4AF37]">
                    <Video className="w-5 h-5 shrink-0" />
                    <h5 className="font-mono text-xs uppercase tracking-widest font-bold">Google Meet Link Details</h5>
                  </div>
                  
                  <div className="bg-white border border-stone-200 p-3.5 rounded-xl flex items-center justify-between gap-4">
                    <span className="font-mono text-xs text-stone-600 truncate flex-1">{session.meetingLink}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={copyMeetLink}
                        className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-500 hover:text-stone-900 transition-all cursor-pointer"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {copied && <p className="text-[11px] text-green-600 font-mono">Meet link copied to clipboard!</p>}
                </div>
              </div>

              {/* Right col: Session Management actions for Admin */}
              <div className="space-y-5">
                <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50 space-y-4">
                  <h4 className="font-serif text-sm font-bold text-stone-900">Current Status</h4>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold border ${
                      session.status === 'live' 
                        ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                        : session.status === 'completed'
                          ? 'bg-stone-100 text-stone-500 border-stone-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {session.status}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="space-y-2 pt-2 border-t border-stone-200/60">
                      <span className="text-stone-400 font-mono text-[9px] uppercase tracking-wider block">Set Class State</span>
                      <button
                        onClick={() => handleStatusChange('live')}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-mono uppercase tracking-widest font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                      >
                        🔴 Go Live Now
                      </button>
                      <button
                        onClick={() => handleStatusChange('completed')}
                        className="w-full bg-stone-900 hover:bg-black text-white text-[11px] font-mono uppercase tracking-widest font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                      >
                        ✅ Mark Completed
                      </button>
                      <button
                        onClick={() => handleStatusChange('cancelled')}
                        className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[11px] font-mono uppercase tracking-widest font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                      >
                        ✖ Cancel Class
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Card on Recordings if completed */}
                {session.status === 'completed' && (
                  <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/35 rounded-2xl p-5 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#AA7C11]">
                      <Sparkles className="w-4 h-4" />
                      <h5 className="font-bold">Recorded Lectures</h5>
                    </div>
                    <p className="text-stone-600 font-light leading-relaxed">
                      This class has concluded. Enrolled students can access recordings inside the "Completed" desk tab.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Side: Recordings List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-[#D4AF37]" />
                    <span>Uploaded Video Recordings ({session.recordings?.length || 0})</span>
                  </h4>
                </div>

                {session.recordings && session.recordings.length > 0 ? (
                  <div className="space-y-2">
                    {session.recordings.map((rec, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs">
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-800 truncate">{rec.title}</p>
                          <p className="text-[10px] text-stone-400 font-mono mt-0.5">{rec.duration || 'Full duration'}</p>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleRemoveRecording(idx)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 text-xs italic font-mono p-4 bg-stone-50 border border-stone-100 rounded-xl text-center">No video recordings uploaded for this session yet.</p>
                )}

                {isAdmin && (
                  <div className="p-4 bg-stone-50/50 border border-dashed border-stone-200 rounded-2xl space-y-3 pt-3.5 text-xs">
                    <h5 className="font-mono text-[10px] uppercase font-bold text-[#AA7C11]">Add New Video Recording</h5>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Video Title (e.g., Drafting Princess Cut Part 1)"
                        value={newRecTitle}
                        onChange={(e) => setNewRecTitle(e.target.value)}
                        className="w-full bg-white border border-stone-200 p-2.5 rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Video URL (mp4 or streamer link)"
                        value={newRecUrl}
                        onChange={(e) => setNewRecUrl(e.target.value)}
                        className="w-full bg-white border border-stone-200 p-2.5 rounded-xl font-mono text-[11px]"
                      />
                      <button
                        onClick={handleAddRecording}
                        className="w-full bg-stone-900 hover:bg-black text-white py-2 rounded-xl text-xs font-mono uppercase font-bold"
                      >
                        Upload Lecture Video
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Notes and Blueprints */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <span>PDF Blueprints & Handouts ({session.notes?.length || 0})</span>
                  </h4>
                </div>

                {session.notes && session.notes.length > 0 ? (
                  <div className="space-y-2">
                    {session.notes.map((note, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-[#D4AF37]" />
                          <span className="font-medium text-stone-800 truncate">{note.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={note.downloadUrl || '#'}
                            download
                            className="p-1.5 text-stone-500 hover:text-[#D4AF37]"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          {isAdmin && (
                            <button
                              onClick={() => handleRemoveNote(idx)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 text-xs italic font-mono p-4 bg-stone-50 border border-stone-100 rounded-xl text-center">No PDFs or blueprints attached.</p>
                )}

                {isAdmin && (
                  <div className="p-4 bg-stone-50/50 border border-dashed border-stone-200 rounded-2xl space-y-3 pt-3.5 text-xs">
                    <h5 className="font-mono text-[10px] uppercase font-bold text-[#AA7C11]">Add Blueprint Material</h5>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Material Title (e.g. Sleeves Measurement Chart)"
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        className="w-full bg-white border border-stone-200 p-2.5 rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Downloadable Link (PDF/ZIP)"
                        value={newDocUrl}
                        onChange={(e) => setNewDocUrl(e.target.value)}
                        className="w-full bg-white border border-stone-200 p-2.5 rounded-xl font-mono text-[11px]"
                      />
                      <button
                        onClick={handleAddDocument}
                        className="w-full bg-stone-900 hover:bg-black text-white py-2 rounded-xl text-xs font-mono uppercase font-bold"
                      >
                        Attach Blueprint File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && isAdmin && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12 text-stone-400 font-mono text-xs">
                  <span className="w-4 h-4 inline-block border-2 border-stone-300 border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing join logs...
                </div>
              ) : (
                <AttendanceTable records={attendanceRecords} classTopic={session.topic} />
              )}
            </div>
          )}
        </div>

        {/* Footer bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#111111] hover:bg-[#D4AF37] text-white hover:text-black py-2.5 px-6 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition-all cursor-pointer shadow-sm"
          >
            Close Coordinator
          </button>
        </div>
      </div>
    </div>
  );
}
