'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar.jsx';
import { dataStore } from '../../services/dataStore.js';
import { useTranslation } from '../../utils/i18n.js';
import { speakText } from '../../utils/speech.js';
import { showToast } from '../../components/Toast.jsx';

export default function MemoryMatchGamePage() {
  const router = useRouter();
  const { t, lang } = useTranslation();

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

  // Randomly pick 3 distinct items from pool and duplicate into 6 cards, then shuffle
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

  const [cards, setCards] = useState(() => generateRandomRoundCards());
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [lastScoreEarned, setLastScoreEarned] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const shufflePool = () => {
    return generateRandomRoundCards();
  };

  const handleCardClick = (idx) => {
    const card = cards[idx];
    if (card.matched || card.flipped || flippedIndices.length >= 2) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);
    showToast(`Tapped: ${card.title}`, 'info', 1500);
    speakText(card.title);

    if (newFlipped.length === 2) {
      const updatedMoves = moves + 1;
      setMoves(updatedMoves);
      const first = newCards[newFlipped[0]];
      const second = newCards[newFlipped[1]];

      if (first.pairId === second.pairId) {
        first.matched = true;
        second.matched = true;
        setCards([...newCards]);
        setFlippedIndices([]);
        
        // Check if all cards are matched
        const allMatched = newCards.every((c) => c.matched);
        if (allMatched) {
          const duration = startTime ? Math.max(10, Math.round((Date.now() - startTime) / 1000)) : 30;
          const accuracy = Math.min(100, Math.round((3 / Math.max(3, updatedMoves)) * 100));
          const score = Math.max(120, 300 - Math.max(0, updatedMoves - 3) * 25);
          
          setLastScoreEarned(score);
          setRoundCompleted(true);

          dataStore.incrementGamesCount?.();
          dataStore.recordGameScore?.({
            score,
            moves: updatedMoves,
            matchedPairs: 3,
            accuracy,
            durationSeconds: duration,
          });

          showToast(`🌟 Round Complete! Score: ${score} pts (${accuracy}% Recall)`, 'success', 5000);
          speakText(`Round Complete! You scored ${score} points!`);
        } else {
          showToast(`🎉 Wonderful! You matched ${first.title}!`, 'success', 3000);
          speakText(`Wonderful! You matched ${first.title}!`);
        }
      } else {
        setTimeout(() => {
          first.flipped = false;
          second.flipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 1200);
      }
    }
  };

  const handleReplay = () => {
    const shuffled = shufflePool();
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setRoundCompleted(false);
    setStartTime(Date.now());
    showToast('✨ Shuffled with fresh layout! Have fun.', 'info', 2000);
  };

  return (
    <div className="min-h-screen bg-[#ebffe7] text-[#032109]">
      <Navbar activeView="elder" />

      <main className="w-full pt-24 pb-28">
        <div className="max-w-[48rem] mx-auto w-full px-4 sm:px-6 flex flex-col gap-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl shadow-sm border border-[#cdf2cb]">
            <button
              onClick={() => router.push('/elder-dashboard')}
              className="inline-flex items-center gap-2 font-bold text-sm sm:text-base text-[#0d631b] hover:text-[#032109] transition-colors py-1.5 px-2 rounded-lg cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-2xl font-bold">arrow_back</span>
              <span>{t.backToHome || 'Back to Home'}</span>
            </button>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex items-center gap-2 bg-[#d3f8d0] px-3.5 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[#006e1c] text-lg">spa</span>
                <span className="text-xs sm:text-sm font-semibold text-[#032109]">{t.paceGentle || 'Pace: Gentle & Free'}</span>
              </div>
            </div>
          </div>

          {/* Title & Guidance */}
          <div className="flex flex-col items-center text-center gap-2 mt-1">
            <div className="inline-flex items-center gap-2 bg-[#cdf2cb] text-[#0d631b] px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>{t.round1of3 || 'Round 1 of 3 · Take all the time you need'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032109] tracking-tight">
              {t.memoryMatchTitle || 'Memory Match'}
            </h1>
            <p className="text-sm sm:text-base text-[#40493d] max-w-xl">
              {t.memoryMatchSubtitle || 'Every gentle effort is a victory. Find the pictures that belong together.'}
            </p>
          </div>

          {/* Guidance Banner */}
          <div className="relative overflow-hidden bg-[#d9fdd6] rounded-2xl p-4 sm:p-5 shadow-sm border border-[#cdf2cb] flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2e7d32] text-white flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">touch_app</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-[#0d631b] uppercase tracking-wide">{t.easySteps || 'Easy Steps'}</span>
              <p className="text-sm sm:text-base font-bold text-[#032109] leading-snug">
                {t.easyStepsDesc || 'Find the two matching pictures. Tap any card to flip it over softly.'}
              </p>
            </div>
            <div className="hidden md:flex ml-auto shrink-0 items-center text-[#40493d] text-xs font-semibold gap-1">
              <span className="material-symbols-outlined text-[#006e1c]">self_improvement</span>
              <span>{t.noClock || 'No clock · No scoring'}</span>
            </div>
          </div>

          {/* 6 Tactile Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {cards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => handleCardClick(idx)}
                className="cursor-pointer select-none transition-transform active:scale-[0.98]"
              >
                {card.flipped || card.matched ? (
                  <div className="card-tactile relative flex flex-col items-center justify-between p-4 bg-white rounded-3xl shadow-[0_6px_0_#2e7d32] border border-[#cdf2cb] min-h-[200px] sm:min-h-[240px]">
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs bg-[#a3f69c] text-[#002204] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span> {t.matchedPill || 'Matched'}
                      </span>
                      <span className="material-symbols-outlined text-[#0d631b] text-xl">favorite</span>
                    </div>
                    <div className="w-24 h-24 sm:w-28 sm:h-28 my-auto flex items-center justify-center rounded-2xl bg-[#d9fdd6] overflow-hidden shadow-inner p-1 border border-[#cdf2cb]">
                      <img className="w-full h-full object-cover rounded-xl" src={card.img} alt={card.title} />
                    </div>
                    <div className="w-full text-center">
                      <p className="text-base sm:text-lg font-extrabold text-[#0d631b]">{card.title}</p>
                      <p className="text-xs text-[#40493d]">{card.subtitle}</p>
                    </div>
                  </div>
                ) : (
                  <div className="card-tactile relative flex flex-col items-center justify-center p-4 bg-[#cdf2cb] hover:bg-[#d3f8d0] rounded-3xl shadow-[0_6px_0_#1b6d24] border border-[#bfcaba] min-h-[200px] sm:min-h-[240px] group">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/90 flex flex-col items-center justify-center text-[#0d631b] shadow-sm group-hover:scale-105 transition-transform border border-[#d9fdd6]">
                      <span className="material-symbols-outlined text-4xl sm:text-5xl">{card.icon}</span>
                      <span className="text-[11px] font-bold text-[#40493d] mt-1">{t.tapToOpen || 'Tap to Open'}</span>
                    </div>
                    <span className="mt-3 text-xs sm:text-sm font-bold text-[#032109]">Card {idx + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Victory & Praise Banner */}
          <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#cdf2cb] text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d9fdd6] text-[#0c7521] text-xs sm:text-sm font-bold">
              <span className="material-symbols-outlined text-lg">celebration</span>
              <span>{t.memoryVictoryPraise || 'Aadarna Joy · You matched the morning tea pair!'}</span>
            </div>
            <p className="text-sm sm:text-base text-[#40493d]">
              {t.tagline || 'Gentle mental exercise stimulates happy memories and clarity.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleReplay}
                type="button"
                className="btn-tactile btn-primary px-6 py-3 rounded-full text-sm sm:text-base font-bold shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined mr-1">replay</span>
                <span>{t.shuffleNextRound || 'Shuffle & Play Next Round'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
