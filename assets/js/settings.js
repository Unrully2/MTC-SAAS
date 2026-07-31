// =========================================================
// SYSTEM SETTINGS & SUPABASE CONFIG MODULE (VANILLA JS MODULE)
// =========================================================
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { CONFIG, getSupabaseCredentials, getSchoolInfo, saveSchoolInfo } from './config.js';
import { getCurrentUser, enforcePageAccess, getAllSystemUsers, createUserAccount, updateUserAccount, deleteUserAccount, getCustomUsers, isDemoUsersDisabled, setDemoUsersDisabled } from './auth.js';
import { showToast } from './components/toast.js';
import { printDocument } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  enforcePageAccess(['administrator', 'principal']);
  renderSidebar('settings');
  renderNavbar('System Settings & Credentials');

  setupSystemModeControls();
  setupUserAccountsManager();
  setupSchoolProfileSettings();
  setupSupabaseSettings();
});

function setupSystemModeControls() {
  const toggleBtn = document.getElementById('toggle-demo-users-btn');
  const clearDataBtn = document.getElementById('clear-sample-data-btn');

  function updateToggleState() {
    if (!toggleBtn) return;
    const disabled = isDemoUsersDisabled();
    if (disabled) {
      toggleBtn.textContent = '🔓 Enable Demo Template Accounts';
      toggleBtn.className = 'btn btn-sm btn-primary';
    } else {
      toggleBtn.textContent = '🔒 Disable Demo Accounts (Production Mode)';
      toggleBtn.className = 'btn btn-sm btn-outline';
    }
  }

  updateToggleState();

  toggleBtn?.addEventListener('click', () => {
    const currentState = isDemoUsersDisabled();
    const newState = !currentState;
    setDemoUsersDisabled(newState);
    updateToggleState();

    if (newState) {
      showToast('🔒 Production mode enabled. Built-in demo accounts are disabled and hidden from login.', 'info');
    } else {
      showToast('🔓 Evaluation mode enabled. Built-in demo template accounts are active.', 'info');
    }

    setTimeout(() => window.location.reload(), 800);
  });

  clearDataBtn?.addEventListener('click', () => {
    if (confirm('⚠️ Are you sure you want to purge initial mock student and fee records? This action cannot be undone.')) {
      localStorage.removeItem('mercylife_mock_db_v1');
      showToast('🧹 Sample database records purged successfully! Refreshing view...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    }
  });
}

function setupSchoolProfileSettings() {
  const school = getSchoolInfo();

  const nameInput = document.getElementById('school-name');
  const taglineInput = document.getElementById('school-tagline');
  const ownerInput = document.getElementById('school-owner');
  const examboardInput = document.getElementById('school-examboard');
  const emailInput = document.getElementById('school-email');
  const phoneInput = document.getElementById('school-phone');
  const addressInput = document.getElementById('school-address');
  const poboxInput = document.getElementById('school-pobox');
  const websiteInput = document.getElementById('school-website');
  const currencyInput = document.getElementById('school-currency');
  const principalInput = document.getElementById('school-principal');
  const principalTitleInput = document.getElementById('school-principal-title');
  const registrarInput = document.getElementById('school-registrar');
  const logoInput = document.getElementById('school-logo');

  function populateForm(data) {
    if (nameInput) nameInput.value = data.name || '';
    if (taglineInput) taglineInput.value = data.tagline || '';
    if (ownerInput) ownerInput.value = data.owner || '';
    if (examboardInput) examboardInput.value = data.examBoard || '';
    if (emailInput) emailInput.value = data.email || '';
    if (phoneInput) phoneInput.value = data.phone || '';
    if (addressInput) addressInput.value = data.address || '';
    if (poboxInput) poboxInput.value = data.poBox || '';
    if (websiteInput) websiteInput.value = data.website || '';
    if (currencyInput) currencyInput.value = data.currency || 'KSh';
    if (principalInput) principalInput.value = data.principal || '';
    if (principalTitleInput) principalTitleInput.value = data.principalTitle || '';
    if (registrarInput) registrarInput.value = data.registrar || '';
    if (logoInput) logoInput.value = data.logoUrl || '';

    updateLiveHeaderPreview();
  }

  function getFormData() {
    return {
      name: nameInput?.value.trim() || CONFIG.COLLEGE_NAME || 'Institution Name',
      tagline: taglineInput?.value.trim() || CONFIG.MOTO || '',
      owner: ownerInput?.value.trim() || CONFIG.OWNER || '',
      examBoard: examboardInput?.value.trim() || 'Exam Board',
      email: emailInput?.value.trim() || CONFIG.EMAIL || '',
      phone: phoneInput?.value.trim() || CONFIG.PHONE || '',
      address: addressInput?.value.trim() || CONFIG.LOCATION || '',
      poBox: poboxInput?.value.trim() || '',
      website: websiteInput?.value.trim() || CONFIG.WEBSITE || '',
      currency: currencyInput?.value.trim() || 'KSh',
      principal: principalInput?.value.trim() || '',
      principalTitle: principalTitleInput?.value.trim() || 'Principal',
      registrar: registrarInput?.value.trim() || '',
      logoUrl: logoInput?.value.trim() || ''
    };
  }

  function updateLiveHeaderPreview() {
    const previewContainer = document.getElementById('school-header-preview');
    if (!previewContainer) return;

    const data = getFormData();
    const logoHtml = data.logoUrl
      ? `<img src="${escapeHtml(data.logoUrl)}" style="max-height:50px; margin-bottom:6px;" alt="Logo" />`
      : `<div style="display:inline-block; width:45px; height:45px; background:var(--color-primary); color:white; font-size:22px; font-weight:800; line-height:45px; border-radius:8px; margin-bottom:6px;">${escapeHtml(data.name.charAt(0))}</div>`;

    previewContainer.innerHTML = `
      ${logoHtml}
      <h3 style="color:var(--color-primary-dark); text-transform:uppercase; margin:0; font-size:1.15rem; font-weight:800;">${escapeHtml(data.name)}</h3>
      <div style="color:var(--color-primary); font-size:0.8rem; font-weight:600;">${escapeHtml(data.tagline)} ${data.owner ? `| ${escapeHtml(data.owner)}` : ''}</div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
        ${escapeHtml(data.address)} &bull; ${escapeHtml(data.poBox)} | Tel: ${escapeHtml(data.phone)} | Email: ${escapeHtml(data.email)}
      </div>
      <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px; font-style:italic;">
        Licensing & Exam Board: ${escapeHtml(data.examBoard)} &bull; Currency: <strong>${escapeHtml(data.currency)}</strong>
      </div>
    `;
  }

  // Initial load
  populateForm(school);

  // Live preview listener
  document.querySelectorAll('#school-profile-form input').forEach(input => {
    input.addEventListener('input', updateLiveHeaderPreview);
  });

  // Save School Settings
  document.getElementById('save-school-info-btn')?.addEventListener('click', () => {
    const data = getFormData();
    saveSchoolInfo(data);
    renderSidebar('settings');
    showToast('✅ Institution profile updated successfully! All documents now use these details.', 'success');
  });

  // Reset to Defaults
  document.getElementById('reset-school-defaults-btn')?.addEventListener('click', () => {
    if (confirm('Reset all institution details back to system defaults?')) {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.SCHOOL_INFO);
      const defaults = getSchoolInfo();
      populateForm(defaults);
      renderSidebar('settings');
      showToast('Institution settings reset to default college profile.', 'info');
    }
  });

  // Test Print Header
  document.getElementById('preview-doc-header-btn')?.addEventListener('click', () => {
    printDocument('OFFICIAL SAMPLE REPORT / STATEMENT', `
      <div style="padding: 1.5rem; text-align:center;">
        <h4 style="color:#064e3b; margin-bottom:0.5rem;">Sample Institution Branded Document</h4>
        <p style="font-size:13px; color:#475569;">
          This sample demonstrates how your saved institution profile automatically brands all generated receipts, fee statements, transcripts, certificates, and executive reports across the ERP!
        </p>
      </div>
    `);
  });
}

function setupSupabaseSettings() {
  const { url, anonKey } = getSupabaseCredentials();

  const urlInput = document.getElementById('supabase-url-input');
  const keyInput = document.getElementById('supabase-key-input');

  if (urlInput) urlInput.value = url || '';
  if (keyInput) keyInput.value = anonKey || '';

  document.getElementById('save-supabase-config-btn')?.addEventListener('click', () => {
    const newUrl = urlInput?.value.trim();
    const newKey = keyInput?.value.trim();

    if (newUrl) localStorage.setItem(CONFIG.STORAGE_KEYS.SUPABASE_URL, newUrl);
    if (newKey) localStorage.setItem(CONFIG.STORAGE_KEYS.SUPABASE_ANON_KEY, newKey);

    showToast('Supabase API settings saved. Reloading app context...', 'success');
    setTimeout(() => window.location.reload(), 1200);
  });
}

function setupUserAccountsManager() {
  const tableBody = document.getElementById('users-table-body');
  if (!tableBody) return;

  const currentUser = getCurrentUser();

  function renderUsersTable() {
    const allUsers = getAllSystemUsers();
    
    // Update Stat Badges
    const totalUsersEl = document.getElementById('stat-total-users');
    const staffUsersEl = document.getElementById('stat-staff-users');
    const studentUsersEl = document.getElementById('stat-student-users');
    const activeUsersEl = document.getElementById('stat-active-users');

    if (totalUsersEl) totalUsersEl.textContent = allUsers.length;
    if (staffUsersEl) staffUsersEl.textContent = allUsers.filter(u => u.role !== 'student').length;
    if (studentUsersEl) studentUsersEl.textContent = allUsers.filter(u => u.role === 'student').length;
    if (activeUsersEl) activeUsersEl.textContent = allUsers.filter(u => u.status !== 'suspended').length;

    tableBody.innerHTML = allUsers.map(user => {
      const isDemo = user.is_demo;
      const isSuspended = user.status === 'suspended';
      const isSelf = currentUser && String(currentUser.id) === String(user.id);
      
      const roleBadgeClass = user.role === 'administrator' ? 'badge-primary' :
                             user.role === 'student' ? 'badge-info' :
                             user.role === 'finance_officer' ? 'badge-warning' : 'badge-success';

      return `
        <tr>
          <td>
            <strong>${escapeHtml(user.full_name || 'N/A')}</strong>
            ${isSelf ? '<span class="badge badge-primary" style="font-size:0.6rem; margin-left:6px;">You</span>' : ''}
            ${isDemo ? '<span class="badge badge-primary" style="font-size:0.6rem; margin-left:6px;">Default Template</span>' : '<span class="badge badge-success" style="font-size:0.6rem; margin-left:6px;">Custom Account</span>'}
          </td>
          <td><code>${escapeHtml(user.email || 'N/A')}</code></td>
          <td><span class="badge ${roleBadgeClass}">${escapeHtml((user.role || '').replace('_', ' ').toUpperCase())}</span></td>
          <td style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(user.title || 'N/A')}</td>
          <td>
            ${isSuspended 
              ? '<span class="badge badge-danger">SUSPENDED</span>' 
              : '<span class="badge badge-success">ACTIVE</span>'}
          </td>
          <td style="text-align:right;">
            ${isDemo ? `
              <span style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">System Built-in</span>
            ` : `
              <button class="btn btn-sm btn-secondary edit-user-btn" data-id="${user.id}">✏️ Edit</button>
              <button class="btn btn-sm ${isSuspended ? 'btn-primary' : 'btn-outline'} toggle-status-btn" data-id="${user.id}" data-status="${user.status}" ${isSelf ? 'disabled title="You cannot suspend your own active session."' : ''}>
                ${isSuspended ? '🔓 Activate' : '⛔ Suspend'}
              </button>
              <button class="btn btn-sm btn-outline delete-user-btn" style="color:var(--color-danger);" data-id="${user.id}" ${isSelf ? 'disabled title="You cannot delete your own active session."' : ''}>🗑️</button>
            `}
          </td>
        </tr>
      `;
    }).join('');

    // Attach Event Handlers
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openEditUserModal(id);
      });
    });

    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (currentUser && String(currentUser.id) === String(id)) {
          showToast('Action forbidden: You cannot suspend your active login account.', 'error');
          return;
        }
        const currentStatus = e.currentTarget.getAttribute('data-status');
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        try {
          updateUserAccount(id, { status: newStatus });
          showToast(`User account status updated to ${newStatus.toUpperCase()}`, 'success');
          renderUsersTable();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });

    document.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (currentUser && String(currentUser.id) === String(id)) {
          showToast('Action forbidden: You cannot delete your active login account.', 'error');
          return;
        }
        if (confirm('Are you sure you want to permanently delete this user account?')) {
          try {
            deleteUserAccount(id);
            showToast('User account deleted permanently', 'success');
            renderUsersTable();
          } catch (err) {
            showToast(`Delete failed: ${err.message}`, 'error');
          }
        }
      });
    });
  }

  // Modal Controls
  const modal = document.getElementById('user-modal');
  const openModalBtn = document.getElementById('open-create-user-modal-btn');
  const closeModalBtn = document.getElementById('close-user-modal-btn');
  const cancelModalBtn = document.getElementById('cancel-user-modal-btn');
  const saveUserBtn = document.getElementById('save-user-account-btn');
  const userForm = document.getElementById('user-account-form');

  function openCreateModal() {
    userForm?.reset();
    document.getElementById('user-account-id').value = '';
    document.getElementById('user-modal-title').textContent = '➕ Create New Portal User Account';
    modal?.classList.add('open');
  }

  function openEditUserModal(userId) {
    const customUsers = getCustomUsers();
    const target = customUsers.find(u => String(u.id) === String(userId));
    if (!target) return;

    document.getElementById('user-account-id').value = target.id;
    document.getElementById('user-fullname-input').value = target.full_name || '';
    document.getElementById('user-email-input').value = target.email || '';
    document.getElementById('user-role-select').value = target.role || 'administrator';
    document.getElementById('user-title-input').value = target.title || '';
    document.getElementById('user-phone-input').value = target.phone || '';
    document.getElementById('user-password-input').value = target.password || '';
    document.getElementById('user-status-select').value = target.status || 'active';

    document.getElementById('user-modal-title').textContent = `✏️ Edit User Account: ${target.full_name}`;
    modal?.classList.add('open');
  }

  function closeModal() {
    modal?.classList.remove('open');
  }

  openModalBtn?.addEventListener('click', openCreateModal);
  closeModalBtn?.addEventListener('click', closeModal);
  cancelModalBtn?.addEventListener('click', closeModal);

  saveUserBtn?.addEventListener('click', (e) => {
    e.preventDefault();

    if (userForm && !userForm.checkValidity()) {
      userForm.reportValidity();
      return;
    }

    const id = document.getElementById('user-account-id').value;
    const fullName = document.getElementById('user-fullname-input').value.trim();
    const email = document.getElementById('user-email-input').value.trim();
    const role = document.getElementById('user-role-select').value;
    const title = document.getElementById('user-title-input').value.trim();
    const phone = document.getElementById('user-phone-input').value.trim();
    const password = document.getElementById('user-password-input').value.trim();
    const status = document.getElementById('user-status-select').value;

    if (!fullName || !email || (!id && !password)) {
      showToast('Please complete all required fields (Full Name, Email, & Password).', 'error');
      return;
    }

    try {
      if (id) {
        updateUserAccount(id, {
          full_name: fullName,
          email,
          role,
          title,
          phone,
          ...(password ? { password } : {}),
          status
        });
        showToast(`✅ User account for ${fullName} updated successfully!`, 'success');
      } else {
        createUserAccount({
          full_name: fullName,
          email,
          role,
          title,
          phone,
          password,
          status
        });
        showToast(`🎉 User account created for ${fullName}!`, 'success');
      }

      closeModal();
      renderUsersTable();
    } catch (err) {
      showToast(`Action failed: ${err.message}`, 'error');
    }
  });

  // Initial table render
  renderUsersTable();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
