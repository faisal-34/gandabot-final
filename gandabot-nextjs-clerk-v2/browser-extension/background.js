// ── GandaBot Extension Background Service Worker ─────────────────────────

// Create context menu on install / update
chrome.runtime.onInstalled.addListener(() => {
  // Remove stale menus before recreating (handles extension updates)
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'gandabot-translate',
      title: 'Translate with GandaBot',
      contexts: ['selection'],
    });

    // Quick "translate to" sub-menu items
    const quickTargets = [
      { id: 'gandabot-to-luganda',    title: 'Translate → Luganda',    lang: 'lug' },
      { id: 'gandabot-to-english',    title: 'Translate → English',    lang: 'eng' },
      { id: 'gandabot-to-acholi',     title: 'Translate → Acholi',     lang: 'ach' },
      { id: 'gandabot-to-runyankore', title: 'Translate → Runyankore', lang: 'nyn' },
      { id: 'gandabot-to-ateso',      title: 'Translate → Ateso',      lang: 'teo' },
    ];

    for (const item of quickTargets) {
      chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: ['selection'],
        parentId: 'gandabot-translate',
      });
    }

    chrome.contextMenus.create({
      id: 'gandabot-separator',
      type: 'separator',
      contexts: ['selection'],
      parentId: 'gandabot-translate',
    });

    chrome.contextMenus.create({
      id: 'gandabot-open-popup',
      title: 'Open GandaBot popup…',
      contexts: ['selection'],
      parentId: 'gandabot-translate',
    });
  });
});

/** Maps context menu item IDs → target language codes */
const MENU_TARGET_LANGS = {
  'gandabot-to-luganda':    'lug',
  'gandabot-to-english':    'eng',
  'gandabot-to-acholi':     'ach',
  'gandabot-to-runyankore': 'nyn',
  'gandabot-to-ateso':      'teo',
};

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText?.trim();
  if (!selectedText || !tab?.id) return;

  if (info.menuItemId === 'gandabot-open-popup') {
    chrome.storage.local.set({ contextText: selectedText }, () => {
      chrome.action.openPopup?.().catch(() => {
        // openPopup not available in all browsers — inject tooltip as fallback
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            alert('GandaBot: please click the extension icon to open the translator.');
          },
        }).catch(() => {});
      });
    });
    return;
  }

  const targetLang = MENU_TARGET_LANGS[info.menuItemId];
  if (!targetLang) return;

  // Persist for popup and show inline tooltip
  chrome.storage.local.set({ contextText: selectedText, targetLang });
  translateAndShowTooltip(tab.id, selectedText, targetLang);
});

// ── Translate and inject tooltip ──────────────────────────────────────────
async function translateAndShowTooltip(tabId, text, targetLang) {
  try {
    const translation = await callTranslateAPI(text, targetLang);
    chrome.tabs.sendMessage(tabId, {
      type: 'GANDABOT_SHOW_TOOLTIP',
      translation,
      targetLang,
    }).catch(() => {
      // Content script not injected on this page (e.g., chrome:// URLs) — ignore
    });
  } catch {
    // Silently fail for context menu — user can open the popup instead
  }
}

/**
 * Call the GandaBot translation API.
 * We omit sourceLang and let the server auto-detect (Sunbird NLLB supports this).
 * "auto" is NOT a valid Sunbird language code, so we simply omit the field.
 */
async function callTranslateAPI(text, targetLang) {
  const res = await fetch('https://www.gandabot.com/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.translation) throw new Error('No translation in response');
  return data.translation;
}

// ── Handle messages from content script ──────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GANDABOT_TRANSLATE') {
    callTranslateAPI(msg.text, msg.targetLang)
      .then((translation) => sendResponse({ translation }))
      .catch((err) => sendResponse({ error: err.message }));
    return true; // keep the message channel open for async sendResponse
  }
});
