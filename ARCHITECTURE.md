# MTC-SAAS Production Deployment

This document outlines the production deployment architecture and processes.

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌──────────────────────────────────────────┐
│         Vercel Edge Network              │
│  (Global CDN + Serverless Functions)     │
└──────────────┬─────────────────────────────┘
               │
      ┌────────┴─────────┐
      │                  │
      ▼                  ▼
 ┌─────────┐      ┌──────────────┐
 │ Vite    │      │   Supabase   │
 │ Build   │      │ (PostgreSQL  │
 │Output   │      │  + Auth +    │
 │(HTML    │      │  Realtime)   │
 │CSS/JS)  │      └──────────────┘
 └─────────┘
```

## Deployment Process

### 1. Development
- Local development with `npm run dev`
- Test with demo accounts
- Commit changes to GitHub

### 2. Staging (Preview)
- Vercel automatically creates preview deployments for PRs
- Test all features before merging to main
- Review environment configurations

### 3. Production
- Merge PR to `main` branch
- Vercel automatically triggers build
- Build process:
  - Install dependencies
  - Run TypeScript checks (`npm run lint`)
  - Build with Vite (`npm run build`)
  - Deploy to Vercel Edge Network
- Automatic rollback if build fails

## Environment Configuration

### Production (.env.production)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxx
VITE_API_BASE_URL=https://your-domain.vercel.app/api
VITE_DEMO_USERS_ENABLED=false
VITE_APP_ENV=production
```

### Development (.env.local)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxx
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEMO_USERS_ENABLED=true
VITE_APP_ENV=development
```

## Security Checklist

- [ ] Never commit `.env.local` to GitHub
- [ ] Use Vercel dashboard for production secrets
- [ ] Enable RLS on all Supabase tables
- [ ] Verify CORS policies
- [ ] Test auth with different roles
- [ ] Audit database access logs
- [ ] Monitor Vercel analytics for anomalies
- [ ] Keep dependencies updated

## Monitoring & Alerts

### Vercel Metrics
- Response time < 500ms (target)
- Zero critical errors
- 99.9% uptime SLA

### Supabase Metrics
- Database connection pool health
- Query performance (< 100ms average)
- Auth user activity
- Storage usage

## Rollback Procedures

### Vercel Rollback
1. Go to Vercel dashboard
2. Select project
3. Go to Deployments
4. Click the previous working deployment
5. Click "Promote to Production"

### Database Rollback
1. Go to Supabase dashboard
2. Select project
3. Go to Backups
4. Restore from desired backup point
5. Test restore on staging first

## Performance Optimization

### Frontend
- Code splitting via Vite
- Image optimization
- CSS minification
- JavaScript minification
- Caching headers configured

### Backend (Supabase)
- Database indexes on frequently queried columns
- Connection pooling enabled
- Query optimization
- Full-text search indexes

## Disaster Recovery

### RTO (Recovery Time Objective): 1 hour
### RPO (Recovery Point Objective): Daily

### Backup Strategy
- Supabase: Automated daily backups (7-day retention)
- GitHub: Source code version control
- Vercel: Build artifacts cached

### Restore Procedure
1. Identify issue (database corruption, data loss, etc.)
2. Create incident ticket
3. For database: Restore from Supabase backup
4. For code: Rollback to previous deployment
5. Test restored system
6. Notify users once recovered
7. Post-incident analysis

## Maintenance Windows

- No planned maintenance windows
- Vercel handles infrastructure updates automatically
- Supabase handles database maintenance automatically
- Emergency patches deployed immediately

## Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **GitHub Issues**: https://github.com/Unrully2/MTC-SAAS/issues
