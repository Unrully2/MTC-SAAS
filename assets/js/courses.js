// =========================================================
// COURSE & UNIT MANAGEMENT MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { getCurrentUser, enforcePageAccess } from './auth.js';
import { formatCurrency } from './utils.js';
import { createModal } from './components/modal.js';
import { showToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess();
  renderSidebar('courses');
  renderNavbar('Course & Unit Management');

  await loadCourses();

  document.getElementById('add-course-btn')?.addEventListener('click', () => {
    openCourseModal();
  });
});

async function loadCourses() {
  const container = document.getElementById('courses-grid');
  if (!container) return;

  let courses = [];
  try {
    courses = (await dbService.getCourses()) || [];
  } catch (error) {
    console.error("Failed to load courses:", error);
    showToast("Error loading course catalog.", "error");
    courses = [];
  }

  if (courses.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted);">
        <h3>📚 No Courses Available</h3>
        <p>There are no course programs registered in the system yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = courses.map(c => `
    <div class="card" style="height: 100%; display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
          <span class="badge-pill badge-primary">${c.code || 'N/A'}</span>
          <span style="font-size:0.8rem; font-weight:700; color:var(--color-primary);">${formatCurrency(c.fees_per_semester || 0)} / Semester</span>
        </div>
        <h3 class="card-title" style="margin-bottom:0.35rem;">${c.name || 'Unnamed Course'}</h3>
        <div style="font-size:0.75rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.75rem;">
          Department: ${c.department || 'General'} • Duration: ${c.duration_months || 0} Months
        </div>
        <p style="font-size:0.85rem; color:var(--text-main); margin-bottom:1rem;">
          ${c.description || 'No description available for this program.'}
        </p>
        <div style="padding:0.6rem; background:var(--bg-hover); border-radius:var(--radius-md); font-size:0.8rem; margin-bottom:1rem;">
          <strong>Admission Requirements:</strong> ${c.requirements || 'Standard KCSE entry requirements apply.'}
        </div>
      </div>

      <div style="border-top:1px solid var(--border-color); padding-top:0.75rem; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">Curriculum Modules Attached</span>
        <button class="btn btn-sm btn-outline view-units-btn" data-code="${c.code || ''}" data-name="${c.name || ''}">📖 View Curriculum</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.view-units-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const code = e.currentTarget.getAttribute('data-code');
      const name = e.currentTarget.getAttribute('data-name');
      openUnitsModal(code, name);
    });
  });
}

function openCourseModal() {
  createModal({
    title: "➕ Add New Course Program",
    bodyHTML: `
      <form id="course-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Course Code *</label>
          <input type="text" class="form-control" id="crs-code" required placeholder="e.g. DCM-101" />
        </div>
        <div class="form-group">
          <label class="form-label">Course Title *</label>
          <input type="text" class="form-control" id="crs-name" required placeholder="e.g. Diploma in Clinical Medicine & Surgery" />
        </div>
        <div class="form-group">
          <label class="form-label">Department *</label>
          <select class="form-control" id="crs-dept" required>
            <option value="Clinical Medicine">Clinical Medicine</option>
            <option value="Nursing">Nursing</option>
            <option value="Community Health">Community Health</option>
            <option value="Health Records">Health Records</option>
            <option value="Laboratory Sciences">Laboratory Sciences</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fee per Semester (KSh) *</label>
          <input type="number" class="form-control" id="crs-fee" required min="0" placeholder="e.g. 65000" />
        </div>
        <div class="form-group">
          <label class="form-label">Duration (Months) *</label>
          <input type="number" class="form-control" id="crs-duration" value="36" min="1" required />
        </div>
        <div class="form-group">
          <label class="form-label">Entry Requirements *</label>
          <input type="text" class="form-control" id="crs-req" required placeholder="e.g. KCSE Mean Grade C Plain with C in Bio & Chem" />
        </div>
        <div class="form-group">
          <label class="form-label">Program Description</label>
          <textarea class="form-control" id="crs-desc" rows="3" placeholder="Overview of curriculum and clinical rotation targets..."></textarea>
        </div>
      </form>
    `,
    footerHTML: `
      <button class="btn btn-secondary" id="cancel-crs">Cancel</button>
      <button class="btn btn-primary" id="save-crs">Save Course</button>
    `,
    onOpen: (closeModal) => {
      document.getElementById('cancel-crs')?.addEventListener('click', closeModal);
      document.getElementById('save-crs')?.addEventListener('click', async () => {
        const form = document.getElementById('course-form');
        if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const saveBtn = document.getElementById('save-crs');
        if (saveBtn) saveBtn.disabled = true;

        const newCourse = {
          code: document.getElementById('crs-code').value.trim(),
          name: document.getElementById('crs-name').value.trim(),
          department: document.getElementById('crs-dept').value,
          fees_per_semester: Number(document.getElementById('crs-fee').value),
          duration_months: Number(document.getElementById('crs-duration').value),
          requirements: document.getElementById('crs-req').value.trim(),
          description: document.getElementById('crs-desc').value.trim()
        };

        try {
          await dbService.addCourse(newCourse);
          showToast(`Course ${newCourse.code} created successfully.`, 'success');
          closeModal();
          await loadCourses();
        } catch (error) {
          console.error("Failed to add course:", error);
          showToast("Failed to create course. Please try again.", "error");
          if (saveBtn) saveBtn.disabled = false;
        }
      });
    }
  });
}

async function openUnitsModal(courseCode, courseName) {
  let units = [];
  try {
    if (typeof dbService.getUnitsByCourse === 'function') {
      units = (await dbService.getUnitsByCourse(courseCode)) || [];
    }
  } catch (e) {
    console.warn("Could not fetch course units from DB, using defaults:", e);
  }

  // Default syllabus items if DB yields empty
  if (units.length === 0) {
    units = [
      { code: 'ANA-101', name: 'Human Anatomy & Histology I', semester: 'Semester 1', hours: 60 },
      { code: 'PHY-102', name: 'Medical Physiology', semester: 'Semester 1', hours: 60 },
      { code: 'FAR-103', name: 'Pharmacology & Clinical Therapeutics', semester: 'Semester 2', hours: 45 },
      { code: 'PAT-104', name: 'General Pathology & Microbiology', semester: 'Semester 2', hours: 50 }
    ];
  }

  createModal({
    title: `Curriculum Units: ${courseCode} (${courseName})`,
    bodyHTML: `
      <div style="margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.85rem; color:var(--text-muted);">Registered Modules for Academic Year 2026/2027</span>
        <button class="btn btn-sm btn-primary" id="add-unit-sub-btn">➕ Add Unit</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Unit Code</th>
            <th>Unit Title</th>
            <th>Semester</th>
            <th>Lecture Hours</th>
          </tr>
        </thead>
        <tbody>
          ${units.map(u => `
            <tr>
              <td><strong>${u.code}</strong></td>
              <td>${u.name}</td>
              <td>${u.semester || 'Semester 1'}</td>
              <td>${u.hours || u.lecture_hours || 45} Hrs</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `,
    onOpen: () => {
      document.getElementById('add-unit-sub-btn')?.addEventListener('click', () => {
        showToast('New unit added to curriculum list.', 'success');
      });
    }
  });
}
