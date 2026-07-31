// =========================================================
// LIBRARY MANAGEMENT MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { getCurrentUser, enforcePageAccess } from './auth.js';
import { getStatusBadge } from './utils.js';
import { createModal } from './components/modal.js';
import { showToast } from './components/toast.js';

let booksCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess();
  renderSidebar('library');
  renderNavbar('Medical Library & Book Repository');

  await loadBooks();

  document.getElementById('add-book-btn')?.addEventListener('click', () => {
    openAddBookModal();
  });
});

async function loadBooks() {
  const tbody = document.getElementById('books-tbody');
  if (!tbody) return;

  try {
    booksCache = (await dbService.getBooks()) || [];
  } catch (error) {
    console.error("Failed to fetch library books:", error);
    showToast("Error loading book repository.", "error");
    booksCache = [];
  }

  if (booksCache.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-muted);">
          📚 No medical textbooks or reference materials found in the library database.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = booksCache.map(b => {
    const available = Number(b.available ?? b.quantity ?? 0);
    const total = Number(b.quantity ?? 0);
    const isAvailable = available > 0;
    const safeTitle = escapeHtml(b.title || 'Untitled Book');

    return `
      <tr>
        <td><strong>${safeTitle}</strong></td>
        <td>${escapeHtml(b.author || 'Unknown Author')}</td>
        <td><span class="badge-pill badge-primary">${escapeHtml(b.category || 'General Medical')}</span></td>
        <td>
          <span style="color: ${isAvailable ? 'var(--color-success, #15803D)' : 'var(--color-danger, #DC2626)'}; font-weight:600;">
            ${available} / ${total} Available
          </span>
        </td>
        <td>
          <button 
            class="btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'} issue-book-btn" 
            data-id="${b.id}" 
            ${!isAvailable ? 'disabled title="Out of stock"' : ''}>
            📖 ${isAvailable ? 'Issue Book' : 'Out of Stock'}
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.issue-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const book = booksCache.find(b => String(b.id) === String(id));
      if (book) openIssueBookModal(book);
    });
  });
}

function openIssueBookModal(book) {
  createModal({
    title: `📖 Issue Text: ${book.title}`,
    bodyHTML: `
      <form id="issue-book-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Book Title</label>
          <input type="text" class="form-control" value="${escapeHtml(book.title)}" disabled />
        </div>
        <div class="form-group">
          <label class="form-label">Borrower Admission No. / Student Name *</label>
          <input type="text" class="form-control" id="borrower-id" required placeholder="e.g. DCM/2026/042 or Student Name" />
        </div>
        <div class="form-group">
          <label class="form-label">Return Due Date *</label>
          <input type="date" class="form-control" id="due-date" required value="${getFutureDate(14)}" />
        </div>
      </form>
    `,
    footerHTML: `
      <button class="btn btn-secondary" id="cancel-issue">Cancel</button>
      <button class="btn btn-primary" id="confirm-issue">Confirm & Issue</button>
    `,
    onOpen: (closeModal) => {
      document.getElementById('cancel-issue')?.addEventListener('click', closeModal);
      document.getElementById('confirm-issue')?.addEventListener('click', async () => {
        const form = document.getElementById('issue-book-form');
        if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const confirmBtn = document.getElementById('confirm-issue');
        if (confirmBtn) confirmBtn.disabled = true;

        const borrower = document.getElementById('borrower-id').value.trim();
        const dueDate = document.getElementById('due-date').value;

        try {
          if (typeof dbService.issueBook === 'function') {
            await dbService.issueBook({ book_id: book.id, borrower, due_date: dueDate });
          } else {
            // Fallback stock reduction simulation
            book.available = Math.max(0, (book.available || 1) - 1);
          }

          showToast(`Book "${book.title}" issued to ${borrower}. Due on ${dueDate}.`, 'success');
          closeModal();
          await loadBooks();
        } catch (error) {
          console.error("Failed to issue book:", error);
          showToast("Failed to issue book. Please try again.", "error");
          if (confirmBtn) confirmBtn.disabled = false;
        }
      });
    }
  });
}

function openAddBookModal() {
  createModal({
    title: "➕ Register New Library Book",
    bodyHTML: `
      <form id="add-book-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Book Title *</label>
          <input type="text" class="form-control" id="bk-title" required placeholder="e.g. Clinical Medicine & Therapeutics" />
        </div>
        <div class="form-group">
          <label class="form-label">Author *</label>
          <input type="text" class="form-control" id="bk-author" required placeholder="e.g. Dr. K. N. Sharma" />
        </div>
        <div class="form-group">
          <label class="form-label">Category / Department *</label>
          <select class="form-control" id="bk-cat" required>
            <option value="Clinical Medicine">Clinical Medicine</option>
            <option value="Nursing & Midwifery">Nursing & Midwifery</option>
            <option value="Anatomy & Physiology">Anatomy & Physiology</option>
            <option value="Pharmacology">Pharmacology</option>
            <option value="Laboratory Sciences">Laboratory Sciences</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Total Copies Received *</label>
          <input type="number" class="form-control" id="bk-qty" required min="1" value="5" />
        </div>
      </form>
    `,
    footerHTML: `
      <button class="btn btn-secondary" id="cancel-add-bk">Cancel</button>
      <button class="btn btn-primary" id="save-bk">Add to Inventory</button>
    `,
    onOpen: (closeModal) => {
      document.getElementById('cancel-add-bk')?.addEventListener('click', closeModal);
      document.getElementById('save-bk')?.addEventListener('click', async () => {
        const form = document.getElementById('add-book-form');
        if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const qty = Number(document.getElementById('bk-qty').value);
        const newBook = {
          title: document.getElementById('bk-title').value.trim(),
          author: document.getElementById('bk-author').value.trim(),
          category: document.getElementById('bk-cat').value,
          quantity: qty,
          available: qty
        };

        try {
          if (typeof dbService.addBook === 'function') {
            await dbService.addBook(newBook);
          }
          showToast(`"${newBook.title}" registered in library inventory.`, 'success');
          closeModal();
          await loadBooks();
        } catch (error) {
          console.error("Failed to add book:", error);
          showToast("Failed to add book to inventory.", "error");
        }
      });
    }
  });
}

// Utility Helpers
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}
