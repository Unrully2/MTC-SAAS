// =========================================================
// DASHBOARD MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { getCurrentUser, enforcePageAccess } from './auth.js';
import { formatCurrency, getStatusBadge } from './utils.js';
import { showToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess();
  renderSidebar('dashboard');
  
  const user = getCurrentUser() || {};
  const firstName = user.full_name ? user.full_name.split(' ')[0] : (user.username || 'User');
  renderNavbar(`Welcome back, ${firstName}!`);

  await loadDashboardData();
});

async function loadDashboardData() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  // Safe loading wrappers to prevent a single failing fetch from breaking the entire page
  let students = [], courses = [], invoices = [], payments = [], clinicals = [], announcements = [];

  try {
    const results = await Promise.allSettled([
      dbService.getStudents(),
      dbService.getCourses(),
      dbService.getInvoices(),
      dbService.getPayments(),
      dbService.getClinicalAttachments(),
      dbService.getAnnouncements()
    ]);

    students = results[0].status === 'fulfilled' && Array.isArray(results[0].value) ? results[0].value : [];
    courses = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];
    invoices = results[2].status === 'fulfilled' && Array.isArray(results[2].value) ? results[2].value : [];
    payments = results[3].status === 'fulfilled' && Array.isArray(results[3].value) ? results[3].value : [];
    clinicals = results[4].status === 'fulfilled' && Array.isArray(results[4].value) ? results[4].value : [];
    announcements = results[5].status === 'fulfilled' && Array.isArray(results[5].value) ? results[5].value : [];
  } catch (error) {
    console.error("Dashboard data fetching error:", error);
    showToast("Error loading some dashboard statistics", "warning");
  }

  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);
  const totalBalance = invoices.reduce((sum, i) => sum + (Number(i.balance) || 0), 0);
  const defaultersCount = invoices.filter(i => (Number(i.balance) || 0) > 0).length;

  // Calculate dynamic enrollment breakdown by course
  const totalStudents = students.length;
  const courseCounts = {};
  students.forEach(s => {
    const cName = s.course_name || 'Other / General';
    courseCounts[cName] = (courseCounts[cName] || 0) + 1;
  });

  const enrollmentBreakdownHTML = totalStudents > 0 
    ? Object.entries(courseCounts).map(([courseName, count]) => {
        const pct = Math.round((count / totalStudents) * 100);
        return `
          <div>
            <div style="display:flex; justify-space-between; font-size:0.8rem; font-weight:600;">
              <span>${courseName}</span>
              <span>${pct}% (${count})</span>
            </div>
            <div style="height:8px; background:var(--border-color, #e2e8f0); border-radius:4px; overflow:hidden; margin-top:4px;">
              <div style="width:${pct}%; height:100%; background:var(--color-primary, #059669);"></div>
            </div>
          </div>
        `;
      }).join('')
    : `<div style="font-size:0.85rem; color:var(--text-muted);">No active student enrollment data available.</div>`;

  container.innerHTML = `
    <!-- Top Metrics Cards -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon-box metric-icon-green">🎓</div>
        <div class="metric-details">
          <span class="metric-value">${students.length}</span>
          <span class="metric-label">Enrolled Students</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon-box metric-icon-blue">📚</div>
        <div class="metric-details">
          <span class="metric-value">${courses.length}</span>
          <span class="metric-label">Active Medical Courses</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon-box metric-icon-purple">💰</div>
        <div class="metric-details">
          <span class="metric-value">${formatCurrency(totalRevenue)}</span>
          <span class="metric-label">Total Fee Collections</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon-box metric-icon-amber">⚠️</div>
        <div class="metric-details">
          <span class="metric-value">${formatCurrency(totalBalance)}</span>
          <span class="metric-label">Fee Balances (${defaultersCount} Students)</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon-box metric-icon-red">🏥</div>
        <div class="metric-details">
          <span class="metric-value">${clinicals.length}</span>
          <span class="metric-label">Mercylite Hospital Rotations</span>
        </div>
      </div>
    </div>

    <!-- Quick Action Bar -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-header" style="border:none; margin:0; padding-bottom:0.5rem;">
        <h3 class="card-title">⚡ Quick ERP Actions</h3>
      </div>
      <div class="quick-actions-bar" style="padding-top:0.5rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
        <a href="students.html?action=new" class="btn btn-primary">➕ Admit New Student</a>
        <a href="finance.html?action=pay" class="btn btn-secondary">💳 Record Fee Receipt</a>
        <a href="results.html" class="btn btn-secondary">📝 Enter Exam Marks</a>
        <a href="attendance.html" class="btn btn-secondary">📅 Mark Attendance</a>
        <a href="messaging.html" class="btn btn-outline">📢 Post Notice</a>
      </div>
    </div>

    <!-- Main Content Layout -->
    <div class="dashboard-charts-grid">
      <!-- Left Column: Admissions & Timetable -->
      <div>
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <div>
              <h3 class="card-title">📋 Recent Admissions</h3>
              <span class="card-subtitle">Latest student enrollments across programs</span>
            </div>
            <a href="students.html" class="btn btn-sm btn-outline">View All Students</a>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Student Name</th>
                  <th>Course</th>
                  <th>County</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${students.length > 0 ? students.slice(0, 5).map(s => `
                  <tr>
                    <td><strong>${s.admission_no || 'N/A'}</strong></td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.5rem;">
                        <img src="${s.passport_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;" />
                        <span>${s.full_name || 'Unnamed Student'}</span>
                      </div>
                    </td>
                    <td>${s.course_name || 'Unassigned'}</td>
                    <td>${s.county || 'N/A'}</td>
                    <td>${getStatusBadge(s.status || 'Active')}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-muted);">
                      No student enrollment records found.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Timetable Today -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📅 Today's Clinical & Lecture Schedule</h3>
            <span class="badge-pill badge-primary">Mercylite Main Campus</span>
          </div>
          <div class="timeline-feed">
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div>
                <strong>08:30 AM - 10:30 AM</strong>: Human Anatomy & Histology Lab (Anatomy Lab 2)
                <div style="font-size:0.8rem; color:var(--text-muted);">Lecturer: Dr. Evans Mburu | Diploma Clinical Medicine</div>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot" style="background-color:#15803D;"></div>
              <div>
                <strong>11:00 AM - 01:00 PM</strong>: Fundamentals of Nursing Practice (Skills Lab 1)
                <div style="font-size:0.8rem; color:var(--text-muted);">Lecturer: Sr. Grace Wanjiku | KRCHN Nursing Year 1</div>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot" style="background-color:#0369A1;"></div>
              <div>
                <strong>02:00 PM - 04:30 PM</strong>: Emergency Ward Rotation (Mercylite Hospital)
                <div style="font-size:0.8rem; color:var(--text-muted);">Supervisor: Dr. Harrison Kamau | Clinical Medicine Year 2</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Announcements & Distribution -->
      <div>
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-header">
            <h3 class="card-title">📢 Notice Board</h3>
            <a href="messaging.html" class="btn btn-sm btn-outline">All Notices</a>
          </div>
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${announcements.length > 0 ? announcements.slice(0, 3).map(a => `
              <div style="padding:0.75rem; background:var(--bg-hover); border-radius:var(--radius-md); border-left:4px solid var(--color-primary);">
                <div style="font-weight:700; font-size:0.9rem;">${a.title || 'Untitled Notice'}</div>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">${a.content || ''}</div>
                <div style="font-size:0.7rem; color:var(--color-primary); margin-top:0.4rem; font-weight:600;">📅 ${a.date || 'Today'} • ${a.author || 'Administration'}</div>
              </div>
            `).join('') : `
              <div style="padding:1rem; text-align:center; color:var(--text-muted); font-size:0.85rem;">
                No active notices posted.
              </div>
            `}
          </div>
        </div>

        <!-- Dynamic Course Capacity / Enrollment Breakdown -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📊 Enrollment Breakdown</h3>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.85rem;">
            ${enrollmentBreakdownHTML}
          </div>
        </div>
      </div>
    </div>
  `;
}
