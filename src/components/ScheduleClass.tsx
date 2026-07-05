import React, { useState } from 'react';
import { Plus, X, Video, FileText, Info, Sparkles, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  image?: string;
}

interface ScheduleClassProps {
  courses: Course[];
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
}

export default function ScheduleClass({ courses, onSubmit, onCancel }: ScheduleClassProps) {
  const [courseTitle, setCourseTitle] = useState(courses[0]?.title || 'Basic Dress Designing Course');
  const [batch, setBatch] = useState('All Batches');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('Pratibha Ingole');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('11:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [duration, setDuration] = useState('1 Hour');
  
  const [googleMeetLink, setGoogleMeetLink] = useState('https://meet.google.com/abc-defg-hij');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1544816155-12df9643f363?w=800');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteUrl, setNoteUrl] = useState('#');
  const [notes, setNotes] = useState<{ title: string; downloadUrl: string; size: string }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addNote = () => {
    if (!noteTitle) return;
    setNotes([...notes, { title: noteTitle, downloadUrl: noteUrl || '#', size: '1.2 MB' }]);
    setNoteTitle('');
    setNoteUrl('#');
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status: 'draft' | 'scheduled') => {
    if (!topic || !date || !googleMeetLink) {
      setError('Please fill in Topic, Date, and Google Meet Link.');
      return;
    }

    if (!googleMeetLink.includes('meet.google.com')) {
      setError('Google Meet Link must be a valid google meet URL (e.g. https://meet.google.com/abc-defg-hij)');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const meetCode = googleMeetLink.split('/').pop() || '';
      await onSubmit({
        courseTitle,
        batch,
        topic,
        description,
        instructor,
        date,
        time: `${startTime} - ${endTime}`,
        startTime,
        endTime,
        duration,
        meetingLink: googleMeetLink,
        meetingCode: meetCode,
        thumbnail,
        notes,
        status
      });
    } catch (err: any) {
      setError(err.message || 'Failed to schedule class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#D4AF37]/35 rounded-3xl shadow-lg p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900">Schedule New Live Workshop</h3>
            <p className="text-xs text-stone-500 font-light mt-0.5">Define coordinates and resources for students to join.</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-full hover:bg-stone-50 text-stone-400 hover:text-stone-700 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* Target Course Select */}
        <div className="space-y-1.5">
          <label className="text-stone-500 font-mono uppercase tracking-wider font-semibold">Target Course *</label>
          <select
            value={courseTitle}
            onChange={(e) => {
              setCourseTitle(e.target.value);
              const selected = courses.find(c => c.title === e.target.value);
              if (selected?.image) setThumbnail(selected.image);
            }}
            className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-sans"
          >
            {courses.map(c => (
              <option key={c.id} value={c.title}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Batch selection */}
        <div className="space-y-1.5">
          <label className="text-stone-500 font-mono uppercase tracking-wider font-semibold">Target Batch</label>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-sans"
          >
            <option value="All Batches">All Batches (Standard)</option>
            <option value="Morning Batch (10 AM)">Morning Batch (10 AM)</option>
            <option value="Afternoon Batch (2 PM)">Afternoon Batch (2 PM)</option>
            <option value="Evening Special (6 PM)">Evening Special (6 PM)</option>
          </select>
        </div>

        {/* Topic Title */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-stone-500 font-mono uppercase tracking-wider font-semibold">Lecture Topic / Chapter *</label>
          <input
            type="text"
            required
            placeholder="e.g. Princes Cut & Volume Calculations Blueprint"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-sans text-stone-900"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-stone-500 font-mono uppercase tracking-wider font-semibold">Workshop Agenda / Syllabus</label>
          <textarea
            placeholder="Describe what steps, tools, and materials are required for the session..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-sans text-stone-900 resize-none"
          />
        </div>

        {/* Teacher */}
        <div className="space-y-1.5">
          <label className="text-stone-500 font-mono uppercase tracking-wider font-semibold">Instructor / Coach</label>
          <input
            type="text"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-all font-sans"
          />
        </div>

        {/* Date Selection */}
        <div className="space-y-1.5">
          <label className="text-stone-500 font-mono uppercase tracking-wider font-semibold">Session Date *</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-all font-sans"
          />
        </div>

        {/* Start Time */}
        <div className="grid grid-cols-3 gap-2 md:col-span-2">
          <div className="space-y-1.5">
            <label className="text-stone-500 font-mono uppercase tracking-wider font-semibold">Start Time</label>
            <input
              type="text"
              placeholder="e.g. 11:00 AM"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-all font-sans"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-stone-500 font-mono uppercase tracking-wider font-semibold">End Time</label>
            <input
              type="text"
              placeholder="e.g. 12:00 PM"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-all font-sans"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-stone-500 font-mono uppercase tracking-wider font-semibold">Duration</label>
            <input
              type="text"
              placeholder="e.g. 1 Hour"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-all font-sans"
            />
          </div>
        </div>

        {/* Google Meet Link */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[#D4AF37] font-mono uppercase tracking-wider font-bold flex items-center gap-1">
            <Video className="w-3.5 h-3.5" />
            <span>Google Meet URL *</span>
          </label>
          <input
            type="url"
            required
            placeholder="e.g. https://meet.google.com/abc-defg-hij"
            value={googleMeetLink}
            onChange={(e) => setGoogleMeetLink(e.target.value)}
            className="w-full bg-amber-500/5 border border-[#D4AF37]/40 hover:border-[#D4AF37] p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-mono text-stone-900 text-sm"
          />
        </div>

        {/* Thumbnail URL */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-stone-500 font-mono uppercase tracking-wider font-semibold">Cover Thumbnail URL</label>
          <input
            type="text"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-all font-sans text-stone-500"
          />
        </div>

        {/* Attach Notes and Files */}
        <div className="md:col-span-2 p-4 border border-stone-100 bg-stone-50/50 rounded-2xl space-y-3">
          <h4 className="font-serif text-sm font-semibold text-stone-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            <span>Attach Handouts / PDF Patterns</span>
          </h4>
          <p className="text-[11px] text-stone-500 font-light">Provide PDFs or charts for students to read during the session.</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Handout Title (e.g. Princess Cut Mathematics)"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="flex-1 bg-white border border-stone-200 p-2.5 rounded-xl focus:outline-none"
            />
            <button
              type="button"
              onClick={addNote}
              className="bg-[#111111] hover:bg-[#D4AF37] text-white hover:text-black px-4 rounded-xl font-mono uppercase tracking-widest transition-all text-[11px] cursor-pointer font-bold"
            >
              Add File
            </button>
          </div>

          {notes.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {notes.map((note, index) => (
                <div key={index} className="flex items-center justify-between bg-white border border-stone-200 p-2 px-3 rounded-lg text-[11px]">
                  <span className="font-medium text-stone-700">{note.title}</span>
                  <button
                    type="button"
                    onClick={() => removeNote(index)}
                    className="text-red-500 hover:text-red-700 font-mono font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-stone-100">
        <button
          type="button"
          onClick={onCancel}
          className="bg-stone-50 hover:bg-stone-100 px-5 py-3 rounded-xl text-xs font-mono uppercase tracking-wider text-stone-600 transition-all cursor-pointer font-bold"
        >
          Cancel
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('draft')}
            className="bg-stone-100 hover:bg-stone-200 px-5 py-3 rounded-xl text-xs font-mono uppercase tracking-wider text-stone-700 transition-all cursor-pointer font-bold"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('scheduled')}
            className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:brightness-110 text-black px-6 py-3 rounded-xl text-xs font-mono uppercase tracking-widest font-bold shadow-md transition-all cursor-pointer"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Workshop'}
          </button>
        </div>
      </div>
    </div>
  );
}
