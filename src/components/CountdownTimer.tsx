import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  date: string; // YYYY-MM-DD
  time: string; // "11:00 AM" or similar
  onTimeReached?: () => void;
}

export default function CountdownTimer({ date, time, onTimeReached }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
    isUpcoming: boolean;
    startsInMinutes: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
    isUpcoming: true,
    startsInMinutes: 9999
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Parse date and start time
      let hour = 12;
      let min = 0;
      const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let h = parseInt(timeMatch[1]);
        const m = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        hour = h;
        min = m;
      }

      const targetDate = new Date(date);
      targetDate.setHours(hour, min, 0, 0);

      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        // If it was scheduled for today and is within the duration (e.g. 1.5 hours), consider it Live or just started
        const durationMs = 90 * 60 * 1000; // 1.5 hours window
        const isLive = Math.abs(difference) < durationMs;

        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive,
          isUpcoming: false,
          startsInMinutes: 0
        });

        if (onTimeReached && isLive) {
          onTimeReached();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      const startsInMinutes = Math.floor(difference / (1000 * 60));

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isLive: false,
        isUpcoming: true,
        startsInMinutes
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [date, time, onTimeReached]);

  if (!timeLeft.isUpcoming) {
    if (timeLeft.isLive) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-600 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
          <span>Live Now</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-stone-100 border border-stone-200 text-stone-500 rounded-full text-[10px] font-mono uppercase">
        <span>Completed</span>
      </div>
    );
  }

  // Starts soon alert
  if (timeLeft.startsInMinutes <= 20) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-600 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold animate-pulse">
        <Clock className="w-3.5 h-3.5" />
        <span>Starts in {timeLeft.startsInMinutes} mins!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-1.5">
      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
      <div className="flex items-center gap-1 text-[11px] font-mono text-stone-700">
        <span className="text-stone-400 font-light">Starts in:</span>
        {timeLeft.days > 0 && (
          <>
            <span className="font-bold text-stone-900">{timeLeft.days.toString().padStart(2, '0')}</span>
            <span className="text-[9px] text-stone-400 mr-0.5">d</span>
          </>
        )}
        <span className="font-bold text-stone-900">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-[9px] text-stone-400 mr-0.5">h</span>
        <span className="font-bold text-stone-900">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-[9px] text-stone-400 mr-0.5">m</span>
        {timeLeft.days === 0 && (
          <>
            <span className="font-bold text-stone-900">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-[9px] text-stone-400">s</span>
          </>
        )}
      </div>
    </div>
  );
}
