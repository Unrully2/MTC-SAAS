// =========================================================
// EXAMINATIONS & RESULTS MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { getCurrentUser, enforcePageAccess } from './auth.js';
import { getStatusBadge, printDocument } from './utils.js';
import { createModal } from './components/modal.js';
import { showToast } from './components/toast.js';

let results = [];
let students = [];
let courses = [];

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess();
  renderSidebar('results');
  renderNavbar('Exams & Academic Results');

  await loadInitialData();

  document.getElementById('add-result-btn')?.addEventListener('click', () => {
    openMarksEntryModal();
  });
});

async function loadInitialData() {
  try {
    const fetchedData = await Promise.allSettled([
      dbService.getStudents(),
      dbService.getCourses()
    ]);

    students = fetchedData[0].status === 'fulfilled' && Array.isArray(fetchedData[0].value) ? fetchedData[0].value : [];
    courses = fetchedData[1].status === 'fulfilled' && Array.isArray(fetchedData[1].value) ? fetchedData[1].value : [];
  } catch (error) {
    console.error("Failed to load initial students/courses:", error);
    students = [];
    courses = [];
  }

  await loadResults();
}

async function loadResults() {
  try {
    results = (await dbService.getExamResults()) || [];
  } catch (error) {
    console.error("Failed to fetch exam results:", error);
    showToast("Error loading exam results.", "error");
    results = [];
  }

  renderResultsTable();
}

function renderResultsTable() {
  const tbody = document.getElementById('results-tbody');
  if (!tbody) return;

  if (results.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No examination results recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = results.map(r => {
    const studentName = escapeHtml(r.student_name || 'Unknown Student');
    const unitCode = escapeHtml(r.unit_code || 'N/A');
    const unitName = escapeHtml(r.unit_name || 'N/A');
    const grade = escapeHtml(r.grade || 'F');
    const remarks = escapeHtml(r.remarks || 'Pending');

    const badgeClass = grade === 'A' || grade === 'B' ? 'badge-success' : grade === 'C' ? 'badge-primary' : 'badge-danger';

    return `
      <tr>
        <td><strong>${studentName}</strong></td>
        <td><span class="badge-pill badge-primary">${unitCode}</span> ${unitName}</td>
        <td>${r.cat_marks ?? 0} / 30</td>
        <td>${r.exam_marks ?? 0} / 70</td>
        <td><strong>${r.total_marks ?? 0} / 100</strong></td>
        <td>
          <span class="badge-pill ${badgeClass}">
            GRADE ${grade}
          </span>
        </td>
        <td>${remarks}</td>
        <td>
          <button class="btn btn-sm btn-outline transcript-btn" data-student-id="${r.student_id || ''}" data-name="${studentName}">📜 Result Slip</button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.transcript-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      const studentId = e.currentTarget.getAttribute('data-student-id');
      const studentName = e.currentTarget.getAttribute('data-name');
      printResultSlip(studentId, studentName);
    });
  });
}

function calculateGrade(total) {
  if (total >= 75) return { grade: 'A', remarks: 'Distinction' };
  if (total >= 65) return { grade: 'B', remarks: 'Credit' };
  if (total >= 50) return { grade: 'C', remarks: 'Pass' };
  if (total >= 40) return { grade: 'D', remarks: 'Subsidiary Pass' };
  return { grade: 'F', remarks: 'Fail' };
}

function openMarksEntryModal() {
  if (students.length === 0) {
    showToast("No active students found. Please register students first.", "warning");
    return;
  }

  createModal({
    title: "📝 Record Student Exam Marks",
    bodyHTML: `
      <form id="results-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Select Student *</label>
          <select class="form-control" id="res-student" required>
            <option value="">-- Select Student --</option>
            ${students.map(s => `<option value="${s.id}">${escapeHtml(s.admission_no || '')} - ${escapeHtml(s.full_name || 'Unnamed')}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Unit Code & Name *</label>
          <select class="form-control" id="res-unit" required>
            <option value="">-- Choose Unit --</option>
            <option value="ANA-101|Human Anatomy & Histology I">ANA-101 - Human Anatomy & Histology I</option>
            <option value="PHY-102|Medical Physiology">PHY-102 - Medical Physiology</option>
            <option value="FAR-103|Pharmacology & Therapeutics">FAR-103 - Pharmacology & Therapeutics</option>
            <option value="NUR-201|Fundamentals of Nursing Practice">NUR-201 - Fundamentals of Nursing Practice</option>
            <option value="MLT-501|Clinical Chemistry & Hematology">MLT-501 - Clinical Chemistry & Hematology</option>
          </select>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Continuous Assessment (CAT) / 30 *</label>
            <input type="number" class="form-control" id="res-cat" max="30" min="0" required placeholder="0 - 30" />
          </div>
          <div class="form-group">
            <label class="form-label">Final Main Exam / 70 *</label>
            <input type="number" class="form-control" id="res-exam" max="70" min="0" required placeholder="0 - 70" />
          </div>
        </div>
      </form>
    `,
    footerHTML: `
      <button class="btn btn-secondary" id="cancel-res">Cancel</button>
      <button class="btn btn-primary" id="save-res">Compute Grade & Save</button>
    `,
    onOpen: (closeModal) => {
      document.getElementById('cancel-res')?.addEventListener('click', closeModal);
      document.getElementById('save-res')?.addEventListener('click', async () => {
        const form = document.getElementById('results-form');
        if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const saveBtn = document.getElementById('save-res');
        if (saveBtn) saveBtn.disabled = true;

        const studentId = document.getElementById('res-student').value;
        const studentObj = students.find(s => String(s.id) === String(studentId));
        
        const unitVal = document.getElementById('res-unit').value;
        const [unitCode, unitName] = unitVal.split('|');

        const catMarks = Math.min(30, Math.max(0, Number(document.getElementById('res-cat').value) || 0));
        const examMarks = Math.min(70, Math.max(0, Number(document.getElementById('res-exam').value) || 0));
        const totalMarks = catMarks + examMarks;

        const { grade, remarks } = calculateGrade(totalMarks);

        const payload = {
          student_id: studentId,
          student_name: studentObj?.full_name || 'Student',
          unit_code: unitCode,
          unit_name: unitName,
          cat_marks: catMarks,
          exam_marks: examMarks,
          total_marks: totalMarks,
          marks_obtained: totalMarks,
          grade: grade,
          remarks: remarks,
          semester: "Semester 1"
        };

        try {
          await dbService.addExamResult(payload);
          showToast(`Result recorded: Total ${totalMarks}% (Grade ${grade})`, 'success');
          closeModal();
          await loadResults();
        } catch (error) {
          console.error("Failed to add exam result:", error);
          showToast("Failed to save exam result. Please try again.", "error");
          if (saveBtn) saveBtn.disabled = false;
        }
      });
    }
  });
}

function printResultSlip(studentId, studentName) {
  // Filter all results belonging to this student
  const studentResults = results.filter(r => String(r.student_id) === String(studentId));

  let rowsHTML = '';
  let meanGrade = 'N/A';
  let recommendation = 'Pending Evaluation';

  if (studentResults.length === 0) {
    rowsHTML = `<tr><td colspan="7" style="text-align:center; padding:1rem;">No results found for this student.</td></tr>`;
  } else {
    const totalPercentageSum = studentResults.reduce((sum, r) => sum + (Number(r.total_marks) || 0), 0);
    const average = Math.round(totalPercentageSum / studentResults.length);
    const calculatedMean = calculateGrade(average);
    
    meanGrade = `${calculatedMean.grade} (${calculatedMean.remarks})`;
    recommendation = average >= 50 
      ? 'Proceed to Next Semester / Clinical Rotations' 
      : 'Required to Sit Supplementary Exams';

    rowsHTML = studentResults.map(r => `
      <tr>
        <td>${escapeHtml(r.unit_code || 'N/A')}</td>
        <td>${escapeHtml(r.unit_name || 'N/A')}</td>
        <td>${r.cat_marks ?? 0}</td>
        <td>${r.exam_marks ?? 0}</td>
        <td>${r.total_marks ?? 0}</td>
        <td><strong>${escapeHtml(r.grade || 'F')}</strong></td>
        <td>${escapeHtml(r.remarks || 'Pending')}</td>
      </tr>
    `).join('');
  }

  printDocument(`OFFICIAL ACADEMIC RESULT SLIP - ${studentName}`, `
    <div style="font-family:sans-serif; padding:1rem;">
      <h2 style="text-align:center; color:#0F5132; margin-top:0;">Mercylite Health Sciences College</h2>
      <h4 style="text-align:center; margin-top:0; color:#555;">OFFICIAL ACADEMIC RESULT SLIP</h4>
      <hr style="margin-bottom:1.5rem;" />

      <p><strong>Student Name:</strong> ${escapeHtml(studentName)}</p>
      <p><strong>Academic Year:</strong> 2026/2027 (Semester 1)</p>
      
      <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse; margin-top:1rem;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th>Unit Code</th>
            <th>Unit Name</th>
            <th>CAT (/30)</th>
            <th>Exam (/70)</th>
            <th>Total (/100)</th>
            <th>Grade</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>

      <div style="margin-top:2rem; padding:1rem; background:#f8fafc; border-left:4px solid #0F5132; font-weight:bold;">
        Semester Mean Grade: ${meanGrade}<br/>
        Recommendation: ${recommendation}
      </div>
    </div>
  `);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
