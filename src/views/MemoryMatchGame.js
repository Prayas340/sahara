import { renderNavbar } from '../components/Navbar.js';
import { dataStore } from '../services/dataStore.js';
import { speakText } from '../utils/speech.js';
import { showToast } from '../utils/toast.js';

export function renderMemoryMatchGame(onNavigate) {
  // Game card definitions (3 pairs = 6 cards)
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

  // 6 cards (shuffled pairs)
  const cards = [
    { id: 0, ...cardPool[0], matched: false, flipped: true }, // Starts Chai revealed like mockup
    { id: 1, ...cardPool[1], matched: false, flipped: false },
    { id: 2, ...cardPool[2], matched: false, flipped: false },
    { id: 3, ...cardPool[1], matched: false, flipped: false },
    { id: 4, ...cardPool[2], matched: false, flipped: false },
    { id: 5, ...cardPool[0], matched: false, flipped: true }, // Matching Chai revealed
  ];
  // Set initial matched state for Chai pair like mockup
  cards[0].matched = true;
  cards[5].matched = true;

  const html = `
    <div class="min-h-screen bg-[#ebffe7] text-[#032109]">
      ${renderNavbar('elder-dashboard', onNavigate)}

      <main class="w-full pt-24 pb-28">
        <div class="max-w-[48rem] mx-auto w-full px-4 sm:px-6 flex flex-col gap-6">
          
          <!-- Top Navigation & Audio Assistance Bar -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl shadow-sm border border-[#cdf2cb]">
            <button 
              id="game-back-home-btn"
              class="inline-flex items-center gap-2 font-bold text-sm sm:text-base text-[#0d631b] hover:text-[#032109] transition-colors py-1.5 px-2 rounded-lg cursor-pointer" 
              type="button"
            >
              <span class="material-symbols-outlined text-2xl font-bold">arrow_back</span>
              <span>Back to Home</span>
            </button>
            <div class="flex items-center justify-between sm:justify-end gap-3">
              <div class="flex items-center gap-2 bg-[#d3f8d0] px-3.5 py-1.5 rounded-full">
                <span class="material-symbols-outlined text-[#006e1c] text-lg" style="font-variation-settings: 'FILL' 1;">spa</span>
                <span class="text-xs sm:text-sm font-semibold text-[#032109]">Pace: Gentle & Free</span>
              </div>
            </div>
          </div>

          <!-- Title & Dignified Reassurance -->
          <div class="flex flex-col items-center text-center gap-2 mt-1">
            <div class="inline-flex items-center gap-2 bg-[#cdf2cb] text-[#0d631b] px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm">
              <span class="material-symbols-outlined text-base">verified</span>
              <span>Round 1 of 3 · Take all the time you need</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#032109] tracking-tight">
              Memory Match: <span class="text-[#0d631b] font-extrabold">Familiar Treasures</span>
            </h1>
            <p class="text-sm sm:text-base text-[#40493d] max-w-xl">
              Every gentle effort is a victory. Find the pictures that belong together.
            </p>
          </div>

          <!-- Clear Low-Pressure Guidance Banner -->
          <div class="relative overflow-hidden bg-[#d9fdd6] rounded-2xl p-4 sm:p-5 shadow-sm border border-[#cdf2cb] flex items-center gap-4">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2e7d32] text-white flex items-center justify-center shrink-0 shadow-md">
              <span class="material-symbols-outlined text-2xl sm:text-3xl">touch_app</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-extrabold text-[#0d631b] uppercase tracking-wide">Easy Steps</span>
              <p class="text-sm sm:text-base font-bold text-[#032109] leading-snug">
                Find the two matching pictures. Tap any card to flip it over softly.
              </p>
            </div>
            <div class="hidden md:flex ml-auto shrink-0 items-center text-[#40493d] text-xs font-semibold gap-1">
              <span class="material-symbols-outlined text-[#006e1c]">self_improvement</span>
              <span>No clock · No scoring</span>
            </div>
          </div>

          <!-- Tactile Memory Game Board: 6 Large Tactile Blocks -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6" id="game-board">
            ${cards.map((card, idx) => `
              <div 
                class="game-card-slot cursor-pointer select-none transition-transform active:scale-[0.98]" 
                data-index="${idx}"
              >
                ${card.flipped || card.matched ? `
                  <!-- Face Up Card -->
                  <div class="card-tactile relative flex flex-col items-center justify-between p-4 bg-white rounded-3xl shadow-[0_6px_0_#2e7d32] border border-[#cdf2cb] min-h-[200px] sm:min-h-[240px]">
                    <div class="w-full flex items-center justify-between">
                      <span class="text-xs bg-[#a3f69c] text-[#002204] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">check_circle</span> Matched
                      </span>
                      <span class="material-symbols-outlined text-[#0d631b] text-xl">favorite</span>
                    </div>
                    <div class="w-24 h-24 sm:w-28 sm:h-28 my-auto flex items-center justify-center rounded-2xl bg-[#d9fdd6] overflow-hidden shadow-inner p-1 border border-[#cdf2cb]">
                      <img class="w-full h-full object-cover rounded-xl" src="${card.img}" alt="${card.title}" />
                    </div>
                    <div class="w-full text-center">
                      <p class="text-base sm:text-lg font-extrabold text-[#0d631b]">${card.title}</p>
                      <p class="text-xs text-[#40493d]">${card.subtitle}</p>
                    </div>
                  </div>
                ` : `
                  <!-- Face Down Tactile Card -->
                  <div class="card-tactile relative flex flex-col items-center justify-center p-4 bg-[#cdf2cb] hover:bg-[#d3f8d0] rounded-3xl shadow-[0_6px_0_#1b6d24] border border-[#bfcaba] min-h-[200px] sm:min-h-[240px] group">
                    <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/90 flex flex-col items-center justify-center text-[#0d631b] shadow-sm group-hover:scale-105 transition-transform border border-[#d9fdd6]">
                      <span class="material-symbols-outlined text-4xl sm:text-5xl">${card.icon}</span>
                      <span class="text-[11px] font-bold text-[#40493d] mt-1">Tap to Open</span>
                    </div>
                    <span class="mt-3 text-xs sm:text-sm font-bold text-[#032109]">Card ${idx + 1}</span>
                  </div>
                `}
              </div>
            `).join('')}
          </div>

          <!-- Victory & Praise Banner -->
          <div class="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] text-center space-y-3">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs sm:text-sm font-bold">
              <span class="material-symbols-outlined text-lg">celebration</span>
              <span>Aadarna Joy · You matched the morning tea pair!</span>
            </div>
            <p class="text-sm sm:text-base text-[#40493d]">
              Gentle mental exercise stimulates happy memories and clarity.
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button 
                class="btn-tactile btn-primary px-6 py-3 rounded-full text-sm sm:text-base font-bold shadow-md" 
                id="game-replay-btn" 
                type="button"
              >
                <span class="material-symbols-outlined mr-1">replay</span>
                <span>Shuffle & Play Next Round</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;

  // Attach event handlers
  setTimeout(() => {
    document.getElementById('game-back-home-btn')?.addEventListener('click', () => onNavigate('elder-dashboard'));

    let flippedIndices = [];
    const cardSlots = document.querySelectorAll('.game-card-slot');

    cardSlots.forEach(slot => {
      slot.addEventListener('click', () => {
        const idx = parseInt(slot.dataset.index, 10);
        const card = cards[idx];

        if (card.matched || card.flipped) return;

        // Flip this card
        card.flipped = true;
        flippedIndices.push(idx);

        // Play gentle audio click
        showToast(`Tapped card ${idx + 1}: ${card.title}`, 'info', 2000);
        speakText(card.title);

        // Re-render board
        renderBoard();

        if (flippedIndices.length === 2) {
          const firstCard = cards[flippedIndices[0]];
          const secondCard = cards[flippedIndices[1]];

          if (firstCard.pairId === secondCard.pairId) {
            // Match found!
            firstCard.matched = true;
            secondCard.matched = true;
            flippedIndices = [];
            dataStore.incrementGamesCount();
            const patientHonorific = dataStore.state.patient?.honorific || (dataStore.state.patient?.name ? `${dataStore.state.patient.name.split(' ')[0]} ji` : 'Asha ji');
            showToast('🎉 Wonderful! You found the matching pair!', 'success', 4000);
            speakText(`Wonderful ${patientHonorific}! You matched ${firstCard.title}!`);
            setTimeout(renderBoard, 300);
          } else {
            // No match, turn back over after a pause
            setTimeout(() => {
              firstCard.flipped = false;
              secondCard.flipped = false;
              flippedIndices = [];
              renderBoard();
            }, 1400);
          }
        }
      });
    });

    function renderBoard() {
      const board = document.getElementById('game-board');
      if (!board) return;
      board.innerHTML = cards.map((card, idx) => `
        <div 
          class="game-card-slot cursor-pointer select-none transition-transform active:scale-[0.98]" 
          data-index="${idx}"
        >
          ${card.flipped || card.matched ? `
            <div class="card-tactile relative flex flex-col items-center justify-between p-4 bg-white rounded-3xl shadow-[0_6px_0_#2e7d32] border border-[#cdf2cb] min-h-[200px] sm:min-h-[240px]">
              <div class="w-full flex items-center justify-between">
                <span class="text-xs ${card.matched ? 'bg-[#a3f69c] text-[#002204]' : 'bg-[#ffdeaa] text-[#724f00]'} font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">${card.matched ? 'check_circle' : 'visibility'}</span> ${card.matched ? 'Matched' : 'Open'}
                </span>
                <span class="material-symbols-outlined text-[#0d631b] text-xl">favorite</span>
              </div>
              <div class="w-24 h-24 sm:w-28 sm:h-28 my-auto flex items-center justify-center rounded-2xl bg-[#d9fdd6] overflow-hidden shadow-inner p-1 border border-[#cdf2cb]">
                <img class="w-full h-full object-cover rounded-xl" src="${card.img}" alt="${card.title}" />
              </div>
              <div class="w-full text-center">
                <p class="text-base sm:text-lg font-extrabold text-[#0d631b]">${card.title}</p>
                <p class="text-xs text-[#40493d]">${card.subtitle}</p>
              </div>
            </div>
          ` : `
            <div class="card-tactile relative flex flex-col items-center justify-center p-4 bg-[#cdf2cb] hover:bg-[#d3f8d0] rounded-3xl shadow-[0_6px_0_#1b6d24] border border-[#bfcaba] min-h-[200px] sm:min-h-[240px] group">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/90 flex flex-col items-center justify-center text-[#0d631b] shadow-sm group-hover:scale-105 transition-transform border border-[#d9fdd6]">
                <span class="material-symbols-outlined text-4xl sm:text-5xl">${card.icon}</span>
                <span class="text-[11px] font-bold text-[#40493d] mt-1">Tap to Open</span>
              </div>
              <span class="mt-3 text-xs sm:text-sm font-bold text-[#032109]">Card ${idx + 1}</span>
            </div>
          `}
        </div>
      `).join('');

      // Rebind click listeners to new slots
      const newSlots = document.querySelectorAll('.game-card-slot');
      newSlots.forEach(s => {
        s.addEventListener('click', () => {
          const i = parseInt(s.dataset.index, 10);
          const c = cards[i];
          if (c.matched || c.flipped) return;
          c.flipped = true;
          flippedIndices.push(i);
          speakText(c.title);
          renderBoard();

          if (flippedIndices.length === 2) {
            const c1 = cards[flippedIndices[0]];
            const c2 = cards[flippedIndices[1]];
            if (c1.pairId === c2.pairId) {
              c1.matched = true;
              c2.matched = true;
              flippedIndices = [];
              dataStore.incrementGamesCount();
              const patientHonorific = dataStore.state.patient?.honorific || (dataStore.state.patient?.name ? `${dataStore.state.patient.name.split(' ')[0]} ji` : 'Asha ji');
              showToast('🎉 Pair matched! Beautifully done!', 'success');
              speakText(`Beautifully done ${patientHonorific}!`);
              setTimeout(renderBoard, 300);
            } else {
              setTimeout(() => {
                c1.flipped = false;
                c2.flipped = false;
                flippedIndices = [];
                renderBoard();
              }, 1400);
            }
          }
        });
      });
    }

    document.getElementById('game-replay-btn')?.addEventListener('click', () => {
      cards.forEach(c => { c.flipped = false; c.matched = false; });
      cards.sort(() => Math.random() - 0.5);
      renderBoard();
      showToast('Game board shuffled! Pick any card to begin.', 'info');
      speakText('Game board shuffled. Please choose any card to begin.');
    });
  }, 0);

  return html;
}
