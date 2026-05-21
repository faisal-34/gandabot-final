// ── GandaBot Extension Popup ──────────────────────────────────────────────

const LANG_NAMES = {
  eng: 'English',
  lug: 'Luganda',
  ach: 'Acholi',
  teo: 'Ateso',
  nyn: 'Runyankore',
  lgg: 'Lugbara',
  lnk: 'Langi',
  sog: 'Lusoga',
  ttj: 'Rutooro',
};

// Sunbird AI API endpoint (proxied through GandaBot edge function for CORS + auth)
const TRANSLATE_URL = 'https://www.gandabot.com/api/translate';

// ── Elements ──────────────────────────────────────────────────────────────
const sourceTextEl   = document.getElementById('sourceText');
const sourceLangEl   = document.getElementById('sourceLang');
const targetLangEl   = document.getElementById('targetLang');
const translateBtn   = document.getElementById('translateBtn');
const btnText        = document.getElementById('btnText');
const btnSpinner     = document.getElementById('btnSpinner');
const outputTextEl   = document.getElementById('outputText');
const outputWrapEl   = document.getElementById('outputWrap');
const outputLangEl   = document.getElementById('outputLangLabel');
const errorMsgEl     = document.getElementById('errorMsg');
const charCountEl    = document.getElementById('charCount');
const clearBtn       = document.getElementById('clearBtn');
const copyBtn        = document.getElementById('copyBtn');
const speakBtn       = document.getElementById('speakBtn');
const swapBtn        = document.getElementById('swapBtn');

// ── Restore saved state ───────────────────────────────────────────────────
chrome.storage.local.get(['sourceLang', 'targetLang', 'lastSource', 'lastOutput'], (data) => {
  if (data.sourceLang) sourceLangEl.value = data.sourceLang;
  if (data.targetLang) targetLangEl.value = data.targetLang;

  if (data.lastSource) {
    sourceTextEl.value = data.lastSource;
    updateCharCount();
  }

  if (data.lastOutput) {
    outputTextEl.textContent = data.lastOutput;
    outputLangEl.textContent = LANG_NAMES[data.targetLang] || 'Translation';
  }

  // If text was pre-filled (from context menu), auto-translate
  if (data.lastSource && !data.lastOutput) {
    translate();
  }
});

// Check if there's selected text from context menu
chrome.storage.local.get('contextText', (data) => {
  if (data.contextText) {
    sourceTextEl.value = data.contextText;
    updateCharCount();
    chrome.storage.local.remove('contextText');
    translate();
  }
});

// ── Event listeners ───────────────────────────────────────────────────────
sourceTextEl.addEventListener('input', () => {
  updateCharCount();
  saveState();
});

sourceLangEl.addEventListener('change', () => {
  saveState();
  // Prevent same language on both sides
  if (sourceLangEl.value === targetLangEl.value) {
    const opts = [...targetLangEl.options].map(o => o.value);
    const next = opts.find(v => v !== sourceLangEl.value);
    if (next) targetLangEl.value = next;
  }
});

targetLangEl.addEventListener('change', () => {
  saveState();
  outputLangEl.textContent = LANG_NAMES[targetLangEl.value] || 'Translation';
  if (sourceLangEl.value === targetLangEl.value) {
    const opts = [...sourceLangEl.options].map(o => o.value);
    const next = opts.find(v => v !== targetLangEl.value);
    if (next) sourceLangEl.value = next;
  }
});

swapBtn.addEventListener('click', () => {
  const tmp = sourceLangEl.value;
  sourceLangEl.value = targetLangEl.value;
  targetLangEl.value = tmp;

  // Also swap text
  const tmpText = sourceTextEl.value;
  sourceTextEl.value = outputTextEl.textContent;
  outputTextEl.textContent = tmpText;

  updateCharCount();
  outputLangEl.textContent = LANG_NAMES[targetLangEl.value] || 'Translation';
  saveState();
});

translateBtn.addEventListener('click', translate);

sourceTextEl.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') translate();
});

clearBtn.addEventListener('click', () => {
  sourceTextEl.value = '';
  outputTextEl.textContent = '';
  errorMsgEl.textContent = '';
  errorMsgEl.classList.add('hidden');
  updateCharCount();
  chrome.storage.local.remove(['lastSource', 'lastOutput']);
  sourceTextEl.focus();
});

copyBtn.addEventListener('click', () => {
  const text = outputTextEl.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.classList.add('copy-success');
    setTimeout(() => copyBtn.classList.remove('copy-success'), 500);
  });
});

speakBtn.addEventListener('click', () => {
  const text = outputTextEl.textContent;
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langToLocale(targetLangEl.value);
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
});

// ── Core translate function ────────────────────────────────────────────────
async function translate() {
  const text = sourceTextEl.value.trim();
  if (!text) {
    sourceTextEl.focus();
    return;
  }

  const sourceLang = sourceLangEl.value;
  const targetLang = targetLangEl.value;

  if (sourceLang === targetLang) {
    outputTextEl.textContent = text;
    return;
  }

  setLoading(true);
  clearError();

  try {
    const result = await callTranslateAPI(text, sourceLang, targetLang);
    outputTextEl.textContent = result;
    outputLangEl.textContent = LANG_NAMES[targetLang] || 'Translation';
    chrome.storage.local.set({ lastOutput: result });
  } catch (err) {
    showError(err.message || 'Translation failed. Please try again.');
  } finally {
    setLoading(false);
  }
}

// ── API call ──────────────────────────────────────────────────────────────
async function callTranslateAPI(text, sourceLang, targetLang) {
  const res = await fetch(TRANSLATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceLang, targetLang }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}: Translation failed`);
  }

  const data = await res.json();
  if (!data.translation) throw new Error('No translation returned');
  return data.translation;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function setLoading(on) {
  translateBtn.disabled = on;
  btnText.textContent = on ? 'Translating…' : 'Translate';
  btnSpinner.classList.toggle('hidden', !on);
}

function clearError() {
  errorMsgEl.textContent = '';
  errorMsgEl.classList.add('hidden');
}

function showError(msg) {
  errorMsgEl.textContent = msg;
  errorMsgEl.classList.remove('hidden');
  outputTextEl.textContent = '';
}

function updateCharCount() {
  const len = sourceTextEl.value.length;
  charCountEl.textContent = `${len} / 1000`;
  charCountEl.style.color = len > 900 ? '#f87171' : '';
}

function saveState() {
  chrome.storage.local.set({
    sourceLang: sourceLangEl.value,
    targetLang: targetLangEl.value,
    lastSource: sourceTextEl.value,
  });
}

function langToLocale(code) {
  const map = { eng: 'en-US', lug: 'lg', ach: 'ach', teo: 'teo', nyn: 'nyn' };
  return map[code] || 'en-US';
}
