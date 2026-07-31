// =========================================================
// MERCYLIFE TRAINING COLLEGE - CONFIGURATION & CONSTANTS
// =========================================================

export const CONFIG = {
  COLLEGE_NAME: "Mercylife Training College",
  OWNER: "Mercylite Hospital",
  MOTO: "Excellence in Medical Training & Healthcare Innovation",
  EMAIL: "info@mercylifecollege.ac.ke",
  PHONE: "+254 712 345 678",
  LOCATION: "Kiambu town opposite kiambu law courts in Mercylite hospital",
  WEBSITE: "https://mercylifecollege.ac.ke",

  // Default Supabase Credentials
  SUPABASE_DEFAULT_URL: "https://ineaufpwxuuvsvhomrtz.supabase.co",
  SUPABASE_DEFAULT_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZWF1ZnB3eHV1dnN2aG9tcnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTAzOTIsImV4cCI6MjEwMTA2NjM5Mn0.efWy5IBaolgjWgWIBSKI3aPWx1KaCASlhUkneTgTpI0",

  // Browser Storage Keys
  STORAGE_KEYS: {
    SUPABASE_URL: "mercylife_supabase_url",
    SUPABASE_ANON_KEY: "mercylife_supabase_anon_key",
    CURRENT_USER: "mercylife_current_user",
    THEME_MODE: "mercylife_theme_mode",
    SCHOOL_INFO: "mercylife_school_info",
    CUSTOM_USERS: "mercylife_custom_users",
    DISABLE_DEMO_USERS: "mercylife_disable_demo_users"
  },

  // Academic Settings
  CURRENT_ACADEMIC_YEAR: "2026/2027",
  CURRENT_SEMESTER: "Semester 1",

  // Default grading scale
  GRADING_SCALE: [
    { grade: "A", min: 75, max: 100, gpa: 4.0, remark: "Distinction" },
    { grade: "B", min: 65, max: 74, gpa: 3.0, remark: "Credit" },
    { grade: "C", min: 50, max: 64, gpa: 2.0, remark: "Pass" },
    { grade: "D", min: 40, max: 49, gpa: 1.0, remark: "Subsidiary Pass" },
    { grade: "F", min: 0, max: 39, gpa: 0.0, remark: "Fail" }
  ]
};

// Helper to get configured Supabase Credentials with correct storage key lookups
export function getSupabaseCredentials() {
  const customUrl = localStorage.getItem(CONFIG.STORAGE_KEYS.SUPABASE_URL);
  const customKey = localStorage.getItem(CONFIG.STORAGE_KEYS.SUPABASE_ANON_KEY);

  return {
    url: customUrl || CONFIG.SUPABASE_DEFAULT_URL,
    anonKey: customKey || CONFIG.SUPABASE_DEFAULT_ANON_KEY
  };
}

export function isSupabaseConfigured() {
  const creds = getSupabaseCredentials();
  return Boolean(
    creds.url && 
    creds.anonKey && 
    creds.url.startsWith('http') && 
    !creds.url.includes('example-supabase-project')
  );
}

// Helper to get configured School / Institution Information
export function getSchoolInfo() {
  const defaultInfo = {
    name: CONFIG.COLLEGE_NAME,
    owner: CONFIG.OWNER,
    tagline: CONFIG.MOTO,
    email: CONFIG.EMAIL,
    phone: CONFIG.PHONE,
    address: CONFIG.LOCATION,
    poBox: "P.O. Box 12345-00100, Nairobi",
    website: CONFIG.WEBSITE,
    principal: "Prof. Catherine Muthoni",
    principalTitle: "College Principal & Chief Executive",
    registrar: "Dr. Samuel Maina",
    registrarTitle: "Academic Registrar",
    examBoard: "Nursing Council of Kenya / TVETA / KMLTTB",
    currency: "KSh",
    logoUrl: ""
  };

  const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.SCHOOL_INFO);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return { ...defaultInfo, ...parsed };
    } catch (e) {
      console.error("Failed to parse stored school info:", e);
    }
  }

  return defaultInfo;
}

// Helper to save updated School / Institution Information
export function saveSchoolInfo(info) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(info));
}
