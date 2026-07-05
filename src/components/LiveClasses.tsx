import React, { useState, useEffect } from 'react';
import StudentLiveDashboard from './StudentLiveDashboard';
import TeacherDashboard from './TeacherDashboard';
import MeetingDetails from './MeetingDetails';
import RecordingViewer from './RecordingViewer';
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

interface LiveClassesProps {
  currentUser: {
    id: string;
    email: string;
    name: string;
    role: 'Admin' | 'Teacher' | 'Student' | 'Guest';
  };
  courses: { id: string; title: string; image?: string }[];
  enrollments: { id: string; courseTitle: string; userEmail: string }[];
  onToast: (msg: string) => void;
  onEnrollTrigger?: (courseTitle: string) => void;
}

export default function LiveClasses({
  currentUser,
  courses,
  enrollments,
  onToast,
  onEnrollTrigger
}: LiveClassesProps) {
  const [liveSessions, setLiveSessions] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modals / Details states
  const [selectedSession, setSelectedSession] = useState<LiveClass | null>(null);
  const [activeRecordingSession, setActiveRecordingSession] = useState<LiveClass | null>(null);

  // Filter student enrollments
  const enrolledCourseTitles = enrollments
    .filter(e => e.userEmail === currentUser.email)
    .map(e => e.courseTitle);

  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Teacher';

  // Fetch classes on load
  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/api/live-classes');
      if (data) {
        setLiveSessions(data);
      }
    } catch (err) {
      console.error("Error loading live classes:", err);
      onToast("Could not load scheduled lectures.");
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: Schedule class handler
  const handleScheduleClass = async (formData: any) => {
    try {
      const data = await apiFetch('/api/live-classes', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (data && data.success) {
        setLiveSessions(prev => [data.liveClass, ...prev]);
        onToast(`Successfully scheduled "${formData.topic}"!`);
      }
    } catch (err) {
      console.error("Error scheduling class:", err);
      onToast("Failed to schedule lecture.");
    }
  };

  // Admin: Update class handler
  const handleUpdateClass = async (classId: string, updatedData: any) => {
    try {
      const data = await apiFetch(`/api/live-classes/${classId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      if (data && data.success) {
        setLiveSessions(prev => prev.map(c => c.id === classId ? data.liveClass : c));
        if (selectedSession && selectedSession.id === classId) {
          setSelectedSession(data.liveClass);
        }
        onToast("Class coordinates updated successfully.");
      }
    } catch (err) {
      console.error("Error updating class:", err);
      onToast("Failed to update class details.");
    }
  };

  // Admin: Delete class handler
  const handleDeleteClass = async (classId: string) => {
    try {
      const data = await apiFetch(`/api/live-classes/${classId}`, {
        method: 'DELETE'
      });
      if (data && data.success) {
        setLiveSessions(prev => prev.filter(c => c.id !== classId));
        onToast("Class scheduled deleted successfully.");
      }
    } catch (err) {
      console.error("Error deleting class:", err);
      onToast("Failed to delete lecture.");
    }
  };

  // Student: Join class action
  const handleStudentJoin = async (session: LiveClass) => {
    try {
      onToast("Connecting to live classroom room...");
      
      // Call Join endpoint to record attendance automatically
      await apiFetch('/api/live-class/join', {
        method: 'POST',
        body: JSON.stringify({
          classId: session.id,
          userEmail: currentUser.email,
          userName: currentUser.name,
          ip: '127.0.0.1', // server calculates or accepts client params
          browser: navigator.userAgent
        })
      });

      // Open meeting in new browser tab
      window.open(session.meetingLink, '_blank');
      
      onToast("Live classroom loaded in new tab.");
    } catch (err) {
      console.error("Error joining live session:", err);
      onToast("Failed to record classroom access log.");
    }
  };

  const handleEnrollTrigger = (courseTitle: string) => {
    if (onEnrollTrigger) {
      onEnrollTrigger(courseTitle);
    } else {
      onToast(`Please visit the Course desk tab to enroll in "${courseTitle}".`);
    }
  };

  return (
    <div className="space-y-6">
      
      {isLoading ? (
        <div className="text-center py-20 text-stone-400 font-mono text-xs">
          <span className="w-5 h-5 inline-block border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mr-2" />
          Synchronizing virtual academy coordinates...
        </div>
      ) : isAdmin ? (
        <TeacherDashboard
          liveClasses={liveSessions}
          courses={courses}
          onScheduleClass={handleScheduleClass}
          onUpdateClass={handleUpdateClass}
          onDeleteClass={handleDeleteClass}
          onViewDetails={(sess) => setSelectedSession(sess)}
        />
      ) : (
        <StudentLiveDashboard
          liveClasses={liveSessions}
          enrolledCourseTitles={enrolledCourseTitles}
          userEmail={currentUser.email}
          onJoin={handleStudentJoin}
          onWatchRecording={(sess) => setActiveRecordingSession(sess)}
          onEnroll={handleEnrollTrigger}
          courses={courses}
        />
      )}

      {/* Meeting Details Modal (Admins can manage, Students can view) */}
      {selectedSession && (
        <MeetingDetails
          session={selectedSession}
          userRole={currentUser.role}
          onClose={() => {
            setSelectedSession(null);
            fetchLiveClasses(); // Refresh to catch details
          }}
          onUpdate={(updated) => {
            setSelectedSession(updated);
            setLiveSessions(prev => prev.map(c => c.id === updated.id ? updated : c));
          }}
        />
      )}

      {/* Recording Viewer Modal for Students */}
      {activeRecordingSession && (
        <RecordingViewer
          topic={activeRecordingSession.topic}
          courseTitle={activeRecordingSession.courseTitle}
          recordings={activeRecordingSession.recordings}
          notes={activeRecordingSession.notes}
          onClose={() => setActiveRecordingSession(null)}
        />
      )}
    </div>
  );
}
