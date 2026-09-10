import { renderNavbar } from '../components/Navbar.js';
import { dataStore } from '../services/dataStore.js';
import { speakText } from '../utils/speech.js';
import { showToast } from '../utils/toast.js';

export function renderMemoryMatchGame(onNavigate) {
  const FULL_ITEMS_POOL = [
    { pairId: 'apple', title: 'Fresh Apple 🍎', subtitle: 'Sweet Red Fruit', img: '/game-items/apple.jpeg', icon: 'nutrition' },
    { pairId: 'balloon', title: 'Colorful Balloon 🎈', subtitle: 'Floating Joy', img: '/game-items/balloon.jpeg', icon: 'celebration' },
    { pairId: 'car', title: 'Classic Car 🚗', subtitle: 'Smooth Drive', img: '/game-items/car.jpeg', icon: 'directions_car' },
    { pairId: 'cat', title: 'Gentle Cat 🐱', subtitle: 'Soft Warm Nap', img: '/game-items/Cat.webp', icon: 'pets' },
    { pairId: 'heart', title: 'Caring Heart ❤️', subtitle: 'Love & Warmth', img: '/game-items/heart.jpeg', icon: 'favorite' },
    { pairId: 'horse', title: 'Noble Horse 🐴', subtitle: 'Gentle Companion', img: '/game-items/horse.jpeg', icon: 'cruelty_free' },
    { pairId: 'key', title: 'Golden Key 🔑', subtitle: 'Safe & Secure', img: '/game-items/key.jpeg', icon: 'key' },
    { pairId: 'kite', title: 'Flying Kite 🪁', subtitle: 'High Blue Skies', img: '/game-items/kite.jpeg', icon: 'toys' },
    { pairId: 'spade', title: 'Garden Spade ♠️', subtitle: 'Rich Blossom Soil', img: '/game-items/spade.jpeg', icon: 'handyman' },
    { pairId: 'tree', title: 'Green Tree 🌳', subtitle: 'Peaceful Shade', img: '/game-items/tree.jpeg', icon: 'park' },
    { pairId: 'umbrella', title: 'Bright Umbrella ☂️', subtitle: 'Gentle Rain Shelter', img: '/game-items/umbrella.jpeg', icon: 'umbrella' },
  ];

  const generateRandomRoundCards = () => {
    const poolCopy = [...FULL_ITEMS_POOL].sort(() => Math.random() - 0.5);
    const chosen3 = poolCopy.slice(0, 3);
    const pairs = [
      { ...chosen3[0] },
      { ...chosen3[0] },
      { ...chosen3[1] },
      { ...chosen3[1] },
      { ...chosen3[2] },
      { ...chosen3[2] },
    ];
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    return shuffled.map((c, i) => ({
      id: i,
      ...c,
      matched: false,
      flipped: false,
    }));
  };

  let cards = generateRandomRoundCards();
  let flippedIndices = [];
  let moves = 0;
  let roundCompleted = false;
  let isTimedOut = false;
  let timeLeft = 60;
  let timerInterval = null;
  let isTimerRunning = false;
  let isRecording = false;

  // Real-time session state
  const ga = dataStore.getGameAnalytics ? dataStore.getGameAnalytics() : { todaySessions: 0, todayScore: 0 };
  let todaySessions = Number(ga.todaySessions) || 0;
  let todayScore = Number(ga.todayScore) || 0;

  let elderId = null;
  let caregiverEmail = null;
  try {
    const u = JSON.parse(localStorage.getItem('sahara_active_user') || 'null');
    if (u?.role === 'elder') {
      elderId = u.phone || u.id || u.email;
      caregiverEmail = u.caregiverEmail || u.caregiver;
    } else if (u?.role === 'caregiver') {
      elderId = u.linkedElder?.phone || u.linkedElder?.id || u.linkedElder?.email;
      caregiverEmail = u.email;
    }
  } catch (e) {}

  if (!elderId) {
    const p = dataStore.getPatient ? dataStore.getPatient() : dataStore.state?.patient;
    elderId = p?.phone || p?.id || p?.email || '+919854012345';
    caregiverEmail = caregiverEmail || p?.caregiverEmail || 'prayasdey10@gmail.com';
  }

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const isDailyCapReached = () => todaySessions >= 5;

  const html = `
    <div class="min-h-screen bg-[#ebffe7] text-[#032109]">
      ${renderNavbar('elder-dashboard', onNavigate)}

      <main class="w-full pt-24 pb-28">
        <div class="max-w-[48rem] mx-auto w-full px-4 sm:px-6 flex flex-col gap-6">
          
          <!-- Top Navigation & Live Session Status Bar -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl shadow-sm border border-[#cdf2cb]">
            <button 
              id="game-back-home-btn"
              class="inline-flex items-center gap-2 font-bold text-sm sm:text-base text-[#0d631b] hover:text-[#032109] transition-colors py-1.5 px-2 rounded-lg cursor-pointer" 
              type="button"
            >
              <span class="material-symbols-outlined text-2xl font-bold">arrow_back</span>
              <span>Back to Home</span>
            </button>
            <div class="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
              <div class="flex items-center gap-2 bg-[#ebffe7] px-3.5 py-1.5 rounded-full border border-[#cdf2cb]">
                <span class="material-symbols-outlined text-[#0d631b] text-sm">today</span>
                <span id="session-badge-text" class="text-xs sm:text-sm font-extrabold text-[#032109]">
                  ${todaySessions >= 5 ? '5/5 Sessions (Done)' : `Session ${todaySessions + 1} of 5`}
                </span>
              </div>
              <div class="flex items-center gap-1.5 bg-[#d9fdd6] px-3.5 py-1.5 rounded-full border border-[#cdf2cb]">
                <span class="material-symbols-outlined text-[#006e1c] text-sm">stars</span>
                <span id="score-badge-text" class="text-xs sm:text-sm font-extrabold text-[#006e1c]">
                  ${todayScore} / 250 pts
                </span>
              </div>
            </div>
          </div>

          <!-- 1-Minute Active Countdown Timer Bar -->
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#cdf2cb] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div id="timer-icon-box" class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm bg-[#d9fdd6] text-[#0d631b] transition-colors">
                <span class="material-symbols-outlined text-2xl">timer</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black uppercase tracking-wider text-[#0d631b]">1-Minute Session Timer</span>
                  <span id="timer-active-badge" class="hidden text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p id="timer-countdown-text" class="text-lg sm:text-xl font-black text-[#032109] tracking-tight">
                  0:60 <span class="text-xs text-[#40493d] font-bold ml-1.5">seconds remaining</span>
                </p>
              </div>
            </div>

            <!-- Timer Progress Track -->
            <div class="w-full sm:w-48 flex flex-col gap-1">
              <div class="w-full bg-[#ebffe7] h-3 rounded-full overflow-hidden border border-[#cdf2cb]">
                <div id="timer-progress-bar" style="width: 100%;" class="h-full bg-[#0d631b] transition-all duration-1000"></div>
              </div>
              <div class="flex justify-between text-[10px] font-bold text-[#40493d]">
                <span>0s</span>
                <span>Fixed 50 pts on win</span>
                <span>60s</span>
              </div>
            </div>
          </div>

          <!-- Daily Cap Banner (When 5/5 reached) -->
          <div id="daily-cap-banner" class="${todaySessions >= 5 ? 'block' : 'hidden'} card-tactile bg-gradient-to-r from-[#d9fdd6] to-[#ebffe7] rounded-3xl p-6 sm:p-8 shadow-md border-2 border-[#0d631b] text-center space-y-3">
            <div class="w-16 h-16 rounded-2xl bg-[#0d631b] text-white flex items-center justify-center mx-auto shadow-md">
              <span class="material-symbols-outlined text-3xl">celebration</span>
            </div>
            <span class="px-3.5 py-1 rounded-full bg-[#cdf2cb] text-[#006e1c] text-xs font-black uppercase tracking-wider">
              Daily Goal Achieved (5/5 Sessions)
            </span>
            <h2 class="text-xl sm:text-2xl font-black text-[#032109]">
              Daily limit reached (5/5 sessions completed today). Rest well!
            </h2>
            <p class="text-sm text-[#40493d] max-w-md mx-auto">
              You scored a maximum of <strong>${todayScore} Points</strong> today! Gentle mental exercises are complete for today.
            </p>
            <div class="pt-2 flex justify-center">
              <button 
                id="cap-back-home-btn"
                type="button" 
                class="btn-tactile btn-primary px-8 py-3.5 rounded-full text-sm sm:text-base font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-xl">home</span>
                <span>Back to Elder Home</span>
              </button>
            </div>
          </div>

          <!-- Graceful Time's Up Banner (When 60s expires) -->
          <div id="timeout-banner" class="hidden card-tactile bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-300 text-center space-y-3">
            <div class="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
              <span class="material-symbols-outlined text-3xl">hourglass_bottom</span>
            </div>
            <span class="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
              60-Second Timer Ended
            </span>
            <h2 class="text-xl sm:text-2xl font-black text-[#032109]">
              Time's up!
            </h2>
            <p class="text-sm text-[#40493d] max-w-md mx-auto">
              Take a gentle breath and relax. No points are awarded for incomplete rounds. You can start a fresh session whenever you feel ready!
            </p>
            <div class="pt-2 flex flex-wrap justify-center gap-3">
              <button 
                id="timeout-retry-btn"
                type="button" 
                class="btn-tactile btn-primary px-6 py-3 rounded-full text-sm font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-xl">replay</span>
                <span>Try Again (1-Minute Timer)</span>
              </button>
              <button 
                id="timeout-home-btn"
                type="button" 
                class="btn-tactile bg-white hover:bg-gray-50 text-[#40493d] border border-gray-300 px-6 py-3 rounded-full text-sm font-bold shadow-sm cursor-pointer flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-xl">home</span>
                <span>Back to Home</span>
              </button>
            </div>
          </div>

          <!-- Title & Dignified Reassurance -->
          <div id="game-title-header" class="${todaySessions >= 5 ? 'hidden' : 'flex'} flex-col items-center text-center gap-1.5">
            <div class="inline-flex items-center gap-2 bg-[#cdf2cb] text-[#0d631b] px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm">
              <span class="material-symbols-outlined text-base">verified</span>
              <span id="header-session-text">Session ${todaySessions + 1} of 5 · Match all 3 pairs in 60s for 50 Points</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#032109] tracking-tight">
              Memory Match
            </h1>
            <p class="text-xs sm:text-sm text-[#40493d] max-w-xl">
              Tap any card to reveal its image and start the 60-second countdown. Match all 3 pairs to earn +50 points!
            </p>
          </div>

          <!-- Tactile Memory Game Board: 6 Large Tactile Blocks -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6" id="game-board">
            <!-- Board rendered dynamically -->
          </div>

          <!-- Victory & Praise Banner -->
          <div id="victory-banner" class="hidden card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-[#0d631b] text-center space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-[#0d631b] text-white flex items-center justify-center mx-auto shadow-md">
              <span class="material-symbols-outlined text-3xl">celebration</span>
            </div>
            <div class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d9fdd6] text-[#006e1c] text-sm sm:text-base font-extrabold border border-[#cdf2cb] shadow-sm">
              <span class="material-symbols-outlined text-xl">stars</span>
              <span>🌟 Session Complete! +50 Points Awarded!</span>
            </div>
            <div class="space-y-1">
              <p class="text-lg font-black text-[#032109]">
                Today's Score: <span id="victory-score-text" class="text-[#0d631b]">${todayScore} Points</span>
              </p>
              <p id="victory-detail-text" class="text-xs sm:text-sm text-[#40493d]">
                Session complete!
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button 
                class="btn-tactile btn-primary px-7 py-3.5 rounded-full text-sm sm:text-base font-bold shadow-md cursor-pointer flex items-center gap-2" 
                id="game-next-session-btn" 
                type="button"
              >
                <span class="material-symbols-outlined text-xl">play_arrow</span>
                <span>Play Next Session →</span>
              </button>
              <button 
                class="btn-tactile bg-white text-[#0d631b] border border-[#cdf2cb] px-6 py-3.5 rounded-full text-sm sm:text-base font-bold shadow-sm cursor-pointer hover:bg-[#ebffe7]" 
                id="victory-home-btn" 
                type="button"
              >
                Back to Home
              </button>
            </div>
          </div>

          <!-- Manual Start Button Before First Tap -->
          <div id="manual-start-box" class="${todaySessions >= 5 ? 'hidden' : 'flex'} justify-center pt-1">
            <button 
              id="manual-start-btn" 
              type="button" 
              class="btn-tactile btn-primary flex items-center gap-2 px-8 py-3.5 rounded-full text-sm sm:text-base font-bold shadow-md cursor-pointer"
            >
              <span class="material-symbols-outlined text-xl">timer</span>
              <span>Start 1-Minute Round (Session ${todaySessions + 1} of 5)</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  `;

  // Attach event handlers
  setTimeout(() => {
    // 1. Listen to Firestore dailyLogs for real-time initial session count
    import('../lib/firebaseClient.js').then(({ db, normalizeElderId }) => {
      if (db && elderId) {
        import('firebase/firestore').then(({ doc, onSnapshot }) => {
          const cleanElderId = normalizeElderId(elderId);
          const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
          onSnapshot(dailyLogRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data() || {};
              todaySessions = typeof data.todaySessions === 'number'
                ? data.todaySessions
                : (typeof data.completedSessions === 'number'
                    ? data.completedSessions
                    : (Array.isArray(data.sessionsHistory)
                        ? data.sessionsHistory.filter(s => Number(s.pointsEarned) > 0).length
                        : 0));
              todayScore = typeof data.todayScore === 'number'
                ? data.todayScore
                : (typeof data.totalScore === 'number' ? data.totalScore : todaySessions * 50);

              updateBadges();
            }
          });
        });
      }
    });

    const updateBadges = () => {
      const sessBadge = document.getElementById('session-badge-text');
      const scoreBadge = document.getElementById('score-badge-text');
      const capBanner = document.getElementById('daily-cap-banner');
      const titleHeader = document.getElementById('game-title-header');
      const manualStart = document.getElementById('manual-start-box');

      if (sessBadge) sessBadge.innerText = todaySessions >= 5 ? '5/5 Sessions (Done)' : `Session ${todaySessions + 1} of 5`;
      if (scoreBadge) scoreBadge.innerText = `${todayScore} / 250 pts`;

      if (todaySessions >= 5) {
        if (capBanner) capBanner.classList.remove('hidden');
        if (titleHeader) titleHeader.classList.add('hidden');
        if (manualStart) manualStart.classList.add('hidden');
        stopTimer();
      }
    };

    const stopTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      isTimerRunning = false;
      const activeBadge = document.getElementById('timer-active-badge');
      if (activeBadge) activeBadge.classList.add('hidden');
    };

    const startTimer = () => {
      if (isTimerRunning || roundCompleted || isTimedOut || todaySessions >= 5) return;
      isTimerRunning = true;
      const activeBadge = document.getElementById('timer-active-badge');
      const iconBox = document.getElementById('timer-icon-box');
      const manualStart = document.getElementById('manual-start-box');
      if (activeBadge) activeBadge.classList.remove('hidden');
      if (iconBox) {
        iconBox.classList.remove('bg-[#d9fdd6]', 'text-[#0d631b]');
        iconBox.classList.add('bg-[#0d631b]', 'text-white');
      }
      if (manualStart) manualStart.classList.add('hidden');

      timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
          stopTimer();
          handleTimeout();
        }
      }, 1000);
    };

    const updateTimerDisplay = () => {
      const countdownText = document.getElementById('timer-countdown-text');
      const progressBar = document.getElementById('timer-progress-bar');
      const iconBox = document.getElementById('timer-icon-box');

      if (countdownText) {
        countdownText.innerHTML = `0:${timeLeft < 10 ? '0' : ''}${timeLeft} <span class="text-xs text-[#40493d] font-bold ml-1.5">seconds remaining</span>`;
      }
      if (progressBar) {
        progressBar.style.width = `${Math.round((timeLeft / 60) * 100)}%`;
        if (timeLeft <= 10) {
          progressBar.className = 'h-full bg-red-500 transition-all duration-1000';
          if (iconBox) {
            iconBox.className = 'w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm bg-red-600 text-white animate-pulse transition-colors';
          }
        } else if (timeLeft <= 20) {
          progressBar.className = 'h-full bg-amber-500 transition-all duration-1000';
          if (iconBox) {
            iconBox.className = 'w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm bg-amber-500 text-white transition-colors';
          }
        } else {
          progressBar.className = 'h-full bg-[#0d631b] transition-all duration-1000';
        }
      }
    };

    const handleTimeout = () => {
      isTimedOut = true;
      const timeoutBanner = document.getElementById('timeout-banner');
      if (timeoutBanner) timeoutBanner.classList.remove('hidden');

      speakText("Time's up! Round ended. Take a gentle breath.");
      showToast("⏰ Time's up! No points awarded for incomplete round.", "info", 5000);

      const matchedPairsCount = Math.floor(cards.filter(c => c.matched).length / 2);
      const accuracy = Math.round((matchedPairsCount / 3) * 100);

      // Record incomplete session in Firestore (0 points, reduces cognitive score percentage)
      import('../lib/firebaseClient.js').then(({ db, normalizeElderId }) => {
        if (db && elderId) {
          import('firebase/firestore').then(({ doc, setDoc, serverTimestamp, arrayUnion }) => {
            const cleanElderId = normalizeElderId(elderId);
            const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
            const sessionEntry = {
              sessionNumber: Math.min(5, todaySessions + 1),
              pointsEarned: 0,
              completedAt: new Date().toISOString(),
              remainingTimeSeconds: 0,
              status: 'timed_out',
              accuracy,
            };
            setDoc(dailyLogRef, {
              lastPlayedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              sessionsHistory: arrayUnion(sessionEntry),
              gamesHistory: arrayUnion(sessionEntry),
            }, { merge: true }).catch(() => {});
          });
        }
      });

      dataStore.recordGameScore?.({
        score: 0,
        moves,
        matchedPairs: matchedPairsCount,
        accuracy,
        durationSeconds: 60,
        date: todayDate,
        elderId,
        caregiverEmail,
        status: 'Timed Out',
        skipServerPersist: true,
      });

      renderBoard();
    };

    const renderBoard = () => {
      const board = document.getElementById('game-board');
      if (!board) return;

      board.innerHTML = cards.map((card, idx) => `
        <div 
          class="game-card-slot select-none transition-transform ${
            card.matched || card.flipped || isTimedOut || roundCompleted || todaySessions >= 5
              ? 'cursor-default opacity-90'
              : 'cursor-pointer active:scale-[0.98]'
          }" 
          data-index="${idx}"
        >
          ${card.flipped || card.matched ? `
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
            <div class="card-tactile relative flex flex-col items-center justify-center p-4 bg-[#cdf2cb] hover:bg-[#d3f8d0] rounded-3xl shadow-[0_6px_0_#1b6d24] border border-[#bfcaba] min-h-[200px] sm:min-h-[240px] group">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/90 flex flex-col items-center justify-center text-[#0d631b] shadow-sm group-hover:scale-105 transition-transform border border-[#d9fdd6]">
                <span class="material-symbols-outlined text-3xl sm:text-4xl text-[#0d631b]">touch_app</span>
                <span class="text-[11px] font-bold text-[#40493d] mt-1">Tap to Open</span>
              </div>
              <span class="mt-3 text-xs sm:text-sm font-bold text-[#032109]">Card ${idx + 1}</span>
            </div>
          `}
        </div>
      `).join('');

      // Re-attach card click listeners
      attachCardListeners();
    };

    const attachCardListeners = () => {
      document.querySelectorAll('.game-card-slot').forEach(slot => {
        slot.addEventListener('click', () => {
          if (todaySessions >= 5 || isTimedOut || roundCompleted) return;

          const idx = parseInt(slot.dataset.index, 10);
          const card = cards[idx];
          if (card.matched || card.flipped || flippedIndices.length >= 2) return;

          // Start timer on first tap
          if (!isTimerRunning && timeLeft === 60) {
            startTimer();
          }

          card.flipped = true;
          flippedIndices.push(idx);
          showToast(`Tapped: ${card.title}`, 'info', 1200);
          speakText(card.title);
          renderBoard();

          if (flippedIndices.length === 2) {
            moves++;
            const firstCard = cards[flippedIndices[0]];
            const secondCard = cards[flippedIndices[1]];

            if (firstCard.pairId === secondCard.pairId) {
              firstCard.matched = true;
              secondCard.matched = true;
              flippedIndices = [];
              showToast('🎉 Wonderful! Matching pair found!', 'success', 2500);
              speakText(`Wonderful! You matched ${firstCard.title}!`);
              setTimeout(renderBoard, 300);

              // Check if all 3 pairs matched
              if (cards.every(c => c.matched)) {
                if (isRecording) return;
                isRecording = true;
                stopTimer();

                const remainingSec = timeLeft;
                roundCompleted = true;
                const nextSessionNum = Math.min(5, todaySessions + 1);
                const nextScore = Math.min(250, todayScore + 50);

                todaySessions = nextSessionNum;
                todayScore = nextScore;
                updateBadges();

                // Show victory card
                const victoryBanner = document.getElementById('victory-banner');
                const victoryScoreText = document.getElementById('victory-score-text');
                const victoryDetailText = document.getElementById('victory-detail-text');
                const nextSessionBtn = document.getElementById('game-next-session-btn');

                if (victoryBanner) victoryBanner.classList.remove('hidden');
                if (victoryScoreText) victoryScoreText.innerText = `${todayScore} Points`;
                if (victoryDetailText) {
                  victoryDetailText.innerHTML = `Finished with <strong>${remainingSec}s</strong> remaining on the clock! (Session ${todaySessions} of 5 completed)`;
                }
                if (nextSessionBtn) {
                  if (todaySessions >= 5) {
                    nextSessionBtn.classList.add('hidden');
                  } else {
                    nextSessionBtn.classList.remove('hidden');
                    nextSessionBtn.innerText = `Play Session ${todaySessions + 1} of 5 →`;
                  }
                }

                // 1. Atomic Firestore mutation (+50 pts)
                import('../lib/firebaseClient.js').then(({ db, normalizeElderId }) => {
                  if (db && elderId) {
                    import('firebase/firestore').then(({ doc, setDoc, increment, serverTimestamp, arrayUnion }) => {
                      const cleanElderId = normalizeElderId(elderId);
                      const dailyLogRef = doc(db, 'elders', cleanElderId, 'dailyLogs', todayDate);
                      const elderRef = doc(db, 'elders', cleanElderId);

                      const sessionEntry = {
                        sessionNumber: nextSessionNum,
                        pointsEarned: 50,
                        completedAt: new Date().toISOString(),
                        remainingTimeSeconds: remainingSec,
                        status: 'completed',
                        accuracy: 100,
                      };

                      setDoc(dailyLogRef, {
                        todaySessions: increment(1),
                        todayScore: increment(50),
                        completedSessions: increment(1),
                        totalScore: increment(50),
                        gameSessions: increment(1),
                        gameScore: increment(50),
                        lastGameScore: 50,
                        lastPlayedAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        sessionsHistory: arrayUnion(sessionEntry),
                        gamesHistory: arrayUnion(sessionEntry),
                      }, { merge: true }).catch(() => {});

                      setDoc(elderRef, {
                        id: cleanElderId,
                        todayGameScore: increment(50),
                        todayGameSessions: increment(1),
                        lastGameScore: 50,
                        lastGameAt: new Date().toISOString(),
                        lastActive: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                      }, { merge: true }).catch(() => {});
                    });
                  }
                });

                // 2. Update local dataStore
                dataStore.incrementGamesCount?.();
                dataStore.recordGameScore?.({
                  score: 50,
                  pointsEarned: 50,
                  sessionNumber: nextSessionNum,
                  moves,
                  matchedPairs: 3,
                  accuracy: 100,
                  durationSeconds: 60 - remainingSec,
                  remainingTimeSeconds: remainingSec,
                  date: todayDate,
                  elderId,
                  caregiverEmail,
                  status: 'Completed (+50 pts)',
                  skipServerPersist: true,
                });

                // 3. Persist to server API
                fetch('/api/game-scores', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    elderId,
                    caregiverEmail,
                    score: 50,
                    pointsEarned: 50,
                    sessionNumber: nextSessionNum,
                    moves,
                    matchedPairs: 3,
                    accuracy: 100,
                    durationSeconds: 60 - remainingSec,
                    remainingTimeSeconds: remainingSec,
                    status: 'Completed (+50 pts)',
                    date: todayDate,
                  }),
                }).catch(() => {});

                showToast(`🌟 Round Complete! +50 Points Earned! (Session ${nextSessionNum}/5)`, 'success', 5000);
                speakText('Round Complete! You earned 50 points!');
              }
            } else {
              setTimeout(() => {
                firstCard.flipped = false;
                secondCard.flipped = false;
                flippedIndices = [];
                renderBoard();
              }, 1100);
            }
          }
        });
      });
    };

    const resetRound = () => {
      if (todaySessions >= 5) {
        showToast('Daily limit reached (5/5 sessions completed today). Rest well!', 'info', 4000);
        return;
      }
      isRecording = false;
      cards = generateRandomRoundCards();
      flippedIndices = [];
      moves = 0;
      roundCompleted = false;
      isTimedOut = false;
      timeLeft = 60;
      stopTimer();

      const victoryBanner = document.getElementById('victory-banner');
      const timeoutBanner = document.getElementById('timeout-banner');
      if (victoryBanner) victoryBanner.classList.add('hidden');
      if (timeoutBanner) timeoutBanner.classList.add('hidden');

      updateTimerDisplay();
      renderBoard();
      startTimer();
      showToast(`⏱️ 1-Minute Round Started! Session ${todaySessions + 1} of 5.`, 'info', 3000);
    };

    // Button event listeners
    document.getElementById('game-back-home-btn')?.addEventListener('click', () => {
      stopTimer();
      onNavigate('elder-dashboard');
    });
    document.getElementById('cap-back-home-btn')?.addEventListener('click', () => {
      stopTimer();
      onNavigate('elder-dashboard');
    });
    document.getElementById('victory-home-btn')?.addEventListener('click', () => {
      stopTimer();
      onNavigate('elder-dashboard');
    });
    document.getElementById('timeout-home-btn')?.addEventListener('click', () => {
      stopTimer();
      onNavigate('elder-dashboard');
    });

    document.getElementById('manual-start-btn')?.addEventListener('click', () => {
      resetRound();
    });
    document.getElementById('game-next-session-btn')?.addEventListener('click', () => {
      resetRound();
    });
    document.getElementById('timeout-retry-btn')?.addEventListener('click', () => {
      resetRound();
    });

    renderBoard();
  }, 0);

  return html;
}
