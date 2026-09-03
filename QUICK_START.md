# Quick Start Guide - Mercylife ERP Production Deployment

## 🚀 5-Minute Setup Overview

This guide walks you through deploying the Mercylife ERP system to production in the fastest way possible.

---

## ⏱️ Step 1: Supabase Setup (10 minutes)

### 1.1 Create Supabase Project

```bash
# Go to https://supabase.com
# Click "New Project"
# Fill in:
# - Project Name: Mercylife-ERP
# - Database Password: (save this!)
# - Region: Choose closest to you
# Click "Create new project"
# Wait 2-3 minutes for initialization
```

### 1.2 Copy Your Credentials

1. In Supabase dashboard, click **Settings** (gear icon)
2. Click **API** in left sidebar
3. Copy these values:
   - **Project URL** → Save as `VITE_SUPABASE_URL`
   - **anon public** → Save as `VITE_SUPABASE_ANON_KEY`

### 1.3 Initialize Database

1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy entire content from `schema.sql` file in this repo
4. Paste into SQL editor
5. Click **Run**
6. Wait for completion ✅

### 1.4 Create Admin Account

1. Click **Authentication** in left sidebar
2. Click **Users**
3. Click **Add User**
4. Fill in:
   - Email: `admin@mercylifecollege.ac.ke`
   - Password: Use strong password
   - Auto confirm email: ✓
5. Click **Save**
6. Copy the User ID (you'll need it)

### 1.5 Insert Admin Profile

1. In SQL Editor, create new query
2. Replace `USER_ID_HERE` with copied User ID and run:

```sql
INSERT INTO profiles (id, email, full_name, role, title)
VALUES (
  'USER_ID_HERE',
  'admin@mercylifecollege.ac.ke',
  'Chief Administrator',
  'administrator',
  'System Administrator'
);
```

✅ **Supabase is ready!**

---

## 🌐 Step 2: Vercel Deployment (5 minutes)

### 2.1 Connect Repository

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Select repository `Unrully2/MTC-SAAS`
5. Click **Import**

### 2.2 Configure Environment

In the "Configure Project" section:

```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.3 Add Environment Variables

Click **Environment Variables** and add:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | All |
| `VITE_SUPABASE_ANON_KEY` | Your Anon Key | All |
| `VITE_API_BASE_URL` | `https://your-domain.vercel.app/api` | Production |
| `VITE_DEMO_USERS_ENABLED` | `false` | Production |
| `VITE_APP_ENV` | `production` | Production |

### 2.4 Deploy

Click **Deploy**

⏳ Wait 2-3 minutes for build...

✅ **You now have a live URL!** (e.g., `https://mtc-saas-abc123.vercel.app`)

---

## ✅ Step 3: Test Production (5 minutes)

### 3.1 Test Admin Login

1. Go to your Vercel URL
2. You should see login page
3. Email: `admin@mercylifecollege.ac.ke`
4. Password: (the one you set in Supabase)
5. Click **Login**
6. Should see Dashboard ✓

### 3.2 Create First Staff Account

1. Click **Settings** (left menu)
2. Scroll to **User Accounts & Staff Portal**
3. Click **Create New User Account**
4. Fill in:
   - Email: `lecturer@mercylifecollege.ac.ke`
   - Full Name: Dr. John Lecturer
   - Password: Strong password
   - Role: **Lecturer**
   - Title: Lecturer - Anatomy
5. Click **Create Account**

### 3.3 Verify Different Roles

Create sample accounts to test:
- Finance Officer: `finance@mercylifecollege.ac.ke`
- Registrar: `registrar@mercylifecollege.ac.ke`
- Student: `student@mercylifecollege.ac.ke`

Test each login - each should see different menus ✓

---

## 📋 Critical Checklist Before Going Live

```
☐ Supabase project created
☐ Admin account created
☐ Schema imported successfully
☐ Vercel project deployed
☐ Environment variables set
☐ Admin login works
☐ Can create new user accounts
☐ Different roles see different menus
☐ No errors in browser console
☐ All pages load correctly
☐ Demo users disabled in production
☐ Backups configured in Supabase
```

---

## 🆘 Troubleshooting

### "Cannot connect to Supabase"

- [ ] Verify `VITE_SUPABASE_URL` is correct (should start with `https://`)
- [ ] Verify `VITE_SUPABASE_ANON_KEY` is correct
- [ ] Test in Supabase SQL editor: Run `SELECT * FROM profiles;`
- [ ] Rebuild in Vercel: Settings > Deployments > Trigger redeploy

### "Login shows blank page"

- [ ] Open browser DevTools (F12)
- [ ] Check Console tab for errors
- [ ] Clear browser cookies and try again
- [ ] Verify admin profile was inserted in database

### "Build failed on Vercel"

- [ ] Check build logs in Vercel dashboard
- [ ] Make sure all environment variables are set
- [ ] Try running `npm run build` locally
- [ ] Check that Node.js version is >=18

---

## 📚 Next Steps

After initial setup:

1. **Read Full Documentation**:
   - `DEPLOYMENT.md` - Complete deployment guide
   - `DATABASE_SCHEMA.md` - Database structure
   - `ARCHITECTURE.md` - System architecture
   - `PRODUCTION_CHECKLIST.md` - Pre-launch checklist

2. **Configure Custom Domain** (Optional):
   - In Vercel Settings > Domains
   - Add your custom domain
   - Configure DNS records

3. **Setup Monitoring**:
   - Vercel Analytics: View real-time metrics
   - Supabase Logs: Monitor database activity
   - Email alerts for errors

4. **Create Additional Accounts**:
   - Create all staff accounts
   - Set proper roles and permissions
   - Send credentials to staff securely

5. **Import Sample Data** (Optional):
   - Add courses and programs
   - Add students
   - Add staff members
   - Configure fee structure

---

## 🔐 Security Reminders

✅ **Do:**
- Use strong passwords (12+ characters)
- Keep Supabase credentials secret
- Never commit `.env.local` to GitHub
- Verify HTTPS is enabled
- Use Vercel dashboard for production secrets
- Monitor access logs regularly
- Review user accounts monthly

❌ **Don't:**
- Share API keys in emails or Slack
- Commit credentials to GitHub
- Use weak passwords
- Enable demo users in production
- Skip the security checklist
- Ignore error logs

---

## 💡 Key URLs

- **Your App**: `https://your-domain.vercel.app`
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Repo**: https://github.com/Unrully2/MTC-SAAS

---

## 📞 Support

If you get stuck:

1. Check `DEPLOYMENT.md` for detailed troubleshooting
2. Review browser console for error messages
3. Check Vercel build logs
4. Check Supabase database status
5. Create GitHub issue with error details

---

## ✨ You're Done!

You now have a production-ready ERP system running on Vercel + Supabase.

**What to do now:**

1. ✅ Test with your team
2. ✅ Create staff accounts
3. ✅ Import real data
4. ✅ Configure fees and programs
5. ✅ Train staff on the system
6. ✅ Go live with real data!

Congratulations! 🎉

---

**Questions?** Check the documentation files or create a GitHub issue.

**Last Updated**: September 2026  
**Version**: 1.0.0
