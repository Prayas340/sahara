import { authService } from '../services/authService.js';
import { dataStore } from '../services/dataStore.js';
import { getTranslation } from '../utils/i18n.js';
import { speakText, toggleAccessibilityTextSize } from '../utils/speech.js';
import { showToast } from '../utils/toast.js';

export function renderWelcomePhoneLogin(onNavigate) {
  let activeLanguage = dataStore.getLanguage() || 'English';
  let t = getTranslation(activeLanguage);

  const html = `
    <div class="min-h-screen min-h-[100dvh] bg-[#ebffe7] flex items-center justify-center p-3 sm:p-4 lg:p-6 w-full">
      <main class="w-full max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto my-auto py-2 sm:py-4">
        
        <!-- Top Portal Switcher Bar -->
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="inline-flex p-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#cdf2cb] gap-1">
            <button 
              type="button" 
              class="py-1.5 px-3.5 rounded-xl bg-[#0d631b] text-white font-extrabold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-default"
            >
              <span class="material-symbols-outlined text-base">elderly</span>
              <span>Elder View Portal</span>
            </button>
            <button 
              id="switch-to-caregiver-btn"
              type="button" 
              class="py-1.5 px-3.5 rounded-xl text-[#40493d] hover:text-[#0d631b] hover:bg-[#ebffe7] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">health_and_safety</span>
              <span>Caregiver Portal Login →</span>
            </button>
          </div>

          <span class="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#0d631b] bg-white/80 px-3 py-1.5 rounded-full border border-[#cdf2cb] shadow-xs">
            <span class="w-2 h-2 rounded-full bg-[#006e1c] animate-pulse"></span>
            Elder View Active
          </span>
        </div>

        <!-- Tactile Elevated Welcome Card: Split 2-Column on Desktop, Natural Stack on Mobile -->
        <div class="card-tactile overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl transition-all duration-300 border border-[#cdf2cb]">
          
          <!-- LEFT SIDE: Cultural & Illustrative Banner -->
          <div class="relative lg:col-span-5 bg-[#d9fdd6] p-5 sm:p-6 lg:p-6 xl:p-7 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#cdf2cb]">
            <!-- Subtle Organic Curved Backdrop Shapes -->
            <div class="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#a3f69c] opacity-40 blur-2xl pointer-events-none"></div>
            <div class="absolute -bottom-8 -right-8 w-52 h-52 rounded-full bg-[#98f994] opacity-50 blur-2xl pointer-events-none"></div>

            <!-- Top Row: App Brand Presentation -->
            <div class="relative z-10 flex items-center justify-between gap-3 mb-3 lg:mb-4">
              <div class="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-[#cdf2cb]">
                <img 
                  alt="Sahara Brand Logo" 
                  class="w-8 h-8 object-contain rounded-full bg-white p-0.5" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuADfY8uUCdflx3PxgJV8n5Rdy5e1UqyJi1RpuX07Bmc9r6hn23Klt8mhC0O57Dlsy0AoO2Zfur4kxn9yueS6kMU1-B3o_rUnCtsYE80rKVOILi3Gl6wxP62ffyGjvNMaoafsux-4Nu3YfcznSLtBj71fvQApLWucdiSJyE4VD5KSm1AryUPF0ooW09SbgA3OdWj_0EfL0E3tOmeMY4frF7WwHEp3O9blDcLXakfekbdhrlgiYNNcO0c2Q"
                />
                <span class="text-lg font-extrabold text-[#0d631b]">Sahara</span>
              </div>
              <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#0d631b] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#cdf2cb]">
                <span class="material-symbols-outlined text-sm">verified</span>
                <span id="welcome-care-badge">${t.gentleCare}</span>
              </span>
            </div>

            <!-- Middle: Warm Illustration Card -->
            <div class="relative z-10 flex flex-col gap-3 my-auto">
              <div class="w-full rounded-2xl overflow-hidden shadow-md bg-white border border-[#cdf2cb] group">
                <div class="relative overflow-hidden bg-[#c5f0c3]">
                  <img 
                    class="w-full h-40 sm:h-48 lg:h-38 xl:h-44 object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-500" 
                    alt="Asha ji and Riya sharing morning chai" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJSlVR-5VNbFEhXPfbHMokwKEVr4p84T1vioRIMtQbkjjZc_QouzIsH096JkiTRDihsg6TCuY9_5nzWs5gSPS21IyMjyNyEdLN0qMsDLQrgYsA9FNu2_N5GDRxhuuX3lTWOY1gqck6g0X49fzKVVjDsnW8EnjFBrqmMjH4v4C4u37k7sVe2eyvou_9I1gFBAfDUBLLhYXsfRWeGcXvm-WDEuz5BDstMLhUb4FNoAHXed73cvrYlATz3g"
                  />
                </div>
                <div class="p-2.5 sm:p-3 bg-white flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#0d631b] animate-pulse"></span>
                    <p class="text-xs sm:text-sm font-bold text-[#0d631b]" id="welcome-namaste-text">${t.namasteWelcome}</p>
                  </div>
                  <!-- Audio Guidance Pill Button -->
                  <button 
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d3f8d0] text-[#0d631b] text-xs font-bold hover:bg-[#0d631b] hover:text-white active:scale-95 transition-all shadow-sm cursor-pointer" 
                    id="welcome-voice-btn" 
                    type="button"
                    title="Listen to audio instructions"
                  >
                    <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">volume_up</span>
                    <span id="welcome-voice-label">${t.listen}</span>
                  </button>
                </div>
              </div>

              <!-- Tagline & Reassuring Mission -->
              <div class="text-left mt-1">
                <h1 class="text-lg sm:text-xl lg:text-[1.4rem] xl:text-2xl font-extrabold text-[#032109] leading-snug" id="welcome-tagline">
                  ${t.tagline}
                </h1>
                <p class="text-xs sm:text-sm text-[#40493d] mt-1.5 leading-relaxed" id="welcome-subtitle">
                  ${t.subtitle}
                </p>
              </div>
            </div>
          </div>

          <!-- RIGHT SIDE: Main Interaction & Form Section -->
          <div class="lg:col-span-7 bg-white p-5 sm:p-6 lg:p-7 xl:p-8 flex flex-col justify-between gap-3.5 sm:gap-4">
            <!-- Language Selection Chips -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs sm:text-sm font-bold text-[#032109] flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[#0d631b] text-base">translate</span>
                  <span id="welcome-choose-lang-text">${t.chooseLanguage}</span>
                </label>
                <span class="text-xs text-[#40493d]"><span id="welcome-selected-label">${t.selected}:</span> <strong class="text-[#0d631b]" id="active-lang-text">${activeLanguage}</strong></span>
              </div>
              <div class="flex flex-wrap gap-1.5" id="welcome-lang-chips">
                <button class="lang-btn ${activeLanguage === 'English' ? 'active bg-[#0d631b] text-white' : 'bg-[#d3f8d0] text-[#032109]'} px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer" data-lang="English">English</button>
                <button class="lang-btn ${activeLanguage === 'हिंदी' ? 'active bg-[#0d631b] text-white' : 'bg-[#d3f8d0] text-[#032109]'} px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer" data-lang="हिंदी">हिंदी (Hindi)</button>
                <button class="lang-btn ${activeLanguage === 'অসমীয়া' ? 'active bg-[#0d631b] text-white' : 'bg-[#d3f8d0] text-[#032109]'} px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer" data-lang="অসমীয়া">অসমীয়া (Assamese)</button>
                <button class="lang-btn ${activeLanguage === 'বাংলা' ? 'active bg-[#0d631b] text-white' : 'bg-[#d3f8d0] text-[#032109]'} px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer" data-lang="বাংলা">বাংলা (Bengali)</button>
                <button class="lang-btn ${activeLanguage === 'মৈতৈলোন্' ? 'active bg-[#0d631b] text-white' : 'bg-[#d3f8d0] text-[#032109]'} px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer" data-lang="মৈতৈলোন্">ꯃꯤꯇꯩꯂꯣꯟ (Manipuri)</button>
              </div>
            </div>

            <!-- Phone Number Input Form Container -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm sm:text-base font-bold text-[#032109] flex items-center justify-between" for="login-phone-input">
                <span id="welcome-phone-label">${t.phoneLabel}</span>
                <span class="text-xs text-[#0d631b] font-bold bg-[#ebffe7] px-2.5 py-0.5 rounded-full border border-[#cdf2cb]" id="welcome-step-badge">${t.step1of3}</span>
              </label>
              <!-- Input Outer Wrapper -->
              <div class="relative flex items-center w-full rounded-2xl bg-white border-2 border-[#cdf2cb] focus-within:border-[#2e7d32] shadow-sm transition-all">
                <!-- Country Dial Code Fixed Area -->
                <div class="h-12 sm:h-13 flex items-center gap-2 pl-3.5 pr-2.5 bg-[#d9fdd6] rounded-l-2xl shrink-0 border-r border-[#cdf2cb]">
                  <span class="text-lg leading-none">🇮🇳</span>
                  <span class="text-sm sm:text-base font-extrabold text-[#032109]">+91</span>
                </div>
                <!-- Big Easy-Touch Input Field -->
                <input 
                  class="w-full h-12 sm:h-13 px-3.5 text-lg sm:text-xl font-bold text-[#032109] placeholder:text-gray-400 placeholder:font-normal bg-transparent rounded-r-2xl outline-none" 
                  id="login-phone-input" 
                  inputmode="numeric" 
                  maxlength="10" 
                  placeholder="Enter 10-digit mobile number" 
                  type="tel"
                  value=""
                />
                <!-- Quick Clear Button -->
                <button 
                  aria-label="Clear mobile number" 
                  class="absolute right-3 p-1.5 text-gray-400 hover:text-gray-700 rounded-full transition-colors cursor-pointer" 
                  id="login-clear-phone-btn" 
                  type="button"
                >
                  <span class="material-symbols-outlined text-xl sm:text-2xl">cancel</span>
                </button>
              </div>
              <p class="text-xs text-[#40493d] flex items-center gap-1.5 px-1">
                <span class="material-symbols-outlined text-sm text-[#0d631b]">info</span>
                <span id="welcome-sms-note">${t.smsNote}</span>
              </p>
            </div>

            <!-- High Contrast Hero Action Button -->
            <div class="flex flex-col gap-2.5 pt-0.5">
              <button 
                class="btn-tactile btn-primary w-full h-12 sm:h-13 rounded-full text-base sm:text-lg font-extrabold flex items-center justify-center gap-2.5 px-6 shadow-md group cursor-pointer" 
                id="login-send-otp-btn" 
                type="button"
              >
                <span id="login-btn-text">${t.sendOtp}</span>
                <span class="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>

              <!-- Divider -->
              <div class="relative flex py-1 items-center">
                <div class="flex-grow border-t border-gray-200"></div>
                <span class="flex-shrink mx-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider" id="welcome-or-signin">${t.orSignInWith}</span>
                <div class="flex-grow border-t border-gray-200"></div>
              </div>

              <!-- Google Sign In Button -->
              <button 
                class="w-full h-11 sm:h-12 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 px-4 shadow-sm active:scale-[0.99] cursor-pointer" 
                id="login-google-btn" 
                type="button"
              >
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span id="welcome-google-text">${t.signInWithGoogle}</span>
              </button>
            </div>

            <!-- Gentle Reassurance Security Badge -->
            <div class="bg-[#d9fdd6] rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 border border-[#cdf2cb]">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#0d631b]">
                <span class="material-symbols-outlined text-xl sm:text-2xl" style="font-variation-settings: 'FILL' 1;">verified_user</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs sm:text-sm font-bold text-[#032109]" id="welcome-safe-title">${t.safeAndProtected}</span>
                <span class="text-[11px] sm:text-xs text-[#40493d] leading-tight" id="welcome-safe-desc">${t.safeDesc}</span>
              </div>
            </div>

            <!-- Caregiver and Voice Assistance Footer Link -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-2 pt-0.5 text-center sm:text-left">
              <a class="text-xs font-bold text-[#0d631b] hover:underline inline-flex items-center gap-1.5 p-1 rounded-lg" href="#support" id="welcome-support-btn">
                <span class="material-symbols-outlined text-base">contact_support</span>
                <span id="welcome-support-text">${t.needHelp}</span>
              </a>
              <a class="text-xs font-semibold text-[#40493d] hover:text-[#0d631b] inline-flex items-center gap-1 p-1 rounded-lg" href="#accessibility" id="welcome-text-size-btn">
                <span class="material-symbols-outlined text-base">format_size</span>
                <span id="welcome-text-size-text">${t.largerTextSize}</span>
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;

  // Attach event handlers
  setTimeout(() => {
    const phoneInput = document.getElementById('login-phone-input');
    const clearBtn = document.getElementById('login-clear-phone-btn');
    const sendOtpBtn = document.getElementById('login-send-otp-btn');
    const googleBtn = document.getElementById('login-google-btn');
    const voiceGuideBtn = document.getElementById('welcome-voice-btn');
    const voiceLabel = document.getElementById('welcome-voice-label');
    const btnText = document.getElementById('login-btn-text');
    const langChips = document.querySelectorAll('.lang-btn');
    const textSizeBtn = document.getElementById('welcome-text-size-btn');
    const supportBtn = document.getElementById('welcome-support-btn');

    // Phone input filtering
    phoneInput?.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    clearBtn?.addEventListener('click', () => {
      if (phoneInput) {
        phoneInput.value = '';
        phoneInput.focus();
      }
    });

    // Language selection
    langChips.forEach(btn => {
      btn.addEventListener('click', () => {
        langChips.forEach(b => {
          b.className = 'lang-btn px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[#d3f8d0] text-[#032109] hover:bg-[#cdf2cb] transition-all cursor-pointer';
        });
        btn.className = 'lang-btn active px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[#0d631b] text-white shadow-sm transition-all cursor-pointer';

        activeLanguage = btn.dataset.lang;
        dataStore.setLanguage(activeLanguage);
        t = getTranslation(activeLanguage);

        // Update all UI labels instantly to match the selected language
        const activeLangText = document.getElementById('active-lang-text');
        if (activeLangText) activeLangText.innerText = activeLanguage;

        const careBadge = document.getElementById('welcome-care-badge');
        if (careBadge) careBadge.innerText = t.gentleCare;

        const namasteText = document.getElementById('welcome-namaste-text');
        if (namasteText) namasteText.innerText = t.namasteWelcome;

        if (voiceLabel) voiceLabel.innerText = t.listen;

        const tagline = document.getElementById('welcome-tagline');
        if (tagline) tagline.innerText = t.tagline;

        const subtitle = document.getElementById('welcome-subtitle');
        if (subtitle) subtitle.innerText = t.subtitle;

        const chooseLang = document.getElementById('welcome-choose-lang-text');
        if (chooseLang) chooseLang.innerText = t.chooseLanguage;

        const selLabel = document.getElementById('welcome-selected-label');
        if (selLabel) selLabel.innerText = t.selected + ':';

        const phoneLabel = document.getElementById('welcome-phone-label');
        if (phoneLabel) phoneLabel.innerText = t.phoneLabel;

        const stepBadge = document.getElementById('welcome-step-badge');
        if (stepBadge) stepBadge.innerText = t.step1of3;

        const smsNote = document.getElementById('welcome-sms-note');
        if (smsNote) smsNote.innerText = t.smsNote;

        if (btnText) btnText.innerText = t.sendOtp;

        const orSignIn = document.getElementById('welcome-or-signin');
        if (orSignIn) orSignIn.innerText = t.orSignInWith;

        const googleText = document.getElementById('welcome-google-text');
        if (googleText) googleText.innerText = t.signInWithGoogle;

        const safeTitle = document.getElementById('welcome-safe-title');
        if (safeTitle) safeTitle.innerText = t.safeAndProtected;

        const safeDesc = document.getElementById('welcome-safe-desc');
        if (safeDesc) safeDesc.innerText = t.safeDesc;

        const supportText = document.getElementById('welcome-support-text');
        if (supportText) supportText.innerText = t.needHelp;

        const textSizeText = document.getElementById('welcome-text-size-text');
        if (textSizeText) textSizeText.innerText = t.largerTextSize;
      });
    });

    // Voice guidance button
    voiceGuideBtn?.addEventListener('click', () => {
      speakText(t.voiceWelcome, t.langCode);
      showToast('🔊 Playing audio guide: ' + t.voiceWelcome, 'info');
    });

    // Send OTP handler
    sendOtpBtn?.addEventListener('click', async () => {
      const phone = phoneInput?.value.trim();
      if (!phone || phone.length < 10) {
        showToast('Please enter a valid 10-digit mobile phone number.', 'error');
        phoneInput?.focus();
        return;
      }

      btnText.innerText = t.sendingOtp;
      sendOtpBtn.disabled = true;

      const res = await authService.sendPhoneOtp(phone);
      btnText.innerText = t.sendOtp;
      sendOtpBtn.disabled = false;

      if (res.success) {
        showToast(res.message, 'success');
        onNavigate('otp-verify', { phone: res.phone, sandboxCode: res.code });
      } else {
        showToast(res.message || 'Failed to send OTP', 'error');
      }
    });

    // Google Sign In handler
    googleBtn?.addEventListener('click', async () => {
      googleBtn.disabled = true;
      googleBtn.innerText = 'Connecting to Google...';
      const res = await authService.signInWithGoogle();
      googleBtn.disabled = false;
      googleBtn.innerHTML = `
        <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
        <span id="welcome-google-text">${t.signInWithGoogle}</span>
      `;

      if (res?.success) {
        showToast(res.message, 'success');
        if (res.isNewUser) {
          onNavigate('profile-setup', { user: res.user, email: res.email });
        } else {
          onNavigate('elder-dashboard');
        }
      }
    });

    // Larger text size toggle
    textSizeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const isLarge = toggleAccessibilityTextSize();
      showToast(isLarge ? 'Larger Text Size Enabled 🔍' : 'Standard Text Size Restored', 'info');
    });

    // Switch to Caregiver Portal Login
    const switchToCaregiverBtn = document.getElementById('switch-to-caregiver-btn');
    switchToCaregiverBtn?.addEventListener('click', () => {
      onNavigate('caregiver-login');
    });

    // Support link
    supportBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Sahara Caregiver Helpline: Toll-free assistance available 24/7 at 1800-202-7472 (Assamese, Hindi, English).', 'info', 6000);
    });
  }, 0);

  return html;
}
