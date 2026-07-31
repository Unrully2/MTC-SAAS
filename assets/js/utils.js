// =========================================================
// MERCYLIFE TRAINING COLLEGE - UTILITY FUNCTIONS
// =========================================================
import { getSchoolInfo } from './config.js';

/**
 * Formats a numeric value into a localized currency string.
 */
export function formatCurrency(amount) {
  const school = getSchoolInfo();
  const num = Number(amount) || 0;
  const currencyCode = school.currency === 'KSh' ? 'KES' : (school.currency || 'KES');

  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num).replace('KES', school.currency || 'KSh');
  } catch (e) {
    return `${school.currency || 'KSh'} ${num.toFixed(2)}`;
  }
}

/**
 * Safely formats a date string into DD MMM YYYY.
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Generates an HTML badge string with escaped text content.
 */
export function getStatusBadge(status) {
  if (!status) return `<span class="badge-pill badge-primary">N/A</span>`;

  const s = String(status).toLowerCase();
  const cleanStatus = escapeHtml(status.replace(/_/g, ' ').toUpperCase());

  switch (s) {
    case 'active':
    case 'paid':
    case 'present':
    case 'completed':
    case 'published':
      return `<span class="badge-pill badge-success">${cleanStatus}</span>`;
    case 'partially_paid':
    case 'in_progress':
    case 'late':
    case 'assigned':
      return `<span class="badge-pill badge-warning">${cleanStatus}</span>`;
    case 'unpaid':
    case 'overdue':
    case 'absent':
    case 'suspended':
    case 'fail':
      return `<span class="badge-pill badge-danger">${cleanStatus}</span>`;
    default:
      return `<span class="badge-pill badge-primary">${cleanStatus}</span>`;
  }
}

/**
 * Downloads JSON rows or array of objects as a UTF-8 encoded CSV.
 */
export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;

  const keys = Object.keys(rows[0]);
  const csvContent = [
    keys.join(','),
    ...rows.map(row => keys.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Prefix with UTF-8 BOM (\uFEFF) for proper Excel rendering of special characters
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a printable pop-up window with institution branding.
 */
export function printDocument(title, htmlContent) {
  const school = getSchoolInfo();
  const printWindow = window.open('', '_blank', 'width=850,height=950');

  if (!printWindow) {
    alert('Pop-up blocked! Please allow pop-ups for this site to print documents.');
    return;
  }

  const cleanLogoUrl = sanitizeUrl(school.logoUrl, '');
  const logoHtml = cleanLogoUrl 
    ? `<img src="${cleanLogoUrl}" alt="Logo" style="max-height:65px; max-width:180px; margin-bottom:8px; display:block; margin-left:auto; margin-right:auto; border-radius:4px;" />` 
    : '';

  const docTitle = escapeHtml(title);
  const schoolName = escapeHtml(school.name || 'Institution');
  const tagline = escapeHtml(school.tagline || '');
  const owner = escapeHtml(school.owner || '');
  const address = escapeHtml(school.address || '');
  const poBox = escapeHtml(school.poBox || '');
  const email = escapeHtml(school.email || '');
  const phone = escapeHtml(school.phone || '');
  const website = escapeHtml(school.website || '');
  const examBoard = escapeHtml(school.examBoard || '');

  const printDocumentHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${docTitle} - ${schoolName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2.5rem; color: #1e293b; line-height: 1.5; font-size: 13px; }
          .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 1rem; margin-bottom: 1.5rem; }
          .logo-title { font-size: 22px; font-weight: 800; color: #064e3b; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 2px; }
          .tagline { font-size: 12px; font-weight: 600; color: #059669; margin-bottom: 4px; }
          .sub { font-size: 11px; color: #64748b; }
          .doc-badge { margin-top: 12px; font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; background: #ecfdf5; padding: 6px 16px; display: inline-block; border-radius: 6px; border: 1px solid #a7f3d0; }
          table { width: 100%; border-collapse: collapse; margin-top: 1.25rem; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: left; }
          th { background: #f8fafc; font-weight: 700; color: #334155; text-transform: uppercase; font-size: 11px; letter-spacing: 0.04em; }
          .footer { margin-top: 3rem; font-size: 10px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
          .signature-box { display: flex; justify-content: space-between; margin-top: 2.5rem; padding: 0 1rem; }
          .sig-line { border-top: 1px dashed #64748b; width: 200px; text-align: center; padding-top: 4px; font-size: 11px; font-weight: 600; color: #334155; }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoHtml}
          <div class="logo-title">${schoolName}</div>
          <div class="tagline">${tagline} ${owner ? `&bull; ${owner}` : ''}</div>
          <div class="sub">${address} ${poBox ? `&bull; ${poBox}` : ''}</div>
          <div class="sub">Email: ${email} | Phone: ${phone} | Web: ${website}</div>
          ${examBoard ? `<div class="sub" style="margin-top:2px; font-style:italic; font-weight:500;">Accreditation: ${examBoard}</div>` : ''}
          <div class="doc-badge">${docTitle}</div>
        </div>
        <div class="content">
          ${htmlContent}
        </div>
        <div class="footer">
          Generated officially by ${schoolName} ERP System on ${new Date().toLocaleString()}<br/>
          Official Stamp & Authorized Signature Required for External Validation &bull; Ref: ${schoolName.replace(/[^A-Z]/g, '')}/VERIFIED
        </div>
        <script>
          window.onload = function() { 
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printDocumentHTML);
  printWindow.document.close();
}

/**
 * Escapes unsafe HTML characters.
 */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes URLs to prevent executable protocols (e.g. javascript:).
 */
function sanitizeUrl(url, fallback = '') {
  if (!url) return fallback;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return escapeHtml(parsed.href);
    }
  } catch (e) {
    // Invalid URL structure
  }
  return fallback;
}
