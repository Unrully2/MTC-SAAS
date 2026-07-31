// =========================================================
// CLINICAL ATTACHMENTS MODULE (VANILLA JS MODULE)
// Special Hospital Rotations at Mercylite Hospital
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { getCurrentUser, enforcePageAccess } from './auth.js';
import { getStatusBadge, printDocument } from './utils.js';
import { createModal } from './components/modal.js';
import { showToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess();
  renderSidebar('clinical');
  renderNavbar('Mercylite Hospital Clinical Rotations');

  await loadClinicalData();
});

async function loadClinicalData() {
  const tbody = document.getElementById('clinical-tbody');
  if (!tbody) return;

  let clinicals = [];
  try {
    clinicals = (await dbService.getClinicalAttachments()) || [];
  } catch (error) {
    console.error("Failed to load clinical attachments:", error);
    showToast("Error loading clinical attachments data", "error");
    clinicals = [];
  }

  if (clinicals.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted, #64748b);">
          No clinical attachment records found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = clinicals.map(c => {
    const completed = Number(c.completed_hours) || 0;
    const required = Number(c.required_hours) || 1; // Prevent division by zero
    const pct = Math.min(100, Math.round((completed / required) * 100));
    const score = c.assessment_score != null ? `${c.assessment_score}%` : 'N/A';

    return `
      <tr>
        <td><strong>${c.student_name || 'N/A'}</strong></td>
        <td><strong>${c.hospital_name || 'Mercylite Hospital'}</strong></td>
        <td><span class="badge-pill badge-primary">${c.department || 'General'}</span></td>
        <td>${c.supervisor_name || 'Unassigned'}</td>
        <td>
          <div style="font-weight:700;">${completed} / ${required} Hours</div>
          <div style="height:6px; background:var(--border-color, #e2e8f0); border-radius:3px; overflow:hidden; margin-top:2px;">
            <div style="width:${pct}%; height:100%; background:var(--color-primary, #059669);"></div>
          </div>
        </td>
        <td><strong>${score}</strong></td>
        <td>${getStatusBadge(c.status || 'pending')}</td>
        <td>
          <button class="btn btn-sm btn-outline logbook-btn" data-id="${c.id}" data-name="${c.student_name || ''}">📋 Logbook</button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.logbook-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      // Loose equality check (==) accommodates both string and numeric DB primary keys
      const item = clinicals.find(c => c.id == id);
      if (item) {
        openLogbookModal(item);
      } else {
        showToast("Logbook record not found", "warning");
      }
    });
  });
}

function openLogbookModal(c) {
  const completed = Number(c.completed_hours) || 0;
  const required = Number(c.required_hours) || 1;
  const pct = Math.round((completed / required) * 100);
  const studentName = c.student_name || 'Student';
  const hospitalName = c.hospital_name || 'Mercylite Hospital';
  const department = c.department || 'General';
  const supervisor = c.supervisor_name || 'N/A';
  const phone = c.supervisor_phone ? ` (${c.supervisor_phone})` : '';
  const summary = c.logbook_summary || 'No evaluation notes recorded for this student yet.';
  const score = c.assessment_score != null ? `${c.assessment_score}%` : 'N/A';

  createModal({
    title: `Clinical Logbook - ${studentName}`,
    bodyHTML: `
      <div style="padding:0.5rem;">
        <h4>Hospital: ${hospitalName} (${department})</h4>
        <p><strong>Clinical Supervisor:</strong> ${supervisor}${phone}</p>
        <p><strong>Logbook Assessment Summary:</strong></p>
        <div style="padding:1rem; background:var(--bg-hover, #f8fafc); border-radius:var(--radius-md, 6px); font-size:0.9rem; line-height:1.5;">
          ${summary}
        </div>
        <div style="margin-top:1rem; font-weight:700; color:var(--color-primary, #059669);">
          Completed Clinical Hours: ${completed} / ${required} Hours (${pct}%)
        </div>
      </div>
    `,
    footerHTML: `<button class="btn btn-primary" id="print-logbook-btn">🖨️ Print Clinical Evaluation</button>`,
    onOpen: () => {
      document.getElementById('print-logbook-btn')?.addEventListener('click', () => {
        printDocument(`Clinical Attachment Evaluation - ${studentName}`, `
          <div style="line-height:1.6; color:#1e293b;">
            <h3 style="color:#064e3b; border-bottom:2px solid #059669; padding-bottom:0.5rem;">Mercylite Hospital Clinical Logbook</h3>
            <p><strong>Student Name:</strong> ${studentName}</p>
            <p><strong>Hospital & Department:</strong> ${hospitalName} - ${department}</p>
            <p><strong>Supervisor:</strong> ${supervisor}${phone}</p>
            <p><strong>Assessment Score:</strong> ${score}</p>
            <p><strong>Completed Hours:</strong> ${completed} / ${required} Hours (${pct}%)</p>
            <hr style="margin:1rem 0; border:0; border-top:1px solid #e2e8f0;"/>
            <p><strong>Logbook Notes & Evaluation:</strong></p>
            <div style="background:#f8fafc; padding:1rem; border-radius:6px; border:1px solid #cbd5e1;">
              ${summary}
            </div>
          </div>
        `);
      });
    }
  });
}
