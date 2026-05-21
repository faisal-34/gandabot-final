// ── GandaBot Content Script — inline translation tooltip ─────────────────

const LANG_NAMES = {
  eng: 'English', lug: 'Luganda', ach: 'Acholi',
  teo: 'Ateso', nyn: 'Runyankore', lgg: 'Lugbara',
  lnk: 'Langi', sog: 'Lusoga', ttj: 'Rutooro',
};

let tooltip = null;

// Listen for messages from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'GANDABOT_SHOW_TOOLTIP') {
    showTooltip(msg.translation, msg.targetLang);
  }
});

// ── Tooltip ───────────────────────────────────────────────────────────────
function showTooltip(translation, targetLang) {
  removeTooltip();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const rect  = range.getBoundingClientRect();

  tooltip = document.createElement('div');
  tooltip.className = 'gandabot-tooltip';
  tooltip.setAttribute('data-gandabot', 'true');

  const langLabel = LANG_NAMES[targetLang] || targetLang;

  tooltip.innerHTML = `
    <div class="gb-tip-header">
      <span class="gb-tip-lang">${langLabel}</span>
      <div class="gb-tip-actions">
        <button class="gb-tip-btn gb-copy" title="Copy">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button class="gb-tip-btn gb-close" title="Close">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="gb-tip-text">${escapeHtml(translation)}</div>
    <a class="gb-tip-link" href="https://www.gandabot.com" target="_blank">Open GandaBot ↗</a>
  `;

  // Position: just below selection
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  tooltip.style.left = Math.max(8, rect.left + scrollX) + 'px';
  tooltip.style.top  = (rect.bottom + scrollY + 8) + 'px';

  document.body.appendChild(tooltip);

  // Keep within viewport
  requestAnimationFrame(() => {
    if (!tooltip) return;
    const tipRect = tooltip.getBoundingClientRect();
    if (tipRect.right > window.innerWidth - 8) {
      tooltip.style.left = Math.max(8, window.innerWidth - tipRect.width - 8 + scrollX) + 'px';
    }
    if (tipRect.bottom > window.innerHeight - 8) {
      tooltip.style.top = (rect.top + scrollY - tipRect.height - 8) + 'px';
    }
  });

  // Wire up buttons
  tooltip.querySelector('.gb-copy').addEventListener('click', (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(translation).catch(() => {});
    const btn = tooltip.querySelector('.gb-copy');
    btn.style.color = '#E8A838';
    setTimeout(() => { if (btn) btn.style.color = ''; }, 600);
  });

  tooltip.querySelector('.gb-close').addEventListener('click', removeTooltip);

  // Click outside closes
  setTimeout(() => {
    document.addEventListener('click', onOutsideClick, { once: true });
  }, 100);
}

function onOutsideClick(e) {
  if (tooltip && !tooltip.contains(e.target)) {
    removeTooltip();
  }
}

function removeTooltip() {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
