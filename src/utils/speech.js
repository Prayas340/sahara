// Sahara Voice Guidance & Speech Synthesis Utility

let currentSpeechUtterance = null;

export function speakText(text, lang = 'en-IN') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this environment.');
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Warm, slow, gentle pace for elderly comfort (0.85x)
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.lang = lang;

    currentSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Stop speech error', e);
    }
  }
}

export function toggleAccessibilityTextSize() {
  if (typeof window === 'undefined') return false;
  document.body.classList.toggle('large-text');
  const isLarge = document.body.classList.contains('large-text');
  try {
    if (window.localStorage) {
      localStorage.setItem('sahara_large_text', isLarge ? '1' : '0');
    }
  } catch (e) {
    console.warn('Storage error', e);
  }
  return isLarge;
}

export function initAccessibilitySettings() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (localStorage.getItem('sahara_large_text') === '1') {
        document.body.classList.add('large-text');
      }
    } catch (e) {
      console.warn('Read storage error', e);
    }
  }
}
