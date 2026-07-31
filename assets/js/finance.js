// =========================================================
// FINANCE & ACCOUNTING MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { getCurrentUser, enforcePageAccess } from './auth.js';
import { formatCurrency, formatDate, getStatusBadge, printDocument, exportToCSV } from './utils.js';
import { createModal } from './components/modal.js';
import { showToast } from './components/toast.js';

let invoices = [];
let payments = [];
let students = [];

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess();
  renderSidebar('finance');
  renderNavbar('Finance & Fee Management');

  await loadInitialData();

  document.getElementById('record-payment-btn')?.addEventListener('click', () => {
    openPaymentModal();
  });

  document.getElementById('create-invoice-btn')?.addEventListener('click', () => {
    openInvoiceModal();
  });

  document.getElementById('export-finance-btn')?.addEventListener('click', () => {
    if (!invoices || invoices.length === 0) {
      showToast('No financial records available to export.', 'warning');
      return;
    }
    exportToCSV('Mercylife_Fee_Statements.csv', invoices.map(i => ({
      InvoiceNo: i.invoice_no || 'N/A',
      StudentName: i.student_name || 'N/A',
      TotalAmount: i.amount || 0,
      PaidAmount: i.paid_amount || 0,
      Balance: i.balance || 0,
      Status: i.status || 'Pending',
      DueDate: i.due_date || 'N/A'
    })));
    showToast('Financial ledger exported.', 'success');
  });
});

async function loadInitialData() {
  try {
    students = (await dbService.getStudents()) || [];
  } catch (error) {
    console.error("Failed to load students list:", error);
    students = [];
  }
  await loadFinanceData();
}

async function loadFinanceData() {
  try {
    const results = await Promise.allSettled([
      dbService.getInvoices(),
      dbService.getPayments()
    ]);

    invoices = results[0].status === 'fulfilled' && Array.isArray(results[0].value) ? results[0].value : [];
    payments = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];
  } catch (error) {
    console.error("Failed to load financial records:", error);
    showToast("Error loading financial ledger.", "error");
    invoices = [];
    payments = [];
  }

  renderSummaryMetrics();
  renderInvoicesTable();
  renderPaymentsTable();
}

function renderSummaryMetrics() {
  const totalBilled = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalCollected = payments.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + (Number(i.balance) || 0), 0);

  const container = document.getElementById('finance-metrics');
  if (!container) return;

  container.innerHTML = `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon-box metric-icon-green">💵</div>
        <div class="metric-details">
          <span class="metric-value">${formatCurrency(totalCollected)}</span>
          <span class="metric-label">Total Fee Revenue Collected</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon-box metric-icon-amber">📋</div>
        <div class="metric-details">
          <span class="metric-value">${formatCurrency(totalBilled)}</span>
          <span class="metric-label">Total Invoiced Fees</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon-box metric-icon-red">⚠️</div>
        <div class="metric-details">
          <span class="metric-value">${formatCurrency(totalOutstanding)}</span>
          <span class="metric-label">Total Outstanding Balances</span>
        </div>
      </div>
    </div>
  `;
}

function renderInvoicesTable() {
  const tbody = document.getElementById('invoices-tbody');
  if (!tbody) return;

  if (invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No fee invoices found.</td></tr>`;
    return;
  }

  tbody.innerHTML = invoices.map(inv => `
    <tr>
      <td><strong>${inv.invoice_no || 'N/A'}</strong></td>
      <td>${inv.student_name || 'N/A'}</td>
      <td>${formatCurrency(inv.amount || 0)}</td>
      <td><span style="color:#15803D; font-weight:700;">${formatCurrency(inv.paid_amount || 0)}</span></td>
      <td><span style="color:#DC2626; font-weight:700;">${formatCurrency(inv.balance || 0)}</span></td>
      <td>${formatDate(inv.due_date)}</td>
      <td>${getStatusBadge(inv.status || 'unpaid')}</td>
      <td>
        <button class="btn btn-sm btn-primary pay-inv-btn" data-id="${inv.id}">💳 Pay</button>
        <button class="btn btn-sm btn-outline statement-btn" data-student="${inv.student_id || ''}" data-name="${inv.student_name || 'Student'}">📄 Statement</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.pay-inv-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const inv = invoices.find(i => String(i.id) === String(id));
      openPaymentModal(inv);
    });
  });

  document.querySelectorAll('.statement-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.currentTarget.getAttribute('data-student');
      const name = e.currentTarget.getAttribute('data-name');
      openStudentStatement(studentId, name);
    });
  });
}

function renderPaymentsTable() {
  const tbody = document.getElementById('payments-tbody');
  if (!tbody) return;

  if (payments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No payment receipts recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = payments.map(p => {
    const method = (p.payment_method || 'N/A').toUpperCase();
    const ref = p.reference_code || 'N/A';
    const methodBadge = p.payment_method === 'mpesa' 
      ? `<span class="mpesa-badge">M-PESA ${ref}</span>` 
      : `<span>${method} (${ref})</span>`;

    return `
      <tr>
        <td><strong>${p.receipt_no || 'N/A'}</strong></td>
        <td>${p.student_name || 'N/A'}</td>
        <td><strong>${formatCurrency(p.amount_paid || 0)}</strong></td>
        <td>${methodBadge}</td>
        <td>${formatDate(p.payment_date)}</td>
        <td>${p.received_by || 'Cashier'}</td>
        <td>
          <button class="btn btn-sm btn-secondary view-receipt-btn" data-id="${p.id}">🖨️ Receipt</button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.view-receipt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const payment = payments.find(p => String(p.id) === String(id));
      if (payment) printOfficialReceipt(payment);
    });
  });
}

function openPaymentModal(selectedInvoice = null) {
  createModal({
    title: "💳 Record Student Fee Receipt",
    bodyHTML: `
      <form id="payment-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Select Student *</label>
          <select class="form-control" id="pay-student" required>
            <option value="">-- Choose Student --</option>
            ${students.map(s => `
              <option value="${s.id}" ${selectedInvoice?.student_id === s.id ? 'selected' : ''}>
                ${s.admission_no || ''} - ${s.full_name || 'Unnamed'} (${s.course_name || 'No Course'})
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Amount Paid (KSh) *</label>
          <input type="number" class="form-control" id="pay-amount" required min="1" placeholder="e.g. 45000" value="${selectedInvoice?.balance || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Payment Channel *</label>
          <select class="form-control" id="pay-method" required>
            <option value="mpesa">M-Pesa Express / Paybill</option>
            <option value="bank">KCB Bank Deposit</option>
            <option value="cash">Cashier Counter</option>
            <option value="cheque">Bankers Cheque</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Reference / Transaction Code *</label>
          <input type="text" class="form-control" id="pay-ref" required placeholder="e.g. QJK9182301 or Slip No" />
        </div>
        <div class="form-group">
          <label class="form-label">Notes / Remarks</label>
          <input type="text" class="form-control" id="pay-notes" placeholder="First Term Fee Payment" />
        </div>
      </form>
    `,
    footerHTML: `
      <button class="btn btn-secondary" id="cancel-pay">Cancel</button>
      <button class="btn btn-primary" id="save-pay">✅ Process Payment & Issue Receipt</button>
    `,
    onOpen: (closeModal) => {
      document.getElementById('cancel-pay')?.addEventListener('click', closeModal);
      document.getElementById('save-pay')?.addEventListener('click', async () => {
        const form = document.getElementById('payment-form');
        if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const saveBtn = document.getElementById('save-pay');
        if (saveBtn) saveBtn.disabled = true;

        const studentId = document.getElementById('pay-student').value;
        const studentObj = students.find(s => String(s.id) === String(studentId));

        const paymentPayload = {
          student_id: studentId,
          student_name: studentObj?.full_name || 'Student',
          amount_paid: Number(document.getElementById('pay-amount').value),
          payment_method: document.getElementById('pay-method').value,
          reference_code: document.getElementById('pay-ref').value.trim(),
          notes: document.getElementById('pay-notes').value.trim()
        };

        try {
          const newPayment = await dbService.recordPayment(paymentPayload);
          showToast(`Payment of KSh ${paymentPayload.amount_paid} recorded!`, 'success');
          closeModal();
          await loadFinanceData();

          if (newPayment) {
            printOfficialReceipt(newPayment);
          }
        } catch (error) {
          console.error("Failed to record payment:", error);
          showToast("Failed to record payment. Please verify input and try again.", "error");
          if (saveBtn) saveBtn.disabled = false;
        }
      });
    }
  });
}

function openInvoiceModal() {
  createModal({
    title: "🧾 Create Student Fee Invoice",
    bodyHTML: `
      <form id="invoice-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label">Select Student *</label>
          <select class="form-control" id="inv-student" required>
            <option value="">-- Choose Student --</option>
            ${students.map(s => `<option value="${s.id}">${s.admission_no || ''} - ${s.full_name || 'Unnamed'}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Total Fee Amount (KSh) *</label>
          <input type="number" class="form-control" id="inv-amount" required min="1" placeholder="e.g. 65000" />
        </div>
        <div class="form-group">
          <label class="form-label">Due Date *</label>
          <input type="date" class="form-control" id="inv-duedate" required value="2026-04-15" />
        </div>
        <div class="form-group">
          <label class="form-label">Invoice Description *</label>
          <input type="text" class="form-control" id="inv-desc" required value="Semester 1 Tuition & Clinical Rotation Fees" />
        </div>
      </form>
    `,
    footerHTML: `
      <button class="btn btn-secondary" id="cancel-inv">Cancel</button>
      <button class="btn btn-primary" id="save-inv">Generate Invoice</button>
    `,
    onOpen: (closeModal) => {
      document.getElementById('cancel-inv')?.addEventListener('click', closeModal);
      document.getElementById('save-inv')?.addEventListener('click', async () => {
        const form = document.getElementById('invoice-form');
        if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const saveBtn = document.getElementById('save-inv');
        if (saveBtn) saveBtn.disabled = true;

        const studentId = document.getElementById('inv-student').value;
        const studentObj = students.find(s => String(s.id) === String(studentId));

        const amount = Number(document.getElementById('inv-amount').value);
        const invoicePayload = {
          student_id: studentId,
          student_name: studentObj?.full_name || 'Student',
          amount: amount,
          paid_amount: 0,
          balance: amount,
          due_date: document.getElementById('inv-duedate').value,
          description: document.getElementById('inv-desc').value.trim(),
          status: 'unpaid'
        };

        try {
          await dbService.addInvoice(invoicePayload);
          showToast('Invoice generated successfully.', 'success');
          closeModal();
          await loadFinanceData();
        } catch (error) {
          console.error("Failed to generate invoice:", error);
          showToast("Failed to generate invoice. Please try again.", "error");
          if (saveBtn) saveBtn.disabled = false;
        }
      });
    }
  });
}

function printOfficialReceipt(p) {
  if (!p) return;

  const method = (p.payment_method || 'N/A').toUpperCase();
  const receiptNo = p.receipt_no || 'REC-TEMP';
  const dateStr = p.payment_date ? formatDate(p.payment_date) : new Date().toLocaleDateString();

  printDocument(`Official Fee Payment Receipt (${receiptNo})`, `
    <div style="border:2px dashed #0F5132; padding:1.5rem; border-radius:8px; font-family:sans-serif;">
      <h3 style="text-align:center; color:#0F5132; margin-top:0;">OFFICIAL PAYMENT RECEIPT</h3>
      <table style="width:100%; margin-bottom:1rem; border-collapse:collapse;">
        <tr>
          <td style="padding:4px 0;"><strong>Receipt No:</strong> ${receiptNo}</td>
          <td style="text-align:right; padding:4px 0;"><strong>Date:</strong> ${dateStr}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><strong>Student Name:</strong> ${p.student_name || 'N/A'}</td>
          <td style="text-align:right; padding:4px 0;"><strong>Payment Method:</strong> ${method}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><strong>Reference Code:</strong> ${p.reference_code || 'N/A'}</td>
          <td style="text-align:right; padding:4px 0;"><strong>Received By:</strong> ${p.received_by || 'Cashier'}</td>
        </tr>
      </table>

      <div style="background:#E8F5E9; padding:1rem; text-align:center; border-radius:6px; margin-top:1rem;">
        <span style="font-size:14px; color:#555;">AMOUNT RECEIVED:</span><br/>
        <strong style="font-size:24px; color:#0F5132;">${formatCurrency(p.amount_paid || 0)}</strong>
      </div>
    </div>
  `);
}

function openStudentStatement(studentId, studentName) {
  const studentInvoices = invoices.filter(i => String(i.student_id) === String(studentId));
  const studentPayments = payments.filter(p => String(p.student_id) === String(studentId));

  let statementRowsHTML = '';

  if (studentInvoices.length === 0 && studentPayments.length === 0) {
    statementRowsHTML = `<tr><td colspan="5" style="text-align:center; padding:1rem;">No transactions recorded for this student.</td></tr>`;
  } else {
    // Combine and sort by date
    const transactions = [
      ...studentInvoices.map(i => ({
        date: i.created_at || i.due_date || '2026-01-01',
        desc: i.description || 'Fee Invoiced',
        billed: i.amount || 0,
        paid: 0
      })),
      ...studentPayments.map(p => ({
        date: p.payment_date || '2026-01-01',
        desc: `Payment Received (${(p.payment_method || '').toUpperCase()} - ${p.reference_code || ''})`,
        billed: 0,
        paid: p.amount_paid || 0
      }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    statementRowsHTML = transactions.map(t => {
      runningBalance += (t.billed - t.paid);
      return `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td>${t.desc}</td>
          <td>${t.billed ? formatCurrency(t.billed) : '-'}</td>
          <td>${t.paid ? formatCurrency(t.paid) : '-'}</td>
          <td><strong>${formatCurrency(runningBalance)}</strong></td>
        </tr>
      `;
    }).join('');
  }

  printDocument(`Student Fee Statement - ${studentName}`, `
    <div style="font-family:sans-serif;">
      <h2 style="margin-bottom:0.25rem;">Mercylite Health Sciences College</h2>
      <p style="margin-top:0; color:#555;">Official Fee Statement</p>
      <hr/>
      <p><strong>Student Name:</strong> ${studentName}</p>
      <p><strong>Academic Year:</strong> 2026/2027</p>
      <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse; margin-top:1rem;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th>Date</th>
            <th>Transaction Description</th>
            <th>Billed Amount</th>
            <th>Paid Amount</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${statementRowsHTML}
        </tbody>
      </table>
    </div>
  `);
}
