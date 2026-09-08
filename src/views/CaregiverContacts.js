import { renderNavbar } from '../components/Navbar.js';
import { dataStore } from '../services/dataStore.js';
import { speakText } from '../utils/speech.js';
import { showToast } from '../utils/toast.js';

export function renderCaregiverContacts(onNavigate) {
  const contacts = dataStore.state.contacts;

  const html = `
    <div class="min-h-screen bg-[#ebffe7] text-[#032109]">
      ${renderNavbar('elder-dashboard', onNavigate)}

      <main class="w-full pt-24 pb-28">
        <div class="w-full max-w-[76rem] mx-auto px-4 sm:px-6 flex flex-col gap-6">
          
          <!-- Back button -->
          <div>
            <button 
              id="contacts-back-btn" 
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#0d631b] font-bold text-sm shadow-sm border border-[#cdf2cb] hover:bg-[#d9fdd6] transition-colors cursor-pointer"
              type="button"
            >
              <span class="material-symbols-outlined text-lg">arrow_back</span>
              <span>Back to Home</span>
            </button>
          </div>

          <!-- Emotional Anchor Header -->
          <div class="card-tactile relative bg-[#d9fdd6] rounded-3xl p-6 sm:p-10 overflow-hidden shadow-md border border-[#cdf2cb]">
            <div class="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#a3f69c]/40 blur-2xl pointer-events-none"></div>
            <div class="absolute right-1/3 -bottom-16 w-80 h-80 rounded-full bg-[#cdf2cb]/60 blur-3xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div class="max-w-2xl">
                <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#0d631b] mb-3 shadow-sm border border-[#cdf2cb]">
                  <span class="material-symbols-outlined text-xl text-[#0d631b]" style="font-variation-settings: 'FILL' 1;">family_restroom</span>
                  <span class="text-xs font-bold uppercase tracking-wide">Aapnar Aapon Manuh · Your Loved Ones</span>
                </div>
                <h1 class="text-3xl sm:text-4xl font-extrabold text-[#032109] tracking-tight mb-2">
                  People who care for you
                </h1>
                <p class="text-base sm:text-xl text-[#40493d]">
                  Tap any card to call or send a gentle voice message
                </p>
              </div>

              <!-- Quick 1-Tap Broadcaster Action -->
              <div class="shrink-0 flex flex-col items-start md:items-end gap-2">
                <button 
                  class="btn-tactile btn-primary relative group flex items-center gap-3 px-6 py-4 rounded-full text-base sm:text-lg font-extrabold shadow-lg cursor-pointer" 
                  id="contacts-broadcast-btn" 
                  type="button"
                >
                  <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">volunteer_activism</span>
                  <span>Send “I am doing well” to Everyone</span>
                  <span class="flex h-3 w-3 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a3f69c] opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-[#a3f69c]"></span>
                  </span>
                </button>
                <span class="text-xs text-[#40493d] flex items-center gap-1">
                  <span class="material-symbols-outlined text-base text-[#0d631b]">done_all</span>
                  Notifies Riya, Anil & Dr. Das with one touch
                </span>
              </div>
            </div>
          </div>

          <!-- Caregiver & Family Contact Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${contacts.map(c => `
              <div class="card-tactile bg-white rounded-3xl p-6 shadow-md border border-[#cdf2cb] flex flex-col justify-between hover:shadow-xl transition-all">
                <div>
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-20 h-20 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-[#cdf2cb]">
                      <img class="w-full h-full object-cover" src="${c.avatar}" alt="${c.name}" />
                    </div>
                    <div class="flex flex-col">
                      <h2 class="text-xl font-extrabold text-[#032109] leading-tight">${c.name}</h2>
                      <span class="text-xs font-bold text-[#0d631b]">${c.relation}</span>
                      <span class="text-xs text-[#40493d] mt-1">${c.location}</span>
                    </div>
                  </div>

                  <!-- Status pill -->
                  <div class="p-3 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] mb-6 flex items-start gap-2.5">
                    <span class="material-symbols-outlined text-[#0d631b] text-xl shrink-0 mt-0.5">home_pin</span>
                    <div>
                      <p class="text-xs font-bold text-[#032109]">${c.status}</p>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col gap-2">
                  <a 
                    href="tel:${c.phone}" 
                    class="btn-tactile btn-primary w-full min-h-[50px] flex items-center justify-center gap-2 rounded-full text-sm font-bold shadow-md"
                  >
                    <span class="material-symbols-outlined text-xl">call</span>
                    <span>Call ${c.name}</span>
                  </a>
                  <button 
                    class="btn-tactile btn-secondary w-full min-h-[46px] flex items-center justify-center gap-2 rounded-full text-xs sm:text-sm font-bold bg-[#d3f8d0] text-[#0d631b] hover:bg-[#cdf2cb]" 
                    onclick="window.openVoiceModal && window.openVoiceModal('${c.name}')" 
                    type="button"
                  >
                    <span class="material-symbols-outlined text-xl">mic</span>
                    <span>Send Voice Message</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

        </div>
      </main>
    </div>
  `;

  // Attach event handlers
  setTimeout(() => {
    document.getElementById('contacts-back-btn')?.addEventListener('click', () => onNavigate('elder-dashboard'));

    document.getElementById('contacts-broadcast-btn')?.addEventListener('click', () => {
      const patient = dataStore.state.patient || {};
      const patientHonorific = patient.honorific || (patient.name ? `${patient.name.split(' ')[0]} ji` : 'Asha ji');
      dataStore.sendWellnessBroadcast(`${patientHonorific} tapped "I am doing well" at ` + new Date().toLocaleTimeString());
      showToast(`❤️ Sweet reassurance sent! Riya, Anil & Dr. Das have received your update: "${patientHonorific} is smiling and doing well."`, 'heart', 6000);
      speakText("Reassurance sent! Your loved ones know you are doing well.");
    });

    // Voice modal simulation helper
    window.openVoiceModal = (name) => {
      showToast(`🎙️ Recording voice note for ${name}... Tap stop when finished.`, 'info', 4000);
      speakText(`Recording voice message for ${name}. Speak comfortably.`);
      setTimeout(() => {
        showToast(`✅ Voice message sent safely to ${name} via WhatsApp & Sahara!`, 'success', 5000);
      }, 3500);
    };
  }, 0);

  return html;
}
