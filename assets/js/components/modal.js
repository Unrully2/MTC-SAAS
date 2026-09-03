/**
 * Simple Modal Component
 */
export function createModal({
  title = '',
  bodyHTML = '',
  footerHTML = '',
  onOpen = null,
  onClose = null,
} = {}) {
  // Create modal backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'modal-content';
  modal.style.cssText = `
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    z-index: 1001;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  titleEl.style.cssText = 'margin: 0; color: var(--text-main);';

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-muted);
  `;

  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  // Body
  const body = document.createElement('div');
  body.style.cssText = 'padding: 1.5rem;';
  body.innerHTML = bodyHTML;

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  `;
  footer.innerHTML = footerHTML;

  modal.appendChild(header);
  modal.appendChild(body);
  if (footerHTML) modal.appendChild(footer);

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // Close function
  const closeModal = () => {
    backdrop.remove();
    if (onClose) onClose();
  };

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  if (onOpen) onOpen(closeModal);

  return { modal, backdrop, closeModal };
}
