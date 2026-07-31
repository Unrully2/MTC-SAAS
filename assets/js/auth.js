// =========================================================
// MERCYLIFE TRAINING COLLEGE - AUTH & ROLE-BASED ACCESS
// =========================================================
import { supabase, dbService } from './supabase.js';
import { CONFIG } from './config.js';

// Predefined Demo Users for Instant 1-Click Role Testing
export const DEMO_USERS = {
  administrator: {
    id: "usr-admin-01",
    email: "admin@mercylifecollege.ac.ke",
    full_name: "Dr. Harrison Kamau",
    role: "administrator",
    title: "Chief System Administrator"
  },
  principal: {
    id: "usr-prin-01",
    email: "principal@mercylifecollege.ac.ke",
    full_name: "Prof. Catherine Muthoni",
    role: "principal",
    title: "College Principal"
  },
  registrar: {
    id: "usr-reg-01",
    email: "registrar@mercylifecollege.ac.ke",
    full_name: "Mr. Samuel Kibet",
    role: "registrar",
    title: "Academic Registrar"
  },
  finance_officer: {
    id: "usr-fin-01",
    email: "finance@mercylifecollege.ac.ke",
    full_name: "Mrs. Beatrice Wanja",
    role: "finance_officer",
    title: "Senior Finance Officer"
  },
  lecturer: {
    id: "usr-lec-01",
    email: "lecturer@mercylifecollege.ac.ke",
    full_name: "Dr. Evans Mburu",
    role: "lecturer",
    title: "Head of Clinical Medicine"
  },
  librarian: {
    id: "usr-lib-01",
    email: "library@mercylifecollege.ac.ke",
    full_name: "Ms. Sarah Akinyi",
    role: "librarian",
    title: "Chief Librarian"
  },
  reception: {
    id: "usr-rec-01",
    email: "reception@mercylifecollege.ac.ke",
    full_name: "Grace Nyambura",
    role: "reception",
    title: "Front Desk & Admissions Assistant"
  },
  student: {
    id: "usr-std-01",
    email: "jane.wambui@student.mercylifecollege.ac.ke",
    full_name: "Jane Wambui Njeri",
    role: "student",
    admission_no: "MTC/2026/0101",
    title: "Clinical Medicine Student (Year 1)"
  }
};

// Check if demo users are disabled
export function isDemoUsersDisabled() {
  return localStorage.getItem(CONFIG.STORAGE_KEYS.DISABLE_DEMO_USERS) === 'true';
}

export function setDemoUsersDisabled(disabled) {
  if (disabled) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.DISABLE_DEMO_USERS, 'true');
  } else {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.DISABLE_DEMO_USERS);
  }
}

// Helper to get custom created user accounts
export function getCustomUsers() {
  const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOM_USERS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse custom users:", e);
    }
  }
  return [];
}

// Get combined list of all demo and custom accounts
export function getAllSystemUsers() {
  const disabled = isDemoUsersDisabled();
  const demoList = disabled ? [] : Object.values(DEMO_USERS).map(u => ({ ...u, is_demo: true, status: 'active' }));
  const customList = getCustomUsers();
  return [...demoList, ...customList];
}

// Create a new user account (chief admin capability) with Supabase integration
export async function createUserAccount(userData) {
  const customUsers = getCustomUsers();
  
  // Check if email already exists locally
  const allUsers = getAllSystemUsers();
  if (allUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error(`User account with email '${userData.email}' already exists.`);
  }

  const newUser = {
    id: `usr-custom-${Date.now()}`,
    email: userData.email.trim(),
    full_name: userData.full_name.trim(),
    role: userData.role,
    title: userData.title?.trim() || userData.role.replace('_', ' ').toUpperCase(),
    phone: userData.phone?.trim() || '',
    password: userData.password || '123456',
    status: 'active',
    created_at: new Date().toISOString(),
    is_demo: false
  };

  // Register user in Supabase Auth if available
  try {
    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        data: {
          full_name: newUser.full_name,
          role: newUser.role,
          title: newUser.title
        }
      }
    });

    if (error) {
      console.warn("Supabase Auth sign up warning:", error.message);
    } else if (data?.user) {
      newUser.id = data.user.id;
    }
  } catch (e) {
    console.warn("Failed to create user in Supabase Auth, continuing locally:", e);
  }

  customUsers.push(newUser);
  localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOM_USERS, JSON.stringify(customUsers));
  
  dbService.logAudit("CREATE_USER", `Created user account for ${newUser.full_name} (${newUser.email}) - Role: ${newUser.role}`, getCurrentUser()?.email || 'admin');
  return newUser;
}

// Update existing custom user
export function updateUserAccount(userId, updateData) {
  const customUsers = getCustomUsers();
  const index = customUsers.findIndex(u => u.id === userId);
  
  if (index === -1) {
    throw new Error("User account not found or is a protected demo template.");
  }

  customUsers[index] = { ...customUsers[index], ...updateData };
  localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOM_USERS, JSON.stringify(customUsers));
  
  dbService.logAudit("UPDATE_USER", `Updated user account ${userId} (${customUsers[index].email})`, getCurrentUser()?.email || 'admin');
  return customUsers[index];
}

// Delete custom user
export function deleteUserAccount(userId) {
  let customUsers = getCustomUsers();
  const target = customUsers.find(u => u.id === userId);
  
  if (!target) {
    throw new Error("Cannot delete built-in demo accounts. Only created accounts can be removed.");
  }

  customUsers = customUsers.filter(u => u.id !== userId);
  localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOM_USERS, JSON.stringify(customUsers));
  
  dbService.logAudit("DELETE_USER", `Deleted user account ${target.email}`, getCurrentUser()?.email || 'admin');
  return true;
}

// Authenticate user with email and password (supports both local custom accounts & Supabase Auth)
export async function authenticateUser(email, password) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Try signing in via Supabase Auth
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password
    });

    if (error) {
      console.warn("Supabase Auth sign-in error:", error.message);
    } else if (data?.user) {
      const userObj = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        role: data.user.user_metadata?.role || 'administrator',
        title: data.user.user_metadata?.title || 'Chief System Administrator',
        is_demo: false,
        status: 'active'
      };
      return userObj;
    }
  } catch (e) {
    console.warn("Supabase connection offline or unconfigured, falling back to local credentials.", e);
  }

  // 2. Fall back to local system accounts (custom created + demo users if enabled)
  const allUsers = getAllSystemUsers();
  const user = allUsers.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    throw new Error("Invalid email address. Account not found.");
  }

  if (user.status === 'suspended') {
    throw new Error("This user account has been suspended by the Chief Administrator.");
  }

  if (!user.is_demo && user.password && user.password !== password) {
    throw new Error("Incorrect password. Please verify your credentials.");
  }

  return user;
}

export function getCurrentUser() {
  const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing current user:", e);
    }
  }
  return DEMO_USERS.administrator;
}

export function setCurrentUser(user) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  dbService.logAudit("LOGIN", `User logged in as ${user.role} (${user.email})`, user.email);
}

export function switchRole(roleKey) {
  if (DEMO_USERS[roleKey]) {
    setCurrentUser(DEMO_USERS[roleKey]);
    window.location.reload();
  }
}

export async function logout() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn("Error signing out of Supabase Auth:", e);
  }
  window.location.href = "login.html";
}

// Check page permissions
export function enforcePageAccess(allowedRoles = []) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return false;
  }

  // Administrators and Principals have master access to everything
  if (currentUser.role === 'administrator' || currentUser.role === 'principal') {
    return true;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    console.warn(`User role ${currentUser.role} not authorized for this page.`);
    alert(`Access Restricted: Your role (${currentUser.role.replace('_', ' ')}) is not authorized to access this module.`);
    window.location.href = "dashboard.html";
    return false;
  }

  return true;
}
