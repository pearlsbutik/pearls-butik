import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://pearls-butik.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Initialize Gemini SDK
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn(
    "GEMINI_API_KEY is not defined. AI Stylist features will run with fallback recommendations."
  );
}

// Memory database for demo persistence
const appointments: any[] = [];
const subscribers: string[] = [];

// ==========================================
// TAILORING ACADEMY STATE DATABASES & SEED
// ==========================================

let academyUsers = [
  { id: 'u1', email: 'teacher@pearls.com', name: 'Pratibha Ingole (Owner)', role: 'Admin' as const, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120', phone: '9123456789', whatsapp: '9123456789', city: 'Parbhani', state: 'Maharashtra', studentId: 'PE-ADMIN-01', active: true, batch: 'All Batches' },
  { id: 'u2', email: 'student@pearls.com', name: 'Neha Sharma', role: 'Student' as const, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120', phone: '9876543210', whatsapp: '9876543210', city: 'Parbhani', state: 'Maharashtra', studentId: 'PE-2026-0001', active: true, batch: 'Designer Suite Batch A' },
  { id: 'u3', email: 'guest@pearls.com', name: 'Guest Designer', role: 'Guest' as const, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120', phone: '9999999999', whatsapp: '9999999999', city: 'Mumbai', state: 'Maharashtra', studentId: 'PE-GUEST-01', active: true, batch: 'Guest Batch' }
];

let academySubscriptions = [
  { id: 'sub-1', userId: 'u2', courseId: 'c1', status: 'Active', purchasedAt: '2026-06-15', expiresAt: '2026-12-15' }
];

let upiPayments = [
  {
    id: 'pay-1',
    utrNumber: '928374839210',
    amount: 5000,
    status: 'Approved',
    fullName: 'Neha Sharma',
    phone: '9876543210',
    whatsapp: '9876543210',
    city: 'Parbhani',
    state: 'Maharashtra',
    courseId: 'c1',
    courseTitle: 'Basic Dress Designing Course',
    paymentDate: '2026-06-15',
    screenshotUrl: ''
  }
];

let otpCodes: any[] = [];

let loginHistory = [
  { id: 'log-1', phone: '9876543210', fullName: 'Neha Sharma', timestamp: '2026-07-03 08:32 AM', status: 'Success', ip: '192.168.1.45' },
  { id: 'log-2', phone: '9123456789', fullName: 'Admin (Pratibha)', timestamp: '2026-07-03 08:55 AM', status: 'Success', ip: '192.168.1.1' }
];

let whatsappLogs = [
  { id: 'wal-1', phone: '9876543210', messageType: 'OTP_CODE', text: 'Welcome to Pearls Academy! Your verification code is 483921. This OTP is valid for 10 minutes. Do not share it with anyone.', status: 'delivered', timestamp: '2026-07-03 08:32 AM' },
  { id: 'wal-2', phone: '9876543210', messageType: 'WELCOME', text: 'Dear Neha Sharma, welcome to Pearls Academy! Your enrollment is confirmed.', status: 'delivered', timestamp: '2026-07-03 08:33 AM' }
];

let academyCourses = [
  {
    id: 'c1',
    title: 'Basic Dress Designing Course',
    category: 'Salwars & Kurtis',
    price: 5000,
    level: 'Beginner',
    duration: '2 Months',
    image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=600',
    skills: ['Machine handling', 'Body measurements', 'Direct cutting', 'Seam finishings'],
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Machine Operations & Drafting Principles',
        lessons: [
          { id: 'l1', title: 'Lesson 1.1: Sewing Machine Maintenance & Sewing Care', duration: '22 mins', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: 'Lesson 1.2: Accurate Body Measurements & Ease Calculative Math', duration: '35 mins', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      },
      {
        id: 'm2',
        title: 'Module 2: Direct Cutting & Stitching Practices',
        lessons: [
          { id: 'l3', title: 'Lesson 2.1: Simple Kurti Drafting on Craft Paper & Fabric Fold', duration: '40 mins', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l4', title: 'Lesson 2.2: Necklines Piping, Inner Lining & Edge Seaming', duration: '30 mins', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ]
  },
  {
    id: 'c2',
    title: 'Advanced Dress Designing Course',
    category: 'Bridal & Gowns',
    price: 10000,
    level: 'Intermediate to Pro',
    duration: '3 Months',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600',
    skills: ['Heavy drapes drafting', 'Cowl necks stitching', 'Indo-western styling', 'Premium lining attachments'],
    modules: [
      {
        id: 'm3',
        title: 'Module 1: Kalidaar & Anarkali Mastery',
        lessons: [
          { id: 'l5', title: 'Lesson 1.1: Drafting Math Behind Perfect Kalis & Flare Volumes', duration: '45 mins', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l6', title: 'Lesson 1.2: Modern Collar Designing & Cowl Draping', duration: '38 mins', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ]
  },
  {
    id: 'c3',
    title: 'Blouse Designing Special Course',
    category: 'Sarees & Lehengas',
    price: 3500,
    level: 'Specialization',
    duration: '1.5 Months',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600',
    skills: ['Katori cut drafting', 'Princess line construction', 'Padded blouse structuring', 'Deep neck support detailing'],
    modules: [
      {
        id: 'm4',
        title: 'Module 1: Blouse Architectural Engineering',
        lessons: [
          { id: 'l7', title: 'Lesson 1.1: Double Katori Pattern Cut Blueprint', duration: '50 mins', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l8', title: 'Lesson 1.2: Princess Line Formulation & Cups Padding Fitting', duration: '42 mins', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ]
      }
    ]
  }
];

let liveClasses = [
  {
    id: 'lc1',
    courseTitle: 'Blouse Designing Special Course',
    topic: 'Princess Cut & Cups Padding Blueprint',
    date: new Date().toISOString().split('T')[0], // Today
    time: '11:00 AM',
    duration: '1 Hour',
    maxStudents: 15,
    instructor: 'Pratibha Ingole',
    status: 'scheduled',
    meetingLink: 'princess-cut-303'
  },
  {
    id: 'lc2',
    courseTitle: 'Advanced Dress Designing Course',
    topic: 'Anarkali Flare Volumetric Measurements',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '04:00 PM',
    duration: '1.5 Hours',
    maxStudents: 20,
    instructor: 'Pratibha Ingole',
    status: 'scheduled',
    meetingLink: 'anarkali-flare-404'
  }
];

let enrollments = [
  {
    id: 'e1',
    userEmail: 'student@pearls.com',
    courseId: 'c1',
    courseTitle: 'Basic Dress Designing Course',
    progress: 50,
    enrolledAt: '2026-06-15',
    completedLessons: ['l1', 'l2'],
    hasCertificate: false,
    invoiceId: 'INV-2026-0091',
    amountPaid: 5000
  }
];

let assignments = [
  {
    id: 'a1',
    courseId: 'c1',
    courseTitle: 'Basic Dress Designing Course',
    title: 'Sewing Straight Seams and Locking Treads',
    description: 'Draft and sew 5 parallel straight seams on standard cotton fabric. Secure the ends with locking stitches. Upload a clear photograph showing seam details and ruler scaling.',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // 2 days later
    points: 100
  },
  {
    id: 'a2',
    courseId: 'c3',
    courseTitle: 'Blouse Designing Special Course',
    title: 'Paper Blueprint for 32-Size Princess Cut',
    description: 'Draft the front panel and side panels of a 32-size princess blouse on brown craft paper. Annotate exact cup-shape calculations and armhole dart guidelines. Upload PDF scan.',
    dueDate: new Date(Date.now() + 345600000).toISOString().split('T')[0], // 4 days later
    points: 100
  }
];

let submissions = [
  {
    id: 's1',
    assignmentId: 'a1',
    assignmentTitle: 'Sewing Straight Seams and Locking Treads',
    courseTitle: 'Basic Dress Designing Course',
    userEmail: 'student@pearls.com',
    userName: 'Neha Sharma',
    fileUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
    fileName: 'straight_seams_neha.jpg',
    submittedAt: '2026-06-28',
    marks: undefined,
    feedback: undefined,
    status: 'submitted'
  }
];

let messages = [
  { id: 'm1', channel: 'support', senderEmail: 'teacher@pearls.com', senderName: 'Pratibha Ingole', senderRole: 'Admin', text: 'Hello, welcome to Pearls Tailoring Academy Support. How can I help you design today?', timestamp: '08:00 AM' },
  { id: 'm2', channel: 'princess-cut-303', senderEmail: 'teacher@pearls.com', senderName: 'Pratibha Ingole', senderRole: 'Admin', text: 'Welcome to the Princess Cut Live Workshop. Make sure you have your pattern scissors, brown drafting paper, and a standard curves ruler ready!', timestamp: '10:55 AM', isAnnouncement: true }
];

let academyNotes = [
  { id: 'n1', courseTitle: 'Basic Dress Designing Course', title: 'Standard Sewing Machine Maintenance Manual', type: 'PDF', downloadUrl: '#', size: '1.4 MB' },
  { id: 'n2', courseTitle: 'Basic Dress Designing Course', title: 'Body Measurement Calculation Chart Sheet', type: 'PDF', downloadUrl: '#', size: '840 KB' },
  { id: 'n3', courseTitle: 'Blouse Designing Special Course', title: 'Double Katori Layout Draft Printable Pattern', type: 'ZIP', downloadUrl: '#', size: '4.2 MB' }
];

let notifications = [
  { id: 'nt1', userEmail: 'student@pearls.com', title: 'Admission Confirmed', text: 'Congratulations! Your enrollment in Basic Dress Designing is confirmed. Invoice is ready.', date: 'June 15, 2026', read: false },
  { id: 'nt2', userEmail: 'student@pearls.com', title: 'New Live Class Scheduled', text: 'Pratibha Ingole has scheduled: Princess Cut & Cups Padding Blueprint for today!', date: 'Today', read: false }
];

let attendanceLogs = [
  { id: 'at1', userEmail: 'student@pearls.com', courseTitle: 'Basic Dress Designing Course', topic: 'Sewing Machine Handling', status: 'Present', date: '2026-06-18' },
  { id: 'at2', userEmail: 'student@pearls.com', courseTitle: 'Basic Dress Designing Course', topic: 'Body Drafting Calculations', status: 'Present', date: '2026-06-25' }
];

// ==========================================
// ACADEMY API ENDPOINTS
// ==========================================

// 1. Get Global Academy State
app.get("/api/academy/state", (req, res) => {
  const email = req.query.email as string || 'student@pearls.com';
  
  // Find current user profile
  const user = academyUsers.find(u => u.email === email) || academyUsers[1];
  
  // Filter records based on user context
  const myEnrollments = enrollments.filter(e => e.userEmail === user.email);
  const mySubmissions = submissions.filter(s => s.userEmail === user.email);
  const myNotifications = notifications.filter(n => n.userEmail === user.email);
  const myAttendance = attendanceLogs.filter(a => a.userEmail === user.email);
  const mySubscriptions = academySubscriptions.filter(s => s.userId === user.id);
  
  // Support and Chat
  const chatSupport = messages.filter(m => m.channel === 'support');

  res.json({
    user,
    courses: academyCourses,
    liveClasses,
    enrollments: myEnrollments,
    assignments,
    submissions: (user.role as string) === 'Admin' || (user.role as string) === 'Teacher' ? submissions : mySubmissions,
    notifications: myNotifications,
    attendance: myAttendance,
    notes: academyNotes,
    chatSupport,
    allUsers: academyUsers,
    subscriptions: mySubscriptions,
    allSubscriptions: academySubscriptions,
    upiPayments,
    loginHistory,
    whatsappLogs
  });
});

// 2. Simple Role Swap/Auth API
app.post("/api/academy/auth", (req, res) => {
  const { email } = req.body;
  const user = academyUsers.find(u => u.email === email);
  if (!user) {
    // Register new student
    const newUser = {
      id: `u-${Math.floor(1000 + Math.random() * 9000)}`,
      email,
      name: email.split('@')[0].toUpperCase(),
      role: 'Student' as const,
      joinedAt: new Date().toLocaleDateString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      phone: '',
      whatsapp: '',
      city: '',
      state: '',
      studentId: `PE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      active: true,
      batch: 'Morning Batch (10 AM)'
    };
    academyUsers.push(newUser);
    // Auto add custom welcome notification
    notifications.unshift({
      id: `nt-${Math.floor(Math.random() * 10000)}`,
      userEmail: email,
      title: 'Welcome to Pearls Academy',
      text: 'Explore our catalog of courses. Click "Enroll" or simulate a checkout to start.',
      date: 'Just now',
      read: false
    });
    return res.json({ success: true, user: newUser });
  }
  res.json({ success: true, user });
});

// 3. Class Scheduling
app.post("/api/academy/classes/create", (req, res) => {
  const { courseTitle, topic, date, time, duration, maxStudents } = req.body;
  if (!courseTitle || !topic || !date) {
    return res.status(400).json({ error: "Missing required parameters." });
  }
  
  const id = `lc-${Math.floor(1000 + Math.random() * 9000)}`;
  const meetingLink = `room-${id}`;
  const newClass = {
    id,
    courseTitle,
    topic,
    date,
    time: time || '12:00 PM',
    duration: duration || '1 Hour',
    maxStudents: parseInt(maxStudents) || 12,
    instructor: 'Pratibha Ingole',
    status: 'scheduled' as const,
    meetingLink
  };
  
  liveClasses.unshift(newClass);

  // Notify students enrolled in this course
  const course = academyCourses.find(c => c.title === courseTitle);
  if (course) {
    enrollments.forEach(enr => {
      if (enr.courseTitle === courseTitle) {
        notifications.unshift({
          id: `nt-${Math.floor(Math.random() * 10000)}`,
          userEmail: enr.userEmail,
          title: 'New Live Session Scheduled',
          text: `A new session on "${topic}" has been scheduled for ${date} at ${time}.`,
          date: 'Just now',
          read: false
        });
      }
    });
  }

  res.json({ success: true, liveClass: newClass });
});

// 4. Class actions (Start, Join, End)
app.post("/api/academy/classes/action", (req, res) => {
  const { classId, action, email, userName } = req.body;
  const targetClass = liveClasses.find(c => c.id === classId);
  if (!targetClass) {
    return res.status(404).json({ error: "Class session not found." });
  }

  if (action === 'start') {
    targetClass.status = 'live';
    // Add introductory message
    messages.push({
      id: `m-${Math.floor(Math.random() * 100000)}`,
      channel: targetClass.meetingLink,
      senderEmail: 'teacher@pearls.com',
      senderName: 'Pratibha Ingole',
      senderRole: 'Admin',
      text: `Live classroom is now ACTIVE! Let's draft "${targetClass.topic}" together.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAnnouncement: true
    });
  } else if (action === 'end') {
    targetClass.status = 'ended';
  } else if (action === 'join' && email) {
    // Record Attendance automatically
    const alreadyAttended = attendanceLogs.some(
      a => a.userEmail === email && a.topic === targetClass.topic
    );
    if (!alreadyAttended) {
      attendanceLogs.push({
        id: `at-${Math.floor(Math.random() * 10000)}`,
        userEmail: email,
        courseTitle: targetClass.courseTitle,
        topic: targetClass.topic,
        status: 'Present',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }

  res.json({ success: true, liveClass: targetClass });
});

// 5. Course Catalog and Enrollment Checkout (Stripe/Razorpay Simulator)
app.post("/api/academy/courses/enroll", (req, res) => {
  const { courseId, email, price, billingName, payMethod } = req.body;
  const course = academyCourses.find(c => c.id === courseId);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  // Check if already enrolled
  const existing = enrollments.find(e => e.userEmail === email && e.courseId === courseId);
  if (existing) {
    return res.json({ success: true, enrollment: existing, message: "Already enrolled!" });
  }

  const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const newEnrollment = {
    id: `e-${Math.floor(1000 + Math.random() * 9000)}`,
    userEmail: email,
    courseId: course.id,
    courseTitle: course.title,
    progress: 0,
    enrolledAt: new Date().toISOString().split('T')[0],
    completedLessons: [],
    hasCertificate: false,
    invoiceId,
    amountPaid: price || course.price
  };

  enrollments.push(newEnrollment);

  // Add notification
  notifications.unshift({
    id: `nt-${Math.floor(Math.random() * 10000)}`,
    userEmail: email,
    title: 'Admission Completed Successfully',
    text: `Welcome! You are now enrolled in the ${course.title}. Invoice: ${invoiceId}.`,
    date: 'Just now',
    read: false
  });

  res.json({
    success: true,
    enrollment: newEnrollment,
    invoice: {
      invoiceId,
      courseTitle: course.title,
      price: course.price,
      billingName: billingName || email.split('@')[0],
      date: new Date().toLocaleDateString(),
      payMethod: payMethod || 'Stripe / Cards'
    }
  });
});

// 6. Complete Lesson / Course Progress
app.post("/api/academy/courses/lesson-complete", (req, res) => {
  const { courseId, lessonId, email } = req.body;
  const enrollment = enrollments.find(e => e.userEmail === email && e.courseId === courseId);
  if (!enrollment) {
    return res.status(404).json({ error: "No active enrollment found." });
  }

  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
  }

  // Calculate total lessons in this course
  const course = academyCourses.find(c => c.id === courseId);
  const totalLessons = course ? course.modules.reduce((acc, m) => acc + m.lessons.length, 0) : 4;
  enrollment.progress = Math.min(100, Math.round((enrollment.completedLessons.length / totalLessons) * 100));

  if (enrollment.progress === 100 && !enrollment.hasCertificate) {
    enrollment.hasCertificate = true;
    notifications.unshift({
      id: `nt-${Math.floor(Math.random() * 10000)}`,
      userEmail: email,
      title: 'Course Certificate Ready!',
      text: `Congratulations! You have completed all lessons in ${course?.title}. Download your printable Certificate now.`,
      date: 'Just now',
      read: false
    });
  }

  res.json({ success: true, enrollment });
});

// 7. Assignment Submissions (Homework desk)
app.post("/api/academy/assignments/submit", (req, res) => {
  const { assignmentId, userEmail, userName, textDetails, fileName } = req.body;
  const assignment = assignments.find(a => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ error: "Assignment details not found." });
  }

  const id = `s-${Math.floor(1000 + Math.random() * 9000)}`;
  const newSubmission = {
    id,
    assignmentId,
    assignmentTitle: assignment.title,
    courseTitle: assignment.courseTitle,
    userEmail,
    userName: userName || 'Student',
    fileUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
    fileName: fileName || 'pattern_layout.pdf',
    submittedAt: new Date().toISOString().split('T')[0],
    marks: undefined,
    feedback: undefined,
    status: 'submitted' as const
  };

  submissions.push(newSubmission);

  res.json({ success: true, submission: newSubmission });
});

// 8. Grade Submissions (Admin action)
app.post("/api/academy/assignments/grade", (req, res) => {
  const { submissionId, marks, feedback } = req.body;
  const sub = submissions.find(s => s.id === submissionId);
  if (!sub) {
    return res.status(404).json({ error: "Submission not found." });
  }

  sub.marks = parseInt(marks);
  sub.feedback = feedback || "Excellent effort!";
  sub.status = 'graded';

  // Notify student
  notifications.unshift({
    id: `nt-${Math.floor(Math.random() * 10000)}`,
    userEmail: sub.userEmail,
    title: 'Assignment Graded',
    text: `Your submission for "${sub.assignmentTitle}" is graded! Score: ${marks}/100.`,
    date: 'Just now',
    read: false
  });

  res.json({ success: true, submission: sub });
});

// 9. Classroom & Support Real-time chat
app.get("/api/academy/chat", (req, res) => {
  const { channel } = req.query;
  const filtered = messages.filter(m => m.channel === channel);
  res.json(filtered);
});

app.post("/api/academy/chat/send", (req, res) => {
  const { channel, senderEmail, senderName, senderRole, text } = req.body;
  if (!channel || !text) {
    return res.status(400).json({ error: "Missing channel or text" });
  }

  const newMsg = {
    id: `m-${Math.floor(Math.random() * 100000)}`,
    channel,
    senderEmail,
    senderName,
    senderRole,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  messages.push(newMsg);

  // AI interactive chatbot simulation on Support Channel
  if (channel === 'support' && senderRole !== 'Admin') {
    setTimeout(() => {
      let aiText = "Thank you for writing to Pearls Institute. Pratibha Ingole or our core trainer will reply to your query shortly. Feel free to join today's active live session on drafting princess cuts!";
      const query = text.toLowerCase();
      if (query.includes('fee') || query.includes('price') || query.includes('cost')) {
        aiText = "Our course fees are incredibly transparent: Basic Dress Designing is ₹5,000, Blouse Special is ₹3,500, and the Full Professional 6-Month course is ₹18,000. Installment plans are available too!";
      } else if (query.includes('stitching') || query.includes('blouse')) {
        aiText = "Yes, we stitch premium katori, padded, and princess blouses! You can book a direct designer consultation slot via our 'Boutique Stitching' estimates panel.";
      } else if (query.includes('certif') || query.includes('gov')) {
        aiText = "Yes! All courses have authorized certification under our official Parbhani syllabus structure. Certificates are instantly generated once you complete 100% of the lessons.";
      }
      messages.push({
        id: `m-${Math.floor(Math.random() * 100000)}`,
        channel: 'support',
        senderEmail: 'teacher@pearls.com',
        senderName: 'Pearls Butler (AI)',
        senderRole: 'Admin',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 1200);
  }

  res.json({ success: true, message: newMsg });
});

// 10. Record Class Session & Upload PDF patterns
app.post("/api/academy/classes/recording", (req, res) => {
  const { courseTitle, topic, videoUrl } = req.body;
  const course = academyCourses.find(c => c.title === courseTitle);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  // Generate new recorded lesson
  const newLessonId = `l-rec-${Math.floor(1000 + Math.random() * 9000)}`;
  const recordedLesson = {
    id: newLessonId,
    title: `Recorded Class: ${topic}`,
    duration: '1 Hour',
    videoUrl: videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'
  };

  // Push to first module or create one
  if (course.modules.length > 0) {
    course.modules[0].lessons.push(recordedLesson);
  } else {
    course.modules.push({
      id: `m-rec-${Math.floor(Math.random() * 1000)}`,
      title: 'Module: Live Session Recordings',
      lessons: [recordedLesson]
    });
  }

  res.json({ success: true, course });
});

// ==========================================
// WHATSAPP OTP & UPI PAYMENT VERIFICATION SYSTEM
// ==========================================

// Helper: Check OTP requests in last 15 minutes (max 3)
function checkOtpRateLimit(phone: string): boolean {
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const recentOtps = otpCodes.filter(o => o.phone === phone && o.createdAt > fifteenMinutesAgo);
  return recentOtps.length < 3;
}

// Endpoint: Send OTP (Login / Verify trigger)
app.post("/api/academy/auth/send-otp", (req, res) => {
  const { phone, isLogin } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Mobile phone number is required." });
  }

  // Rate Limiting check
  if (!checkOtpRateLimit(phone)) {
    return res.status(429).json({ error: "Too many OTP requests. Please wait 15 minutes." });
  }

  // Login existence check
  if (isLogin) {
    const user = academyUsers.find(u => u.phone === phone);
    if (!user) {
      return res.status(400).json({ error: "This mobile number is not registered yet. Please enroll first." });
    }
  }

  // Generate secure 6-digit OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store code
  const newOtp = {
    id: `otp-${Math.floor(Math.random() * 10000)}`,
    phone,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
    verified: false,
    createdAt: Date.now()
  };
  otpCodes.push(newOtp);

  // Send via simulated WhatsApp API service
  const waMessage = `Welcome to Pearls Academy!\nYour verification code is ${otp}.\nThis OTP is valid for 10 minutes. Do not share it with anyone.`;
  whatsappLogs.unshift({
    id: `wal-${Math.floor(Math.random() * 10000)}`,
    phone,
    messageType: 'OTP_CODE',
    text: waMessage,
    status: 'delivered',
    timestamp: new Date().toLocaleString()
  });

  res.json({
    success: true,
    message: "OTP sent successfully to WhatsApp.",
    simulatedOtp: otp // Delivered to client for testing convenience
  });
});

// Endpoint: Submit Manual UPI Payment & UTR Reference
app.post("/api/academy/payments/submit-utr", (req, res) => {
  const { 
    fullName, phone, whatsapp, city, state, 
    courseId, courseTitle, amount, utrNumber, paymentDate 
  } = req.body;

  if (!fullName || !phone || !courseId || !utrNumber) {
    return res.status(400).json({ error: "Full Name, Phone, Course, and UTR Number are strictly required." });
  }

  // Validate UTR: 12-22 numeric digits
  const utrClean = utrNumber.replace(/[^0-9]/g, '');
  if (utrClean.length < 12 || utrClean.length > 22 || utrClean !== utrNumber) {
    return res.status(400).json({ error: "UTR must be a numeric string between 12 and 22 digits long." });
  }

  // Prevent duplicate UTR submission
  const duplicate = upiPayments.find(p => p.utrNumber === utrNumber);
  if (duplicate) {
    return res.status(400).json({ error: "This UTR / Transaction Reference Number has already been submitted. Please enter a unique code." });
  }

  // Create payment record (Pending status)
  const newPayment = {
    id: `pay-${Math.floor(10000 + Math.random() * 90000)}`,
    utrNumber,
    amount: parseFloat(amount) || 5000,
    status: 'Pending',
    fullName,
    phone,
    whatsapp: whatsapp || phone,
    city: city || 'Parbhani',
    state: state || 'Maharashtra',
    courseId,
    courseTitle,
    paymentDate: paymentDate || new Date().toISOString().split('T')[0],
    screenshotUrl: ''
  };
  upiPayments.unshift(newPayment);

  // Generate secure 6-digit OTP code automatically for checkout verification
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpCodes.push({
    id: `otp-${Math.floor(Math.random() * 10000)}`,
    phone,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
    verified: false,
    createdAt: Date.now()
  });

  // Log WhatsApp
  whatsappLogs.unshift({
    id: `wal-${Math.floor(Math.random() * 10000)}`,
    phone,
    messageType: 'OTP_CODE',
    text: `Welcome to Pearls Academy!\nYour verification code is ${otp}.\nThis OTP is valid for 10 minutes. Do not share it with anyone.`,
    status: 'delivered',
    timestamp: new Date().toLocaleString()
  });

  res.json({
    success: true,
    message: "UPI Payment logged successfully as Pending. OTP sent.",
    simulatedOtp: otp
  });
});

// Endpoint: Verify OTP & Auto-Create Account
app.post("/api/academy/auth/verify-otp", (req, res) => {
  const { phone, otp, utrNumber } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP code are required." });
  }

  const record = otpCodes.find(o => o.phone === phone && !o.verified);
  if (!record) {
    return res.status(400).json({ error: "No active verification requests found for this number." });
  }

  // Expiration check
  if (Date.now() > record.expiresAt) {
    return res.status(400).json({ error: "OTP code has expired (10-minute limit). Please request a new one." });
  }

  // Attempt Limit check
  if (record.attempts >= 5) {
    return res.status(400).json({ error: "Maximum verification attempts (5) exceeded. This OTP is locked." });
  }

  if (record.otp !== otp) {
    record.attempts += 1;
    return res.status(400).json({ error: `Incorrect OTP. ${5 - record.attempts} attempts remaining.` });
  }

  // Verify successful
  record.verified = true;

  let activeUser = academyUsers.find(u => u.phone === phone);

  // If registering with a submitted payment UTR
  if (utrNumber) {
    const payment = upiPayments.find(p => p.utrNumber === utrNumber);
    if (payment) {
      if (!activeUser) {
        // Automatically create account
        const studentCount = academyUsers.filter(u => u.role === 'Student').length;
        const seq = String(studentCount + 1).padStart(4, '0');
        const studentId = `PE-2026-${seq}`;
        activeUser = {
          id: `u-${Math.floor(1000 + Math.random() * 9000)}`,
          email: `${phone}@pearlsacademy.com`,
          name: payment.fullName,
          role: 'Student',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
          phone,
          whatsapp: payment.whatsapp,
          city: payment.city,
          state: payment.state,
          studentId,
          active: true,
          batch: 'Designer Suite Batch A'
        };
        academyUsers.push(activeUser);
      }

      // Auto enroll
      const existingEnrollment = enrollments.find(e => e.userEmail === activeUser!.email && e.courseId === payment.courseId);
      if (!existingEnrollment) {
        enrollments.push({
          id: `e-${Math.floor(1000 + Math.random() * 9000)}`,
          userEmail: activeUser.email,
          courseId: payment.courseId,
          courseTitle: payment.courseTitle,
          progress: 0,
          enrolledAt: new Date().toISOString().split('T')[0],
          completedLessons: [],
          hasCertificate: false,
          invoiceId: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          amountPaid: payment.amount
        });
      }

      // Create subscription in Pending state
      const existingSub = academySubscriptions.find(s => s.userId === activeUser!.id && s.courseId === payment.courseId);
      if (!existingSub) {
        academySubscriptions.push({
          id: `sub-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: activeUser.id,
          courseId: payment.courseId,
          status: 'Pending', // pending admin manual approval
          purchasedAt: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 day validation
        });
      }

      // Add notification
      notifications.unshift({
        id: `nt-${Math.floor(Math.random() * 10000)}`,
        userEmail: activeUser.email,
        title: 'Payment Logged & Pending Verification',
        text: `Welcome, ${payment.fullName}! Your payment (UTR: ${utrNumber}) has been received. Our admin is verifying the transaction. Access will unlock shortly.`,
        date: 'Today',
        read: false
      });
    }
  }

  // Audit login history
  loginHistory.unshift({
    id: `log-${Math.floor(Math.random() * 10000)}`,
    phone,
    fullName: activeUser ? activeUser.name : 'Unknown User',
    timestamp: new Date().toLocaleString(),
    status: 'Success',
    ip: '192.168.1.' + Math.floor(2 + Math.random() * 254)
  });

  res.json({
    success: true,
    user: activeUser,
    message: "OTP successfully verified. Account is activated!"
  });
});

// Endpoint: Admin Approve/Reject Payments
app.post("/api/academy/admin/payments/action", (req, res) => {
  const { paymentId, action } = req.body;
  if (!paymentId || !action) {
    return res.status(400).json({ error: "Missing parameters." });
  }

  const payment = upiPayments.find(p => p.id === paymentId);
  if (!payment) {
    return res.status(404).json({ error: "Payment transaction not found." });
  }

  payment.status = action === 'approve' ? 'Approved' : 'Rejected';

  // Find user and their subscription to activate it
  const user = academyUsers.find(u => u.phone === payment.phone);
  if (user) {
    const sub = academySubscriptions.find(s => s.userId === user.id && s.courseId === payment.courseId);
    if (sub) {
      sub.status = action === 'approve' ? 'Active' : 'Expired';
    }

    if (action === 'approve') {
      notifications.unshift({
        id: `nt-${Math.floor(Math.random() * 10000)}`,
        userEmail: user.email,
        title: 'Subscription Active & Verified!',
        text: `Excellent news! Your payment (UTR: ${payment.utrNumber}) has been approved. All lectures, live sessions, and downloads are unlocked.`,
        date: 'Just now',
        read: false
      });

      // Send WhatsApp Notification
      whatsappLogs.unshift({
        id: `wal-${Math.floor(Math.random() * 10000)}`,
        phone: user.phone,
        messageType: 'WELCOME',
        text: `Dear ${user.name}, welcome to Pearls Academy! Your payment (UTR: ${payment.utrNumber}) has been approved. Your active subscription is now live. Join classes today!`,
        status: 'delivered',
        timestamp: new Date().toLocaleString()
      });
    }
  }

  res.json({ success: true, payment });
});

// Endpoint: Admin Student Management (Toggle Activate, Assign Batch, Assign Class)
app.post("/api/academy/admin/students/action", (req, res) => {
  const { userId, action, batchName, classTopic } = req.body;
  const user = academyUsers.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Student profile not found." });
  }

  if (action === 'toggle-active') {
    user.active = user.active !== false ? false : true;
  } else if (action === 'assign-batch' && batchName) {
    user.batch = batchName;
  }

  res.json({ success: true, user });
});

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// API: Book Appointment
app.post("/api/appointment", (req, res) => {
  const { name, email, phone, date, service, message } = req.body;
  if (!name || !phone || !service) {
    return res.status(400).json({ error: "Missing required fields: Name, Phone, Service are required." });
  }
  const id = `PB-${Math.floor(1000 + Math.random() * 9000)}`;
  const newAppointment = { id, name, email, phone, date, service, message, status: "Confirmed", createdAt: new Date() };
  appointments.push(newAppointment);
  res.json({ success: true, bookingId: id, appointment: newAppointment });
});

// API: Newsletter Signup
app.post("/api/newsletter", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }
  if (subscribers.includes(email)) {
    return res.json({ success: true, message: "You are already subscribed!", coupon: "PEARLS10" });
  }
  subscribers.push(email);
  res.json({ success: true, message: "Thank you for subscribing to Pearls Butik Journal!", coupon: "WELCOME15" });
});

// API: Gemini Fashion Stylist
app.post("/api/consultation", async (req, res) => {
  const { occasion, fabric, style, preference } = req.body;

  if (!occasion || !fabric || !style) {
    return res.status(400).json({ error: "Please specify occasion, fabric type, and style preference." });
  }

  // Fallback if AI is not configured
  if (!ai) {
    return res.json({
      concept: `${style} ${occasion} Custom Wear`,
      silhouette: `A custom-fit structured outfit designed specifically for a ${occasion} event, utilizing the natural drape of ${fabric}.`,
      necklineSleeves: "Classic elegant neckline with tailored sleeve lengths customized for comfort.",
      embellishments: "Subtle gold lace detailing, pearls, or delicate hand embroidery on the borders.",
      colorPalette: "Champagne Gold, Ivory White, and Royal Wine Red.",
      stylistTip: "Style this with statement gold earrings and minimal makeup to let the dress's custom stitching shine. - Pratibha Ingole",
      courseSuggestion: "Our 'Advanced Dress Designing Course' would teach you how to cut and construct this design pattern flawlessly."
    });
  }

  try {
    const prompt = `You are Pratibha Ingole, the chief fashion designer at Pearls Butik & Dress Designing Institute in Parbhani. 
    A client wants a custom design recommendation. 
    Occasion: ${occasion}
    Fabric: ${fabric}
    Style: ${style}
    Extra details: ${preference || "None"}

    Provide a bespoke luxury design sketch description. Return your response strictly in JSON format according to the schema below. Keep descriptions inspiring, using premium fashion designer terminology.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: {
              type: Type.STRING,
              description: "A gorgeous, poetic design name or concept title."
            },
            silhouette: {
              type: Type.STRING,
              description: "Detailed description of the outfit structure, cut, and fall."
            },
            necklineSleeves: {
              type: Type.STRING,
              description: "Elegant descriptions of neckline patterns and sleeve styling."
            },
            embellishments: {
              type: Type.STRING,
              description: "Recommended embroidery (zardozi, pearls, kundan, or fine thread-work)."
            },
            colorPalette: {
              type: Type.STRING,
              description: "Bespoke color combinations recommended for this outfit."
            },
            stylistTip: {
              type: Type.STRING,
              description: "A signature styling tip from Pratibha Ingole on how to carry this look."
            },
            courseSuggestion: {
              type: Type.STRING,
              description: "A specific Pearls Butik course suggestion that teaches how to create such a design, with a friendly invitation."
            }
          },
          required: ["concept", "silhouette", "necklineSleeves", "embellishments", "colorPalette", "stylistTip", "courseSuggestion"]
        }
      }
    });

    if (response && response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json(data);
    } else {
      throw new Error("Empty response from Gemini model.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.json({
      concept: `${style} ${occasion} Silhouette`,
      silhouette: `A beautifully sculpted customized outfit, masterfully draped to emphasize the premium ${fabric} texture.`,
      necklineSleeves: "V-neck or elegant sweetheart neckline, paired with delicate elbow-length sheer sleeves.",
      embellishments: "Delicate pearl beads aligned along the seams and beautiful zardozi or patch lace border.",
      colorPalette: "Warm Gold, Emerald Green, and Blush Pink.",
      stylistTip: "Add a gold clutch and heavy jhumkas to finalize this timeless boutique masterpiece. - Pratibha Ingole",
      courseSuggestion: "Enroll in our 'Blouse & Dress Pattern Making Course' to master the architectural secrets behind this exact silhouette."
    });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pearls Butik server running on port ${PORT}`);
  });
}

startServer();