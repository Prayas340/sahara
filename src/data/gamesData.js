// Cognitive Game Suite: 10 Progressive Levels Data & Metadata
export const COGNITIVE_LEVELS = [
  {
    level: 1,
    title: 'Memory Match',
    subtitle: 'Visual pairs & gentle focus',
    category: 'Visual Recall',
    icon: 'grid_view',
    color: 'emerald',
    badge: 'Level 1 Baseline',
    description: 'Match 3 gentle pairs of familiar cards within 60 seconds.',
    difficulty: 'Gentle',
  },
  {
    level: 2,
    title: 'Word Search',
    subtitle: 'Dexterity-assisted word tracing',
    category: 'Visual Scanning',
    icon: 'search',
    color: 'teal',
    badge: 'Level 2',
    description: 'Find 3 simple comforting words hidden in the assisted 6x6 grid.',
    difficulty: 'Easy',
  },
  {
    level: 3,
    title: 'Quick Crossword',
    subtitle: 'Direct, dementia-friendly clues',
    category: 'Semantic Memory',
    icon: 'border_all',
    color: 'cyan',
    badge: 'Level 3',
    description: 'Fill in 3 direct everyday clues designed for cognitive comfort.',
    difficulty: 'Easy-Moderate',
  },
  {
    level: 4,
    title: 'Word Unscramble',
    subtitle: 'Letter rearrangement tiles',
    category: 'Executive Function',
    icon: 'spellcheck',
    color: 'blue',
    badge: 'Level 4',
    description: 'Tap letter tiles in order to unscramble comforting words.',
    difficulty: 'Moderate',
  },
  {
    level: 5,
    title: 'Word Wheel',
    subtitle: 'Cluster building & vocabulary',
    category: 'Verbal Fluency',
    icon: 'published_with_changes',
    color: 'indigo',
    badge: 'Level 5',
    description: 'Create 3 words using the letters around the central hub.',
    difficulty: 'Moderate',
  },
  {
    level: 6,
    title: 'Fill-in-the-Blank',
    subtitle: 'Proverb & familiar phrase recall',
    category: 'Long-term Memory',
    icon: 'format_quote',
    color: 'purple',
    badge: 'Level 6',
    description: 'Complete 3 timeless proverbs and familiar uplifting sayings.',
    difficulty: 'Intermediate',
  },
  {
    level: 7,
    title: 'Rhyming Pairs',
    subtitle: 'Phonetic & auditory matching',
    category: 'Auditory Processing',
    icon: 'music_note',
    color: 'pink',
    badge: 'Level 7',
    description: 'Listen and pair words that rhyme with the prompt sounds.',
    difficulty: 'Intermediate',
  },
  {
    level: 8,
    title: 'Category Sorting',
    subtitle: 'Classification & grouping',
    category: 'Abstract Thinking',
    icon: 'category',
    color: 'amber',
    badge: 'Level 8',
    description: 'Sort everyday items into their proper natural categories.',
    difficulty: 'Challenging',
  },
  {
    level: 9,
    title: 'Vocabulary Guess',
    subtitle: 'Hangman-style letter discovery',
    category: 'Deductive Logic',
    icon: 'lightbulb',
    color: 'orange',
    badge: 'Level 9',
    description: 'Guess the hidden comforting word with generous attempts.',
    difficulty: 'Advanced',
  },
  {
    level: 10,
    title: 'Cognitive Master',
    subtitle: 'Multi-faceted logic & memory challenge',
    category: 'Comprehensive Cognitive',
    icon: 'psychology',
    color: 'rose',
    badge: 'Level 10 Peak',
    description: 'Tackle a 3-part mixed challenge spanning logic, analogies, and recall.',
    difficulty: 'Mastery',
  },
];

// Level 1: Visual Card Pool
export const LEVEL_1_CARDS = [
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

// Level 2: Word Search Grids
export const LEVEL_2_WORD_SEARCH = {
  grid: [
    ['C', 'A', 'R', 'E', 'X', 'S'],
    ['H', 'O', 'M', 'E', 'Y', 'U'],
    ['L', 'O', 'V', 'E', 'B', 'N'],
    ['P', 'E', 'A', 'C', 'E', 'R'],
    ['W', 'A', 'R', 'M', 'T', 'H'],
    ['J', 'O', 'Y', 'F', 'U', 'L'],
  ],
  words: [
    { word: 'CARE', row: 0, col: 0, dir: 'horizontal', length: 4, hint: 'Loving attention' },
    { word: 'HOME', row: 1, col: 0, dir: 'horizontal', length: 4, hint: 'A comforting sanctuary' },
    { word: 'LOVE', row: 2, col: 0, dir: 'horizontal', length: 4, hint: 'Deep affection' },
  ],
};

// Level 3: Quick Dementia-Friendly Crossword
export const LEVEL_3_CROSSWORD = {
  words: [
    { id: 1, clue: 'Hot morning drink made with aromatic leaves', answer: 'TEA', length: 3 },
    { id: 2, clue: 'The warm star that gives us daylight and sunshine', answer: 'SUN', length: 3 },
    { id: 3, clue: 'A loyal furry friend that barks and wags its tail', answer: 'DOG', length: 3 },
  ],
};

// Level 4: Anagrams / Word Unscrambles
export const LEVEL_4_ANAGRAMS = [
  {
    id: 1,
    target: 'PEACE',
    scrambled: ['E', 'P', 'C', 'A', 'E'],
    hint: 'A state of calm and quiet tranquility.',
  },
  {
    id: 2,
    target: 'SMILE',
    scrambled: ['I', 'L', 'S', 'M', 'E'],
    hint: 'A cheerful expression with your lips.',
  },
  {
    id: 3,
    target: 'LIGHT',
    scrambled: ['T', 'H', 'G', 'L', 'I'],
    hint: 'Bright warmth that dispels the dark.',
  },
];

// Level 5: Word Wheel & Cluster Builder
export const LEVEL_5_WORD_WHEEL = {
  centerLetter: 'A',
  outerLetters: ['C', 'R', 'E', 'T', 'P', 'S'],
  validWords: ['CAT', 'CAR', 'CARE', 'TEA', 'EAT', 'STAR', 'PART', 'PEA', 'CAPE', 'RATE'],
  targetCount: 3,
  hints: ['A purring companion (CAT)', 'A four-wheeled vehicle (CAR)', 'A hot brew (TEA)'],
};

// Level 6: Fill-in-the-Blank Proverbs
export const LEVEL_6_PROVERBS = [
  {
    id: 1,
    phrase: 'Laughter is the best _______.',
    options: ['Medicine', 'Breakfast', 'Book'],
    answer: 'Medicine',
    explanation: 'Joy and laughter uplift our wellness and spirit.',
  },
  {
    id: 2,
    phrase: 'Home is where the _______ is.',
    options: ['Garden', 'Heart', 'Clock'],
    answer: 'Heart',
    explanation: 'Home is wherever we feel warmth and love.',
  },
  {
    id: 3,
    phrase: 'A friend in need is a friend _______.',
    options: ['Indeed', 'Tomorrow', 'Always'],
    answer: 'Indeed',
    explanation: 'True companions stand by us during moments of need.',
  },
];

// Level 7: Rhyming Word Pairs
export const LEVEL_7_RHYMES = [
  {
    id: 1,
    targetWord: 'SUN',
    options: ['FUN', 'TREE', 'CAT', 'BOOK'],
    correct: 'FUN',
    rhymeSound: 'un',
  },
  {
    id: 2,
    targetWord: 'BRIGHT',
    options: ['NIGHT', 'CHAIR', 'WATER', 'BIRD'],
    correct: 'NIGHT',
    rhymeSound: 'ite',
  },
  {
    id: 3,
    targetWord: 'CARE',
    options: ['SHARE', 'FLOWER', 'APPLE', 'MOON'],
    correct: 'SHARE',
    rhymeSound: 'air',
  },
];

// Level 8: Category Association / Sorting
export const LEVEL_8_CATEGORIES = {
  categoryA: { name: 'Fresh Fruits 🍎', key: 'fruits' },
  categoryB: { name: 'Garden Veggies 🥕', key: 'veggies' },
  items: [
    { id: 'item1', label: 'Sweet Mango', category: 'fruits', icon: 'nutrition' },
    { id: 'item2', label: 'Crunchy Carrot', category: 'veggies', icon: 'eco' },
    { id: 'item3', label: 'Ripe Banana', category: 'fruits', icon: 'nutrition' },
    { id: 'item4', label: 'Green Spinach', category: 'veggies', icon: 'eco' },
  ],
};

// Level 9: Hangman-Style Vocabulary Discovery
export const LEVEL_9_HANGMAN = {
  word: 'HARMONY',
  clue: 'A peaceful state where everything blends together pleasantly.',
  maxAttempts: 7,
};

// Level 10: Mixed Cognitive Master Challenge
export const LEVEL_10_CHALLENGES = [
  {
    id: 1,
    type: 'analogy',
    question: 'Morning is to Sunrise as Evening is to...',
    options: ['Sunset', 'Moonbeam', 'Breakfast'],
    answer: 'Sunset',
  },
  {
    id: 2,
    type: 'sequence',
    question: 'Raindrop, Stream, River, ...',
    options: ['Ocean', 'Stone', 'Leaf'],
    answer: 'Ocean',
  },
  {
    id: 3,
    type: 'logic',
    question: 'If today is Tuesday, what day will it be in 2 days?',
    options: ['Thursday', 'Wednesday', 'Friday'],
    answer: 'Thursday',
  },
];
