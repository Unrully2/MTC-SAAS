# Mercylife ERP - User Account Management Guide

## Overview

Only **Administrators** can create and manage user accounts. This guide explains how to create accounts for all staff roles.

---

## 🔓 Accessing Account Management

1. **Login as Administrator**
   - Email: `admin@mercylifecollege.ac.ke`
   - Password: (your admin password)

2. **Go to Settings**
   - Click "⚙️ Settings" in left sidebar

3. **Find "User Accounts & Staff Portal"**
   - Scroll down to this section
   - Click "Create New User Account" button

---

## 👥 Available Roles

### 1. **Administrator**
- Full system access
- Can create/manage all accounts
- Access to system settings
- Can enable/disable demo mode
- Can clear sample data

**Who**: Chief admin, IT manager

---

### 2. **Principal**
- View all reports
- Access all student/staff data
- Approve major decisions
- View financial reports
- Strategic oversight

**Who**: College principal, rector

---

### 3. **Registrar**
- Manage student admissions
- Create/edit student records
- Manage course catalog
- Track academic progress
- Generate transcripts
- View attendance records

**Who**: Academic registrar, admissions staff

---

### 4. **Finance Officer**
- Create invoices
- Record payments
- View payment history
- Generate financial reports
- Track fee defaulters
- Export finance data

**Who**: Finance manager, accountant

---

### 5. **Lecturer**
- Mark student attendance
- Record exam/CAT marks
- View class roster
- Generate result slips
- View grades submitted
- Access class resources

**Who**: Teachers, trainers, instructors

---

### 6. **Librarian**
- Add books to catalog
- Issue books to students
- Process returns
- Calculate overdue fines
- Generate library reports
- View borrowing history

**Who**: Library manager, assistant librarian

---

### 7. **Reception Officer**
- Register new students
- View student contact info
- Manage inquiries
- Schedule appointments
- Create notices
- Update announcements

**Who**: Reception staff, front desk

---

### 8. **Student**
- View personal profile
- Check grades and results
- View fee balance
- Check attendance
- Borrow library books
- View notices

**Who**: Student users (limited access)

---

## ➕ Creating a New Account

### Step-by-Step Process

1. **Click "Create New User Account"** button

2. **Fill in Email**
   - Format: `firstname@mercylifecollege.ac.ke`
   - Example: `john.lecturer@mercylifecollege.ac.ke`

3. **Enter Full Name**
   - Example: `Dr. John Kimani`
   - Use official full name

4. **Set Password**
   - Must be strong (12+ characters)
   - Mix of uppercase, lowercase, numbers, symbols
   - Share securely with user
   - User can change after first login

5. **Select Role**
   - Choose from dropdown
   - See above for role descriptions
   - User will have access only to this role's features

6. **Optional: Enter Title/Designation**
   - Example: `Lecturer - Anatomy`
   - Example: `Finance Officer`
   - Example: `Head Librarian`
   - Displays in user profile

7. **Click "Create Account"**
   - System creates auth user
   - System creates profile
   - Assigns role and permissions
   - Account is active immediately

---

## 📝 Account Creation Examples

### Example 1: Create Lecturer Account

```
Email: jane.lecturer@mercylifecollege.ac.ke
Full Name: Dr. Jane Mwangi
Password: SecurePass123!@#
Role: Lecturer
Title: Lecturer - Physiology
```

**Result**: Jane can access attendance, grades, class roster, results.

---

### Example 2: Create Finance Officer Account

```
Email: peter.finance@mercylifecollege.ac.ke
Full Name: Peter Kipchoge
Password: FinanceSecure456!@#
Role: Finance Officer
Title: Finance Officer
```

**Result**: Peter can manage invoices, payments, financial reports.

---

### Example 3: Create Student Account

```
Email: amara.hassan@mercylifecollege.ac.ke
Full Name: Amara Hassan Mohamed
Password: StudentPass789!@#
Role: Student
Title: (leave empty)
```

**Result**: Amara can view her profile, grades, fees, attendance.

---

## 🔄 Sharing Credentials

### Secure Sharing Method

**DO:**
1. ✅ Send email with credentials separately
2. ✅ Include temporary password
3. ✅ Ask user to change password on first login
4. ✅ Use secure email or in-person
5. ✅ Verify receipt by user

**DON'T:**
1. ❌ Share multiple credentials in one message
2. ❌ Post credentials in chat/Slack
3. ❌ Email plain password in same as username
4. ❌ Write passwords on paper
5. ❌ Share with unauthorized people

### Sample Sharing Email

```
Subject: Your Mercylife ERP Account

Dear Dr. Mwangi,

Your account has been created in the Mercylife College ERP system.

Access Details:
- URL: https://your-domain.vercel.app
- Email: jane.lecturer@mercylifecollege.ac.ke
- Temporary Password: (sent separately)

On first login:
1. Enter your email and password
2. Go to Settings > Change Password
3. Create a strong personal password

Your Role: Lecturer
Permissions: Attendance, Grades, Class Roster, Results

For technical support, contact IT.

Best regards,
Administration
```

---

## ✏️ Editing Existing Accounts

1. Go to Settings > User Accounts
2. Find user in list
3. Click "Edit" or pencil icon
4. Modify:
   - Full name
   - Title
   - Contact info
5. Click "Save Changes"

**Note**: Cannot change email or role via UI. Contact admin or use Supabase dashboard.

---

## 🔑 Password Management

### User Changes Own Password

1. Login to account
2. Click avatar > Settings
3. Click "Change Password"
4. Enter:
   - Current password
   - New password (12+ chars)
   - Confirm new password
5. Click "Update Password"

### Admin Resets User Password

1. Go to Supabase dashboard
2. Click Authentication > Users
3. Find user by email
4. Click the three dots menu
5. Click "Reset password"
6. Confirm
7. Send new temporary password to user

---

## 🚫 Disabling/Removing Accounts

### Disable Account (Temporarily)

1. Go to Supabase dashboard
2. Authentication > Users
3. Find user
4. Click three dots
5. Click "Disable user"
6. Click "Confirm"

**Result**: User cannot login but account data preserved.

### Delete Account (Permanent)

1. Go to Supabase dashboard
2. Authentication > Users
3. Find user
4. Click three dots
5. Click "Delete user"
6. Click "Confirm"

⚠️ **Warning**: This is permanent. All user data is deleted.

---

## 🔐 Security Best Practices

### Password Policy
- Minimum 12 characters
- Must include:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Symbols (!@#$%^&*)
- Change every 90 days
- No reuse of last 5 passwords

### Access Control
- Only admin can create accounts
- Each role limited to its features
- No cross-role access
- All access logged
- Suspicious activity alerted

### Account Monitoring
- Review new accounts monthly
- Verify active users
- Disable unused accounts
- Check access logs
- Audit role assignments

---

## 📊 Account Statistics

### View User Count

1. Go to Settings
2. Scroll to "User Accounts & Staff Portal"
3. See total users created
4. See breakdown by role

---

## ❓ FAQ

**Q: Can a user have multiple roles?**
A: Not via UI. Contact support for custom role assignments.

**Q: How many admin accounts should we have?**
A: Minimum 2 (for redundancy), maximum 3-5. Fewer is more secure.

**Q: Can students create their own accounts?**
A: No. Only admin creates accounts. Students are added during admission.

**Q: What if user forgets password?**
A: Admin can reset via Supabase dashboard and send temporary password.

**Q: Can we require 2-factor authentication?**
A: Yes, in Supabase Auth settings. Contact admin.

**Q: How long do sessions last?**
A: 24 hours of inactivity, then auto-logout.

---

## 📞 Support

**For account issues:**
- Contact your administrator
- Email: admin@mercylifecollege.ac.ke
- Phone: (See contact list)

**For technical issues:**
- Check browser console (F12)
- Clear cookies and try again
- Check Supabase status page
- Create GitHub issue

---

**Last Updated**: September 2026  
**Version**: 1.0.0
