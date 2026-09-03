# Mercylife Training College - Production Deployment Guide

## 🚀 Quick Start Setup

### Prerequisites
- Node.js 18+ installed
- Supabase account (https://supabase.com)
- Vercel account (https://vercel.com)
- GitHub repository connected

---

## 📋 Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details (e.g., "Mercylife-ERP")
4. Save your database password securely
5. Wait for project initialization

### 1.2 Get Supabase Credentials
1. Go to Project Settings > API
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Key** → `VITE_SUPABASE_ANON_KEY`
3. Keep these safe - you'll need them for Vercel

### 1.3 Initialize Database Schema
1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy the entire content from `schema.sql` in this repository
4. Paste into the SQL editor
5. Click "Run"
6. Wait for successful completion

### 1.4 Enable Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Users can only read/modify their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all data
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrator'
    )
  );
```

### 1.5 Create Initial Admin Account
1. Go to Authentication > Users
2. Click "Add User"
3. Email: `admin@mercylifecollege.ac.ke`
4. Password: Set a strong password
5. Confirm email
6. Note the User ID

7. Go to SQL Editor and insert admin profile:
```sql
INSERT INTO profiles (id, email, full_name, role, title)
VALUES (
  'USER_ID_FROM_AUTH',
  'admin@mercylifecollege.ac.ke',
  'Chief Administrator',
  'administrator',
  'System Administrator'
);
```

---

## 🌐 Step 2: Local Development Setup

### 2.1 Clone & Install
```bash
git clone https://github.com/Unrully2/MTC-SAAS.git
cd MTC-SAAS
npm install
```

### 2.2 Configure Environment Variables
1. Create `.env.local` file in root
2. Add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEMO_USERS_ENABLED=true
VITE_APP_ENV=development
```

### 2.3 Run Locally
```bash
npm run dev
```

Open http://localhost:3000 and test with demo accounts:
- **Admin**: admin@mercylifecollege.ac.ke / password
- **Student**: student@mercylifecollege.ac.ke / password

---

## 🚀 Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository
1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository `Unrully2/MTC-SAAS`
4. Click "Import"

### 3.2 Configure Environment Variables
1. In Vercel Project Settings > Environment Variables
2. Add these variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Anon Key | Production, Preview, Development |
| `VITE_API_BASE_URL` | `https://your-domain.vercel.app/api` | Production |
| `VITE_DEMO_USERS_ENABLED` | `false` | Production |
| `VITE_APP_ENV` | `production` | Production |

### 3.3 Deploy
1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. Once deployed, visit your Vercel URL

### 3.4 Test Production
1. Try logging in with your admin account
2. Go to Settings > Create New User Account
3. Create test accounts for other roles
4. Verify role-based access control works

---

## 👤 User Account Management (Admin Only)

### Creating New Staff Accounts
1. Login as Administrator
2. Go to **Settings** page
3. Click **"Create New User Account"** button
4. Fill in:
   - **Email**: staff@mercylifecollege.ac.ke
   - **Full Name**: John Lecturer
   - **Password**: Strong password
   - **Role**: Select (lecturer, registrar, finance_officer, etc.)
   - **Title**: Optional designation
5. Click **Create Account**
6. Share credentials with staff member securely

### Available Roles
- **administrator**: Full system access, create users, settings
- **principal**: View all reports, approve key decisions
- **registrar**: Manage courses, students, academic records
- **finance_officer**: Manage invoices, payments, fees
- **lecturer**: Record attendance, enter grades, view class roster
- **librarian**: Manage library, books, borrowing system
- **reception**: Register students, manage inquiries
- **student**: View personal records, grades, fees, library books

### Role-Based Access Control
Each role has specific permissions:
```javascript
// Example: Require admin role
import { requireRole } from './assets/js/auth.js';
requireRole('administrator'); // Redirects if not admin

// Example: Allow multiple roles
import { requireAnyRole } from './assets/js/auth.js';
requireAnyRole(['administrator', 'principal']);
```

---

## 🔒 Security Best Practices

### 1. Production Mode
- Keep `VITE_DEMO_USERS_ENABLED=false` in production
- Only admin should create user accounts
- Never share API keys publicly

### 2. Environment Variables
- Never commit `.env.local` to GitHub
- Always use Vercel dashboard for production secrets
- Rotate API keys regularly

### 3. Database Security
- Enable Row Level Security (RLS) on all tables
- Test that students can only see their own data
- Verify admins can access all data
- Audit access logs regularly

### 4. Authentication
- Use strong passwords (12+ characters)
- Enable 2FA in Supabase dashboard
- Monitor for suspicious login attempts
- Implement password reset mechanism

---

## 📊 Monitoring & Maintenance

### Vercel Dashboard
- **Analytics**: View traffic, performance metrics
- **Logs**: Monitor errors and API calls
- **Deployments**: View deployment history
- **Settings**: Manage domains, git integration

### Supabase Dashboard
- **Database**: Monitor query performance
- **Auth**: View user logins, activity
- **Logs**: SQL query logs, API logs
- **Backups**: Automated daily backups

### Regular Tasks
- Weekly: Review user activity and access logs
- Monthly: Check database size and performance
- Quarterly: Security audit and backup verification
- Yearly: Dependency updates and security patches

---

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is running
- Test in Supabase dashboard SQL editor

### "Access Denied" errors
- Verify user role is correct in profiles table
- Check RLS policies are enabled
- Clear browser sessionStorage and try again

### "Blank page after login"
- Check browser console for errors
- Verify database tables were created successfully
- Check that user profile exists in profiles table

### "Build fails on Vercel"
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Run `npm run build` locally to test
- Check that all dependencies are in package.json

---

## 📚 API Documentation

### Authentication (`assets/js/auth.js`)
```javascript
// Login
await authenticateUser(email, password);

// Logout
await logoutUser();

// Check role
hasRole('administrator');
hasAnyRole(['lecturer', 'registrar']);

// Get current user
getCurrentUser(); // Returns { id, email, full_name, role, title }
```

### Students API (`api/students.ts`)
```javascript
import { getStudents, createStudent, updateStudent, deleteStudent } from './api/students.ts';

// Get all students (with filters)
await getStudents(courseId, status);

// Create new student
await createStudent({ admission_no, full_name, email, ... });

// Update student
await updateStudent(studentId, { status: 'graduated' });

// Delete student
await deleteStudent(studentId);
```

### Courses API (`api/courses.ts`)
```javascript
import { getCourses, getCourseWithUnits, createCourse } from './api/courses.ts';

await getCourses();
await getCourseWithUnits(courseId);
await createCourse({ code, name, department, ... });
```

---

## 📞 Support & Contacts

- **Supabase Support**: support@supabase.com
- **Vercel Support**: support@vercel.com
- **GitHub Issues**: https://github.com/Unrully2/MTC-SAAS/issues

---

## ✅ Pre-Launch Checklist

- [ ] Supabase project created and schema imported
- [ ] Admin account created in Supabase auth
- [ ] Vercel project connected and deployed
- [ ] Environment variables configured on Vercel
- [ ] Test login works with admin account
- [ ] Test creating a new user account
- [ ] Verify role-based access control
- [ ] Test all major features (students, courses, finance, etc.)
- [ ] Check mobile responsiveness
- [ ] Setup backup strategy
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS (automatic with Vercel)

---

**Last Updated**: September 2026
**Version**: 1.0.0
