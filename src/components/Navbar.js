import { authService } from '../services/authService.js';
import { dataStore } from '../services/dataStore.js';
import { showToast } from '../utils/toast.js';

export function renderNavbar(activeView, onNavigate) {
  const user = authService.getCurrentUser();
  const patient = dataStore.getPatient ? dataStore.getPatient() : (dataStore.state.patient || {});
  const caregiver = dataStore.getCaregiver ? dataStore.getCaregiver() : (dataStore.state.caregiver || {});
  const elderDisplayName = patient?.honorific || (patient?.name ? `${patient.name.split(' ')[0]} ji` : 'Asha ji');
  const caregiverDisplayName = caregiver?.name ? caregiver.name.split(' ')[0] : 'Riya';
  const isElder = activeView === 'elder-dashboard';
  const isCaregiver = activeView === 'caregiver-dashboard';

  const navHtml = `
    <header class="fixed top-0 left-0 right-0 w-full z-50 bg-[#ebffe7]/90 backdrop-blur-xl border-b border-[#cdf2cb] shadow-[0_2px_12px_rgba(23,53,27,0.06)]">
      <div class="h-20 max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <!-- Brand Logo & Name -->
        <div class="flex items-center gap-3.5 shrink-0 cursor-pointer select-none py-1" id="nav-brand-btn">
          <div class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-md border border-[#cdf2cb] p-1.5 flex items-center justify-center shrink-0">
            <img 
              alt="Sahara Brand Logo" 
              class="w-full h-full object-contain rounded-xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADfY8uUCdflx3PxgJV8n5Rdy5e1UqyJi1RpuX07Bmc9r6hn23Klt8mhC0O57Dlsy0AoO2Zfur4kxn9yueS6kMU1-B3o_rUnCtsYE80rKVOILi3Gl6wxP62ffyGjvNMaoafsux-4Nu3YfcznSLtBj71fvQApLWucdiSJyE4VD5KSm1AryUPF0ooW09SbgA3OdWj_0EfL0E3tOmeMY4frF7WwHEp3O9blDcLXakfekbdhrlgiYNNcO0c2Q"
            />
          </div>
          <div class="flex flex-col justify-center">
            <span class="font-black text-2xl sm:text-3xl text-[#0d631b] leading-none tracking-tight">Sahara</span>
            <span class="hidden sm:inline-block text-xs font-bold text-[#40493d] tracking-normal mt-1 leading-tight">Everyday Cognitive & Caregiver Companion</span>
          </div>
        </div>

        <!-- Center View Indicator: Completely Isolated for Elder vs Caregiver (No Switcher Buttons) -->
        ${isCaregiver ? `
          <div class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#cdf2cb] shadow-xs text-xs sm:text-sm font-extrabold text-[#0d631b]">
            <span class="w-2.5 h-2.5 rounded-full bg-[#006e1c] animate-pulse"></span>
            <span class="material-symbols-outlined text-base">health_and_safety</span>
            <span>Caregiver Portal · Monitoring ${patient?.name || 'Loved One'}</span>
          </div>
        ` : `
          <div class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#cdf2cb] shadow-xs text-xs sm:text-sm font-extrabold text-[#0d631b]">
            <span class="material-symbols-outlined text-base text-[#0d631b]">spa</span>
            <span>${elderDisplayName}'s Sanctuary</span>
          </div>
        `}

        <!-- Right Controls (Language, Avatar) -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Language Dropdown -->
          <div class="relative flex items-center bg-white px-2 py-1 rounded-full shadow-sm border border-[#cdf2cb]">
            <span class="material-symbols-outlined text-[#0d631b] text-base mr-1">translate</span>
            <select id="nav-lang-select" class="bg-transparent text-xs font-bold text-[#032109] focus:outline-none cursor-pointer pr-1">
              <option value="English" ${dataStore.getLanguage() === 'English' ? 'selected' : ''}>English</option>
              <option value="हिंदी" ${dataStore.getLanguage() === 'हिंदी' ? 'selected' : ''}>हिंदी (Hindi)</option>
              <option value="অসমীয়া" ${dataStore.getLanguage() === 'অসমীয়া' ? 'selected' : ''}>অসমীয়া (Assamese)</option>
              <option value="বাংলা" ${dataStore.getLanguage() === 'বাংলা' ? 'selected' : ''}>বাংলা (Bengali)</option>
              <option value="মৈতৈলোন্" ${dataStore.getLanguage() === 'মৈতৈলোন্' ? 'selected' : ''}>ꯃꯤꯇꯩꯂꯣꯟ (Manipuri)</option>
            </select>
          </div>

          <!-- Avatar & Menu -->
          <div class="relative">
            <input type="file" id="nav-file-input" accept="image/*" class="hidden" />
            <button 
              id="nav-avatar-btn" 
              type="button" 
              class="w-9 h-9 rounded-full ring-2 ring-[#d9fdd6] overflow-hidden flex items-center justify-center bg-white shadow-sm hover:ring-[#2e7d32] transition-all cursor-pointer"
            >
              <img 
                alt="Profile" 
                class="w-full h-full object-cover bg-white" 
                src="${user?.avatar || patient?.avatar || '/avatar.png'}"
              />
            </button>
            
            <!-- User menu popup -->
            <div id="nav-user-menu" class="hidden absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 text-sm">
              <div class="p-2 border-b border-gray-100 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#cdf2cb]">
                  <img
                    alt="User"
                    class="w-full h-full object-cover bg-white"
                    src="${user?.avatar || patient?.avatar || '/avatar.png'}"
                  />
                </div>
                <div class="overflow-hidden">
                  <p class="font-bold text-gray-800 truncate">${user?.name || patient.name || (isCaregiver ? 'Caregiver' : 'Sahara Member')}</p>
                  <p class="text-xs text-gray-500">${user?.role === 'caregiver' || isCaregiver ? 'Caregiver Companion' : 'Mild Cognitive Support'}</p>
                </div>
              </div>

              <button id="menu-upload-photo-btn" class="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#ebffe7] text-[#0d631b] font-semibold flex items-center gap-2 cursor-pointer mt-1">
                <span class="material-symbols-outlined text-lg text-[#0d631b]">add_a_photo</span>
                Upload Profile Photo
              </button>
              
              <button id="menu-contacts-btn" class="w-full text-left px-3 py-2 rounded-lg hover:bg-[#ebffe7] text-[#0d631b] font-medium flex items-center gap-2 cursor-pointer">
                <span class="material-symbols-outlined text-lg">family_restroom</span>
                Family Contacts
              </button>

              <button id="menu-signout-btn" class="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 cursor-pointer border-t border-gray-100 mt-1 pt-2">
                <span class="material-symbols-outlined text-lg">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;

  // Attach event handlers
  setTimeout(() => {
    document.getElementById('nav-brand-btn')?.addEventListener('click', () => {
      onNavigate(isCaregiver ? 'caregiver-dashboard' : 'elder-dashboard');
    });

    const avatarBtn = document.getElementById('nav-avatar-btn');
    const userMenu = document.getElementById('nav-user-menu');
    const fileInput = document.getElementById('nav-file-input');

    avatarBtn?.addEventListener('click', () => {
      userMenu?.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!avatarBtn?.contains(e.target) && !userMenu?.contains(e.target)) {
        userMenu?.classList.add('hidden');
      }
    });

    document.getElementById('menu-upload-photo-btn')?.addEventListener('click', () => {
      userMenu?.classList.add('hidden');
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (PNG, JPG, JPEG).', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result;
        if (!rawDataUrl) return;

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          authService.updateAvatar(optimizedDataUrl);
          showToast('✅ Profile photo updated successfully!', 'success');
          onNavigate(activeView);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });

    document.getElementById('menu-contacts-btn')?.addEventListener('click', () => {
      userMenu?.classList.add('hidden');
      onNavigate('contacts');
    });

    document.getElementById('menu-signout-btn')?.addEventListener('click', async () => {
      const wasCaregiver = user?.role === 'caregiver' || isCaregiver;
      await authService.signOut();
      showToast('Signed out of Sahara safely.', 'info');
      if (wasCaregiver) {
        onNavigate('caregiver-login');
      } else {
        onNavigate('welcome-login');
      }
    });

    // Language selector change
    const navLangSelect = document.getElementById('nav-lang-select');
    navLangSelect?.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      dataStore.setLanguage(selectedLang);
      showToast(`Language set to ${selectedLang}`, 'info');
      onNavigate(activeView);
    });
  }, 0);

  return navHtml;
}
