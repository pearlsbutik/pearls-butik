import React, { useState } from 'react';
import { Search, Filter, Download, Calendar, Clock, User, ArrowLeft, RefreshCw, FileText } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  classId: string;
  courseTitle: string;
  topic: string;
  userEmail: string;
  userName: string;
  joinTime: string;
  leaveTime: string | null;
  duration: number;
  ip: string;
  browser: string;
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  classTopic: string;
  onBack?: () => void;
}

export default function AttendanceTable({ records, classTopic, onBack }: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'ongoing'>('all');

  // Format Date-Time
  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter Logic
  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.topic.toLowerCase().includes(searchTerm.toLowerCase());

    const isOngoing = rec.leaveTime === null;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'completed' && !isOngoing) ||
      (statusFilter === 'ongoing' && isOngoing);

    return matchesSearch && matchesStatus;
  });

  // Export CSV function
  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Topic', 'Date', 'Join Time', 'Leave Time', 'Duration (Mins)', 'IP Address', 'Browser'];
    const rows = filteredRecords.map(rec => [
      rec.userName,
      rec.userEmail,
      rec.topic,
      formatDate(rec.joinTime),
      formatTime(rec.joinTime),
      formatTime(rec.leaveTime),
      rec.duration ? `${rec.duration} Mins` : 'Active',
      rec.ip,
      rec.browser.replace(/,/g, ' ') // Avoid breaking CSV columns
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${classTopic.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm space-y-6">
      
      {/* Header and Controls */}
      <div className="p-6 pb-0 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 text-xs font-mono uppercase tracking-wider mb-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Classes</span>
              </button>
            )}
            <h3 className="font-serif text-lg font-bold text-stone-900">Attendance Sheet</h3>
            <p className="text-xs text-stone-500 font-light mt-0.5">
              Class Topic: <span className="font-mono text-stone-800 font-semibold">{classTopic || 'All Sessions'}</span>
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={exportToCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search and Filters bar */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search student by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 p-3 pl-10 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-sans text-xs"
            />
          </div>

          {/* Status filter */}
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              All Logs ({records.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                statusFilter === 'completed' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Completed ({records.filter(r => r.leaveTime !== null).length})
            </button>
            <button
              onClick={() => setStatusFilter('ongoing')}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                statusFilter === 'ongoing' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Ongoing ({records.filter(r => r.leaveTime === null).length})
            </button>
          </div>
        </div>
      </div>

      {/* Grid view table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-y border-stone-100 text-[10px] font-mono uppercase tracking-wider text-stone-500">
              <th className="py-3 px-6">Student</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Join Time</th>
              <th className="py-3 px-6">Leave Time</th>
              <th className="py-3 px-6">Duration</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Device Metrics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((rec) => {
                const isOngoing = rec.leaveTime === null;
                return (
                  <tr key={rec.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-serif font-bold text-xs">
                          {rec.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-950">{rec.userName}</p>
                          <p className="text-[10px] text-stone-400 font-mono">{rec.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-stone-600">
                      {formatDate(rec.joinTime)}
                    </td>
                    <td className="py-4 px-6 text-stone-600 font-mono">
                      {formatTime(rec.joinTime)}
                    </td>
                    <td className="py-4 px-6 text-stone-600 font-mono">
                      {formatTime(rec.leaveTime)}
                    </td>
                    <td className="py-4 px-6 font-mono">
                      {isOngoing ? (
                        <span className="text-amber-600 font-bold">Active</span>
                      ) : (
                        <span className="text-stone-800 font-medium">{rec.duration} mins</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {isOngoing ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2 py-0.5 rounded-md border border-red-100 animate-pulse">
                          Live Now
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-green-50 text-green-600 px-2 py-0.5 rounded-md border border-green-100">
                          Attended
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-[10px] text-stone-400 font-mono block truncate max-w-[150px]" title={rec.browser}>
                        {rec.ip} • {rec.browser.split(' ')[0]}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-stone-400 text-xs">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="w-8 h-8 text-stone-300" />
                    <p className="font-mono">No matching attendance records found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
        <p className="text-[10px] font-mono text-stone-400">
          Showing {filteredRecords.length} of {records.length} total activity coordinates. Updates in real-time.
        </p>
      </div>
    </div>
  );
}
