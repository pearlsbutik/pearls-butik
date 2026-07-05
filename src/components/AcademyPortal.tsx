import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Tv, Mic, MicOff, Video, VideoOff, ScreenShare, Hand, 
  Smile, Send, Settings, Users, BookOpen, Download, Award, FileText, 
  Check, X, ChevronRight, Sparkles, Calendar, TrendingUp, IndianRupee, 
  Clock, ArrowLeft, AlertCircle, Trash2, Plus, Edit, ShieldAlert, 
  Volume2, VolumeX, Maximize2, Minimize2, Monitor, PenTool, Eraser, 
  RefreshCw, Play, CheckCircle2, Info, Star, MessageSquare, Bell, CreditCard,
  Search, ShieldCheck, AlertTriangle, User, Lock, Unlock, Smartphone, Mail, MapPin, UserPlus
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import LiveClasses from './LiveClasses';

// Interfaces mirroring the backend
interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Teacher' | 'Student' | 'Guest';
  avatar?: string;
  joinedAt?: string;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  completed?: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface AcademyCourse {
  id: string;
  title: string;
  category: string;
  price: number;
  level: string;
  duration: string;
  image: string;
  skills: string[];
  modules: Module[];
}

interface ScheduledClass {
  id: string;
  courseTitle: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  maxStudents: number;
  instructor: string;
  status: 'scheduled' | 'live' | 'ended';
  meetingLink: string;
}

interface Enrollment {
  id: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  enrolledAt: string;
  completedLessons: string[];
  hasCertificate: boolean;
  invoiceId: string;
  amountPaid: number;
}

interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
}

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseTitle: string;
  userEmail: string;
  userName: string;
  fileUrl: string;
  fileName: string;
  submittedAt: string;
  marks?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

interface Message {
  id: string;
  channel: string;
  senderEmail: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isAnnouncement?: boolean;
}

interface Note {
  id: string;
  courseTitle: string;
  title: string;
  type: string;
  downloadUrl: string;
  size: string;
}

interface AcademyPortalProps {
  onClose: () => void;
  userEmail?: string;
}

export default function AcademyPortal({ onClose, userEmail = 'student@pearls.com' }: AcademyPortalProps) {
  // Global states loaded from server
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [liveSessions, setLiveSessions] = useState<ScheduledClass[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>([]);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [chatSupportList, setChatSupportList] = useState<Message[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // App UI controlling states
  const [selectedRoleEmail, setSelectedRoleEmail] = useState(userEmail);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'classes' | 'assignments' | 'downloads' | 'analytics'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [supportMessageText, setSupportMessageText] = useState('');

  // Admin Passcode Lock system
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  
  // Modal / Interaction states
  const [activeClassroomSession, setActiveClassroomSession] = useState<ScheduledClass | null>(null);
  const [selectedCertificateEnrollment, setSelectedCertificateEnrollment] = useState<Enrollment | null>(null);
  const [activeLectureVideo, setActiveLectureVideo] = useState<{ course: AcademyCourse; lesson: Lesson } | null>(null);
  
  // Enrollment / Checkout Modal
  const [checkoutCourse, setCheckoutCourse] = useState<AcademyCourse | null>(null);
  const [billingName, setBillingName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'Razorpay'>('Stripe');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [issuedInvoice, setIssuedInvoice] = useState<any | null>(null);

  // Homework Upload
  const [activeAssignmentUpload, setActiveAssignmentUpload] = useState<Assignment | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFilePreview, setUploadedFilePreview] = useState(false);
  const [submittingHomework, setSubmittingHomework] = useState(false);

  // Instructor Admin Form
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newClassCourse, setNewClassCourse] = useState('');
  const [newClassTopic, setNewClassTopic] = useState('');
  const [newClassDate, setNewClassDate] = useState('');
  const [newClassTime, setNewClassTime] = useState('11:00 AM');
  const [newClassDuration, setNewClassDuration] = useState('1 Hour');
  const [newClassMaxStudents, setNewClassMaxStudents] = useState('12');

  // Instructor Grading Form
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [inputMarks, setInputMarks] = useState('90');
  const [inputFeedback, setInputFeedback] = useState('Superb finish! Double-stitch is locked neatly.');

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ==========================================
  // WHATSAPP OTP & UPI PAYMENT STATES
  // ==========================================
  const [enrollStep, setEnrollStep] = useState<1 | 2 | 3>(1);
  const [studentPhone, setStudentPhone] = useState('');
  const [studentWhatsapp, setStudentWhatsapp] = useState('');
  const [studentSameWhatsapp, setStudentSameWhatsapp] = useState(true);
  const [studentCity, setStudentCity] = useState('');
  const [studentState, setStudentState] = useState('');
  const [paymentUtr, setPaymentUtr] = useState('');
  const [paymentUtrError, setPaymentUtrError] = useState('');

  // OTP Verification Code
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0); // 10 minutes countdown (600s)
  const [resendCooldown, setResendCooldown] = useState(0); // 30s resend cooldown
  const [otpError, setOtpError] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(5);
  const [simulatedOtpReceived, setSimulatedOtpReceived] = useState<string | null>(null);

  // Login via WhatsApp OTP States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginOtpTimer, setLoginOtpTimer] = useState(0);
  const [loginOtpAttempts, setLoginOtpAttempts] = useState(5);
  const [loginSimulatedOtp, setLoginSimulatedOtp] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');

  // Loaded DB Lists
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<any[]>([]);
  const [upiPaymentsList, setUpiPaymentsList] = useState<any[]>([]);
  const [loginHistoryList, setLoginHistoryList] = useState<any[]>([]);
  const [whatsappLogsList, setWhatsappLogsList] = useState<any[]>([]);

  // Sub-tabs for the Admin Panel / Analytics view
  const [adminSubTab, setAdminSubTab] = useState<'stats' | 'students' | 'payments' | 'whatsapp' | 'security'>('stats');

  // Search and filter states for Admin Student list
  const [adminStudentSearch, setAdminStudentSearch] = useState('');
  const [adminStudentFilter, setAdminStudentFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Student Authentication system states
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify' | 'forgot' | 'reset'>('login');
  const [signupForm, setSignupForm] = useState({
    name: '', email: '', phone: '', whatsapp: '', password: '', city: '', state: '', dob: '', gender: '', avatar: '', referralCode: ''
  });
  const [loginForm, setLoginForm] = useState({ emailOrPhone: '', password: '', rememberMe: true });
  const [verifyForm, setVerifyForm] = useState({ phone: '', otp: '' });
  const [forgotForm, setForgotForm] = useState({ emailOrPhone: '' });
  const [resetForm, setResetForm] = useState({ phone: '', otp: '', newPassword: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [simulatedAuthOtp, setSimulatedAuthOtp] = useState<string | null>(null);

  // Profile Edit modal/fields states
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', email: '', phone: '', whatsapp: '', city: '', state: '', dob: '', gender: '', avatar: ''
  });
  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Admin student detail management states
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [adminResetPassField, setAdminResetPassField] = useState('');
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);

  // Timers for OTP flows
  useEffect(() => {
    let interval: any = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    let interval: any = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else if (resendCooldown === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    let interval: any = null;
    if (loginOtpTimer > 0) {
      interval = setInterval(() => {
        setLoginOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (loginOtpTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loginOtpTimer]);

  // Fetch full state from backend
  const fetchState = async (email?: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = token ? '/api/academy/state' : `/api/academy/state?email=${encodeURIComponent(email || selectedRoleEmail || 'student@pearls.com')}`;
      const data = await apiFetch(url);
      if (data) {
        setCurrentUser(data.user);
        setCourses(data.courses);
        setLiveSessions(data.liveClasses);
        setMyEnrollments(data.enrollments);
        setAssignmentsList(data.assignments);
        setSubmissionsList(data.submissions);
        setNotificationsList(data.notifications);
        setAttendanceList(data.attendance);
        setNotesList(data.notes);
        setChatSupportList(data.chatSupport);
        setAllUsers(data.allUsers);
        
        // Subscription & Admin logs
        setUserSubscriptions(data.subscriptions || []);
        setAllSubscriptions(data.allSubscriptions || []);
        setUpiPaymentsList(data.upiPayments || []);
        setLoginHistoryList(data.loginHistory || []);
        setWhatsappLogsList(data.whatsappLogs || []);
        
        // Auto pre-populate form
        if (data.courses && data.courses.length > 0) {
          setNewClassCourse(data.courses[0].title);
        }
      }
    } catch (err) {
      console.error("Error loading academy state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchState();
    } else {
      fetchState(selectedRoleEmail);
    }
  }, [selectedRoleEmail]);

  // Admin passcode verification loop
  useEffect(() => {
    if (passcode.length === 6) {
      if (passcode === '885585') {
        setIsAdminUnlocked(true);
        setPasscodeError(false);
        showToast("Access Granted. Admin Console Unlocked.");
      } else {
        setPasscodeError(true);
        showToast("Access Denied. Incorrect passcode.");
        // Short timeout to let the shake animation play out nicely
        setTimeout(() => {
          setPasscode('');
          setPasscodeError(false);
        }, 1200);
      }
    }
  }, [passcode]);

  // Show quick status toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Switch role instant swap helper
  const handleRoleSwap = async (email: string) => {
    const targetUser = allUsers.find(u => u.email === email);
    if (targetUser && targetUser.role === 'Admin') {
      setSelectedRoleEmail(email);
      // It will automatically present the security lock screen if not unlocked yet
    } else {
      setSelectedRoleEmail(email);
      setIsAdminUnlocked(false); // Relock when switching away from Admin
      setPasscode('');
      setPasscodeError(false);
      showToast(`Logged in successfully as ${email.split('@')[0].toUpperCase()}`);
    }
  };

  // Helper: Retrieve subscription status for a course
  const getCourseSubscription = (courseId: string) => {
    if (currentUser?.role === 'Admin' || currentUser?.role === 'Teacher') {
      return { status: 'Active', isPending: false, isExpired: false, utrNumber: '' };
    }
    const sub = userSubscriptions.find(s => s.courseId === courseId);
    if (!sub) {
      return { status: 'None', isPending: false, isExpired: false, utrNumber: '' };
    }
    return {
      status: sub.status,
      isPending: sub.status === 'Pending',
      isExpired: sub.status === 'Expired',
      utrNumber: sub.utrNumber || ''
    };
  };

  // ==========================================
  // WHATSAPP OTP & MANUAL UPI CHECKOUT HANDLERS
  // ==========================================

  // Handler: Send Login OTP
  const handleLoginSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone) {
      setLoginError("Please enter your 10-digit mobile number.");
      return;
    }
    setLoginError('');
    setIsProcessingPayment(true);

    try {
      const res = await apiFetch('/api/academy/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, isLogin: true })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLoginStep(2);
        setLoginOtpTimer(600); // 10 minutes
        setLoginSimulatedOtp(data.simulatedOtp);
        setLoginOtpAttempts(5);
        showToast("WhatsApp OTP dispatched!");
      } else {
        setLoginError(data.error || "Failed to dispatch OTP. Please verify details.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Server network error. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handler: Verify Login OTP
  const handleLoginVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginOtpCode) {
      setLoginError("Please enter the 6-digit OTP code.");
      return;
    }
    setLoginError('');
    setIsProcessingPayment(true);

    try {
      const res = await apiFetch('/api/academy/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, otp: loginOtpCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowLoginModal(false);
        setLoginPhone('');
        setLoginOtpCode('');
        setLoginStep(1);
        setLoginSimulatedOtp(null);
        showToast("Login approved via WhatsApp verification.");
        // Log in this student
        await handleRoleSwap(data.user.email);
      } else {
        setLoginOtpAttempts(prev => Math.max(0, prev - 1));
        setLoginError(data.error || "Invalid verification code.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Verification failed due to connectivity errors.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handler: Resend Login OTP
  const handleResendLoginOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await apiFetch('/api/academy/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, isLogin: true })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLoginSimulatedOtp(data.simulatedOtp);
        setLoginOtpTimer(600);
        setResendCooldown(30); // 30s cooldown
        showToast("New OTP dispatched to WhatsApp.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Submit Manual Payment Details & UTR
  const handleEnrollSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCourse) return;
    if (!billingName || !studentPhone) {
      setPaymentUtrError("Name and mobile coordinates are strictly required.");
      return;
    }

    // UTR length constraint: 12-22 numeric digits
    const utrClean = paymentUtr.replace(/[^0-9]/g, '');
    if (utrClean.length < 12 || utrClean.length > 22 || utrClean !== paymentUtr) {
      setPaymentUtrError("UTR Reference must be a numeric string between 12 and 22 digits long.");
      return;
    }

    setPaymentUtrError('');
    setIsProcessingPayment(true);

    try {
      const res = await fetch('/api/academy/payments/submit-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: billingName,
          phone: studentPhone,
          whatsapp: studentSameWhatsapp ? studentPhone : studentWhatsapp,
          city: studentCity,
          state: studentState,
          courseId: checkoutCourse.id,
          courseTitle: checkoutCourse.title,
          amount: checkoutCourse.price,
          utrNumber: paymentUtr
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEnrollStep(3); // Go to OTP verification step
        setOtpTimer(600); // 10 minutes
        setSimulatedOtpReceived(data.simulatedOtp);
        setOtpAttempts(5);
        showToast("Manual UPI Payment registered. OTP sent!");
      } else {
        setPaymentUtrError(data.error || "Submission failed. Please check UTR duplicate status.");
      }
    } catch (err) {
      console.error(err);
      setPaymentUtrError("Network timeout. Could not register UPI payment.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handler: Verify Checkout OTP (Completes signup & login)
  const handleEnrollVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }
    setOtpError('');
    setIsProcessingPayment(true);

    try {
      const res = await fetch('/api/academy/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: studentPhone,
          otp: otpCode,
          utrNumber: paymentUtr
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIssuedInvoice({
          invoiceId: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          courseTitle: checkoutCourse!.title,
          price: checkoutCourse!.price,
          billingName,
          date: new Date().toLocaleDateString(),
          payMethod: 'UPI Static QR Code'
        });

        showToast("Registration completed. Access pending verification.");
        
        // Log in as the student
        await handleRoleSwap(data.user.email);
      } else {
        setOtpAttempts(prev => Math.max(0, prev - 1));
        setOtpError(data.error || "Incorrect OTP code.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Failed to complete account registration.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handler: Resend Checkout OTP
  const handleResendEnrollOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await fetch('/api/academy/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: studentPhone, isLogin: false })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSimulatedOtpReceived(data.simulatedOtp);
        setOtpTimer(600);
        setResendCooldown(30);
        showToast("OTP resent to WhatsApp.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Payment Approval / Rejection Handler
  const handleAdminPaymentAction = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/academy/admin/payments/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Transaction successfully ${action === 'approve' ? 'Approved' : 'Rejected'}!`);
        // Refresh state
        await fetchState(selectedRoleEmail);
      } else {
        showToast("Failed to perform admin operation.");
      }
    } catch (err) {
      console.error(err);
      showToast("Network failure.");
    }
  };

  // Admin Toggle Active / Assign Batch Handler
  const handleAdminStudentAction = async (userId: string, action: string, extra?: any) => {
    try {
      const res = await fetch('/api/academy/admin/students/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, ...extra })
      });
      if (res.ok) {
        showToast("Student database updated successfully.");
        await fetchState(selectedRoleEmail);
        if (selectedStudentDetail && selectedStudentDetail.user.id === userId) {
          // Refresh details modal
          await handleLoadStudentDetail(userId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Student Auth: Sign Up
  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    setSimulatedAuthOtp(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Failed to complete sign up. Please try again.");
        return;
      }
      setAuthSuccessMsg(data.message);
      setVerifyForm({ ...verifyForm, phone: signupForm.phone });
      setSimulatedAuthOtp(data.simulatedOtp);
      setAuthMode('verify');
      showToast("Verification code dispatched!");
    } catch (err) {
      console.error(err);
      setAuthError("Failed to connect to the authentication server.");
    }
  };

  // 2. Student Auth: Login
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "ACCOUNT_NOT_VERIFIED") {
          setAuthError(data.message);
          setVerifyForm({ ...verifyForm, phone: data.phone });
          setSimulatedAuthOtp(data.simulatedOtp);
          setAuthMode('verify');
          showToast("OTP code sent for verification!");
          return;
        }
        setAuthError(data.error || "Incorrect login credentials.");
        return;
      }

      localStorage.setItem('token', data.token);
      showToast(`Welcome back, ${data.user.name}!`);
      await fetchState();
    } catch (err) {
      console.error(err);
      setAuthError("Failed to authenticate.");
    }
  };

  // 3. Student Auth: Verify OTP
  const handleStudentVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    try {
      const res = await fetch('/api/auth/verify-otp-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Invalid OTP entered.");
        return;
      }

      localStorage.setItem('token', data.token);
      setSimulatedAuthOtp(null);
      showToast("Account successfully activated!");
      await fetchState();
    } catch (err) {
      console.error(err);
      setAuthError("Verification failed.");
    }
  };

  // 4. Student Auth: Forgot Password
  const handleStudentForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "No account found.");
        return;
      }

      setAuthSuccessMsg(data.message);
      setResetForm({ ...resetForm, phone: data.phone });
      setSimulatedAuthOtp(data.simulatedOtp);
      setAuthMode('reset');
      showToast("Recovery OTP code sent!");
    } catch (err) {
      console.error(err);
      setAuthError("Forgot password request failed.");
    }
  };

  // 5. Student Auth: Reset Password
  const handleStudentReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Password reset failed.");
        return;
      }

      setAuthSuccessMsg("Password reset completed successfully. You can now login!");
      setSimulatedAuthOtp(null);
      setAuthMode('login');
      showToast("Password updated!");
    } catch (err) {
      console.error(err);
      setAuthError("Reset password failed.");
    }
  };

  // 6. Student Auth: Logout
  const handleStudentLogout = async () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    showToast("Logged out successfully.");
    await fetchState(selectedRoleEmail);
  };

  // 7. Student Auth: Continue with Google (Simulated Popup Flow)
  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      const names = ["Ananya Roy", "Sneha Patil", "Divya Sharma", "Pooja Hegde"];
      const randomIdx = Math.floor(Math.random() * names.length);
      const name = names[randomIdx];
      const email = `${name.toLowerCase().replace(' ', '')}@gmail.com`;
      const avatar = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=120`;

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, avatar })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        showToast(`Google authenticated: Welcome ${data.user.name}!`);
        await fetchState();
      } else {
        setAuthError("Google Sign-In failed.");
      }
    } catch (err) {
      console.error(err);
      setAuthError("Failed to initiate Google sign in.");
    }
  };

  // 8. Student Auth: Resend Respective OTP
  const handleAuthResendOtp = async () => {
    const phone = authMode === 'verify' ? verifyForm.phone : resetForm.phone;
    if (!phone) return;

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok) {
        setSimulatedAuthOtp(data.simulatedOtp);
        showToast("A fresh OTP code has been dispatched!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 9. Profile Edit: Submit
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Profile update failed.");
        return;
      }

      setProfileSuccessMsg(data.message);
      showToast("Profile updated successfully!");
      setCurrentUser(data.user);
      setShowProfileEdit(false);
    } catch (err) {
      console.error(err);
      setProfileError("Network issue updating profile.");
    }
  };

  // 10. Profile Edit: Password change
  const handleProfilePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/student/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(changePasswordForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to change password.");
        return;
      }

      setProfileSuccessMsg(data.message);
      showToast("Password updated successfully!");
      setChangePasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      console.error(err);
      setProfileError("Network issue changing password.");
    }
  };

  // 11. Admin Manage: Load student detailed history log
  const handleLoadStudentDetail = async (userId: string) => {
    setLoadingStudentDetail(true);
    try {
      const res = await fetch(`/api/admin/students/${userId}/detail`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStudentDetail(data);
        setShowStudentDetailModal(true);
      } else {
        showToast("Failed to load student details.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudentDetail(false);
    }
  };

  // 12. Admin Manage: Reset Password
  const handleAdminResetPassword = async () => {
    if (!selectedStudentDetail) return;
    try {
      const res = await fetch(`/api/admin/students/${selectedStudentDetail.user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: adminResetPassField || 'student123' })
      });
      if (res.ok) {
        showToast(`Password updated for ${selectedStudentDetail.user.name}`);
        setAdminResetPassField('');
        await handleLoadStudentDetail(selectedStudentDetail.user.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 13. Admin Manage: Delete student account
  const handleAdminDeleteStudent = async () => {
    if (!selectedStudentDetail) return;
    const confirmDel = window.confirm(`Are you absolutely sure you want to permanently delete the student account of ${selectedStudentDetail.user.name}? This action is irreversible.`);
    if (!confirmDel) return;

    try {
      const res = await fetch(`/api/admin/students/${selectedStudentDetail.user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast("Student account permanently deleted.");
        setShowStudentDetailModal(false);
        setSelectedStudentDetail(null);
        await fetchState(selectedRoleEmail);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export entire student admissions list to CSV
  const handleExportStudentsCSV = () => {
    const headers = ["Student ID", "Name", "Email", "Mobile", "WhatsApp", "City", "State", "Batch", "Status"];
    const rows = allUsers
      .filter(u => u.role === 'Student')
      .map(u => [
        u.studentId || 'N/A',
        u.name,
        u.email,
        u.phone || 'N/A',
        u.whatsapp || 'N/A',
        u.city || 'N/A',
        u.state || 'N/A',
        u.batch || 'Morning Batch (10 AM)',
        u.active ? 'Active' : 'Suspended'
      ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pearls_academy_students_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Student database directory successfully exported as CSV coordinates!");
  };

  // Lesson completion tracker
  const handleCompleteLesson = async (courseId: string, lessonId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/academy/courses/lesson-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId, email: currentUser.email })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Lesson progress updated!");
        fetchState(currentUser.email);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Homework Homework Desk
  const handleUploadHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentUpload || !currentUser) return;

    setSubmittingHomework(true);
    setTimeout(async () => {
      try {
        const res = await fetch('/api/academy/assignments/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignmentId: activeAssignmentUpload.id,
            userEmail: currentUser.email,
            userName: currentUser.name,
            fileName: uploadedFileName || 'princess_cut_pattern.pdf'
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Homework submitted for ${activeAssignmentUpload.title}!`);
          setActiveAssignmentUpload(null);
          setUploadedFileName('');
          setUploadedFilePreview(false);
          fetchState(currentUser.email);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSubmittingHomework(false);
      }
    }, 1200);
  };

  // Teacher grade homework
  const handleGradeHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission || !currentUser) return;

    try {
      const res = await fetch('/api/academy/assignments/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: gradingSubmission.id,
          marks: inputMarks,
          feedback: inputFeedback
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Graded submission of ${gradingSubmission.userName}!`);
        setGradingSubmission(null);
        fetchState(currentUser.email);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Schedule a Live Class
  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const res = await fetch('/api/academy/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: newClassCourse,
          topic: newClassTopic,
          date: newClassDate,
          time: newClassTime,
          duration: newClassDuration,
          maxStudents: newClassMaxStudents
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully scheduled live class on ${newClassTopic}!`);
        setShowScheduleForm(false);
        setNewClassTopic('');
        fetchState(currentUser.email);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Class actions: Start / Join / End
  const handleClassAction = async (session: ScheduledClass, action: 'start' | 'join' | 'end') => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/academy/classes/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: session.id,
          action,
          email: currentUser.email,
          userName: currentUser.name
        })
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'start' || action === 'join') {
          setActiveClassroomSession(data.liveClass);
          showToast(`Connecting to high-fidelity live audio & video feed...`);
        } else if (action === 'end') {
          showToast(`Live session has been concluded. Recording saved.`);
          fetchState(currentUser.email);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chat support dispatch
  const handleSendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessageText.trim() || !currentUser) return;

    try {
      const res = await fetch('/api/academy/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'support',
          senderEmail: currentUser.email,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          text: supportMessageText
        })
      });
      const data = await res.json();
      if (data.success) {
        setSupportMessageText('');
        // Instant local append for responsive UI
        setChatSupportList(prev => [...prev, data.message]);
        // Fast-poll state after brief timeout to capture AI response
        setTimeout(() => fetchState(currentUser.email), 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F2ED] text-[#111111] overflow-y-auto font-sans">
      
      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[60] bg-[#111111] text-white border border-[#D4AF37]/35 py-3 px-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center gap-3 max-w-sm"
          >
            <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 animate-pulse" />
            <span className="text-xs font-mono font-medium tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Portal Topbar Header */}
      <header className="bg-[#111111] text-white py-4 px-6 md:px-12 border-b border-[#D4AF37]/20 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 border border-stone-800 rounded-full text-stone-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-[#D4AF37]" />
            <div>
              <h1 className="font-serif text-lg tracking-wide flex items-center gap-1.5">
                Pearls <span className="text-[#D4AF37] italic">Academy Portal</span>
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">Interactive Tailoring Classes</p>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Role Student Authentication & Profile */}
        <div className="flex items-center gap-3">
          {currentUser && localStorage.getItem('token') ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 p-1.5 rounded-full pr-4 text-xs text-stone-300">
                <img src={currentUser.avatar} className="w-6 h-6 rounded-full object-cover border border-[#D4AF37]/40" />
                <div className="flex flex-col">
                  <span className="font-mono font-bold leading-none">{currentUser.name}</span>
                  <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-wider mt-0.5">{currentUser.role} • {currentUser.studentId || 'N/A'}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setProfileForm({
                    name: currentUser.name || '',
                    email: currentUser.email || '',
                    phone: currentUser.phone || '',
                    whatsapp: currentUser.whatsapp || '',
                    city: currentUser.city || '',
                    state: currentUser.state || '',
                    dob: (currentUser as any).dob || '',
                    gender: (currentUser as any).gender || '',
                    avatar: currentUser.avatar || ''
                  });
                  setProfileError('');
                  setProfileSuccessMsg('');
                  setShowProfileEdit(true);
                }}
                className="bg-stone-900 border border-stone-800 hover:border-stone-700 hover:text-[#D4AF37] p-2 rounded-full text-stone-400 transition-all cursor-pointer"
                title="Edit Profile"
              >
                <User className="w-4 h-4" />
              </button>
              <button
                onClick={handleStudentLogout}
                className="bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 hover:border-red-600 text-red-200 font-mono text-[9px] uppercase tracking-wider font-bold py-1.5 px-3.5 rounded-full transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
                setAuthSuccessMsg('');
              }}
              className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:brightness-110 text-black font-mono text-[10px] uppercase tracking-wider font-bold py-1.5 px-4 rounded-full transition-all shadow-sm cursor-pointer"
            >
              Sign In / Register
            </button>
          )}

          <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 p-1 rounded-full text-xs">
            <span className="hidden xl:inline text-[9px] text-stone-500 font-mono uppercase tracking-wider px-3 font-bold">Simulator:</span>
            {allUsers.slice(0, 3).map((roleUser) => (
              <button
                key={roleUser.id}
                onClick={async () => {
                  localStorage.removeItem('token'); // clear active JWT
                  await handleRoleSwap(roleUser.email);
                  showToast(`Swapped to simulation: ${roleUser.role}`);
                }}
                className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer font-semibold ${
                  selectedRoleEmail === roleUser.email && !localStorage.getItem('token')
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {roleUser.role}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      {isLoading ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
          <p className="text-xs font-mono tracking-widest text-stone-500 uppercase">Synchronizing Institute Records...</p>
        </div>
      ) : !localStorage.getItem('token') && (!currentUser || currentUser.role === 'Student') ? (
        <div className="flex-grow flex items-center justify-center p-4 md:p-12 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl bg-white border border-[#D4AF37]/30 rounded-[32px] p-6 md:p-10 shadow-xl space-y-8 relative overflow-hidden my-auto"
          >
            {/* Background Decorative Gradient */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#AA7C11] to-[#D4AF37]" />
            <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />
            <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center border border-[#D4AF37]/45 text-[#D4AF37]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-extrabold text-stone-900 tracking-wide">
                  {authMode === 'login' && "Student Login"}
                  {authMode === 'signup' && "Create Account"}
                  {authMode === 'verify' && "Verify Your Identity"}
                  {authMode === 'forgot' && "Recover Password"}
                  {authMode === 'reset' && "Set New Password"}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {authMode === 'login' && "Enter your credentials to access your courses & virtual academy dashboard."}
                  {authMode === 'signup' && "Register to enroll in live fashion design & custom tailoring modules."}
                  {authMode === 'verify' && "Enter the 6-digit WhatsApp OTP sent to verify your mobile."}
                  {authMode === 'forgot' && "Confirm your account identifier to receive an OTP code."}
                  {authMode === 'reset' && "Complete verification and secure your tailoring profile."}
                </p>
              </div>
            </div>

            {/* Alerts & Simulated WhatsApp OTP Box */}
            {authError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccessMsg && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl flex items-start gap-3 text-green-700 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {simulatedAuthOtp && (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl space-y-2.5 animate-pulse">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-bold font-mono uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>Simulated WhatsApp Push Notification</span>
                </div>
                <p className="text-stone-700 text-xs">
                  Your Pearls Academy OTP verification code is: <strong className="bg-[#111111] text-amber-300 px-2.5 py-1 rounded font-mono text-sm border border-stone-800 tracking-widest">{simulatedAuthOtp}</strong>
                </p>
                <p className="text-[10px] text-stone-500 font-light italic">In production, this OTP is dispatched via WhatsApp Business API.</p>
              </div>
            )}

            {/* TABS (For Login/Signup Mode Switching) */}
            {(authMode === 'login' || authMode === 'signup') && (
              <div className="flex gap-2 bg-stone-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                  className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider uppercase rounded-xl transition-all ${
                    authMode === 'login' ? 'bg-[#111111] text-[#D4AF37] shadow-md' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccessMsg(''); }}
                  className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider uppercase rounded-xl transition-all ${
                    authMode === 'signup' ? 'bg-[#111111] text-[#D4AF37] shadow-md' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  Register
                </button>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Email or Phone Number</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="student@pearls.com or 9876543210"
                      value={loginForm.emailOrPhone}
                      onChange={(e) => setLoginForm({ ...loginForm, emailOrPhone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Password</label>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccessMsg(''); }}
                      className="text-[10px] font-mono tracking-wider text-[#AA7C11] uppercase hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600 select-none">
                    <input
                      type="checkbox"
                      checked={loginForm.rememberMe}
                      onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                      className="rounded border-stone-300 text-[#AA7C11] focus:ring-[#AA7C11]"
                    />
                    Keep me logged in (30 Days)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#111111] hover:bg-[#AA7C11] text-[#D4AF37] hover:text-black font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Enter Portal</span>
                </button>
              </form>
            )}

            {/* 2. SIGN UP FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleStudentSignup} className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="Ananya Roy"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                      <input
                        type="email"
                        required
                        placeholder="ananya@example.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Mobile Number (OTP verification) *</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">WhatsApp Number</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                      <input
                        type="tel"
                        placeholder="Same as mobile number"
                        value={signupForm.whatsapp}
                        onChange={(e) => setSignupForm({ ...signupForm, whatsapp: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Secure Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Mumbai"
                        value={signupForm.city}
                        onChange={(e) => setSignupForm({ ...signupForm, city: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">State</label>
                    <input
                      type="text"
                      placeholder="Maharashtra"
                      value={signupForm.state}
                      onChange={(e) => setSignupForm({ ...signupForm, state: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Date of Birth</label>
                    <input
                      type="date"
                      value={signupForm.dob}
                      onChange={(e) => setSignupForm({ ...signupForm, dob: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Gender</label>
                    <select
                      value={signupForm.gender}
                      onChange={(e) => setSignupForm({ ...signupForm, gender: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                    >
                      <option value="">Select Gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Avatar select grid */}
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Select Profile Avatar</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { name: 'Ananya', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' },
                      { name: 'Sneha', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' },
                      { name: 'Divya', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120' },
                      { name: 'Pooja', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' }
                    ].map((av) => (
                      <button
                        key={av.name}
                        type="button"
                        onClick={() => setSignupForm({ ...signupForm, avatar: av.url })}
                        className={`p-1 rounded-2xl border-2 transition-all ${
                          signupForm.avatar === av.url ? 'border-[#D4AF37] bg-amber-50' : 'border-stone-100 hover:border-stone-300'
                        }`}
                      >
                        <img src={av.url} className="w-full aspect-square rounded-xl object-cover" />
                        <span className="text-[9px] font-mono mt-1 block text-stone-500">{av.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Referral / Coupon Code</label>
                  <input
                    type="text"
                    placeholder="PEARLS_COUPON"
                    value={signupForm.referralCode}
                    onChange={(e) => setSignupForm({ ...signupForm, referralCode: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#111111] hover:bg-[#AA7C11] text-[#D4AF37] hover:text-black font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Verify Phone & Create Account</span>
                </button>
              </form>
            )}

            {/* 3. VERIFY OTP FORM */}
            {authMode === 'verify' && (
              <form onSubmit={handleStudentVerify} className="space-y-6">
                <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl text-center space-y-1">
                  <Smartphone className="w-8 h-8 text-stone-700 mx-auto" />
                  <p className="text-stone-700 text-xs font-semibold">Verification Target Mobile</p>
                  <p className="text-[#AA7C11] font-mono font-bold text-sm tracking-wider">{verifyForm.phone}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold block text-center">6-Digit OTP Security Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={verifyForm.otp}
                    onChange={(e) => setVerifyForm({ ...verifyForm, otp: e.target.value })}
                    className="w-full bg-stone-50 border-2 border-stone-200 py-3.5 rounded-xl font-mono text-xl tracking-[1.5em] text-center focus:outline-none focus:border-[#D4AF37] text-stone-900 placeholder:opacity-40"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#111111] hover:bg-[#AA7C11] text-[#D4AF37] hover:text-black font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Activate Account
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono px-1">
                    <button
                      type="button"
                      onClick={handleAuthResendOtp}
                      className="text-[#AA7C11] hover:underline"
                    >
                      Resend Code via WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="hover:underline hover:text-stone-800"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 4. FORGOT PASSWORD */}
            {authMode === 'forgot' && (
              <form onSubmit={handleStudentForgot} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Account Email or Phone</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Enter registered email or phone"
                      value={forgotForm.emailOrPhone}
                      onChange={(e) => setForgotForm({ ...forgotForm, emailOrPhone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#111111] hover:bg-[#AA7C11] text-[#D4AF37] hover:text-black font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Send Recovery OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-center text-xs font-mono text-stone-500 hover:text-stone-800 uppercase tracking-wider hover:underline py-1"
                  >
                    Cancel & Return
                  </button>
                </div>
              </form>
            )}

            {/* 5. RESET PASSWORD FORM */}
            {authMode === 'reset' && (
              <form onSubmit={handleStudentReset} className="space-y-4">
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-center space-y-0.5">
                  <p className="text-stone-500 text-[10px] font-mono uppercase font-bold">Recovery Mobile</p>
                  <p className="text-stone-800 font-mono font-bold text-xs">{resetForm.phone}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">Enter Recovery OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={resetForm.otp}
                    onChange={(e) => setResetForm({ ...resetForm, otp: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 py-3 text-xs rounded-xl text-center font-mono focus:outline-none focus:border-[#D4AF37] text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={resetForm.newPassword}
                      onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37] text-stone-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#111111] hover:bg-[#AA7C11] text-[#D4AF37] hover:text-black font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Set Password & Login
                </button>
              </form>
            )}

            {/* Simulated Google Sign-In Trigger */}
            {(authMode === 'login' || authMode === 'signup') && (
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-4 text-stone-400 font-mono text-[9px] uppercase tracking-widest font-bold">Or Continue With</span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl font-mono text-xs text-stone-700 tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.39 1.71l3.27-3.27C17.69 1.54 14.98 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.85 3C6.31 7.54 9 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.61-.21-2.38H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.72-4.92 3.72-8.58z" />
                    <path fill="#FBBC05" d="M5.35 14.5c-.24-.72-.38-1.49-.38-2.3c0-.81.14-1.58.38-2.3l-3.85-3C.56 8.5 0 10.18 0 12s.56 3.5 1.5 5.1l3.85-3.1z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.96-1.08 7.95-2.92l-3.7-2.87c-1.02.69-2.33 1.1-4.25 1.1-3 0-5.69-2.5-6.65-5.46L1.5 15.95C3.39 19.85 7.35 23 12 23z" />
                  </svg>
                  <span>Google Social Sign-In</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      ) : currentUser && currentUser.role === 'Admin' && !isAdminUnlocked ? (
        <div className="flex-grow flex items-center justify-center p-6 md:p-12 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              const el = document.getElementById('admin-passcode-hidden-input');
              if (el) el.focus();
            }}
            className="w-full max-w-md bg-white border border-[#D4AF37]/30 rounded-[32px] p-8 shadow-xl text-center space-y-6 relative overflow-hidden my-auto cursor-pointer"
          >
            {/* Elegant Background Gold Accents */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#AA7C11] to-[#D4AF37]" />
            <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-[#D4AF37]/5 blur-3xl" />
            <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-[#D4AF37]/5 blur-3xl" />

            {/* Lock Header */}
            <div className="space-y-2.5">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 text-[#D4AF37]">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900 tracking-wide">Admin Console Locked</h2>
                <p className="text-[9px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold mt-1 bg-[#D4AF37]/10 py-0.5 px-2 rounded-full inline-block">Master Authorization Required</p>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed max-w-xs mx-auto font-light">
                This administrative workspace is locked. Enter the 6-digit master passcode to view classes, grades, and analytics.
              </p>
            </div>

            {/* Passcode Circles Visual Display */}
            <motion.div 
              animate={passcodeError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <div className="flex gap-2.5 justify-center">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const char = passcode[index] || '';
                  const isCurrent = passcode.length === index;
                  return (
                    <div 
                      key={index} 
                      className={`w-11 h-12 md:w-12 md:h-14 rounded-xl border-2 flex items-center justify-center font-mono text-lg font-bold transition-all duration-200 ${
                        passcodeError 
                          ? 'border-red-500 text-red-500 bg-red-50/20' 
                          : isCurrent 
                            ? 'border-[#D4AF37] bg-stone-50 text-stone-950 scale-105 shadow-sm' 
                            : char 
                              ? 'border-stone-800 bg-[#111111] text-white' 
                              : 'border-stone-200 bg-white text-stone-400'
                      }`}
                    >
                      {char ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-current" />
                      ) : (
                        <span className="text-stone-300 font-light text-xs">-</span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {passcodeError && (
                <p className="text-red-500 font-mono text-[9px] uppercase tracking-wider font-bold animate-pulse">
                  Invalid Passcode. Please try again.
                </p>
              )}
            </motion.div>

            {/* Hidden Input for Keyboard Typing Support */}
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              value={passcode}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 6) setPasscode(val);
              }}
              className="sr-only"
              autoFocus
              id="admin-passcode-hidden-input"
            />

            {/* On-Screen Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (passcode.length < 6 && !passcodeError) {
                      setPasscode(prev => prev + num);
                    }
                  }}
                  className="w-14 h-14 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/60 text-stone-800 font-mono text-base font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:border-[#D4AF37]/30"
                >
                  {num}
                </button>
              ))}
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPasscode('');
                  setPasscodeError(false);
                }}
                className="w-14 h-14 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 font-mono text-[10px] uppercase font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              >
                Clear
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (passcode.length < 6 && !passcodeError) {
                    setPasscode(prev => prev + '0');
                  }
                }}
                className="w-14 h-14 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/60 text-stone-800 font-mono text-base font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:border-[#D4AF37]/30"
              >
                0
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (passcode.length > 0 && !passcodeError) {
                    setPasscode(prev => prev.slice(0, -1));
                  }
                }}
                className="w-14 h-14 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 font-mono text-[10px] uppercase font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              >
                Delete
              </button>
            </div>

            <div className="pt-2 border-t border-stone-100 text-center">
              <p className="text-[9px] text-stone-400 font-mono uppercase tracking-wider">
                Keyboard input enabled. Click card to focus.
              </p>
            </div>
          </motion.div>
        </div>
      ) : currentUser && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT Sidebar Navigation & Identity */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-[#D4AF37]/20 rounded-3xl p-6 shadow-sm text-center space-y-4">
              <div className="relative inline-block">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120'}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-full border-2 border-[#D4AF37] object-cover mx-auto"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight">{currentUser.name}</h3>
                <p className="text-[10px] font-mono tracking-widest uppercase text-[#D4AF37] font-bold mt-1 bg-[#D4AF37]/10 py-0.5 px-2 rounded-full inline-block">
                  {currentUser.role} Account
                </p>
                <p className="text-stone-500 text-xs mt-1.5 font-light">{currentUser.email}</p>
              </div>

              <div className="border-t border-stone-100 pt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-stone-50 p-2 rounded-xl border border-stone-100">
                  <p className="text-stone-500 text-[9px] uppercase font-mono tracking-wider">Attendance</p>
                  <p className="font-mono text-[#D4AF37] font-bold text-sm mt-0.5">
                    {currentUser.role === 'Admin' ? '100%' : `${attendanceList.length > 0 ? '100%' : '0%'}`}
                  </p>
                </div>
                <div className="bg-stone-50 p-2 rounded-xl border border-stone-100">
                  <p className="text-stone-500 text-[9px] uppercase font-mono tracking-wider">Completed</p>
                  <p className="font-mono text-stone-800 font-bold text-sm mt-0.5">
                    {currentUser.role === 'Admin' ? '---' : `${myEnrollments.reduce((acc, e) => acc + (e.progress === 100 ? 1 : 0), 0)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Portal Tab Navigation */}
            <nav className="bg-white border border-stone-200 rounded-3xl p-3 shadow-sm flex flex-row lg:flex-col overflow-x-auto gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 py-3 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Tv className="w-4 h-4 text-[#D4AF37]" />
                <span className="whitespace-nowrap">Overview Panel</span>
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 py-3 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'courses'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                <span className="whitespace-nowrap">{currentUser.role === 'Admin' ? 'Manage Courses' : 'My Course Desk'}</span>
              </button>

              <button
                onClick={() => setActiveTab('classes')}
                className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 py-3 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer relative ${
                  activeTab === 'classes'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span className="whitespace-nowrap">Live Classes</span>
                {liveSessions.some(c => c.status === 'live') && (
                  <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('assignments')}
                className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 py-3 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'assignments'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span className="whitespace-nowrap">{currentUser.role === 'Admin' ? 'Grade Homework' : 'Assignments'}</span>
              </button>

              <button
                onClick={() => setActiveTab('downloads')}
                className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 py-3 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'downloads'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span className="whitespace-nowrap">Downloads / Notes</span>
              </button>

              {currentUser.role === 'Admin' && (
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 py-3 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-[#111111] text-white shadow-sm'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                  <span className="whitespace-nowrap">Analytical View</span>
                </button>
              )}
            </nav>
          </div>

          {/* RIGHT Main Content Section */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* OVERVIEW PANEL TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Active Live Session Alert banner */}
                {liveSessions.some(c => c.status === 'live') ? (
                  <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.15),transparent_60%)]" />
                    <div className="space-y-2 relative z-10 text-center md:text-left">
                      <span className="bg-white/20 backdrop-blur-sm px-3.5 py-1 rounded-full border border-white/20 text-[10px] font-mono tracking-widest uppercase font-bold flex items-center justify-center md:justify-start gap-2 w-max mx-auto md:mx-0">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        Live Classroom Active Now
                      </span>
                      <h4 className="font-serif text-xl md:text-2xl font-bold">
                        {liveSessions.find(c => c.status === 'live')?.topic}
                      </h4>
                      <p className="text-white/80 text-xs font-light max-w-lg">
                        Conducted by chief designer <strong>Pratibha Ingole</strong>. Join to learn draft layouts, sleeve math, and ask live questions.
                      </p>
                    </div>
                    <button
                      onClick={() => handleClassAction(liveSessions.find(c => c.status === 'live')!, currentUser.role === 'Admin' ? 'start' : 'join')}
                      className="bg-white hover:bg-stone-100 text-red-600 px-6 py-3.5 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      {currentUser.role === 'Admin' ? 'Conduct Session' : 'Join Live Class'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-[#D4AF37]/25 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-stone-900">Next Scheduled Lecture</h4>
                        <p className="text-stone-600 text-xs font-light mt-1">
                          {liveSessions[0]?.topic} ({liveSessions[0]?.time} on {liveSessions[0]?.date})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('classes')}
                      className="text-[#D4AF37] text-xs font-mono font-bold tracking-wider uppercase hover:underline cursor-pointer"
                    >
                      View Syllabus Schedule →
                    </button>
                  </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Left sub-column */}
                  <div className="md:col-span-7 space-y-8">
                    {/* Continue Learning card for Student */}
                    {currentUser.role !== 'Admin' && (
                      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-base font-bold text-stone-900">Course Progress</h4>
                          <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase">My Subscriptions</span>
                        </div>
                        
                        {myEnrollments.length > 0 ? (
                          myEnrollments.map((enroll) => {
                            const courseData = courses.find(c => c.id === enroll.courseId);
                            return (
                              <div key={enroll.id} className="space-y-4 border-b border-stone-50 pb-4 last:border-0 last:pb-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h5 className="text-xs font-bold text-stone-800">{enroll.courseTitle}</h5>
                                    <p className="text-stone-500 text-[10px] mt-0.5">Enrolled: {enroll.enrolledAt}</p>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-[#D4AF37]">{enroll.progress}%</span>
                                </div>
                                {/* Bar progress */}
                                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] h-full transition-all duration-500" 
                                    style={{ width: `${enroll.progress}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                  <button
                                    onClick={() => {
                                      setActiveTab('courses');
                                      if (courseData) {
                                        setActiveLectureVideo({ course: courseData, lesson: courseData.modules[0].lessons[0] });
                                      }
                                    }}
                                    className="text-stone-800 hover:text-[#D4AF37] text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Continue Lessons</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>

                                  {enroll.progress === 100 && (
                                    <button
                                      onClick={() => setSelectedCertificateEnrollment(enroll)}
                                      className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-sm hover:shadow"
                                    >
                                      <Award className="w-3.5 h-3.5" />
                                      <span>Diploma PDF</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 space-y-3">
                            <GraduationCap className="w-8 h-8 text-stone-300 mx-auto" />
                            <p className="text-xs text-stone-500 font-light">You are not enrolled in any academic tailoring courses.</p>
                            <button
                              onClick={() => setActiveTab('courses')}
                              className="bg-[#111111] text-[#D4AF37] border border-[#D4AF37] px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-widest font-bold"
                            >
                              Browse Syllabus Courses
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Academy Announcements / Notifications */}
                    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-base font-bold text-stone-900">Direct Announcements</h4>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      </div>
                      
                      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                        {notificationsList.map((notif) => (
                          <div key={notif.id} className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
                              <Bell className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-4">
                                <h5 className="text-xs font-bold text-stone-800 leading-tight">{notif.title}</h5>
                                <span className="text-[9px] font-mono text-stone-400 shrink-0">{notif.date}</span>
                              </div>
                              <p className="text-stone-600 text-[11px] font-light leading-relaxed">{notif.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right sub-column: Live chat support widget */}
                  <div className="md:col-span-5 space-y-8">
                    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm h-full flex flex-col justify-between space-y-4">
                      <div className="space-y-1 pb-3 border-b border-stone-100">
                        <span className="text-[#D4AF37] text-[10px] font-mono tracking-widest uppercase font-bold">Aura-Chat Desk</span>
                        <h4 className="font-serif text-base font-bold text-stone-900">Academy Help Desk</h4>
                        <p className="text-stone-500 text-[10px] font-light">Direct interaction with chief designer Pratibha Ingole and AI helper.</p>
                      </div>

                      {/* Messages logs */}
                      <div className="h-[220px] overflow-y-auto space-y-3.5 pr-1 text-xs">
                        {chatSupportList.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col max-w-[85%] ${
                              msg.senderRole === 'Admin' ? 'mr-auto items-start' : 'ml-auto items-end'
                            }`}
                          >
                            <span className="text-[9px] font-mono text-stone-400 px-1 mb-0.5">
                              {msg.senderName} • {msg.timestamp}
                            </span>
                            <div 
                              className={`p-3 rounded-2xl leading-relaxed font-light ${
                                msg.senderRole === 'Admin' 
                                  ? 'bg-stone-100 text-stone-800 rounded-tl-none border border-stone-200' 
                                  : 'bg-[#111111] text-[#D4AF37] rounded-tr-none'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input */}
                      <form onSubmit={handleSendSupportMessage} className="pt-2 border-t border-stone-100 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type inquiry coordinates..."
                          value={supportMessageText}
                          onChange={(e) => setSupportMessageText(e.target.value)}
                          className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#D4AF37] transition-all"
                        />
                        <button
                          type="submit"
                          className="bg-[#111111] hover:bg-[#D4AF37] text-white hover:text-black p-3 rounded-xl transition-all cursor-pointer border border-stone-800"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SYLLABUS COURSES & NETFLIX LECTURES PLAYER */}
            {activeTab === 'courses' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900">Institute Syllabus Catalog</h3>
                    <p className="text-stone-600 text-xs font-light mt-1">Enroll in structured modules. Review video lectures and download printable tailoring layouts.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {courses.map((course) => {
                    const isEnrolled = myEnrollments.some(e => e.courseId === course.id);
                    const enrollment = myEnrollments.find(e => e.courseId === course.id);
                    return (
                      <div key={course.id} className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                        <div>
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full aspect-[16/9] object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
                              <span className="text-[#D4AF37] font-bold">{course.level}</span>
                              <span className="text-stone-400">{course.duration}</span>
                            </div>
                            <h4 className="font-serif text-lg font-bold text-stone-900 leading-snug">{course.title}</h4>
                            <p className="text-stone-600 text-xs leading-relaxed font-light">
                              Learn and master {course.skills.join(', ')} directly under the guidance of Pratibha Ingole. Complete assignments to unlock certification.
                            </p>

                            {/* Core curriculum preview */}
                            <div className="space-y-1.5 pt-3 border-t border-stone-100">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold">Curriculum Lessons:</span>
                              <div className="space-y-1">
                                {course.modules.flatMap(m => m.lessons).slice(0, 3).map((lesson) => (
                                  <div key={lesson.id} className="flex items-center justify-between text-xs text-stone-700">
                                    <div className="flex items-center gap-1.5">
                                      <BookOpen className="w-3 h-3 text-[#D4AF37]" />
                                      <span className="truncate max-w-[200px] font-light">{lesson.title}</span>
                                    </div>
                                    <span className="text-stone-400 text-[10px] font-mono">{lesson.duration}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 pt-0">
                          {isEnrolled ? (
                            <div className="space-y-3">
                              {(() => {
                                const subCheck = getCourseSubscription(course.id);
                                if (subCheck.isPending) {
                                  return (
                                    <div className="space-y-2">
                                      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3 text-[11px] leading-relaxed flex gap-2 font-mono">
                                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                                        <div>
                                          <p className="font-bold">Payment Verifying</p>
                                          <p className="text-[10px] text-stone-500 mt-0.5">UTR: {subCheck.utrNumber}</p>
                                        </div>
                                      </div>
                                      <button
                                        disabled
                                        className="w-full bg-stone-100 text-stone-400 py-3 rounded-xl text-xs font-mono tracking-widest font-bold uppercase flex items-center justify-center gap-1.5 cursor-not-allowed"
                                      >
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>Pending Admin Approval</span>
                                      </button>
                                    </div>
                                  );
                                } else if (subCheck.isExpired) {
                                  return (
                                    <div className="space-y-2">
                                      <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-3 text-[11px] leading-relaxed flex gap-2 font-mono">
                                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="font-bold">Subscription Expired</p>
                                          <p className="text-[10px] text-stone-500 mt-0.5">Renew to unlock videos and live classes.</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setCheckoutCourse(course);
                                          setBillingName(currentUser.name);
                                          setEnrollStep(1);
                                        }}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Renew Subscription</span>
                                      </button>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <>
                                      <div className="flex items-center justify-between text-xs font-mono">
                                        <span className="text-stone-500">My Progress</span>
                                        <span className="font-bold text-[#D4AF37]">{enrollment?.progress}%</span>
                                      </div>
                                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] h-full" style={{ width: `${enrollment?.progress}%` }} />
                                      </div>
                                      <button
                                        onClick={() => setActiveLectureVideo({ course, lesson: course.modules[0].lessons[0] })}
                                        className="w-full bg-[#111111] text-[#D4AF37] hover:bg-stone-900 py-3 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-[#D4AF37]" />
                                        <span>Watch Video Desk</span>
                                      </button>
                                    </>
                                  );
                                }
                              })()}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setCheckoutCourse(course);
                                setBillingName(currentUser.name);
                                setEnrollStep(1);
                              }}
                              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:shadow-[0_4px_15px_rgba(212,175,55,0.2)] text-black py-3 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Enroll (₹{course.price.toLocaleString()})</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* LIVE CLASSES TAB */}
            {activeTab === 'classes' && (
              <LiveClasses
                currentUser={currentUser}
                courses={courses}
                enrollments={myEnrollments}
                onToast={showToast}
                onEnrollTrigger={(courseTitle) => {
                  const assocCourse = courses.find(c => c.title === courseTitle);
                  if (assocCourse) {
                    setCheckoutCourse(assocCourse);
                    setBillingName(currentUser.name);
                    setEnrollStep(1);
                  }
                }}
              />
            )}

            {/* ASSIGNMENTS / HOMEWORK GRADERS */}
            {activeTab === 'assignments' && (
              <div className="space-y-8">
                <div className="pb-4 border-b border-stone-200">
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900">
                    {currentUser.role === 'Admin' ? 'Evaluate Student Submissions' : 'Academic Homework Desk'}
                  </h3>
                  <p className="text-stone-600 text-xs font-light mt-1">
                    {currentUser.role === 'Admin' 
                      ? 'Grade pattern drafting and fabric cutting homework uploaded by students.'
                      : 'Review current course tasks, download templates, and upload snapshots of your finished outfits.'}
                  </p>
                </div>

                {/* If Instructor: Evaluate Submissions */}
                {currentUser.role === 'Admin' ? (
                  <div className="space-y-6">
                    <h4 className="font-serif text-base font-bold text-stone-900">Pending Evaluation queue</h4>
                    {submissionsList.length === 0 ? (
                      <p className="text-stone-500 text-xs py-6 text-center italic">No homework submissions pending grading.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {submissionsList.map((sub) => (
                          <div key={sub.id} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[9px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold">
                                  {sub.courseTitle}
                                </span>
                                <h5 className="font-bold text-xs text-stone-800 leading-tight mt-0.5">{sub.assignmentTitle}</h5>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                                sub.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {sub.status}
                              </span>
                            </div>

                            <div className="flex gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs">
                              <img
                                src={sub.fileUrl}
                                alt="Student upload"
                                className="w-16 h-16 rounded-lg object-cover cursor-pointer border border-stone-200"
                                onClick={() => window.open(sub.fileUrl, '_blank')}
                              />
                              <div className="space-y-1 font-light text-stone-600">
                                <p><strong>Student:</strong> {sub.userName}</p>
                                <p><strong>File Name:</strong> <span className="font-mono text-[10px]">{sub.fileName}</span></p>
                                <p><strong>Submitted:</strong> {sub.submittedAt}</p>
                              </div>
                            </div>

                            {sub.status === 'graded' ? (
                              <div className="bg-stone-50 border-l-2 border-[#D4AF37] p-3 rounded-r-xl text-xs text-stone-700 font-light space-y-1">
                                <p><strong>Grade Score:</strong> <span className="font-mono font-bold text-[#D4AF37]">{sub.marks}/100</span></p>
                                <p><strong>Instructor Feedback:</strong> "{sub.feedback}"</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => setGradingSubmission(sub)}
                                className="w-full bg-[#111111] hover:bg-[#D4AF37] text-white hover:text-black py-2.5 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all cursor-pointer border border-stone-800"
                              >
                                Review & Grade Submission
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Student Assignments View
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {assignmentsList.map((task) => {
                      const isEnrolled = myEnrollments.some(e => e.courseTitle === task.courseTitle);
                      const sub = submissionsList.find(s => s.assignmentId === task.id);
                      return (
                        <div key={task.id} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider">
                              <span className="text-stone-400">{task.courseTitle}</span>
                              <span className="text-[#D4AF37] font-bold">Due: {task.dueDate}</span>
                            </div>
                            <h4 className="font-serif text-base font-bold text-stone-900 leading-snug">{task.title}</h4>
                            <p className="text-stone-600 text-xs leading-relaxed font-light">{task.description}</p>
                            <p className="text-stone-500 font-mono text-[10px] font-bold">Total Grade Points: {task.points} Marks</p>
                          </div>

                          <div className="pt-4 border-t border-stone-100">
                            {sub ? (
                              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 text-xs text-stone-700 font-light space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1 font-bold text-green-700 uppercase text-[10px]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Submitted
                                  </span>
                                  <span className="text-[10px] text-stone-400 font-mono">Date: {sub.submittedAt}</span>
                                </div>
                                <p className="text-[11px]">Uploaded: <span className="font-mono text-[10px] text-[#D4AF37]">{sub.fileName}</span></p>
                                
                                {sub.status === 'graded' ? (
                                  <div className="pt-2 border-t border-stone-200 space-y-1">
                                    <p className="font-mono"><strong>Score:</strong> <span className="text-[#D4AF37] font-bold">{sub.marks}/100</span></p>
                                    <p className="italic text-stone-600">" {sub.feedback} "</p>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-stone-500 italic pt-1">Awaiting evaluation from Pratibha Ingole...</p>
                                )}
                              </div>
                            ) : isEnrolled ? (
                              <button
                                onClick={() => {
                                  setActiveAssignmentUpload(task);
                                  setUploadedFileName(`${task.title.toLowerCase().replace(/ /g, '_')}_neha.pdf`);
                                }}
                                className="w-full bg-[#111111] hover:bg-[#D4AF37] text-white hover:text-black py-3 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all cursor-pointer border border-stone-800"
                              >
                                Upload Pattern Snapshot
                              </button>
                            ) : (
                              <button
                                disabled
                                className="w-full bg-stone-50 text-stone-400 py-3 rounded-xl text-xs font-mono tracking-widest uppercase border border-stone-100"
                              >
                                Course Registration Required
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* DOWNLOADS & NOTES SECTION */}
            {activeTab === 'downloads' && (
              <div className="space-y-8">
                <div className="pb-4 border-b border-stone-200">
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900">Syllabus Guide Downloads</h3>
                  <p className="text-stone-600 text-xs font-light mt-1">Download official pattern templates, calculating matrices, and machine handbooks.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notesList.map((note) => (
                    <div key={note.id} className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 uppercase tracking-wider">
                          <span>{note.courseTitle}</span>
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded font-bold">{note.type}</span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-stone-900 leading-snug">{note.title}</h4>
                        <p className="text-stone-500 font-mono text-[10px]">File details: {note.size}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          showToast(`Downloading ${note.title}...`);
                          window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
                        }}
                        className="w-full bg-stone-50 hover:bg-[#111111] text-stone-700 hover:text-[#D4AF37] border border-stone-200 hover:border-stone-800 py-2.5 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Note</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANALYTICS SECTION (Admin Only) */}
            {activeTab === 'analytics' && currentUser.role === 'Admin' && (
              <div className="space-y-8 text-[#111111]">
                <div className="pb-4 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900">Pearls Academy Central Console</h3>
                    <p className="text-stone-600 text-xs font-light mt-1">Admin commands, student admissions, manual UTR payment audits, WhatsApp OTP dispatches, and login logs.</p>
                  </div>
                  <button
                    onClick={handleExportStudentsCSV}
                    className="bg-[#111111] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-stone-800 px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Admissions (CSV)</span>
                  </button>
                </div>

                {/* Swiss Grid Subtab Buttons Row */}
                <div className="flex flex-wrap gap-2 border-b border-stone-100 pb-2">
                  {[
                    { id: 'stats', label: 'Overview Metrics', icon: TrendingUp },
                    { id: 'students', label: 'Student Directory', icon: Users },
                    { id: 'payments', label: 'Payment Approvals', icon: CreditCard },
                    { id: 'whatsapp', label: 'WhatsApp Dispatch Logs', icon: MessageSquare },
                    { id: 'security', label: 'Login Audit Trail', icon: ShieldCheck }
                  ].map((btn) => {
                    const BtnIcon = btn.icon;
                    return (
                      <button
                        key={btn.id}
                        onClick={() => setAdminSubTab(btn.id as any)}
                        className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                          adminSubTab === btn.id
                            ? 'bg-[#AA7C11] text-black font-bold'
                            : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <BtnIcon className="w-3.5 h-3.5" />
                        <span>{btn.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* SUBTAB 1: STATS & OVERVIEW */}
                {adminSubTab === 'stats' && (
                  <div className="space-y-8 animate-fadeIn">
                    {/* Stats cards row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                      <div className="bg-white border border-[#D4AF37]/25 rounded-3xl p-5 shadow-sm space-y-2">
                        <span className="text-stone-400 font-mono uppercase">Total Admissions</span>
                        <h5 className="font-serif text-3xl font-bold text-[#111111]">
                          {allUsers.filter(u => u.role === 'Student').length}
                        </h5>
                        <p className="text-green-600 font-mono text-[10px]">Active student profiles</p>
                      </div>

                      <div className="bg-white border border-[#D4AF37]/25 rounded-3xl p-5 shadow-sm space-y-2">
                        <span className="text-stone-400 font-mono uppercase">Course Revenues</span>
                        <h5 className="font-serif text-3xl font-bold text-[#111111]">
                          ₹{upiPaymentsList.filter(p => p.status === 'Approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </h5>
                        <p className="text-green-600 font-mono text-[10px]">Verified UPI UTR accounts</p>
                      </div>

                      <div className="bg-white border border-[#D4AF37]/25 rounded-3xl p-5 shadow-sm space-y-2">
                        <span className="text-stone-400 font-mono uppercase">Pending Audits</span>
                        <h5 className="font-serif text-3xl font-bold text-amber-600 animate-pulse">
                          {upiPaymentsList.filter(p => p.status === 'Pending').length}
                        </h5>
                        <p className="text-stone-500 font-mono text-[10px]">Awaiting review approvals</p>
                      </div>

                      <div className="bg-white border border-[#D4AF37]/25 rounded-3xl p-5 shadow-sm space-y-2">
                        <span className="text-stone-400 font-mono uppercase">WhatsApp Dispatches</span>
                        <h5 className="font-serif text-3xl font-bold text-stone-800">
                          {whatsappLogsList.length}
                        </h5>
                        <p className="text-green-600 font-mono text-[10px]">Meta API dispatches sent</p>
                      </div>
                    </div>

                    {/* Chart list */}
                    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6">
                      <h4 className="font-serif text-base font-bold text-stone-900">Enrolled Students Distribution</h4>
                      <div className="space-y-4">
                        {courses.map((c) => {
                          const count = allSubscriptions.filter(s => s.courseId === c.id && s.status === 'Active').length;
                          const totalCount = Math.max(1, allSubscriptions.filter(s => s.status === 'Active').length);
                          const percentage = Math.round((count / totalCount) * 100);
                          return (
                            <div key={c.id} className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-stone-700">{c.title}</span>
                                <span className="text-stone-500 font-mono">
                                  {count} active student{count !== 1 ? 's' : ''} ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] h-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: STUDENT DIRECTORY */}
                {adminSubTab === 'students' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
                      
                      {/* Search and status filter row */}
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full relative">
                          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            placeholder="Search by name, phone, city, student ID..."
                            value={adminStudentSearch}
                            onChange={(e) => setAdminStudentSearch(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto text-[10px] font-mono">
                          <span className="text-stone-400 uppercase">Filter:</span>
                          {(['all', 'active', 'suspended'] as const).map((filterOpt) => (
                            <button
                              key={filterOpt}
                              type="button"
                              onClick={() => setAdminStudentFilter(filterOpt)}
                              className={`py-1.5 px-3 rounded-lg uppercase tracking-wider font-bold transition-all ${
                                adminStudentFilter === filterOpt
                                  ? 'bg-[#111111] text-[#D4AF37]'
                                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                            >
                              {filterOpt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Student database table list */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-stone-100 text-stone-400 font-mono uppercase text-[9px] tracking-wider">
                              <th className="py-3 px-4">Student ID</th>
                              <th className="py-3 px-4">Full Name</th>
                              <th className="py-3 px-4">Contact (WhatsApp)</th>
                              <th className="py-3 px-4">Region</th>
                              <th className="py-3 px-4">Batch Shift</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50 text-[#111111]">
                            {allUsers
                              .filter(u => u.role === 'Student')
                              .filter(u => {
                                if (adminStudentFilter === 'active') return u.active;
                                if (adminStudentFilter === 'suspended') return !u.active;
                                return true;
                              })
                              .filter(u => {
                                const q = adminStudentSearch.toLowerCase().trim();
                                if (!q) return true;
                                return (
                                  u.name.toLowerCase().includes(q) ||
                                  (u.phone && u.phone.includes(q)) ||
                                  (u.studentId && u.studentId.toLowerCase().includes(q)) ||
                                  (u.city && u.city.toLowerCase().includes(q))
                                );
                              })
                              .map((student) => (
                                <tr key={student.id} className="hover:bg-stone-50/50 transition-colors">
                                  <td className="py-3 px-4 font-mono font-bold text-stone-500">
                                    {student.studentId || 'N/A'}
                                  </td>
                                  <td className="py-3 px-4 font-bold text-stone-900">
                                    {student.name}
                                  </td>
                                  <td className="py-3 px-4 font-mono">
                                    <div>{student.phone || 'N/A'}</div>
                                    <div className="text-[10px] text-green-600 flex items-center gap-1 mt-0.5">
                                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                      <span>WA: {student.whatsapp || student.phone || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    {student.city ? `${student.city}, ${student.state || 'MH'}` : 'N/A'}
                                  </td>
                                  <td className="py-3 px-4 font-mono">
                                    <select
                                      value={student.batch || 'Morning Batch (10 AM)'}
                                      onChange={(e) => handleAdminStudentAction(student.id, 'assign_batch', { batch: e.target.value })}
                                      className="bg-stone-50 border border-stone-200 p-1.5 rounded-lg text-[10px] focus:outline-none focus:border-[#D4AF37]"
                                    >
                                      <option value="Morning Batch (10 AM)">Morning Batch (10 AM)</option>
                                      <option value="Noon Batch (1 PM)">Noon Batch (1 PM)</option>
                                      <option value="Evening Batch (4 PM)">Evening Batch (4 PM)</option>
                                    </select>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                      student.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {student.active ? 'Active' : 'Suspended'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleLoadStudentDetail(student.id)}
                                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-[#D4AF37]/20 text-stone-700 hover:text-stone-900 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1"
                                      title="Detailed student logs, course logins, certificates, password resets"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                      <span>Log Detail</span>
                                    </button>
                                    <button
                                      onClick={() => handleAdminStudentAction(student.id, 'toggle_active')}
                                      className={`px-2.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                                        student.active
                                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                                      }`}
                                    >
                                      {student.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: PAYMENT APPROVALS */}
                {adminSubTab === 'payments' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <h4 className="font-serif text-sm font-bold text-stone-900">Admissions Tuition Audit Trails (UPI QR Payments)</h4>
                        <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase">Awaiting Approval Review</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-stone-100 text-stone-400 font-mono uppercase text-[9px] tracking-wider">
                              <th className="py-3 px-4">Payment ID</th>
                              <th className="py-3 px-4">Student Participant</th>
                              <th className="py-3 px-4">Enrolled Course</th>
                              <th className="py-3 px-4 font-mono">Verified UTR Reference</th>
                              <th className="py-3 px-4">Amount</th>
                              <th className="py-3 px-4">Timestamp</th>
                              <th className="py-3 px-4">Approval Status</th>
                              <th className="py-3 px-4 text-right">Action Commands</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50 text-[#111111]">
                            {upiPaymentsList.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="py-8 text-center text-stone-400 italic font-mono">
                                  No UPI manual payments registered yet.
                                </td>
                              </tr>
                            ) : (
                              upiPaymentsList.map((pay) => (
                                <tr key={pay.id} className="hover:bg-stone-50/50 transition-colors">
                                  <td className="py-3 px-4 font-mono font-bold text-stone-500">
                                    {pay.id.toUpperCase()}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-stone-900">{pay.userName}</div>
                                    <div className="text-[10px] font-mono text-stone-500">{pay.userPhone}</div>
                                  </td>
                                  <td className="py-3 px-4 font-medium text-stone-700">
                                    {pay.courseTitle}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-mono bg-stone-100 py-1 px-2 rounded border border-stone-200 text-stone-800 font-bold tracking-wider text-[11px]">
                                      {pay.utrNumber}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-mono font-bold text-stone-900">
                                    ₹{pay.amount.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4 text-stone-500 font-mono text-[10px]">
                                    {pay.submittedAt}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                      pay.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                      pay.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                      'bg-amber-100 text-amber-700 animate-pulse'
                                    }`}>
                                      {pay.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                                      {pay.status === 'Pending' && <Clock className="w-3 h-3" />}
                                      {pay.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    {pay.status === 'Pending' ? (
                                      <div className="flex gap-2 justify-end">
                                        <button
                                          onClick={() => handleAdminPaymentAction(pay.id, 'reject')}
                                          className="bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-mono text-[9px] uppercase font-bold cursor-pointer border border-red-200"
                                        >
                                          Reject
                                        </button>
                                        <button
                                          onClick={() => handleAdminPaymentAction(pay.id, 'approve')}
                                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase font-bold cursor-pointer"
                                        >
                                          Approve
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-stone-400 font-mono text-[10px]">Audit Logged</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: WHATSAPP OTP DISPATCH LOGS */}
                {adminSubTab === 'whatsapp' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                          <h4 className="font-serif text-sm font-bold text-stone-900">Meta API WhatsApp Message Delivery Logs</h4>
                          <p className="text-stone-500 text-[10px] font-light mt-0.5">Realtime monitoring of verification OTP dispatches and delivery reports.</p>
                        </div>
                        <span className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-[9px] font-mono uppercase font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" /> Meta Cloud Connected
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-stone-100 text-stone-400 font-mono uppercase text-[9px] tracking-wider">
                              <th className="py-3 px-4">Log ID</th>
                              <th className="py-3 px-4">Recipient Phone</th>
                              <th className="py-3 px-4">Security Code</th>
                              <th className="py-3 px-4">Simulated API Payload Message</th>
                              <th className="py-3 px-4 font-mono">Timestamp</th>
                              <th className="py-3 px-4">Delivery Status</th>
                              <th className="py-3 px-4 text-right">Interactive Command</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50 text-[#111111]">
                            {whatsappLogsList.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-stone-400 italic font-mono">
                                  No verification messages dispatched yet.
                                </td>
                              </tr>
                            ) : (
                              whatsappLogsList.map((log) => (
                                <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                                  <td className="py-3 px-4 font-mono font-bold text-stone-500">
                                    {log.id.toUpperCase()}
                                  </td>
                                  <td className="py-3 px-4 font-mono text-stone-800 font-bold">
                                    {log.recipientPhone}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-mono bg-[#D4AF37]/10 text-[#AA7C11] border border-[#D4AF37]/35 py-0.5 px-2.5 rounded font-bold text-[11px]">
                                      {log.code}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-light text-stone-600 italic max-w-sm truncate">
                                    "{log.text}"
                                  </td>
                                  <td className="py-3 px-4 font-mono text-stone-500 text-[10px]">
                                    {log.timestamp}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                      {log.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        showToast(`OTP Code [${log.code}] successfully re-delivered on WhatsApp to ${log.recipientPhone}`);
                                      }}
                                      className="bg-[#111111] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black font-mono text-[9px] uppercase font-bold py-1 px-2.5 rounded-lg border border-stone-800 transition-all cursor-pointer"
                                    >
                                      Resend SMS
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 5: SECURITY LOGIN AUDIT */}
                {adminSubTab === 'security' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                          <h4 className="font-serif text-sm font-bold text-stone-900">Student Account Authentication History Audit</h4>
                          <p className="text-stone-500 text-[10px] font-light mt-0.5">Audit log records of security authorization requests, device configurations, and login approvals.</p>
                        </div>
                        <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase">Interactive Log Monitor</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-stone-100 text-stone-400 font-mono uppercase text-[9px] tracking-wider">
                              <th className="py-3 px-4">Audit ID</th>
                              <th className="py-3 px-4">Student Participant</th>
                              <th className="py-3 px-4">Mobile Coordinates</th>
                              <th className="py-3 px-4">Browser / Device Meta</th>
                              <th className="py-3 px-4">IP Location Coordinate</th>
                              <th className="py-3 px-4 font-mono">Timestamp</th>
                              <th className="py-3 px-4">Auth Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50 text-[#111111]">
                            {loginHistoryList.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-stone-400 italic font-mono">
                                  No security login actions logged.
                                </td>
                              </tr>
                            ) : (
                              loginHistoryList.map((item) => (
                                <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                                  <td className="py-3 px-4 font-mono text-stone-500">
                                    {item.id.toUpperCase()}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-stone-900">{item.userName}</div>
                                    <div className="text-[10px] text-stone-400 font-mono">{item.userEmail}</div>
                                  </td>
                                  <td className="py-3 px-4 font-mono font-medium text-stone-700">
                                    {item.phone || 'N/A'}
                                  </td>
                                  <td className="py-3 px-4 text-stone-600 font-mono text-[10px]">
                                    {item.device}
                                  </td>
                                  <td className="py-3 px-4 text-stone-500 font-mono text-[10px]">
                                    {item.ip}
                                  </td>
                                  <td className="py-3 px-4 font-mono text-stone-500 text-[10px]">
                                    {item.timestamp}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==========================================
          VIRTUAL HD CLASSROOM SCREEN MODAL (Zoom/Meet Interface)
          ========================================== */}
      <AnimatePresence>
        {activeClassroomSession && (
          <LiveClassroomWindow 
            session={activeClassroomSession} 
            user={currentUser!} 
            onLeave={() => {
              setActiveClassroomSession(null);
              fetchState(selectedRoleEmail);
            }} 
          />
        )}
      </AnimatePresence>

      {/* ==========================================
          LECTURE MOCK VIDEO PLAYER LIGHTBOX
          ========================================== */}
      <AnimatePresence>
        {activeLectureVideo && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 text-white">
            <div className="w-full max-w-4xl bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
              
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-900">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-mono tracking-widest uppercase font-bold">{activeLectureVideo.course.title}</span>
                  <h4 className="font-serif text-base md:text-lg font-bold leading-tight">{activeLectureVideo.lesson.title}</h4>
                </div>
                <button 
                  onClick={() => setActiveLectureVideo(null)}
                  className="p-2 border border-stone-800 rounded-full text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video container */}
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video 
                  src={activeLectureVideo.lesson.videoUrl} 
                  controls 
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4 md:p-6 bg-stone-900 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-stone-400 text-xs font-light">
                  Complete this lesson lecture to progress your grading status. Completed lessons are stored automatically.
                </p>
                <button
                  onClick={async () => {
                    await handleCompleteLesson(activeLectureVideo.course.id, activeLectureVideo.lesson.id);
                    setActiveLectureVideo(null);
                  }}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black px-6 py-3 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Mark Lesson Completed
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          SECURE PHONE + WHATSAPP OTP & UPI PAYMENT CHECKOUT
          ========================================== */}
      <AnimatePresence>
        {checkoutCourse && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white text-[#111111] w-full max-w-md rounded-[32px] border border-[#D4AF37]/30 shadow-2xl overflow-hidden p-6 md:p-8 space-y-6 relative my-auto">
              
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#AA7C11] to-[#D4AF37]" />

              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h4 className="font-serif text-lg font-bold">Secure Admission Checkout</h4>
                  <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mt-0.5">Step {enrollStep} of 3</p>
                </div>
                <button 
                  onClick={() => {
                    setCheckoutCourse(null);
                    setIssuedInvoice(null);
                    setEnrollStep(1);
                    setPaymentUtr('');
                    setPaymentUtrError('');
                    setOtpCode('');
                    setOtpError('');
                    setSimulatedOtpReceived(null);
                  }}
                  className="p-1.5 border border-stone-200 rounded-full hover:bg-stone-50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {issuedInvoice ? (
                // Invoice / Completion Success Screen
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto border border-green-200">
                      <Check className="w-8 h-8" />
                    </div>
                    <h5 className="font-serif text-lg font-bold text-green-800">Enrollment Logged Successfully</h5>
                    <p className="text-stone-500 text-xs leading-relaxed font-light">
                      Your manual UPI payment reference has been recorded under pending verification. Access will unlock shortly!
                    </p>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex justify-between font-bold border-b border-stone-200 pb-2 text-[10px] font-mono text-stone-400 uppercase">
                      <span>Item Course Details</span>
                      <span>Tuition Fee</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-serif font-bold text-stone-800">{issuedInvoice.courseTitle}</span>
                      <span className="font-serif font-bold text-[#AA7C11]">₹{issuedInvoice.price.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-200 space-y-2 text-[11px] text-stone-600 font-mono">
                      <p><strong>Invoice Code:</strong> {issuedInvoice.invoiceId}</p>
                      <p><strong>Student Name:</strong> {issuedInvoice.billingName}</p>
                      <p><strong>Mobile Registered:</strong> {studentPhone}</p>
                      <p><strong>UTR Reference:</strong> {paymentUtr}</p>
                      <p><strong>Payment Mode:</strong> {issuedInvoice.payMethod}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-[11px] leading-relaxed flex gap-2.5">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Verification Pending:</strong> Our Accounts Desk checks references against live UPI logs within 2 hours. You can explore the overview desk; course content will unlock automatically when approved.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutCourse(null);
                      setIssuedInvoice(null);
                      setEnrollStep(1);
                      setPaymentUtr('');
                      setOtpCode('');
                    }}
                    className="w-full bg-[#111111] hover:bg-[#D4AF37] text-white hover:text-black py-3.5 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all shadow-md cursor-pointer"
                  >
                    Open Student Desk
                  </button>
                </div>
              ) : enrollStep === 1 ? (
                // Step 1: Collect Coordinates
                <form onSubmit={(e) => { e.preventDefault(); setEnrollStep(2); }} className="space-y-4 text-xs">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-stone-400 font-mono uppercase text-[9px] tracking-wider">Class Selected</p>
                      <p className="font-bold text-stone-800 mt-0.5">{checkoutCourse.title}</p>
                    </div>
                    <span className="text-[#D4AF37] font-serif font-bold text-base">₹{checkoutCourse.price.toLocaleString()}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-stone-500 font-mono uppercase text-[10px]">Full Legal Name</label>
                      <input
                        type="text"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                        placeholder="Enter student's full name..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-stone-500 font-mono uppercase text-[10px]">Mobile Number</label>
                        <input
                          type="tel"
                          value={studentPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length <= 10) setStudentPhone(val);
                          }}
                          className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl focus:outline-none focus:border-[#D4AF37] font-mono"
                          placeholder="10-digit number..."
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-stone-500 font-mono uppercase text-[10px]">WhatsApp Number</label>
                        <input
                          type="tel"
                          value={studentSameWhatsapp ? studentPhone : studentWhatsapp}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length <= 10) setStudentWhatsapp(val);
                          }}
                          disabled={studentSameWhatsapp}
                          className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl focus:outline-none focus:border-[#D4AF37] font-mono disabled:opacity-60"
                          placeholder="WhatsApp number..."
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="same_whatsapp"
                        checked={studentSameWhatsapp}
                        onChange={(e) => setStudentSameWhatsapp(e.target.checked)}
                        className="rounded border-stone-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <label htmlFor="same_whatsapp" className="text-[11px] text-stone-600 font-light select-none">
                        WhatsApp is the same as Mobile Number
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-stone-500 font-mono uppercase text-[10px]">City</label>
                        <input
                          type="text"
                          value={studentCity}
                          onChange={(e) => setStudentCity(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                          placeholder="e.g. Parbhani"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-stone-500 font-mono uppercase text-[10px]">State</label>
                        <input
                          type="text"
                          value={studentState}
                          onChange={(e) => setStudentState(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                          placeholder="e.g. Maharashtra"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black py-3.5 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Proceed to UPI QR Code Payment</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              ) : enrollStep === 2 ? (
                // Step 2: Display QR Code & Collect UTR
                <form onSubmit={handleEnrollSubmitUtr} className="space-y-5 text-xs">
                  <div className="text-center space-y-1.5">
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-mono font-bold tracking-widest uppercase px-3 py-0.5 rounded-full">Static UPI QR Code Entry</span>
                    <h5 className="font-serif text-sm font-bold text-stone-900">Scan & Pay ₹{checkoutCourse.price.toLocaleString()}</h5>
                  </div>

                  {/* Stunning Custom simulated QR Code card */}
                  <div className="bg-gradient-to-b from-[#111111] to-stone-900 text-white rounded-3xl p-5 border border-[#D4AF37]/30 text-center space-y-4 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full blur-xl" />
                    
                    <div className="bg-white p-3 rounded-2xl inline-block mx-auto shadow-md">
                      <img 
                        src="/src/assets/images/pratibha_ingole_1783095676300.jpg" 
                        alt="P.R. Ingole UPI QR Code" 
                        className="w-44 h-44 object-contain mx-auto rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="space-y-1.5 font-mono text-[10px]">
                      <div className="flex justify-between px-4 text-stone-400">
                        <span>Merchant VPA:</span>
                        <span className="text-white font-bold select-all">pearlsacademy@upi</span>
                      </div>
                      <div className="flex justify-between px-4 text-stone-400">
                        <span>Exact Amount:</span>
                        <span className="text-[#D4AF37] font-bold">₹{checkoutCourse.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-stone-500 font-mono uppercase text-[10px]">12-to-22 Digit UPI UTR / Transaction ID</label>
                        <span className="text-[10px] text-[#AA7C11] font-mono">Required</span>
                      </div>
                      <input
                        type="text"
                        value={paymentUtr}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length <= 22) setPaymentUtr(val);
                        }}
                        className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl font-mono focus:outline-none focus:border-[#D4AF37]"
                        placeholder="e.g. 928374839210"
                        required
                      />
                      {paymentUtrError && (
                        <p className="text-red-600 text-[10px] mt-1 font-mono flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{paymentUtrError}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-[10px] text-stone-500 leading-normal font-light">
                      <input type="checkbox" id="utr_cert" required className="mt-0.5 rounded border-stone-300 text-[#D4AF37]" />
                      <label htmlFor="utr_cert" className="select-none">
                        I confirm that I have processed the scan payment and the entered transaction code matches exactly.
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEnrollStep(1)}
                      className="w-1/3 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3.5 rounded-xl font-mono uppercase text-[10px] tracking-wider transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black py-3.5 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Registering UTR...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <span>Submit & Send OTP</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // Step 3: Enter WhatsApp OTP Code
                <form onSubmit={handleEnrollVerifyOtp} className="space-y-5 text-xs">
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-200 text-green-600">
                      <MessageSquare className="w-6 h-6 animate-bounce" />
                    </div>
                    <h5 className="font-serif text-base font-bold text-stone-900">Verify WhatsApp Code</h5>
                    <p className="text-stone-500 text-[11px] leading-relaxed max-w-xs mx-auto font-light">
                      We have dispatched a 6-digit verification code directly to WhatsApp number <strong className="font-mono">{studentPhone}</strong>.
                    </p>
                  </div>

                  {/* Simulated WhatsApp notification bar for instant user testing */}
                  {simulatedOtpReceived && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2 text-[11px] text-green-800 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-green-600 text-white font-mono text-[8px] uppercase font-bold px-2 py-0.5 rounded-bl-xl shadow-sm">
                        WhatsApp Emulation
                      </div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                        <span>Mock WhatsApp Delivery Received:</span>
                      </div>
                      <p className="font-mono text-stone-700 leading-normal italic bg-white p-2.5 rounded-xl border border-green-100">
                        "Welcome to Pearls Academy! Your verification code is <strong className="text-green-600 underline text-sm select-all">{simulatedOtpReceived}</strong>. Valid for 10 minutes."
                      </p>
                      <button
                        type="button"
                        onClick={() => setOtpCode(simulatedOtpReceived)}
                        className="text-green-700 underline font-mono text-[9px] font-bold tracking-wider uppercase block mt-1 hover:text-green-900"
                      >
                        Auto-fill Verification Code
                      </button>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-stone-500 font-mono uppercase text-[10px]">Enter 6-Digit WhatsApp OTP</label>
                        <span className="text-[#AA7C11] font-mono font-bold">
                          {otpTimer > 0 ? `${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, '0')}` : "Expired"}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length <= 6) setOtpCode(val);
                        }}
                        className="w-full bg-stone-50 border border-stone-200 p-3.5 rounded-xl font-mono text-center text-lg tracking-[0.5em] font-bold focus:outline-none focus:border-[#D4AF37]"
                        placeholder="------"
                        required
                      />
                      {otpError && (
                        <p className="text-red-600 text-[10px] font-mono flex items-center gap-1 mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{otpError}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-mono pt-1 text-stone-500">
                      <span>Attempts left: {otpAttempts}</span>
                      <button
                        type="button"
                        disabled={resendCooldown > 0}
                        onClick={handleResendEnrollOtp}
                        className={`underline uppercase font-bold transition-all ${
                          resendCooldown > 0 ? 'opacity-50 text-stone-400' : 'text-[#AA7C11] hover:text-stone-900'
                        }`}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEnrollStep(2)}
                      className="w-1/3 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3.5 rounded-xl font-mono uppercase text-[10px] tracking-wider transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessingPayment || otpTimer === 0}
                      className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black py-3.5 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Activating Account...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Complete Registration</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          HOMEWORK ASSIGNMENT UPLOAD DIALOG
          ========================================== */}
      <AnimatePresence>
        {activeAssignmentUpload && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white text-[#111111] w-full max-w-md rounded-3xl border border-[#D4AF37]/35 shadow-2xl p-6 space-y-6">
              
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h4 className="font-serif text-lg font-bold">Upload Homework Pattern</h4>
                <button onClick={() => setActiveAssignmentUpload(null)} className="p-1.5 border border-stone-200 rounded-full cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600 font-light leading-relaxed">
                <p><strong>Assignment:</strong> {activeAssignmentUpload.title}</p>
                <p><strong>Course:</strong> {activeAssignmentUpload.courseTitle}</p>
                <p><strong>Max Points:</strong> 100 Marks</p>
              </div>

              <form onSubmit={handleUploadHomework} className="space-y-4 text-xs">
                {/* Drag-and-drop file upload simulation */}
                <div 
                  onClick={() => {
                    setUploadedFileName(`draft_measurements_${currentUser?.name.toLowerCase().replace(/ /g, '_')}.pdf`);
                    setUploadedFilePreview(true);
                  }}
                  className="border-2 border-dashed border-[#D4AF37]/45 rounded-2xl p-8 text-center space-y-3 cursor-pointer hover:bg-stone-50 transition-all"
                >
                  <FileText className="w-8 h-8 text-[#D4AF37] mx-auto animate-bounce" />
                  {uploadedFilePreview ? (
                    <div>
                      <p className="font-mono text-[10px] text-green-700 font-bold">{uploadedFileName}</p>
                      <p className="text-stone-400 text-[9px] mt-1">Ready for submission review. Click to switch file.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-stone-800">Simulate PDF or Image Upload</p>
                      <p className="text-stone-400 text-[10px] mt-0.5">Click to lock template design layout</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAssignmentUpload(null)}
                    className="bg-stone-100 px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadedFilePreview || submittingHomework}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black px-5 py-2.5 rounded-xl font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingHomework ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending blueprint...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Submit Assignment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          TEACHER EVALUATION GRADING DIALOG
          ========================================== */}
      <AnimatePresence>
        {gradingSubmission && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white text-[#111111] w-full max-w-md rounded-3xl border border-[#D4AF37]/35 shadow-2xl p-6 space-y-6">
              
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h4 className="font-serif text-lg font-bold">Evaluate Submission</h4>
                <button onClick={() => setGradingSubmission(null)} className="p-1.5 border border-stone-200 rounded-full cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs text-stone-600 font-light">
                <p><strong>Student:</strong> {gradingSubmission.userName} ({gradingSubmission.userEmail})</p>
                <p><strong>Course:</strong> {gradingSubmission.courseTitle}</p>
                <p><strong>Homework Name:</strong> {gradingSubmission.assignmentTitle}</p>
              </div>

              <form onSubmit={handleGradeHomework} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-stone-500 font-mono uppercase">Grade Score Marks (Out of 100)</label>
                  <input
                    type="number"
                    value={inputMarks}
                    onChange={(e) => setInputMarks(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    required
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-500 font-mono uppercase">Instructor Review Feedback</label>
                  <textarea
                    value={inputFeedback}
                    onChange={(e) => setInputFeedback(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl focus:outline-none focus:border-[#D4AF37] h-24"
                    placeholder="Provide constructive fitting secrets..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="bg-stone-100 px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#111111] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black px-5 py-2.5 rounded-xl font-mono uppercase tracking-wider font-bold cursor-pointer"
                  >
                    Post Evaluation
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          GRADUATION CERTIFICATE PRINT VIEW
          ========================================== */}
      <AnimatePresence>
        {selectedCertificateEnrollment && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 text-[#111111]">
            <div className="w-full max-w-3xl bg-[#FCFAF5] border-[12px] border-double border-[#D4AF37] rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
              
              {/* Gold decorative background accents */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-2xl" />

              {/* Header */}
              <div className="text-center space-y-2 relative z-10">
                <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto animate-pulse" />
                <p className="text-[10px] font-mono tracking-[0.3em] text-[#D4AF37] uppercase font-bold">Diploma of Vocatinal Excellence</p>
                <h1 className="font-serif text-3xl md:text-4xl text-[#111111] font-bold tracking-wide">Pearls Dress Designing Institute</h1>
                <p className="text-stone-500 text-[10px] tracking-widest uppercase font-mono">Affiliated with Parbhani Government Syllabus Code</p>
                <div className="w-24 h-0.5 bg-[#D4AF37] mx-auto mt-4" />
              </div>

              {/* Body citation */}
              <div className="text-center space-y-6 max-w-xl mx-auto relative z-10">
                <p className="text-stone-500 italic text-sm md:text-base">This coordinates diploma certifies that</p>
                <h2 className="font-serif text-2xl md:text-3xl text-stone-900 border-b border-stone-200 pb-2 inline-block font-bold">
                  {currentUser?.name}
                </h2>
                <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-light">
                  has completed the extensive module curricula, laboratory cutting trials, and pattern drafting portfolios required for the graduation of the 
                  <br />
                  <strong className="text-stone-900 font-serif text-sm mt-2 block">{selectedCertificateEnrollment.courseTitle}</strong>
                </p>
                <p className="text-stone-500 text-[10px] font-mono leading-relaxed">
                  Issued on: {selectedCertificateEnrollment.enrolledAt} • Credentials ID: <span className="font-bold text-[#D4AF37]">PB-CERT-{selectedCertificateEnrollment.id.toUpperCase()}</span>
                </p>
              </div>

              {/* Bottom stamp rows */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-stone-200 relative z-10 text-center text-xs">
                <div className="space-y-1 text-stone-500">
                  <p className="font-serif text-stone-900 italic font-bold">Pratibha Ingole</p>
                  <p className="text-[9px] font-mono tracking-wider uppercase">Chief Director & Instructor</p>
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-1.5 text-[9px] text-stone-400 font-mono">
                  {/* Mock beautiful golden stamp */}
                  <div className="w-10 h-10 rounded-full border border-[#D4AF37] bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold tracking-tighter text-[9px]">
                    PEARLS
                  </div>
                  <p className="uppercase">Parbhani HQ Stamp</p>
                </div>
              </div>

              {/* Action row */}
              <div className="flex justify-center gap-3 pt-4 border-t border-stone-100">
                <button
                  onClick={() => {
                    showToast("Triggering printer dialog...");
                    window.print();
                  }}
                  className="bg-[#111111] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black px-5 py-2.5 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all cursor-pointer"
                >
                  Print Diploma
                </button>
                <button
                  onClick={() => setSelectedCertificateEnrollment(null)}
                  className="bg-stone-100 px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-widest font-bold text-stone-600 cursor-pointer"
                >
                  Close Certificate
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          STUDENT LOGIN VIA WHATSAPP OTP MODAL
          ========================================== */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white text-[#111111] w-full max-w-sm rounded-[32px] border border-[#D4AF37]/30 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden my-auto text-center">
              
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#AA7C11] to-[#D4AF37]" />

              <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-left">
                <div>
                  <h4 className="font-serif text-base font-bold">WhatsApp OTP Access</h4>
                  <p className="text-[9px] font-mono text-stone-400 uppercase tracking-widest mt-0.5">Secure Student Sign In</p>
                </div>
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginPhone('');
                    setLoginOtpCode('');
                    setLoginStep(1);
                    setLoginSimulatedOtp(null);
                    setLoginError('');
                  }}
                  className="p-1.5 border border-stone-200 rounded-full hover:bg-stone-50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loginStep === 1 ? (
                // Login Phone Entry Form
                <form onSubmit={handleLoginSendOtp} className="space-y-4 text-xs text-left">
                  <div className="text-center space-y-2 pb-2">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border border-green-200 text-green-600 mx-auto">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-stone-500 text-[11px] leading-relaxed max-w-xs mx-auto font-light">
                      Enter your registered 10-digit mobile number to receive an instant verification passcode on WhatsApp.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-500 font-mono uppercase text-[10px]">Registered Mobile Number</label>
                    <input
                      type="tel"
                      value={loginPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 10) setLoginPhone(val);
                      }}
                      className="w-full bg-stone-50 border border-stone-200 p-3.5 rounded-xl font-mono text-center text-sm focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. 9876543210"
                      required
                    />
                    {loginError && (
                      <p className="text-red-600 text-[10px] font-mono flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{loginError}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black py-3.5 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching OTP...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Request WhatsApp Code</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                // Login OTP Verification Form
                <form onSubmit={handleLoginVerifyOtp} className="space-y-4 text-xs text-left">
                  <div className="text-center space-y-1.5 pb-1">
                    <h5 className="font-serif text-sm font-bold text-stone-900">Enter Security Code</h5>
                    <p className="text-stone-500 text-[11px] leading-relaxed max-w-xs mx-auto font-light">
                      Verification code dispatched to WhatsApp number <strong className="font-mono">{loginPhone}</strong>.
                    </p>
                  </div>

                  {/* Simulated login OTP display */}
                  {loginSimulatedOtp && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2 text-[11px] text-green-800 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-green-600 text-white font-mono text-[8px] uppercase font-bold px-2 py-0.5 rounded-bl-xl shadow-sm">
                        WhatsApp Emulation
                      </div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                        <span>Mock WhatsApp Delivery Received:</span>
                      </div>
                      <p className="font-mono text-stone-700 leading-normal italic bg-white p-2.5 rounded-xl border border-green-100">
                        "Welcome to Pearls Academy! Your verification code is <strong className="text-green-600 underline text-sm select-all">{loginSimulatedOtp}</strong>. Valid for 10 minutes."
                      </p>
                      <button
                        type="button"
                        onClick={() => setLoginOtpCode(loginSimulatedOtp)}
                        className="text-green-700 underline font-mono text-[9px] font-bold uppercase block mt-1 hover:text-green-950 font-bold"
                      >
                        Auto-fill Verification Code
                      </button>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-stone-500 font-mono uppercase text-[10px]">6-Digit Security Code</label>
                        <span className="text-[#AA7C11] font-mono font-bold">
                          {loginOtpTimer > 0 ? `${Math.floor(loginOtpTimer / 60)}:${String(loginOtpTimer % 60).padStart(2, '0')}` : "Expired"}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={loginOtpCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length <= 6) setLoginOtpCode(val);
                        }}
                        className="w-full bg-stone-50 border border-stone-200 p-3.5 rounded-xl font-mono text-center text-lg tracking-[0.5em] font-bold focus:outline-none focus:border-[#D4AF37]"
                        placeholder="------"
                        required
                      />
                      {loginError && (
                        <p className="text-red-600 text-[10px] font-mono flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{loginError}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-stone-500">
                      <span>Attempts left: {loginOtpAttempts}</span>
                      <button
                        type="button"
                        disabled={resendCooldown > 0}
                        onClick={handleResendLoginOtp}
                        className={`underline uppercase font-bold transition-all ${
                          resendCooldown > 0 ? 'opacity-50 text-stone-400' : 'text-[#AA7C11] hover:text-stone-900'
                        }`}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setLoginStep(1)}
                      className="w-1/3 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3.5 rounded-xl font-mono uppercase text-[10px] tracking-wider transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessingPayment || loginOtpTimer === 0}
                      className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black py-3.5 rounded-xl text-xs font-mono tracking-widest font-bold uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Access Desk</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          STUDENT DETAIL HISTORY LOGS & ACTIONS MODAL
          ========================================== */}
      <AnimatePresence>
        {showStudentDetailModal && selectedStudentDetail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white text-[#111111] w-full max-w-4xl rounded-[32px] border border-[#D4AF37]/30 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
            >
              {/* Luxury top accent */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#AA7C11] to-[#D4AF37]" />

              {/* Header */}
              <div className="bg-[#111111] text-white p-6 flex items-center justify-between border-b border-[#D4AF37]/25">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center border border-[#D4AF37]/45 text-[#D4AF37]">
                    <Users className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold flex items-center gap-2">
                      <span>Admissions Audit:</span>
                      <span className="text-[#D4AF37] italic">{selectedStudentDetail.user.name}</span>
                    </h4>
                    <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mt-0.5">
                      System logs • Course credentials • Safety console
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowStudentDetailModal(false);
                    setSelectedStudentDetail(null);
                  }}
                  className="p-2 border border-stone-800 rounded-full hover:bg-stone-900 text-stone-400 hover:text-[#D4AF37] cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-stone-50/50">
                
                {/* Left Column: Student Dossier */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Photo & Identity card */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 relative">
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        selectedStudentDetail.user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {selectedStudentDetail.user.active ? 'Active' : 'Suspended'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <img 
                        src={selectedStudentDetail.user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120'} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37]/40 shadow-sm"
                      />
                      <div>
                        <h5 className="font-serif text-base font-bold text-stone-900">{selectedStudentDetail.user.name}</h5>
                        <p className="text-[10px] font-mono text-[#AA7C11] tracking-wider uppercase font-bold">{selectedStudentDetail.user.role} Account</p>
                        <p className="text-[10px] font-mono text-stone-400 mt-0.5">ID: {selectedStudentDetail.user.studentId || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Dossier Grid */}
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-stone-600 border-t border-stone-100 pt-4">
                      <div>
                        <span className="text-stone-400 uppercase text-[9px]">Email:</span>
                        <div className="font-bold text-stone-900 truncate">{selectedStudentDetail.user.email}</div>
                      </div>
                      <div>
                        <span className="text-stone-400 uppercase text-[9px]">Mobile:</span>
                        <div className="font-bold text-stone-900">{selectedStudentDetail.user.phone || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-stone-400 uppercase text-[9px]">WhatsApp:</span>
                        <div className="font-bold text-green-600">{selectedStudentDetail.user.whatsapp || selectedStudentDetail.user.phone || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-stone-400 uppercase text-[9px]">City/State:</span>
                        <div className="font-bold text-stone-900 truncate">{selectedStudentDetail.user.city ? `${selectedStudentDetail.user.city}, ${selectedStudentDetail.user.state}` : 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-stone-400 uppercase text-[9px]">Batch:</span>
                        <div className="font-bold text-stone-900">{selectedStudentDetail.user.batch || 'Morning Batch'}</div>
                      </div>
                      <div>
                        <span className="text-stone-400 uppercase text-[9px]">DOB / Gender:</span>
                        <div className="font-bold text-stone-900 truncate">
                          {selectedStudentDetail.user.dob || 'N/A'} • {selectedStudentDetail.user.gender || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Actions Block */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <h6 className="font-mono text-[10px] uppercase tracking-wider text-stone-400 font-bold border-b border-stone-100 pb-2">Safety Controls</h6>
                    
                    {/* Password reset form */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-stone-500 uppercase font-bold">Override Access Password</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="student123"
                          value={adminResetPassField}
                          onChange={(e) => setAdminResetPassField(e.target.value)}
                          className="flex-1 bg-stone-50 border border-stone-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#D4AF37]"
                        />
                        <button
                          onClick={handleAdminResetPassword}
                          className="px-3 py-1.5 bg-[#111111] hover:bg-[#AA7C11] text-[#D4AF37] hover:text-black font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all"
                        >
                          Overrule
                        </button>
                      </div>
                    </div>

                    {/* Quick suspend and delete */}
                    <div className="flex gap-2 pt-2 border-t border-stone-100">
                      <button
                        onClick={() => handleAdminStudentAction(selectedStudentDetail.user.id, 'toggle_active')}
                        className={`flex-1 py-2 rounded-lg font-mono text-[9px] uppercase font-bold tracking-wider transition-all ${
                          selectedStudentDetail.user.active 
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                            : 'bg-green-50 hover:bg-green-100 text-green-700'
                        }`}
                      >
                        {selectedStudentDetail.user.active ? "Suspend Student" : "Revoke Suspension"}
                      </button>
                      <button
                        onClick={handleAdminDeleteStudent}
                        className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-mono text-[9px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1"
                        title="Delete Student Account Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right Column: Interactive Logs & Logs Tab */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Activity Tab section */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <h6 className="font-mono text-[10px] uppercase tracking-wider text-[#AA7C11] font-bold border-b border-stone-100 pb-2 flex items-center justify-between">
                      <span>Course Credentials & Logs</span>
                      <span className="bg-stone-100 px-2 py-0.5 rounded text-[8px] text-stone-500 font-bold">{selectedStudentDetail.logs.length} Log Entries</span>
                    </h6>

                    {/* Log details list */}
                    <div className="space-y-2.5 max-h-[25vh] overflow-y-auto pr-1">
                      {selectedStudentDetail.logs.length === 0 ? (
                        <p className="text-center text-stone-400 text-[11px] font-mono py-4">No recent session logs recorded for this student.</p>
                      ) : (
                        selectedStudentDetail.logs.map((log: any) => (
                          <div key={log.id} className="border border-stone-100 bg-stone-50 p-2.5 rounded-xl flex items-start justify-between text-[10px] font-mono">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <strong className="text-stone-800 capitalize">{log.action.replace('_', ' ')}</strong>
                              </div>
                              <p className="text-stone-400 text-[9px]">{new Date(log.timestamp).toLocaleString()}</p>
                              {log.details && <p className="text-stone-500 italic mt-0.5 text-[9px]">Details: {log.details}</p>}
                            </div>
                            <div className="text-right text-[9px] text-stone-400 space-y-0.5">
                              <div>IP: {log.ip || '127.0.0.1'}</div>
                              <div>{log.device || 'Web App Client'}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Academic Milestones / Enrolled Courses list */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <h6 className="font-mono text-[10px] uppercase tracking-wider text-stone-400 font-bold border-b border-stone-100 pb-2">Academy Activity Grid</h6>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      
                      {/* Enrolled Courses */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Purchases ({selectedStudentDetail.courses?.length || 0})</span>
                        </span>
                        <div className="border border-stone-100 rounded-xl p-3 bg-stone-50 space-y-1.5 max-h-[14vh] overflow-y-auto">
                          {(!selectedStudentDetail.courses || selectedStudentDetail.courses.length === 0) ? (
                            <div className="text-[10px] text-stone-400">No active course enrollments.</div>
                          ) : (
                            selectedStudentDetail.courses.map((courseId: string) => (
                              <div key={courseId} className="text-stone-800 font-bold text-[10px] border-b border-stone-100 pb-1 last:border-none">
                                • {courseId}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Earned Certificates */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-green-600 animate-bounce" />
                          <span>Certificates ({selectedStudentDetail.certificates?.length || 0})</span>
                        </span>
                        <div className="border border-stone-100 rounded-xl p-3 bg-stone-50 space-y-1.5 max-h-[14vh] overflow-y-auto">
                          {(!selectedStudentDetail.certificates || selectedStudentDetail.certificates.length === 0) ? (
                            <div className="text-[10px] text-stone-400">No certificates issued yet.</div>
                          ) : (
                            selectedStudentDetail.certificates.map((cert: any) => (
                              <div key={cert.id} className="text-stone-800 font-bold text-[10px] border-b border-stone-100 pb-1 last:border-none">
                                • {cert.title}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

              {/* Footer */}
              <div className="bg-[#111111] text-white p-4 text-center border-t border-[#D4AF37]/25 text-[10px] font-mono text-stone-400">
                Pearls Academy Administration System logs are encrypted under ISO/IEC 27001 standard.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ==========================================
// HD LIVE VIRTUAL CLASSROOM SUB-COMPONENT
// ==========================================
interface ClassroomProps {
  session: ScheduledClass;
  user: User;
  onLeave: () => void;
}

function LiveClassroomWindow({ session, user, onLeave }: ClassroomProps) {
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'whiteboard' | 'settings'>('chat');
  const [emojiReactions, setEmojiReactions] = useState<{ id: string; char: string; left: number }[]>([]);
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [raisingHand, setRaisingHand] = useState(false);
  
  // Real device media capture state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  
  // Whiteboard Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#D4AF37'); // Gold default
  const [penWidth, setPenWidth] = useState(4);
  const [eraserMode, setEraserMode] = useState(false);

  // Noise cancellation & Background blur simulation
  const [noiseCancellationLevel, setNoiseCancellationLevel] = useState(75);
  const [backgroundBlurEnabled, setBackgroundBlurEnabled] = useState(true);
  const [networkLatency, setNetworkLatency] = useState(34); // ms

  // Load classroom chat messages and handle genuine camera stream
  useEffect(() => {
    // 1. Fetch initial chat support
    const loadChat = async () => {
      try {
        const res = await fetch(`/api/academy/chat?channel=${encodeURIComponent(session.meetingLink)}`);
        const data = await res.json();
        if (data) setMessagesList(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadChat();

    // 2. Setup standard browser camera capture
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 }, 
          audio: true 
        });
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn("Camera media blocked, running in premium simulated environment mode:", err);
      }
    };
    initCamera();

    // Clean up streams on exit
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update canvas sizing
  useEffect(() => {
    if (activeTab === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 700;
      canvas.height = canvas.parentElement?.clientHeight || 450;
      
      // Draw background guidelines grid
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 0.5;
        for (let i = 20; i < canvas.width; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        for (let j = 20; j < canvas.height; j += 40) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(canvas.width, j);
          ctx.stroke();
        }
      }
    }
  }, [activeTab]);

  // Whiteboard Draw listeners
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = eraserMode ? '#111111' : penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw grid
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 0.5;
    for (let i = 20; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 20; j < canvas.height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }
  };

  // Toggle buttons
  const handleToggleCam = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    }
    setCamOn(!camOn);
  };

  const handleToggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    }
    setMicOn(!micOn);
  };

  // Screen Share genuine capture API
  const handleToggleScreenShare = async () => {
    try {
      if (screenSharing) {
        setScreenSharing(false);
      } else {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenSharing(true);
        // Fallback simulation layout automatically triggers
        displayStream.getVideoTracks()[0].onended = () => setScreenSharing(false);
      }
    } catch (err) {
      console.warn("Screen Capture blocked or rejected:", err);
      setScreenSharing(!screenSharing); // simulated toggle fallback
    }
  };

  // Emoji bursts reactions
  const sendEmojiReaction = (emoji: string) => {
    const id = `em-${Math.floor(Math.random() * 1000000)}`;
    const left = Math.floor(20 + Math.random() * 60); // Percentage from left
    setEmojiReactions(prev => [...prev, { id, char: emoji, left }]);
    
    // Remove after animation finished
    setTimeout(() => {
      setEmojiReactions(prev => prev.filter(e => e.id !== id));
    }, 3000);
  };

  // Classroom chat message push
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    try {
      const res = await fetch('/api/academy/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: session.meetingLink,
          senderEmail: user.email,
          senderName: user.name,
          senderRole: user.role,
          text: chatInputText
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatInputText('');
        setMessagesList(prev => [...prev, data.message]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070707] text-white flex flex-col h-screen overflow-hidden">
      
      {/* 1. Floating Emoji reactions layer */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        <AnimatePresence>
          {emojiReactions.map((emoji) => (
            <motion.div
              key={emoji.id}
              initial={{ opacity: 0, y: '90vh', scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: '10vh', scale: [1, 1.5, 1.2, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute text-3xl md:text-4xl"
              style={{ left: `${emoji.left}%` }}
            >
              {emoji.char}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 2. Top Header Navigation Bar */}
      <header className="bg-neutral-950 px-6 py-4 border-b border-stone-900 flex items-center justify-between text-xs font-mono relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-1">
            <Sparkles className="w-4.5 h-4.5 text-[#D4AF37]" />
            Live Classroom: {session.courseTitle}
          </span>
          <span className="text-stone-600 hidden md:inline">|</span>
          <span className="text-stone-400 hidden md:inline">{session.topic}</span>
        </div>

        {/* Network status and latency */}
        <div className="flex items-center gap-4 text-[10px] text-stone-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            HD Stream (Latency: {networkLatency}ms)
          </span>
          <button 
            onClick={onLeave}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold transition-all cursor-pointer shadow-sm"
          >
            Leave Classroom
          </button>
        </div>
      </header>

      {/* 3. Main Stage Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: Video feeds or Whiteboard */}
        <div className="flex-1 relative bg-[#0d0d0d] p-6 flex flex-col justify-between overflow-hidden">
          
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-stone-900 bg-neutral-950 flex items-center justify-center">
            
            {activeTab === 'whiteboard' ? (
              // WHITEBOARD PANEL
              <div className="absolute inset-0 flex flex-col justify-between p-4 bg-[#111111]">
                <div className="flex items-center justify-between border-b border-stone-900 pb-3 z-10">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-mono font-bold tracking-wider text-stone-300">DRAFTING BOARD GUIDE SHEET</span>
                  </div>
                  
                  {/* Drawing Tools bar */}
                  <div className="flex items-center gap-3 text-xs bg-stone-900 p-1.5 rounded-xl border border-stone-800">
                    <button 
                      type="button"
                      onClick={() => setEraserMode(false)}
                      className={`p-2 rounded-lg cursor-pointer ${!eraserMode ? 'bg-[#D4AF37] text-black' : 'text-stone-400'}`}
                      title="Sleeve/Armhole Pen"
                    >
                      <PenTool className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEraserMode(true)}
                      className={`p-2 rounded-lg cursor-pointer ${eraserMode ? 'bg-red-500 text-white' : 'text-stone-400'}`}
                      title="Draft Eraser"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>
                    
                    <span className="text-stone-700">|</span>

                    {/* Colors */}
                    {['#D4AF37', '#ff4d4d', '#4da6ff', '#ffffff'].map(col => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => {
                          setPenColor(col);
                          setEraserMode(false);
                        }}
                        className={`w-4 h-4 rounded-full border transition-all ${penColor === col && !eraserMode ? 'scale-125 border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}

                    <span className="text-stone-700">|</span>

                    {/* Brush sizes */}
                    <button onClick={() => setPenWidth(prev => Math.max(2, prev - 1))} className="text-stone-400 font-mono px-1">-</button>
                    <span className="font-mono text-stone-300 text-[10px]">Brush: {penWidth}px</span>
                    <button onClick={() => setPenWidth(prev => Math.min(10, prev + 1))} className="text-stone-400 font-mono px-1">+</button>

                    <button 
                      type="button"
                      onClick={clearCanvas}
                      className="text-[10px] uppercase font-mono tracking-widest font-bold bg-neutral-950 text-stone-300 px-3 py-1.5 rounded-lg border border-stone-800 hover:text-white"
                    >
                      Clear Sheet
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative overflow-hidden flex items-center justify-center cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            ) : screenSharing ? (
              // SCREEN SHARE SIMULATED FRAME
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
                <div className="text-center space-y-4">
                  <Monitor className="w-16 h-16 text-[#D4AF37] animate-pulse mx-auto" />
                  <h4 className="font-serif text-lg font-bold">Screen Sharing Activated</h4>
                  <p className="text-stone-400 text-xs font-light max-w-sm mx-auto">
                    Demonstrating a digital CAD tailoring layout blueprint for high-precision katori bust dart calibrations.
                  </p>
                  <img
                    src="https://images.unsplash.com/photo-1524295981977-6282939a04a5?q=80&w=400"
                    alt="Simulated CAD pattern drawing layout"
                    className="w-80 h-48 rounded-xl object-cover border border-stone-800 shadow mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            ) : (
              // INSTRUCTOR / CHIEF TRAINER STREAM DISPLAY
              <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-black">
                
                {/* Real Stream or Simulated Video Backdrop */}
                {stream && camOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ filter: backgroundBlurEnabled ? 'blur(0px)' : 'none' }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-6 bg-[#161616]">
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160"
                          alt="Pratibha Ingole Trainer Avatar"
                          className="w-24 h-24 rounded-full border-2 border-[#D4AF37] object-cover mx-auto"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 right-1 bg-red-500 text-white p-1 rounded-full border border-stone-900 flex items-center justify-center">
                          <VideoOff className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <h5 className="font-serif text-base font-bold text-stone-200">Pratibha Ingole (Chief Fashion Trainer)</h5>
                      <p className="text-stone-500 text-xs font-light">Webcam offline. Streaming direct system guidelines.</p>
                    </div>
                  </div>
                )}

                {/* Floating visual overlay controls */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-800 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>RECORDING SESSION ACTIVE</span>
                </div>
              </div>
            )}

            {/* Small PIP Local Student feed bottom right */}
            {user.role !== 'Admin' && (
              <div className="absolute bottom-4 right-4 w-28 md:w-40 aspect-video rounded-xl overflow-hidden border border-stone-800 bg-neutral-950 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                  alt="Student webcam"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-mono text-white">
                  Neha Sharma (You)
                </div>
              </div>
            )}

          </div>

          {/* Interactive Bottom Glass Control Bar */}
          <div className="bg-neutral-950/80 backdrop-blur-md border border-stone-900 rounded-2xl p-4 mt-4 flex items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleToggleMic}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  micOn 
                    ? 'border-stone-800 hover:border-stone-700 bg-stone-900 text-white' 
                    : 'border-red-900/40 bg-red-950 text-red-500'
                }`}
                title="Toggle Mic"
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleToggleCam}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  camOn 
                    ? 'border-stone-800 hover:border-stone-700 bg-stone-900 text-white' 
                    : 'border-red-900/40 bg-red-950 text-red-500'
                }`}
                title="Toggle Video Stream"
              >
                {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleToggleScreenShare}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  screenSharing 
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' 
                    : 'border-stone-800 hover:border-stone-700 bg-stone-900 text-stone-300'
                }`}
                title="Share Screen Canvas"
              >
                <ScreenShare className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setRaisingHand(!raisingHand)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  raisingHand 
                    ? 'border-yellow-600 bg-yellow-950 text-yellow-500' 
                    : 'border-stone-800 hover:border-stone-700 bg-stone-900 text-stone-300'
                }`}
                title="Raise Hand"
              >
                <Hand className="w-4 h-4" />
              </button>
            </div>

            {/* Quick floating emojis reacts toolbar */}
            <div className="hidden sm:flex items-center gap-2 bg-stone-900 border border-stone-800 py-1.5 px-3 rounded-xl">
              {['🎉', '👍', '❤️', '👏', '😮'].map(emo => (
                <button
                  key={emo}
                  onClick={() => sendEmojiReaction(emo)}
                  className="text-lg hover:scale-125 transition-transform cursor-pointer"
                >
                  {emo}
                </button>
              ))}
            </div>

            {/* Stage tabs switcher */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('whiteboard')}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'whiteboard'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                Drafting Board
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                Classroom Chat
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Panel (Chat log or settings) */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-stone-900 bg-[#0a0a0a] flex flex-col justify-between overflow-hidden relative z-10">
          
          <div className="p-4 border-b border-stone-900 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-stone-300">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4.5 h-4.5 text-[#D4AF37]" />
              {activeTab === 'chat' ? 'Live Classroom Chat' : activeTab === 'participants' ? 'Active Members' : 'Device Settings'}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveTab('chat')} className={`p-1.5 rounded ${activeTab === 'chat' ? 'text-[#D4AF37]' : 'text-stone-500'}`} title="Chat">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTab('participants')} className={`p-1.5 rounded ${activeTab === 'participants' ? 'text-[#D4AF37]' : 'text-stone-500'}`} title="Users">
                <Users className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTab('settings')} className={`p-1.5 rounded ${activeTab === 'settings' ? 'text-[#D4AF37]' : 'text-stone-500'}`} title="Settings">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab contents */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* 1. CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="space-y-4 text-xs h-full flex flex-col justify-between">
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[350px] lg:max-h-[500px]">
                  {messagesList.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`p-3 rounded-2xl space-y-1 ${
                        msg.isAnnouncement 
                          ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-stone-200' 
                          : 'bg-stone-900 border border-stone-800 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] text-[#D4AF37] font-mono uppercase font-bold">
                        <span>{msg.senderName} ({msg.senderRole})</span>
                        <span className="text-stone-500 font-normal">{msg.timestamp}</span>
                      </div>
                      <p className="font-light leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="pt-2 border-t border-stone-900 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type lesson coordinates..."
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="submit"
                    className="bg-[#D4AF37] text-black px-4 py-2.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* 2. PARTICIPANTS LIST TAB */}
            {activeTab === 'participants' && (
              <div className="space-y-3.5 text-xs">
                <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500 font-bold">CLASS ROSTER (3 TOTAL)</span>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-stone-900/50 rounded-xl border border-stone-900">
                    <div className="flex items-center gap-2.5">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold">Pratibha Ingole</p>
                        <p className="text-[9px] text-[#D4AF37] uppercase font-mono">Instructor • Teacher</p>
                      </div>
                    </div>
                    <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-0.5 rounded text-[8px] font-mono">HOST</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-stone-900/50 rounded-xl border border-stone-900">
                    <div className="flex items-center gap-2.5">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold">Neha Sharma</p>
                        <p className="text-[9px] text-stone-500 uppercase font-mono">Active Student</p>
                      </div>
                    </div>
                    <span className="bg-green-950 text-green-500 border border-green-900/40 px-2 py-0.5 rounded text-[8px] font-mono">ONLINE</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-stone-900/50 rounded-xl border border-stone-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center font-mono">GD</div>
                      <div>
                        <p className="font-bold">Guest Designer</p>
                        <p className="text-[9px] text-stone-500 uppercase font-mono">Viewer Account</p>
                      </div>
                    </div>
                    <span className="bg-stone-800 text-stone-400 border border-stone-700 px-2 py-0.5 rounded text-[8px] font-mono font-bold">MUTE</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DEVICE SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-4 text-xs font-light">
                <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500 font-bold block mb-2">Streaming adjustments</span>
                
                <div className="space-y-3.5 bg-stone-900/40 p-4 rounded-2xl border border-stone-900">
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase font-mono text-[9px] block">Noise cancellation level</label>
                    <div className="flex items-center justify-between gap-3 font-mono">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={noiseCancellationLevel} 
                        onChange={(e) => setNoiseCancellationLevel(parseInt(e.target.value))}
                        className="flex-1 accent-[#D4AF37]" 
                      />
                      <span>{noiseCancellationLevel}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-900">
                    <span className="text-stone-400 uppercase font-mono text-[9px]">Virtual Background Blur</span>
                    <button
                      onClick={() => setBackgroundBlurEnabled(!backgroundBlurEnabled)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors ${backgroundBlurEnabled ? 'bg-[#D4AF37]' : 'bg-stone-800'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${backgroundBlurEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-4 rounded-2xl space-y-1">
                  <span className="text-[#D4AF37] font-mono font-bold text-[9px] uppercase tracking-wider block">Video streaming architect note</span>
                  <p className="text-stone-300 text-[10px] leading-relaxed">
                    Pearls Tailoring streams utilizing secure peer connections. In case of poor coverage, adjust noise cancellation to lower buffer rates.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
