import { dataStore } from '../services/dataStore.js';
import { showToast } from '../utils/toast.js';

export function openAddReminderModal(onSuccess) {
  const patient = dataStore.state.patient || {};
  const patientName = patient.name || 'Asha Devi Borah';
  const patientHonorific = patient.honorific || (patientName.split(' ')[0] ? `${patientName.split(' ')[0]} ji` : patientName);

  let selectedCategory = 'Medicine';
  let hour = 8;
  let minute = 0;
  let period = 'AM';
  let repeatFreq = 'Daily';
  let whatsAppSync = true;
  let recipient = 'Both (Active)';

  const modalHtml = `
    <div id="add-reminder-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#cdf2cb] my-auto">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#0d631b] to-[#2e7d32] p-5 sm:p-6 text-white flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="text-xs uppercase tracking-wider text-[#cbffc2] font-bold">Guwahati Home • Stage 2 Support</span>
            <h2 class="text-xl sm:text-2xl font-extrabold">Add a Gentle Reminder for ${patientHonorific}</h2>
          </div>
          <button id="close-reminder-modal-btn" class="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-white text-2xl">close</span>
          </button>
        </div>

        <!-- Form Layout Grid -->
        <div class="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
          <!-- Left Col: Controls -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- Step 1: Categories -->
            <section class="space-y-3">
              <span class="text-xs font-bold text-[#0d631b] uppercase tracking-wider block">1. Choose Activity Category</span>
              <div class="grid grid-cols-3 gap-2.5" id="category-picker-group">
                <button type="button" class="cat-pill active p-3 rounded-2xl bg-[#d9fdd6] border-2 border-[#2e7d32] text-left transition-all cursor-pointer" data-cat="Medicine">
                  <span class="material-symbols-outlined text-[#0d631b] text-2xl block mb-1">medication</span>
                  <span class="text-xs sm:text-sm font-bold text-[#032109] block">Medicine</span>
                  <span class="text-[11px] text-[#40493d]">Tablets & tonics</span>
                </button>
                <button type="button" class="cat-pill p-3 rounded-2xl bg-[#d3f8d0] border-2 border-transparent text-left transition-all hover:bg-[#cdf2cb] cursor-pointer" data-cat="Water">
                  <span class="material-symbols-outlined text-[#0d631b] text-2xl block mb-1">water_drop</span>
                  <span class="text-xs sm:text-sm font-bold text-[#032109] block">Water</span>
                  <span class="text-[11px] text-[#40493d]">Hydration cup</span>
                </button>
                <button type="button" class="cat-pill p-3 rounded-2xl bg-[#d3f8d0] border-2 border-transparent text-left transition-all hover:bg-[#cdf2cb] cursor-pointer" data-cat="Walk">
                  <span class="material-symbols-outlined text-[#0d631b] text-2xl block mb-1">directions_walk</span>
                  <span class="text-xs sm:text-sm font-bold text-[#032109] block">Walk</span>
                  <span class="text-[11px] text-[#40493d]">Veranda stroll</span>
                </button>
                <button type="button" class="cat-pill p-3 rounded-2xl bg-[#d3f8d0] border-2 border-transparent text-left transition-all hover:bg-[#cdf2cb] cursor-pointer" data-cat="Memory Game">
                  <span class="material-symbols-outlined text-[#0d631b] text-2xl block mb-1">extension</span>
                  <span class="text-xs sm:text-sm font-bold text-[#032109] block">Memory Game</span>
                  <span class="text-[11px] text-[#40493d]">Picture cards</span>
                </button>
                <button type="button" class="cat-pill p-3 rounded-2xl bg-[#d3f8d0] border-2 border-transparent text-left transition-all hover:bg-[#cdf2cb] cursor-pointer" data-cat="Doctor">
                  <span class="material-symbols-outlined text-[#0d631b] text-2xl block mb-1">stethoscope</span>
                  <span class="text-xs sm:text-sm font-bold text-[#032109] block">Doctor</span>
                  <span class="text-[11px] text-[#40493d]">Checkup call</span>
                </button>
                <button type="button" class="cat-pill p-3 rounded-2xl bg-[#d3f8d0] border-2 border-transparent text-left transition-all hover:bg-[#cdf2cb] cursor-pointer" data-cat="Custom">
                  <span class="material-symbols-outlined text-[#0d631b] text-2xl block mb-1">auto_awesome</span>
                  <span class="text-xs sm:text-sm font-bold text-[#032109] block">Custom</span>
                  <span class="text-[11px] text-[#40493d]">Tea & prayer</span>
                </button>
              </div>
            </section>

            <!-- Step 2: Title & Spoken Phrase -->
            <section class="space-y-2">
              <label class="text-xs font-bold text-[#0d631b] uppercase tracking-wider block" for="modal-reminder-title">
                2. Spoken Phrase for ${patientHonorific}
              </label>
              <input 
                id="modal-reminder-title" 
                type="text" 
                value="Take blood pressure tablet with warm water" 
                class="w-full px-4 py-3 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] text-sm sm:text-base font-bold text-[#032109] focus:outline-none focus:ring-2 focus:ring-[#0d631b]"
              />
            </section>

            <!-- Step 3: Tactile Time Dials -->
            <section class="space-y-3">
              <span class="text-xs font-bold text-[#0d631b] uppercase tracking-wider block">3. Time & Schedule (IST Guwahati)</span>
              <div class="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#d9fdd6] border border-[#cdf2cb]">
                <!-- Hour -->
                <div class="flex flex-col items-center">
                  <button id="hour-up-btn" type="button" class="p-1 rounded bg-white hover:bg-gray-100 shadow-sm"><span class="material-symbols-outlined">expand_less</span></button>
                  <div id="hour-display" class="w-16 h-14 bg-white rounded-xl shadow-[0_3px_0_#2e7d32] flex items-center justify-center text-2xl font-extrabold text-[#0d631b] my-1 select-none">
                    08
                  </div>
                  <button id="hour-down-btn" type="button" class="p-1 rounded bg-white hover:bg-gray-100 shadow-sm"><span class="material-symbols-outlined">expand_more</span></button>
                  <span class="text-[11px] text-[#40493d] mt-1 font-semibold">Hour</span>
                </div>

                <span class="text-2xl font-extrabold text-[#0d631b] self-center mb-5">:</span>

                <!-- Minute -->
                <div class="flex flex-col items-center">
                  <button id="min-up-btn" type="button" class="p-1 rounded bg-white hover:bg-gray-100 shadow-sm"><span class="material-symbols-outlined">expand_less</span></button>
                  <div id="min-display" class="w-16 h-14 bg-white rounded-xl shadow-[0_3px_0_#2e7d32] flex items-center justify-center text-2xl font-extrabold text-[#0d631b] my-1 select-none">
                    00
                  </div>
                  <button id="min-down-btn" type="button" class="p-1 rounded bg-white hover:bg-gray-100 shadow-sm"><span class="material-symbols-outlined">expand_more</span></button>
                  <span class="text-[11px] text-[#40493d] mt-1 font-semibold">Minute</span>
                </div>

                <!-- AM/PM -->
                <div class="flex flex-col gap-1.5 ml-3">
                  <button id="period-am-btn" type="button" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0d631b] text-white shadow-sm transition-all">AM</button>
                  <button id="period-pm-btn" type="button" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#40493d] hover:bg-gray-100 transition-all">PM</button>
                  <span class="text-[11px] text-[#40493d] text-center mt-1 font-semibold">Period</span>
                </div>
              </div>
            </section>

            <!-- Step 4: WhatsApp Audio Toggle -->
            <section class="p-4 rounded-2xl bg-[#ebffe7] border border-[#cdf2cb] flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#006e1c] text-white flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-xl">campaign</span>
                </div>
                <div>
                  <p class="text-xs sm:text-sm font-bold text-[#032109]">Automated WhatsApp Voice Prompt</p>
                  <p class="text-[11px] text-[#40493d]">Plays regional Assamese voice memo</p>
                </div>
              </div>
              <input type="checkbox" id="modal-wa-toggle" checked class="w-6 h-6 accent-[#0d631b] cursor-pointer" />
            </section>
          </div>

          <!-- Right Col: Live Preview & Submit -->
          <div class="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div class="space-y-4">
              <span class="text-xs font-bold text-[#0d631b] uppercase tracking-wider block">Live Message Preview</span>
              
              <!-- WhatsApp Card Preview -->
              <div class="bg-[#d9fdd6] rounded-2xl p-4 border border-[#cdf2cb] space-y-3">
                <div class="flex items-center gap-3">
                  <img class="w-10 h-10 rounded-full object-cover shadow-sm bg-white" src="${patient.avatar || '/avatar.png'}" alt="${patientHonorific}" />
                  <div>
                    <p class="text-xs font-bold text-[#032109]">${patientName}</p>
                    <p class="text-[11px] text-[#40493d]">Guwahati Home Smart Speaker</p>
                  </div>
                  <span class="ml-auto text-[11px] text-[#40493d] font-bold" id="preview-time">08:00 AM</span>
                </div>

                <div class="bg-white rounded-xl p-3.5 shadow-sm space-y-2 border border-[#cdf2cb]">
                  <p class="text-xs sm:text-sm font-bold text-[#0d631b]" id="preview-title">Take blood pressure tablet with warm water</p>
                  <div class="flex items-center gap-2 text-xs text-[#40493d]">
                    <span class="material-symbols-outlined text-base text-[#0d631b]">volume_up</span>
                    <span>“Namaste ${patientHonorific}. It is time for your medicine.”</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Save Action Button -->
            <div class="pt-4">
              <button 
                id="modal-save-reminder-btn"
                type="button" 
                class="btn-tactile btn-primary w-full h-14 rounded-2xl text-base sm:text-lg font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span class="material-symbols-outlined text-2xl">check_circle</span>
                <span>Save & Activate Reminder</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  const existing = document.getElementById('add-reminder-modal');
  if (existing) existing.remove();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper.firstElementChild);

  const modal = document.getElementById('add-reminder-modal');
  const closeBtn = document.getElementById('close-reminder-modal-btn');
  const saveBtn = document.getElementById('modal-save-reminder-btn');
  const titleInput = document.getElementById('modal-reminder-title');
  const previewTitle = document.getElementById('preview-title');
  const previewTime = document.getElementById('preview-time');
  const hourDisplay = document.getElementById('hour-display');
  const minDisplay = document.getElementById('min-display');
  const amBtn = document.getElementById('period-am-btn');
  const pmBtn = document.getElementById('period-pm-btn');
  const catPills = document.querySelectorAll('.cat-pill');

  function updateTimeDisplay() {
    const formattedHour = hour < 10 ? '0' + hour : hour;
    const formattedMin = minute < 10 ? '0' + minute : minute;
    hourDisplay.innerText = formattedHour;
    minDisplay.innerText = formattedMin;
    previewTime.innerText = `${formattedHour}:${formattedMin} ${period}`;
  }

  // Category selection
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => {
        p.classList.remove('active', 'border-2', 'border-[#2e7d32]', 'bg-[#d9fdd6]');
        p.classList.add('bg-[#d3f8d0]', 'border-2', 'border-transparent');
      });
      pill.classList.add('active', 'border-2', 'border-[#2e7d32]', 'bg-[#d9fdd6]');
      selectedCategory = pill.dataset.cat;
      if (selectedCategory === 'Water') {
        titleInput.value = 'Drink a warm cup of water';
      } else if (selectedCategory === 'Walk') {
        titleInput.value = 'Take a pleasant veranda morning walk';
      } else if (selectedCategory === 'Memory Game') {
        titleInput.value = 'Play 5 minutes of Familiar Treasures match';
      }
      previewTitle.innerText = titleInput.value;
    });
  });

  titleInput.addEventListener('input', () => {
    previewTitle.innerText = titleInput.value || 'Reminder Title';
  });

  // Hour controls
  document.getElementById('hour-up-btn').addEventListener('click', () => {
    hour = hour >= 12 ? 1 : hour + 1;
    updateTimeDisplay();
  });
  document.getElementById('hour-down-btn').addEventListener('click', () => {
    hour = hour <= 1 ? 12 : hour - 1;
    updateTimeDisplay();
  });

  // Minute controls
  document.getElementById('min-up-btn').addEventListener('click', () => {
    minute = (minute + 15) % 60;
    updateTimeDisplay();
  });
  document.getElementById('min-down-btn').addEventListener('click', () => {
    minute = minute <= 0 ? 45 : minute - 15;
    updateTimeDisplay();
  });

  // AM/PM
  amBtn.addEventListener('click', () => {
    period = 'AM';
    amBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0d631b] text-white shadow-sm transition-all';
    pmBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#40493d] hover:bg-gray-100 transition-all';
    updateTimeDisplay();
  });
  pmBtn.addEventListener('click', () => {
    period = 'PM';
    pmBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0d631b] text-white shadow-sm transition-all';
    amBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#40493d] hover:bg-gray-100 transition-all';
    updateTimeDisplay();
  });

  closeBtn.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  saveBtn.addEventListener('click', () => {
    const formattedHour = hour < 10 ? '0' + hour : hour;
    const formattedMin = minute < 10 ? '0' + minute : minute;
    const reminderTime = `${formattedHour}:${formattedMin} ${period}`;

    dataStore.addReminder({
      title: titleInput.value.trim() || 'Daily Routine Reminder',
      category: selectedCategory,
      time: reminderTime,
      frequency: repeatFreq,
      whatsAppSync: document.getElementById('modal-wa-toggle')?.checked ?? true,
      recipients: recipient,
    });

    showToast(`🔔 Reminder created for ${reminderTime}: "${titleInput.value}"`, 'success', 5000);
    modal.remove();
    if (typeof onSuccess === 'function') onSuccess();
  });
}
