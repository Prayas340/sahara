import { authService } from '../services/authService.js';
import { showToast } from '../utils/toast.js';

export function renderCaregiverLogin(onNavigate) {
  const html = `
    <div class="min-h-screen min-h-[100dvh] bg-[#ebffe7] flex items-center justify-center p-3 sm:p-4 lg:p-6 w-full">
      <main class="w-full max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto my-auto py-2 sm:py-4">
        
        <!-- Top Portal Switcher Bar -->
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="inline-flex p-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#cdf2cb] gap-1">
            <button 
              id="switch-to-elder-btn"
              type="button" 
              class="py-1.5 px-3.5 rounded-xl text-[#40493d] hover:text-[#0d631b] hover:bg-[#ebffe7] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">elderly</span>
              <span>← Switch to Elder View</span>
            </button>
            <button 
              type="button" 
              class="py-1.5 px-3.5 rounded-xl bg-[#0d631b] text-white font-extrabold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-default"
            >
              <span class="material-symbols-outlined text-base">health_and_safety</span>
              <span>Caregiver Portal</span>
            </button>
          </div>

          <span class="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#0d631b] bg-white/80 px-3 py-1.5 rounded-full border border-[#cdf2cb] shadow-xs">
            <span class="w-2 h-2 rounded-full bg-[#006e1c] animate-pulse"></span>
            Family & Clinical Mode
          </span>
        </div>

        <!-- Tactile Elevated Card -->
        <div class="card-tactile overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl transition-all duration-300 border border-[#cdf2cb]">
          
          <!-- LEFT SIDE: Caregiver Clinical & Family Hero Banner -->
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
                <div class="flex flex-col">
                  <span class="text-base font-extrabold text-[#0d631b] leading-tight">Sahara</span>
                  <span class="text-[10px] font-bold text-[#40493d] -mt-0.5">Caregiver Companion</span>
                </div>
              </div>
              <span class="inline-flex items-center gap-1 text-[11px] font-bold text-[#0d631b] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#cdf2cb]">
                <span class="material-symbols-outlined text-sm">verified</span>
                <span>Caregiver Access</span>
              </span>
            </div>

            <!-- Middle: Caregiver Illustration & Connected Elder Preview -->
            <div class="relative z-10 flex flex-col gap-3 my-auto">
              <div class="w-full rounded-2xl overflow-hidden shadow-md bg-white border border-[#cdf2cb] group">
                <div class="relative overflow-hidden bg-[#c5f0c3]">
                  <img 
                    class="w-full h-40 sm:h-48 lg:h-38 xl:h-44 object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-500" 
                    alt="Caregiver Riya providing supportive companionship" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJSlVR-5VNbFEhXPfbHMokwKEVr4p84T1vioRIMtQbkjjZc_QouzIsH096JkiTRDihsg6TCuY9_5nzWs5gSPS21IyMjyNyEdLN0qMsDLQrgYsA9FNu2_N5GDRxhuuX3lTWOY1gqck6g0X49fzKVVjDsnW8EnjFBrqmMjH4v4C4u37k7sVe2eyvou_9I1gFBAfDUBLLhYXsfRWeGcXvm-WDEuz5BDstMLhUb4FNoAHXed73cvrYlATz3g"
                  />
                </div>
                
                <div class="p-3 bg-white flex items-center justify-between border-t border-[#cdf2cb]">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#0d631b] animate-pulse"></span>
                    <p class="text-xs sm:text-sm font-bold text-[#0d631b]">Caregiver Companion Portal</p>
                  </div>
                  <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ebffe7] text-[#0d631b] border border-[#cdf2cb]">
                    Protected Access
                  </span>
                </div>
              </div>

              <!-- Reassuring Portal Mission -->
              <div class="text-left mt-1 space-y-1">
                <h1 class="text-base sm:text-lg lg:text-xl font-extrabold text-[#032109] leading-snug">
                  Real-time cognitive support & family oversight
                </h1>
                <p class="text-xs text-[#40493d] leading-relaxed">
                  Log in to manage medication schedules, view cognitive game progress, and monitor emergency notifications.
                </p>
              </div>
            </div>

            <!-- Bottom Privacy & Security Pill -->
            <div class="relative z-10 mt-3 pt-3 border-t border-[#cdf2cb] flex items-center gap-2 text-xs text-[#40493d]">
              <span class="material-symbols-outlined text-base text-[#0d631b]">lock</span>
              <span>Encrypted, HIPAA & Consent compliant sync</span>
            </div>
          </div>

          <!-- RIGHT SIDE: Caregiver Login Form -->
          <div class="lg:col-span-7 bg-white p-5 sm:p-6 lg:p-7 xl:p-8 flex flex-col justify-between gap-4">
            
            <div>
              <!-- Form Header -->
              <div class="flex items-center gap-2 mb-1">
                <div class="w-8 h-8 rounded-xl bg-[#0d631b] text-white flex items-center justify-center shadow-xs">
                  <span class="material-symbols-outlined text-lg">admin_panel_settings</span>
                </div>
                <h2 class="text-lg sm:text-xl font-extrabold text-[#032109]">Sign In to Caregiver Portal</h2>
              </div>
              <p class="text-xs sm:text-sm text-[#40493d] mb-4">
                Sign in with your authorized caregiver email and password to access the patient care dashboard.
              </p>

              <!-- Error Alert Box -->
              <div id="caregiver-error-box" class="hidden mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span class="material-symbols-outlined text-base">error</span>
                <span id="caregiver-error-msg">Error</span>
              </div>

              <!-- Form -->
              <form id="caregiver-login-form" class="space-y-3.5">
                <!-- Caregiver Email Input -->
                <div class="space-y-1">
                  <label class="text-xs sm:text-sm font-bold text-[#032109] flex items-center justify-between" for="caregiver-login-email">
                    <span>Caregiver Email Address</span>
                    <span class="text-xs font-semibold text-[#0d631b]">Login ID</span>
                  </label>
                  <div class="relative flex items-center w-full rounded-2xl bg-white border-2 border-[#cdf2cb] focus-within:border-[#2e7d32] shadow-xs transition-all">
                    <span class="material-symbols-outlined pl-3.5 text-gray-400 text-xl">mail</span>
                    <input 
                      class="w-full h-12 px-3 text-sm sm:text-base font-bold text-[#032109] placeholder:text-gray-400 bg-transparent rounded-2xl outline-none" 
                      id="caregiver-login-email" 
                      type="email" 
                      placeholder="e.g. riya@sahara.care" 
                      value=""
                      required 
                    />
                  </div>
                </div>

                <!-- Caregiver Password Input -->
                <div class="space-y-1">
                  <label class="text-xs sm:text-sm font-bold text-[#032109] flex items-center justify-between" for="caregiver-login-password">
                    <span>Caregiver Password</span>
                    <span class="text-xs font-semibold text-[#0d631b]">Security Key</span>
                  </label>
                  <div class="relative flex items-center w-full rounded-2xl bg-white border-2 border-[#cdf2cb] focus-within:border-[#2e7d32] shadow-xs transition-all">
                    <span class="material-symbols-outlined pl-3.5 text-gray-400 text-xl">lock</span>
                    <input 
                      class="w-full h-12 pl-3 pr-10 text-sm sm:text-base font-bold text-[#032109] placeholder:text-gray-400 bg-transparent rounded-2xl outline-none" 
                      id="caregiver-login-password" 
                      type="password" 
                      placeholder="Enter password" 
                      value=""
                      required 
                    />
                    <button 
                      id="toggle-login-password-btn" 
                      type="button" 
                      class="absolute right-3 text-gray-400 hover:text-[#0d631b] p-1 cursor-pointer transition-colors"
                      title="Show or hide password"
                    >
                      <span class="material-symbols-outlined text-xl" id="login-password-eye-icon">visibility</span>
                    </button>
                  </div>
                </div>

                <!-- Submit Button -->
                <button 
                  id="caregiver-submit-btn" 
                  type="submit" 
                  class="btn-tactile btn-primary w-full h-13 sm:h-14 rounded-2xl text-base sm:text-lg font-extrabold flex items-center justify-center gap-2.5 shadow-md group cursor-pointer mt-3"
                >
                  <span id="caregiver-submit-text">Sign In to Caregiver Portal</span>
                  <span class="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </form>
            </div>

            <!-- Footer Switcher Link -->
            <div class="pt-2 border-t border-[#cdf2cb] flex items-center justify-between text-xs text-[#40493d]">
              <span>Are you an elder looking for your daily companion?</span>
              <button 
                id="footer-switch-to-elder-btn" 
                type="button" 
                class="font-bold text-[#0d631b] hover:underline cursor-pointer"
              >
                Go to Elder Login →
              </button>
            </div>

          </div>

        </div>

      </main>
    </div>
  `;

  // Attach event handlers
  setTimeout(() => {
    const form = document.getElementById('caregiver-login-form');
    const emailInput = document.getElementById('caregiver-login-email');
    const passwordInput = document.getElementById('caregiver-login-password');
    const submitBtn = document.getElementById('caregiver-submit-btn');
    const submitText = document.getElementById('caregiver-submit-text');
    const errorBox = document.getElementById('caregiver-error-box');
    const errorMsg = document.getElementById('caregiver-error-msg');
    const togglePasswordBtn = document.getElementById('toggle-login-password-btn');
    const passwordEyeIcon = document.getElementById('login-password-eye-icon');
    const switchToElderBtn = document.getElementById('switch-to-elder-btn');
    const footerSwitchToElderBtn = document.getElementById('footer-switch-to-elder-btn');

    // Switch to Elder view
    const goToElder = () => onNavigate('welcome-login');
    switchToElderBtn?.addEventListener('click', goToElder);
    footerSwitchToElderBtn?.addEventListener('click', goToElder);

    // Toggle password visibility
    togglePasswordBtn?.addEventListener('click', () => {
      if (passwordInput) {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        if (passwordEyeIcon) {
          passwordEyeIcon.innerText = isPassword ? 'visibility_off' : 'visibility';
        }
      }
    });

    // Form submit
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput?.value.trim().toLowerCase();
      const password = passwordInput?.value.trim();

      const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!email) {
        if (errorBox && errorMsg) {
          errorMsg.innerText = 'Please enter your caregiver email address.';
          errorBox.classList.remove('hidden');
        }
        showToast('Please enter your caregiver email address.', 'error');
        emailInput?.focus();
        return;
      }

      if (!EMAIL_REGEX.test(email)) {
        if (errorBox && errorMsg) {
          errorMsg.innerText = 'Please enter a valid email address (e.g. name@domain.com).';
          errorBox.classList.remove('hidden');
        }
        showToast('Please enter a valid email format.', 'error');
        emailInput?.focus();
        return;
      }

      if (!password) {
        if (errorBox && errorMsg) {
          errorMsg.innerText = 'Please enter your caregiver portal password.';
          errorBox.classList.remove('hidden');
        }
        showToast('Please enter your password.', 'error');
        passwordInput?.focus();
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (submitText) submitText.innerText = 'Verifying Caregiver Access...';
      if (errorBox) errorBox.classList.add('hidden');

      const res = await authService.loginCaregiver({ email, password });

      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.innerText = 'Sign In to Caregiver Portal';

      if (res.success) {
        showToast(`Welcome, ${res.user.name}! Connected to ${res.elderProfile.name}'s profile.`, 'success', 5000);
        onNavigate('caregiver-dashboard');
      } else {
        const msg = res.message || 'Access denied. The email or password entered does not match this elder’s registered caregiver.';
        if (errorBox && errorMsg) {
          errorMsg.innerText = msg;
          errorBox.classList.remove('hidden');
        }
        showToast(msg, 'error');
      }
    });

  }, 0);

  return html;
}
