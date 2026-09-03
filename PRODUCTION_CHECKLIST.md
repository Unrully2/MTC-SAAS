# Mercylife Training College ERP - Production Deployment Checklist

## Phase 1: Pre-Deployment Setup (48 hours before launch)

### Supabase Configuration
- [ ] Create Supabase project
- [ ] Get project credentials (URL & Anon Key)
- [ ] Run schema.sql to create all tables
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Configure RLS policies for data access control
- [ ] Create initial admin user in Supabase Auth
- [ ] Insert admin profile in profiles table
- [ ] Test database connectivity
- [ ] Setup automated backups (7-day retention)
- [ ] Enable audit logging on profiles table
- [ ] Test RLS policies with sample queries

### Vercel Setup
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Create new project in Vercel
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`
- [ ] Add environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_BASE_URL`
  - `VITE_DEMO_USERS_ENABLED=false`
  - `VITE_APP_ENV=production`
- [ ] Configure preview deployments for PRs
- [ ] Setup deployment notifications
- [ ] Configure custom domain (if applicable)
- [ ] Enable HTTPS (automatic)
- [ ] Setup analytics and monitoring

### Local Development Test
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env.local` with Supabase credentials
- [ ] Run `npm run dev`
- [ ] Test login with admin account
- [ ] Test role-based access control
- [ ] Test all major features
- [ ] Run `npm run build` successfully
- [ ] Test `npm run preview`
- [ ] Run `npm run lint` (no errors)

---

## Phase 2: Security & Access Control (24 hours before launch)

### Authentication Testing
- [ ] Test admin login flow
- [ ] Test creating new user account
- [ ] Test staff login with different roles
- [ ] Test student login
- [ ] Test password reset flow
- [ ] Verify session timeout works
- [ ] Test logout functionality
- [ ] Verify demo accounts disabled in production
- [ ] Test concurrent login (multiple tabs)
- [ ] Verify session data is cleared on logout

### Role-Based Access Control
- [ ] Admin can access Settings page
- [ ] Admin can create new users
- [ ] Registrar can access Student Management
- [ ] Finance Officer can access Finance module
- [ ] Lecturer can access Attendance & Grades
- [ ] Librarian can access Library
- [ ] Student cannot access admin features
- [ ] Verify URLs are protected
- [ ] Test access to restricted data (should fail)
- [ ] Audit RLS policy execution

### Data Security
- [ ] Verify sensitive data (passwords) not logged
- [ ] Verify API keys not exposed in frontend
- [ ] Test CORS headers are correct
- [ ] Verify HTTPS is enforced
- [ ] Test SQL injection protection (Supabase handles)
- [ ] Verify XSS protection
- [ ] Check Content Security Policy headers
- [ ] Verify no secrets in `.env.example`
- [ ] Review `.gitignore` includes `.env*`
- [ ] Verify API responses don't contain sensitive data

---

## Phase 3: Functional Testing (12 hours before launch)

### Student Management
- [ ] Create new student record
- [ ] Edit student details
- [ ] Search students by name/ID
- [ ] Filter students by course/status
- [ ] Export student roster to CSV
- [ ] Delete student (soft delete)
- [ ] View student history

### Academic Management
- [ ] Create new course
- [ ] Create course units/modules
- [ ] Assign units to courses
- [ ] Record attendance
- [ ] Enter exam/CAT marks
- [ ] Generate result slips
- [ ] Calculate GPA
- [ ] Export academic reports

### Finance Management
- [ ] Create invoice
- [ ] Record fee payment
- [ ] Handle partial payments
- [ ] Mark invoice as paid
- [ ] Generate receipts
- [ ] View payment history
- [ ] Filter by status (paid, unpaid, overdue)
- [ ] Export finance reports

### Attendance Management
- [ ] Mark attendance for class
- [ ] View attendance statistics
- [ ] Generate attendance reports
- [ ] Handle late arrivals
- [ ] Add excuse notes
- [ ] Export attendance data

### Messaging & Notices
- [ ] Post new notice
- [ ] Edit notice
- [ ] Delete notice
- [ ] Display notices on dashboard
- [ ] Filter notices by date

### Library Management
- [ ] Add new book
- [ ] Issue book to student
- [ ] Return book
- [ ] Calculate overdue fines
- [ ] View borrowing history

### Clinical Attachments
- [ ] Assign clinical rotation
- [ ] Assign clinical supervisor
- [ ] Track clinical hours
- [ ] Record competencies
- [ ] Generate logbook

---

## Phase 4: Performance & Load Testing (6 hours before launch)

### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Dashboard loads in < 2 seconds
- [ ] Search results load in < 1 second
- [ ] Export CSV completes in < 5 seconds
- [ ] No console errors in browser DevTools
- [ ] No 404 errors for assets
- [ ] Images optimize and cache properly
- [ ] Database queries optimized (use indexes)
- [ ] Verify bundle size < 500KB gzipped

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Sidebar menu responsive
- [ ] Tables scrollable on mobile
- [ ] Forms mobile-friendly

---

## Phase 5: Deployment (Launch Day)

### Pre-Deployment
- [ ] Backup Supabase database
- [ ] Test all rollback procedures
- [ ] Prepare status page
- [ ] Notify stakeholders
- [ ] Have team on standby
- [ ] Document all credentials in secure vault
- [ ] Test Vercel rollback procedure

### Deployment
- [ ] Merge final changes to `main` branch
- [ ] Verify Vercel build succeeds
- [ ] Verify all environment variables deployed
- [ ] Wait for deployment to complete
- [ ] Verify deployment URL is accessible
- [ ] Clear browser cache and test login
- [ ] Verify Supabase connection works
- [ ] Check Vercel analytics dashboard

### Post-Deployment
- [ ] Test admin login with production credentials
- [ ] Verify all pages load correctly
- [ ] Test all major features
- [ ] Check error logs in Vercel
- [ ] Monitor Supabase activity dashboard
- [ ] Verify no errors in browser console
- [ ] Test on multiple devices/browsers
- [ ] Monitor performance metrics
- [ ] Document any issues found
- [ ] Create incident tickets for any problems

---

## Phase 6: Launch & Monitoring (Post-Deployment)

### Day 1 Monitoring
- [ ] Monitor Vercel dashboard hourly
- [ ] Monitor Supabase dashboard hourly
- [ ] Check error logs every 30 minutes
- [ ] Be available for emergency issues
- [ ] Document any issues or improvements
- [ ] Gather user feedback
- [ ] Monitor database performance
- [ ] Verify backups are occurring

### Week 1 Monitoring
- [ ] Daily check of error logs
- [ ] Daily check of performance metrics
- [ ] Monitor database size growth
- [ ] Verify auth system stability
- [ ] Monitor API response times
- [ ] Check for any security issues
- [ ] Review user activity logs
- [ ] Test role-based access regularly

### Week 2+ Maintenance
- [ ] Weekly performance review
- [ ] Weekly security audit
- [ ] Monthly backup verification
- [ ] Monthly dependency updates
- [ ] Quarterly security assessment
- [ ] Monitor uptime metrics
- [ ] Gather continuous improvement feedback
- [ ] Plan for new features

---

## Emergency Procedures

### If Login Fails
1. Check Supabase auth service status
2. Verify database connection in Supabase
3. Check environment variables in Vercel
4. Review logs for error messages
5. If database issue: Restore from backup
6. If code issue: Rollback to previous deployment
7. Notify users if extended outage

### If Data is Missing/Corrupted
1. Stop all operations immediately
2. Don't make any writes to database
3. Go to Supabase > Backups
4. Restore from most recent clean backup
5. Test restored data
6. Identify root cause
7. Implement fix
8. Notify affected users

### If Performance Degrades
1. Check Vercel analytics for traffic spikes
2. Check Supabase database connections
3. Review slow query logs
4. Check for N+1 query problems
5. Optimize queries or add indexes
6. If cache needed: Implement Redis
7. Scale Vercel if needed
8. Scale Supabase resources if needed

### If Security Issue Discovered
1. Isolate the affected component
2. Assess severity and impact
3. Create security incident ticket
4. Develop and test fix
5. Deploy fix immediately
6. Review logs for exploitation signs
7. Notify affected users
8. Conduct post-incident analysis

---

## Sign-Off

**Project Manager**: ______________ Date: __________

**Technical Lead**: ______________ Date: __________

**QA Lead**: ______________ Date: __________

**Security Officer**: ______________ Date: __________

**Principal/Stakeholder**: ______________ Date: __________

---

**Production Launch Date**: ____________________

**All items must be checked before going live.**

Last Updated: September 2026
