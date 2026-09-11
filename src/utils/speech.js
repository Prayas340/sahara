// Sahara Natural Human-Cadence Multilingual Female Voice Synthesis Engine
// Delivers crystal-clear, authentic female speech for English, Hindi, Assamese, Bengali, and Manipuri
// Features phrase chunking with natural breathing gaps and realistic human pronunciation.

let currentAudio = null;
let currentTimeoutId = null;
let activeSpeechQueue = [];
let isPlayingQueue = false;

// Confirmed female voice names and keywords for Web Speech API fallback
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
 * Find the best female voice matching the language code (fallback engine)
 */
export function getBestFemaleVoice(langCode = 'en-IN') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  const primaryPrefix = langCode.split('-')[0].toLowerCase();

  const isConfirmedFemale = (v) => {
    const name = (v.name || '').toLowerCase();
    const isMale = MALE_VOICE_NAMES.some(m => name.includes(m));
    if (isMale) return false;
    return FEMALE_VOICE_NAMES.some(f => name.includes(f));
  };

  const isNotMale = (v) => {
    const name = (v.name || '').toLowerCase();
    return !MALE_VOICE_NAMES.some(m => name.includes(m));
  };

  const exactLangFemale = voices.find(v => {
    const vLang = (v.lang || '').toLowerCase();
    const matchesLang = vLang === langCode.toLowerCase() || vLang.startsWith(primaryPrefix);
    return matchesLang && isConfirmedFemale(v);
  });
  if (exactLangFemale) return exactLangFemale;

  const anyConfirmedFemale = voices.find(v => isConfirmedFemale(v));
  if (anyConfirmedFemale) return anyConfirmedFemale;

  const exactLangNotMale = voices.find(v => {
    const vLang = (v.lang || '').toLowerCase();
    const matchesLang = vLang === langCode.toLowerCase() || vLang.startsWith(primaryPrefix);
    return matchesLang && isNotMale(v);
  });
  if (exactLangNotMale) return exactLangNotMale;

  const anyNotMale = voices.find(v => isNotMale(v));
  if (anyNotMale) return anyNotMale;

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

    let pauseMs = 200; // default breath pause (commas, clauses)
    if (/[.!?।॥\n]/.test(rawChunk)) {
      pauseMs = 450; // full stop / sentence conclusion breath
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
 * Stop any currently running speech synthesis, audio stream, and clear queue
 */
export function stopSpeech() {
  if (typeof window === 'undefined') return;

  if (currentTimeoutId) {
    clearTimeout(currentTimeoutId);
    currentTimeoutId = null;
  }

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
    } catch (e) {}
    currentAudio = null;
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
 * Speak text with natural human female cadence, breath stops, and multilingual support
 * Uses high fidelity audio stream as primary engine with automatic browser synthesis fallback.
 */
export function speakHumanText(text, options = {}) {
  if (typeof window === 'undefined') return;
  if (!text || typeof text !== 'string') return;

  const {
    lang = 'en-IN',
    rate = 0.88,
    pitch = 1.22,
    volume = 1.0,
    onStart = null,
    onChunk = null,
    onEnd = null,
  } = options;

  // Cancel any active audio
  stopSpeech();

  const phrases = splitIntoHumanPhrases(text);
  if (phrases.length === 0) return;

  try {
    window.dispatchEvent(new CustomEvent('sahara:speech-start', {
      detail: { text, lang, phrasesCount: phrases.length }
    }));
  } catch (e) {}

  if (onStart) onStart();

  let phraseIndex = 0;
  isPlayingQueue = true;

  // Fallback to Web Speech API if audio element fails
  const playViaSpeechSynthesis = (phraseItem, onDone) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onDone();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(phraseItem.text);
    const voice = getBestFemaleVoice(lang);
    if (voice) {
      utterance.voice = voice;
      // Match utterance lang with voice lang to prevent browser drop
      utterance.lang = voice.lang || 'en-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onend = () => onDone();
    utterance.onerror = () => onDone();

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      onDone();
    }
  };

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

    // Primary: High quality audio stream via /api/tts
    const ttsUrl = `/api/tts?text=${encodeURIComponent(currentItem.text)}&lang=${encodeURIComponent(lang)}`;
    const audio = new Audio(ttsUrl);
    currentAudio = audio;
    audio.volume = volume;

    const advanceWithPause = () => {
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

    audio.onended = () => {
      advanceWithPause();
    };

    audio.onerror = (err) => {
      console.warn('Audio stream fallback to SpeechSynthesis:', err);
      // Seamlessly fallback to browser synthesis for this phrase
      playViaSpeechSynthesis(currentItem, () => {
        advanceWithPause();
      });
    };

    audio.play().catch((playErr) => {
      console.warn('Audio play notice, falling back:', playErr);
      playViaSpeechSynthesis(currentItem, () => {
        advanceWithPause();
      });
    });
  };

  playNextPhrase();
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
