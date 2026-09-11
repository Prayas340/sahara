// -------------------------------------------------------------
// Sahara Cognitive Game Suite Question Bank & Sublevel Engine
// 50+ Curated Variations per Game Mode & 5 Progressive Sublevels
// -------------------------------------------------------------

import {
  COGNITIVE_LEVELS,
  LEVEL_1_CARDS_POOL,
  LEVEL_2_WORD_SEARCH_POOLS,
  LEVEL_3_CROSSWORD_POOLS,
  LEVEL_4_ANAGRAMS_POOL,
  LEVEL_5_WORD_WHEELS_POOL,
  LEVEL_6_PROVERBS_POOL,
  LEVEL_7_RHYMES_POOL,
  LEVEL_8_CATEGORIES_POOL,
  LEVEL_9_HANGMAN_POOL,
  LEVEL_10_CHALLENGES_POOL,
} from './gamesData.js';

// Re-export core level definitions and complete pools (50 items each)
export {
  COGNITIVE_LEVELS,
  LEVEL_1_CARDS_POOL,
  LEVEL_2_WORD_SEARCH_POOLS,
  LEVEL_3_CROSSWORD_POOLS,
  LEVEL_4_ANAGRAMS_POOL,
  LEVEL_5_WORD_WHEELS_POOL,
  LEVEL_6_PROVERBS_POOL,
  LEVEL_7_RHYMES_POOL,
  LEVEL_8_CATEGORIES_POOL,
  LEVEL_9_HANGMAN_POOL,
  LEVEL_10_CHALLENGES_POOL,
};

// -------------------------------------------------------------
// 5 PROGRESSIVE SUBLEVELS CONFIGURATIONS (Levels 1 through 10)
// Each Main Level has 5 Progressive Difficulty Stages (+10 pts each)
// -------------------------------------------------------------
export const SUBLEVEL_CONFIGS = {
  // Level 1: Memory Match
  1: [
    { subLevel: 1, name: 'Warm-up Pairs', timerSeconds: 60, pairsCount: 3, points: 10, difficulty: 'Gentle', desc: 'Match 3 familiar cards with relaxed pace.' },
    { subLevel: 2, name: 'Steady Pairs', timerSeconds: 55, pairsCount: 3, points: 10, difficulty: 'Easy', desc: 'Match 3 pairs with standard timer.' },
    { subLevel: 3, name: 'Expanded Recall', timerSeconds: 50, pairsCount: 4, points: 10, difficulty: 'Moderate', desc: 'Match 4 pairs of comforting everyday items.' },
    { subLevel: 4, name: 'Focus Challenge', timerSeconds: 45, pairsCount: 4, points: 10, difficulty: 'Advanced', desc: 'Match 4 pairs with swift visual recall.' },
    { subLevel: 5, name: 'Master Recall', timerSeconds: 40, pairsCount: 4, points: 10, difficulty: 'Mastery', desc: 'Capstone challenge! Complete to unlock Level 2.' },
  ],
  // Level 2: Word Search
  2: [
    { subLevel: 1, name: 'Gentle Search', timerSeconds: 60, wordsToFind: 2, points: 10, difficulty: 'Gentle', desc: 'Trace 2 highlighted comforting words.' },
    { subLevel: 2, name: 'Classic Search', timerSeconds: 55, wordsToFind: 3, points: 10, difficulty: 'Easy', desc: 'Find 3 themed hidden words in the grid.' },
    { subLevel: 3, name: 'Focused Scan', timerSeconds: 50, wordsToFind: 3, points: 10, difficulty: 'Moderate', desc: 'Find 3 hidden words with subtle grid contrast.' },
    { subLevel: 4, name: 'Speed Scanning', timerSeconds: 45, wordsToFind: 3, points: 10, difficulty: 'Advanced', desc: 'Discover 3 hidden words with quick visual scanning.' },
    { subLevel: 5, name: 'Grid Master', timerSeconds: 40, wordsToFind: 3, points: 10, difficulty: 'Mastery', desc: 'Find all 3 words swiftly to unlock Level 3.' },
  ],
  // Level 3: Quick Crossword
  3: [
    { subLevel: 1, name: 'Simple Clues', timerSeconds: 60, cluesCount: 2, points: 10, difficulty: 'Gentle', desc: 'Solve 2 direct, everyday dementia-friendly clues.' },
    { subLevel: 2, name: 'Everyday Words', timerSeconds: 55, cluesCount: 3, points: 10, difficulty: 'Easy', desc: 'Complete 3 familiar cross-clues.' },
    { subLevel: 3, name: 'Semantic Focus', timerSeconds: 50, cluesCount: 3, points: 10, difficulty: 'Moderate', desc: 'Solve 3 clues with partial letter assistance.' },
    { subLevel: 4, name: 'Memory Crossword', timerSeconds: 45, cluesCount: 3, points: 10, difficulty: 'Advanced', desc: 'Solve 3 clues under tighter timer.' },
    { subLevel: 5, name: 'Crossword Master', timerSeconds: 40, cluesCount: 3, points: 10, difficulty: 'Mastery', desc: 'Master all 3 crossword clues to unlock Level 4.' },
  ],
  // Level 4: Word Unscramble (Anagrams)
  4: [
    { subLevel: 1, name: '4-Letter Anagrams', timerSeconds: 60, wordsCount: 2, points: 10, difficulty: 'Gentle', desc: 'Unscramble 2 easy 4-letter words with clues.' },
    { subLevel: 2, name: 'Comforting Words', timerSeconds: 55, wordsCount: 3, points: 10, difficulty: 'Easy', desc: 'Rearrange letter tiles for 3 words.' },
    { subLevel: 3, name: '5-Letter Tiles', timerSeconds: 50, wordsCount: 3, points: 10, difficulty: 'Moderate', desc: 'Unscramble 3 five-letter words.' },
    { subLevel: 4, name: 'Executive Flow', timerSeconds: 45, wordsCount: 3, points: 10, difficulty: 'Advanced', desc: 'Quick letter rearrangement for 3 words.' },
    { subLevel: 5, name: 'Anagram Master', timerSeconds: 40, wordsCount: 3, points: 10, difficulty: 'Mastery', desc: 'Complete all 3 unscrambles to unlock Level 5.' },
  ],
  // Level 5: Word Wheel
  5: [
    { subLevel: 1, name: '2-Word Discovery', timerSeconds: 60, targetCount: 2, points: 10, difficulty: 'Gentle', desc: 'Build 2 valid words using the center letter.' },
    { subLevel: 2, name: '3-Word Wheel', timerSeconds: 55, targetCount: 3, points: 10, difficulty: 'Easy', desc: 'Construct 3 valid words around the hub.' },
    { subLevel: 3, name: 'Vocabulary Cluster', timerSeconds: 50, targetCount: 3, points: 10, difficulty: 'Moderate', desc: 'Discover 3 words with letter combinations.' },
    { subLevel: 4, name: 'Fluency Sprint', timerSeconds: 45, targetCount: 3, points: 10, difficulty: 'Advanced', desc: 'Find 3 valid words with active recall.' },
    { subLevel: 5, name: 'Wheel Master', timerSeconds: 40, targetCount: 3, points: 10, difficulty: 'Mastery', desc: 'Build 3 words swiftly to unlock Level 6.' },
  ],
  // Level 6: Fill-in-the-Blank Proverbs
  6: [
    { subLevel: 1, name: 'Familiar Sayings', timerSeconds: 60, proverbsCount: 2, points: 10, difficulty: 'Gentle', desc: 'Complete 2 timeless generational sayings.' },
    { subLevel: 2, name: 'Golden Proverbs', timerSeconds: 55, proverbsCount: 3, points: 10, difficulty: 'Easy', desc: 'Select the missing word for 3 proverbs.' },
    { subLevel: 3, name: 'Wisdom Recall', timerSeconds: 50, proverbsCount: 3, points: 10, difficulty: 'Moderate', desc: 'Complete 3 sayings with subtle choices.' },
    { subLevel: 4, name: 'Proverb Memory', timerSeconds: 45, proverbsCount: 3, points: 10, difficulty: 'Advanced', desc: 'Recall 3 phrases under focused timer.' },
    { subLevel: 5, name: 'Wisdom Master', timerSeconds: 40, proverbsCount: 3, points: 10, difficulty: 'Mastery', desc: 'Master all 3 proverbs to unlock Level 7.' },
  ],
  // Level 7: Rhyming Pairs
  7: [
    { subLevel: 1, name: 'Gentle Rhymes', timerSeconds: 60, rhymesCount: 2, points: 10, difficulty: 'Gentle', desc: 'Pair 2 words that share melodic sounds.' },
    { subLevel: 2, name: 'Auditory Rhymes', timerSeconds: 55, rhymesCount: 3, points: 10, difficulty: 'Easy', desc: 'Find 3 matching rhyming words.' },
    { subLevel: 3, name: 'Phonetic Match', timerSeconds: 50, rhymesCount: 3, points: 10, difficulty: 'Moderate', desc: 'Identify 3 rhymes with distinct vowels.' },
    { subLevel: 4, name: 'Aural Focus', timerSeconds: 45, rhymesCount: 3, points: 10, difficulty: 'Advanced', desc: 'Match 3 rhymes with quicker ear.' },
    { subLevel: 5, name: 'Rhyme Master', timerSeconds: 40, rhymesCount: 3, points: 10, difficulty: 'Mastery', desc: 'Complete 3 rhyming sets to unlock Level 8.' },
  ],
  // Level 8: Category Sorting
  8: [
    { subLevel: 1, name: '4-Item Grouping', timerSeconds: 60, itemsCount: 4, points: 10, difficulty: 'Gentle', desc: 'Sort 4 items into 2 natural categories.' },
    { subLevel: 2, name: '6-Item Sorting', timerSeconds: 55, itemsCount: 6, points: 10, difficulty: 'Easy', desc: 'Classify 6 everyday objects.' },
    { subLevel: 3, name: 'Abstract Sorting', timerSeconds: 50, itemsCount: 6, points: 10, difficulty: 'Moderate', desc: 'Group 6 items with distinct categories.' },
    { subLevel: 4, name: 'Speed Taxonomy', timerSeconds: 45, itemsCount: 6, points: 10, difficulty: 'Advanced', desc: 'Sort 6 items with swift categorization.' },
    { subLevel: 5, name: 'Sorting Master', timerSeconds: 40, itemsCount: 6, points: 10, difficulty: 'Mastery', desc: 'Complete classification to unlock Level 9.' },
  ],
  // Level 9: Hangman / Vocabulary Guess
  9: [
    { subLevel: 1, name: 'Guided Guess', timerSeconds: 60, maxAttempts: 8, points: 10, difficulty: 'Gentle', desc: 'Discover a comforting word with 8 attempts.' },
    { subLevel: 2, name: 'Classic Guess', timerSeconds: 55, maxAttempts: 7, points: 10, difficulty: 'Easy', desc: 'Guess the word with 7 letter attempts.' },
    { subLevel: 3, name: 'Vocabulary Clue', timerSeconds: 50, maxAttempts: 6, points: 10, difficulty: 'Moderate', desc: 'Deduce the word with progressive hints.' },
    { subLevel: 4, name: 'Deductive Sprint', timerSeconds: 45, maxAttempts: 6, points: 10, difficulty: 'Advanced', desc: 'Uncover the letters under focused time.' },
    { subLevel: 5, name: 'Word Master', timerSeconds: 40, maxAttempts: 5, points: 10, difficulty: 'Mastery', desc: 'Solve the word mystery to unlock Level 10.' },
  ],
  // Level 10: Mixed Cognitive Challenge
  10: [
    { subLevel: 1, name: '2-Part Logic', timerSeconds: 60, challengesCount: 2, points: 10, difficulty: 'Gentle', desc: 'Answer 2 gentle logic and memory challenges.' },
    { subLevel: 2, name: '3-Part Master', timerSeconds: 55, challengesCount: 3, points: 10, difficulty: 'Easy', desc: 'Complete 3 cognitive multi-discipline tasks.' },
    { subLevel: 3, name: 'Pattern Synergy', timerSeconds: 50, challengesCount: 3, points: 10, difficulty: 'Moderate', desc: 'Solve 3 pattern, reasoning, and memory steps.' },
    { subLevel: 4, name: 'Advanced Logic', timerSeconds: 45, challengesCount: 3, points: 10, difficulty: 'Advanced', desc: 'Conquer 3 challenges with sharp focus.' },
    { subLevel: 5, name: 'Grand Mastery', timerSeconds: 40, challengesCount: 3, points: 10, difficulty: 'Mastery', desc: 'The ultimate summit! Complete the grand cognitive challenge.' },
  ],
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get configuration for a specific main level and sublevel
 */
export function getSublevelConfig(mainLevel, subLevel = 1) {
  const lvl = Math.max(1, Math.min(10, Number(mainLevel) || 1));
  const sub = Math.max(1, Math.min(5, Number(subLevel) || 1));
  const list = SUBLEVEL_CONFIGS[lvl] || SUBLEVEL_CONFIGS[1];
  return list.find(s => s.subLevel === sub) || list[0];
}

/**
 * Get a randomized, non-repeating puzzle variant for a given level and sublevel
 */
export function getRandomPuzzle(mainLevel, subLevel = 1, excludeIds = []) {
  const lvl = Math.max(1, Math.min(10, Number(mainLevel) || 1));
  const config = getSublevelConfig(lvl, subLevel);

  switch (lvl) {
    case 1: {
      // Memory match: pick N distinct pairs from 50-card pool
      const pairsCount = config.pairsCount || 3;
      const shuffled = shuffleArray(LEVEL_1_CARDS_POOL);
      const chosen = shuffled.slice(0, pairsCount);
      const cards = shuffleArray([...chosen, ...chosen]).map((c, i) => ({
        id: i,
        ...c,
        matched: false,
        flipped: false,
      }));
      return { config, cards, chosenPairs: chosen };
    }

    case 2: {
      // Word search: pick 1 grid from 50 pool
      const available = LEVEL_2_WORD_SEARCH_POOLS.filter(p => !excludeIds.includes(p.id));
      const pool = available.length > 0 ? available : LEVEL_2_WORD_SEARCH_POOLS;
      const puzzle = shuffleArray(pool)[0] || LEVEL_2_WORD_SEARCH_POOLS[0];
      return { config, puzzle };
    }

    case 3: {
      // Crossword: pick 1 crossword from 50 pool
      const available = LEVEL_3_CROSSWORD_POOLS.filter(p => !excludeIds.includes(p.id));
      const pool = available.length > 0 ? available : LEVEL_3_CROSSWORD_POOLS;
      const puzzle = shuffleArray(pool)[0] || LEVEL_3_CROSSWORD_POOLS[0];
      return { config, puzzle };
    }

    case 4: {
      // Anagrams: pick N distinct anagrams from 50 pool
      const count = config.wordsCount || 3;
      const available = LEVEL_4_ANAGRAMS_POOL.filter(p => !excludeIds.includes(p.id));
      const pool = available.length >= count ? available : LEVEL_4_ANAGRAMS_POOL;
      const puzzles = shuffleArray(pool).slice(0, count);
      return { config, puzzles };
    }

    case 5: {
      // Word wheel: pick 1 wheel from 50 pool
      const available = LEVEL_5_WORD_WHEELS_POOL.filter(p => !excludeIds.includes(p.id));
      const pool = available.length > 0 ? available : LEVEL_5_WORD_WHEELS_POOL;
      const puzzle = shuffleArray(pool)[0] || LEVEL_5_WORD_WHEELS_POOL[0];
      return { config, puzzle };
    }

    case 6: {
      // Proverbs: pick N distinct proverbs from 50 pool
      const count = config.proverbsCount || 3;
      const available = LEVEL_6_PROVERBS_POOL.filter(p => !excludeIds.includes(p.id));
      const pool = available.length >= count ? available : LEVEL_6_PROVERBS_POOL;
      const puzzles = shuffleArray(pool).slice(0, count);
      return { config, puzzles };
    }

    case 7: {
      // Rhymes: pick N distinct rhymes from 50 pool
      const count = config.rhymesCount || 3;
      const available = LEVEL_7_RHYMES_POOL.filter(p => !excludeIds.includes(p.id));
      const pool = available.length >= count ? available : LEVEL_7_RHYMES_POOL;
      const puzzles = shuffleArray(pool).slice(0, count);
      return { config, puzzles };
    }

    case 8: {
      // Category sorting: pick 1 category set from 50 pool
      const available = LEVEL_8_CATEGORIES_POOL.filter(p => !excludeIds.includes(p.id));
      const pool = available.length > 0 ? available : LEVEL_8_CATEGORIES_POOL;
      const puzzle = shuffleArray(pool)[0] || LEVEL_8_CATEGORIES_POOL[0];
      return { config, puzzle };
    }

    case 9: {
      // Hangman: pick 1 word from 50 pool
      const available = LEVEL_9_HANGMAN_POOL.filter(p => !excludeIds.includes(p.id));
      const pool = available.length > 0 ? available : LEVEL_9_HANGMAN_POOL;
      const puzzle = shuffleArray(pool)[0] || LEVEL_9_HANGMAN_POOL[0];
      return { config, puzzle };
    }

    case 10: {
      // Mixed challenges: pick N distinct challenges from 50 pool
      const count = config.challengesCount || 3;
      const available = LEVEL_10_CHALLENGES_POOL.filter(p => !excludeIds.includes(p.id));
      const pool = available.length >= count ? available : LEVEL_10_CHALLENGES_POOL;
      const puzzles = shuffleArray(pool).slice(0, count);
      return { config, puzzles };
    }

    default:
      return { config };
  }
}
