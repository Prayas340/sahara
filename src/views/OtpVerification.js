import { authService } from '../services/authService.js';
import { dataStore } from '../services/dataStore.js';
import { getTranslation } from '../utils/i18n.js';
import { speakText } from '../utils/speech.js';
import { showToast } from '../utils/toast.js';

export function renderOtpVerification(onNavigate, params = {}) {
  const phone = params?.phone || '+91 98540 12345';
  const maskedPhone = phone.length >= 10 
    ? `${phone.slice(0, 8)} ••••${phone.slice(-2)}` 
    : phone;
  const sandboxCode = params?.sandboxCode || '482910';

  const lang = dataStore.getLanguage() || 'English';
  const t = getTranslation(lang);

  const html = `
    <div class="min-h-screen bg-[#ebffe7] flex items-center justify-center p-3 sm:p-6">
      <main class="w-full max-w-[48rem] mx-auto">
        <div class="flex flex-col w-full py-4">
          <!-- Progress / Step Pill -->
          <div class="flex items-center justify-between mb-6">
            <button 
              id="otp-back-btn" 
              class="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d3f8d0] hover:bg-[#cdf2cb] transition-colors text-[#0d631b] font-bold text-sm sm:text-base cursor-pointer" 
              type="button"
            >
              <span class="material-symbols-outlined text-[#0d631b] group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span>${t.backToPhone}</span>
            </button>
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#cdf2cb] text-[#0d631b] text-xs sm:text-sm font-bold">
              <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">verified_user</span>
              <span>${t.step2of3}</span>
            </div>
          </div>

          <!-- Central Verification Card -->
          <div class="relative card-tactile bg-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden border border-[#cdf2cb]">
            <!-- Ambient gentle tea leaf motif -->
            <div class="absolute -top-16 -right-16 w-48 h-48 pointer-events-none opacity-20 text-[#006e1c]">
              <svg class="w-full h-full" fill="currentColor" viewBox="0 0 200 200">
                <path d="M42.7,-72.1C54.9,-66.3,64.1,-54.3,71.2,-41.3C78.4,-28.3,83.4,-14.1,81.8,-0.9C80.2,12.3,71.9,24.6,63.4,35.9C54.8,47.2,46.1,57.5,35.1,65.3C24.1,73.1,12,78.3,-0.7,79.5C-13.4,80.7,-26.8,77.9,-38.7,71C-50.5,64.1,-60.8,53.2,-68.8,40.7C-76.9,28.3,-82.7,14.1,-82.9,-0.1C-83.1,-14.4,-77.8,-28.7,-69,-39.9C-60.2,-51.1,-48,-59.1,-35.3,-64.7C-22.6,-70.3,-11.3,-73.4,1.8,-76.5C14.9,-79.6,30.5,-77.9,42.7,-72.1Z" transform="translate(100 100)"></path>
              </svg>
            </div>

            <!-- Reassurance Banner -->
            <div class="flex items-center gap-3 p-3.5 mb-6 rounded-2xl bg-[#d9fdd6] text-[#032109] border border-[#cdf2cb]">
              <div class="w-10 h-10 rounded-xl bg-[#0d631b] flex items-center justify-center text-white shrink-0 shadow-sm">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">eco</span>
              </div>
              <div class="flex flex-col">
                <span class="text-base sm:text-lg font-bold text-[#0d631b]">${t.securityTitle}</span>
                <span class="text-xs sm:text-sm text-[#40493d]">${t.securityDesc}</span>
              </div>
            </div>

            <!-- Main Title & Prompt -->
            <div class="mb-6 text-left">
              <h1 class="text-3xl sm:text-4xl font-extrabold text-[#032109] mb-2 tracking-tight">${t.enterTheCode}</h1>
              <p class="text-base sm:text-xl text-[#40493d] flex flex-wrap items-center gap-2">
                <span>${t.sentCodeTo}</span>
                <span class="font-bold text-[#032109] bg-[#d3f8d0] px-3 py-1 rounded-lg whitespace-nowrap">${maskedPhone}</span>
              </p>
            </div>

            <!-- Voice Accessibility Assist Banner -->
            <div class="mb-6">
              <button 
                class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-[#98f994] hover:bg-[#7ddc7a] text-[#002204] font-bold text-sm sm:text-base transition-all active:scale-[0.98] shadow-sm cursor-pointer" 
                id="otp-read-aloud-btn" 
                type="button"
              >
                <span class="material-symbols-outlined text-2xl">volume_up</span>
                <span>${t.readAloud}</span>
                <span class="ml-auto sm:ml-2 text-xs bg-white px-2.5 py-0.5 rounded-full text-[#006e1c] font-bold">Suniyé</span>
              </button>
            </div>

            <!-- Accessible High-Contrast 6-Digit OTP Box Grid -->
            <form class="flex flex-col gap-6" id="otp-form" onsubmit="return false;">
              <div class="flex justify-between items-center gap-2 sm:gap-3 max-w-lg mx-auto w-full">
                <input class="otp-box w-12 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-extrabold rounded-2xl bg-[#d3f8d0] text-[#032109] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0d631b] shadow-sm border border-[#cdf2cb] transition-all" inputmode="numeric" maxlength="1" type="text" data-idx="0" />
                <input class="otp-box w-12 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-extrabold rounded-2xl bg-[#d3f8d0] text-[#032109] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0d631b] shadow-sm border border-[#cdf2cb] transition-all" inputmode="numeric" maxlength="1" type="text" data-idx="1" />
                <input class="otp-box w-12 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-extrabold rounded-2xl bg-[#d3f8d0] text-[#032109] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0d631b] shadow-sm border border-[#cdf2cb] transition-all" inputmode="numeric" maxlength="1" type="text" data-idx="2" />
                <input class="otp-box w-12 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-extrabold rounded-2xl bg-[#d3f8d0] text-[#032109] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0d631b] shadow-sm border border-[#cdf2cb] transition-all" inputmode="numeric" maxlength="1" type="text" data-idx="3" />
                <input class="otp-box w-12 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-extrabold rounded-2xl bg-[#d3f8d0] text-[#032109] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0d631b] shadow-sm border border-[#cdf2cb] transition-all" inputmode="numeric" maxlength="1" type="text" data-idx="4" />
                <input class="otp-box w-12 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-extrabold rounded-2xl bg-[#d3f8d0] text-[#032109] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0d631b] shadow-sm border border-[#cdf2cb] transition-all" inputmode="numeric" maxlength="1" type="text" data-idx="5" />
              </div>

              <!-- Quick autofill hint -->
              <div class="text-center">
                <button id="otp-auto-fill-btn" type="button" class="text-xs font-bold text-[#0d631b] hover:underline bg-[#ebffe7] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-[#cdf2cb] cursor-pointer">
                  <span class="material-symbols-outlined text-sm">auto_fix_high</span>
                  <span>${t.fillSandbox} (${sandboxCode})</span>
                </button>
              </div>

              <!-- Non-clinical Gentle Error Feedback Pill -->
              <div class="hidden flex items-start sm:items-center gap-3 p-4 rounded-2xl bg-[#ffdad6] text-[#93000a] mt-1 border border-red-200" id="otp-error-banner">
                <span class="material-symbols-outlined text-2xl shrink-0 text-[#ba1a1a]">info</span>
                <div class="flex-1">
                  <p class="text-sm sm:text-base font-semibold" id="otp-error-text">
                    That code doesn't look quite right. Please check your latest SMS and try again.
                  </p>
                </div>
                <button class="text-[#93000a] hover:opacity-75 p-1 rounded-full cursor-pointer" id="otp-close-error" type="button">
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <!-- Primary Confirmation Action Button -->
              <div class="pt-2">
                <button 
                  class="btn-tactile btn-primary w-full h-14 sm:h-16 rounded-2xl text-lg sm:text-xl font-extrabold flex items-center justify-center gap-3 shadow-md cursor-pointer" 
                  id="otp-verify-submit-btn" 
                  type="button"
                >
                  <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                  <span id="otp-submit-text">${t.verifyAndContinue}</span>
                </button>
              </div>
            </form>

            <!-- Resend & Alternative Channels Section -->
            <div class="mt-8 pt-4 bg-[#d9fdd6] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#cdf2cb]">
              <div>
                <span class="text-sm font-bold text-[#032109] block">${t.didntGetCode}</span>
                <div class="flex items-center gap-2 mt-1 text-[#40493d] text-sm">
                  <span class="material-symbols-outlined text-lg">schedule</span>
                  <span>${t.resendIn} <strong class="text-[#0d631b]" id="otp-countdown">00:28</strong></span>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button 
                  class="px-4 py-2.5 rounded-full bg-[#d3f8d0] hover:bg-[#cdf2cb] text-[#0d631b] text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer" 
                  id="otp-resend-sms-btn" 
                  type="button"
                >
                  <span class="material-symbols-outlined text-lg">sms</span>
                  <span>${t.resendSms}</span>
                </button>
                <button 
                  class="px-4 py-2.5 rounded-full bg-[#98f994] hover:bg-[#7ddc7a] text-[#002204] text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer" 
                  id="otp-resend-wa-btn" 
                  type="button"
                >
                  <span class="material-symbols-outlined text-lg">chat</span>
                  <span>${t.sendWhatsApp}</span>
                </button>
              </div>
            </div>

            <!-- Caregiver Direct Assistance Link Footer -->
            <div class="mt-4 flex items-center justify-between p-3.5 rounded-xl bg-[#cdf2cb]">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#ffdeaa] flex items-center justify-center text-[#271900]">
                  <span class="material-symbols-outlined">support_agent</span>
                </div>
                <div>
                  <p class="text-xs sm:text-sm font-bold text-[#032109]">${t.needHelpingHand}</p>
                  <p class="text-xs text-[#40493d]">${t.caregiverStandby}</p>
                </div>
              </div>
              <button 
                class="px-4 py-2 rounded-full bg-white text-[#0d631b] font-bold text-xs sm:text-sm hover:bg-[#ebffe7] shadow-sm cursor-pointer" 
                id="otp-call-support-btn" 
                type="button"
              >
                ${t.callCaregiver}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  // Attach event handlers
  setTimeout(() => {
    const inputs = document.querySelectorAll('.otp-box');
    const backBtn = document.getElementById('otp-back-btn');
    const verifyBtn = document.getElementById('otp-verify-submit-btn');
    const autoFillBtn = document.getElementById('otp-auto-fill-btn');
    const readAloudBtn = document.getElementById('otp-read-aloud-btn');
    const resendSmsBtn = document.getElementById('otp-resend-sms-btn');
    const resendWaBtn = document.getElementById('otp-resend-wa-btn');
    const callSupportBtn = document.getElementById('otp-call-support-btn');
    const errorBanner = document.getElementById('otp-error-banner');
    const closeErrorBtn = document.getElementById('otp-close-error');

    // Auto-focus box navigation
    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = val;
        if (val && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          inputs[index - 1].focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('text').trim();
        const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
        digits.split('').forEach((d, i) => {
          if (inputs[i]) inputs[i].value = d;
        });
        if (digits.length >= 6) {
          inputs[5].focus();
        }
      });
    });

    // Back to login
    backBtn?.addEventListener('click', () => onNavigate('welcome-login'));

    // Auto fill sandbox code
    autoFillBtn?.addEventListener('click', () => {
      sandboxCode.split('').forEach((d, i) => {
        if (inputs[i]) inputs[i].value = d;
      });
      showToast(`Filled OTP code: ${sandboxCode}`, 'info');
      errorBanner?.classList.add('hidden');
    });

    // Read aloud code
    readAloudBtn?.addEventListener('click', () => {
      const codeDigits = sandboxCode.split('').join(' ');
      const speechText = `Your six digit verification code is: ${codeDigits}`;
      speakText(speechText, t.langCode);
      showToast(`🔊 Reading code: ${codeDigits}`, 'info');
    });

    // Countdown simulation
    let timeLeft = 28;
    const timerElem = document.getElementById('otp-countdown');
    const interval = setInterval(() => {
      timeLeft--;
      if (timerElem) {
        if (timeLeft >= 0) {
          timerElem.innerText = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
        } else {
          timerElem.innerText = 'Ready';
          clearInterval(interval);
        }
      }
    }, 1000);

    // Resend triggers
    resendSmsBtn?.addEventListener('click', async () => {
      showToast('Resending SMS via Supabase...', 'info');
      await authService.sendPhoneOtp(phone);
      showToast('Fresh code sent via SMS!', 'success');
    });

    resendWaBtn?.addEventListener('click', () => {
      showToast(`WhatsApp verification broadcast dispatched to ${phone}`, 'success');
    });

    callSupportBtn?.addEventListener('click', () => {
      showToast('Calling Riya Borah (+91 98540 12345)...', 'heart');
      window.open('tel:+919854012345');
    });

    closeErrorBtn?.addEventListener('click', () => {
      errorBanner?.classList.add('hidden');
    });

    // Verify submission
    verifyBtn?.addEventListener('click', async () => {
      let enteredCode = '';
      inputs.forEach(i => enteredCode += i.value);

      if (enteredCode.length < 6) {
        errorBanner?.classList.remove('hidden');
        document.getElementById('otp-error-text').innerText = 'Please enter all 6 digits of your verification code.';
        return;
      }

      verifyBtn.disabled = true;
      document.getElementById('otp-submit-text').innerText = t.verifying;

      const res = await authService.verifyOtp(phone, enteredCode);
      verifyBtn.disabled = false;
      document.getElementById('otp-submit-text').innerText = t.verifyAndContinue;

      if (res?.success) {
        clearInterval(interval);
        if (res.isNewUser) {
          showToast('Code verified! Setting up your profile...', 'success');
          onNavigate('profile-setup', { phone });
        } else {
          showToast(res.message || 'Welcome back! Loading your Sanctuary...', 'success');
          onNavigate('elder-dashboard');
        }
      } else {
        errorBanner?.classList.remove('hidden');
        document.getElementById('otp-error-text').innerText = res?.message || "Invalid verification code. Please check your SMS messages.";
      }
    });

    // Auto-focus first input
    inputs[0]?.focus();
  }, 0);

  return html;
}
