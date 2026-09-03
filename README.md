# Update README with Production Instructions
# Mercylife Training College - ERP Management System

A comprehensive, production-ready Enterprise Resource Planning (ERP) system for Mercylife Training College. Built with React, Vite, Supabase, and Vercel for seamless medical education management.

## 🎯 Features

### Academic Management
- 📚 Course & curriculum management
- 👨‍🎓 Student admission & registration
- 📝 Exam & CAT grading system
- 📊 Academic performance analytics
- 📋 Attendance tracking

### Finance Management
- 💰 Fee invoicing & billing
- 💳 M-Pesa payment integration
- 📥 Fee receipt generation
- 💼 Financial reports & analytics
- 🏦 Defaulter tracking

### Clinical & Practical Training
- 🏥 Clinical rotation management
- 📋 Hospital partner management
- 👨‍⚕️ Supervisor log tracking
- ✅ Competency assessment

### Administrative
- 👥 User account management
- 🔐 Role-based access control
- 📢 Notice board & messaging
- 📖 Library management system
- 📄 Certificate generation

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Database**: PostgreSQL (Supabase)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or bun
- Supabase account
- Vercel account

### Local Development

```bash
# Clone repository
git clone https://github.com/Unrully2/MTC-SAAS.git
cd MTC-SAAS

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Add your Supabase credentials
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key

# Run development server
npm run dev
```

Visit `http://localhost:3000` and login with demo credentials.

## 🚀 Production Deployment

### Step 1: Setup Supabase
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Supabase setup instructions.

### Step 2: Deploy to Vercel
```bash
# Vercel CLI
npm i -g vercel
vercel
```

Or connect GitHub repository directly in Vercel dashboard.

### Step 3: Configure Environment
Add these to Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`
- `VITE_DEMO_USERS_ENABLED=false` (production only)

👉 **Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| Administrator | Full system access, create users, system settings |
| Principal | View all reports, strategic decisions |
| Registrar | Manage courses, students, academic records |
| Finance Officer | Manage fees, payments, invoices |
| Lecturer | Record attendance, grades, manage classes |
| Librarian | Manage library, books, borrowing |
| Reception | Register students, manage inquiries |
| Student | View personal records, grades, fees |

## 📖 User Management

### Creating Staff Accounts

1. Login as **Administrator**
2. Go to **Settings** → **User Accounts & Staff Portal**
3. Click **"Create New User Account"**
4. Fill in details and select role
5. Click **Create Account**
6. Share credentials with staff

### Account Features
- Email-based authentication
- Role-based access control
- Session management
- Password recovery
- Activity logging

## 🔐 Security

- ✅ Supabase authentication (built-in security)
- ✅ Row-level security (RLS) on database
- ✅ Role-based access control (RBAC)
- ✅ Environment variable protection
- ✅ HTTPS by default (Vercel)
- ✅ Automatic daily backups

## 📚 API Documentation

### Authentication
```javascript
import { authenticateUser, logoutUser, hasRole } from './assets/js/auth.js';

// Login
await authenticateUser(email, password);

// Check permissions
if (hasRole('administrator')) {
  // Admin operations
}
```

### Data APIs
```javascript
import * as studentAPI from './api/students.ts';
import * as courseAPI from './api/courses.ts';
import * as financeAPI from './api/finance.ts';

// Get students
await studentAPI.getStudents(courseId, status);

// Create student
await studentAPI.createStudent(studentData);

// Get courses
await courseAPI.getCourses();

// Record payment
await financeAPI.recordPayment(paymentData);
```

## 🧪 Testing

### Demo Accounts (Development Only)
```
Admin:      admin@mercylifecollege.ac.ke / password
Student:    student@mercylifecollege.ac.ke / password
Lecturer:   lecturer@mercylifecollege.ac.ke / password
Finance:    finance@mercylifecollege.ac.ke / password
```

### Running Tests
```bash
npm run lint
npm run build
```

## 📊 Monitoring

- **Vercel Analytics**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Performance**: Monitor in Vercel > Analytics
- **Errors**: Check Vercel > Logs

## 🆘 Troubleshooting

**Cannot login?**
- Verify email matches Supabase auth user
- Check that user profile exists in database
- Clear browser cookies and try again

**"Access Denied" error?**
- Verify user role in Supabase profiles table
- Check RLS policies are correct
- Check browser console for detailed errors

**Build fails on Vercel?**
- Check build logs in Vercel dashboard
- Run `npm run build` locally
- Verify all environment variables are set

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more troubleshooting.

## 📄 Scripts

```bash
# Development
npm run dev          # Start dev server
npm run lint         # Check TypeScript
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed sample data
```

## 📁 Project Structure

```
MTC-SAAS/
├── assets/
│   ├── css/              # Stylesheets
│   │   ├── style.css     # Global styles
│   │   ├── dashboard.css
│   │   ├── finance.css
│   │   └── students.css
│   └── js/              # JavaScript modules
│       ├── auth.js      # Authentication
│       └── components/  # UI components
├── api/                 # Backend APIs
│   ├── auth.ts
│   ├── students.ts
│   ├── courses.ts
│   ├── finance.ts
│   └── attendance.ts
├── src/                 # React source (future)
├── *.html               # Page templates
├── schema.sql           # Database schema
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json          # Vercel config
└── DEPLOYMENT.md        # Deployment guide
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## 📝 License

Apache 2.0 License - See LICENSE file

## 📞 Support

- 📧 Email: support@mercylifecollege.ac.ke
- 🐛 Issues: https://github.com/Unrully2/MTC-SAAS/issues
- 📖 Docs: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎉 Acknowledgments

- Built with ❤️ for Mercylife Training College
- Powered by Supabase, Vercel, and React
- Medical education excellence in mind

---

**Version**: 1.0.0  
**Last Updated**: September 2026  
**Status**: Production Ready ✅
