// =========================================================
// MERCYLIFE TRAINING COLLEGE - SUPABASE SDK INTEGRATION
// =========================================================
import { createClient } from '@supabase/supabase-js';
import { getSupabaseCredentials, isSupabaseConfigured } from './config.js';

// Dynamic Supabase Client getter so updated credentials in Settings immediately take effect
export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseCredentials();
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
}

export const supabase = new Proxy({}, {
  get(target, prop) {
    const client = getSupabaseClient();
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});

// Helper to check valid UUIDs (Postgres columns)
function isUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function cleanPayload(data, validKeys) {
  const cleaned = {};
  for (const key of validKeys) {
    let val = data[key];
    if (val !== undefined && val !== null) {
      if (typeof val === 'string' && val.trim() === '') {
        val = null; // Convert empty string to null for Postgres DATE/NUMERIC/UUID compatibility
      }
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// Mock Local Storage Database State for Fallback / Immediate Demo Evaluation
const MOCK_STORAGE_KEY = 'mercylife_mock_db_v1';

function getMockDB() {
  const data = localStorage.getItem(MOCK_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing mock DB", e);
    }
  }
  
  // Seed Initial Mock Database for Mercylife Training College
  const initialDB = {
    students: [
      {
        id: "std-001",
        admission_no: "MTC/2026/0101",
        full_name: "Jane Wambui Njeri",
        gender: "Female",
        dob: "2003-05-14",
        national_id: "38921045",
        phone: "+254 712 987 654",
        email: "jane.wambui@student.mercylifecollege.ac.ke",
        guardian_name: "Peter Njeri",
        guardian_phone: "+254 722 111 222",
        emergency_contact: "+254 722 111 222 (Father)",
        county: "Kiambu",
        nationality: "Kenyan",
        religion: "Christian",
        medical_conditions: "None",
        course_id: "crs-001",
        course_name: "Diploma in Clinical Medicine & Surgery",
        current_semester: "Semester 1",
        status: "active",
        kcse_grade: "C+",
        passport_photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        created_at: "2026-01-10"
      },
      {
        id: "std-002",
        admission_no: "MTC/2026/0102",
        full_name: "David Ochieng Otieno",
        gender: "Male",
        dob: "2002-11-20",
        national_id: "37812904",
        phone: "+254 733 456 789",
        email: "david.ochieng@student.mercylifecollege.ac.ke",
        guardian_name: "Mary Otieno",
        guardian_phone: "+254 733 888 999",
        emergency_contact: "+254 733 888 999 (Mother)",
        county: "Kisumu",
        nationality: "Kenyan",
        religion: "Christian",
        medical_conditions: "Penicillin Allergy",
        course_id: "crs-002",
        course_name: "Diploma in Nursing (KRCHN)",
        current_semester: "Semester 1",
        status: "active",
        kcse_grade: "B-",
        passport_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        created_at: "2026-01-12"
      },
      {
        id: "std-003",
        admission_no: "MTC/2026/0103",
        full_name: "Aminah Hassan Omar",
        gender: "Female",
        dob: "2004-02-08",
        national_id: "39041562",
        phone: "+254 701 234 567",
        email: "aminah.hassan@student.mercylifecollege.ac.ke",
        guardian_name: "Hassan Omar",
        guardian_phone: "+254 701 999 000",
        emergency_contact: "+254 701 999 000 (Father)",
        county: "Mombasa",
        nationality: "Kenyan",
        religion: "Muslim",
        medical_conditions: "Asthma",
        course_id: "crs-005",
        course_name: "Diploma in Medical Laboratory Technology",
        current_semester: "Semester 1",
        status: "active",
        kcse_grade: "C",
        passport_photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        created_at: "2026-01-15"
      }
    ],
    courses: [
      {
        id: "crs-001",
        code: "DCM-101",
        name: "Diploma in Clinical Medicine & Surgery",
        department: "Clinical Medicine",
        duration_months: 36,
        fees_per_semester: 65000,
        description: "Comprehensive medical officer training program focusing on clinical diagnosis, pharmacotherapy, minor surgical skills, and outpatient emergency care at Mercylite Hospital.",
        requirements: "KCSE Mean Grade C Plain with C in Biology & Chemistry"
      },
      {
        id: "crs-002",
        code: "DNS-201",
        name: "Diploma in Nursing (KRCHN)",
        department: "Nursing",
        duration_months: 36,
        fees_per_semester: 60000,
        description: "Prepares registered nurses for hospital ward management, patient care, maternal health, and clinical rotations.",
        requirements: "KCSE Mean Grade C Plain with C in Biology & Chemistry"
      },
      {
        id: "crs-003",
        code: "DCH-301",
        name: "Diploma in Community Health & Development",
        department: "Community Health",
        duration_months: 24,
        fees_per_semester: 45000,
        description: "Epidemiology, public sanitation, immunization outreach, and community healthcare initiatives.",
        requirements: "KCSE Mean Grade C- (Minus)"
      },
      {
        id: "crs-004",
        code: "HMT-401",
        name: "Certificate in Health Records & Information Tech",
        department: "Health Records",
        duration_months: 18,
        fees_per_semester: 38000,
        description: "ICD-11 medical coding, health statistics, database administration, and privacy regulations.",
        requirements: "KCSE Mean Grade D+"
      },
      {
        id: "crs-005",
        code: "MLT-501",
        name: "Diploma in Medical Laboratory Technology",
        department: "Laboratory Sciences",
        duration_months: 36,
        fees_per_semester: 62000,
        description: "Diagnostic hematology, clinical microbiology, biochemistry, and blood transfusion protocols.",
        requirements: "KCSE Mean Grade C Plain"
      }
    ],
    units: [
      { id: "unt-101", code: "ANA-101", name: "Human Anatomy & Histology I", course_id: "crs-001", semester: "Semester 1", hours: 60 },
      { id: "unt-102", code: "PHY-102", name: "Medical Physiology", course_id: "crs-001", semester: "Semester 1", hours: 60 },
      { id: "unt-103", code: "FAR-103", name: "Pharmacology & Therapeutics", course_id: "crs-001", semester: "Semester 2", hours: 45 },
      { id: "unt-201", code: "NUR-201", name: "Fundamentals of Nursing Practice", course_id: "crs-002", semester: "Semester 1", hours: 75 },
      { id: "unt-202", code: "MAT-202", name: "Maternal & Child Health Nursing", course_id: "crs-002", semester: "Semester 2", hours: 60 }
    ],
    invoices: [],
    payments: [],
    clinical: [],
    results: [],
    attendance: [],
    books: [],
    borrows: [],
    announcements: [],
    assignments: [],
    staff: [],
    audit_logs: []
  };

  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialDB));
  return initialDB;
}

function saveMockDB(db) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
}

// Data Abstraction Service
export const dbService = {
  async getStudents() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('students').select('*');
        if (!error && Array.isArray(data)) return data;
        if (error) console.warn("Supabase Fetch Students Error:", error.message);
      } catch (e) {
        console.warn("Supabase network error, fallback to local storage:", e);
      }
    }
    return getMockDB().students;
  },

  async addStudent(studentData) {
    const newStudent = {
      id: "std-" + Date.now(),
      admission_no: studentData.admission_no || `MTC/2026/0${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString().split('T')[0],
      status: "active",
      ...studentData
    };

    if (isSupabaseConfigured()) {
      try {
        const studentKeys = [
          'admission_no', 'full_name', 'gender', 'dob', 'national_id',
          'phone', 'email', 'guardian_name', 'guardian_phone', 'emergency_contact',
          'address', 'county', 'nationality', 'religion', 'medical_conditions',
          'course_id', 'current_semester', 'academic_year_id', 'intake_id',
          'status', 'passport_photo_url', 'kcse_grade'
        ];
        const supabasePayload = cleanPayload(newStudent, studentKeys);
        if (supabasePayload.course_id && !isUUID(supabasePayload.course_id)) {
          delete supabasePayload.course_id;
        }

        const { data, error } = await supabase.from('students').insert([supabasePayload]).select();
        if (error) {
          console.error("❌ Supabase Insert Student Failed:", error.message, error);
        } else if (data && data[0]) {
          newStudent.id = data[0].id;
        }
      } catch (e) {
        console.error("Supabase insert exception:", e);
      }
    }

    const db = getMockDB();
    db.students.unshift(newStudent);
    saveMockDB(db);
    return newStudent;
  },

  async getCourses() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('courses').select('*');
        if (!error && Array.isArray(data)) return data;
      } catch (e) {
        console.warn("Supabase fetch courses failed:", e);
      }
    }
    return getMockDB().courses;
  },

  async addCourse(courseData) {
    const newCourse = { id: "crs-" + Date.now(), ...courseData };

    if (isSupabaseConfigured()) {
      try {
        const courseKeys = ['code', 'name', 'department', 'duration_months', 'fees_per_semester', 'description', 'requirements'];
        const supabasePayload = cleanPayload(newCourse, courseKeys);

        const { data, error } = await supabase.from('courses').insert([supabasePayload]).select();
        if (error) console.error("❌ Supabase Course Insert Error:", error.message);
        else if (data && data[0]) newCourse.id = data[0].id;
      } catch (e) {
        console.error("Supabase insert course exception:", e);
      }
    }

    const db = getMockDB();
    db.courses.push(newCourse);
    saveMockDB(db);
    return newCourse;
  },

  async getInvoices() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('fee_invoices').select('*');
        if (!error && Array.isArray(data)) return data;
      } catch (e) {
        console.warn("Supabase fetch invoices failed:", e);
      }
    }
    return getMockDB().invoices;
  },

  async addInvoice(invoiceData) {
    const db = getMockDB();
    const newInv = { id: "inv-" + Date.now(), invoice_no: `INV-2026-00${db.invoices.length + 1}`, ...invoiceData };

    if (isSupabaseConfigured()) {
      try {
        const invoiceKeys = ['invoice_no', 'student_id', 'amount', 'paid_amount', 'balance', 'due_date', 'description', 'status'];
        const supabasePayload = cleanPayload(newInv, invoiceKeys);
        if (supabasePayload.student_id && !isUUID(supabasePayload.student_id)) delete supabasePayload.student_id;

        const { data, error } = await supabase.from('fee_invoices').insert([supabasePayload]).select();
        if (error) console.error("❌ Supabase Invoice Insert Error:", error.message);
        else if (data && data[0]) newInv.id = data[0].id;
      } catch (e) {
        console.error("Supabase invoice exception:", e);
      }
    }

    db.invoices.unshift(newInv);
    saveMockDB(db);
    return newInv;
  },

  async getPayments() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('fee_payments').select('*');
        if (!error && Array.isArray(data)) return data;
      } catch (e) {
        console.warn("Supabase fetch payments failed:", e);
      }
    }
    return getMockDB().payments;
  },

  async recordPayment(paymentData) {
    const db = getMockDB();
    const newPayment = {
      id: "pay-" + Date.now(),
      receipt_no: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      payment_date: new Date().toISOString().split('T')[0],
      received_by: "Finance Office",
      ...paymentData
    };

    if (isSupabaseConfigured()) {
      try {
        const paymentKeys = ['receipt_no', 'invoice_id', 'student_id', 'amount_paid', 'payment_method', 'reference_code', 'payment_date', 'received_by', 'notes'];
        const supabasePayload = cleanPayload(newPayment, paymentKeys);

        if (supabasePayload.student_id && !isUUID(supabasePayload.student_id)) delete supabasePayload.student_id;
        if (supabasePayload.invoice_id && !isUUID(supabasePayload.invoice_id)) delete supabasePayload.invoice_id;

        const pm = String(supabasePayload.payment_method || '').toLowerCase();
        if (pm.includes('mpesa') || pm.includes('m-pesa')) supabasePayload.payment_method = 'mpesa';
        else if (pm.includes('bank')) supabasePayload.payment_method = 'bank';
        else if (pm.includes('cheque')) supabasePayload.payment_method = 'cheque';
        else supabasePayload.payment_method = 'cash';

        const { data, error } = await supabase.from('fee_payments').insert([supabasePayload]).select();
        if (error) console.error("❌ Supabase Payment Insert Error:", error.message);
        else if (data && data[0]) newPayment.id = data[0].id;
      } catch (e) {
        console.error("Supabase payment exception:", e);
      }
    }

    db.payments.unshift(newPayment);

    const invoice = db.invoices.find(i => i.id === paymentData.invoice_id || i.student_id === paymentData.student_id);
    if (invoice) {
      invoice.paid_amount = Number(invoice.paid_amount) + Number(paymentData.amount_paid);
      invoice.balance = Math.max(0, Number(invoice.amount) - Number(invoice.paid_amount));
      invoice.status = invoice.balance === 0 ? 'paid' : 'partially_paid';
    }
    saveMockDB(db);
    return newPayment;
  },

  async getClinicalAttachments() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('clinical_attachments').select('*');
        if (!error && Array.isArray(data)) return data;
      } catch (e) {
        console.warn("Supabase fetch clinical attachments failed:", e);
      }
    }
    return getMockDB().clinical;
  },

  async getExamResults() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('exam_results').select('*');
        if (!error && Array.isArray(data)) return data;
      } catch (e) {
        console.warn("Supabase fetch exam results failed:", e);
      }
    }
    return getMockDB().results;
  },

  async addExamResult(resultData) {
    const db = getMockDB();
    const newRes = { id: "res-" + Date.now(), ...resultData };
    if (isSupabaseConfigured()) {
      try {
        const resultKeys = ['exam_id', 'student_id', 'marks_obtained', 'grade', 'remarks', 'is_published'];
        const supabasePayload = cleanPayload(newRes, resultKeys);
        if (supabasePayload.student_id && !isUUID(supabasePayload.student_id)) delete supabasePayload.student_id;
        if (supabasePayload.exam_id && !isUUID(supabasePayload.exam_id)) delete supabasePayload.exam_id;

        const { data, error } = await supabase.from('exam_results').insert([supabasePayload]).select();
        if (error) console.error("❌ Supabase Exam Result Insert Error:", error.message);
        else if (data && data[0]) newRes.id = data[0].id;
      } catch (e) {
        console.error("Supabase exam result exception:", e);
      }
    }
    db.results.unshift(newRes);
    saveMockDB(db);
    return newRes;
  },

  async getAttendance() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('attendance').select('*');
        if (!error && Array.isArray(data)) return data;
      } catch (e) {
        console.warn("Supabase fetch attendance failed:", e);
      }
    }
    return getMockDB().attendance;
  },

  async markAttendance(records) {
    if (!Array.isArray(records) || records.length === 0) return [];

    if (isSupabaseConfigured()) {
      try {
        const attendanceKeys = ['student_id', 'unit_code', 'date', 'status', 'remarks'];
        const cleanedRecords = records.map(r => {
          const payload = cleanPayload(r, attendanceKeys);
          if (payload.student_id && !isUUID(payload.student_id)) delete payload.student_id;
          return payload;
        });

        const { data, error } = await supabase.from('attendance').insert(cleanedRecords).select();
        if (error) console.error("❌ Supabase Attendance Insert Error:", error.message);
        else if (data) console.log("✅ Attendance synced to Supabase:", data);
      } catch (e) {
        console.error("Supabase mark attendance exception:", e);
      }
    }

    const db = getMockDB();
    db.attendance = [...records, ...db.attendance];
    saveMockDB(db);
    return records;
  },

  async getBooks() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('library_books').select('*');
        if (!error && Array.isArray(data)) return data;
      } catch (e) {
        console.warn("Supabase fetch books failed:", e);
      }
    }
    return getMockDB().books;
  },

  async getAnnouncements() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('announcements').select('*');
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        console.warn("Supabase fetch announcements failed:", e);
      }
    }
    return getMockDB().announcements;
  },

  async addAnnouncement(announcementData) {
    const db = getMockDB();
    const newAnc = {
      id: "anc-" + Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...announcementData
    };
    if (isSupabaseConfigured()) {
      try {
        const ancKeys = ['title', 'content', 'category', 'target_role', 'created_by'];
        const supabasePayload = cleanPayload(newAnc, ancKeys);

        const { data, error } = await supabase.from('announcements').insert([supabasePayload]).select();
        if (error) console.error("❌ Supabase Announcement Insert Error:", error.message);
        else if (data && data[0]) newAnc.id = data[0].id;
      } catch (e) {
        console.error("Supabase announcement exception:", e);
      }
    }
    db.announcements.unshift(newAnc);
    saveMockDB(db);
    return newAnc;
  },

  async getAuditLogs() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('audit_logs').select('*');
        if (!error && Array.isArray(data)) return data;
      } catch (e) {
        console.warn("Supabase fetch audit logs failed:", e);
      }
    }
    return getMockDB().audit_logs;
  },

  async logAudit(action, details, userEmail = "system@mercylifecollege.ac.ke") {
    const db = getMockDB();
    const newLog = {
      id: "log-" + Date.now(),
      user_email: userEmail,
      action,
      details,
      timestamp: new Date().toLocaleString()
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('audit_logs').insert([{
          user_email: userEmail,
          action,
          details
        }]);
      } catch (e) {
        console.warn("Supabase logAudit exception:", e);
      }
    }

    db.audit_logs.unshift(newLog);
    saveMockDB(db);
  }
};
