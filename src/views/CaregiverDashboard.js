import { renderNavbar } from '../components/Navbar.js';
import { dataStore } from '../services/dataStore.js';
import { authService } from '../services/authService.js';
import { openAddReminderModal } from './AddReminderModal.js';
import { showToast } from '../utils/toast.js';
import { speakText } from '../utils/speech.js';

export function renderCaregiverDashboard(onNavigate, params = {}) {
  const activeTab = params?.tab || 'overview'; // 'overview' | 'memories' | 'routine' | 'contacts'
  const activeUser = authService.getCurrentUser ? authService.getCurrentUser() : null;

  if (!activeUser || activeUser.role !== 'caregiver') {
    setTimeout(() => onNavigate('caregiver-login'), 0);
    return '<div class="min-h-screen bg-[#ebffe7] flex items-center justify-center p-6"><div class="p-6 bg-white rounded-3xl shadow-md border border-[#cdf2cb] text-sm font-bold text-[#0d631b]">Please sign in with your caregiver account. Redirecting...</div></div>';
  }

  const patient = activeUser?.linkedElder || (dataStore.getPatient ? dataStore.getPatient() : null);

  if (!patient || !patient.name) {
    setTimeout(() => {
      document.getElementById('retry-cg-sync-btn')?.addEventListener('click', async () => {
        showToast('Checking cloud database for linked elder...', 'info');
        const res = await authService.syncCaregiverElderData(activeUser.email);
        if (res?.elderProfile) {
          showToast(`Synchronized with ${res.elderProfile.name}!`, 'success');
          onNavigate('caregiver-dashboard', params);
        } else {
          showToast(`No elder linked to ${activeUser.email} in database.`, 'error');
        }
      });
      document.getElementById('back-cg-login-btn')?.addEventListener('click', () => {
        onNavigate('caregiver-login');
      });
    }, 0);

    return `
      <div class="min-h-screen bg-[#ebffe7] flex items-center justify-center p-6">
        <div class="max-w-md w-full p-8 bg-white rounded-3xl shadow-lg border border-amber-300 text-center space-y-4">
          <div class="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <span class="material-symbols-outlined text-3xl">cloud_sync</span>
          </div>
          <h2 class="text-xl font-extrabold text-[#032109]">Elder Profile Not Synchronized</h2>
          <p class="text-xs text-[#40493d]">
            No elder profile is associated with caregiver "${activeUser?.email || ''}" in the cloud database.
          </p>
          <div class="flex items-center justify-center gap-3 pt-2">
            <button id="retry-cg-sync-btn" class="px-5 py-2.5 rounded-xl bg-[#0d631b] text-white font-bold text-xs shadow-sm cursor-pointer">
              Retry Sync
            </button>
            <button id="back-cg-login-btn" class="px-4 py-2.5 rounded-xl bg-[#ebffe7] text-[#0d631b] border border-[#cdf2cb] font-bold text-xs cursor-pointer">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    `;
  }
  const caregiver = activeUser;
  const medicines = dataStore.state.medicines || [];
  const contacts = dataStore.state.contacts || [];
  const takenCount = medicines.filter(m => m.taken).length;
  const totalMeds = medicines.length;
  const medPercent = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 100;

  // Memory match card pool
  const cardPool = [
    {
      pairId: 'chai',
      title: 'Assam Chai ☕',
      subtitle: 'Warm Morning Tea',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfb2Ilw0SLdOuUlOFLSzgAfBI-Gfu3AZuBqTInkesBiLBm6G2Be1pJ4TK9BY-Kh7Fs4oRCnQU5npntF9UZSiZKSoSrOkBgfIuaC67UF1QmjicWtikoUoag5AARfFvVxlZUBcNh0Usr1iI-fdom5Yok0COkHQwTVc4WLzYwOLywZ1ShZieBFZqd8vQOyjvOAqMJQotxgHn3DzFeSXIVXEaodQMgfHV_QNfPHER-HdxfMZdEicRJiGfmFA',
      icon: 'local_cafe',
    },
    {
      pairId: 'tea_leaf',
      title: 'Tea Garden 🌿',
      subtitle: 'Fresh Green Leaves',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDauqRUl7YpuJSBa4kuyqJidfQJRaCYT-3Oo4ZsHNJ-in8bGK4pPiMMwFwYXfcbFm8bjhHjTdbTvCJCXeBeip_UP8N5E3SY6mspaZ_RJ96mymlOszjhLt6jkZv4bdFun-_i-V8jOzhenh_NupZeRE9_b7FTmWMFA7LGfVW5mICyVvp8a9Yl8jyP7w4U6gL2IiKQJrqw79kBvqVVgteQ_5Z_bsLTMPu9-kKoaukZGOL7wLaXdCvZ_8WK5Q',
      icon: 'potted_plant',
    },
    {
      pairId: 'cat',
      title: 'Gentle Cat 🐱',
      subtitle: 'Soft Sunlit Nap',
      img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80',
      icon: 'pets',
    },
  ];

  const gameCards = [
    { id: 0, ...cardPool[0], matched: true, flipped: true },
    { id: 1, ...cardPool[1], matched: false, flipped: false },
    { id: 2, ...cardPool[2], matched: false, flipped: false },
    { id: 3, ...cardPool[1], matched: false, flipped: false },
    { id: 4, ...cardPool[2], matched: false, flipped: false },
    { id: 5, ...cardPool[0], matched: true, flipped: true },
  ];

  // Helper for active link styles
  const getSidebarLinkClass = (tabName) => {
    const isActive = activeTab === tabName;
    return isActive
      ? 'sidebar-link active flex items-center px-4 py-3 rounded-2xl bg-[#006e1c] text-white font-bold gap-3 shadow-md transition-all'
      : 'sidebar-link flex items-center px-4 py-3 rounded-2xl text-[#40493d] hover:bg-[#cdf2cb] hover:text-[#032109] font-semibold gap-3 transition-colors';
  };

  const getMobileTabClass = (tabName) => {
    const isActive = activeTab === tabName;
    return isActive
      ? 'flex flex-col items-center py-2 px-3 rounded-xl bg-[#006e1c] text-white font-bold text-xs shadow-sm'
      : 'flex flex-col items-center py-2 px-3 rounded-xl text-[#40493d] hover:bg-[#cdf2cb] font-semibold text-xs transition-colors';
  };

  const html = `
    <div class="min-h-screen bg-[#ebffe7] text-[#032109] flex flex-col">
      ${renderNavbar('caregiver-dashboard', onNavigate)}

      <!-- Mobile Sub-Navigation Bar (always visible on small screens so navigation is never lost) -->
      <div class="lg:hidden fixed top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#cdf2cb] px-2 py-1.5 shadow-sm">
        <div class="flex items-center justify-around max-w-lg mx-auto">
          <button type="button" class="${getMobileTabClass('overview')}" id="mob-tab-overview">
            <span class="material-symbols-outlined text-xl">space_dashboard</span>
            <span>Overview</span>
          </button>
          <button type="button" class="${getMobileTabClass('memories')}" id="mob-tab-memories">
            <span class="material-symbols-outlined text-xl">leaderboard</span>
            <span>Game Score</span>
          </button>
          <button type="button" class="${getMobileTabClass('routine')}" id="mob-tab-routine">
            <span class="material-symbols-outlined text-xl">schedule</span>
            <span>Routine</span>
          </button>
          <button type="button" class="${getMobileTabClass('contacts')}" id="mob-tab-contacts">
            <span class="material-symbols-outlined text-xl">contact_phone</span>
            <span>SOS & Family</span>
          </button>
        </div>
      </div>

      <div class="flex-1 flex pt-20 lg:pt-20">
        <!-- Persistent Left Sidebar (Visible on desktop/tablets) -->
        <aside class="hidden lg:flex w-72 bg-[#d9fdd6] flex-col pt-6 pb-8 px-4 border-r border-[#cdf2cb] shadow-sm shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <!-- Active Patient Card -->
          <div class="mb-6 p-3.5 bg-white rounded-2xl shadow-sm border border-[#cdf2cb]">
            <div class="flex items-center gap-3">
              <div class="relative shrink-0">
                <img 
                  alt="${patient.name || 'Patient'} portrait" 
                  class="w-11 h-11 rounded-xl object-cover border border-[#cdf2cb]" 
                  src="${patient.avatar || '/avatar.png'}"
                />
                <span class="w-3 h-3 rounded-full bg-[#006e1c] absolute -bottom-0.5 -right-0.5 border-2 border-white"></span>
              </div>
              <div class="overflow-hidden">
                <p class="text-sm font-bold text-[#032109] truncate">${patient.name || 'Sahara Member'}</p>
                <p class="text-[11px] text-[#40493d] truncate">${patient.status || patient.problemStatement || 'Mild Cognitive Support Mode'}</p>
              </div>
            </div>
            <div class="mt-2.5 pt-2 border-t border-[#ebffe7] flex items-center justify-between text-[11px] text-[#40493d]">
              <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#006e1c]"></span>Live Connected</span>
              <span class="font-bold text-[#0d631b]">${patient.city || 'Kolkata'}</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="flex flex-col gap-2">
            <button type="button" class="${getSidebarLinkClass('overview')}" id="side-overview">
              <span class="material-symbols-outlined text-2xl">space_dashboard</span>
              <span>Caregiver Overview</span>
            </button>
            <button type="button" class="${getSidebarLinkClass('memories')}" id="side-memories">
              <span class="material-symbols-outlined text-2xl">leaderboard</span>
              <span>Patient Game Score</span>
            </button>
            <button type="button" class="${getSidebarLinkClass('routine')}" id="side-reminders">
              <span class="material-symbols-outlined text-2xl">schedule</span>
              <span>Daily Rhythm & Routine</span>
            </button>
            <button type="button" class="${getSidebarLinkClass('contacts')}" id="side-contacts">
              <span class="material-symbols-outlined text-2xl">contact_phone</span>
              <span>Doctor & Family SOS</span>
            </button>
          </nav>
        </aside>

        <!-- Main Content Area (renders active tab without losing the sidebar) -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-[80rem] mx-auto w-full pb-28 pt-12 lg:pt-6">
          
          <!-- TAB 1: OVERVIEW -->
          ${activeTab === 'overview' ? `
            <!-- Top Greeting & Caregiver Context -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="w-2.5 h-2.5 rounded-full bg-[#006e1c] animate-pulse"></span>
                  <span class="text-xs font-bold text-[#0d631b] uppercase tracking-wider">Live Synchronized Caregiver Portal</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-[#032109]">Hello, ${caregiver.name ? caregiver.name.split(' ')[0] : 'Caregiver'}</h1>
                <p class="text-sm text-[#40493d]">Here is ${patient.honorific || patient.name}'s day at a glance · ${patient.city || 'Kolkata'}, ${patient.state || 'West Bengal'}</p>
              </div>

              <div class="flex items-center gap-3 flex-wrap">
                <button 
                  class="btn-tactile btn-primary flex items-center gap-2 h-11 px-5 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer" 
                  id="caregiver-add-reminder-btn" 
                  type="button"
                >
                  <span class="material-symbols-outlined text-xl">add_alarm</span>
                  <span>Add Reminder</span>
                </button>
              </div>
            </div>

            <!-- Primary Patient Summary Card -->
            <div class="card-tactile w-full bg-white rounded-3xl p-6 sm:p-8 shadow-md mb-6 relative overflow-hidden border border-[#cdf2cb]">
              <div class="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#d9fdd6]/60 pointer-events-none blur-2xl"></div>

              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div class="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
                  <div class="relative shrink-0">
                    <img 
                      alt="${patient.name || 'Patient'} portrait" 
                      class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-sm border border-[#cdf2cb] bg-white" 
                      src="${patient.avatar || '/avatar.png'}"
                    />
                    <div class="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                      <span class="material-symbols-outlined text-[#0d631b] text-xl">verified</span>
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                      <h2 class="text-xl sm:text-2xl font-extrabold text-[#032109]">${patient.name}</h2>
                      <span class="px-2.5 py-0.5 rounded-full bg-[#d3f8d0] text-[#40493d] text-xs font-bold">${patient.age} years</span>
                      <span class="px-3 py-1 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs font-bold flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-[#006e1c] animate-pulse"></span>
                        Active today · Last active ${patient.lastActive}
                      </span>
                    </div>
                    <p class="text-xs sm:text-sm text-[#40493d] mb-2">${patient.status || patient.problemStatement || 'Mild Cognitive Support Mode'} · ${patient.wing || patient.location || 'Garden Terrace Wing'}</p>
                    <div class="flex items-center gap-3 text-[#40493d] text-xs font-semibold flex-wrap">
                      <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[#0d631b] text-base">wifi_tethering</span>Device Connected</span>
                      <span>•</span>
                      <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[#724f00] text-base">home_pin</span>${patient.location || `${patient.city || 'Kolkata'}, ${patient.state || 'West Bengal'}`}</span>
                    </div>
                  </div>
                </div>

                <!-- Quick Action Buttons -->
                <div class="flex flex-wrap items-center gap-2 shrink-0">
                  <button 
                    class="btn-tactile btn-primary flex items-center gap-2 h-11 px-4 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer" 
                    id="caregiver-call-asha-btn" 
                    type="button"
                  >
                    <span class="material-symbols-outlined text-xl">call</span>
                    <span>Call ${patient.honorific || patient.name}</span>
                  </button>
                  <button 
                    class="btn-tactile btn-secondary flex items-center gap-2 h-11 px-4 rounded-full text-xs sm:text-sm font-bold bg-[#d3f8d0] text-[#032109] cursor-pointer" 
                    id="caregiver-open-memories-btn" 
                    type="button"
                  >
                    <span class="material-symbols-outlined text-xl">photo_library</span>
                    <span>Memories Deck</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Daily Status Metrics Grid (3 cards) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <!-- Card 1: Medicines -->
              <div class="card-tactile bg-white rounded-2xl p-5 shadow-sm border border-[#cdf2cb] flex flex-col justify-between cursor-pointer hover:border-[#006e1c] transition-colors" id="metric-meds-card">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="w-10 h-10 rounded-full bg-[#d9fdd6] flex items-center justify-center text-[#0d631b]">
                      <span class="material-symbols-outlined text-2xl">medication</span>
                    </span>
                    <span class="text-sm font-bold text-[#032109]">Medicines</span>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-extrabold text-[#0d631b]">${takenCount}/${totalMeds}</span>
                    <span class="text-xs text-[#40493d] block">Taken</span>
                  </div>
                </div>
                <div class="w-full bg-[#d3f8d0] h-2.5 rounded-full overflow-hidden">
                  <div class="bg-[#0d631b] h-full rounded-full transition-all duration-500" style="width: ${medPercent}%;"></div>
                </div>
                <span class="text-xs text-[#40493d] mt-2">${medicines.find(m => !m.taken) ? 'Next: ' + medicines.find(m => !m.taken).scheduledTime : 'All medicines completed for today'}</span>
              </div>

              <!-- Card 2: Cognitive Games -->
              <div class="card-tactile bg-white rounded-2xl p-5 shadow-sm border border-[#cdf2cb] flex flex-col justify-between cursor-pointer hover:border-[#006e1c] transition-colors" id="metric-memories-card">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="w-10 h-10 rounded-full bg-[#98f994] flex items-center justify-center text-[#0c7521]">
                      <span class="material-symbols-outlined text-2xl">psychology</span>
                    </span>
                    <span class="text-sm font-bold text-[#032109]">Mind Games</span>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs font-bold">Today</span>
                </div>
                <p class="text-2xl font-extrabold text-[#032109]">${dataStore.state.gamesPlayedCount || 1} Sessions</p>
                <span class="text-xs text-[#40493d] mt-1">Familiar Treasures matched</span>
              </div>

              <!-- Card 3: Mood & Comfort -->
              <div class="card-tactile bg-white rounded-2xl p-5 shadow-sm border border-[#cdf2cb] flex flex-col justify-between">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="w-10 h-10 rounded-full bg-[#ffdeaa] flex items-center justify-center text-[#724f00]">
                      <span class="material-symbols-outlined text-2xl">mood</span>
                    </span>
                    <span class="text-sm font-bold text-[#032109]">Mood & Comfort</span>
                  </div>
                  <span class="material-symbols-outlined text-emerald-600 text-xl">favorite</span>
                </div>
                <p class="text-lg font-extrabold text-[#032109]">${dataStore.state.moodRating || 'Very Calm & Cheerful'}</p>
                <span class="text-xs text-[#40493d] mt-1">Positive response to morning chai</span>
              </div>
            </div>

            <!-- Medication Rhythm & Care Team -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Left 2 Cols: Today's Medication Schedule -->
              <div class="lg:col-span-2 card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-xl font-extrabold text-[#032109]">Medication Schedule & Vitals</h3>
                    <p class="text-xs sm:text-sm text-[#40493d]">Real-time synchronization with smart pillbox and elder tablet</p>
                  </div>
                  <button class="text-xs font-bold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer" id="caregiver-manage-meds-btn">
                    <span class="material-symbols-outlined text-base">edit</span> Open Schedule
                  </button>
                </div>

                <div class="space-y-3 pt-2">
                  ${medicines.map(med => `
                    <div class="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${med.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-[#ffdad6] text-[#93000a]'} flex items-center justify-center font-bold">
                          <span class="material-symbols-outlined">${med.taken ? 'check' : 'medication'}</span>
                        </div>
                        <div>
                          <p class="text-sm sm:text-base font-bold text-[#032109]">${med.title}</p>
                          <p class="text-xs text-[#40493d]">${med.detail} • ${med.scheduledTime}</p>
                        </div>
                      </div>
                      <span class="px-3 py-1 rounded-full text-xs font-bold ${med.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-amber-100 text-amber-900'}">
                        ${med.taken ? 'Completed (' + (med.takenAt || 'Taken') + ')' : 'Pending Due'}
                      </span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Right Col: Guwahati Care Team & Emergency Dispatch -->
              <div class="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4 flex flex-col justify-between">
                <div>
                  <h3 class="text-xl font-extrabold text-[#032109]">${patient.city || 'Local'} Care Team</h3>
                  <p class="text-xs sm:text-sm text-[#40493d] mb-4">Direct hotlines on standby</p>

                  <div class="space-y-3">
                    ${contacts.slice(0, 2).map(c => `
                      <div class="flex items-center justify-between p-3 rounded-xl bg-[#d9fdd6]">
                        <div>
                          <p class="text-sm font-bold text-[#032109]">${c.name} ${c.relation ? `(${c.relation})` : ''}</p>
                          <p class="text-xs text-[#40493d]">${c.phone || c.location || 'Direct Line'}</p>
                        </div>
                        <a href="tel:${c.phone || '108'}" class="p-2 bg-white text-[#0d631b] rounded-full shadow-sm hover:bg-[#ebffe7]">
                          <span class="material-symbols-outlined text-lg">call</span>
                        </a>
                      </div>
                    `).join('')}

                    <div class="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
                      <div>
                        <p class="text-sm font-bold text-red-900">${patient.city || 'Local'} 108 Ambulance</p>
                        <p class="text-xs text-red-700">Emergency Medical Service</p>
                      </div>
                      <a href="tel:108" class="p-2 bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700">
                        <span class="material-symbols-outlined text-lg">emergency</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div class="pt-4 border-t border-[#cdf2cb]">
                  <button 
                    class="btn-tactile btn-primary w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer" 
                    id="caregiver-contacts-page-btn" 
                    type="button"
                  >
                    <span class="material-symbols-outlined text-lg">family_restroom</span>
                    <span>View All Loved Ones & Contacts</span>
                  </button>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- TAB 2: PATIENT GAME SCORE & ANALYTICS -->
          ${activeTab === 'memories' ? `
            <div class="space-y-6">
              <!-- Memories Header Banner -->
              <div class="card-tactile bg-[#d9fdd6] rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#0d631b] mb-3 shadow-sm border border-[#cdf2cb]">
                    <span class="material-symbols-outlined text-lg">leaderboard</span>
                    <span class="text-xs font-bold uppercase tracking-wide">Patient Game Score & Cognitive Analytics</span>
                  </div>
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    ${patient.name ? patient.name.split(' ')[0] : 'Patient'}'s Cognitive Game Scores
                  </h1>
                  <p class="text-sm sm:text-base text-[#40493d] max-w-2xl mt-1">
                    Daily and weekly memory game scores, pattern recognition recall, and cognitive stability tracking.
                  </p>
                </div>

                <div class="flex items-center gap-3 shrink-0 flex-wrap">
                  <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#cdf2cb] shadow-sm">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#006e1c] animate-pulse"></span>
                    <span class="text-xs font-bold text-[#0d631b]">Live Database Synced</span>
                  </div>
                </div>
              </div>

              <!-- 4 KPI Stat Cards -->
              ${(() => {
                const ga = dataStore.getGameAnalytics ? dataStore.getGameAnalytics() : { todayScore: 0, weeklyScore: 0, todaySessions: 0, avgAccuracy: 0, cognitiveStability: 'Awaiting First Game', last7Days: [] };
                const hasScores = (ga.recentScores && ga.recentScores.length > 0) || (ga.weeklyScore > 0) || (ga.todayScore > 0);
                return `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="card-tactile bg-white p-5 rounded-2xl border border-[#cdf2cb] shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="w-10 h-10 rounded-xl bg-[#d9fdd6] text-[#0d631b] flex items-center justify-center font-bold">
                          <span class="material-symbols-outlined text-2xl">today</span>
                        </span>
                        <span class="text-xs font-bold text-[#40493d]">Today's Score</span>
                      </div>
                      <span class="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#cdf2cb] text-[#006e1c]">
                        ${ga.todaySessions || 0} Sessions
                      </span>
                    </div>
                    <div>
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-3xl font-extrabold text-[#032109]">${ga.todayScore || 0}</span>
                        <span class="text-sm font-bold text-[#0d631b]">pts</span>
                      </div>
                      <p class="text-xs text-[#40493d] mt-1">Earned in today's memory matches</p>
                    </div>
                  </div>

                  <div class="card-tactile bg-white p-5 rounded-2xl border border-[#cdf2cb] shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="w-10 h-10 rounded-xl bg-[#cdf2cb] text-[#006e1c] flex items-center justify-center font-bold">
                          <span class="material-symbols-outlined text-2xl">date_range</span>
                        </span>
                        <span class="text-xs font-bold text-[#40493d]">Weekly Total</span>
                      </div>
                      <span class="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        7-Day Total
                      </span>
                    </div>
                    <div>
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-3xl font-extrabold text-[#032109]">${ga.weeklyScore || 0}</span>
                        <span class="text-sm font-bold text-[#0d631b]">pts</span>
                      </div>
                      <p class="text-xs text-[#40493d] mt-1">Rolling 7-day cumulative points</p>
                    </div>
                  </div>

                  <div class="card-tactile bg-white p-5 rounded-2xl border border-[#cdf2cb] shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="w-10 h-10 rounded-xl bg-[#ffdeaa] text-[#724f00] flex items-center justify-center font-bold">
                          <span class="material-symbols-outlined text-2xl">psychology</span>
                        </span>
                        <span class="text-xs font-bold text-[#40493d]">Cognitive Stability</span>
                      </div>
                      <span class="material-symbols-outlined text-emerald-600 text-lg">verified</span>
                    </div>
                    <div>
                      <span class="text-lg font-extrabold text-[#032109] block leading-tight">
                        ${ga.cognitiveStability || 'Awaiting First Game'}
                      </span>
                      <p class="text-xs text-[#40493d] mt-1">Pattern retention & stability</p>
                    </div>
                  </div>

                  <div class="card-tactile bg-white p-5 rounded-2xl border border-[#cdf2cb] shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                          <span class="material-symbols-outlined text-2xl">query_stats</span>
                        </span>
                        <span class="text-xs font-bold text-[#40493d]">Accuracy</span>
                      </div>
                      <span class="text-xs font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                        ${hasScores ? 'Active' : 'Awaiting'}
                      </span>
                    </div>
                    <div>
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-3xl font-extrabold text-[#032109]">${ga.avgAccuracy || 0}%</span>
                      </div>
                      <p class="text-xs text-[#40493d] mt-1">Average familiar cards precision</p>
                    </div>
                  </div>
                </div>

                <!-- 7-Day Performance Chart & Logs -->
                <div class="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-6 mt-6">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-2xl text-[#0d631b]">bar_chart</span>
                      <div>
                        <h2 class="text-xl font-extrabold text-[#032109]">7-Day Cognitive Performance Analytics</h2>
                        <p class="text-xs sm:text-sm text-[#40493d]">Daily scores tracking cognitive engagement and consistency.</p>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-7 gap-2 sm:gap-4 items-end min-h-[200px] bg-[#ebffe7] p-4 sm:p-6 rounded-2xl border border-[#cdf2cb]">
                    ${(ga.last7Days && ga.last7Days.length > 0 ? ga.last7Days : []).map((d, i) => {
                      const score = d.score || 0;
                      const heightPercent = score > 0 ? Math.max(16, Math.min(100, Math.round((score / 350) * 100))) : 8;
                      const isToday = d.isToday || i === 6 || d.day === 'Today';
                      return `
                      <div class="flex flex-col items-center gap-2 h-full justify-end">
                        <span class="text-[10px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded-md ${isToday && score > 0 ? 'bg-[#006e1c] text-white shadow-sm' : score > 0 ? 'bg-white text-[#0d631b] border border-[#cdf2cb]' : 'text-gray-400'}">${score}p</span>
                        <div class="w-full max-w-[48px] bg-white rounded-t-xl overflow-hidden flex flex-col justify-end p-0.5 h-32 border border-[#cdf2cb]">
                          <div style="height: ${heightPercent}%;" class="w-full rounded-t-lg ${score >= 260 ? 'bg-gradient-to-t from-[#0d631b] to-[#43a047]' : score > 0 ? 'bg-gradient-to-t from-[#81c784] to-[#a3f69c]' : 'bg-emerald-50/50'}"></div>
                        </div>
                        <span class="text-xs font-bold ${isToday ? 'text-[#006e1c]' : 'text-[#032109]'}">${d.day}</span>
                      </div>
                    `}).join('')}
                  </div>
                </div>
                `;
              })()}

              <!-- Curated Family Memories Album -->
              <div class="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 class="text-xl font-extrabold text-[#032109]">${patient.name ? patient.name.split(' ')[0] : 'Elder'}'s Memory Anchor Album</h3>
                    <p class="text-xs sm:text-sm text-[#40493d]">Personal photographs tied to voice narrations that help evoke comfort and orientation.</p>
                  </div>
                  <button class="btn-tactile btn-primary px-4 py-2 rounded-full text-xs font-bold cursor-pointer" id="cg-album-add-btn">
                    <span class="material-symbols-outlined text-sm mr-1">cloud_upload</span> Upload Story
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div class="p-3.5 bg-[#ebffe7] rounded-2xl border border-[#cdf2cb] flex items-center gap-3">
                    <img class="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#cdf2cb]" src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200&auto=format&fit=crop" alt="Cat memory" />
                    <div>
                      <h4 class="text-sm font-bold text-[#032109]">Gentle Cat "Mimi"</h4>
                      <p class="text-xs text-[#40493d]">Sunlit veranda nap in Dispur</p>
                      <span class="text-[11px] font-bold text-[#0d631b] flex items-center gap-1 mt-1"><span class="material-symbols-outlined text-sm">record_voice_over</span>Voice audio linked</span>
                    </div>
                  </div>

                  <div class="p-3.5 bg-[#ebffe7] rounded-2xl border border-[#cdf2cb] flex items-center gap-3">
                    <img class="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#cdf2cb]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDauqRUl7YpuJSBa4kuyqJidfQJRaCYT-3Oo4ZsHNJ-in8bGK4pPiMMwFwYXfcbFm8bjhHjTdbTvCJCXeBeip_UP8N5E3SY6mspaZ_RJ96mymlOszjhLt6jkZv4bdFun-_i-V8jOzhenh_NupZeRE9_b7FTmWMFA7LGfVW5mICyVvp8a9Yl8jyP7w4U6gL2IiKQJrqw79kBvqVVgteQ_5Z_bsLTMPu9-kKoaukZGOL7wLaXdCvZ_8WK5Q" alt="Tea garden" />
                    <div>
                      <h4 class="text-sm font-bold text-[#032109]">Jorhat Tea Estate</h4>
                      <p class="text-xs text-[#40493d]">Childhood vacations 1968</p>
                      <span class="text-[11px] font-bold text-[#0d631b] flex items-center gap-1 mt-1"><span class="material-symbols-outlined text-sm">record_voice_over</span>Assamese story linked</span>
                    </div>
                  </div>

                  <div class="p-3.5 bg-[#ebffe7] rounded-2xl border border-[#cdf2cb] flex items-center gap-3">
                    <img class="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#cdf2cb]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfb2Ilw0SLdOuUlOFLSzgAfBI-Gfu3AZuBqTInkesBiLBm6G2Be1pJ4TK9BY-Kh7Fs4oRCnQU5npntF9UZSiZKSoSrOkBgfIuaC67UF1QmjicWtikoUoag5AARfFvVxlZUBcNh0Usr1iI-fdom5Yok0COkHQwTVc4WLzYwOLywZ1ShZieBFZqd8vQOyjvOAqMJQotxgHn3DzFeSXIVXEaodQMgfHV_QNfPHER-HdxfMZdEicRJiGfmFA" alt="Chai" />
                    <div>
                      <h4 class="text-sm font-bold text-[#032109]">Morning Assam Chai</h4>
                      <p class="text-xs text-[#40493d]">Traditional earthen bhar cup</p>
                      <span class="text-[11px] font-bold text-[#0d631b] flex items-center gap-1 mt-1"><span class="material-symbols-outlined text-sm">check_circle</span>Active memory trigger</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- TAB 3: DAILY RHYTHM & ROUTINE -->
          ${activeTab === 'routine' ? `
            <div class="space-y-6">
              <!-- Routine Header Banner -->
              <div class="card-tactile bg-[#d9fdd6] rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#0d631b] mb-3 shadow-sm border border-[#cdf2cb]">
                    <span class="material-symbols-outlined text-lg">schedule</span>
                    <span class="text-xs font-bold uppercase tracking-wide">Daily Rhythm & Routine Schedule</span>
                  </div>
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    Medication & Daily Care Timeline
                  </h1>
                  <p class="text-sm sm:text-base text-[#40493d] max-w-2xl mt-1">
                    Manage smart reminders, sync with pillbox sensors, and adjust dosage alerts for ${patient.name || 'Elder'}.
                  </p>
                </div>

                <div class="flex items-center gap-3 shrink-0 flex-wrap">
                  <button 
                    class="btn-tactile btn-primary flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                    id="routine-add-reminder-btn"
                    type="button"
                  >
                    <span class="material-symbols-outlined text-lg">add_alarm</span>
                    <span>Add New Reminder</span>
                  </button>
                </div>
              </div>

              <!-- Daily Completion Status Card -->
              <div class="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb]">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 class="text-xl font-extrabold text-[#032109]">Today's Adherence Rate</h3>
                    <p class="text-xs sm:text-sm text-[#40493d]">${takenCount} of ${totalMeds} doses logged as taken</p>
                  </div>
                  <span class="text-2xl font-extrabold text-[#006e1c]">${medPercent}%</span>
                </div>
                <div class="w-full bg-[#d3f8d0] h-3 rounded-full overflow-hidden">
                  <div class="bg-[#006e1c] h-full rounded-full transition-all duration-500" style="width: ${medPercent}%;"></div>
                </div>
              </div>

              <!-- Complete Medicines List -->
              <div class="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-extrabold text-[#032109]">Full Medication Schedule</h3>
                  <span class="text-xs font-bold text-[#40493d] flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Smart Pillbox Connected
                  </span>
                </div>

                <div class="space-y-3 pt-2">
                  ${medicines.map((med, idx) => `
                    <div class="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl ${med.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-[#ffdad6] text-[#93000a]'} flex items-center justify-center font-bold text-lg shrink-0">
                          <span class="material-symbols-outlined">${med.taken ? 'check' : 'medication'}</span>
                        </div>
                        <div>
                          <p class="text-base font-bold text-[#032109]">${med.title}</p>
                          <p class="text-xs sm:text-sm text-[#40493d]">${med.detail} • Scheduled: <span class="font-bold text-[#032109]">${med.scheduledTime}</span></p>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 self-end sm:self-center">
                        <button 
                          class="toggle-med-btn px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${med.taken ? 'bg-[#d9fdd6] text-[#0c7521] hover:bg-[#cdf2cb]' : 'bg-[#006e1c] text-white hover:bg-[#0d631b]'}"
                          data-id="${med.id || idx}"
                          type="button"
                        >
                          ${med.taken ? '✓ Taken (' + (med.takenAt || 'Logged') + ')' : 'Mark as Taken'}
                        </button>
                        <button
                          class="delete-med-btn p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                          data-id="${med.id || idx}"
                          title="Delete Reminder"
                          type="button"
                        >
                          <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Daily Rhythm Milestones (Morning, Afternoon, Evening, Night) -->
              <div class="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                <h3 class="text-xl font-extrabold text-[#032109]">Daily Activity Rhythm</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div class="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb]">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-bold text-[#0d631b] uppercase">Morning · 8:00 AM</span>
                      <span class="material-symbols-outlined text-[#0d631b]">wb_sunny</span>
                    </div>
                    <p class="text-sm font-bold text-[#032109]">Warm Assam Chai & Donepezil</p>
                    <p class="text-xs text-[#40493d] mt-1">Veranda garden walk & gentle music</p>
                  </div>

                  <div class="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb]">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-bold text-[#0d631b] uppercase">Noon · 1:00 PM</span>
                      <span class="material-symbols-outlined text-[#0d631b]">restaurant</span>
                    </div>
                    <p class="text-sm font-bold text-[#032109]">Lunch & Hydration Check</p>
                    <p class="text-xs text-[#40493d] mt-1">Light dal, rice & tender greens</p>
                  </div>

                  <div class="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb]">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-bold text-[#0d631b] uppercase">Evening · 5:30 PM</span>
                      <span class="material-symbols-outlined text-[#0d631b]">psychology</span>
                    </div>
                    <p class="text-sm font-bold text-[#032109]">Memory Match & Audio Memos</p>
                    <p class="text-xs text-[#40493d] mt-1">Familiar treasures on tablet</p>
                  </div>

                  <div class="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb]">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-bold text-[#0d631b] uppercase">Night · 9:00 PM</span>
                      <span class="material-symbols-outlined text-[#0d631b]">bedtime</span>
                    </div>
                    <p class="text-sm font-bold text-[#032109]">Night Calming & Bedtime</p>
                    <p class="text-xs text-[#40493d] mt-1">Warm water & dim night light</p>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- TAB 4: DOCTOR & FAMILY SOS -->
          ${activeTab === 'contacts' ? `
            <div class="space-y-6">
              <!-- SOS Header Banner -->
              <div class="card-tactile bg-[#d9fdd6] rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#0d631b] mb-3 shadow-sm border border-[#cdf2cb]">
                    <span class="material-symbols-outlined text-lg">contact_phone</span>
                    <span class="text-xs font-bold uppercase tracking-wide">Doctor & Family SOS Care Network</span>
                  </div>
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-[#032109]">
                    Emergency Contacts & Loved Ones
                  </h1>
                  <p class="text-sm sm:text-base text-[#40493d] max-w-2xl mt-1">
                    Direct access to primary doctors, family members, and immediate ambulance dispatch in ${patient.city || 'your area'}.
                  </p>
                </div>

                <div class="flex items-center gap-3 shrink-0 flex-wrap">
                  <button 
                    class="btn-tactile btn-primary flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md cursor-pointer" 
                    id="contacts-broadcast-all-btn" 
                    type="button"
                  >
                    <span class="material-symbols-outlined text-lg">volunteer_activism</span>
                    <span>Send "${patient.name ? patient.name.split(' ')[0] : 'Elder'} is Safe" to Everyone</span>
                  </button>
                </div>
              </div>

              <!-- Emergency Contacts & Family Grid or Empty State -->
              ${(!contacts || contacts.length === 0) ? `
                <div class="card-tactile bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-md border border-[#cdf2cb] space-y-4">
                  <div class="w-20 h-20 rounded-3xl bg-[#d9fdd6] text-[#0d631b] flex items-center justify-center mx-auto text-3xl font-extrabold shadow-sm">
                    <span class="material-symbols-outlined text-4xl">contacts_product</span>
                  </div>
                  <h3 class="text-2xl font-extrabold text-[#032109]">No Loved Ones or Emergency Contacts Added Yet</h3>
                  <p class="text-sm text-[#40493d]">
                    Customize your contact list with family members, primary caregivers, and doctors. All contacts are safely stored in your account.
                  </p>
                </div>
              ` : `
                <div class="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] space-y-4">
                  <h3 class="text-xl font-extrabold text-[#032109]">All Linked Family Members & Caregivers (${contacts.length})</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    ${contacts.map(c => `
                      <div class="p-5 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex flex-col justify-between gap-4">
                        <div class="flex items-center gap-4">
                          <img class="w-14 h-14 rounded-2xl object-cover border border-[#cdf2cb] bg-white" src="${c.avatar || '/avatars/default.png'}" alt="${c.name}" />
                          <div>
                            <h4 class="text-base font-extrabold text-[#032109]">${c.name}</h4>
                            <span class="px-2.5 py-0.5 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs font-bold inline-block mt-0.5">${c.relation || 'Contact'}</span>
                            <p class="text-xs text-[#40493d] mt-1">${c.location || ''} · ${c.phone || ''}</p>
                          </div>
                        </div>

                        <div class="flex items-center gap-2 pt-2 border-t border-[#cdf2cb]">
                          <a 
                            href="tel:${c.phone}" 
                            class="btn-tactile btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                          >
                            <span class="material-symbols-outlined text-base">call</span>
                            <span>Call</span>
                          </a>
                          <a 
                            href="https://wa.me/${(c.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`${patient.name || 'Elder'} is safe and doing well.`)}" 
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm hover:bg-[#128C7E] transition-colors"
                          >
                            <span class="material-symbols-outlined text-base">chat</span>
                            <span>WhatsApp</span>
                          </a>
                          <button 
                            class="cg-voice-msg-btn flex-1 py-2.5 rounded-xl bg-white text-[#0d631b] border border-[#cdf2cb] text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#d9fdd6] transition-colors cursor-pointer"
                            data-name="${c.name}"
                            type="button"
                          >
                            <span class="material-symbols-outlined text-base">mic</span>
                            <span>Voice</span>
                          </button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `}
            </div>
          ` : ''}

        </main>
      </div>
    </div>
  `;

  // Attach event handlers
  setTimeout(() => {
    // Cross-device cloud sync on mount
    const curUser = authService.getCurrentUser ? authService.getCurrentUser() : null;
    if (curUser?.role === 'caregiver' && curUser?.email && authService.syncCaregiverElderData) {
      authService.syncCaregiverElderData(curUser.email).then(synced => {
        const syncedElder = synced?.elderProfile || synced?.elder || synced?.patient;
        if (syncedElder && syncedElder.name && syncedElder.name !== patient.name) {
          onNavigate('caregiver-dashboard', { tab: activeTab });
        }
      }).catch(err => console.warn('Cloud sync error:', err));
    }

    // Navigation handlers (re-renders within Caregiver Portal with tab param so sidebar never vanishes)
    const switchTab = (tab) => {
      onNavigate('caregiver-dashboard', { tab });
    };

    // Desktop Sidebar Links
    document.getElementById('side-overview')?.addEventListener('click', (e) => { e.preventDefault(); switchTab('overview'); });
    document.getElementById('side-memories')?.addEventListener('click', (e) => { e.preventDefault(); switchTab('memories'); });
    document.getElementById('side-reminders')?.addEventListener('click', (e) => { e.preventDefault(); switchTab('routine'); });
    document.getElementById('side-contacts')?.addEventListener('click', (e) => { e.preventDefault(); switchTab('contacts'); });

    // Mobile Navigation Bar Buttons
    document.getElementById('mob-tab-overview')?.addEventListener('click', () => switchTab('overview'));
    document.getElementById('mob-tab-memories')?.addEventListener('click', () => switchTab('memories'));
    document.getElementById('mob-tab-routine')?.addEventListener('click', () => switchTab('routine'));
    document.getElementById('mob-tab-contacts')?.addEventListener('click', () => switchTab('contacts'));

    // In-Dashboard Action Buttons
    document.getElementById('caregiver-open-memories-btn')?.addEventListener('click', () => switchTab('memories'));
    document.getElementById('caregiver-manage-meds-btn')?.addEventListener('click', () => switchTab('routine'));
    document.getElementById('caregiver-contacts-page-btn')?.addEventListener('click', () => switchTab('contacts'));
    document.getElementById('metric-meds-card')?.addEventListener('click', () => switchTab('routine'));
    document.getElementById('metric-memories-card')?.addEventListener('click', () => switchTab('memories'));

    // Modal & Toast Actions
    document.getElementById('caregiver-add-reminder-btn')?.addEventListener('click', () => openAddReminderModal());
    document.getElementById('routine-add-reminder-btn')?.addEventListener('click', () => openAddReminderModal());
    document.getElementById('cg-album-add-btn')?.addEventListener('click', () => {
      showToast('Photo upload dialog: Select family photo with voice story', 'info');
    });
    document.getElementById('memories-add-photo-btn')?.addEventListener('click', () => {
      showToast('Opening Memory Deck Uploader...', 'info');
    });

    // Emergency Alerts
    document.getElementById('caregiver-call-asha-btn')?.addEventListener('click', () => {
      showToast(`Calling ${patient.honorific || patient.name}'s room intercom (+91 98540 12345)...`, 'heart');
      window.open('tel:+919854012345');
    });
    document.getElementById('contacts-broadcast-all-btn')?.addEventListener('click', () => {
      showToast(`💚 Broadcast sent to all family members: "${patient.honorific || patient.name} is resting well and active today."`, 'heart', 6000);
    });

    // Voice Note Buttons
    document.querySelectorAll('.cg-voice-msg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const contactName = btn.getAttribute('data-name');
        showToast(`🎙️ Recording 15s voice note for ${contactName}...`, 'info');
      });
    });

    // Toggle Medicine Status Buttons
    document.querySelectorAll('.toggle-med-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (dataStore.toggleMedicineStatus) {
          const updated = await dataStore.toggleMedicineStatus(id);
          const targetMed = updated?.find(m => String(m.id) === String(id));
          if (targetMed?.taken) {
            showToast(`✓ Marked "${targetMed.title}" as taken`, 'success');
          } else if (targetMed) {
            showToast(`Pending: "${targetMed.title}" marked due`, 'info');
          }
        }
        switchTab('routine');
      });
    });

    // Delete Medicine Buttons
    document.querySelectorAll('.delete-med-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this reminder?')) {
          if (dataStore.deleteReminder) {
            await dataStore.deleteReminder(id);
            showToast('Reminder deleted successfully', 'info');
          }
          switchTab('routine');
        }
      });
    });

    // Interactive Game Board inside Memories Tab
    if (activeTab === 'memories') {
      let flippedIndices = [];
      const cards = gameCards;

      const renderCgBoard = () => {
        const board = document.getElementById('cg-game-board');
        if (!board) return;
        board.innerHTML = cards.map((card, idx) => `
          <div 
            class="cg-game-card cursor-pointer select-none transition-transform active:scale-[0.98]" 
            data-index="${idx}"
          >
            ${card.flipped || card.matched ? `
              <div class="card-tactile relative flex flex-col items-center justify-between p-4 bg-white rounded-3xl shadow-[0_4px_0_#2e7d32] border border-[#cdf2cb] min-h-[190px]">
                <div class="w-full flex items-center justify-between">
                  <span class="text-xs ${card.matched ? 'bg-[#a3f69c] text-[#002204]' : 'bg-[#ffdeaa] text-[#724f00]'} font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">${card.matched ? 'check_circle' : 'visibility'}</span> ${card.matched ? 'Matched' : 'Open'}
                  </span>
                  <span class="material-symbols-outlined text-[#0d631b] text-lg">favorite</span>
                </div>
                <div class="w-20 h-20 sm:w-24 sm:h-24 my-auto flex items-center justify-center rounded-2xl bg-[#d9fdd6] overflow-hidden p-1 border border-[#cdf2cb]">
                  <img class="w-full h-full object-cover rounded-xl" src="${card.img}" alt="${card.title}" />
                </div>
                <div class="w-full text-center">
                  <p class="text-sm sm:text-base font-extrabold text-[#0d631b]">${card.title}</p>
                  <p class="text-xs text-[#40493d]">${card.subtitle}</p>
                </div>
              </div>
            ` : `
              <div class="card-tactile relative flex flex-col items-center justify-center p-4 bg-[#cdf2cb] hover:bg-[#d3f8d0] rounded-3xl shadow-[0_4px_0_#1b6d24] border border-[#bfcaba] min-h-[190px] group">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/90 flex flex-col items-center justify-center text-[#0d631b] shadow-sm group-hover:scale-105 transition-transform border border-[#d9fdd6]">
                  <span class="material-symbols-outlined text-3xl sm:text-4xl">${card.icon}</span>
                  <span class="text-[10px] font-bold text-[#40493d] mt-1">Tap to Open</span>
                </div>
                <span class="mt-2 text-xs font-bold text-[#032109]">Card ${idx + 1}</span>
              </div>
            `}
          </div>
        `).join('');

        attachCardListeners();
      };

      const attachCardListeners = () => {
        document.querySelectorAll('.cg-game-card').forEach(slot => {
          slot.addEventListener('click', () => {
            const idx = parseInt(slot.dataset.index, 10);
            const card = cards[idx];
            if (card.matched || card.flipped) return;

            card.flipped = true;
            flippedIndices.push(idx);
            showToast(`Opened: ${card.title}`, 'info', 1500);
            renderCgBoard();

            if (flippedIndices.length === 2) {
              const first = cards[flippedIndices[0]];
              const second = cards[flippedIndices[1]];
              if (first.pairId === second.pairId) {
                first.matched = true;
                second.matched = true;
                flippedIndices = [];
                dataStore.incrementGamesCount?.();
                showToast(`🎉 Pair Matched: ${first.title}!`, 'success', 3000);
                setTimeout(renderCgBoard, 300);
              } else {
                setTimeout(() => {
                  first.flipped = false;
                  second.flipped = false;
                  flippedIndices = [];
                  renderCgBoard();
                }, 1200);
              }
            }
          });
        });
      };

      document.getElementById('cg-game-shuffle-btn')?.addEventListener('click', () => {
        cards.forEach((c, i) => {
          c.flipped = (i === 0 || i === 5);
          c.matched = (i === 0 || i === 5);
        });
        renderCgBoard();
        showToast('Cards shuffled!', 'info');
      });

      attachCardListeners();
    }
  }, 0);

  return html;
}
