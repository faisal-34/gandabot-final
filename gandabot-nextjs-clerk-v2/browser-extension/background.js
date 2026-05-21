// ── GandaBot Extension Background Service Worker ─────────────────────────

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'gandabot-translate',
    title: 'Translate with GandaBot',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'gandabot-translate-to-luganda',
    title: 'Translate to Luganda',
    contexts: ['selection'],
    parentId: 'gandabot-translate',
  });

  chrome.contextMenus.create({
    id: 'gandabot-translate-to-english',
    title: 'Translate to English',
    contexts: ['selection'],
    parentId: 'gandabot-translate',
  });

  chrome.contextMenus.create({
    id: 'gandabot-translate-to-acholi',
    title: 'Translate to Acholi',
    contexts: ['selection'],
    parentId: 'gandabot-translate',
  });

  chrome.contextMenus.create({
    id: 'gandabot-translate-to-runyankore',
    title: 'Translate to Runyankore',
    contexts: ['selection'],
    parentId: 'gandabot-translate',
  });

  chrome.contextMenus.create({
    id: 'gandabot-open-popup',
    title: 'Open GandaBot Translator',
    contexts: ['selection'],
    parentId: 'gandabot-translate',
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText?.trim();
  if (!selectedText) return;

  const targetMap = {
    'gandabot-translate-to-luganda':    'lug',
    'gandabot-translate-to-english':    'eng',
    'gandabot-translate-to-acholi':     'ach',
    'gandabot-translate-to-runyankore': 'nyn',
  };

  if (info.menuItemId === 'gandabot-open-popup') {
    // Store selected text and open popup
    chrome.storage.local.set({ contextText: selectedText }, () => {
      chrome.action.openPopup?.().catch(() => {
        // openPopup may not be available in all browsers; fallback: inject tooltip
        injectTooltip(tab.id, selectedText);
      });
    });
    return;
  }

  const targetLang = targetMap[info.menuItemId];
  if (!targetLang) return;

  // Store for popup display and show inline tooltip
  chrome.storage.local.set({
    contextText: selectedText,
    targetLang,
  });

  // Show an inline translation tooltip on the page
  translateAndInject(tab.id, selectedText, 'auto', targetLang);
});

// ── Translate and inject tooltip into page ────────────────────────────────
async function translateAndInject(tabId, text, sourceLang, targetLang) {
  try {
    const result = await callTranslateAPI(text, sourceLang, targetLang);
    chrome.tabs.sendMessage(tabId, {
      type: 'GANDABOT_SHOW_TOOLTIP',
      translation: result,
      targetLang,
    }).catch(() => {
      // Content script not loaded on this page — ignore
    });
  } catch {
    // Silently fail for context menu
  }
}

async function callTranslateAPI(text, sourceLang, targetLang) {
  const res = await fetch('https://www.gandabot.com/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceLang, targetLang }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.translation) throw new Error('No translation');
  return data.translation;
}

// ── Handle messages from content script ──────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GANDABOT_TRANSLATE') {
    callTranslateAPI(msg.text, msg.sourceLang || 'auto', msg.targetLang)
      .then(translation => sendResponse({ translation }))
      .catch(err => sendResponse({ error: err.message }));
    return true; // keep channel open for async
  }
});
