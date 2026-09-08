import { authService } from '../services/authService.js';
import { dataStore } from '../services/dataStore.js';
import { ALL_STATES, ALL_CITIES } from '../utils/geoData.js';
import { getTranslation } from '../utils/i18n.js';
import { speakText } from '../utils/speech.js';
import { showToast } from '../utils/toast.js';

export function renderUserDetailsSetup(onNavigate, params = {}) {
  const currentPatient = dataStore.getPatient ? dataStore.getPatient() : (dataStore.state.patient || {});
  const currentCaregiver = dataStore.getCaregiver ? dataStore.getCaregiver() : (dataStore.state.caregiver || {});
  const initialName = currentPatient.name || 'Asha Devi Borah';
  const initialAge = currentPatient.age || 72;
  const initialLocation = currentPatient.location || 'Room 2, Garden Terrace Wing';
  const initialCity = currentPatient.city || 'Guwahati';
  const initialState = currentPatient.state || 'Assam';
  const initialCaregiverName = currentCaregiver.name || 'Riya Borah';
  const initialCaregiverEmail = currentCaregiver.email || 'riya@sahara.care';
  const initialCaregiverPassword = currentCaregiver.password || 'care1234';

  const lang = dataStore.getLanguage() || 'English';
  const t = getTranslation(lang);

  const html = `
    <div class="min-h-screen bg-[#ebffe7] flex items-center justify-center p-3 sm:p-6">
      <main class="w-full max-w-4xl mx-auto py-4">
        
        <!-- Step Header Navigation -->
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <button 
            id="profile-back-btn" 
            class="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d3f8d0] hover:bg-[#cdf2cb] transition-colors text-[#0d631b] font-bold text-sm sm:text-base cursor-pointer" 
            type="button"
          >
            <span class="material-symbols-outlined text-[#0d631b] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span>${t.backToStep2}</span>
          </button>

          <div class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#cdf2cb] text-[#0d631b] text-xs sm:text-sm font-bold shadow-sm">
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">badge</span>
            <span>${t.step3of3}</span>
          </div>
        </div>

        <!-- Main Card: Responsive 2-column on desktop -->
        <div class="card-tactile bg-white rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xl overflow-visible border border-[#cdf2cb]">
          
          <!-- Reassurance Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 mb-6 rounded-2xl bg-[#d9fdd6] border border-[#cdf2cb]">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-[#0d631b] flex items-center justify-center text-white shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">person_pin</span>
              </div>
              <div>
                <h1 class="text-lg sm:text-xl font-extrabold text-[#032109]">${t.personalizeTitle}</h1>
                <p class="text-xs sm:text-sm text-[#40493d]">${t.personalizeSubtitle}</p>
              </div>
            </div>

            <!-- Voice Narration Button -->
            <button 
              class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#98f994] hover:bg-[#7ddc7a] text-[#002204] font-bold text-xs sm:text-sm transition-all shrink-0 shadow-sm cursor-pointer"
              id="profile-read-aloud-btn"
              type="button"
            >
              <span class="material-symbols-outlined text-lg">volume_up</span>
              <span>Suniyé (Listen)</span>
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            <!-- LEFT FORM COLUMN -->
            <form class="lg:col-span-7 flex flex-col gap-4" id="user-details-form" onsubmit="return false;">
              
              <!-- 1. Full Name -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs sm:text-sm font-bold text-[#032109] flex items-center justify-between" for="profile-name-input">
                  <span class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-base text-[#0d631b]">account_circle</span>
                    <span>${t.fullName}</span>
                  </span>
                  <span class="text-[11px] text-[#0d631b] font-semibold">${t.required}</span>
                </label>
                <div class="relative flex items-center w-full rounded-2xl bg-white border-2 border-[#cdf2cb] focus-within:border-[#2e7d32] shadow-sm transition-all">
                  <input 
                    class="w-full h-12 px-4 text-base sm:text-lg font-bold text-[#032109] placeholder:text-gray-400 bg-transparent rounded-2xl outline-none" 
                    id="profile-name-input" 
                    type="text" 
                    placeholder="e.g. Asha Devi Borah" 
                    value="${initialName}"
                    required
                  />
                </div>
                <p class="text-[11px] sm:text-xs text-[#40493d] px-1">
                  ${t.fullNameHelp}
                </p>
              </div>

              <!-- 2. Age with quick steppers -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs sm:text-sm font-bold text-[#032109] flex items-center gap-1.5" for="profile-age-input">
                  <span class="material-symbols-outlined text-base text-[#0d631b]">cake</span>
                  <span>${t.age}</span>
                </label>
                <div class="flex items-center gap-2">
                  <button 
                    type="button" 
                    id="age-minus-btn" 
                    class="w-12 h-12 rounded-2xl bg-[#d3f8d0] hover:bg-[#cdf2cb] text-[#0d631b] font-black text-xl flex items-center justify-center transition-all border border-[#cdf2cb] cursor-pointer"
                    title="Decrease age"
                  >
                    –
                  </button>
                  <div class="flex-1 relative flex items-center rounded-2xl bg-white border-2 border-[#cdf2cb] focus-within:border-[#2e7d32] shadow-sm">
                    <input 
                      class="w-full h-12 text-center text-lg sm:text-xl font-black text-[#032109] bg-transparent outline-none" 
                      id="profile-age-input" 
                      type="number" 
                      min="1" 
                      max="120" 
                      value="${initialAge}"
                    />
                  </div>
                  <button 
                    type="button" 
                    id="age-plus-btn" 
                    class="w-12 h-12 rounded-2xl bg-[#d3f8d0] hover:bg-[#cdf2cb] text-[#0d631b] font-black text-xl flex items-center justify-center transition-all border border-[#cdf2cb] cursor-pointer"
                    title="Increase age"
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- 3. Location / Residence -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs sm:text-sm font-bold text-[#032109] flex items-center gap-1.5" for="profile-location-input">
                  <span class="material-symbols-outlined text-base text-[#0d631b]">cottage</span>
                  <span>${t.location}</span>
                </label>
                <div class="relative flex items-center w-full rounded-2xl bg-white border-2 border-[#cdf2cb] focus-within:border-[#2e7d32] shadow-sm transition-all">
                  <input 
                    class="w-full h-12 px-4 text-sm sm:text-base font-bold text-[#032109] placeholder:text-gray-400 bg-transparent rounded-2xl outline-none" 
                    id="profile-location-input" 
                    type="text" 
                    placeholder="e.g. Room 2, Garden Terrace Wing" 
                    value="${initialLocation}"
                  />
                </div>
              </div>

              <!-- 4. City & State (Scrollable and Selectable Comboboxes) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <!-- City Combobox -->
                <div class="relative flex flex-col gap-1.5" id="city-combobox-wrapper">
                  <label class="text-xs sm:text-sm font-bold text-[#032109] flex items-center justify-between" for="profile-city-input">
                    <span class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-base text-[#0d631b]">location_city</span>
                      <span>${t.city}</span>
                    </span>
                    <span class="text-[10px] text-[#0d631b] font-bold bg-[#d3f8d0] px-2 py-0.5 rounded-full">All Indian Cities</span>
                  </label>
                  <div class="relative flex items-center w-full rounded-2xl bg-white border-2 border-[#cdf2cb] focus-within:border-[#2e7d32] shadow-sm transition-all">
                    <input 
                      class="w-full h-12 pl-4 pr-10 text-sm sm:text-base font-bold text-[#032109] placeholder:text-gray-400 bg-transparent rounded-2xl outline-none" 
                      id="profile-city-input" 
                      type="text" 
                      placeholder="Type or scroll all cities..." 
                      value="${initialCity}"
                      autocomplete="off"
                    />
                    <button 
                      type="button" 
                      id="city-dropdown-toggle-btn" 
                      class="absolute right-2 p-1.5 text-[#0d631b] hover:bg-[#d3f8d0] rounded-xl transition-all cursor-pointer"
                      title="Show all Indian cities"
                    >
                      <span class="material-symbols-outlined text-xl transition-transform" id="city-chevron-icon">expand_more</span>
                    </button>
                  </div>

                  <!-- Scrollable City Suggestions Dropdown Menu -->
                  <div 
                    id="city-suggestions-dropdown" 
                    class="hidden absolute top-[102%] left-0 right-0 z-50 bg-white rounded-2xl shadow-2xl border-2 border-[#cdf2cb] p-2 max-h-64 overflow-y-auto space-y-1"
                  >
                    <!-- Populated dynamically with all cities in India -->
                  </div>
                </div>

                <!-- State Combobox -->
                <div class="relative flex flex-col gap-1.5" id="state-combobox-wrapper">
                  <label class="text-xs sm:text-sm font-bold text-[#032109] flex items-center justify-between" for="profile-state-input">
                    <span class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-base text-[#0d631b]">map</span>
                      <span>${t.state}</span>
                    </span>
                    <span class="text-[10px] text-[#0d631b] font-bold bg-[#d3f8d0] px-2 py-0.5 rounded-full">All 36 States & UTs</span>
                  </label>
                  <div class="relative flex items-center w-full rounded-2xl bg-white border-2 border-[#cdf2cb] focus-within:border-[#2e7d32] shadow-sm transition-all">
                    <input 
                      class="w-full h-12 pl-4 pr-10 text-sm sm:text-base font-bold text-[#032109] placeholder:text-gray-400 bg-transparent rounded-2xl outline-none" 
                      id="profile-state-input" 
                      type="text" 
                      placeholder="Type or scroll all states..." 
                      value="${initialState}"
                      autocomplete="off"
                    />
                    <button 
                      type="button" 
                      id="state-dropdown-toggle-btn" 
                      class="absolute right-2 p-1.5 text-[#0d631b] hover:bg-[#d3f8d0] rounded-xl transition-all cursor-pointer"
                      title="Show all Indian states"
                    >
                      <span class="material-symbols-outlined text-xl transition-transform" id="state-chevron-icon">expand_more</span>
                    </button>
                  </div>

                  <!-- Scrollable State Suggestions Dropdown Menu -->
                  <div 
                    id="state-suggestions-dropdown" 
                    class="hidden absolute top-[102%] left-0 right-0 z-50 bg-white rounded-2xl shadow-2xl border-2 border-[#cdf2cb] p-2 max-h-64 overflow-y-auto space-y-1"
                  >
                    <!-- Populated dynamically with all states in India -->
                  </div>
                </div>
              </div>

              <!-- Quick Horizontal Scrollable City Chips Bar -->
              <div class="flex flex-col gap-1.5 pt-1">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-[#40493d] flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-[#0d631b]">swipe</span>
                    <span>${t.quickSelectCity}</span>
                  </span>
                  <span class="text-[10px] text-[#0d631b] font-bold">${ALL_CITIES.length}+ cities available</span>
                </div>
                <div class="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin" id="quick-city-chips">
                  ${ALL_CITIES.slice(0, 30).map(c => `
                    <button 
                      type="button" 
                      class="city-chip px-3 py-1.5 rounded-full text-xs font-bold shrink-0 bg-[#ebffe7] hover:bg-[#cdf2cb] text-[#0d631b] border border-[#cdf2cb] transition-colors cursor-pointer flex items-center gap-1" 
                      data-city="${c.city}" 
                      data-state="${c.state}"
                    >
                      <span>${c.city}</span>
                      <span class="opacity-60 text-[10px]">(${c.state})</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Family Caregiver Portal Login Setup Section -->
              <div class="mt-4 pt-4 border-t-2 border-[#cdf2cb] space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-8 h-8 rounded-xl bg-[#0d631b] text-white flex items-center justify-center shadow-xs">
                      <span class="material-symbols-outlined text-lg">health_and_safety</span>
                    </span>
                    <div>
                      <h3 class="text-xs sm:text-sm font-extrabold text-[#032109]">Caregiver Portal Login Setup</h3>
                      <p class="text-[11px] text-[#40493d]">Set the email & password your caregiver will use to sign in</p>
                    </div>
                  </div>
                  <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#d9fdd6] text-[#0c7521] border border-[#cdf2cb]">Caregiver Link</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f7fdf6] p-3.5 rounded-2xl border border-[#cdf2cb]">
                  <!-- Caregiver Name -->
                  <div class="space-y-1 sm:col-span-2">
                    <label class="text-xs font-bold text-[#032109] flex items-center justify-between" for="profile-caregiver-name">
                      <span>Caregiver's Name (Daughter / Son / Attendant)</span>
                      <span class="text-[10px] font-semibold text-[#0d631b]">Required</span>
                    </label>
                    <div class="relative flex items-center">
                      <span class="material-symbols-outlined absolute left-3 text-base text-[#0d631b]">family_restroom</span>
                      <input 
                        id="profile-caregiver-name" 
                        type="text" 
                        class="input-tactile w-full h-11 pl-9 pr-3 rounded-xl border border-[#bfcaba] focus:border-[#0d631b] text-xs sm:text-sm font-bold text-[#032109] bg-white" 
                        placeholder="e.g. Riya Borah" 
                        value="${initialCaregiverName}" 
                        required 
                      />
                    </div>
                  </div>

                  <!-- Caregiver Email -->
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-[#032109] flex items-center justify-between" for="profile-caregiver-email">
                      <span>Caregiver Email</span>
                      <span class="text-[10px] font-semibold text-[#0d631b]">Portal Login ID</span>
                    </label>
                    <div class="relative flex items-center">
                      <span class="material-symbols-outlined absolute left-3 text-base text-[#0d631b]">mail</span>
                      <input 
                        id="profile-caregiver-email" 
                        type="email" 
                        class="input-tactile w-full h-11 pl-9 pr-3 rounded-xl border border-[#bfcaba] focus:border-[#0d631b] text-xs sm:text-sm font-bold text-[#032109] bg-white" 
                        placeholder="e.g. riya@sahara.care" 
                        value="${initialCaregiverEmail}" 
                        required 
                      />
                    </div>
                  </div>

                  <!-- Caregiver Password -->
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-[#032109] flex items-center justify-between" for="profile-caregiver-password">
                      <span>Caregiver Password</span>
                      <span class="text-[10px] font-semibold text-[#0d631b]">Security Key</span>
                    </label>
                    <div class="relative flex items-center">
                      <span class="material-symbols-outlined absolute left-3 text-base text-[#0d631b]">lock</span>
                      <input 
                        id="profile-caregiver-password" 
                        type="password" 
                        class="input-tactile w-full h-11 pl-9 pr-10 rounded-xl border border-[#bfcaba] focus:border-[#0d631b] text-xs sm:text-sm font-bold text-[#032109] bg-white" 
                        placeholder="Set password (e.g. care1234)" 
                        value="${initialCaregiverPassword}" 
                        required 
                      />
                      <button 
                        id="toggle-caregiver-password-btn" 
                        type="button" 
                        class="absolute right-2.5 text-gray-500 hover:text-[#0d631b] p-1 cursor-pointer transition-colors"
                        title="Show/hide password"
                      >
                        <span class="material-symbols-outlined text-lg" id="caregiver-password-eye-icon">visibility</span>
                      </button>
                    </div>
                  </div>
                </div>

                <p class="text-[11px] text-[#40493d] bg-[#ebffe7] p-2.5 rounded-xl border border-[#cdf2cb] flex items-center gap-2">
                  <span class="material-symbols-outlined text-base text-[#0d631b] shrink-0">key</span>
                  <span>When your caregiver logs in via the <strong>Caregiver Portal</strong> using this email and password, it will automatically connect to your profile.</span>
                </p>
              </div>

              <!-- Submit Action Button -->
              <div class="pt-3">
                <button 
                  class="btn-tactile btn-primary w-full h-13 sm:h-14 rounded-2xl text-base sm:text-lg font-extrabold flex items-center justify-center gap-2.5 shadow-md group cursor-pointer" 
                  id="profile-submit-btn" 
                  type="button"
                >
                  <span id="profile-submit-text">${t.completeSetup}</span>
                  <span class="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>
            </form>

            <!-- RIGHT LIVE PREVIEW COLUMN -->
            <div class="lg:col-span-5 flex flex-col gap-4 justify-between">
              
              <!-- Real-time Live Preview Card -->
              <div class="bg-[#d9fdd6] rounded-2xl p-5 border border-[#cdf2cb] space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-extrabold text-[#0d631b] uppercase tracking-wider flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-base">visibility</span>
                    <span>${t.liveGreetingPreview}</span>
                  </span>
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-[#0d631b] border border-[#cdf2cb]">
                    ${t.updatesLive}
                  </span>
                </div>

                <!-- Preview Box mimicking Elder Dashboard Greeting -->
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#cdf2cb] space-y-3">
                  <div class="flex items-center gap-3">
                    <img 
                      class="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-[#cdf2cb] bg-white" 
                      src="${currentPatient.avatar || '/avatar.png'}" 
                      alt="Profile Avatar"
                    />
                    <div>
                      <p class="text-[11px] font-bold uppercase text-[#0d631b]">${t.goodMorningGreeting}</p>
                      <h3 class="text-base sm:text-lg font-extrabold text-[#032109] leading-tight" id="live-greeting-title">
                        ${t.goodMorning}, ${initialName.split(' ')[0] ? initialName.split(' ')[0] + ' ji' : initialName} 🌿
                      </h3>
                    </div>
                  </div>

                  <div class="p-2.5 rounded-xl bg-[#ebffe7] border border-[#cdf2cb] text-xs space-y-1">
                    <div class="flex items-center justify-between text-[#40493d]">
                      <span class="font-semibold">${t.previewFullName}</span>
                      <strong class="text-[#032109]" id="live-preview-name">${initialName}</strong>
                    </div>
                    <div class="flex items-center justify-between text-[#40493d]">
                      <span class="font-semibold">${t.previewAge}</span>
                      <strong class="text-[#032109]"><span id="live-preview-age">${initialAge}</span> ${t.previewYears}</strong>
                    </div>
                    <div class="flex items-center justify-between text-[#40493d]">
                      <span class="font-semibold">${t.previewLocation}</span>
                      <strong class="text-[#032109] text-right truncate max-w-[170px]" id="live-preview-location">${initialLocation}</strong>
                    </div>
                    <div class="flex items-center justify-between text-[#40493d]">
                      <span class="font-semibold">${t.previewCityState}</span>
                      <strong class="text-[#032109]" id="live-preview-citystate">${initialCity}, ${initialState}</strong>
                    </div>
                    <div class="pt-1.5 mt-1 border-t border-[#cdf2cb] flex items-center justify-between text-[#40493d]">
                      <span class="font-semibold text-[11px] flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm text-[#0d631b]">health_and_safety</span>
                        Caregiver Login:
                      </span>
                      <strong class="text-[#0d631b] text-right truncate max-w-[150px] text-[11px]" id="live-preview-caregiver">${initialCaregiverName} (${initialCaregiverEmail})</strong>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 text-xs text-[#40493d]">
                  <span class="material-symbols-outlined text-base text-[#0d631b]">verified_user</span>
                  <span>${t.privateEncryptedNote}</span>
                </div>
              </div>

              <!-- Reassuring Bottom Note -->
              <div class="bg-white rounded-2xl p-4 border border-[#cdf2cb] flex items-center gap-3">
                <span class="material-symbols-outlined text-2xl text-[#0d631b]">favorite</span>
                <p class="text-xs text-[#40493d]">
                  ${t.settingsUpdateNotice}
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  `;

  // Attach event handlers
  setTimeout(() => {
    const nameInput = document.getElementById('profile-name-input');
    const ageInput = document.getElementById('profile-age-input');
    const locationInput = document.getElementById('profile-location-input');
    const cityInput = document.getElementById('profile-city-input');
    const stateInput = document.getElementById('profile-state-input');
    const backBtn = document.getElementById('profile-back-btn');
    const submitBtn = document.getElementById('profile-submit-btn');
    const readAloudBtn = document.getElementById('profile-read-aloud-btn');
    const ageMinusBtn = document.getElementById('age-minus-btn');
    const agePlusBtn = document.getElementById('age-plus-btn');

    // Combobox elements
    const cityDropdown = document.getElementById('city-suggestions-dropdown');
    const cityToggleBtn = document.getElementById('city-dropdown-toggle-btn');
    const cityChevron = document.getElementById('city-chevron-icon');

    const stateDropdown = document.getElementById('state-suggestions-dropdown');
    const stateToggleBtn = document.getElementById('state-dropdown-toggle-btn');
    const stateChevron = document.getElementById('state-chevron-icon');

    const quickCityChips = document.querySelectorAll('.city-chip');

    // Live preview elements
    const liveGreetingTitle = document.getElementById('live-greeting-title');
    const livePreviewName = document.getElementById('live-preview-name');
    const livePreviewAge = document.getElementById('live-preview-age');
    const livePreviewLocation = document.getElementById('live-preview-location');
    const livePreviewCityState = document.getElementById('live-preview-citystate');

    function updateLivePreview() {
      const currentName = nameInput?.value.trim() || 'Asha Devi Borah';
      const firstName = currentName.split(' ')[0] || currentName;
      const currentAge = ageInput?.value || '72';
      const currentLocation = locationInput?.value.trim() || 'Room 2, Garden Terrace Wing';
      const currentCity = cityInput?.value.trim() || 'Guwahati';
      const currentState = stateInput?.value.trim() || 'Assam';

      if (liveGreetingTitle) {
        liveGreetingTitle.innerText = `${t.goodMorning}, ${firstName} ji 🌿`;
      }
      if (livePreviewName) livePreviewName.innerText = currentName;
      if (livePreviewAge) livePreviewAge.innerText = currentAge;
      if (livePreviewLocation) livePreviewLocation.innerText = currentLocation;
      if (livePreviewCityState) livePreviewCityState.innerText = `${currentCity}, ${currentState}`;
    }

    // Render City List with ALL options available to scroll
    function renderCityList(filterText = '', forceAll = false) {
      if (!cityDropdown) return;
      const q = forceAll ? '' : filterText.toLowerCase().trim();
      const filtered = q
        ? ALL_CITIES.filter(item => item.city.toLowerCase().includes(q) || item.state.toLowerCase().includes(q))
        : ALL_CITIES;

      const currentCityVal = cityInput?.value.trim().toLowerCase();

      let headerHtml = `
        <div class="px-3 py-1.5 mb-1 bg-[#ebffe7] rounded-xl flex items-center justify-between sticky top-0 z-10 border border-[#cdf2cb]">
          <span class="text-xs font-extrabold text-[#0d631b]">All Cities in India (${filtered.length})</span>
          <span class="text-[10px] text-[#40493d] font-semibold">Scroll to select</span>
        </div>
      `;

      if (filtered.length === 0) {
        cityDropdown.innerHTML = headerHtml + `<div class="p-4 text-xs text-gray-500 text-center font-medium">No matching cities found. You can keep your custom entry "${filterText}".</div>`;
        return;
      }

      const itemsHtml = filtered.map(item => {
        const isSelected = currentCityVal === item.city.toLowerCase();
        return `
          <button 
            type="button" 
            class="city-option-item w-full px-3.5 py-2.5 rounded-xl hover:bg-[#d9fdd6] ${isSelected ? 'bg-[#d9fdd6] border-2 border-[#0d631b]' : 'border border-transparent'} text-left text-xs sm:text-sm font-bold text-[#032109] flex items-center justify-between transition-colors cursor-pointer group"
            data-city="${item.city}"
            data-state="${item.state}"
          >
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base ${isSelected ? 'text-[#0d631b]' : 'text-gray-400 group-hover:text-[#0d631b]'}">pin_drop</span>
              <span class="group-hover:text-[#0d631b]">${item.city}</span>
            </span>
            <span class="text-[11px] font-semibold text-[#40493d] bg-[#ebffe7] px-2.5 py-0.5 rounded-full border border-[#cdf2cb]">${item.state}</span>
          </button>
        `;
      }).join('');

      cityDropdown.innerHTML = headerHtml + itemsHtml;

      cityDropdown.querySelectorAll('.city-option-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const selCity = btn.dataset.city;
          const selState = btn.dataset.state;
          if (cityInput) cityInput.value = selCity;
          if (stateInput && selState) stateInput.value = selState;
          hideCityDropdown();
          updateLivePreview();
        });
      });
    }

    // Render State List with ALL options available to scroll
    function renderStateList(filterText = '', forceAll = false) {
      if (!stateDropdown) return;
      const q = forceAll ? '' : filterText.toLowerCase().trim();
      const filtered = q
        ? ALL_STATES.filter(s => s.toLowerCase().includes(q))
        : ALL_STATES;

      const currentStateVal = stateInput?.value.trim().toLowerCase();

      let headerHtml = `
        <div class="px-3 py-1.5 mb-1 bg-[#ebffe7] rounded-xl flex items-center justify-between sticky top-0 z-10 border border-[#cdf2cb]">
          <span class="text-xs font-extrabold text-[#0d631b]">All States & UTs of India (${filtered.length})</span>
          <span class="text-[10px] text-[#40493d] font-semibold">Scroll to select</span>
        </div>
      `;

      if (filtered.length === 0) {
        stateDropdown.innerHTML = headerHtml + `<div class="p-4 text-xs text-gray-500 text-center font-medium">No matching states found. You can keep your custom entry "${filterText}".</div>`;
        return;
      }

      const itemsHtml = filtered.map(stateName => {
        const isSelected = currentStateVal === stateName.toLowerCase();
        return `
          <button 
            type="button" 
            class="state-option-item w-full px-3.5 py-2.5 rounded-xl hover:bg-[#d9fdd6] ${isSelected ? 'bg-[#d9fdd6] border-2 border-[#0d631b]' : 'border border-transparent'} text-left text-xs sm:text-sm font-bold text-[#032109] flex items-center justify-between transition-colors cursor-pointer group"
            data-state="${stateName}"
          >
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base ${isSelected ? 'text-[#0d631b]' : 'text-gray-400 group-hover:text-[#0d631b]'}">map</span>
              <span class="group-hover:text-[#0d631b]">${stateName}</span>
            </span>
            <span class="material-symbols-outlined text-base ${isSelected ? 'text-[#0d631b]' : 'text-gray-300 opacity-0 group-hover:opacity-100'}">check_circle</span>
          </button>
        `;
      }).join('');

      stateDropdown.innerHTML = headerHtml + itemsHtml;

      stateDropdown.querySelectorAll('.state-option-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const selState = btn.dataset.state;
          if (stateInput) stateInput.value = selState;
          hideStateDropdown();
          updateLivePreview();
        });
      });
    }

    function showCityDropdown(forceAll = true) {
      hideStateDropdown();
      renderCityList(cityInput?.value || '', forceAll);
      cityDropdown?.classList.remove('hidden');
      if (cityChevron) cityChevron.innerText = 'expand_less';

      // Scroll to currently selected city if exists
      const selectedItem = cityDropdown?.querySelector('.city-option-item.bg-\\[\\#d9fdd6\\]');
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }

    function hideCityDropdown() {
      cityDropdown?.classList.add('hidden');
      if (cityChevron) cityChevron.innerText = 'expand_more';
    }

    function showStateDropdown(forceAll = true) {
      hideCityDropdown();
      renderStateList(stateInput?.value || '', forceAll);
      stateDropdown?.classList.remove('hidden');
      if (stateChevron) stateChevron.innerText = 'expand_less';

      // Scroll to currently selected state if exists
      const selectedItem = stateDropdown?.querySelector('.state-option-item.bg-\\[\\#d9fdd6\\]');
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }

    function hideStateDropdown() {
      stateDropdown?.classList.add('hidden');
      if (stateChevron) stateChevron.innerText = 'expand_more';
    }

    // City event handlers: Clicking or focusing shows ALL options
    cityInput?.addEventListener('focus', () => showCityDropdown(true));
    cityInput?.addEventListener('click', () => showCityDropdown(true));
    cityInput?.addEventListener('input', () => {
      renderCityList(cityInput.value, false);
      cityDropdown?.classList.remove('hidden');
      if (cityChevron) cityChevron.innerText = 'expand_less';
      updateLivePreview();
    });
    cityToggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (cityDropdown?.classList.contains('hidden')) {
        showCityDropdown(true);
      } else {
        hideCityDropdown();
      }
    });

    // State event handlers: Clicking or focusing shows ALL options
    stateInput?.addEventListener('focus', () => showStateDropdown(true));
    stateInput?.addEventListener('click', () => showStateDropdown(true));
    stateInput?.addEventListener('input', () => {
      renderStateList(stateInput.value, false);
      stateDropdown?.classList.remove('hidden');
      if (stateChevron) stateChevron.innerText = 'expand_less';
      updateLivePreview();
    });
    stateToggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (stateDropdown?.classList.contains('hidden')) {
        showStateDropdown(true);
      } else {
        hideStateDropdown();
      }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#city-combobox-wrapper')) {
        hideCityDropdown();
      }
      if (!e.target.closest('#state-combobox-wrapper')) {
        hideStateDropdown();
      }
    });

    // Quick horizontal city chips
    quickCityChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (cityInput) cityInput.value = chip.dataset.city;
        if (stateInput && chip.dataset.state) stateInput.value = chip.dataset.state;
        updateLivePreview();
      });
    });

    // Other inputs
    nameInput?.addEventListener('input', updateLivePreview);
    ageInput?.addEventListener('input', updateLivePreview);
    locationInput?.addEventListener('input', updateLivePreview);

    // Age stepper buttons
    ageMinusBtn?.addEventListener('click', () => {
      let currentVal = parseInt(ageInput?.value, 10) || 72;
      if (currentVal > 1) {
        currentVal -= 1;
        if (ageInput) ageInput.value = currentVal;
        updateLivePreview();
      }
    });

    agePlusBtn?.addEventListener('click', () => {
      let currentVal = parseInt(ageInput?.value, 10) || 72;
      if (currentVal < 120) {
        currentVal += 1;
        if (ageInput) ageInput.value = currentVal;
        updateLivePreview();
      }
    });

    // Voice Narration
    readAloudBtn?.addEventListener('click', () => {
      speakText(t.voiceStep3, t.langCode);
      showToast('🔊 Audio guidance: ' + t.voiceStep3, 'info');
    });

    // Back button
    backBtn?.addEventListener('click', () => {
      onNavigate('otp-verify', { phone: params?.phone });
    });

    const caregiverNameInput = document.getElementById('profile-caregiver-name');
    const caregiverEmailInput = document.getElementById('profile-caregiver-email');
    const caregiverPasswordInput = document.getElementById('profile-caregiver-password');
    const togglePasswordBtn = document.getElementById('toggle-caregiver-password-btn');
    const passwordEyeIcon = document.getElementById('caregiver-password-eye-icon');
    const livePreviewCaregiver = document.getElementById('live-preview-caregiver');

    // Toggle password visibility
    togglePasswordBtn?.addEventListener('click', () => {
      if (caregiverPasswordInput) {
        const isPassword = caregiverPasswordInput.type === 'password';
        caregiverPasswordInput.type = isPassword ? 'text' : 'password';
        if (passwordEyeIcon) {
          passwordEyeIcon.innerText = isPassword ? 'visibility_off' : 'visibility';
        }
      }
    });

    caregiverNameInput?.addEventListener('input', () => {
      if (livePreviewCaregiver) {
        const cName = caregiverNameInput.value.trim() || 'Riya Borah';
        const cEmail = caregiverEmailInput?.value.trim() || 'riya@sahara.care';
        livePreviewCaregiver.innerText = `${cName} (${cEmail})`;
      }
    });

    caregiverEmailInput?.addEventListener('input', () => {
      if (livePreviewCaregiver) {
        const cName = caregiverNameInput?.value.trim() || 'Riya Borah';
        const cEmail = caregiverEmailInput.value.trim() || 'riya@sahara.care';
        livePreviewCaregiver.innerText = `${cName} (${cEmail})`;
      }
    });

    // Submit button
    submitBtn?.addEventListener('click', () => {
      const name = nameInput?.value.trim();
      const age = ageInput?.value.trim();
      const location = locationInput?.value.trim();
      const city = cityInput?.value.trim();
      const state = stateInput?.value.trim();
      const caregiverName = caregiverNameInput?.value.trim() || 'Riya Borah';
      const caregiverEmail = caregiverEmailInput?.value.trim() || 'riya@sahara.care';
      const caregiverPassword = caregiverPasswordInput?.value.trim() || 'care1234';

      if (!name) {
        showToast('Please enter your name to complete setup.', 'error');
        nameInput?.focus();
        return;
      }

      if (!caregiverEmail) {
        showToast('Please enter an email for your caregiver portal login.', 'error');
        caregiverEmailInput?.focus();
        return;
      }

      if (!caregiverPassword) {
        showToast('Please set a password for your caregiver portal.', 'error');
        caregiverPasswordInput?.focus();
        return;
      }

      // 1. Update patient in dataStore
      dataStore.updatePatientProfile({
        name,
        age: age ? parseInt(age, 10) : undefined,
        location: location || 'Room 2, Garden Terrace Wing',
        city: city || 'Guwahati',
        state: state || 'Assam',
      });

      // 2. Update caregiver in dataStore
      dataStore.updateCaregiverProfile({
        name: caregiverName,
        email: caregiverEmail,
        password: caregiverPassword,
      });

      // 3. Persist to server database and register caregiver account
      authService.saveElderProfile(
        {
          name,
          age: age ? parseInt(age, 10) : undefined,
          location: location || 'Room 2, Garden Terrace Wing',
          city: city || 'Guwahati',
          state: state || 'Assam',
          phone: params?.phone || '',
          email: params?.email || '',
        },
        {
          name: caregiverName,
          email: caregiverEmail,
          password: caregiverPassword,
        },
        params?.email || params?.phone || ''
      );

      // 4. Update in authService current session (Role: elder)
      authService.updateUserProfile({
        name,
        age: age ? parseInt(age, 10) : undefined,
        location: location || 'Room 2, Garden Terrace Wing',
        city: city || 'Guwahati',
        state: state || 'Assam',
        role: 'elder',
      });

      const honorific = name.split(' ')[0] ? `${name.split(' ')[0]} ji` : name;
      showToast(`Welcome to Sahara, ${honorific}! Your profile and Caregiver link are ready.`, 'success', 5000);

      // Navigate to Elder Dashboard
      onNavigate('elder-dashboard');
    });

    // Focus name input
    nameInput?.focus();
  }, 0);

  return html;
}
