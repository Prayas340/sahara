import { renderNavbar } from '../components/Navbar.js';
import { dataStore } from '../services/dataStore.js';
import { speakText } from '../utils/speech.js';
import { showToast } from '../utils/toast.js';

export function renderElderDashboard(onNavigate) {
  const patient = dataStore.state.patient || {};
  const displayName = patient.name || 'Asha Devi Borah';
  const displayHonorific = patient.honorific || (displayName.split(' ')[0] ? `${displayName.split(' ')[0]} ji` : displayName);
  
  const allMeds = dataStore.getMedicines ? dataStore.getMedicines() : (dataStore.state.medicines || []);
  const pendingMeds = allMeds.filter(m => !m.taken);
  const completedMeds = allMeds.filter(m => m.taken);
  const isAllDone = allMeds.length > 0 && pendingMeds.length === 0;
  const currentMed = pendingMeds.length > 0 ? pendingMeds[0] : (allMeds[0] || null);

  const currentDateStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const html = `
    <div class="min-h-screen bg-[#ebffe7] text-[#032109]">
      ${renderNavbar('elder-dashboard', onNavigate)}

      <main class="w-full pt-24 pb-28">
        <div class="w-full max-w-[48rem] mx-auto px-4 sm:px-6 space-y-6">
          
          <!-- Hero / Gentle Greeting Section -->
          <div class="relative card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden border border-[#cdf2cb]">
            <!-- Decorative Organic Aura (Soft Mint & Sunrise Yellow) -->
            <div class="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#d9fdd6]/70 pointer-events-none blur-2xl"></div>
            <div class="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#ffdeaa]/40 pointer-events-none blur-2xl"></div>

            <div class="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <!-- Asha ji's Portrait with tactile ring -->
              <div class="relative shrink-0">
                <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-[#2e7d32] via-[#98f994] to-[#ffdeaa] shadow-md">
                  <img 
                    alt="${displayName}" 
                    class="w-full h-full object-cover rounded-full shadow-inner bg-white" 
                    src="${patient.avatar || '/avatar.png'}"
                  />
                </div>
                <span class="absolute bottom-1 right-1 bg-[#0d631b] text-white rounded-full p-1 shadow-md flex items-center justify-center" title="Caregiver linked">
                  <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">eco</span>
                </span>
              </div>

              <!-- Greeting Content -->
              <div class="flex-1 text-center sm:text-left space-y-2">
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d3f8d0] text-xs sm:text-sm font-bold text-[#0d631b]">
                    <span class="material-symbols-outlined text-base text-[#0d631b]">calendar_today</span>
                    ${currentDateStr}
                  </span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full bg-[#ffdeaa]/60 text-xs font-bold text-[#724f00]">
                    ${dataStore.getLanguage() || 'English'}
                  </span>
                </div>

                <h1 class="text-2xl sm:text-3xl font-extrabold text-[#032109] leading-tight">
                  Good morning, ${displayHonorific} <span class="inline-block hover:scale-110 transition-transform">🌿</span>
                </h1>
                <p class="text-sm sm:text-base text-[#40493d] max-w-xl">
                  The morning air in the tea hills is crisp and fresh today. Take your time, sip warm water, and enjoy your quiet rhythm.
                </p>
              </div>
            </div>
          </div>

          <!-- 1. TODAY'S SUPPORT: MEDICINE RHYTHM CARD -->
          ${isAllDone ? `
            <section class="relative card-tactile bg-[#d9fdd6] rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden border border-[#cdf2cb]">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div class="flex items-center gap-4 flex-col sm:flex-row">
                  <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#006e1c] text-white flex items-center justify-center shadow-md shrink-0">
                    <span class="material-symbols-outlined text-3xl sm:text-4xl">task_alt</span>
                  </div>
                  <div>
                    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#0d631b] text-xs font-extrabold mb-1 shadow-sm">
                      <span class="material-symbols-outlined text-sm">celebration</span>
                      All medicines completed for today
                    </span>
                    <h2 class="text-xl sm:text-2xl font-extrabold text-[#032109]">
                      All Medicines Completed for Today ✓
                    </h2>
                    <p class="text-sm text-[#40493d] mt-1">
                      Wonderful care today, ${displayHonorific}! All ${allMeds.length} daily routines are finished.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span class="px-4 py-2 rounded-full bg-[#006e1c] text-white font-extrabold text-sm shadow-sm">
                    ${allMeds.length}/${allMeds.length} (100%)
                  </span>
                </div>
              </div>

              <!-- Completed list badges -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-[#cdf2cb]">
                ${allMeds.map((med) => `
                  <div class="p-2.5 bg-white rounded-xl border border-[#cdf2cb] flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#0d631b] text-base">check_circle</span>
                    <div class="overflow-hidden">
                      <p class="text-xs font-bold text-[#032109] truncate">${med.title}</p>
                      <p class="text-[10px] text-[#40493d]">${med.scheduledTime} · Taken ${med.takenAt || ''}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : currentMed ? `
            <section aria-labelledby="med-heading" class="relative card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden border border-[#cdf2cb]">
              <!-- Time indicator vertical bar -->
              <div class="absolute top-0 left-0 bottom-0 w-2.5 ${currentMed.taken ? 'bg-[#0d631b]' : 'bg-[#2e7d32]'}"></div>
              
              <div class="pl-2 flex flex-col gap-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#d9fdd6] flex items-center justify-center shadow-inner shrink-0 text-[#0d631b]">
                      <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">medication</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs sm:text-sm text-[#40493d] flex items-center gap-1 font-bold">
                          <span class="material-symbols-outlined text-sm text-[#0d631b]">schedule</span>
                          Scheduled for ${currentMed.scheduledTime}
                        </span>
                        ${pendingMeds.length > 1 ? `
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            ${pendingMeds.length} remaining today
                          </span>
                        ` : ''}
                      </div>
                      <h2 class="text-xl sm:text-2xl font-extrabold text-[#032109]" id="med-heading">
                        ${currentMed.title}
                      </h2>
                    </div>
                  </div>

                  <span class="self-start sm:self-auto px-3.5 py-1.5 rounded-full ${currentMed.taken ? 'bg-[#d9fdd6] text-[#0c7521]' : 'bg-[#ffdad6] text-[#93000a]'} text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-[#cdf2cb]">
                    <span class="material-symbols-outlined text-base">${currentMed.taken ? 'check_circle' : 'pending'}</span>
                    ${currentMed.taken ? `Taken at ${currentMed.takenAt || '8:15 AM'}` : 'Due now'}
                  </span>
                </div>

                <!-- Medicine details box -->
                <div class="p-4 rounded-2xl bg-[#d9fdd6]/50 border border-[#cdf2cb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div class="space-y-0.5">
                    <p class="text-base sm:text-lg font-bold text-[#032109]">${currentMed.detail}</p>
                    <p class="text-xs sm:text-sm text-[#40493d]">${currentMed.instruction || 'Take on schedule'}</p>
                  </div>
                  <button 
                    class="shrink-0 flex items-center gap-1.5 text-[#0d631b] hover:text-[#0c7521] text-xs sm:text-sm font-bold py-2 px-3 rounded-full hover:bg-[#d3f8d0] transition-colors cursor-pointer" 
                    id="elder-listen-med-btn"
                    type="button"
                  >
                    <span class="material-symbols-outlined text-lg">volume_up</span>
                    <span>Listen instructions</span>
                  </button>
                </div>

                <!-- Medicine Confirmation Actions -->
                <div class="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3" id="med-actions-dock">
                  <span class="text-xs text-[#40493d] font-bold">
                    ${completedMeds.length} of ${allMeds.length} completed today (${allMeds.length > 0 ? Math.round((completedMeds.length / allMeds.length) * 100) : 0}%)
                  </span>

                  <button 
                    class="btn-tactile btn-primary min-h-[48px] px-6 rounded-full text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer" 
                    id="elder-mark-med-taken-btn" 
                    data-med-id="${currentMed.id}"
                    type="button"
                  >
                    <span class="material-symbols-outlined text-xl">check_circle</span>
                    <span>Mark as Taken</span>
                  </button>
                </div>
              </div>
            </section>
          ` : ''}

          <!-- 2. KEEP YOUR MIND ACTIVE: COGNITIVE GAME & MEMORY DECK -->
          <section aria-labelledby="cognitive-heading" class="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-[#cdf2cb]">
            <!-- Decorative icon in background -->
            <div class="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <span class="material-symbols-outlined text-8xl text-[#0d631b]">psychology</span>
            </div>

            <div class="flex flex-col gap-4 relative">
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 rounded-full bg-[#98f994] text-[#0c7521] text-xs font-bold">
                  Daily Cognitive Joy
                </span>
                <span class="text-xs text-[#40493d] flex items-center gap-1 font-semibold">
                  <span class="material-symbols-outlined text-sm text-[#0d631b]">timer</span> 5 minutes only
                </span>
              </div>

              <div>
                <h2 class="text-2xl font-extrabold text-[#032109]" id="cognitive-heading">
                  Keep your mind active
                </h2>
                <p class="text-sm sm:text-base text-[#40493d] mt-1">
                  A gentle picture-matching activity is ready for you. Spot the familiar memories of the Brahmaputra tea gardens, fresh ripe mangoes, and traditional brass kettles.
                </p>
              </div>

              <!-- Sensory Visual Cue Preview Blocks -->
              <div class="grid grid-cols-3 gap-3 pt-1">
                <div class="h-24 sm:h-28 rounded-2xl overflow-hidden shadow-inner border border-[#cdf2cb] relative group cursor-pointer" id="cue-chai">
                  <img class="w-full h-full object-cover group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfb2Ilw0SLdOuUlOFLSzgAfBI-Gfu3AZuBqTInkesBiLBm6G2Be1pJ4TK9BY-Kh7Fs4oRCnQU5npntF9UZSiZKSoSrOkBgfIuaC67UF1QmjicWtikoUoag5AARfFvVxlZUBcNh0Usr1iI-fdom5Yok0COkHQwTVc4WLzYwOLywZ1ShZieBFZqd8vQOyjvOAqMJQotxgHn3DzFeSXIVXEaodQMgfHV_QNfPHER-HdxfMZdEicRJiGfmFA" alt="Assam Chai" />
                  <span class="absolute bottom-1 left-2 right-2 text-center text-[11px] font-extrabold bg-black/60 text-white rounded-md px-1 backdrop-blur-xs">Assam Chai ☕</span>
                </div>
                <div class="h-24 sm:h-28 rounded-2xl overflow-hidden shadow-inner border border-[#cdf2cb] relative group cursor-pointer" id="cue-jaapi">
                  <img class="w-full h-full object-cover group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDauqRUl7YpuJSBa4kuyqJidfQJRaCYT-3Oo4ZsHNJ-in8bGK4pPiMMwFwYXfcbFm8bjhHjTdbTvCJCXeBeip_UP8N5E3SY6mspaZ_RJ96mymlOszjhLt6jkZv4bdFun-_i-V8jOzhenh_NupZeRE9_b7FTmWMFA7LGfVW5mICyVvp8a9Yl8jyP7w4U6gL2IiKQJrqw79kBvqVVgteQ_5Z_bsLTMPu9-kKoaukZGOL7wLaXdCvZ_8WK5Q" alt="Banana Leaf Chai" />
                  <span class="absolute bottom-1 left-2 right-2 text-center text-[11px] font-extrabold bg-black/60 text-white rounded-md px-1 backdrop-blur-xs">Tea Garden</span>
                </div>
                <div class="h-24 sm:h-28 rounded-2xl overflow-hidden shadow-inner border border-[#cdf2cb] relative group cursor-pointer" id="cue-cat">
                  <img class="w-full h-full object-cover group-hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&auto=format&fit=crop&q=80" alt="Pet Cat" />
                  <span class="absolute bottom-1 left-2 right-2 text-center text-[11px] font-extrabold bg-black/60 text-white rounded-md px-1 backdrop-blur-xs">Gentle Cat</span>
                </div>
              </div>

              <!-- Start Memory Game Button -->
              <div class="pt-2">
                <button 
                  class="btn-tactile btn-primary w-full h-14 rounded-2xl text-base sm:text-lg font-extrabold flex items-center justify-center gap-3 shadow-md" 
                  id="elder-start-game-btn" 
                  type="button"
                >
                  <span class="material-symbols-outlined text-2xl">extension</span>
                  <span>Play Familiar Treasures (Start Match Game)</span>
                  <span class="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>

          <!-- 3. LOVED ONES DIRECT ACCESS BAR -->
          <section class="card-tactile bg-[#d9fdd6] rounded-3xl p-5 sm:p-6 shadow-sm border border-[#cdf2cb] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4 text-center sm:text-left">
              <div class="w-12 h-12 rounded-full bg-[#0d631b] text-white flex items-center justify-center shrink-0 shadow-md">
                <span class="material-symbols-outlined text-2xl">favorite</span>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-extrabold text-[#032109]">Your Family & Caregivers</h3>
                <p class="text-xs sm:text-sm text-[#40493d]">Riya, Anil, and Dr. Das are just one tap away.</p>
              </div>
            </div>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button 
                class="btn-tactile btn-secondary flex-1 sm:flex-initial h-11 px-4 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5" 
                id="elder-broadcast-btn" 
                type="button"
              >
                <span class="material-symbols-outlined text-lg text-[#0d631b]">volunteer_activism</span>
                <span>Send “I am Well”</span>
              </button>
              <button 
                class="btn-tactile btn-primary flex-1 sm:flex-initial h-11 px-5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5" 
                id="elder-call-riya-btn" 
                type="button"
              >
                <span class="material-symbols-outlined text-lg">call</span>
                <span>Call Riya</span>
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  `;

  // Attach event handlers
  setTimeout(() => {
    // Listen to Medicine Instructions
    document.getElementById('elder-listen-med-btn')?.addEventListener('click', () => {
      const medText = morningMed.instruction;
      speakText(medText);
      showToast('🔊 ' + medText, 'info', 5000);
    });

    // Mark Medicine Taken
    document.getElementById('elder-mark-med-taken-btn')?.addEventListener('click', () => {
      dataStore.markMedicineTaken('med_morning');
      showToast(`✨ Thank you, ${displayHonorific}! Morning medicine marked as taken.`, 'success', 5000);
      speakText(`Wonderful ${displayHonorific}! Your morning medicine is recorded.`);
      onNavigate('elder-dashboard'); // Re-render with celebration state
    });

    // Remind in 15 mins
    document.getElementById('elder-snooze-med-btn')?.addEventListener('click', () => {
      showToast('⏰ Reminder set for 15 minutes. Sip your water comfortably.', 'info');
      speakText("Reminder set for fifteen minutes. Sip your warm water.");
    });

    // Launch game
    document.getElementById('elder-start-game-btn')?.addEventListener('click', () => {
      onNavigate('memory-game');
    });

    // Preview cues click
    document.getElementById('cue-chai')?.addEventListener('click', () => onNavigate('memory-game'));
    document.getElementById('cue-jaapi')?.addEventListener('click', () => onNavigate('memory-game'));
    document.getElementById('cue-cat')?.addEventListener('click', () => onNavigate('memory-game'));

    // Send "I am Well"
    document.getElementById('elder-broadcast-btn')?.addEventListener('click', () => {
      dataStore.sendWellnessBroadcast(`${displayHonorific} tapped "I am doing well" at ` + new Date().toLocaleTimeString());
      showToast('❤️ Sweet reassurance sent! Riya and Anil have received your smile.', 'heart', 6000);
      speakText("Your family has received your message that you are doing well.");
    });

    // Call Riya
    document.getElementById('elder-call-riya-btn')?.addEventListener('click', () => {
      showToast('Connecting direct call with Riya Borah (+91 98540 12345)...', 'heart');
      window.open('tel:+919854012345');
    });
  }, 0);

  return html;
}
