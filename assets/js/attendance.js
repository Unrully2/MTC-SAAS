// =========================================================
// CLASS ATTENDANCE MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { enforcePageAccess } from './auth.js';
import { showToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess();
  renderSidebar('attendance');
  renderNavbar('Class & Clinical Attendance');

  await loadAttendanceData();

  const saveBtn = document.getElementById('save-attendance-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveAttendance);
  }
});

async function loadAttendanceData() {
  try {
    const students = await dbService.getStudents();
    const tbody = document.getElementById('attendance-tbody');
    if (!tbody) return;

    if (!students || students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center">No students found.</td></tr>`;
      return;
    }

    tbody.innerHTML = students.map(s => `
      <tr data-student-id="${s.id}" data-student-name="${s.full_name}">
        <td><strong>${s.admission_no || 'N/A'}</strong></td>
        <td>${s.full_name || 'N/A'}</td>
        <td>${s.course_name || 'General Course'}</td>
        <td>
          <select class="form-control att-status-select" style="padding:0.25rem; font-size:0.8rem; font-weight:600;">
            <option value="present" selected>Present ✅</option>
            <option value="late">Late ⏰</option>
            <option value="absent">Absent ❌</option>
            <option value="excused">Excused Medical 🏥</option>
          </select>
        </td>
        <td><input type="text" class="form-control att-remarks-input" placeholder="Remarks..." style="padding:0.25rem; font-size:0.8rem;" /></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Error loading attendance data:", error);
    showToast("Failed to load student attendance list.", "danger");
  }
}

async function handleSaveAttendance() {
  const tbody = document.getElementById('attendance-tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr[data-student-id]');
  if (rows.length === 0) {
    showToast('No student records to save.', 'warning');
    return;
  }

  const currentDate = new Date().toISOString().split('T')[0];
  const attendanceRecords = [];

  rows.forEach(row => {
    const studentId = row.getAttribute('data-student-id');
    const studentName = row.getAttribute('data-student-name');
    const statusSelect = row.querySelector('.att-status-select');
    const remarksInput = row.querySelector('.att-remarks-input');

    if (studentId && statusSelect) {
      attendanceRecords.push({
        student_id: studentId,
        student_name: studentName,
        date: currentDate,
        status: statusSelect.value,
        remarks: remarksInput ? remarksInput.value.trim() : ''
      });
    }
  });

  try {
    await dbService.markAttendance(attendanceRecords);
    showToast('Attendance register saved successfully.', 'success');
  } catch (error) {
    console.error("Failed to save attendance:", error);
    showToast('Failed to save attendance records to Supabase.', 'danger');
  }
}
