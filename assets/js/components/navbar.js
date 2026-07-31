// =========================================================
// NAVBAR COMPONENT (VANILLA JS MODULE)
// =========================================================
import { getCurrentUser, switchRole, logout, DEMO_USERS } from '../auth.js';
import { CONFIG } from '../config.js';

export function renderNavbar(title = "Dashboard") {
  const user = getCurrentUser();
  const navbarContainer = document.getElementById('navbar-container');
  if (!navbarContainer) return;

  navbarContainer.innerHTML = `
    <header class="topbar">
      <div class="topbar-left">
        <button id="sidebar-toggle" class="toggle-sidebar-btn" title="Toggle Sidebar">☰</button>
        <h1 class="page-title">${title}</h1>
      </div>

      <div class="topbar-right">
        <!-- Academic Status Badge -->
        <span class="badge-pill badge-primary">
          <span>📅</span> ${CONFIG.CURRENT_ACADEMIC_YEAR} (${CONFIG.CURRENT_SEMESTER})
        </span>

        <!-- Quick Role Switcher for Testing -->
        <div style="position: relative;">
          <select id="quick-role-select" class="form-control" style="padding: 0.25rem 0.5rem; font-size: 0.775rem; font-weight: 600; border-color: var(--color-primary); background-color: var(--color-primary-light); color: var(--color-primary);">
            <option value="" disabled>-- Quick Switch Role --</option>
            ${Object.keys(DEMO_USERS).map(roleKey => `
              <option value="${roleKey}" ${user.role === roleKey ? 'selected' : ''}>
                ${DEMO_USERS[roleKey].title} (${roleKey})
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Dark Mode Toggle -->
        <button id="theme-toggle-btn" class="btn btn-secondary btn-sm" title="Toggle Light/Dark Theme">
          🌙
        </button>

        <!-- User Profile & Logout -->
        <div class="user-menu" id="user-profile-trigger">
          <div class="user-avatar">${user.full_name ? user.full_name.charAt(0) : 'U'}</div>
          <div class="user-info">
            <span class="user-name">${user.full_name}</span>
            <span class="user-role">${user.role.replace('_', ' ')}</span>
          </div>
        </div>

        <button id="logout-btn" class="btn btn-outline btn-sm" style="color: #DC2626; border-color: #FCA5A5;" title="Log Out">
          🚪 Exit
        </button>
      </div>
    </header>
  `;

  // Event Listeners
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
  });

  document.getElementById('quick-role-select')?.addEventListener('change', (e) => {
    switchRole(e.target.value);
  });

  const themeBtn = document.getElementById('theme-toggle-btn');
  themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME_MODE, isDark ? 'dark' : 'light');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
  });

  // Load saved theme
  if (localStorage.getItem(CONFIG.STORAGE_KEYS.THEME_MODE) === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeBtn) themeBtn.textContent = '☀️';
  }
}
