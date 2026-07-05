import React from 'react';
import { Calendar } from 'lucide-react';

interface CalendarButtonProps {
  liveClass: {
    topic: string;
    courseTitle: string;
    date: string; // YYYY-MM-DD
    time: string; // "11:00 AM - 12:00 PM" or similar
    meetingLink: string;
    description?: string;
  };
}

export default function CalendarButton({ liveClass }: CalendarButtonProps) {
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Pearls Academy Live: ${liveClass.topic} (${liveClass.courseTitle})`);
    
    // Parse time
    let startHour = 12;
    let startMin = 0;
    const timeMatch = liveClass.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const min = parseInt(timeMatch[2]);
      const ampm = timeMatch[3].toUpperCase();
      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      startHour = hour;
      startMin = min;
    }

    // Date
    const dateObj = new Date(liveClass.date);
    dateObj.setHours(startHour, startMin, 0);
    const startIso = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    // End time (+1 hr default)
    dateObj.setHours(dateObj.getHours() + 1);
    const endIso = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const details = encodeURIComponent(
      `${liveClass.description || ''}\n\nJoin Live Class: ${liveClass.meetingLink}\n\nDrafted with Pearls Butik Academy.`
    );
    const location = encodeURIComponent(liveClass.meetingLink);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  return (
    <a
      href={getGoogleCalendarUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-200 hover:border-[#D4AF37] hover:bg-stone-50 text-stone-700 text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer"
      title="Add event to Google Calendar"
    >
      <Calendar className="w-4 h-4 text-[#D4AF37]" />
      <span>Add to Calendar</span>
    </a>
  );
}
