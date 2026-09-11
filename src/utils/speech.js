// Sahara Natural Human-Cadence Multilingual Female Voice Synthesis Engine
// Delivers dignified, calm, soothing female speech with natural breathing gaps and pauses.

let activeSpeechQueue = [];
let isPlayingQueue = false;
let currentUtterance = null;
let currentTimeoutId = null;

// Preferred female voice names per language code
const FEMALE_VOICE_KEYWORDS = [
  'female', 'woman', 'girl',
  'swara', 'heera', 'aditi', 'kalpana', 'geeta', 'tanya', 'veena', 'lekha', 'kalyani', 'raveena',
  'samantha', 'victoria', 'karen', 'zira', 'susan', 'catherine', 'moira', 'fiona', 'hazel',
  'google uk english female', 'google us english female', 'google hindi', 'google বাংলা', 'google हिन्दी',
  'microsoft swara online', 'microsoft heera online', 'microsoft zira',
  'natural'
];

/**
 * Find the best female voice matching the language code
 */
export function getBestFemaleVoice(langCode = 'en-IN') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  const primaryPrefix = langCode.split('-')[0].toLowerCase();

  // 1. Direct language match with female keyword
  const exactLangFemale = voices.find(v => {
    const vLang = (v.lang || '').toLowerCase();
    const vName = (v.name || '').toLowerCase();
    const matchesLang = vLang === langCode.toLowerCase() || vLang.startsWith(primaryPrefix);
    const isFemale = FEMALE_VOICE_KEYWORDS.some(kw => vName.includes(kw));
    return matchesLang && isFemale;
  });
  if (exactLangFemale) return exactLangFemale;

  // 2. Direct language match (any voice in that language)
  const exactLangAny = voices.find(v => {
    const vLang = (v.lang || '').toLowerCase();
    return vLang === langCode.toLowerCase() || vLang.startsWith(primaryPrefix);
  });
  if (exactLangAny) return exactLangAny;

  // 3. Fallback to Indian English or global female voice
  const fallbackFemale = voices.find(v => {
    const vName = (v.name || '').toLowerCase();
    return FEMALE_VOICE_KEYWORDS.some(kw => vName.includes(kw));
  });
  if (fallbackFemale) return fallbackFemale;

  // 4. Any default voice
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
    let pauseMs = 180; // default breath pause (commas, phrases)
    if (/[.!?।॥\n]/.test(rawChunk)) {
      pauseMs = 450; // full stop / sentence conclusion breath
    } else if (/[,;:—–]/.test(rawChunk)) {
      pauseMs = 220; // gentle mid-sentence pause
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
    rate = 0.90,       // Calm, warm, dignified elderly cadence (not rushed)
    pitch = 1.10,      // Natural warm female pitch
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
