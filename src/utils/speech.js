// Sahara Natural Human-Cadence Multilingual Female Voice Synthesis Engine
// Strictly delivers dignified, calm, soothing female speech with natural breathing gaps and pauses.

let activeSpeechQueue = [];
let isPlayingQueue = false;
let currentUtterance = null;
let currentTimeoutId = null;

// Confirmed female voice names and keywords
const FEMALE_VOICE_NAMES = [
  'zira', 'heera', 'neerja', 'swara', 'kalpana', 'ananya', 'samantha', 'victoria', 'karen',
  'tanya', 'geeta', 'aditi', 'jenny', 'aria', 'sonia', 'female', 'woman', 'girl',
  'hazel', 'susan', 'catherine', 'moira', 'fiona', 'veena', 'lekha', 'kalyani', 'raveena',
  'tanisha', 'google हिन्दी', 'google বাংলা', 'google uk english female', 'google us english female'
];

// Male voice names to strictly exclude
const MALE_VOICE_NAMES = [
  'david', 'mark', 'george', 'ravi', 'madhur', 'prabhat', 'guy', 'hemant',
  'stefan', 'male', 'man', 'boy', 'richard', 'james', 'paul', 'tom', 'steve', 'peter', 'alex'
];

/**
 * Strictly find the best female voice matching the language code
 */
export function getBestFemaleVoice(langCode = 'en-IN') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  const primaryPrefix = langCode.split('-')[0].toLowerCase();

  // Helper to test if a voice is confirmed female
  const isConfirmedFemale = (v) => {
    const name = (v.name || '').toLowerCase();
    const isMale = MALE_VOICE_NAMES.some(m => name.includes(m));
    if (isMale) return false;
    return FEMALE_VOICE_NAMES.some(f => name.includes(f));
  };

  // Helper to test if a voice is NOT male
  const isNotMale = (v) => {
    const name = (v.name || '').toLowerCase();
    return !MALE_VOICE_NAMES.some(m => name.includes(m));
  };

  // 1. Direct language match + confirmed female
  const exactLangFemale = voices.find(v => {
    const vLang = (v.lang || '').toLowerCase();
    const matchesLang = vLang === langCode.toLowerCase() || vLang.startsWith(primaryPrefix);
    return matchesLang && isConfirmedFemale(v);
  });
  if (exactLangFemale) return exactLangFemale;

  // 2. Any confirmed female voice in the entire system (e.g. Zira, Swara, Samantha, Google UK English Female)
  const anyConfirmedFemale = voices.find(v => isConfirmedFemale(v));
  if (anyConfirmedFemale) return anyConfirmedFemale;

  // 3. Direct language match that is NOT male
  const exactLangNotMale = voices.find(v => {
    const vLang = (v.lang || '').toLowerCase();
    const matchesLang = vLang === langCode.toLowerCase() || vLang.startsWith(primaryPrefix);
    return matchesLang && isNotMale(v);
  });
  if (exactLangNotMale) return exactLangNotMale;

  // 4. Any voice that is NOT male
  const anyNotMale = voices.find(v => isNotMale(v));
  if (anyNotMale) return anyNotMale;

  // 5. Fallback
  return voices[0] || null;
}

/**
 * Split text into human natural phrasing chunks with pause duration metadata
 */
export function splitIntoHumanPhrases(text) {
  if (!text || typeof text !== 'string') return [];

  const clean = text.trim();
  if (!clean) return [];

  // Split on sentence boundaries and mid-sentence breath pauses
  // Punctuation: . ! ? । ॥ , ; : — – ...
  const regex = /([^.!?।॥,;:—–\n]+(?:[.!?।॥,;:—–\n]+|$))/g;
  const matches = clean.match(regex) || [clean];

  const phrases = [];
  for (let m of matches) {
    const rawChunk = m.trim();
    if (!rawChunk) continue;

    // Determine natural pause after this chunk
    let pauseMs = 190; // default breath pause (commas, phrases)
    if (/[.!?।॥\n]/.test(rawChunk)) {
      pauseMs = 480; // full stop / sentence conclusion breath
    } else if (/[,;:—–]/.test(rawChunk)) {
      pauseMs = 240; // gentle mid-sentence pause
    }

    phrases.push({
      text: rawChunk,
      pauseMs,
    });
  }

  return phrases;
}

/**
 * Stop any currently running speech synthesis and clear queue
 */
export function stopSpeech() {
  if (typeof window === 'undefined') return;

  if (currentTimeoutId) {
    clearTimeout(currentTimeoutId);
    currentTimeoutId = null;
  }

  activeSpeechQueue = [];
  isPlayingQueue = false;

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Speech cancel warning:', e);
    }
  }

  try {
    window.dispatchEvent(new CustomEvent('sahara:speech-end'));
  } catch (e) {}
}

/**
 * Speak text with natural human female cadence, breath stops, and real-time event updates
 */
export function speakHumanText(text, options = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (!text || typeof text !== 'string') return;

  const {
    lang = 'en-IN',
    rate = 0.88,       // Calm, warm, dignified cadence
    pitch = 1.22,      // Explicitly tuned warm female pitch
    volume = 1.0,
    onStart = null,
    onChunk = null,
    onEnd = null,
  } = options;

  // Cancel existing audio
  stopSpeech();

  const phrases = splitIntoHumanPhrases(text);
  if (phrases.length === 0) return;

  const voice = getBestFemaleVoice(lang);

  try {
    window.dispatchEvent(new CustomEvent('sahara:speech-start', {
      detail: { text, lang, phrasesCount: phrases.length }
    }));
  } catch (e) {}

  if (onStart) onStart();

  let phraseIndex = 0;
  isPlayingQueue = true;

  const playNextPhrase = () => {
    if (!isPlayingQueue || phraseIndex >= phrases.length) {
      isPlayingQueue = false;
      try {
        window.dispatchEvent(new CustomEvent('sahara:speech-end'));
      } catch (e) {}
      if (onEnd) onEnd();
      return;
    }

    const currentItem = phrases[phraseIndex];
    phraseIndex++;

    try {
      window.dispatchEvent(new CustomEvent('sahara:speech-chunk', {
        detail: {
          chunk: currentItem.text,
          index: phraseIndex - 1,
          total: phrases.length,
          fullText: text,
        }
      }));
    } catch (e) {}

    if (onChunk) onChunk(currentItem.text, phraseIndex - 1, phrases.length);

    const utterance = new SpeechSynthesisUtterance(currentItem.text);
    currentUtterance = utterance;

    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onend = () => {
      // Natural human gap before the next phrase
      if (phraseIndex < phrases.length) {
        currentTimeoutId = setTimeout(() => {
          playNextPhrase();
        }, currentItem.pauseMs);
      } else {
        isPlayingQueue = false;
        try {
          window.dispatchEvent(new CustomEvent('sahara:speech-end'));
        } catch (e) {}
        if (onEnd) onEnd();
      }
    };

    utterance.onerror = (err) => {
      console.warn('Speech synthesis utterance notice:', err);
      // Advance gracefully
      if (phraseIndex < phrases.length) {
        currentTimeoutId = setTimeout(() => {
          playNextPhrase();
        }, currentItem.pauseMs);
      } else {
        isPlayingQueue = false;
        try {
          window.dispatchEvent(new CustomEvent('sahara:speech-end'));
        } catch (e) {}
        if (onEnd) onEnd();
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('speechSynthesis.speak error:', e);
      isPlayingQueue = false;
      try {
        window.dispatchEvent(new CustomEvent('sahara:speech-end'));
      } catch (e) {}
    }
  };

  // Ensure voices are loaded if browser loads them asynchronously
  if (window.speechSynthesis.getVoices().length === 0) {
    const handleVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      playNextPhrase();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
  } else {
    playNextPhrase();
  }
}

/**
 * Standard speak function that maps to human-cadence engine
 */
export function speakText(text, lang = 'en-IN') {
  speakHumanText(text, { lang });
}

/**
 * Accessibility Large Text Toggle
 */
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

/**
 * Initialize Accessibility Settings
 */
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
