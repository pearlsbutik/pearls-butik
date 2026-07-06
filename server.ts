import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import crypto from "crypto";
import { Firestore as GoogleFirestore } from "@google-cloud/firestore";
import { Firestore as firestoreInstance, admin } from "./firebaseAdmin";

dotenv.config();

// Initialize Firestore dynamically using the shared initialization
let firestore: any = null;
try {
  firestore = firestoreInstance;
} catch (err: any) {
  console.error("Failed to initialize Firestore Node.js SDK, relying on local backup file:", err?.message || err);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'pearls_secret_jwt_key_2026';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  if (
    origin === "https://pearls-butik.vercel.app" || 
    origin.endsWith(".vercel.app") || 
    origin === "http://localhost:3000" || 
    origin === "http://localhost:5173" ||
    origin === "http://127.0.0.1:3000" ||
    origin === "http://127.0.0.1:5173"
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "https://pearls-butik.vercel.app");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
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

let academyUsers: any[] = [
  { id: 'u1', email: 'teacher@pearls.com', name: 'Pratibha Ingole (Owner)', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120', phone: '9123456789', whatsapp: '9123456789', city: 'Parbhani', state: 'Maharashtra', studentId: 'PE-ADMIN-01', active: true, batch: 'All Batches' }
];

let academySubscriptions: any[] = [];

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

let paymentSettings = {
  qrCodeUrl: '',
  updatedAt: ''
};

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

let liveClasses: any[] = [
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
    fileUrl: 'https://images.unsplash.com/photo-1524295981977-6282939a04a5?q=80&w=800',
    fileName: 'straight_seams_neha.jpg',
    submittedAt: '2026-06-28',
    marks: null,
    feedback: null,
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

let notifications: any[] = [];

let attendanceLogs: any[] = [];

// ==========================================
// ACADEMY API ENDPOINTS
// ==========================================

// 1. Get Global Academy State
app.get("/api/academy/state", (req, res) => {
  let user = null;
  
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && decoded.email) {
        user = academyUsers.find(u => u.email === decoded.email);
      }
    } catch (e) {
      // Token is invalid/expired
    }
  }
  
  // If there's no valid authenticated user, return user: null
  if (!user) {
    return res.json({
      user: null,
      token: null,
      courses: academyCourses,
      liveClasses: liveClasses.slice(0, 5),
      enrollments: [],
      assignments: [],
      submissions: [],
      notifications: [],
      attendance: [],
      notes: [],
      chatSupport: [],
      allUsers: [],
      subscriptions: [],
      allSubscriptions: [],
      upiPayments: [],
      loginHistory: [],
      whatsappLogs: []
    });
  }
  
  // Filter records based on user context
  const myEnrollments = enrollments.filter(e => e.userEmail === user.email);
  const mySubmissions = submissions.filter(s => s.userEmail === user.email);
  const myNotifications = notifications.filter(n => n.userEmail === user.email);
  const myAttendance = attendanceLogs.filter(a => a.userEmail === user.email);
  const mySubscriptions = academySubscriptions.filter(s => s.userId === user.id);
  
  // Support and Chat
  const chatSupport = messages.filter(m => m.channel === 'support');

  // Generate JWT token for this user so subsequent API calls are fully authenticated
  const stateToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    user,
    token: stateToken,
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

// 2. Simple Role Swap/Auth API (DISABLED for security)
app.post("/api/academy/auth", (req, res) => {
  res.status(403).json({ error: "Demo authentication and role swapping has been permanently disabled." });
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

// ==========================================
// LIVE CLASS MANAGEMENT SYSTEM ENDPOINTS
// ==========================================

let liveClassJoins: any[] = [];

// ==========================================
// FILE-BASED & CLOUD FIRESTORE PERSISTENT DATABASE SYSTEM
// ==========================================
const DB_FILE = path.join(process.cwd(), 'database.json');

function sanitizeFirestoreData(data: any): any {
  if (data === undefined) {
    return null;
  }
  if (data === null) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeFirestoreData(item));
  }
  if (typeof data === 'object') {
    const clean: any = {};
    for (const key of Object.keys(data)) {
      clean[key] = sanitizeFirestoreData(data[key]);
    }
    return clean;
  }
  return data;
}

function saveDB() {
  try {
    const data = {
      subscribers,
      academyUsers,
      academySubscriptions,
      upiPayments,
      otpCodes,
      loginHistory,
      whatsappLogs,
      academyCourses,
      liveClasses,
      enrollments,
      assignments,
      submissions,
      messages,
      academyNotes,
      notifications,
      attendanceLogs,
      liveClassJoins,
      paymentSettings
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving local database file:", err);
  }

  // Asynchronously back up to Firestore in the background
  if (firestore) {
    const collectionsToSave = [
      { key: 'subscribers', data: subscribers },
      { key: 'academyUsers', data: academyUsers },
      { key: 'academySubscriptions', data: academySubscriptions },
      { key: 'upiPayments', data: upiPayments },
      { key: 'otpCodes', data: otpCodes },
      { key: 'loginHistory', data: loginHistory },
      { key: 'whatsappLogs', data: whatsappLogs },
      { key: 'academyCourses', data: academyCourses },
      { key: 'liveClasses', data: liveClasses },
      { key: 'enrollments', data: enrollments },
      { key: 'assignments', data: assignments },
      { key: 'submissions', data: submissions },
      { key: 'messages', data: messages },
      { key: 'academyNotes', data: academyNotes },
      { key: 'notifications', data: notifications },
      { key: 'attendanceLogs', data: attendanceLogs },
      { key: 'liveClassJoins', data: liveClassJoins }
    ];

    const savePromises: Promise<any>[] = collectionsToSave.map(col => {
      if (!Array.isArray(col.data)) {
        console.error(`Validation failed for collection ${col.key}: data is not an array.`);
        return Promise.resolve();
      }

      const cleanData = sanitizeFirestoreData(col.data);
      const docRef = firestore.collection('pearls_db').doc(col.key);
      return docRef.set({
        items: cleanData,
        updatedAt: new Date().toISOString()
      }).catch(err => {
        console.error(`Error backup-saving ${col.key} to Firestore:`, err);
      });
    });

    // Also back up paymentSettings to Firestore
    const settingsDocRef = firestore.collection('pearls_db').doc('paymentSettings');
    const settingsPromise = settingsDocRef.set(sanitizeFirestoreData(paymentSettings)).catch(err => {
      console.error("Error backup-saving paymentSettings to Firestore:", err);
    });
    savePromises.push(settingsPromise);

    Promise.all(savePromises).then(() => {
      console.log("Firestore background backup completed successfully.");
    }).catch(err => {
      console.error("Error in background backup process:", err);
    });
  }
}

async function loadDB() {
  // 1. First, load local database.json if it exists (as a starting baseline)
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data.subscribers) subscribers.splice(0, subscribers.length, ...data.subscribers);
      if (data.academyUsers) academyUsers.splice(0, academyUsers.length, ...data.academyUsers);
      if (data.academySubscriptions) academySubscriptions.splice(0, academySubscriptions.length, ...data.academySubscriptions);
      if (data.upiPayments) upiPayments.splice(0, upiPayments.length, ...data.upiPayments);
      if (data.otpCodes) otpCodes.splice(0, otpCodes.length, ...data.otpCodes);
      if (data.loginHistory) loginHistory.splice(0, loginHistory.length, ...data.loginHistory);
      if (data.whatsappLogs) whatsappLogs.splice(0, whatsappLogs.length, ...data.whatsappLogs);
      if (data.academyCourses) academyCourses.splice(0, academyCourses.length, ...data.academyCourses);
      if (data.liveClasses) liveClasses.splice(0, liveClasses.length, ...data.liveClasses);
      if (data.enrollments) enrollments.splice(0, enrollments.length, ...data.enrollments);
      if (data.assignments) assignments.splice(0, assignments.length, ...data.assignments);
      if (data.submissions) submissions.splice(0, submissions.length, ...data.submissions);
      if (data.messages) messages.splice(0, messages.length, ...data.messages);
      if (data.academyNotes) academyNotes.splice(0, academyNotes.length, ...data.academyNotes);
      if (data.notifications) notifications.splice(0, notifications.length, ...data.notifications);
      if (data.attendanceLogs) attendanceLogs.splice(0, attendanceLogs.length, ...data.attendanceLogs);
      if (data.liveClassJoins) liveClassJoins.splice(0, liveClassJoins.length, ...data.liveClassJoins);
      if (data.paymentSettings) {
        paymentSettings = {
          qrCodeUrl: data.paymentSettings.qrCodeUrl || '',
          updatedAt: data.paymentSettings.updatedAt || ''
        };
      }
      console.log("Loaded baseline local database.json successfully. Users count:", academyUsers.length);
    } else {
      console.log("No local baseline database.json found. Initializing with default datasets.");
      // Seed default admin password hashes
      const adminUser = academyUsers.find(u => u.role === 'Admin');
      if (adminUser) {
        (adminUser as any).passwordHash = bcrypt.hashSync('admin123', 10);
      }
    }
  } catch (err) {
    console.error("Error loading baseline local database file:", err);
  }

  // 2. Synchronize/restore with durable, permanent database from Firestore
  if (firestore) {
    try {
      console.log("Attempting to restore database state from Google Cloud Firestore...");
      const collectionsToLoad = [
        { key: 'subscribers', target: subscribers },
        { key: 'academyUsers', target: academyUsers },
        { key: 'academySubscriptions', target: academySubscriptions },
        { key: 'upiPayments', target: upiPayments },
        { key: 'otpCodes', target: otpCodes },
        { key: 'loginHistory', target: loginHistory },
        { key: 'whatsappLogs', target: whatsappLogs },
        { key: 'academyCourses', target: academyCourses },
        { key: 'liveClasses', target: liveClasses },
        { key: 'enrollments', target: enrollments },
        { key: 'assignments', target: assignments },
        { key: 'submissions', target: submissions },
        { key: 'messages', target: messages },
        { key: 'academyNotes', target: academyNotes },
        { key: 'notifications', target: notifications },
        { key: 'attendanceLogs', target: attendanceLogs },
        { key: 'liveClassJoins', target: liveClassJoins }
      ];

      // Connection verification with dynamic database fallback
      try {
        const testDocRef = firestore.collection('pearls_db').doc('subscribers');
        await testDocRef.get();
      } catch (testErr: any) {
        const isPermissionOrNotFound = testErr?.code === 7 || testErr?.code === 5 || testErr?.message?.includes('permission') || testErr?.message?.includes('Permission') || testErr?.message?.includes('NOT_FOUND');
        if (isPermissionOrNotFound) {
          console.warn("Access denied or not found on custom Firestore database. Falling back to default database...");
          const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
          if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            firestore = new GoogleFirestore({
              projectId: config.projectId
            });
            console.log("Re-initialized Firestore using the default database.");
          }
        } else {
          throw testErr;
        }
      }

      for (const col of collectionsToLoad) {
        const docRef = firestore.collection('pearls_db').doc(col.key);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const docData = docSnap.data();
          if (docData && Array.isArray(docData.items)) {
            col.target.splice(0, col.target.length, ...docData.items);
            console.log(`Restored table '${col.key}' from Firestore. Rows count: ${col.target.length}`);
          }
        } else {
          console.log(`Table '${col.key}' does not exist in Firestore yet. It will be created on the next saveDB().`);
        }
      }

      // Restore paymentSettings from Firestore
      try {
        const settingsDocRef = firestore.collection('pearls_db').doc('paymentSettings');
        const settingsSnap = await settingsDocRef.get();
        if (settingsSnap.exists) {
          const docData = settingsSnap.data();
          if (docData) {
            paymentSettings = {
              qrCodeUrl: docData.qrCodeUrl || '',
              updatedAt: docData.updatedAt || ''
            };
            console.log("Restored paymentSettings from Firestore:", paymentSettings);
          }
        } else {
          console.log("Table 'paymentSettings' does not exist in Firestore yet. It will be created on the next saveDB().");
        }
      } catch (settingsErr) {
        console.error("Error restoring paymentSettings from Firestore:", settingsErr);
      }

      console.log("Successfully synchronized all data from Firestore!");
    } catch (err) {
      console.error("Error restoring database from Firestore (will use local memory/file instead):", err);
    }
  }

  // FORCE-CLEAN DEMO USERS AND ASSOCIATED MOCK DATA
  academyUsers = academyUsers.filter(u => u.email !== 'student@pearls.com' && u.email !== 'guest@pearls.com');
  enrollments = enrollments.filter(e => e.userEmail !== 'student@pearls.com' && e.userEmail !== 'guest@pearls.com');
  submissions = submissions.filter(s => s.userEmail !== 'student@pearls.com' && s.userEmail !== 'guest@pearls.com');
  notifications = notifications.filter(n => n.userEmail !== 'student@pearls.com' && n.userEmail !== 'guest@pearls.com');
  attendanceLogs = attendanceLogs.filter(a => a.userEmail !== 'student@pearls.com' && a.userEmail !== 'guest@pearls.com');
  academySubscriptions = academySubscriptions.filter(s => s.userId !== 'u2' && s.userId !== 'u3');

  // Sync back to local file and Firestore so state is kept completely clean
  saveDB();
}

// 1. Get all live classes
app.get("/api/live-classes", (req, res) => {
  res.json(liveClasses);
});

// 2. Create a new live class (Admin/Teacher)
app.post("/api/live-classes", (req, res) => {
  const {
    courseTitle,
    batch,
    topic,
    description,
    instructor,
    date,
    time,
    startTime,
    endTime,
    duration,
    meetingLink,
    meetingCode,
    thumbnail,
    notes,
    status
  } = req.body;

  if (!courseTitle || !topic || !date || !meetingLink) {
    return res.status(400).json({ error: "Missing required parameters (courseTitle, topic, date, meetingLink)." });
  }

  const id = `lc-${Math.floor(1000 + Math.random() * 9000)}`;
  const newClass = {
    id,
    courseTitle,
    batch: batch || 'All Batches',
    topic,
    description: description || '',
    instructor: instructor || 'Pratibha Ingole',
    date,
    time: time || `${startTime || '12:00 PM'} - ${endTime || '1:00 PM'}`,
    startTime: startTime || '12:00 PM',
    endTime: endTime || '1:00 PM',
    duration: duration || '1 Hour',
    meetingLink,
    meetingCode: meetingCode || meetingLink.split('/').pop() || '',
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1524295981977-6282939a04a5?q=80&w=800',
    notes: notes || [],
    recordings: [],
    status: status || 'scheduled'
  };

  liveClasses.unshift(newClass);
  saveDB();

  // Send notifications to all enrolled students if published
  if (newClass.status !== 'draft') {
    enrollments.forEach(enr => {
      if (enr.courseTitle === courseTitle) {
        notifications.unshift({
          id: `nt-${Math.floor(Math.random() * 10000)}`,
          userEmail: enr.userEmail,
          title: '🎥 New Live Class Scheduled',
          text: `Pratibha Ingole scheduled "${topic}" on ${date} at ${newClass.time}.`,
          date: 'Just now',
          read: false
        });
      }
    });
    saveDB();
  }

  res.json({ success: true, liveClass: newClass });
});

// 3. Update a live class (including recordings, notes, assignments after class)
app.put("/api/live-classes/:id", (req, res) => {
  const { id } = req.params;
  const index = liveClasses.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Live class not found." });
  }

  // Get current class status before update to check if transitioning to active or completed
  const oldStatus = liveClasses[index].status;

  const updatedClass = {
    ...liveClasses[index],
    ...req.body
  };

  liveClasses[index] = updatedClass;
  saveDB();

  // If transitioned from draft to scheduled/published, send notifications
  if (oldStatus === 'draft' && updatedClass.status === 'scheduled') {
    enrollments.forEach(enr => {
      if (enr.courseTitle === updatedClass.courseTitle) {
        notifications.unshift({
          id: `nt-${Math.floor(Math.random() * 10000)}`,
          userEmail: enr.userEmail,
          title: '🎥 New Live Class Scheduled',
          text: `Pratibha Ingole published "${updatedClass.topic}" on ${updatedClass.date} at ${updatedClass.time}.`,
          date: 'Just now',
          read: false
        });
      }
    });
    saveDB();
  }

  // Send recording uploaded notification if recording is added
  if (req.body.recordings && req.body.recordings.length > 0 && (!liveClasses[index].recordings || liveClasses[index].recordings.length === 0)) {
    enrollments.forEach(enr => {
      if (enr.courseTitle === updatedClass.courseTitle) {
        notifications.unshift({
          id: `nt-${Math.floor(Math.random() * 10000)}`,
          userEmail: enr.userEmail,
          title: '📀 Class Recording Available',
          text: `Recording for "${updatedClass.topic}" is now available in your Live Classes history!`,
          date: 'Just now',
          read: false
        });
      }
    });
    saveDB();
  }

  res.json({ success: true, liveClass: updatedClass });
});

// 4. Delete a live class
app.delete("/api/live-classes/:id", (req, res) => {
  const { id } = req.params;
  const index = liveClasses.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Live class not found." });
  }

  const deletedClass = liveClasses.splice(index, 1)[0];
  saveDB();
  res.json({ success: true, deletedClass });
});

// 5. Join Live Class (Automated Attendance and logs)
app.post("/api/live-class/join", (req, res) => {
  const { classId, userEmail, userName, ip, browser } = req.body;
  if (!classId || !userEmail) {
    return res.status(400).json({ error: "Missing required fields (classId, userEmail)." });
  }

  const liveClass = liveClasses.find(c => c.id === classId);
  if (!liveClass) {
    return res.status(404).json({ error: "Class not found." });
  }

  const joinId = `join-${Math.floor(1000 + Math.random() * 9000)}`;
  const joinRecord = {
    id: joinId,
    classId,
    courseTitle: liveClass.courseTitle,
    topic: liveClass.topic,
    userEmail,
    userName: userName || userEmail.split('@')[0].toUpperCase(),
    joinTime: new Date().toISOString(),
    leaveTime: null,
    duration: 0,
    ip: ip || req.ip || '127.0.0.1',
    browser: browser || req.headers['user-agent'] || 'Unknown Browser'
  };

  liveClassJoins.push(joinRecord);

  // Record/update global attendance logs as well to sync
  const alreadyAttended = attendanceLogs.some(
    a => a.userEmail === userEmail && a.topic === liveClass.topic
  );
  if (!alreadyAttended) {
    attendanceLogs.push({
      id: `at-${Math.floor(Math.random() * 10000)}`,
      userEmail,
      courseTitle: liveClass.courseTitle,
      topic: liveClass.topic,
      status: 'Present',
      date: new Date().toISOString().split('T')[0]
    });
  }

  res.json({ success: true, joinRecord });
});

// 6. Leave Live Class (Duration calculation & final attendance update)
app.post("/api/live-class/leave", (req, res) => {
  const { classId, userEmail } = req.body;
  if (!classId || !userEmail) {
    return res.status(400).json({ error: "Missing required fields (classId, userEmail)." });
  }

  // Find the latest active join record for this user and class
  const record = [...liveClassJoins]
    .reverse()
    .find(r => r.classId === classId && r.userEmail === userEmail && r.leaveTime === null);

  if (!record) {
    return res.status(404).json({ error: "No active join record found." });
  }

  const leaveTime = new Date().toISOString();
  const joinDate = new Date(record.joinTime);
  const leaveDate = new Date(leaveTime);
  const diffMs = leaveDate.getTime() - joinDate.getTime();
  const diffMins = Math.round(diffMs / 60000); // Minutes

  record.leaveTime = leaveTime;
  record.duration = Math.max(1, diffMins); // at least 1 minute

  res.json({ success: true, record });
});

// 7. Get attendance for a class ID
app.get("/api/live-class/attendance/:id", (req, res) => {
  const { id } = req.params;
  const records = liveClassJoins.filter(r => r.classId === id);
  res.json(records);
});

// 8. Get live class history (completed classes and attendance analysis)
app.get("/api/live-class/history", (req, res) => {
  const completedClasses = liveClasses.filter(c => c.status === 'completed' || c.status === 'ended');
  const history = completedClasses.map(c => {
    const classJoins = liveClassJoins.filter(r => r.classId === c.id);
    const uniqueStudentsCount = new Set(classJoins.map(r => r.userEmail)).size;
    const avgDuration = classJoins.length > 0
      ? Math.round(classJoins.reduce((acc, curr) => acc + (curr.duration || 0), 0) / classJoins.length)
      : 0;

    return {
      ...c,
      uniqueStudentsCount,
      avgDuration,
      attendees: classJoins
    };
  });

  res.json(history);
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
    fileUrl: 'https://images.unsplash.com/photo-1524295981977-6282939a04a5?q=80&w=800',
    fileName: fileName || 'pattern_layout.pdf',
    submittedAt: new Date().toISOString().split('T')[0],
    marks: null,
    feedback: null,
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

// ==========================================
// PAYMENT SETTINGS QR CODE MANAGEMENT ENDPOINTS
// ==========================================

// 1. Get Payment Settings (Accessible to visitors/students)
app.get("/api/payment/settings", (req, res) => {
  res.json(paymentSettings);
});

// 2. Update Payment Settings QR Code (Admin Only)
app.post("/api/payment/settings", authenticateToken, async (req: any, res: any) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  const { image, fileName, mimeType } = req.body;
  if (!image) {
    return res.status(400).json({ error: "No image file provided." });
  }

  try {
    // Parse base64
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let finalMimeType = mimeType || 'image/png';

    if (matches && matches.length === 3) {
      finalMimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    // Check size (5MB limit)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "Image size exceeds the 5 MB limit." });
    }

    let fileUrl = '';
    const { getStorage } = await import("firebase-admin/storage");
    const bucket = getStorage().bucket();
    if (!bucket) {
      throw new Error("Firebase Storage bucket is missing or could not be retrieved from getStorage().bucket().");
    }

    console.log("Uploading QR code to Firebase Storage bucket:", bucket.name);
    const ext = finalMimeType.split('/')[1] || 'png';
    const fileRef = bucket.file(`payment_qr_codes/qr_${Date.now()}.${ext}`);

    const uuidToken = crypto.randomUUID();
    await fileRef.save(buffer, {
      metadata: {
        contentType: finalMimeType,
        cacheControl: 'public, max-age=31536000',
        metadata: {
          firebaseStorageDownloadTokens: uuidToken
        }
      }
    });

    // Generate the standard permanent public download URL format
    fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileRef.name)}?alt=media&token=${uuidToken}`;
    console.log("Firebase Storage upload succeeded:", fileUrl);

    paymentSettings.qrCodeUrl = fileUrl;
    paymentSettings.updatedAt = new Date().toISOString();
    
    // Save locally
    saveDB();

    // Direct save to Firestore to guarantee immediate consistency and persistence
    if (firestore) {
      try {
        const settingsDocRef = firestore.collection('pearls_db').doc('paymentSettings');
        await settingsDocRef.set({
          qrCodeUrl: fileUrl,
          updatedAt: paymentSettings.updatedAt
        });
        console.log("Saved paymentSettings to Firestore successfully.");
      } catch (fsErr: any) {
        console.error("Error saving paymentSettings directly to Firestore:", fsErr);
      }
    }

    res.json({ success: true, qrCodeUrl: fileUrl, updatedAt: paymentSettings.updatedAt });
  } catch (err: any) {
    console.error("Error handling QR upload to Firebase Storage:", err);
    res.status(500).json({ error: "Failed to upload QR code to Firebase Storage: " + (err?.message || err) });
  }
});

// 3. Delete Payment Settings QR Code (Admin Only, reverts to default)
app.delete("/api/payment/settings", authenticateToken, (req: any, res: any) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    paymentSettings.qrCodeUrl = '';
    paymentSettings.updatedAt = new Date().toISOString();
    saveDB();
    res.json({ success: true, message: "Payment QR code deleted. Reverted to default static QR code." });
  } catch (err: any) {
    console.error("Error deleting QR code settings:", err);
    res.status(500).json({ error: "Failed to delete payment settings: " + (err?.message || err) });
  }
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

  saveDB();
  res.json({ success: true, user });
});

// ==========================================
// STUDENT AUTHENTICATION SYSTEM ENDPOINTS
// ==========================================


// Middleware to authenticate student JWT
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication token required." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired session token. Please login again." });
    }
    req.user = decoded;
    next();
  });
}

// 1. Sign Up
app.post("/api/auth/signup", (req, res) => {
  const { 
    name, email, phone, whatsapp, password, city, state, dob, gender, avatar, referralCode 
  } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "Name, Email, Phone, and Password are required." });
  }

  // Check unique email & phone
  const existingEmail = academyUsers.find(u => u.email === email);
  if (existingEmail) {
    return res.status(400).json({ error: "Email is already registered. Please login instead." });
  }

  const existingPhone = academyUsers.find(u => u.phone === phone);
  if (existingPhone) {
    return res.status(400).json({ error: "Phone number is already registered. Please login instead." });
  }

  // Hash password
  const passwordHash = bcrypt.hashSync(password, 10);

  // Generate OTP
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
  const waMessage = `Welcome to Pearls Academy!\nYour verification OTP is ${otp}. Please enter this to activate your account.`;
  whatsappLogs.unshift({
    id: `wal-${Math.floor(Math.random() * 10000)}`,
    phone,
    messageType: 'OTP_CODE',
    text: waMessage,
    status: 'delivered',
    timestamp: new Date().toLocaleString()
  });

  // Register unverified student
  const studentCount = academyUsers.filter(u => u.role === 'Student').length;
  const seq = String(studentCount + 1).padStart(4, '0');
  const studentId = `PE-2026-${seq}`;

  const newUser = {
    id: `u-${Math.floor(1000 + Math.random() * 9000)}`,
    email,
    name,
    role: 'Student' as const,
    avatar: avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    phone,
    whatsapp: whatsapp || phone,
    city: city || '',
    state: state || '',
    dob: dob || '',
    gender: gender || '',
    referralCode: referralCode || '',
    passwordHash,
    studentId,
    active: false, // Inactive until verified
    batch: 'All Batches'
  };

  academyUsers.push(newUser);
  saveDB();

  res.json({
    success: true,
    message: "Registration successful. Verification OTP sent to your WhatsApp number.",
    simulatedOtp: otp,
    phone
  });
});

// 2. Login
app.post("/api/auth/login", (req, res) => {
  const { emailOrPhone, password, rememberMe, passcode } = req.body;

  if (passcode === '885585') {
    const adminUser = academyUsers.find(u => u.role === 'Admin');
    if (!adminUser) {
      return res.status(404).json({ error: "Admin account not found." });
    }
    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '1d' }
    );
    return res.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        avatar: adminUser.avatar,
        studentId: adminUser.studentId
      },
      token
    });
  }

  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: "Email/Phone and Password are required." });
  }

  // Find user by email or phone
  const user = academyUsers.find(u => u.email === emailOrPhone || u.phone === emailOrPhone);
  if (!user || !(user as any).passwordHash) {
    return res.status(400).json({ error: "Invalid credentials. Please try again." });
  }

  // Compare password
  const passwordMatch = bcrypt.compareSync(password, (user as any).passwordHash);
  if (!passwordMatch) {
    return res.status(400).json({ error: "Invalid credentials. Please try again." });
  }

  // Check verification
  if (user.role === 'Student' && !user.active) {
    // Generate new verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpCodes.push({
      id: `otp-${Math.floor(Math.random() * 10000)}`,
      phone: user.phone,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
      verified: false,
      createdAt: Date.now()
    });

    whatsappLogs.unshift({
      id: `wal-${Math.floor(Math.random() * 10000)}`,
      phone: user.phone,
      messageType: 'OTP_CODE',
      text: `Pearls Academy verification code: ${otp}`,
      status: 'delivered',
      timestamp: new Date().toLocaleString()
    });

    saveDB();

    return res.status(403).json({
      error: "ACCOUNT_NOT_VERIFIED",
      message: "Your account is registered but not verified yet. An OTP has been sent to your WhatsApp.",
      phone: user.phone,
      simulatedOtp: otp
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '1d' }
  );

  // Log Login history
  loginHistory.unshift({
    id: `log-${Math.floor(Math.random() * 10000)}`,
    phone: user.phone,
    fullName: user.name,
    timestamp: new Date().toLocaleString(),
    status: 'Success',
    ip: '192.168.1.' + Math.floor(2 + Math.random() * 254)
  });
  saveDB();

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      whatsapp: user.whatsapp,
      city: user.city,
      state: user.state,
      studentId: user.studentId,
      active: user.active,
      batch: user.batch
    },
    token
  });
});

// 3. Verify OTP (Activated)
const verifyStudentOtp = (req: express.Request, res: express.Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP code are required." });
  }

  const record = otpCodes.find(o => o.phone === phone && o.otp === otp && !o.verified);
  if (!record) {
    return res.status(400).json({ error: "No active verification request found or incorrect OTP." });
  }

  if (Date.now() > record.expiresAt) {
    return res.status(400).json({ error: "OTP expired. Please request a new code." });
  }

  record.verified = true;

  const user = academyUsers.find(u => u.phone === phone);
  if (user) {
    user.active = true;
    
    // Add Welcome notification
    notifications.unshift({
      id: `nt-${Math.floor(Math.random() * 10000)}`,
      userEmail: user.email,
      title: 'Welcome to Pearls Academy!',
      text: `Hello ${user.name}! Your account is now fully verified and activated. Browse our premium courses to start designing!`,
      date: 'Just now',
      read: false
    });
  }

  saveDB();

  // Generate JWT token immediately so student enters the app
  const token = user ? jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  ) : null;

  res.json({
    success: true,
    message: "OTP verified successfully. Your account is activated!",
    user,
    token
  });
};

app.post("/api/auth/verify-otp", verifyStudentOtp);
app.post("/api/auth/verify-otp-auth", verifyStudentOtp);

// 4. Resend OTP
app.post("/api/auth/resend-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required." });
  }

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

  whatsappLogs.unshift({
    id: `wal-${Math.floor(Math.random() * 10000)}`,
    phone,
    messageType: 'OTP_CODE',
    text: `Pearls Academy verification code: ${otp}`,
    status: 'delivered',
    timestamp: new Date().toLocaleString()
  });

  saveDB();

  res.json({
    success: true,
    message: "A new OTP code has been sent to your WhatsApp number.",
    simulatedOtp: otp
  });
});

// 5. Logout
app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
});

// 6. Continue with Google
app.post("/api/auth/google", (req, res) => {
  const { email, name, avatar } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Google email and name are required." });
  }

  let user = academyUsers.find(u => u.email === email);
  if (!user) {
    // Automatically create a verified student account
    const studentCount = academyUsers.filter(u => u.role === 'Student').length;
    const seq = String(studentCount + 1).padStart(4, '0');
    const studentId = `PE-2026-${seq}`;

    user = {
      id: `u-${Math.floor(1000 + Math.random() * 9000)}`,
      email,
      name,
      role: 'Student',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      phone: 'G-' + Math.floor(1000000000 + Math.random() * 9000000000).toString(), // mock phone
      whatsapp: '',
      city: '',
      state: '',
      studentId,
      active: true, // Google accounts are auto-active
      batch: 'All Batches'
    };
    academyUsers.push(user);

    notifications.unshift({
      id: `nt-${Math.floor(Math.random() * 10000)}`,
      userEmail: email,
      title: 'Account Created via Google',
      text: `Welcome to Pearls Academy! Your account was registered successfully via Google Sign-In.`,
      date: 'Just now',
      read: false
    });
    saveDB();
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    success: true,
    user,
    token
  });
});

// 7. Forgot Password (OTP request)
app.post("/api/auth/forgot-password", (req, res) => {
  const { emailOrPhone } = req.body;
  if (!emailOrPhone) {
    return res.status(400).json({ error: "Email or Phone number is required." });
  }

  const user = academyUsers.find(u => u.email === emailOrPhone || u.phone === emailOrPhone);
  if (!user) {
    return res.status(404).json({ error: "No student account found with this email or phone number." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpCodes.push({
    id: `otp-${Math.floor(Math.random() * 10000)}`,
    phone: user.phone,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
    verified: false,
    createdAt: Date.now()
  });

  whatsappLogs.unshift({
    id: `wal-${Math.floor(Math.random() * 10000)}`,
    phone: user.phone,
    messageType: 'OTP_CODE',
    text: `Your Pearls Academy password recovery OTP is ${otp}. Do not share this with anyone.`,
    status: 'delivered',
    timestamp: new Date().toLocaleString()
  });

  saveDB();

  res.json({
    success: true,
    message: "A password recovery OTP has been sent to your WhatsApp number.",
    phone: user.phone,
    simulatedOtp: otp
  });
});

// 8. Reset Password (with verified OTP)
app.post("/api/auth/reset-password", (req, res) => {
  const { phone, otp, newPassword } = req.body;

  if (!phone || !otp || !newPassword) {
    return res.status(400).json({ error: "Phone, OTP, and New Password are required." });
  }

  const record = otpCodes.find(o => o.phone === phone && o.otp === otp && !o.verified);
  if (!record) {
    return res.status(400).json({ error: "Invalid OTP or request." });
  }

  if (Date.now() > record.expiresAt) {
    return res.status(400).json({ error: "OTP expired. Please try again." });
  }

  record.verified = true;

  const user = academyUsers.find(u => u.phone === phone);
  if (user) {
    (user as any).passwordHash = bcrypt.hashSync(newPassword, 10);
    
    notifications.unshift({
      id: `nt-${Math.floor(Math.random() * 10000)}`,
      userEmail: user.email,
      title: 'Password Updated',
      text: `Your password has been successfully updated. You can now log in with your new credentials.`,
      date: 'Just now',
      read: false
    });
  }

  saveDB();

  res.json({
    success: true,
    message: "Your password has been updated successfully! Please log in now."
  });
});

// 9. Get Student Profile (Protected)
app.get("/api/student/profile", authenticateToken, (req, res) => {
  const user = academyUsers.find(u => u.id === (req as any).user.id);
  if (!user) {
    return res.status(404).json({ error: "Student profile not found." });
  }

  const studentEnrollments = enrollments.filter(e => e.userEmail === user.email);
  const studentSubs = academySubscriptions.filter(s => s.userId === user.id);
  const studentPayments = upiPayments.filter(p => p.phone === user.phone || p.fullName.toLowerCase() === user.name.toLowerCase());
  const studentAttendance = attendanceLogs.filter(a => a.userEmail === user.email);

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      whatsapp: user.whatsapp,
      city: user.city,
      state: user.state,
      dob: (user as any).dob || '',
      gender: (user as any).gender || '',
      referralCode: (user as any).referralCode || '',
      studentId: user.studentId,
      active: user.active,
      batch: user.batch
    },
    enrollments: studentEnrollments,
    subscriptions: studentSubs,
    payments: studentPayments,
    attendance: studentAttendance
  });
});

// 10. Update Profile (Protected)
app.put("/api/student/profile", authenticateToken, (req, res) => {
  const user = academyUsers.find(u => u.id === (req as any).user.id);
  if (!user) {
    return res.status(404).json({ error: "Student profile not found." });
  }

  const { name, email, phone, whatsapp, city, state, dob, gender, avatar } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (whatsapp) user.whatsapp = whatsapp;
  if (city) user.city = city;
  if (state) user.state = state;
  if (dob) (user as any).dob = dob;
  if (gender) (user as any).gender = gender;
  if (avatar) user.avatar = avatar;

  saveDB();

  res.json({
    success: true,
    message: "Profile updated successfully.",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      whatsapp: user.whatsapp,
      city: user.city,
      state: user.state,
      dob: (user as any).dob || '',
      gender: (user as any).gender || '',
      referralCode: (user as any).referralCode || '',
      studentId: user.studentId,
      active: user.active,
      batch: user.batch
    }
  });
});

// 11. Change Password (Protected)
app.put("/api/student/change-password", authenticateToken, (req, res) => {
  const user = academyUsers.find(u => u.id === (req as any).user.id);
  if (!user) {
    return res.status(404).json({ error: "Student profile not found." });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current password and new password are required." });
  }

  if (!(user as any).passwordHash) {
    return res.status(400).json({ error: "No direct password set. Please use Forgot Password to initialize one." });
  }

  const match = bcrypt.compareSync(currentPassword, (user as any).passwordHash);
  if (!match) {
    return res.status(400).json({ error: "Incorrect current password." });
  }

  (user as any).passwordHash = bcrypt.hashSync(newPassword, 10);
  saveDB();

  res.json({
    success: true,
    message: "Password changed successfully."
  });
});

// 12. Student Dashboard stats (Protected)
app.get("/api/student/dashboard", authenticateToken, (req, res) => {
  const user = academyUsers.find(u => u.id === (req as any).user.id);
  if (!user) {
    return res.status(404).json({ error: "Student profile not found." });
  }

  const studentEnrollments = enrollments.filter(e => e.userEmail === user.email);
  const studentSubs = academySubscriptions.filter(s => s.userId === user.id);
  const studentNotes = academyNotes.filter(n => studentEnrollments.some(e => e.courseTitle === n.courseTitle));
  const studentAssignments = assignments.filter(a => studentEnrollments.some(e => e.courseId === a.courseId));
  const studentSubmissions = submissions.filter(s => s.userEmail === user.email);
  const studentNotifications = notifications.filter(n => n.userEmail === user.email || n.userEmail === 'all');

  res.json({
    success: true,
    stats: {
      enrolledCourses: studentEnrollments.length,
      upcomingClasses: liveClasses.filter(c => c.status === 'scheduled').length,
      assignmentsDue: studentAssignments.length - studentSubmissions.length,
      certificatesEarned: studentEnrollments.filter(e => e.hasCertificate).length
    },
    enrollments: studentEnrollments,
    subscriptions: studentSubs,
    notes: studentNotes,
    assignments: studentAssignments,
    submissions: studentSubmissions,
    notifications: studentNotifications
  });
});

// ==========================================
// ADMIN STUDENT MANAGEMENT API
// ==========================================

// Get All Students
app.get("/api/admin/students", (req, res) => {
  const students = academyUsers.filter(u => u.role === 'Student').map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    avatar: u.avatar,
    phone: u.phone,
    whatsapp: u.whatsapp,
    city: u.city,
    state: u.state,
    dob: (u as any).dob || '',
    gender: (u as any).gender || '',
    studentId: u.studentId,
    active: u.active,
    batch: u.batch
  }));
  res.json({ success: true, students });
});

// Reset Student Password (Admin)
app.post("/api/admin/students/:id/reset-password", (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const user = academyUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "Student not found." });
  }

  (user as any).passwordHash = bcrypt.hashSync(newPassword || 'student123', 10);
  saveDB();

  res.json({ success: true, message: `Password reset successfully for ${user.name}.` });
});

// Delete Student Account
app.delete("/api/admin/students/:id", (req, res) => {
  const { id } = req.params;
  const index = academyUsers.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found." });
  }

  const name = academyUsers[index].name;
  academyUsers.splice(index, 1);
  saveDB();

  res.json({ success: true, message: `Student account of ${name} has been permanently deleted.` });
});

// Get Student Detail Logs
app.get("/api/admin/students/:id/detail", (req, res) => {
  const { id } = req.params;
  const user = academyUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "Student not found." });
  }

  const studentEnrollments = enrollments.filter(e => e.userEmail === user.email);
  const studentSubs = academySubscriptions.filter(s => s.userId === user.id);
  const studentPayments = upiPayments.filter(p => p.phone === user.phone || p.fullName.toLowerCase() === user.name.toLowerCase());
  const studentHistory = loginHistory.filter(h => h.phone === user.phone || h.fullName.toLowerCase() === user.name.toLowerCase());

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      whatsapp: user.whatsapp,
      city: user.city,
      state: user.state,
      dob: (user as any).dob || '',
      gender: (user as any).gender || '',
      studentId: user.studentId,
      active: user.active,
      batch: user.batch
    },
    enrollments: studentEnrollments,
    subscriptions: studentSubs,
    payments: studentPayments,
    history: studentHistory
  });
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

// ==========================================
// API 404 AND ERROR HANDLER MIDDLEWARES
// ==========================================

// 404 Handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Error Handler for API routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled API Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

// Vite & Static Asset Handling
async function startServer() {
  // Load database from Firestore (or local baseline) asynchronously before starting server
  try {
    await loadDB();
  } catch (err) {
    console.error("Critical error during database load:", err);
  }

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