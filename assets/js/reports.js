// =========================================================
// REPORTS & ANALYTICS MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { dbService } from './supabase.js';
import { getCurrentUser, enforcePageAccess } from './auth.js';
import { formatCurrency, exportToCSV, printDocument } from './utils.js';
import { showToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  enforcePageAccess(['administrator', 'principal', 'finance_officer', 'registrar']);
  renderSidebar('reports');
  renderNavbar('Executive Reports & Analytics');

  await loadAndRenderReports();
});

async function loadAndRenderReports() {
  let students = [];
  let invoices = [];
  let payments = [];

  try {
    const results = await Promise.allSettled([
      dbService.getStudents(),
      dbService.getInvoices(),
      dbService.getPayments()
    ]);

    students = results[0].status === 'fulfilled' && Array.isArray(results[0].value) ? results[0].value : [];
    invoices = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];
    payments = results[2].status === 'fulfilled' && Array.isArray(results[2].value) ? results[2].value : [];
  } catch (error) {
    console.error("Failed to load analytics data:", error);
    showToast("Error loading executive report data.", "error");
  }

  renderReports(students, invoices, payments);
}

function renderReports(students = [], invoices = [], payments = []) {
  const container = document.getElementById('reports-container');
  if (!container) return;

  const totalRev = payments.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);
  const totalBal = invoices.reduce((sum, i) => sum + (Number(i.balance) || 0), 0);

  // Compute dynamic demographic statistics
  const demographics = computeDemographics(students);

  container.innerHTML = `
    <div class="metrics-grid">
      <div class="card">
        <h4 class="card-title">📈 Admissions Summary</h4>
        <div style="font-size:1.8rem; font-weight:800; color:var(--color-primary);">${students.length} Total Enrolled</div>
        <button class="btn btn-sm btn-outline" id="export-adm-report" style="margin-top:0.75rem;">📄 Export Admissions Report</button>
      </div>

      <div class="card">
        <h4 class="card-title">💰 Revenue Collections</h4>
        <div style="font-size:1.8rem; font-weight:800; color:#15803D;">${formatCurrency(totalRev)}</div>
        <button class="btn btn-sm btn-outline" id="export-rev-report" style="margin-top:0.75rem;">💵 Export Revenue Ledger</button>
      </div>

      <div class="card">
        <h4 class="card-title">⚠️ Fee Defaulters Summary</h4>
        <div style="font-size:1.8rem; font-weight:800; color:#DC2626;">${formatCurrency(totalBal)}</div>
        <button class="btn btn-sm btn-outline" id="export-def-report" style="margin-top:0.75rem;">⚠️ Export Defaulters List</button>
      </div>
    </div>

    <div class="card" style="margin-top:1.5rem;">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h3 class="card-title">📊 County & Gender Demographic Breakdown</h3>
        <button class="btn btn-sm btn-primary" id="print-full-report">🖨️ Print Complete Executive Report</button>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>County</th>
            <th>Female Students</th>
            <th>Male Students</th>
            <th>Total Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${demographics.length === 0 
            ? `<tr><td colspan="4" style="text-align:center; padding:1.5rem;">No demographic data available.</td></tr>`
            : demographics.map(d => `
                <tr>
                  <td><strong>${escapeHtml(d.county)}</strong></td>
                  <td>${d.female}</td>
                  <td>${d.male}</td>
                  <td>${d.percentage}%</td>
                </tr>
              `).join('')
          }
        </tbody>
      </table>
    </div>
  `;

  // Admissions Export Event Listener
  document.getElementById('export-adm-report')?.addEventListener('click', () => {
    if (students.length === 0) {
      showToast('No student records available to export.', 'warning');
      return;
    }
    const data = students.map(s => ({
      AdmissionNo: s.admission_no || 'N/A',
      FullName: s.full_name || 'N/A',
      Gender: s.gender || 'N/A',
      County: s.county || 'N/A',
      Course: s.course_name || 'N/A',
      Status: s.status || 'Active'
    }));
    exportToCSV('Mercylife_Admissions_Report.csv', data);
    showToast('Admissions report exported.', 'success');
  });

  // Revenue Export Event Listener
  document.getElementById('export-rev-report')?.addEventListener('click', () => {
    if (payments.length === 0) {
      showToast('No payment records available to export.', 'warning');
      return;
    }
    const data = payments.map(p => ({
      ReceiptNo: p.receipt_no || 'N/A',
      StudentName: p.student_name || 'N/A',
      AmountPaid: p.amount_paid || 0,
      PaymentMethod: (p.payment_method || 'N/A').toUpperCase(),
      ReferenceCode: p.reference_code || 'N/A',
      Date: p.payment_date || 'N/A'
    }));
    exportToCSV('Mercylife_Revenue_Report.csv', data);
    showToast('Revenue ledger exported.', 'success');
  });

  // Defaulters Export Event Listener
  document.getElementById('export-def-report')?.addEventListener('click', () => {
    const defaulters = invoices.filter(i => (Number(i.balance) || 0) > 0);
    if (defaulters.length === 0) {
      showToast('No active fee defaulters found.', 'info');
      return;
    }
    const data = defaulters.map(d => ({
      InvoiceNo: d.invoice_no || 'N/A',
      StudentName: d.student_name || 'N/A',
      TotalAmount: d.amount || 0,
      PaidAmount: d.paid_amount || 0,
      OutstandingBalance: d.balance || 0,
      DueDate: d.due_date || 'N/A'
    }));
    exportToCSV('Mercylife_Fee_Defaulters.csv', data);
    showToast('Defaulters list exported.', 'success');
  });

  // Print Full Executive Summary Event Listener
  document.getElementById('print-full-report')?.addEventListener('click', () => {
    printDocument('Mercylife Executive Board Performance Report', `
      <div style="font-family:sans-serif; padding:1rem;">
        <h2 style="color:#0F5132; margin-bottom:0.2rem;">Mercylite Health Sciences College</h2>
        <h4 style="margin-top:0; color:#555;">Executive Board Performance Report</h4>
        <hr style="margin-bottom:1.5rem;" />
        
        <h3>1. Key Financial & Enrollment Metrics</h3>
        <ul>
          <li><strong>Total Enrolled Students:</strong> ${students.length}</li>
          <li><strong>Total Fee Collections:</strong> ${formatCurrency(totalRev)}</li>
          <li><strong>Total Outstanding Fee Balances:</strong> ${formatCurrency(totalBal)}</li>
        </ul>

        <h3 style="margin-top:1.5rem;">2. Demographic Distribution Summary</h3>
        <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse; margin-top:0.5rem;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th>County</th>
              <th>Female</th>
              <th>Male</th>
              <th>Share (%)</th>
            </tr>
          </thead>
          <tbody>
            ${demographics.map(d => `
              <tr>
                <td>${escapeHtml(d.county)}</td>
                <td>${d.female}</td>
                <td>${d.male}</td>
                <td>${d.percentage}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `);
  });
}

function computeDemographics(students = []) {
  if (students.length === 0) return [];

  const map = {};
  students.forEach(s => {
    const county = s.county?.trim() || 'Unspecified';
    const gender = (s.gender || '').toLowerCase();

    if (!map[county]) {
      map[county] = { county, female: 0, male: 0, total: 0 };
    }

    map[county].total += 1;
    if (gender === 'female' || gender === 'f') {
      map[county].female += 1;
    } else if (gender === 'male' || gender === 'm') {
      map[county].male += 1;
    }
  });

  const totalStudents = students.length;
  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .map(d => ({
      ...d,
      percentage: ((d.total / totalStudents) * 100).toFixed(1)
    }));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
