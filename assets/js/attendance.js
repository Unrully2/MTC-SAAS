// =========================================================
// CLASS ATTENDANCE MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { getCurrentUser, enforcePageAccess } from './auth.js';
import { getStatusBadge } from './utils.js';
import { showToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess();
  renderSidebar('attendance');
  renderNavbar('Class & Clinical Attendance');

  await loadAttendanceData();

  document.getElementById('save-attendance-btn')?.addEventListener('click', async () => {
    showToast('Attendance register saved successfully.');
  });
});

async function loadAttendanceData() {
  const students = await dbService.getStudents();
  const attendance = await dbService.getAttendance();

  const tbody = document.getElementById('attendance-tbody');
  if (!tbody) return;

  tbody.innerHTML = students.map(s => `
    <tr>
      <td><strong>${s.admission_no}</strong></td>
      <td>${s.full_name}</td>
      <td>${s.course_name}</td>
      <td>
        <select class="form-control att-status-select" style="padding:0.25rem; font-size:0.8rem; font-weight:600;">
          <option value="present" selected>Present ✅</option>
          <option value="late">Late ⏰</option>
          <option value="absent">Absent ❌</option>
          <option value="excused">Excused Medical 🏥</option>
        </select>
      </td>
      <td><input type="text" class="form-control" placeholder="Remarks..." style="padding:0.25rem; font-size:0.8rem;" /></td>
    </tr>
  `).join('');
}
