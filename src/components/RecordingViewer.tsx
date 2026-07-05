import React, { useState } from 'react';
import { Play, Download, X, Film, Calendar, Clock, Video } from 'lucide-react';

interface Recording {
  title: string;
  videoUrl: string;
  duration?: string;
  uploadedAt?: string;
}

interface RecordingViewerProps {
  topic: string;
  courseTitle: string;
  recordings?: Recording[];
  notes?: { title: string, downloadUrl: string, size?: string }[];
  onClose: () => void;
}

export default function RecordingViewer({ topic, courseTitle, recordings = [], notes = [], onClose }: RecordingViewerProps) {
  const [activeVideo, setActiveVideo] = useState<Recording | null>(recordings[0] || null);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
        
        {/* Left Side: Video Player Area */}
        <div className="flex-1 bg-black flex flex-col justify-between relative p-4 h-[50%] md:h-full">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-white p-2.5 rounded-full transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {activeVideo ? (
            <div className="flex-1 flex flex-col justify-center items-center w-full h-full">
              {/* HTML5 Video elements with default play controls */}
              <video
                key={activeVideo.videoUrl}
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="w-full max-h-[85%] object-contain rounded-2xl"
                poster="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200"
              />
              <div className="mt-4 text-left w-full px-2">
                <span className="text-[10px] text-[#D4AF37] font-mono tracking-widest uppercase font-bold block mb-1">
                  Now Streaming Recording
                </span>
                <h3 className="text-white font-serif text-lg font-bold">{activeVideo.title}</h3>
                <p className="text-stone-400 text-xs mt-1">
                  Course: {courseTitle} • Topic: {topic} {activeVideo.duration ? `• ${activeVideo.duration}` : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-500 space-y-3">
              <Video className="w-12 h-12 text-[#D4AF37]/40" />
              <p className="font-mono text-sm">No recorded lecture available yet.</p>
              <p className="text-xs text-stone-600">The tutor has not uploaded the recording for this session.</p>
            </div>
          )}
        </div>

        {/* Right Side: Navigation & Resources */}
        <div className="w-full md:w-[320px] bg-stone-950 border-t md:border-t-0 md:border-l border-stone-800 p-6 flex flex-col justify-between h-[50%] md:h-full overflow-y-auto">
          <div className="space-y-6">
            <div>
              <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block mb-1">
                Course Archive Desk
              </span>
              <h4 className="text-white font-serif text-base font-bold">Class Materials</h4>
              <p className="text-stone-400 text-xs font-light mt-1">Access all recorded lectures, blueprints, and patterns.</p>
            </div>

            {/* Recordings List */}
            {recordings.length > 0 && (
              <div className="space-y-2.5">
                <h5 className="text-stone-400 text-[10px] font-mono uppercase tracking-widest font-bold">
                  Lectures ({recordings.length})
                </h5>
                <div className="space-y-2">
                  {recordings.map((rec, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveVideo(rec)}
                      className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        activeVideo?.videoUrl === rec.videoUrl
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-black/40 text-[#D4AF37]">
                        <Play className="w-4 h-4 fill-[#D4AF37]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{rec.title}</p>
                        <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                          {rec.duration || 'Full Session'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & PDF Attachments */}
            <div className="space-y-2.5">
              <h5 className="text-stone-400 text-[10px] font-mono uppercase tracking-widest font-bold">
                Downloads & Blueprints ({notes.length})
              </h5>
              {notes.length > 0 ? (
                <div className="space-y-2">
                  {notes.map((note, idx) => (
                    <a
                      key={idx}
                      href={note.downloadUrl || '#'}
                      download
                      className="w-full text-left p-3 rounded-xl border border-stone-800 bg-stone-900/50 hover:bg-stone-900 text-stone-300 hover:text-white flex items-center justify-between gap-3 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded bg-amber-500/10 text-amber-500">
                          <Film className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{note.title}</p>
                          <p className="text-[9px] text-stone-500 font-mono">
                            {note.size || 'PDF Document'}
                          </p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-stone-400 shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-stone-600 italic font-mono">No note downloads attached to this lecture.</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-stone-900">
            <div className="bg-stone-900 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-serif font-bold text-xs">
                PI
              </div>
              <div>
                <p className="text-white text-xs font-medium">Pratibha Ingole</p>
                <p className="text-stone-500 text-[10px]">Academy Founder & Tutor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
