'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { dataStore } from '../services/dataStore.js';
import { speakHumanText, stopSpeech } from '../utils/speech.js';
import { getVoiceGuidance } from '../utils/voiceGuidance.js';

export function AssistantIcon({ isSpeaking = false, className = "w-12 h-12" }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        className="drop-shadow-sm select-none"
      >
        <defs>
          <style>{`
            .icon-stroke {
              stroke: #032109;
              fill: #ffffff;
              stroke-linecap: round;
              stroke-linejoin: round;
            }
            
            /* Subtle head bob animation */
            .character-group {
              transform-origin: 256px 420px;
              animation: ${isSpeaking ? 'activeBob 1.8s ease-in-out infinite' : 'subtleBob 3.5s ease-in-out infinite'};
            }

            /* Speaking indicator glow on the microphone */
            .mic-glow {
              transform-origin: 256px 375px;
              animation: ${isSpeaking ? 'micPulseFast 1s ease-in-out infinite' : 'micPulse 2.5s ease-in-out infinite'};
            }

            /* Active soundwaves emitting from mic */
            .sound-wave {
              fill: none;
              stroke: #2ec4b6;
              stroke-width: 6;
              stroke-linecap: round;
              opacity: ${isSpeaking ? 0.9 : 0.2};
            }

            .wave-1 {
              animation: waveEmit 1.6s 0.15s ease-out infinite;
            }

            .wave-2 {
              animation: waveEmit 1.6s 0.45s ease-out infinite;
            }

            @keyframes subtleBob {
              0%, 100% {
                transform: translateY(0) rotate(0deg);
              }
              30% {
                transform: translateY(-4px) rotate(0.5deg);
              }
              70% {
                transform: translateY(2px) rotate(-0.5deg);
              }
            }

            @keyframes activeBob {
              0%, 100% {
                transform: translateY(0) rotate(0deg) scale(1);
              }
              25% {
                transform: translateY(-5px) rotate(1deg) scale(1.02);
              }
              75% {
                transform: translateY(3px) rotate(-1deg) scale(0.99);
              }
            }

            @keyframes micPulse {
              0%, 100% {
                stroke: #29c5c5;
                filter: drop-shadow(0 0 0px rgba(41, 197, 197, 0));
              }
              50% {
                stroke: #17e6e6;
                filter: drop-shadow(0 0 8px rgba(41, 197, 197, 0.7));
              }
            }

            @keyframes micPulseFast {
              0%, 100% {
                stroke: #00d2b4;
                filter: drop-shadow(0 0 3px rgba(0, 210, 180, 0.5));
              }
              50% {
                stroke: #17e6e6;
                filter: drop-shadow(0 0 14px rgba(23, 230, 230, 0.95));
              }
            }

            @keyframes waveEmit {
              0% {
                transform: scale(0.85);
                opacity: 0;
              }
              40% {
                opacity: 0.95;
              }
              100% {
                transform: scale(1.3);
                opacity: 0;
              }
            }
          `}</style>
        </defs>

        <g className="character-group">
          {/* Hair Base / Back Drop */}
          <path className="icon-stroke" strokeWidth="26" d="M 85 360 L 85 470 L 427 470 L 427 360" />

          {/* Outer Headband */}
          <path className="icon-stroke" strokeWidth="26" d="M 52 245 C 52 90 143 28 256 28 C 369 28 460 90 460 245" />

          {/* Head / Face Outline */}
          <circle className="icon-stroke" strokeWidth="26" cx="256" cy="285" r="162" />

          {/* Bangs / Front Hairline */}
          <path className="icon-stroke" strokeWidth="26" d="M 98 235 L 290 235 L 325 170 L 372 235 L 414 235" />

          {/* Ear Cups */}
          {/* Left Ear Cup */}
          <rect className="icon-stroke" strokeWidth="26" x="25" y="215" width="50" height="150" rx="25" />
          
          {/* Right Ear Cup */}
          <rect className="icon-stroke" strokeWidth="26" x="437" y="215" width="50" height="150" rx="25" />

          {/* Microphone Boom Arm */}
          <path className="icon-stroke" strokeWidth="20" strokeLinecap="round" d="M 108 360 L 210 360" />

          {/* Animated Sound Waves */}
          <g transform-origin="300 375">
            <path className="sound-wave wave-1" d="M 330 355 C 342 363 342 387 330 395" />
            <path className="sound-wave wave-2" d="M 342 345 C 362 358 362 392 342 405" />
          </g>

          {/* Microphone Head */}
          <rect 
            className="mic-glow" 
            x="195" 
            y="342" 
            width="118" 
            height="66" 
            rx="18" 
            fill="#ffffff" 
            stroke="#29c5c5" 
            strokeWidth="20" 
            strokeLinejoin="round" 
          />
        </g>
      </svg>
    </div>
  );
}

export default function VoiceAssistant() {
  const pathname = usePathname();
  const [lang, setLang] = useState(() => (dataStore.getLanguage ? dataStore.getLanguage() : 'English'));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenSubtitle, setSpokenSubtitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState('overview');
  const [activeGameLevel, setActiveGameLevel] = useState(1);

  // Sync language changes
  useEffect(() => {
    const handleLangSync = () => {
      const current = dataStore.getLanguage ? dataStore.getLanguage() : 'English';
      setLang(current);
    };
    window.addEventListener('sahara:lang-change', handleLangSync);
    window.addEventListener('sahara:datastore-change', handleLangSync);
    return () => {
      window.removeEventListener('sahara:lang-change', handleLangSync);
      window.removeEventListener('sahara:datastore-change', handleLangSync);
    };
  }, []);

  // Listen for speech synthesis events
  useEffect(() => {
    const onStart = () => setIsSpeaking(true);
    const onChunk = (e) => {
      setIsSpeaking(true);
      if (e.detail?.chunk) {
        setSpokenSubtitle(e.detail.chunk);
      }
    };
    const onEnd = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        setSpokenSubtitle('');
      }, 2500);
    };

    window.addEventListener('sahara:speech-start', onStart);
    window.addEventListener('sahara:speech-chunk', onChunk);
    window.addEventListener('sahara:speech-end', onEnd);

    return () => {
      window.removeEventListener('sahara:speech-start', onStart);
      window.removeEventListener('sahara:speech-chunk', onChunk);
      window.removeEventListener('sahara:speech-end', onEnd);
    };
  }, []);

  // Listen for tab changes in Caregiver Dashboard
  useEffect(() => {
    const onTabChange = (e) => {
      if (e.detail?.tab) {
        setActivePortalTab(e.detail.tab);
      }
    };
    window.addEventListener('sahara:portal-tab-change', onTabChange);
    return () => window.removeEventListener('sahara:portal-tab-change', onTabChange);
  }, []);

  // Listen for active game level broadcast from memory game page
  useEffect(() => {
    const onLevelChange = (e) => {
      if (e.detail?.level) {
        setActiveGameLevel(Number(e.detail.level));
      }
    };
    window.addEventListener('sahara:game-level-active', onLevelChange);
    return () => window.removeEventListener('sahara:game-level-active', onLevelChange);
  }, []);

  const guidance = getVoiceGuidance(lang);
  const isGameRoute = pathname?.includes('/memory-game');

  // Determine current layout key with deep tab awareness
  const getLayoutKey = () => {
    if (!pathname || pathname === '/') return 'home';
    if (pathname.includes('/elder-dashboard')) return 'elder-dashboard';
    if (pathname.includes('/caregiver-dashboard')) {
      if (activePortalTab === 'contacts') return 'caregiver-contacts';
      if (activePortalTab === 'memories') return 'caregiver-memories';
      if (activePortalTab === 'routine') return 'caregiver-routine';
      if (activePortalTab === 'report') return 'caregiver-report';
      return 'caregiver-overview';
    }
    if (pathname.includes('/caregiver-login')) return 'caregiver-login';
    if (pathname.includes('/contacts')) return 'contacts';
    if (pathname.includes('/memory-game')) return 'memory-game-hub';
    return 'home';
  };

  const layoutKey = getLayoutKey();
  const currentTitle = guidance.layoutTitles?.[layoutKey] || guidance.layoutTitles?.home || 'Current Screen';

  const handleSpeakLayoutGuidance = () => {
    const text = guidance.layouts[layoutKey] || guidance.layouts.home;
    speakHumanText(text, {
      lang: guidance.langCode,
      rate: 0.88,
      pitch: 1.22,
    });
  };

  const handleSpeakGameGuidance = (lvl = activeGameLevel) => {
    const text = guidance.games[lvl] || guidance.games[1];
    speakHumanText(text, {
      lang: guidance.langCode,
      rate: 0.88,
      pitch: 1.22,
    });
  };

  const handleStop = () => {
    stopSpeech();
    setIsSpeaking(false);
    setSpokenSubtitle('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end pointer-events-none select-none font-sans">
      {/* Real-Time Live Speech Subtitle Bubble */}
      {isSpeaking && spokenSubtitle && (
        <div className="pointer-events-auto mb-3 max-w-[340px] sm:max-w-[420px] bg-white/95 backdrop-blur-md text-[#032109] p-4 rounded-2xl shadow-xl border-2 border-[#2ec4b6] animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-[#ebffe7]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ec4b6] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d631b]">
              {guidance.assistantTitle} • {lang}
            </span>
          </div>
          <p className="text-sm font-semibold leading-relaxed text-[#19371c]">
            “{spokenSubtitle}”
          </p>
        </div>
      )}

      {/* Expanded Control Card */}
      {isExpanded && (
        <div className="pointer-events-auto mb-3 w-[330px] sm:w-[390px] bg-[#ffffff] text-[#032109] rounded-3xl p-5 shadow-2xl border-2 border-[#bfe3bd] animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#ebffe7]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ebffe7] p-1 flex items-center justify-center border border-[#98f994]">
                <AssistantIcon isSpeaking={isSpeaking} className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#032109] leading-tight">
                  {guidance.assistantTitle}
                </h3>
                <span className="inline-block text-[11px] font-semibold text-[#0d631b] bg-[#ebffe7] px-2 py-0.5 rounded-full mt-0.5">
                  {guidance.femaleVoiceLabel}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              title="Minimize"
              aria-label="Minimize"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="py-3 space-y-2.5">
            <p className="text-xs text-[#40493d] font-medium leading-normal">
              {guidance.listeningPrompt}
            </p>

            {/* Quick Action: Screen Guidance (ONLY triggers speech when explicitly clicked) */}
            <button
              type="button"
              onClick={handleSpeakLayoutGuidance}
              className="w-full flex items-center justify-between px-3.5 py-3 bg-[#ebffe7] hover:bg-[#d9fdd6] active:scale-[0.98] rounded-xl text-left border border-[#bfe3bd] transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#0d631b] text-2xl">record_voice_over</span>
                <div>
                  <div className="text-xs font-extrabold text-[#032109]">{guidance.explainScreenBtn}</div>
                  <div className="text-[11px] text-[#0d631b] font-bold mt-0.5">{currentTitle}</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-sm text-[#0d631b] bg-white p-1.5 rounded-full shadow-xs">volume_up</span>
            </button>

            {/* Quick Action: Game Guidance (if on memory-game route) */}
            {isGameRoute ? (
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSpeakGameGuidance(activeGameLevel)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#e6fffa] hover:bg-[#ccfbf1] active:scale-[0.98] rounded-xl text-left border border-[#99f6e4] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#0f766e] text-xl">sports_esports</span>
                    <div>
                      <div className="text-xs font-bold text-[#0f766e]">{guidance.howToPlayBtn}</div>
                      <div className="text-[10px] text-[#115e59] font-medium">Level {activeGameLevel} Guide</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-xs text-[#0f766e]">play_circle</span>
                </button>

                {/* Quick Level Selector for audio help */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-thin">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleSpeakGameGuidance(lvl)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                        activeGameLevel === lvl
                          ? 'bg-[#0d631b] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      L{lvl}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Stop Speech Action */}
            {isSpeaking && (
              <button
                type="button"
                onClick={handleStop}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 active:scale-[0.98] rounded-xl font-bold text-xs border border-red-200 transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-base">stop_circle</span>
                {guidance.stopBtn}
              </button>
            )}
          </div>

          {/* Footer Info */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-[#0d631b]">language</span>
              Language: <strong className="text-gray-800">{lang}</strong>
            </span>
            <span className="text-[10px] text-[#2ec4b6] font-bold">Female Voice Cadence ✓</span>
          </div>
        </div>
      )}

      {/* Floating Interactive Avatar Pill / Launcher */}
      <button
        type="button"
        onClick={() => {
          // Strictly toggle open/close. NEVER start speaking automatically on initial tap.
          setIsExpanded(prev => !prev);
        }}
        className={`pointer-events-auto relative group flex items-center gap-2.5 p-2 pr-4 bg-white/95 hover:bg-white text-[#032109] rounded-full shadow-2xl border-2 transition-all duration-300 transform active:scale-95 cursor-pointer ${
          isSpeaking
            ? 'border-[#2ec4b6] ring-4 ring-[#2ec4b6]/30 animate-pulse'
            : 'border-[#bfe3bd] hover:border-[#0d631b]'
        }`}
        title="Voice Assistance & Guidance"
        aria-label="Sahara Voice Assistant"
      >
        <div className="w-12 h-12 rounded-full bg-[#ebffe7] flex items-center justify-center overflow-hidden border border-[#98f994]">
          <AssistantIcon isSpeaking={isSpeaking} className="w-10 h-10" />
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[#032109] group-hover:text-[#0d631b] transition-colors">
              {guidance.assistantTitle}
            </span>
            {isSpeaking && (
              <span className="w-2 h-2 rounded-full bg-[#2ec4b6] animate-ping" />
            )}
          </div>
          <div className="text-[10px] font-bold text-[#0d631b] flex items-center gap-1">
            <span>{isSpeaking ? 'Speaking...' : guidance.femaleVoiceLabel.split('(')[0].trim()}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{lang}</span>
          </div>
        </div>

        <span className="material-symbols-outlined text-[#0d631b] text-base opacity-70 group-hover:opacity-100 transition-opacity">
          {isExpanded ? 'expand_more' : 'chat_bubble'}
        </span>
      </button>
    </div>
  );
}
