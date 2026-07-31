// =========================================================
// NOTICEBOARD & MESSAGING MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { getCurrentUser, enforcePageAccess } from './auth.js';
import { createModal } from './components/modal.js';
import { showToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess();
  renderSidebar('messaging');
  renderNavbar('Notice Board & Messaging');

  await loadAnnouncements();

  document.getElementById('post-notice-btn')?.addEventListener('click', () => {
    openNoticeModal();
  });
});

async function loadAnnouncements() {
  const container = document.getElementById('notices-container');
  if (!container) return;

  let notices = [];
  try {
    notices = (await dbService.getAnnouncements()) || [];
  } catch (error) {
    console.error("Failed to load announcements:", error);
    showToast("Error loading announcements notice board.", "error");
    notices = [];
  }

  if (notices.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <h3>📢 Notice Board Empty</h3>
        <p>No active announcements or campus notices have been posted yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notices.map(n => {
    const category = escapeHtml(n.category || 'General');
    const dateStr = escapeHtml(n.date || new Date().toISOString().split('T')[0]);
    const author = escapeHtml(n.author || 'Administration');
    const title = escapeHtml(n.title || 'Untitled Notice');
    const content = escapeHtml(n.content || '');

    return `
      <div class="card" style="margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span class="badge-pill badge-primary">${category}</span>
          <span style="font-size:0.8rem; color:var(--text-muted);">📅 ${dateStr} • By ${author}</span>
        </div>
        <h3 class="card-title" style="margin-bottom:0.35rem;">${title}</h3>
        <p style="font-size:0.9rem; color:var(--text-main); line-height:1.6; white-space:pre-wrap;">${content}</p>
      </div>
    `;
  }).join('');
}

function openNoticeModal() {
  createModal({
    title: "📢 Post Announcement to Notice Board",
    bodyHTML: `
      <form id="notice-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Notice Title *</label>
          <input type="text" class="form-control" id="anc-title" required placeholder="e.g. Clinical Rotation Schedule Change" />
        </div>
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select class="form-control" id="anc-cat" required>
            <option value="Academic">Academic</option>
            <option value="Clinical">Clinical</option>
            <option value="Finance">Finance</option>
            <option value="Events">Events</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Notice Message Content *</label>
          <textarea class="form-control" id="anc-content" rows="4" required placeholder="Type full notice text here..."></textarea>
        </div>
      </form>
    `,
    footerHTML: `
      <button class="btn btn-secondary" id="cancel-anc">Cancel</button>
      <button class="btn btn-primary" id="save-anc">Publish Notice</button>
    `,
    onOpen: (closeModal) => {
      document.getElementById('cancel-anc')?.addEventListener('click', closeModal);
      document.getElementById('save-anc')?.addEventListener('click', async () => {
        const form = document.getElementById('notice-form');
        if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const saveBtn = document.getElementById('save-anc');
        if (saveBtn) saveBtn.disabled = true;

        const user = getCurrentUser() || {};
        const authorName = user.full_name || user.username || 'System Administrator';

        const noticePayload = {
          title: document.getElementById('anc-title').value.trim(),
          category: document.getElementById('anc-cat').value,
          content: document.getElementById('anc-content').value.trim(),
          author: authorName,
          date: new Date().toISOString().split('T')[0]
        };

        try {
          await dbService.addAnnouncement(noticePayload);
          showToast('Announcement published to campus notice board.', 'success');
          closeModal();
          await loadAnnouncements();
        } catch (error) {
          console.error("Failed to post announcement:", error);
          showToast("Failed to publish notice. Please try again.", "error");
          if (saveBtn) saveBtn.disabled = false;
        }
      });
    }
  });
}

// Helper to prevent HTML Injection/XSS
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
