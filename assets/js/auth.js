import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Demo users for development/testing
export const DEMO_USERS = {
  administrator: {
    id: 'admin-001',
    email: 'admin@mercylifecollege.ac.ke',
    full_name: 'Chief Administrator',
    role: 'administrator',
    title: 'System Administrator',
  },
  principal: {
    id: 'principal-001',
    email: 'principal@mercylifecollege.ac.ke',
    full_name: 'Prof. Catherine Muthoni',
    role: 'principal',
    title: 'College Principal',
  },
  registrar: {
    id: 'registrar-001',
    email: 'registrar@mercylifecollege.ac.ke',
    full_name: 'Dr. Samuel Maina',
    role: 'registrar',
    title: 'Academic Registrar',
  },
  finance_officer: {
    id: 'finance-001',
    email: 'finance@mercylifecollege.ac.ke',
    full_name: 'Jane Kipchoge',
    role: 'finance_officer',
    title: 'Finance Officer',
  },
  lecturer: {
    id: 'lecturer-001',
    email: 'lecturer@mercylifecollege.ac.ke',
    full_name: 'Dr. Julius Kimani',
    role: 'lecturer',
    title: 'Lecturer - Anatomy',
  },
  librarian: {
    id: 'librarian-001',
    email: 'librarian@mercylifecollege.ac.ke',
    full_name: 'Mary Omondi',
    role: 'librarian',
    title: 'Head Librarian',
  },
  reception: {
    id: 'reception-001',
    email: 'reception@mercylifecollege.ac.ke',
    full_name: 'Peter Kiprotich',
    role: 'reception',
    title: 'Reception Officer',
  },
  student: {
    id: 'student-001',
    email: 'student@mercylifecollege.ac.ke',
    full_name: 'Amara Hassan',
    role: 'student',
    title: 'Student',
  },
};

let currentUser = null;
let demoUsersDisabled = localStorage.getItem('DISABLE_DEMO_USERS') === 'true';

/**
 * Check if demo users are disabled (production mode)
 */
export function isDemoUsersDisabled() {
  return demoUsersDisabled;
}

/**
 * Toggle demo users (admin only)
 */
export function toggleDemoUsers(disabled) {
  demoUsersDisabled = disabled;
  localStorage.setItem('DISABLE_DEMO_USERS', disabled ? 'true' : 'false');
}

/**
 * Set the current user in session
 */
export function setCurrentUser(user) {
  currentUser = user;
  sessionStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Get the current user
 */
export function getCurrentUser() {
  if (!currentUser) {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
      currentUser = JSON.parse(stored);
    }
  }
  return currentUser;
}

/**
 * Check if user has a specific role
 */
export function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

/**
 * Check if user has one of multiple roles
 */
export function hasAnyRole(roles) {
  const user = getCurrentUser();
  return user && roles.includes(user.role);
}

/**
 * Authenticate user with Supabase
 */
export async function authenticateUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    const userData = {
      id: data.user.id,
      email: data.user.email,
      full_name: profile.full_name,
      role: profile.role,
      title: profile.title || profile.role,
    };

    setCurrentUser(userData);
    return userData;
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error(error.message || 'Authentication failed');
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  try {
    await supabase.auth.signOut();
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error(error.message || 'Logout failed');
  }
}

/**
 * Create a new user account (Admin only)
 */
export async function createUserAccount(email, password, fullName, role, title) {
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser(
      {
        email,
        password,
        email_confirm: true,
      },
      { skipConfirmationAndVerification: true }
    );

    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
          title: title || role,
        },
      ]);

    if (profileError) throw profileError;

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error('Create user error:', error);
    throw new Error(error.message || 'Failed to create user account');
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Redirect to login if not authenticated
 */
export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * Require specific role (redirect if not authorized)
 */
export function requireRole(role) {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  if (!hasRole(role)) {
    alert('Access Denied: You do not have permission to view this page.');
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

/**
 * Require any of multiple roles
 */
export function requireAnyRole(roles) {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  if (!hasAnyRole(roles)) {
    alert('Access Denied: You do not have permission to view this page.');
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

/**
 * Alias for logoutUser (used by navbar)
 */
export async function logout() {
  try {
    await logoutUser();
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout failed:', error);
    // Force clear and redirect anyway
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}

/**
 * Quick role switcher for demo/testing (uses DEMO_USERS)
 */
export function switchRole(roleKey) {
  if (isDemoUsersDisabled()) {
    alert('Demo role switching is disabled in production mode.');
    return;
  }
  const demoUser = DEMO_USERS[roleKey];
  if (!demoUser) {
    console.warn('Unknown role key:', roleKey);
    return;
  }
  setCurrentUser({ ...demoUser });
  // Reload current page so all components pick up the new user
  window.location.reload();
}

/**
 * Enforce page access. If roles array is provided, user must have one of those roles.
 * Otherwise just requires authentication.
 */
export function enforcePageAccess(allowedRoles = null) {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!hasAnyRole(allowedRoles)) {
      alert('Access Denied: You do not have permission to view this page.');
      window.location.href = 'dashboard.html';
      return false;
    }
  }
  return true;
}

/**
 * Alias for isDemoUsersDisabled / toggle for settings page
 */
export function setDemoUsersDisabled(disabled) {
  toggleDemoUsers(disabled);
}

/**
 * Get custom (non-demo) users from localStorage or session
 * (lightweight fallback until full Supabase admin listing is wired)
 */
export function getCustomUsers() {
  try {
    const stored = localStorage.getItem('CUSTOM_USERS');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Combine demo + custom users for admin UI
 */
export function getAllSystemUsers() {
  const demoList = Object.values(DEMO_USERS).map(u => ({
    ...u,
    status: 'active',
    isDemo: true,
  }));
  const custom = getCustomUsers().map(u => ({ ...u, isDemo: false }));
  return [...demoList, ...custom];
}

/**
 * Update a user account (local/custom users for now)
 */
export function updateUserAccount(id, updates) {
  const custom = getCustomUsers();
  const idx = custom.findIndex(u => u.id === id);
  if (idx !== -1) {
    custom[idx] = { ...custom[idx], ...updates };
    localStorage.setItem('CUSTOM_USERS', JSON.stringify(custom));
    return { success: true };
  }
  // Demo users are read-only
  console.warn('Cannot update demo user or unknown id:', id);
  return { success: false, error: 'User not found or is a demo account' };
}

/**
 * Delete a custom user account
 */
export function deleteUserAccount(id) {
  let custom = getCustomUsers();
  const before = custom.length;
  custom = custom.filter(u => u.id !== id);
  if (custom.length === before) {
    return { success: false, error: 'User not found or is a demo account' };
  }
  localStorage.setItem('CUSTOM_USERS', JSON.stringify(custom));
  return { success: true };
}
