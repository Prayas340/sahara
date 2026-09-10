// Cognitive Game Suite: 10 Progressive Levels Data & Metadata
// 50 Handcrafted Variations per Level (500 Total Curated Cognitive Items)

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
    subtitle: 'Interactive touch & drag tracing',
    category: 'Visual Scanning',
    icon: 'search',
    color: 'teal',
    badge: 'Level 2',
    description: 'Drag across letters in the 6×6 grid to find 3 hidden words.',
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

// Level 1: 50 Visual Cards Pool
export const LEVEL_1_CARDS_POOL = [
  {
    "pairId": "apple",
    "title": "Fresh Apple \ud83c\udf4e",
    "subtitle": "Sweet Red Fruit",
    "icon": "nutrition"
  },
  {
    "pairId": "balloon",
    "title": "Colorful Balloon \ud83c\udf88",
    "subtitle": "Floating Joy",
    "icon": "celebration"
  },
  {
    "pairId": "car",
    "title": "Classic Car \ud83d\ude97",
    "subtitle": "Smooth Drive",
    "icon": "directions_car"
  },
  {
    "pairId": "cat",
    "title": "Gentle Cat \ud83d\udc31",
    "subtitle": "Soft Warm Nap",
    "icon": "pets"
  },
  {
    "pairId": "heart",
    "title": "Caring Heart \u2764\ufe0f",
    "subtitle": "Love & Warmth",
    "icon": "favorite"
  },
  {
    "pairId": "horse",
    "title": "Noble Horse \ud83d\udc34",
    "subtitle": "Gentle Companion",
    "icon": "cruelty_free"
  },
  {
    "pairId": "key",
    "title": "Golden Key \ud83d\udd11",
    "subtitle": "Safe & Secure",
    "icon": "key"
  },
  {
    "pairId": "kite",
    "title": "Flying Kite \ud83e\ude81",
    "subtitle": "High Blue Skies",
    "icon": "toys"
  },
  {
    "pairId": "spade",
    "title": "Garden Spade \u2660\ufe0f",
    "subtitle": "Rich Blossom Soil",
    "icon": "handyman"
  },
  {
    "pairId": "tree",
    "title": "Green Tree \ud83c\udf33",
    "subtitle": "Peaceful Shade",
    "icon": "park"
  },
  {
    "pairId": "umbrella",
    "title": "Bright Umbrella \u2602\ufe0f",
    "subtitle": "Gentle Rain Shelter",
    "icon": "umbrella"
  },
  {
    "pairId": "mango",
    "title": "Sweet Mango \ud83e\udd6d",
    "subtitle": "King of Fruits",
    "icon": "nutrition"
  },
  {
    "pairId": "peacock",
    "title": "Royal Peacock \ud83e\udd9a",
    "subtitle": "Graceful Feathers",
    "icon": "cruelty_free"
  },
  {
    "pairId": "lotus",
    "title": "Pink Lotus \ud83e\udeb7",
    "subtitle": "Pure & Peaceful",
    "icon": "local_florist"
  },
  {
    "pairId": "diya",
    "title": "Glowing Diya \ud83e\ude94",
    "subtitle": "Warm Sacred Light",
    "icon": "light_mode"
  },
  {
    "pairId": "elephant",
    "title": "Wise Elephant \ud83d\udc18",
    "subtitle": "Gentle Giant",
    "icon": "cruelty_free"
  },
  {
    "pairId": "teacup",
    "title": "Warm Chai \u2615",
    "subtitle": "Morning Refreshment",
    "icon": "coffee"
  },
  {
    "pairId": "book",
    "title": "Favorite Book \ud83d\udcd6",
    "subtitle": "Stories & Wisdom",
    "icon": "menu_book"
  },
  {
    "pairId": "sun",
    "title": "Golden Sun \u2600\ufe0f",
    "subtitle": "Morning Brightness",
    "icon": "wb_sunny"
  },
  {
    "pairId": "moon",
    "title": "Calm Moon \ud83c\udf19",
    "subtitle": "Peaceful Night",
    "icon": "dark_mode"
  },
  {
    "pairId": "rose",
    "title": "Velvet Rose \ud83c\udf39",
    "subtitle": "Fragrant Blossom",
    "icon": "local_florist"
  },
  {
    "pairId": "guitar",
    "title": "Acoustic Guitar \ud83c\udfb8",
    "subtitle": "Sweet Melodies",
    "icon": "music_note"
  },
  {
    "pairId": "cycle",
    "title": "Bicycle \ud83d\udeb2",
    "subtitle": "Breezy Morning Ride",
    "icon": "pedal_bike"
  },
  {
    "pairId": "bridge",
    "title": "Garden Bridge \ud83c\udf09",
    "subtitle": "Peaceful Crossing",
    "icon": "deck"
  },
  {
    "pairId": "lantern",
    "title": "Warm Lantern \ud83c\udfee",
    "subtitle": "Cozy Evening Glow",
    "icon": "lightbulb"
  },
  {
    "pairId": "flute",
    "title": "Bamboo Flute \ud83e\ude88",
    "subtitle": "Gentle Harmonies",
    "icon": "music_note"
  },
  {
    "pairId": "bell",
    "title": "Temple Bell \ud83d\udd14",
    "subtitle": "Clear Pure Resonance",
    "icon": "notifications"
  },
  {
    "pairId": "clock",
    "title": "Grandfather Clock \ud83d\udd70\ufe0f",
    "subtitle": "Rhythmic Tick of Time",
    "icon": "schedule"
  },
  {
    "pairId": "boat",
    "title": "Wooden Boat \u26f5",
    "subtitle": "Calm River Drifting",
    "icon": "sailing"
  },
  {
    "pairId": "bird",
    "title": "Singing Sparrow \ud83d\udc26",
    "subtitle": "Morning Chirps",
    "icon": "flutter"
  },
  {
    "pairId": "dolphin",
    "title": "Playful Dolphin \ud83d\udc2c",
    "subtitle": "Ocean Joy",
    "icon": "water"
  },
  {
    "pairId": "cow",
    "title": "Gentle Cow \ud83d\udc04",
    "subtitle": "Calm Nurturer",
    "icon": "cruelty_free"
  },
  {
    "pairId": "butterfly",
    "title": "Silk Butterfly \ud83e\udd8b",
    "subtitle": "Color in Flight",
    "icon": "nature"
  },
  {
    "pairId": "leaf",
    "title": "Autumn Leaf \ud83c\udf42",
    "subtitle": "Nature in Transition",
    "icon": "eco"
  },
  {
    "pairId": "rainbow",
    "title": "Vibrant Rainbow \ud83c\udf08",
    "subtitle": "Hope after Rain",
    "icon": "looks"
  },
  {
    "pairId": "star",
    "title": "Twinkling Star \u2b50",
    "subtitle": "Night Guidance",
    "icon": "grade"
  },
  {
    "pairId": "train",
    "title": "Scenic Train \ud83d\ude82",
    "subtitle": "Nostalgic Journey",
    "icon": "train"
  },
  {
    "pairId": "camera",
    "title": "Vintage Camera \ud83d\udcf7",
    "subtitle": "Precious Memories",
    "icon": "photo_camera"
  },
  {
    "pairId": "painting",
    "title": "Art Canvas \ud83c\udfa8",
    "subtitle": "Colors of Imagination",
    "icon": "palette"
  },
  {
    "pairId": "violin",
    "title": "Warm Violin \ud83c\udfbb",
    "subtitle": "Soothing Classical Notes",
    "icon": "music_note"
  },
  {
    "pairId": "sunflower",
    "title": "Sunflower \ud83c\udf3b",
    "subtitle": "Always Facing Light",
    "icon": "local_florist"
  },
  {
    "pairId": "coconut",
    "title": "Coconut Palm \ud83e\udd65",
    "subtitle": "Tropical Breeze",
    "icon": "forest"
  },
  {
    "pairId": "teapot",
    "title": "Porcelain Teapot \ud83e\uded6",
    "subtitle": "Afternoon Comfort",
    "icon": "emoji_food_beverage"
  },
  {
    "pairId": "candle",
    "title": "Scented Candle \ud83d\udd6f\ufe0f",
    "subtitle": "Gentle Warm Flame",
    "icon": "flare"
  },
  {
    "pairId": "river",
    "title": "Flowing River \ud83c\udf0a",
    "subtitle": "Serene Constant Waters",
    "icon": "water"
  },
  {
    "pairId": "seashell",
    "title": "Spiral Seashell \ud83d\udc1a",
    "subtitle": "Whisper of the Waves",
    "icon": "beach_access"
  },
  {
    "pairId": "feather",
    "title": "Soft Feather \ud83e\udeb6",
    "subtitle": "Light as Air",
    "icon": "air"
  },
  {
    "pairId": "compass",
    "title": "Brass Compass \ud83e\udded",
    "subtitle": "Always Finding Way",
    "icon": "explore"
  },
  {
    "pairId": "fountain",
    "title": "Garden Fountain \u26f2",
    "subtitle": "Gentle Water Music",
    "icon": "water_drop"
  },
  {
    "pairId": "birdhouse",
    "title": "Cozy Birdhouse \ud83d\uded6",
    "subtitle": "Shelter for Friends",
    "icon": "cottage"
  }
];
export const LEVEL_1_CARDS = LEVEL_1_CARDS_POOL.slice(0, 12);

// Level 2: 50 Word Search Pools
export const LEVEL_2_WORD_SEARCH_POOLS = [
  {
    "id": 1,
    "theme": "Comfort & Peace",
    "grid": [
      [
        "C",
        "A",
        "R",
        "E",
        "U",
        "D"
      ],
      [
        "H",
        "O",
        "M",
        "E",
        "A",
        "X"
      ],
      [
        "L",
        "O",
        "V",
        "E",
        "I",
        "H"
      ],
      [
        "H",
        "E",
        "X",
        "D",
        "V",
        "X"
      ],
      [
        "R",
        "C",
        "S",
        "N",
        "B",
        "A"
      ],
      [
        "C",
        "G",
        "H",
        "Q",
        "T",
        "A"
      ]
    ],
    "words": [
      {
        "word": "CARE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Loving attention"
      },
      {
        "word": "HOME",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "A comforting sanctuary"
      },
      {
        "word": "LOVE",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Deep affection"
      }
    ]
  },
  {
    "id": 2,
    "theme": "Nature Serenity",
    "grid": [
      [
        "T",
        "R",
        "E",
        "E",
        "R",
        "G"
      ],
      [
        "L",
        "E",
        "A",
        "F",
        "W",
        "U"
      ],
      [
        "R",
        "O",
        "S",
        "E",
        "W",
        "R"
      ],
      [
        "N",
        "H",
        "O",
        "S",
        "I",
        "Z"
      ],
      [
        "A",
        "Y",
        "Z",
        "F",
        "W",
        "N"
      ],
      [
        "K",
        "I",
        "E",
        "G",
        "Y",
        "K"
      ]
    ],
    "words": [
      {
        "word": "TREE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Peaceful shade"
      },
      {
        "word": "LEAF",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Green foliage"
      },
      {
        "word": "ROSE",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Fragrant flower"
      }
    ]
  },
  {
    "id": 3,
    "theme": "Morning Sun",
    "grid": [
      [
        "S",
        "U",
        "N",
        "D",
        "C",
        "M"
      ],
      [
        "D",
        "A",
        "W",
        "N",
        "D",
        "L"
      ],
      [
        "W",
        "A",
        "R",
        "M",
        "L",
        "T"
      ],
      [
        "I",
        "Z",
        "B",
        "X",
        "O",
        "R"
      ],
      [
        "D",
        "M",
        "C",
        "R",
        "J",
        "U"
      ],
      [
        "T",
        "L",
        "S",
        "G",
        "W",
        "C"
      ]
    ],
    "words": [
      {
        "word": "SUN",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Bright daylight"
      },
      {
        "word": "DAWN",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "First light of day"
      },
      {
        "word": "WARM",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Gentle heat"
      }
    ]
  },
  {
    "id": 4,
    "theme": "Sweet Fruits",
    "grid": [
      [
        "P",
        "E",
        "A",
        "R",
        "B",
        "V"
      ],
      [
        "P",
        "L",
        "U",
        "M",
        "H",
        "Y"
      ],
      [
        "F",
        "I",
        "G",
        "S",
        "J",
        "C"
      ],
      [
        "H",
        "D",
        "M",
        "I",
        "O",
        "U"
      ],
      [
        "L",
        "F",
        "L",
        "L",
        "G",
        "V"
      ],
      [
        "I",
        "W",
        "V",
        "U",
        "C",
        "T"
      ]
    ],
    "words": [
      {
        "word": "PEAR",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Juicy orchard fruit"
      },
      {
        "word": "PLUM",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Purple sweet fruit"
      },
      {
        "word": "FIGS",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Sweet tender fruit"
      }
    ]
  },
  {
    "id": 5,
    "theme": "Melody & Songs",
    "grid": [
      [
        "S",
        "O",
        "N",
        "G",
        "U",
        "F"
      ],
      [
        "T",
        "U",
        "N",
        "E",
        "R",
        "X"
      ],
      [
        "D",
        "R",
        "U",
        "M",
        "H",
        "F"
      ],
      [
        "O",
        "M",
        "I",
        "U",
        "W",
        "R"
      ],
      [
        "H",
        "V",
        "K",
        "Y",
        "Y",
        "B"
      ],
      [
        "H",
        "B",
        "Z",
        "K",
        "M",
        "I"
      ]
    ],
    "words": [
      {
        "word": "SONG",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Melody with lyrics"
      },
      {
        "word": "TUNE",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Musical pitch sequence"
      },
      {
        "word": "DRUM",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Rhythmic instrument"
      }
    ]
  },
  {
    "id": 6,
    "theme": "Garden Flowers",
    "grid": [
      [
        "L",
        "I",
        "L",
        "Y",
        "C",
        "G"
      ],
      [
        "I",
        "R",
        "I",
        "S",
        "S",
        "W"
      ],
      [
        "M",
        "I",
        "N",
        "T",
        "K",
        "G"
      ],
      [
        "U",
        "P",
        "M",
        "U",
        "O",
        "E"
      ],
      [
        "I",
        "E",
        "H",
        "X",
        "R",
        "R"
      ],
      [
        "I",
        "X",
        "S",
        "N",
        "S",
        "M"
      ]
    ],
    "words": [
      {
        "word": "LILY",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Pure white bloom"
      },
      {
        "word": "IRIS",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Royal purple flower"
      },
      {
        "word": "MINT",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Fresh aromatic herb"
      }
    ]
  },
  {
    "id": 7,
    "theme": "Ocean Breeze",
    "grid": [
      [
        "W",
        "A",
        "V",
        "E",
        "L",
        "H"
      ],
      [
        "F",
        "I",
        "S",
        "H",
        "E",
        "Q"
      ],
      [
        "B",
        "O",
        "A",
        "T",
        "P",
        "C"
      ],
      [
        "Y",
        "B",
        "D",
        "E",
        "U",
        "F"
      ],
      [
        "Z",
        "V",
        "N",
        "T",
        "C",
        "M"
      ],
      [
        "M",
        "T",
        "O",
        "Q",
        "I",
        "R"
      ]
    ],
    "words": [
      {
        "word": "WAVE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Ocean swell"
      },
      {
        "word": "FISH",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Swimming creature"
      },
      {
        "word": "BOAT",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Water vessel"
      }
    ]
  },
  {
    "id": 8,
    "theme": "Night Sky",
    "grid": [
      [
        "S",
        "T",
        "A",
        "R",
        "A",
        "V"
      ],
      [
        "M",
        "O",
        "O",
        "N",
        "X",
        "D"
      ],
      [
        "G",
        "L",
        "O",
        "W",
        "V",
        "R"
      ],
      [
        "Y",
        "I",
        "Y",
        "U",
        "K",
        "D"
      ],
      [
        "J",
        "N",
        "F",
        "O",
        "A",
        "X"
      ],
      [
        "X",
        "I",
        "Q",
        "Y",
        "F",
        "Q"
      ]
    ],
    "words": [
      {
        "word": "STAR",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Night twinkle"
      },
      {
        "word": "MOON",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Gentle night light"
      },
      {
        "word": "GLOW",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Soft radiance"
      }
    ]
  },
  {
    "id": 9,
    "theme": "Kind Companions",
    "grid": [
      [
        "K",
        "I",
        "N",
        "D",
        "D",
        "U"
      ],
      [
        "H",
        "E",
        "L",
        "P",
        "J",
        "U"
      ],
      [
        "G",
        "L",
        "A",
        "D",
        "Q",
        "T"
      ],
      [
        "G",
        "E",
        "L",
        "Y",
        "F",
        "R"
      ],
      [
        "Y",
        "Q",
        "A",
        "T",
        "K",
        "P"
      ],
      [
        "A",
        "D",
        "L",
        "Z",
        "J",
        "H"
      ]
    ],
    "words": [
      {
        "word": "KIND",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Gentle hearted"
      },
      {
        "word": "HELP",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Lending a hand"
      },
      {
        "word": "GLAD",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Happy & pleased"
      }
    ]
  },
  {
    "id": 10,
    "theme": "Spring Showers",
    "grid": [
      [
        "R",
        "A",
        "I",
        "N",
        "B",
        "H"
      ],
      [
        "S",
        "E",
        "E",
        "D",
        "S",
        "S"
      ],
      [
        "S",
        "O",
        "I",
        "L",
        "C",
        "C"
      ],
      [
        "X",
        "P",
        "C",
        "Y",
        "R",
        "Y"
      ],
      [
        "E",
        "E",
        "V",
        "P",
        "R",
        "F"
      ],
      [
        "I",
        "Q",
        "T",
        "N",
        "G",
        "R"
      ]
    ],
    "words": [
      {
        "word": "RAIN",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Nourishing water"
      },
      {
        "word": "SEEDS",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Plant origin"
      },
      {
        "word": "SOIL",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Rich fertile earth"
      }
    ]
  },
  {
    "id": 11,
    "theme": "Warm Kitchen",
    "grid": [
      [
        "C",
        "H",
        "A",
        "I",
        "Y",
        "X"
      ],
      [
        "S",
        "O",
        "U",
        "P",
        "W",
        "G"
      ],
      [
        "R",
        "I",
        "C",
        "E",
        "W",
        "J"
      ],
      [
        "M",
        "V",
        "U",
        "L",
        "O",
        "Q"
      ],
      [
        "O",
        "D",
        "H",
        "H",
        "C",
        "K"
      ],
      [
        "A",
        "S",
        "R",
        "H",
        "S",
        "H"
      ]
    ],
    "words": [
      {
        "word": "CHAI",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Spiced warm tea"
      },
      {
        "word": "SOUP",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Warm broth"
      },
      {
        "word": "RICE",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Staple grain"
      }
    ]
  },
  {
    "id": 12,
    "theme": "Woodland Walk",
    "grid": [
      [
        "P",
        "I",
        "N",
        "E",
        "A",
        "C"
      ],
      [
        "M",
        "O",
        "S",
        "S",
        "W",
        "U"
      ],
      [
        "B",
        "A",
        "R",
        "K",
        "B",
        "H"
      ],
      [
        "C",
        "B",
        "K",
        "C",
        "Q",
        "H"
      ],
      [
        "I",
        "V",
        "P",
        "G",
        "R",
        "E"
      ],
      [
        "X",
        "S",
        "S",
        "P",
        "H",
        "Z"
      ]
    ],
    "words": [
      {
        "word": "PINE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Evergreen tree"
      },
      {
        "word": "MOSS",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Soft ground moss"
      },
      {
        "word": "BARK",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Tree outer layer"
      }
    ]
  },
  {
    "id": 13,
    "theme": "Calm Mind",
    "grid": [
      [
        "C",
        "A",
        "L",
        "M",
        "P",
        "Z"
      ],
      [
        "R",
        "E",
        "S",
        "T",
        "N",
        "G"
      ],
      [
        "H",
        "O",
        "P",
        "E",
        "D",
        "D"
      ],
      [
        "V",
        "N",
        "L",
        "N",
        "N",
        "O"
      ],
      [
        "X",
        "B",
        "V",
        "U",
        "U",
        "D"
      ],
      [
        "B",
        "M",
        "X",
        "K",
        "Z",
        "D"
      ]
    ],
    "words": [
      {
        "word": "CALM",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Tranquil state"
      },
      {
        "word": "REST",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Rejuvenating pause"
      },
      {
        "word": "HOPE",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Optimistic spirit"
      }
    ]
  },
  {
    "id": 14,
    "theme": "Gentle Fauna",
    "grid": [
      [
        "D",
        "E",
        "E",
        "R",
        "H",
        "G"
      ],
      [
        "F",
        "A",
        "W",
        "N",
        "G",
        "R"
      ],
      [
        "B",
        "I",
        "R",
        "D",
        "O",
        "E"
      ],
      [
        "N",
        "F",
        "I",
        "O",
        "H",
        "C"
      ],
      [
        "O",
        "Z",
        "R",
        "D",
        "B",
        "U"
      ],
      [
        "R",
        "A",
        "C",
        "Y",
        "H",
        "F"
      ]
    ],
    "words": [
      {
        "word": "DEER",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Graceful forest friend"
      },
      {
        "word": "FAWN",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Young sweet deer"
      },
      {
        "word": "BIRD",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Chirping companion"
      }
    ]
  },
  {
    "id": 15,
    "theme": "Sweet Honey",
    "grid": [
      [
        "C",
        "A",
        "K",
        "E",
        "N",
        "P"
      ],
      [
        "M",
        "I",
        "L",
        "K",
        "P",
        "G"
      ],
      [
        "J",
        "A",
        "M",
        "M",
        "B",
        "F"
      ],
      [
        "M",
        "A",
        "M",
        "I",
        "Z",
        "Z"
      ],
      [
        "O",
        "J",
        "N",
        "W",
        "X",
        "Z"
      ],
      [
        "R",
        "V",
        "W",
        "P",
        "E",
        "G"
      ]
    ],
    "words": [
      {
        "word": "CAKE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Celebration treat"
      },
      {
        "word": "MILK",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Nourishing drink"
      },
      {
        "word": "JAM",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Fruit spread"
      }
    ]
  },
  {
    "id": 16,
    "theme": "Water Pathways",
    "grid": [
      [
        "L",
        "A",
        "K",
        "E",
        "J",
        "G"
      ],
      [
        "P",
        "O",
        "N",
        "D",
        "B",
        "S"
      ],
      [
        "R",
        "I",
        "V",
        "E",
        "R",
        "X"
      ],
      [
        "R",
        "B",
        "X",
        "K",
        "B",
        "B"
      ],
      [
        "S",
        "P",
        "Q",
        "Q",
        "F",
        "B"
      ],
      [
        "Q",
        "C",
        "F",
        "C",
        "T",
        "C"
      ]
    ],
    "words": [
      {
        "word": "LAKE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Freshwater lake"
      },
      {
        "word": "POND",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Garden pool"
      },
      {
        "word": "RIVER",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Flowing stream"
      }
    ]
  },
  {
    "id": 17,
    "theme": "Daily Walk",
    "grid": [
      [
        "W",
        "A",
        "L",
        "K",
        "V",
        "H"
      ],
      [
        "S",
        "T",
        "E",
        "P",
        "M",
        "D"
      ],
      [
        "P",
        "A",
        "T",
        "H",
        "S",
        "H"
      ],
      [
        "S",
        "T",
        "B",
        "T",
        "C",
        "N"
      ],
      [
        "V",
        "S",
        "S",
        "Q",
        "K",
        "I"
      ],
      [
        "G",
        "V",
        "W",
        "K",
        "H",
        "I"
      ]
    ],
    "words": [
      {
        "word": "WALK",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Gentle exercise"
      },
      {
        "word": "STEP",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Forward movement"
      },
      {
        "word": "PATH",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Pleasant trail"
      }
    ]
  },
  {
    "id": 18,
    "theme": "Radiant Light",
    "grid": [
      [
        "B",
        "E",
        "A",
        "M",
        "M",
        "E"
      ],
      [
        "S",
        "H",
        "I",
        "N",
        "E",
        "V"
      ],
      [
        "R",
        "A",
        "Y",
        "U",
        "J",
        "O"
      ],
      [
        "K",
        "Y",
        "C",
        "A",
        "O",
        "T"
      ],
      [
        "S",
        "D",
        "C",
        "R",
        "G",
        "Q"
      ],
      [
        "I",
        "E",
        "L",
        "C",
        "H",
        "L"
      ]
    ],
    "words": [
      {
        "word": "BEAM",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Sun beam"
      },
      {
        "word": "SHINE",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Radiant brightness"
      },
      {
        "word": "RAY",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Sunlight streak"
      }
    ]
  },
  {
    "id": 19,
    "theme": "Blessings",
    "grid": [
      [
        "G",
        "I",
        "F",
        "T",
        "J",
        "F"
      ],
      [
        "W",
        "I",
        "S",
        "H",
        "O",
        "R"
      ],
      [
        "P",
        "R",
        "A",
        "Y",
        "W",
        "J"
      ],
      [
        "T",
        "Z",
        "U",
        "Q",
        "A",
        "V"
      ],
      [
        "R",
        "J",
        "V",
        "D",
        "E",
        "I"
      ],
      [
        "D",
        "D",
        "X",
        "R",
        "E",
        "I"
      ]
    ],
    "words": [
      {
        "word": "GIFT",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Thoughtful present"
      },
      {
        "word": "WISH",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Heartfelt hope"
      },
      {
        "word": "PRAY",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Spiritual peace"
      }
    ]
  },
  {
    "id": 20,
    "theme": "Winter Calm",
    "grid": [
      [
        "S",
        "N",
        "O",
        "W",
        "J",
        "T"
      ],
      [
        "C",
        "O",
        "L",
        "D",
        "G",
        "W"
      ],
      [
        "F",
        "I",
        "R",
        "E",
        "K",
        "G"
      ],
      [
        "V",
        "U",
        "I",
        "Q",
        "P",
        "I"
      ],
      [
        "B",
        "C",
        "U",
        "N",
        "I",
        "B"
      ],
      [
        "A",
        "K",
        "Y",
        "E",
        "U",
        "I"
      ]
    ],
    "words": [
      {
        "word": "SNOW",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Winter flakes"
      },
      {
        "word": "COLD",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Crisp weather"
      },
      {
        "word": "FIRE",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Warm hearth"
      }
    ]
  },
  {
    "id": 21,
    "theme": "Joyful Laughter",
    "grid": [
      [
        "L",
        "A",
        "U",
        "G",
        "H",
        "F"
      ],
      [
        "S",
        "M",
        "I",
        "L",
        "E",
        "X"
      ],
      [
        "J",
        "O",
        "Y",
        "O",
        "R",
        "W"
      ],
      [
        "N",
        "R",
        "A",
        "D",
        "C",
        "W"
      ],
      [
        "E",
        "R",
        "B",
        "L",
        "S",
        "R"
      ],
      [
        "E",
        "N",
        "E",
        "B",
        "J",
        "L"
      ]
    ],
    "words": [
      {
        "word": "LAUGH",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Joyful sound"
      },
      {
        "word": "SMILE",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Happy expression"
      },
      {
        "word": "JOY",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Inner happiness"
      }
    ]
  },
  {
    "id": 22,
    "theme": "Vibrant Hues",
    "grid": [
      [
        "B",
        "L",
        "U",
        "E",
        "Z",
        "B"
      ],
      [
        "P",
        "I",
        "N",
        "K",
        "L",
        "G"
      ],
      [
        "G",
        "O",
        "L",
        "D",
        "V",
        "H"
      ],
      [
        "V",
        "D",
        "L",
        "Y",
        "R",
        "N"
      ],
      [
        "T",
        "X",
        "E",
        "H",
        "F",
        "Z"
      ],
      [
        "Z",
        "F",
        "N",
        "A",
        "F",
        "X"
      ]
    ],
    "words": [
      {
        "word": "BLUE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Sky and ocean hue"
      },
      {
        "word": "PINK",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Soft petal color"
      },
      {
        "word": "GOLD",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Precious radiant metal"
      }
    ]
  },
  {
    "id": 23,
    "theme": "Heritage Lore",
    "grid": [
      [
        "F",
        "O",
        "L",
        "K",
        "K",
        "Z"
      ],
      [
        "T",
        "A",
        "L",
        "E",
        "N",
        "Z"
      ],
      [
        "S",
        "O",
        "N",
        "G",
        "V",
        "X"
      ],
      [
        "Z",
        "H",
        "I",
        "F",
        "Z",
        "W"
      ],
      [
        "D",
        "M",
        "B",
        "P",
        "H",
        "G"
      ],
      [
        "O",
        "L",
        "J",
        "Z",
        "H",
        "H"
      ]
    ],
    "words": [
      {
        "word": "FOLK",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Traditional culture"
      },
      {
        "word": "TALE",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Memorable story"
      },
      {
        "word": "SONG",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Cultural melody"
      }
    ]
  },
  {
    "id": 24,
    "theme": "Tea Cup",
    "grid": [
      [
        "M",
        "U",
        "G",
        "A",
        "V",
        "G"
      ],
      [
        "B",
        "R",
        "E",
        "W",
        "M",
        "K"
      ],
      [
        "H",
        "E",
        "R",
        "B",
        "I",
        "C"
      ],
      [
        "Y",
        "I",
        "L",
        "U",
        "Q",
        "M"
      ],
      [
        "V",
        "R",
        "K",
        "A",
        "D",
        "I"
      ],
      [
        "F",
        "S",
        "I",
        "B",
        "D",
        "T"
      ]
    ],
    "words": [
      {
        "word": "MUG",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Drinking cup"
      },
      {
        "word": "BREW",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Infusing flavors"
      },
      {
        "word": "HERB",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Healing plant"
      }
    ]
  },
  {
    "id": 25,
    "theme": "Breezy Kite",
    "grid": [
      [
        "K",
        "I",
        "T",
        "E",
        "N",
        "L"
      ],
      [
        "W",
        "I",
        "N",
        "D",
        "X",
        "Z"
      ],
      [
        "A",
        "I",
        "R",
        "K",
        "N",
        "T"
      ],
      [
        "Q",
        "D",
        "M",
        "S",
        "G",
        "I"
      ],
      [
        "B",
        "W",
        "N",
        "A",
        "Q",
        "Z"
      ],
      [
        "R",
        "V",
        "X",
        "X",
        "X",
        "V"
      ]
    ],
    "words": [
      {
        "word": "KITE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Flying toy in breeze"
      },
      {
        "word": "WIND",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Moving wind"
      },
      {
        "word": "AIR",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Breath of life"
      }
    ]
  },
  {
    "id": 26,
    "theme": "Dusk Repose",
    "grid": [
      [
        "D",
        "U",
        "S",
        "K",
        "G",
        "L"
      ],
      [
        "S",
        "T",
        "A",
        "R",
        "N",
        "C"
      ],
      [
        "R",
        "E",
        "S",
        "T",
        "V",
        "K"
      ],
      [
        "T",
        "K",
        "V",
        "D",
        "X",
        "J"
      ],
      [
        "Q",
        "J",
        "V",
        "N",
        "K",
        "M"
      ],
      [
        "W",
        "J",
        "R",
        "E",
        "G",
        "N"
      ]
    ],
    "words": [
      {
        "word": "DUSK",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Twilight hour"
      },
      {
        "word": "STAR",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Evening beacon"
      },
      {
        "word": "REST",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Nighttime slumber"
      }
    ]
  },
  {
    "id": 27,
    "theme": "Gentle Healing",
    "grid": [
      [
        "H",
        "E",
        "A",
        "L",
        "V",
        "M"
      ],
      [
        "M",
        "E",
        "N",
        "D",
        "V",
        "X"
      ],
      [
        "C",
        "A",
        "L",
        "M",
        "F",
        "T"
      ],
      [
        "S",
        "J",
        "M",
        "R",
        "A",
        "J"
      ],
      [
        "J",
        "G",
        "N",
        "Z",
        "S",
        "T"
      ],
      [
        "U",
        "K",
        "O",
        "O",
        "O",
        "V"
      ]
    ],
    "words": [
      {
        "word": "HEAL",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Restore wellness"
      },
      {
        "word": "MEND",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Repair gently"
      },
      {
        "word": "CALM",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Bring peace"
      }
    ]
  },
  {
    "id": 28,
    "theme": "Mindful Focus",
    "grid": [
      [
        "S",
        "E",
        "E",
        "K",
        "G",
        "Q"
      ],
      [
        "F",
        "I",
        "N",
        "D",
        "P",
        "Z"
      ],
      [
        "K",
        "N",
        "O",
        "W",
        "Z",
        "X"
      ],
      [
        "F",
        "V",
        "C",
        "J",
        "Q",
        "V"
      ],
      [
        "U",
        "T",
        "K",
        "C",
        "Y",
        "H"
      ],
      [
        "V",
        "J",
        "H",
        "Z",
        "G",
        "E"
      ]
    ],
    "words": [
      {
        "word": "SEEK",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Look attentively"
      },
      {
        "word": "FIND",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Discover joyfully"
      },
      {
        "word": "KNOW",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Understand clearly"
      }
    ]
  },
  {
    "id": 29,
    "theme": "Flora Garden",
    "grid": [
      [
        "F",
        "E",
        "R",
        "N",
        "A",
        "B"
      ],
      [
        "M",
        "O",
        "S",
        "S",
        "H",
        "P"
      ],
      [
        "B",
        "U",
        "D",
        "T",
        "Y",
        "C"
      ],
      [
        "O",
        "N",
        "U",
        "S",
        "G",
        "W"
      ],
      [
        "W",
        "M",
        "P",
        "M",
        "H",
        "E"
      ],
      [
        "U",
        "W",
        "A",
        "Y",
        "Y",
        "D"
      ]
    ],
    "words": [
      {
        "word": "FERN",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Feathery green plant"
      },
      {
        "word": "MOSS",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Soft green velvet"
      },
      {
        "word": "BUD",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Early flower bud"
      }
    ]
  },
  {
    "id": 30,
    "theme": "Jewels of Earth",
    "grid": [
      [
        "R",
        "U",
        "B",
        "Y",
        "Y",
        "N"
      ],
      [
        "J",
        "A",
        "D",
        "E",
        "H",
        "F"
      ],
      [
        "O",
        "P",
        "A",
        "L",
        "Z",
        "W"
      ],
      [
        "Q",
        "O",
        "B",
        "R",
        "H",
        "D"
      ],
      [
        "O",
        "E",
        "Z",
        "O",
        "V",
        "Q"
      ],
      [
        "R",
        "T",
        "K",
        "Y",
        "O",
        "T"
      ]
    ],
    "words": [
      {
        "word": "RUBY",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Deep red jewel"
      },
      {
        "word": "JADE",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Calming green stone"
      },
      {
        "word": "OPAL",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Shimmering gemstone"
      }
    ]
  },
  {
    "id": 31,
    "theme": "Playful Pets",
    "grid": [
      [
        "P",
        "U",
        "P",
        "X",
        "Q",
        "N"
      ],
      [
        "B",
        "I",
        "R",
        "D",
        "R",
        "O"
      ],
      [
        "D",
        "O",
        "V",
        "E",
        "F",
        "X"
      ],
      [
        "P",
        "O",
        "I",
        "Y",
        "H",
        "U"
      ],
      [
        "I",
        "Y",
        "Y",
        "Q",
        "P",
        "U"
      ],
      [
        "H",
        "I",
        "O",
        "C",
        "W",
        "J"
      ]
    ],
    "words": [
      {
        "word": "PUP",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Playful young dog"
      },
      {
        "word": "BIRD",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Singing sparrow"
      },
      {
        "word": "DOVE",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Symbol of peaceful love"
      }
    ]
  },
  {
    "id": 32,
    "theme": "Harvest Feast",
    "grid": [
      [
        "C",
        "O",
        "R",
        "N",
        "H",
        "I"
      ],
      [
        "W",
        "H",
        "E",
        "A",
        "T",
        "K"
      ],
      [
        "O",
        "A",
        "T",
        "S",
        "K",
        "R"
      ],
      [
        "C",
        "E",
        "E",
        "H",
        "M",
        "W"
      ],
      [
        "E",
        "W",
        "G",
        "C",
        "N",
        "N"
      ],
      [
        "K",
        "R",
        "O",
        "N",
        "B",
        "G"
      ]
    ],
    "words": [
      {
        "word": "CORN",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Golden cob"
      },
      {
        "word": "WHEAT",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Staple grain"
      },
      {
        "word": "OATS",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Wholesome cereal"
      }
    ]
  },
  {
    "id": 33,
    "theme": "Sturdy Trees",
    "grid": [
      [
        "O",
        "A",
        "K",
        "N",
        "M",
        "Y"
      ],
      [
        "T",
        "E",
        "A",
        "K",
        "S",
        "W"
      ],
      [
        "P",
        "A",
        "L",
        "M",
        "A",
        "Y"
      ],
      [
        "S",
        "M",
        "P",
        "A",
        "L",
        "J"
      ],
      [
        "Y",
        "M",
        "N",
        "R",
        "X",
        "X"
      ],
      [
        "R",
        "Z",
        "T",
        "H",
        "P",
        "H"
      ]
    ],
    "words": [
      {
        "word": "OAK",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Sturdy noble tree"
      },
      {
        "word": "TEAK",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Hardwood tree"
      },
      {
        "word": "PALM",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Tropical coastal tree"
      }
    ]
  },
  {
    "id": 34,
    "theme": "River Drifting",
    "grid": [
      [
        "B",
        "O",
        "A",
        "T",
        "I",
        "N"
      ],
      [
        "O",
        "A",
        "R",
        "P",
        "A",
        "M"
      ],
      [
        "D",
        "O",
        "C",
        "K",
        "K",
        "V"
      ],
      [
        "V",
        "Z",
        "M",
        "X",
        "F",
        "O"
      ],
      [
        "E",
        "T",
        "R",
        "A",
        "M",
        "S"
      ],
      [
        "S",
        "V",
        "A",
        "C",
        "U",
        "N"
      ]
    ],
    "words": [
      {
        "word": "BOAT",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Water vessel"
      },
      {
        "word": "OAR",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Rowing paddle"
      },
      {
        "word": "DOCK",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Wooden landing pier"
      }
    ]
  },
  {
    "id": 35,
    "theme": "Vitality",
    "grid": [
      [
        "P",
        "U",
        "R",
        "E",
        "E",
        "O"
      ],
      [
        "W",
        "E",
        "L",
        "L",
        "F",
        "B"
      ],
      [
        "L",
        "I",
        "F",
        "E",
        "I",
        "M"
      ],
      [
        "K",
        "G",
        "O",
        "K",
        "K",
        "Y"
      ],
      [
        "M",
        "I",
        "Y",
        "N",
        "I",
        "C"
      ],
      [
        "P",
        "A",
        "X",
        "R",
        "B",
        "L"
      ]
    ],
    "words": [
      {
        "word": "PURE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Clean & unblemished"
      },
      {
        "word": "WELL",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "In sound health"
      },
      {
        "word": "LIFE",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Living vitality"
      }
    ]
  },
  {
    "id": 36,
    "theme": "Sensory Joy",
    "grid": [
      [
        "S",
        "M",
        "E",
        "L",
        "L",
        "H"
      ],
      [
        "T",
        "A",
        "S",
        "T",
        "E",
        "U"
      ],
      [
        "F",
        "E",
        "E",
        "L",
        "C",
        "Y"
      ],
      [
        "U",
        "B",
        "Y",
        "A",
        "H",
        "G"
      ],
      [
        "A",
        "T",
        "E",
        "H",
        "E",
        "P"
      ],
      [
        "V",
        "D",
        "S",
        "G",
        "O",
        "W"
      ]
    ],
    "words": [
      {
        "word": "SMELL",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Aroma of blossoms"
      },
      {
        "word": "TASTE",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Flavor of sweet fruit"
      },
      {
        "word": "FEEL",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Gentle touch"
      }
    ]
  },
  {
    "id": 37,
    "theme": "Sweet Sleep",
    "grid": [
      [
        "H",
        "U",
        "S",
        "H",
        "I",
        "Y"
      ],
      [
        "S",
        "L",
        "E",
        "E",
        "P",
        "L"
      ],
      [
        "C",
        "A",
        "L",
        "M",
        "F",
        "T"
      ],
      [
        "T",
        "X",
        "W",
        "D",
        "Y",
        "F"
      ],
      [
        "J",
        "D",
        "S",
        "A",
        "J",
        "S"
      ],
      [
        "V",
        "M",
        "M",
        "W",
        "G",
        "C"
      ]
    ],
    "words": [
      {
        "word": "HUSH",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Peaceful quiet"
      },
      {
        "word": "SLEEP",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Deep rest"
      },
      {
        "word": "CALM",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Serene repose"
      }
    ]
  },
  {
    "id": 38,
    "theme": "Travel Road",
    "grid": [
      [
        "R",
        "O",
        "A",
        "D",
        "S",
        "W"
      ],
      [
        "T",
        "R",
        "I",
        "P",
        "U",
        "H"
      ],
      [
        "M",
        "A",
        "P",
        "D",
        "W",
        "Y"
      ],
      [
        "J",
        "V",
        "T",
        "Z",
        "D",
        "Z"
      ],
      [
        "S",
        "Z",
        "B",
        "L",
        "R",
        "N"
      ],
      [
        "V",
        "L",
        "C",
        "Q",
        "U",
        "K"
      ]
    ],
    "words": [
      {
        "word": "ROAD",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Pathway home"
      },
      {
        "word": "TRIP",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Pleasant excursion"
      },
      {
        "word": "MAP",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Travel guide"
      }
    ]
  },
  {
    "id": 39,
    "theme": "Caring Acts",
    "grid": [
      [
        "G",
        "I",
        "V",
        "E",
        "A",
        "N"
      ],
      [
        "C",
        "A",
        "R",
        "E",
        "P",
        "D"
      ],
      [
        "H",
        "E",
        "L",
        "P",
        "N",
        "L"
      ],
      [
        "U",
        "O",
        "W",
        "E",
        "N",
        "F"
      ],
      [
        "X",
        "Q",
        "U",
        "I",
        "T",
        "Z"
      ],
      [
        "R",
        "Y",
        "P",
        "O",
        "N",
        "X"
      ]
    ],
    "words": [
      {
        "word": "GIVE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Share generously"
      },
      {
        "word": "CARE",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Look after warmly"
      },
      {
        "word": "HELP",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Lend assistance"
      }
    ]
  },
  {
    "id": 40,
    "theme": "Fireside Warmth",
    "grid": [
      [
        "C",
        "O",
        "A",
        "L",
        "S",
        "I"
      ],
      [
        "W",
        "O",
        "O",
        "D",
        "K",
        "H"
      ],
      [
        "W",
        "A",
        "R",
        "M",
        "C",
        "I"
      ],
      [
        "O",
        "H",
        "Y",
        "O",
        "S",
        "T"
      ],
      [
        "V",
        "M",
        "K",
        "A",
        "P",
        "K"
      ],
      [
        "F",
        "P",
        "G",
        "L",
        "Z",
        "I"
      ]
    ],
    "words": [
      {
        "word": "COAL",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Glowing ember"
      },
      {
        "word": "WOOD",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Firewood log"
      },
      {
        "word": "WARM",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Pleasant temperature"
      }
    ]
  },
  {
    "id": 41,
    "theme": "Sunny Glow",
    "grid": [
      [
        "S",
        "U",
        "N",
        "N",
        "Y",
        "K"
      ],
      [
        "B",
        "R",
        "I",
        "G",
        "H",
        "T"
      ],
      [
        "G",
        "O",
        "L",
        "D",
        "I",
        "T"
      ],
      [
        "W",
        "I",
        "R",
        "A",
        "Q",
        "G"
      ],
      [
        "C",
        "H",
        "X",
        "N",
        "P",
        "R"
      ],
      [
        "Y",
        "H",
        "W",
        "P",
        "U",
        "W"
      ]
    ],
    "words": [
      {
        "word": "SUNNY",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Bright day"
      },
      {
        "word": "BRIGHT",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 6,
        "hint": "Full of light"
      },
      {
        "word": "GOLD",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Warm golden shade"
      }
    ]
  },
  {
    "id": 42,
    "theme": "Bakery Oven",
    "grid": [
      [
        "B",
        "R",
        "E",
        "A",
        "D",
        "P"
      ],
      [
        "O",
        "V",
        "E",
        "N",
        "O",
        "Z"
      ],
      [
        "B",
        "U",
        "N",
        "A",
        "C",
        "J"
      ],
      [
        "H",
        "M",
        "W",
        "H",
        "J",
        "V"
      ],
      [
        "S",
        "L",
        "P",
        "R",
        "Q",
        "L"
      ],
      [
        "N",
        "X",
        "R",
        "K",
        "L",
        "W"
      ]
    ],
    "words": [
      {
        "word": "BREAD",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Fresh baked loaf"
      },
      {
        "word": "OVEN",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Baking chamber"
      },
      {
        "word": "BUN",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Small sweet bread"
      }
    ]
  },
  {
    "id": 43,
    "theme": "Feathered Friends",
    "grid": [
      [
        "M",
        "Y",
        "N",
        "A",
        "O",
        "I"
      ],
      [
        "C",
        "R",
        "O",
        "W",
        "J",
        "I"
      ],
      [
        "S",
        "W",
        "A",
        "N",
        "H",
        "D"
      ],
      [
        "X",
        "G",
        "K",
        "D",
        "X",
        "R"
      ],
      [
        "Y",
        "W",
        "F",
        "G",
        "G",
        "X"
      ],
      [
        "P",
        "I",
        "X",
        "S",
        "Y",
        "Q"
      ]
    ],
    "words": [
      {
        "word": "MYNA",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Chirping local bird"
      },
      {
        "word": "CROW",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Clever friendly bird"
      },
      {
        "word": "SWAN",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Graceful white bird"
      }
    ]
  },
  {
    "id": 44,
    "theme": "Sacred Diya",
    "grid": [
      [
        "L",
        "A",
        "M",
        "P",
        "T",
        "J"
      ],
      [
        "D",
        "I",
        "Y",
        "A",
        "D",
        "G"
      ],
      [
        "G",
        "L",
        "O",
        "W",
        "J",
        "H"
      ],
      [
        "L",
        "F",
        "J",
        "A",
        "W",
        "R"
      ],
      [
        "E",
        "I",
        "B",
        "B",
        "R",
        "J"
      ],
      [
        "W",
        "E",
        "U",
        "Y",
        "P",
        "D"
      ]
    ],
    "words": [
      {
        "word": "LAMP",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Source of illumination"
      },
      {
        "word": "DIYA",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Clay oil light"
      },
      {
        "word": "GLOW",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Soft warm radiance"
      }
    ]
  },
  {
    "id": 45,
    "theme": "Indian Meals",
    "grid": [
      [
        "R",
        "O",
        "T",
        "I",
        "A",
        "S"
      ],
      [
        "D",
        "A",
        "L",
        "J",
        "P",
        "P"
      ],
      [
        "C",
        "U",
        "R",
        "D",
        "O",
        "K"
      ],
      [
        "F",
        "B",
        "I",
        "P",
        "D",
        "C"
      ],
      [
        "M",
        "P",
        "C",
        "S",
        "U",
        "V"
      ],
      [
        "B",
        "E",
        "E",
        "Z",
        "S",
        "J"
      ]
    ],
    "words": [
      {
        "word": "ROTI",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Warm flatbread"
      },
      {
        "word": "DAL",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 3,
        "hint": "Nourishing lentil soup"
      },
      {
        "word": "CURD",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Cool soothing yogurt"
      }
    ]
  },
  {
    "id": 46,
    "theme": "Mela Days",
    "grid": [
      [
        "M",
        "E",
        "L",
        "A",
        "C",
        "H"
      ],
      [
        "R",
        "A",
        "N",
        "G",
        "D",
        "R"
      ],
      [
        "D",
        "H",
        "O",
        "L",
        "Y",
        "N"
      ],
      [
        "T",
        "T",
        "Z",
        "T",
        "H",
        "Y"
      ],
      [
        "Q",
        "M",
        "O",
        "O",
        "J",
        "S"
      ],
      [
        "N",
        "J",
        "S",
        "T",
        "B",
        "T"
      ]
    ],
    "words": [
      {
        "word": "MELA",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Joyful local fair"
      },
      {
        "word": "RANG",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Vibrant colors"
      },
      {
        "word": "DHOL",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Celebratory drum"
      }
    ]
  },
  {
    "id": 47,
    "theme": "Virtues",
    "grid": [
      [
        "T",
        "R",
        "U",
        "E",
        "X",
        "D"
      ],
      [
        "W",
        "I",
        "S",
        "E",
        "Y",
        "G"
      ],
      [
        "G",
        "O",
        "O",
        "D",
        "U",
        "G"
      ],
      [
        "I",
        "V",
        "C",
        "F",
        "H",
        "F"
      ],
      [
        "R",
        "C",
        "F",
        "A",
        "N",
        "O"
      ],
      [
        "W",
        "T",
        "P",
        "J",
        "B",
        "H"
      ]
    ],
    "words": [
      {
        "word": "TRUE",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Honest & accurate"
      },
      {
        "word": "WISE",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Deeply knowledgeable"
      },
      {
        "word": "GOOD",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Beneficial & kind"
      }
    ]
  },
  {
    "id": 48,
    "theme": "Flowing Waters",
    "grid": [
      [
        "B",
        "R",
        "O",
        "O",
        "K",
        "J"
      ],
      [
        "R",
        "I",
        "V",
        "E",
        "R",
        "W"
      ],
      [
        "S",
        "E",
        "A",
        "S",
        "J",
        "W"
      ],
      [
        "O",
        "C",
        "V",
        "H",
        "I",
        "Z"
      ],
      [
        "Z",
        "U",
        "S",
        "V",
        "Z",
        "G"
      ],
      [
        "N",
        "D",
        "R",
        "H",
        "U",
        "E"
      ]
    ],
    "words": [
      {
        "word": "BROOK",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Small clear stream"
      },
      {
        "word": "RIVER",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 5,
        "hint": "Flowing waterway"
      },
      {
        "word": "SEAS",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Vast oceans"
      }
    ]
  },
  {
    "id": 49,
    "theme": "Past Days",
    "grid": [
      [
        "P",
        "A",
        "S",
        "T",
        "I",
        "E"
      ],
      [
        "T",
        "I",
        "M",
        "E",
        "C",
        "B"
      ],
      [
        "D",
        "A",
        "Y",
        "S",
        "F",
        "Z"
      ],
      [
        "J",
        "T",
        "X",
        "S",
        "J",
        "O"
      ],
      [
        "D",
        "O",
        "W",
        "J",
        "W",
        "M"
      ],
      [
        "I",
        "Q",
        "R",
        "P",
        "O",
        "C"
      ]
    ],
    "words": [
      {
        "word": "PAST",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Precious bygone days"
      },
      {
        "word": "TIME",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Flow of moments"
      },
      {
        "word": "DAYS",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Sunlit memories"
      }
    ]
  },
  {
    "id": 50,
    "theme": "Sky Dawn",
    "grid": [
      [
        "D",
        "A",
        "W",
        "N",
        "T",
        "B"
      ],
      [
        "N",
        "O",
        "O",
        "N",
        "N",
        "X"
      ],
      [
        "D",
        "U",
        "S",
        "K",
        "K",
        "T"
      ],
      [
        "I",
        "A",
        "C",
        "H",
        "V",
        "S"
      ],
      [
        "S",
        "A",
        "Y",
        "V",
        "I",
        "S"
      ],
      [
        "B",
        "Y",
        "Y",
        "F",
        "P",
        "Q"
      ]
    ],
    "words": [
      {
        "word": "DAWN",
        "row": 0,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Sunrise beginning"
      },
      {
        "word": "NOON",
        "row": 1,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Midday brightness"
      },
      {
        "word": "DUSK",
        "row": 2,
        "col": 0,
        "dir": "horizontal",
        "length": 4,
        "hint": "Sunset completion"
      }
    ]
  }
];
export const LEVEL_2_WORD_SEARCH = LEVEL_2_WORD_SEARCH_POOLS[0];

// Level 3: 50 Crossword Pools
export const LEVEL_3_CROSSWORD_POOLS = [
  {
    "id": 1,
    "theme": "Morning Refreshment",
    "words": [
      {
        "id": 1,
        "clue": "Hot morning drink brewed from leaves",
        "answer": "TEA",
        "length": 3,
        "options": [
          "TEA",
          "MILK",
          "WATER"
        ]
      },
      {
        "id": 2,
        "clue": "The bright daytime star in the sky",
        "answer": "SUN",
        "length": 3,
        "options": [
          "SUN",
          "MOON",
          "STAR"
        ]
      },
      {
        "id": 3,
        "clue": "Loyal furry companion that barks",
        "answer": "DOG",
        "length": 3,
        "options": [
          "DOG",
          "CAT",
          "COW"
        ]
      }
    ]
  },
  {
    "id": 2,
    "theme": "Kitchen Comfort",
    "words": [
      {
        "id": 1,
        "clue": "Yellow fruit loved by monkeys",
        "answer": "BANANA",
        "length": 6,
        "options": [
          "BANANA",
          "MANGO",
          "APPLE"
        ]
      },
      {
        "id": 2,
        "clue": "Utensil used to drink warm chai",
        "answer": "CUP",
        "length": 3,
        "options": [
          "CUP",
          "PAN",
          "FORK"
        ]
      },
      {
        "id": 3,
        "clue": "White crystal that adds sweet taste",
        "answer": "SUGAR",
        "length": 5,
        "options": [
          "SUGAR",
          "SALT",
          "PEPPER"
        ]
      }
    ]
  },
  {
    "id": 3,
    "theme": "Nature Wonders",
    "words": [
      {
        "id": 1,
        "clue": "Gentle bird that coos in peaceful gardens",
        "answer": "DOVE",
        "length": 4,
        "options": [
          "DOVE",
          "CROW",
          "HAWK"
        ]
      },
      {
        "id": 2,
        "clue": "Tall plant with trunk and green leaves",
        "answer": "TREE",
        "length": 4,
        "options": [
          "TREE",
          "GRASS",
          "REED"
        ]
      },
      {
        "id": 3,
        "clue": "Flowing freshwater body leading to ocean",
        "answer": "RIVER",
        "length": 5,
        "options": [
          "RIVER",
          "POND",
          "WELL"
        ]
      }
    ]
  },
  {
    "id": 4,
    "theme": "Daily Wellness",
    "words": [
      {
        "id": 1,
        "clue": "Essential clear liquid we drink daily",
        "answer": "WATER",
        "length": 5,
        "options": [
          "WATER",
          "OIL",
          "HONEY"
        ]
      },
      {
        "id": 2,
        "clue": "Restful night slumber for body repair",
        "answer": "SLEEP",
        "length": 5,
        "options": [
          "SLEEP",
          "WALK",
          "WORK"
        ]
      },
      {
        "id": 3,
        "clue": "Joyful expression made with lips",
        "answer": "SMILE",
        "length": 5,
        "options": [
          "SMILE",
          "FROWN",
          "YAWN"
        ]
      }
    ]
  },
  {
    "id": 5,
    "theme": "Indian Heritage",
    "words": [
      {
        "id": 1,
        "clue": "Sacred pink blossom floating on lakes",
        "answer": "LOTUS",
        "length": 5,
        "options": [
          "LOTUS",
          "ROSE",
          "DAISY"
        ]
      },
      {
        "id": 2,
        "clue": "Clay oil lamp lit during Diwali",
        "answer": "DIYA",
        "length": 4,
        "options": [
          "DIYA",
          "TORCH",
          "BULB"
        ]
      },
      {
        "id": 3,
        "clue": "Spiced aromatic tea with cardamom",
        "answer": "CHAI",
        "length": 4,
        "options": [
          "CHAI",
          "COFFEE",
          "JUICE"
        ]
      }
    ]
  },
  {
    "id": 6,
    "theme": "Seasons & Sky",
    "words": [
      {
        "id": 1,
        "clue": "White fluffy mass floating in blue sky",
        "answer": "CLOUD",
        "length": 5,
        "options": [
          "CLOUD",
          "SMOKE",
          "DUST"
        ]
      },
      {
        "id": 2,
        "clue": "Falling droplets of fresh weather",
        "answer": "RAIN",
        "length": 4,
        "options": [
          "RAIN",
          "SNOW",
          "HAIL"
        ]
      },
      {
        "id": 3,
        "clue": "Gentle current of cool outdoor air",
        "answer": "BREEZE",
        "length": 6,
        "options": [
          "BREEZE",
          "STORM",
          "GALE"
        ]
      }
    ]
  },
  {
    "id": 7,
    "theme": "Garden Delights",
    "words": [
      {
        "id": 1,
        "clue": "Queen of fragrant garden flowers",
        "answer": "ROSE",
        "length": 4,
        "options": [
          "ROSE",
          "MOSS",
          "WEED"
        ]
      },
      {
        "id": 2,
        "clue": "Green blade covering a garden lawn",
        "answer": "GRASS",
        "length": 5,
        "options": [
          "GRASS",
          "STONE",
          "BARK"
        ]
      },
      {
        "id": 3,
        "clue": "Flying insect with colorful painted wings",
        "answer": "BUTTERFLY",
        "length": 9,
        "options": [
          "BUTTERFLY",
          "BEETLE",
          "ANT"
        ]
      }
    ]
  },
  {
    "id": 8,
    "theme": "Music & Sound",
    "words": [
      {
        "id": 1,
        "clue": "Stringed wooden instrument with sweet tone",
        "answer": "GUITAR",
        "length": 6,
        "options": [
          "GUITAR",
          "DRUM",
          "HORN"
        ]
      },
      {
        "id": 2,
        "clue": "Pleasing sequence of musical notes",
        "answer": "TUNE",
        "length": 4,
        "options": [
          "TUNE",
          "NOISE",
          "CLAP"
        ]
      },
      {
        "id": 3,
        "clue": "Rhythmic percussion instrument",
        "answer": "DRUM",
        "length": 4,
        "options": [
          "DRUM",
          "FLUTE",
          "BELL"
        ]
      }
    ]
  },
  {
    "id": 9,
    "theme": "Home & Living",
    "words": [
      {
        "id": 1,
        "clue": "Cozy piece of furniture where we rest",
        "answer": "BED",
        "length": 3,
        "options": [
          "BED",
          "DESK",
          "SHELF"
        ]
      },
      {
        "id": 2,
        "clue": "Opening in wall that lets in fresh breeze",
        "answer": "WINDOW",
        "length": 6,
        "options": [
          "WINDOW",
          "FLOOR",
          "ROOF"
        ]
      },
      {
        "id": 3,
        "clue": "Barrier with a handle welcoming guests",
        "answer": "DOOR",
        "length": 4,
        "options": [
          "DOOR",
          "GATE",
          "WALL"
        ]
      }
    ]
  },
  {
    "id": 10,
    "theme": "Sweet Delicacies",
    "words": [
      {
        "id": 1,
        "clue": "Golden sweet nectar made by bees",
        "answer": "HONEY",
        "length": 5,
        "options": [
          "HONEY",
          "SYRUP",
          "JAM"
        ]
      },
      {
        "id": 2,
        "clue": "Baked sweet treat for birthdays",
        "answer": "CAKE",
        "length": 4,
        "options": [
          "CAKE",
          "BREAD",
          "PIE"
        ]
      },
      {
        "id": 3,
        "clue": "Creamy cold treat on a warm summer day",
        "answer": "ICECREAM",
        "length": 8,
        "options": [
          "ICECREAM",
          "PUDDING",
          "CUSTARD"
        ]
      }
    ]
  },
  {
    "id": 11,
    "theme": "Ocean & Shore",
    "words": [
      {
        "id": 1,
        "clue": "Vast blue saltwater body of the world",
        "answer": "OCEAN",
        "length": 5,
        "options": [
          "OCEAN",
          "RIVER",
          "POND"
        ]
      },
      {
        "id": 2,
        "clue": "Small aquatic animal with scales and fins",
        "answer": "FISH",
        "length": 4,
        "options": [
          "FISH",
          "CRAB",
          "FROG"
        ]
      },
      {
        "id": 3,
        "clue": "Soft granular ground along sea beach",
        "answer": "SAND",
        "length": 4,
        "options": [
          "SAND",
          "MUD",
          "CLAY"
        ]
      }
    ]
  },
  {
    "id": 12,
    "theme": "Nostalgic Travel",
    "words": [
      {
        "id": 1,
        "clue": "Vehicle running on long steel tracks",
        "answer": "TRAIN",
        "length": 5,
        "options": [
          "TRAIN",
          "BUS",
          "CAR"
        ]
      },
      {
        "id": 2,
        "clue": "Watercraft that sails along calm waters",
        "answer": "BOAT",
        "length": 4,
        "options": [
          "BOAT",
          "PLANE",
          "CART"
        ]
      },
      {
        "id": 3,
        "clue": "Pathway leading through green park",
        "answer": "TRAIL",
        "length": 5,
        "options": [
          "TRAIL",
          "HIGHWAY",
          "BRIDGE"
        ]
      }
    ]
  },
  {
    "id": 13,
    "theme": "Peaceful Night",
    "words": [
      {
        "id": 1,
        "clue": "Silver orb illuminating the midnight sky",
        "answer": "MOON",
        "length": 4,
        "options": [
          "MOON",
          "SUN",
          "COMET"
        ]
      },
      {
        "id": 2,
        "clue": "Tiny twinkling light in dark heavens",
        "answer": "STAR",
        "length": 4,
        "options": [
          "STAR",
          "PLANET",
          "LAMP"
        ]
      },
      {
        "id": 3,
        "clue": "Cozy covering that keeps us warm at night",
        "answer": "BLANKET",
        "length": 7,
        "options": [
          "BLANKET",
          "CURTAIN",
          "RUG"
        ]
      }
    ]
  },
  {
    "id": 14,
    "theme": "Colors Around Us",
    "words": [
      {
        "id": 1,
        "clue": "Color of the clear daytime sky",
        "answer": "BLUE",
        "length": 4,
        "options": [
          "BLUE",
          "RED",
          "YELLOW"
        ]
      },
      {
        "id": 2,
        "clue": "Color of fresh spring garden leaves",
        "answer": "GREEN",
        "length": 5,
        "options": [
          "GREEN",
          "BROWN",
          "PURPLE"
        ]
      },
      {
        "id": 3,
        "clue": "Color of ripe sweet strawberries",
        "answer": "RED",
        "length": 3,
        "options": [
          "RED",
          "BLUE",
          "BLACK"
        ]
      }
    ]
  },
  {
    "id": 15,
    "theme": "Family & Kin",
    "words": [
      {
        "id": 1,
        "clue": "Warm hug given to loved ones",
        "answer": "EMBRACE",
        "length": 7,
        "options": [
          "EMBRACE",
          "WAVE",
          "NOD"
        ]
      },
      {
        "id": 2,
        "clue": "Precious memories of cherished family",
        "answer": "ALBUM",
        "length": 5,
        "options": [
          "ALBUM",
          "LETTER",
          "DIARY"
        ]
      },
      {
        "id": 3,
        "clue": "A caring person who stands by us",
        "answer": "FRIEND",
        "length": 6,
        "options": [
          "FRIEND",
          "STRANGER",
          "GUEST"
        ]
      }
    ]
  },
  {
    "id": 16,
    "theme": "Writing & Wisdom",
    "words": [
      {
        "id": 1,
        "clue": "Bound pages containing wisdom and stories",
        "answer": "BOOK",
        "length": 4,
        "options": [
          "BOOK",
          "PAPER",
          "PEN"
        ]
      },
      {
        "id": 2,
        "clue": "Instrument with ink used to write notes",
        "answer": "PEN",
        "length": 3,
        "options": [
          "PEN",
          "CHALK",
          "BRUSH"
        ]
      },
      {
        "id": 3,
        "clue": "Message sent through the post to family",
        "answer": "LETTER",
        "length": 6,
        "options": [
          "LETTER",
          "PARCEL",
          "CARD"
        ]
      }
    ]
  },
  {
    "id": 17,
    "theme": "Spices & Aromas",
    "words": [
      {
        "id": 1,
        "clue": "Golden spice with powerful healing benefits",
        "answer": "TURMERIC",
        "length": 8,
        "options": [
          "TURMERIC",
          "PEPPER",
          "CLOVE"
        ]
      },
      {
        "id": 2,
        "clue": "Sweet fragrant brown spice bark",
        "answer": "CINNAMON",
        "length": 8,
        "options": [
          "CINNAMON",
          "CUMIN",
          "CARDAMOM"
        ]
      },
      {
        "id": 3,
        "clue": "Aromatic herb that adds fresh flavor",
        "answer": "MINT",
        "length": 4,
        "options": [
          "MINT",
          "BASIL",
          "CORIANDER"
        ]
      }
    ]
  },
  {
    "id": 18,
    "theme": "Farm Companions",
    "words": [
      {
        "id": 1,
        "clue": "Gentle animal that provides fresh milk",
        "answer": "COW",
        "length": 3,
        "options": [
          "COW",
          "HORSE",
          "SHEEP"
        ]
      },
      {
        "id": 2,
        "clue": "Feathered morning bird that crows at dawn",
        "answer": "ROOSTER",
        "length": 7,
        "options": [
          "ROOSTER",
          "DUCK",
          "GOOSE"
        ]
      },
      {
        "id": 3,
        "clue": "Woolly farm animal that grazes quietly",
        "answer": "SHEEP",
        "length": 5,
        "options": [
          "SHEEP",
          "GOAT",
          "PIG"
        ]
      }
    ]
  },
  {
    "id": 19,
    "theme": "Time & Rhythm",
    "words": [
      {
        "id": 1,
        "clue": "Device on wall that ticks every second",
        "answer": "CLOCK",
        "length": 5,
        "options": [
          "CLOCK",
          "RADIO",
          "PHONE"
        ]
      },
      {
        "id": 2,
        "clue": "Chart showing months and special dates",
        "answer": "CALENDAR",
        "length": 8,
        "options": [
          "CALENDAR",
          "MAP",
          "CHART"
        ]
      },
      {
        "id": 3,
        "clue": "Moment when day transitions into evening",
        "answer": "SUNSET",
        "length": 6,
        "options": [
          "SUNSET",
          "NOON",
          "DAWN"
        ]
      }
    ]
  },
  {
    "id": 20,
    "theme": "Comfort Wear",
    "words": [
      {
        "id": 1,
        "clue": "Warm knit garment worn in winter",
        "answer": "SWEATER",
        "length": 7,
        "options": [
          "SWEATER",
          "SHIRT",
          "COAT"
        ]
      },
      {
        "id": 2,
        "clue": "Soft footwear worn around the house",
        "answer": "SLIPPERS",
        "length": 8,
        "options": [
          "SLIPPERS",
          "BOOTS",
          "SHOES"
        ]
      },
      {
        "id": 3,
        "clue": "Canopy held overhead during rain showers",
        "answer": "UMBRELLA",
        "length": 8,
        "options": [
          "UMBRELLA",
          "HAT",
          "HOOD"
        ]
      }
    ]
  },
  {
    "id": 21,
    "theme": "Forest Life",
    "words": [
      {
        "id": 1,
        "clue": "Wooded area full of tall leafy trees",
        "answer": "FOREST",
        "length": 6,
        "options": [
          "FOREST",
          "DESERT",
          "FIELD"
        ]
      },
      {
        "id": 2,
        "clue": "Small animal that gathers acorns in trees",
        "answer": "SQUIRREL",
        "length": 8,
        "options": [
          "SQUIRREL",
          "RABBIT",
          "MOLE"
        ]
      },
      {
        "id": 3,
        "clue": "Pinecone producing evergreen tree",
        "answer": "PINE",
        "length": 4,
        "options": [
          "PINE",
          "OAK",
          "BIRCH"
        ]
      }
    ]
  },
  {
    "id": 22,
    "theme": "Celebrations",
    "words": [
      {
        "id": 1,
        "clue": "Lighting a flame on birthday pastry",
        "answer": "CANDLE",
        "length": 6,
        "options": [
          "CANDLE",
          "TORCH",
          "MATCH"
        ]
      },
      {
        "id": 2,
        "clue": "Special melody sung on celebrations",
        "answer": "SONG",
        "length": 4,
        "options": [
          "SONG",
          "POEM",
          "SPEECH"
        ]
      },
      {
        "id": 3,
        "clue": "A joyful surprise wrapped in ribbon",
        "answer": "GIFT",
        "length": 4,
        "options": [
          "GIFT",
          "LETTER",
          "BOX"
        ]
      }
    ]
  },
  {
    "id": 23,
    "theme": "Healthy Body",
    "words": [
      {
        "id": 1,
        "clue": "Organ that pumps vital blood through body",
        "answer": "HEART",
        "length": 5,
        "options": [
          "HEART",
          "LUNGS",
          "LIVER"
        ]
      },
      {
        "id": 2,
        "clue": "Morning walk that keeps limbs active",
        "answer": "EXERCISE",
        "length": 8,
        "options": [
          "EXERCISE",
          "SLEEP",
          "REST"
        ]
      },
      {
        "id": 3,
        "clue": "Fresh crisp garden salad ingredient",
        "answer": "CARROT",
        "length": 6,
        "options": [
          "CARROT",
          "POTATO",
          "ONION"
        ]
      }
    ]
  },
  {
    "id": 24,
    "theme": "Crafts & Art",
    "words": [
      {
        "id": 1,
        "clue": "Pigments used to paint serene scenery",
        "answer": "PAINT",
        "length": 5,
        "options": [
          "PAINT",
          "INK",
          "DYE"
        ]
      },
      {
        "id": 2,
        "clue": "Woven fiber used for knitting warmth",
        "answer": "YARN",
        "length": 4,
        "options": [
          "YARN",
          "ROPE",
          "WIRE"
        ]
      },
      {
        "id": 3,
        "clue": "Woven basket made of natural cane",
        "answer": "BASKET",
        "length": 6,
        "options": [
          "BASKET",
          "BOX",
          "BAG"
        ]
      }
    ]
  },
  {
    "id": 25,
    "theme": "River Crossing",
    "words": [
      {
        "id": 1,
        "clue": "Architectural span over flowing waters",
        "answer": "BRIDGE",
        "length": 6,
        "options": [
          "BRIDGE",
          "TUNNEL",
          "ROAD"
        ]
      },
      {
        "id": 2,
        "clue": "Wooden paddle used to guide a rowboat",
        "answer": "OAR",
        "length": 3,
        "options": [
          "OAR",
          "ROD",
          "POLE"
        ]
      },
      {
        "id": 3,
        "clue": "Place where boats anchor near shore",
        "answer": "HARBOR",
        "length": 6,
        "options": [
          "HARBOR",
          "CANAL",
          "LAKE"
        ]
      }
    ]
  },
  {
    "id": 26,
    "theme": "Good Morning",
    "words": [
      {
        "id": 1,
        "clue": "Morning meal enjoyed after sunrise",
        "answer": "BREAKFAST",
        "length": 9,
        "options": [
          "BREAKFAST",
          "LUNCH",
          "DINNER"
        ]
      },
      {
        "id": 2,
        "clue": "Morning dew sparkling on green leaves",
        "answer": "DEW",
        "length": 3,
        "options": [
          "DEW",
          "FROST",
          "MIST"
        ]
      },
      {
        "id": 3,
        "clue": "Cheerful bird song at break of dawn",
        "answer": "CHIRP",
        "length": 5,
        "options": [
          "CHIRP",
          "BARK",
          "MEOW"
        ]
      }
    ]
  },
  {
    "id": 27,
    "theme": "Sacred Sounds",
    "words": [
      {
        "id": 1,
        "clue": "Ringing metal instrument in sanctuaries",
        "answer": "BELL",
        "length": 4,
        "options": [
          "BELL",
          "DRUM",
          "CYMBAL"
        ]
      },
      {
        "id": 2,
        "clue": "Sacred chanting of peaceful hymns",
        "answer": "PRAYER",
        "length": 6,
        "options": [
          "PRAYER",
          "TALK",
          "STORY"
        ]
      },
      {
        "id": 3,
        "clue": "Sweet wooden wind instrument",
        "answer": "FLUTE",
        "length": 5,
        "options": [
          "FLUTE",
          "HORN",
          "VIOLIN"
        ]
      }
    ]
  },
  {
    "id": 28,
    "theme": "Kitchen Utensils",
    "words": [
      {
        "id": 1,
        "clue": "Wide shallow dish for serving hot meals",
        "answer": "PLATE",
        "length": 5,
        "options": [
          "PLATE",
          "BOWL",
          "TRAY"
        ]
      },
      {
        "id": 2,
        "clue": "Deep vessel for boiling nourishing soups",
        "answer": "POT",
        "length": 3,
        "options": [
          "POT",
          "PAN",
          "KETTLE"
        ]
      },
      {
        "id": 3,
        "clue": "Utensil used for scooping warm curry",
        "answer": "SPOON",
        "length": 5,
        "options": [
          "SPOON",
          "KNIFE",
          "FORK"
        ]
      }
    ]
  },
  {
    "id": 29,
    "theme": "Fruit Orchard",
    "words": [
      {
        "id": 1,
        "clue": "Juicy orange fruit packed with vitamin C",
        "answer": "ORANGE",
        "length": 6,
        "options": [
          "ORANGE",
          "LEMON",
          "LIME"
        ]
      },
      {
        "id": 2,
        "clue": "Bunch of purple or green sweet berries",
        "answer": "GRAPES",
        "length": 6,
        "options": [
          "GRAPES",
          "BERRIES",
          "CHERRIES"
        ]
      },
      {
        "id": 3,
        "clue": "King of Indian summer orchard fruits",
        "answer": "MANGO",
        "length": 5,
        "options": [
          "MANGO",
          "PAPAYA",
          "GUAVA"
        ]
      }
    ]
  },
  {
    "id": 30,
    "theme": "Village Memories",
    "words": [
      {
        "id": 1,
        "clue": "Traditional water reservoir in courtyard",
        "answer": "WELL",
        "length": 4,
        "options": [
          "WELL",
          "TANK",
          "FOUNTAIN"
        ]
      },
      {
        "id": 2,
        "clue": "Quiet countryside path between fields",
        "answer": "LANE",
        "length": 4,
        "options": [
          "LANE",
          "ROAD",
          "HIGHWAY"
        ]
      },
      {
        "id": 3,
        "clue": "Shaded courtyard porch for afternoon chats",
        "answer": "VERANDA",
        "length": 7,
        "options": [
          "VERANDA",
          "BALCONY",
          "ROOF"
        ]
      }
    ]
  },
  {
    "id": 31,
    "theme": "Uplifting Emotions",
    "words": [
      {
        "id": 1,
        "clue": "Feeling of deep inner contentment",
        "answer": "PEACE",
        "length": 5,
        "options": [
          "PEACE",
          "ANGER",
          "WORRY"
        ]
      },
      {
        "id": 2,
        "clue": "Thankfulness for everyday blessings",
        "answer": "GRATITUDE",
        "length": 9,
        "options": [
          "GRATITUDE",
          "PRIDE",
          "GREED"
        ]
      },
      {
        "id": 3,
        "clue": "Deep fondness and care for family",
        "answer": "LOVE",
        "length": 4,
        "options": [
          "LOVE",
          "ENVY",
          "DOUBT"
        ]
      }
    ]
  },
  {
    "id": 32,
    "theme": "Warm Beverages",
    "words": [
      {
        "id": 1,
        "clue": "Nourishing white drink rich in calcium",
        "answer": "MILK",
        "length": 4,
        "options": [
          "MILK",
          "WATER",
          "JUICE"
        ]
      },
      {
        "id": 2,
        "clue": "Dark roasted morning brew from beans",
        "answer": "COFFEE",
        "length": 6,
        "options": [
          "COFFEE",
          "TEA",
          "SODA"
        ]
      },
      {
        "id": 3,
        "clue": "Warm spiced broth with ginger and herbs",
        "answer": "KADHA",
        "length": 5,
        "options": [
          "KADHA",
          "SOUP",
          "TEA"
        ]
      }
    ]
  },
  {
    "id": 33,
    "theme": "Gentle Flora",
    "words": [
      {
        "id": 1,
        "clue": "White blossom with golden sunny center",
        "answer": "DAISY",
        "length": 5,
        "options": [
          "DAISY",
          "POPPY",
          "ROSE"
        ]
      },
      {
        "id": 2,
        "clue": "Aromatic flower widely used in garlands",
        "answer": "JASMINE",
        "length": 7,
        "options": [
          "JASMINE",
          "TULIP",
          "ORCHID"
        ]
      },
      {
        "id": 3,
        "clue": "Bright tall yellow flower facing the sun",
        "answer": "SUNFLOWER",
        "length": 9,
        "options": [
          "SUNFLOWER",
          "MARIGOLD",
          "LOTUS"
        ]
      }
    ]
  },
  {
    "id": 34,
    "theme": "Cozy Lighting",
    "words": [
      {
        "id": 1,
        "clue": "Source of steady warm illumination",
        "answer": "LAMP",
        "length": 4,
        "options": [
          "LAMP",
          "MATCH",
          "FLINT"
        ]
      },
      {
        "id": 2,
        "clue": "Carried lantern with protective glass",
        "answer": "LANTERN",
        "length": 7,
        "options": [
          "LANTERN",
          "TORCH",
          "DIYA"
        ]
      },
      {
        "id": 3,
        "clue": "Gentle glow produced by fireplace logs",
        "answer": "EMBER",
        "length": 5,
        "options": [
          "EMBER",
          "SPARK",
          "SMOKE"
        ]
      }
    ]
  },
  {
    "id": 35,
    "theme": "Birds in Flight",
    "words": [
      {
        "id": 1,
        "clue": "National bird of India with jade feathers",
        "answer": "PEACOCK",
        "length": 7,
        "options": [
          "PEACOCK",
          "PARROT",
          "CRANE"
        ]
      },
      {
        "id": 2,
        "clue": "Green bird that mimics gentle speech",
        "answer": "PARROT",
        "length": 6,
        "options": [
          "PARROT",
          "EAGLE",
          "OWL"
        ]
      },
      {
        "id": 3,
        "clue": "Graceful white waterbird swimming calmly",
        "answer": "SWAN",
        "length": 4,
        "options": [
          "SWAN",
          "DUCK",
          "SEAGULL"
        ]
      }
    ]
  },
  {
    "id": 36,
    "theme": "Wholesome Grains",
    "words": [
      {
        "id": 1,
        "clue": "Steamed white grain served with dal",
        "answer": "RICE",
        "length": 4,
        "options": [
          "RICE",
          "WHEAT",
          "BARLEY"
        ]
      },
      {
        "id": 2,
        "clue": "Flat whole-wheat bread made on griddle",
        "answer": "ROTI",
        "length": 4,
        "options": [
          "ROTI",
          "NAAN",
          "POORI"
        ]
      },
      {
        "id": 3,
        "clue": "Warm porridge bowl eaten in mornings",
        "answer": "OATS",
        "length": 4,
        "options": [
          "OATS",
          "CORN",
          "MILLET"
        ]
      }
    ]
  },
  {
    "id": 37,
    "theme": "Fresh Vegetables",
    "words": [
      {
        "id": 1,
        "clue": "Round red juicy vegetable used in gravies",
        "answer": "TOMATO",
        "length": 6,
        "options": [
          "TOMATO",
          "CARROT",
          "BEET"
        ]
      },
      {
        "id": 2,
        "clue": "Starchy root vegetable loved in curries",
        "answer": "POTATO",
        "length": 6,
        "options": [
          "POTATO",
          "RADISH",
          "YAM"
        ]
      },
      {
        "id": 3,
        "clue": "Green leafy vegetable rich in iron",
        "answer": "SPINACH",
        "length": 7,
        "options": [
          "SPINACH",
          "CABBAGE",
          "LETTUCE"
        ]
      }
    ]
  },
  {
    "id": 38,
    "theme": "Sweet Desserts",
    "words": [
      {
        "id": 1,
        "clue": "Warm syrupy golden round Indian sweet",
        "answer": "GULABJAMUN",
        "length": 10,
        "options": [
          "GULABJAMUN",
          "JALEBI",
          "LADDOO"
        ]
      },
      {
        "id": 2,
        "clue": "Crispy spiral saffron sweet soaked in syrup",
        "answer": "JALEBI",
        "length": 6,
        "options": [
          "JALEBI",
          "BARFI",
          "PEDHA"
        ]
      },
      {
        "id": 3,
        "clue": "Festive round sweet made of gram flour",
        "answer": "LADDOO",
        "length": 6,
        "options": [
          "LADDOO",
          "HALWA",
          "KHEER"
        ]
      }
    ]
  },
  {
    "id": 39,
    "theme": "Scenic Earth",
    "words": [
      {
        "id": 1,
        "clue": "Majestic towering peak touching clouds",
        "answer": "MOUNTAIN",
        "length": 8,
        "options": [
          "MOUNTAIN",
          "HILL",
          "VALLEY"
        ]
      },
      {
        "id": 2,
        "clue": "Low area nestled between two mountains",
        "answer": "VALLEY",
        "length": 6,
        "options": [
          "VALLEY",
          "CLIFF",
          "CANYON"
        ]
      },
      {
        "id": 3,
        "clue": "Sandy expanse where warm winds blow",
        "answer": "DESERT",
        "length": 6,
        "options": [
          "DESERT",
          "MEADOW",
          "FOREST"
        ]
      }
    ]
  },
  {
    "id": 40,
    "theme": "Healing Herbs",
    "words": [
      {
        "id": 1,
        "clue": "Holy basil plant worshiped in courtyards",
        "answer": "TULSI",
        "length": 5,
        "options": [
          "TULSI",
          "NEEM",
          "ALOE"
        ]
      },
      {
        "id": 2,
        "clue": "Bitter medicinal leaf known for purity",
        "answer": "NEEM",
        "length": 4,
        "options": [
          "NEEM",
          "MINT",
          "EUCALYPTUS"
        ]
      },
      {
        "id": 3,
        "clue": "Cool soothing succulent gel for skin",
        "answer": "ALOE",
        "length": 4,
        "options": [
          "ALOE",
          "CACTUS",
          "GINGER"
        ]
      }
    ]
  },
  {
    "id": 41,
    "theme": "Gentle Breezes",
    "words": [
      {
        "id": 1,
        "clue": "Gentle mist hovering over morning hills",
        "answer": "MIST",
        "length": 4,
        "options": [
          "MIST",
          "SMOG",
          "HAIL"
        ]
      },
      {
        "id": 2,
        "clue": "Soft fluffy precipitation of winter",
        "answer": "SNOW",
        "length": 4,
        "options": [
          "SNOW",
          "RAIN",
          "SLEET"
        ]
      },
      {
        "id": 3,
        "clue": "Refreshing evening breeze by the lake",
        "answer": "ZEPHYR",
        "length": 6,
        "options": [
          "ZEPHYR",
          "GUST",
          "TEMPEST"
        ]
      }
    ]
  },
  {
    "id": 42,
    "theme": "Traditional Attire",
    "words": [
      {
        "id": 1,
        "clue": "Graceful unstitched silk drape worn with pride",
        "answer": "SAREE",
        "length": 5,
        "options": [
          "SAREE",
          "KURTA",
          "SHAWL"
        ]
      },
      {
        "id": 2,
        "clue": "Long embroidered tunic worn with comfort",
        "answer": "KURTA",
        "length": 5,
        "options": [
          "KURTA",
          "SHIRT",
          "VEST"
        ]
      },
      {
        "id": 3,
        "clue": "Warm woolen wrap draped over shoulders",
        "answer": "SHAWL",
        "length": 5,
        "options": [
          "SHAWL",
          "SCARF",
          "STOLE"
        ]
      }
    ]
  },
  {
    "id": 43,
    "theme": "Festive Lights",
    "words": [
      {
        "id": 1,
        "clue": "Festival of lights celebrated with joy",
        "answer": "DIWALI",
        "length": 6,
        "options": [
          "DIWALI",
          "HOLI",
          "EID"
        ]
      },
      {
        "id": 2,
        "clue": "Festival of colors celebrating spring",
        "answer": "HOLI",
        "length": 4,
        "options": [
          "HOLI",
          "PONGAL",
          "BIHU"
        ]
      },
      {
        "id": 3,
        "clue": "Harvest celebration of Assam with feasting",
        "answer": "BIHU",
        "length": 4,
        "options": [
          "BIHU",
          "ONAM",
          "BAISAKHI"
        ]
      }
    ]
  },
  {
    "id": 44,
    "theme": "Musical Instruments",
    "words": [
      {
        "id": 1,
        "clue": "Pair of classical Indian rhythmic hand drums",
        "answer": "TABLA",
        "length": 5,
        "options": [
          "TABLA",
          "DHOLAK",
          "MRIDANGAM"
        ]
      },
      {
        "id": 2,
        "clue": "Classical plucked string instrument",
        "answer": "SITAR",
        "length": 5,
        "options": [
          "SITAR",
          "SAROD",
          "VEENA"
        ]
      },
      {
        "id": 3,
        "clue": "Sacred conch shell blown at sunrise",
        "answer": "SHANKH",
        "length": 6,
        "options": [
          "SHANKH",
          "BELL",
          "FLUTE"
        ]
      }
    ]
  },
  {
    "id": 45,
    "theme": "Precious Memories",
    "words": [
      {
        "id": 1,
        "clue": "Photograph preserving a happy moment",
        "answer": "PICTURE",
        "length": 7,
        "options": [
          "PICTURE",
          "PAINTING",
          "DRAWING"
        ]
      },
      {
        "id": 2,
        "clue": "Personal notebook holding daily thoughts",
        "answer": "DIARY",
        "length": 5,
        "options": [
          "DIARY",
          "CALENDAR",
          "NEWSPAPER"
        ]
      },
      {
        "id": 3,
        "clue": "Keepsake token from a meaningful journey",
        "answer": "SOUVENIR",
        "length": 8,
        "options": [
          "SOUVENIR",
          "COIN",
          "STAMP"
        ]
      }
    ]
  },
  {
    "id": 46,
    "theme": "Peaceful Living",
    "words": [
      {
        "id": 1,
        "clue": "Comforting warmth shared among family",
        "answer": "KINDNESS",
        "length": 8,
        "options": [
          "KINDNESS",
          "PRIDE",
          "ANGER"
        ]
      },
      {
        "id": 2,
        "clue": "Peaceful quiet that rejuvenates mind",
        "answer": "SILENCE",
        "length": 7,
        "options": [
          "SILENCE",
          "NOISE",
          "CLATTER"
        ]
      },
      {
        "id": 3,
        "clue": "Gentle acceptance and inner calm",
        "answer": "SERENITY",
        "length": 8,
        "options": [
          "SERENITY",
          "HASTE",
          "WORRY"
        ]
      }
    ]
  },
  {
    "id": 47,
    "theme": "Nature Paths",
    "words": [
      {
        "id": 1,
        "clue": "Shady tree-lined street in quiet town",
        "answer": "AVENUE",
        "length": 6,
        "options": [
          "AVENUE",
          "ALLEY",
          "HIGHWAY"
        ]
      },
      {
        "id": 2,
        "clue": "Narrow footpath through blossoming grove",
        "answer": "PATHWAY",
        "length": 7,
        "options": [
          "PATHWAY",
          "TRACK",
          "ROAD"
        ]
      },
      {
        "id": 3,
        "clue": "Lush open field where cattle graze",
        "answer": "PASTURE",
        "length": 7,
        "options": [
          "PASTURE",
          "GARDEN",
          "ORCHARD"
        ]
      }
    ]
  },
  {
    "id": 48,
    "theme": "Garden Harvest",
    "words": [
      {
        "id": 1,
        "clue": "Fruit-bearing trees planted together",
        "answer": "ORCHARD",
        "length": 7,
        "options": [
          "ORCHARD",
          "FIELD",
          "FARM"
        ]
      },
      {
        "id": 2,
        "clue": "Fragrant yellow marigold used in garlands",
        "answer": "MARIGOLD",
        "length": 8,
        "options": [
          "MARIGOLD",
          "HIBISCUS",
          "LILY"
        ]
      },
      {
        "id": 3,
        "clue": "Climbing vine holding sweet green peas",
        "answer": "VINE",
        "length": 4,
        "options": [
          "VINE",
          "BUSH",
          "SHRUB"
        ]
      }
    ]
  },
  {
    "id": 49,
    "theme": "Evening Serenity",
    "words": [
      {
        "id": 1,
        "clue": "Glowing dusk sky in shades of amber",
        "answer": "TWILIGHT",
        "length": 8,
        "options": [
          "TWILIGHT",
          "MIDDAY",
          "DAWN"
        ]
      },
      {
        "id": 2,
        "clue": "Soft lullaby sung to bring sweet dreams",
        "answer": "LULLABY",
        "length": 7,
        "options": [
          "LULLABY",
          "ANTHEM",
          "MARCH"
        ]
      },
      {
        "id": 3,
        "clue": "Nighttime wish made upon a star",
        "answer": "WISH",
        "length": 4,
        "options": [
          "WISH",
          "HOPE",
          "DREAM"
        ]
      }
    ]
  },
  {
    "id": 50,
    "theme": "Daily Blessings",
    "words": [
      {
        "id": 1,
        "clue": "Warm cup of herbal tea in afternoon",
        "answer": "INFUSION",
        "length": 8,
        "options": [
          "INFUSION",
          "POTION",
          "SYRUP"
        ]
      },
      {
        "id": 2,
        "clue": "Cheerful smile between old friends",
        "answer": "CAMARADERIE",
        "length": 11,
        "options": [
          "CAMARADERIE",
          "RIVALRY",
          "SOLITUDE"
        ]
      },
      {
        "id": 3,
        "clue": "Feeling completely safe and at home",
        "answer": "SANCTUARY",
        "length": 9,
        "options": [
          "SANCTUARY",
          "DESERT",
          "WILDERNESS"
        ]
      }
    ]
  }
];
export const LEVEL_3_CROSSWORD = LEVEL_3_CROSSWORD_POOLS[0];

// Level 4: 50 Anagrams Pool
export const LEVEL_4_ANAGRAMS_POOL = [
  {
    "id": 1,
    "target": "PEACE",
    "scrambled": [
      "E",
      "E",
      "P",
      "A",
      "C"
    ],
    "hint": "A state of calm and quiet tranquility."
  },
  {
    "id": 2,
    "target": "SMILE",
    "scrambled": [
      "E",
      "I",
      "M",
      "S",
      "L"
    ],
    "hint": "A cheerful expression with your lips."
  },
  {
    "id": 3,
    "target": "LIGHT",
    "scrambled": [
      "T",
      "L",
      "I",
      "G",
      "H"
    ],
    "hint": "Bright warmth that dispels the dark."
  },
  {
    "id": 4,
    "target": "HEART",
    "scrambled": [
      "H",
      "R",
      "T",
      "A",
      "E"
    ],
    "hint": "The center of loving emotion and vitality."
  },
  {
    "id": 5,
    "target": "DREAM",
    "scrambled": [
      "R",
      "D",
      "M",
      "A",
      "E"
    ],
    "hint": "Inspiring nighttime visions of hope."
  },
  {
    "id": 6,
    "target": "BLOOM",
    "scrambled": [
      "M",
      "O",
      "L",
      "B",
      "O"
    ],
    "hint": "When garden flowers open in spring."
  },
  {
    "id": 7,
    "target": "FAITH",
    "scrambled": [
      "H",
      "T",
      "A",
      "F",
      "I"
    ],
    "hint": "Complete trust and confidence in goodness."
  },
  {
    "id": 8,
    "target": "BRAVE",
    "scrambled": [
      "A",
      "B",
      "R",
      "V",
      "E"
    ],
    "hint": "Facing each day with steady courage."
  },
  {
    "id": 9,
    "target": "GRACE",
    "scrambled": [
      "G",
      "E",
      "C",
      "A",
      "R"
    ],
    "hint": "Gentle elegance and courteous goodwill."
  },
  {
    "id": 10,
    "target": "SWEET",
    "scrambled": [
      "E",
      "W",
      "T",
      "S",
      "E"
    ],
    "hint": "A pleasant taste like sugar or honey."
  },
  {
    "id": 11,
    "target": "SUNNY",
    "scrambled": [
      "S",
      "N",
      "N",
      "U",
      "Y"
    ],
    "hint": "Bright and shining with golden warmth."
  },
  {
    "id": 12,
    "target": "SHINE",
    "scrambled": [
      "H",
      "I",
      "E",
      "S",
      "N"
    ],
    "hint": "To radiate soft, clear, welcoming light."
  },
  {
    "id": 13,
    "target": "CLOUD",
    "scrambled": [
      "D",
      "C",
      "U",
      "O",
      "L"
    ],
    "hint": "A white fluffy vapor floating in blue skies."
  },
  {
    "id": 14,
    "target": "RIVER",
    "scrambled": [
      "I",
      "V",
      "R",
      "E",
      "R"
    ],
    "hint": "A natural flowing stream of fresh water."
  },
  {
    "id": 15,
    "target": "GREEN",
    "scrambled": [
      "R",
      "E",
      "N",
      "E",
      "G"
    ],
    "hint": "The refreshing vibrant color of nature."
  },
  {
    "id": 16,
    "target": "FRESH",
    "scrambled": [
      "F",
      "R",
      "H",
      "E",
      "S"
    ],
    "hint": "Clean, invigorating, and full of life."
  },
  {
    "id": 17,
    "target": "BREEZE",
    "scrambled": [
      "E",
      "R",
      "B",
      "Z",
      "E",
      "E"
    ],
    "hint": "A light, gentle, refreshing outdoor wind."
  },
  {
    "id": 18,
    "target": "FRIEND",
    "scrambled": [
      "D",
      "I",
      "F",
      "E",
      "R",
      "N"
    ],
    "hint": "A loyal companion who brings joy and warmth."
  },
  {
    "id": 19,
    "target": "GARDEN",
    "scrambled": [
      "N",
      "E",
      "A",
      "D",
      "R",
      "G"
    ],
    "hint": "A peaceful sanctuary of flowers and greens."
  },
  {
    "id": 20,
    "target": "FAMILY",
    "scrambled": [
      "Y",
      "A",
      "I",
      "L",
      "M",
      "F"
    ],
    "hint": "The circle of love that supports us forever."
  },
  {
    "id": 21,
    "target": "MEMORY",
    "scrambled": [
      "M",
      "M",
      "Y",
      "R",
      "O",
      "E"
    ],
    "hint": "Precious recollection of happy moments."
  },
  {
    "id": 22,
    "target": "HEALTH",
    "scrambled": [
      "H",
      "A",
      "E",
      "L",
      "H",
      "T"
    ],
    "hint": "Wholeness and vitality of mind and body."
  },
  {
    "id": 23,
    "target": "MUSIC",
    "scrambled": [
      "M",
      "I",
      "S",
      "C",
      "U"
    ],
    "hint": "Sweet melodies that soothe the spirit."
  },
  {
    "id": 24,
    "target": "HONEY",
    "scrambled": [
      "N",
      "Y",
      "H",
      "E",
      "O"
    ],
    "hint": "Golden sweet nectar gathered from blossoms."
  },
  {
    "id": 25,
    "target": "FLOWER",
    "scrambled": [
      "O",
      "F",
      "L",
      "E",
      "W",
      "R"
    ],
    "hint": "A fragrant colorful bloom in the garden."
  },
  {
    "id": 26,
    "target": "WATER",
    "scrambled": [
      "T",
      "A",
      "R",
      "W",
      "E"
    ],
    "hint": "The pure, clear, life-giving liquid of Earth."
  },
  {
    "id": 27,
    "target": "PRAYER",
    "scrambled": [
      "E",
      "R",
      "A",
      "R",
      "Y",
      "P"
    ],
    "hint": "A quiet, comforting conversation of gratitude."
  },
  {
    "id": 28,
    "target": "BEAUTY",
    "scrambled": [
      "T",
      "Y",
      "A",
      "U",
      "E",
      "B"
    ],
    "hint": "Qualities that delight senses and spirit."
  },
  {
    "id": 29,
    "target": "CANDLE",
    "scrambled": [
      "E",
      "L",
      "A",
      "N",
      "D",
      "C"
    ],
    "hint": "A gentle glowing light that warms the room."
  },
  {
    "id": 30,
    "target": "SILVER",
    "scrambled": [
      "E",
      "I",
      "V",
      "L",
      "S",
      "R"
    ],
    "hint": "A shiny precious metal like the cool moon."
  },
  {
    "id": 31,
    "target": "GOLDEN",
    "scrambled": [
      "O",
      "E",
      "N",
      "G",
      "D",
      "L"
    ],
    "hint": "Radiant and precious like morning sunlight."
  },
  {
    "id": 32,
    "target": "SERENE",
    "scrambled": [
      "E",
      "S",
      "N",
      "E",
      "R",
      "E"
    ],
    "hint": "Completely calm, untroubled, and peaceful."
  },
  {
    "id": 33,
    "target": "LOTUS",
    "scrambled": [
      "O",
      "S",
      "T",
      "L",
      "U"
    ],
    "hint": "A sacred pure flower rising above the water."
  },
  {
    "id": 34,
    "target": "SPRING",
    "scrambled": [
      "N",
      "G",
      "S",
      "R",
      "P",
      "I"
    ],
    "hint": "Season when new life and buds awaken."
  },
  {
    "id": 35,
    "target": "SUMMER",
    "scrambled": [
      "E",
      "M",
      "U",
      "R",
      "S",
      "M"
    ],
    "hint": "Season of warm golden sunny afternoons."
  },
  {
    "id": 36,
    "target": "AUTUMN",
    "scrambled": [
      "A",
      "N",
      "T",
      "M",
      "U",
      "U"
    ],
    "hint": "Season when colorful leaves gently fall."
  },
  {
    "id": 37,
    "target": "WINTER",
    "scrambled": [
      "T",
      "N",
      "W",
      "R",
      "I",
      "E"
    ],
    "hint": "Season of cozy sweaters and warm blankets."
  },
  {
    "id": 38,
    "target": "NATURE",
    "scrambled": [
      "T",
      "N",
      "E",
      "A",
      "U",
      "R"
    ],
    "hint": "All living green things in our wondrous world."
  },
  {
    "id": 39,
    "target": "SINGER",
    "scrambled": [
      "S",
      "E",
      "R",
      "N",
      "G",
      "I"
    ],
    "hint": "One who shares joyous musical melodies."
  },
  {
    "id": 40,
    "target": "GENTLE",
    "scrambled": [
      "N",
      "L",
      "E",
      "T",
      "G",
      "E"
    ],
    "hint": "Kind, compassionate, and tender-hearted."
  },
  {
    "id": 41,
    "target": "WISDOM",
    "scrambled": [
      "M",
      "I",
      "O",
      "S",
      "D",
      "W"
    ],
    "hint": "Knowledge and insight gained through lifetime."
  },
  {
    "id": 42,
    "target": "JOYFUL",
    "scrambled": [
      "J",
      "U",
      "O",
      "Y",
      "F",
      "L"
    ],
    "hint": "Filled with profound happiness and delight."
  },
  {
    "id": 43,
    "target": "HEAVEN",
    "scrambled": [
      "N",
      "A",
      "H",
      "E",
      "V",
      "E"
    ],
    "hint": "A tranquil realm of endless peace and light."
  },
  {
    "id": 44,
    "target": "SHADOW",
    "scrambled": [
      "S",
      "H",
      "W",
      "A",
      "O",
      "D"
    ],
    "hint": "A cool shaded spot under a leafy tree."
  },
  {
    "id": 45,
    "target": "TRAVEL",
    "scrambled": [
      "V",
      "R",
      "E",
      "T",
      "A",
      "L"
    ],
    "hint": "Journeying to see beautiful new places."
  },
  {
    "id": 46,
    "target": "PLANET",
    "scrambled": [
      "N",
      "L",
      "T",
      "E",
      "P",
      "A"
    ],
    "hint": "Our beautiful green Earth floating in space."
  },
  {
    "id": 47,
    "target": "OCEAN",
    "scrambled": [
      "O",
      "A",
      "N",
      "C",
      "E"
    ],
    "hint": "Vast blue waters carrying gentle waves."
  },
  {
    "id": 48,
    "target": "FOREST",
    "scrambled": [
      "S",
      "F",
      "E",
      "R",
      "T",
      "O"
    ],
    "hint": "Peaceful woodland filled with singing birds."
  },
  {
    "id": 49,
    "target": "BIRDIE",
    "scrambled": [
      "D",
      "R",
      "I",
      "I",
      "B",
      "E"
    ],
    "hint": "A cheerful little winged companion."
  },
  {
    "id": 50,
    "target": "TEMPLE",
    "scrambled": [
      "E",
      "E",
      "P",
      "M",
      "L",
      "T"
    ],
    "hint": "A serene sanctuary of peace and devotion."
  }
];
export const LEVEL_4_ANAGRAMS = LEVEL_4_ANAGRAMS_POOL.slice(0, 3);

// Level 5: 50 Word Wheels Pool
export const LEVEL_5_WORD_WHEELS_POOL = [
  {
    "id": 1,
    "centerLetter": "A",
    "outerLetters": [
      "C",
      "R",
      "E",
      "T",
      "P",
      "S"
    ],
    "validWords": [
      "CAT",
      "CAR",
      "CARE",
      "TEA",
      "EAT",
      "STAR",
      "PART",
      "PEA",
      "CAPE",
      "RATE"
    ],
    "targetCount": 3,
    "hints": [
      "A purring pet (CAT)",
      "Four-wheeled drive (CAR)",
      "Loving warmth (CARE)"
    ]
  },
  {
    "id": 2,
    "centerLetter": "E",
    "outerLetters": [
      "B",
      "R",
      "A",
      "D",
      "S",
      "T"
    ],
    "validWords": [
      "BED",
      "RED",
      "BEAD",
      "BREAD",
      "STAR",
      "REST",
      "TEAR",
      "DATE",
      "EAST",
      "BEST"
    ],
    "targetCount": 3,
    "hints": [
      "Where we sleep (BED)",
      "Morning breakfast loaf (BREAD)",
      "Rejuvenating pause (REST)"
    ]
  },
  {
    "id": 3,
    "centerLetter": "O",
    "outerLetters": [
      "H",
      "M",
      "E",
      "R",
      "S",
      "T"
    ],
    "validWords": [
      "HOME",
      "ROSE",
      "MOST",
      "REST",
      "MORE",
      "SORE",
      "SORT",
      "SHOT",
      "TOES",
      "HERO"
    ],
    "targetCount": 3,
    "hints": [
      "Comforting sanctuary (HOME)",
      "Fragrant blossom (ROSE)",
      "Brave protector (HERO)"
    ]
  },
  {
    "id": 4,
    "centerLetter": "I",
    "outerLetters": [
      "S",
      "M",
      "L",
      "E",
      "T",
      "P"
    ],
    "validWords": [
      "SMILE",
      "TIME",
      "MINT",
      "MELT",
      "SLIM",
      "SITE",
      "PILE",
      "LIME",
      "MILE",
      "LIP"
    ],
    "targetCount": 3,
    "hints": [
      "Happy expression (SMILE)",
      "Fresh tea herb (MINT)",
      "Green citrus fruit (LIME)"
    ]
  },
  {
    "id": 5,
    "centerLetter": "U",
    "outerLetters": [
      "S",
      "N",
      "B",
      "R",
      "T",
      "P"
    ],
    "validWords": [
      "SUN",
      "RUN",
      "NUT",
      "RUST",
      "BURN",
      "BUNT",
      "TURN",
      "PUN",
      "BUS",
      "RUB"
    ],
    "targetCount": 3,
    "hints": [
      "Daytime star (SUN)",
      "Warm golden glow (BURN)",
      "Change direction (TURN)"
    ]
  },
  {
    "id": 6,
    "centerLetter": "A",
    "outerLetters": [
      "M",
      "N",
      "G",
      "O",
      "T",
      "R"
    ],
    "validWords": [
      "MANGO",
      "ROAM",
      "GOAT",
      "BOAT",
      "GRAM",
      "ATOM",
      "ROAN",
      "TRAM",
      "MOAN",
      "MALT"
    ],
    "targetCount": 3,
    "hints": [
      "Sweet fruit king (MANGO)",
      "Wandering stroll (ROAM)",
      "Farm animal (GOAT)"
    ]
  },
  {
    "id": 7,
    "centerLetter": "E",
    "outerLetters": [
      "P",
      "A",
      "C",
      "T",
      "R",
      "S"
    ],
    "validWords": [
      "PEACE",
      "CAPE",
      "RATE",
      "TEAR",
      "SEAT",
      "CARE",
      "PART",
      "TRAP",
      "REST",
      "EAST"
    ],
    "targetCount": 3,
    "hints": [
      "Calm serenity (PEACE)",
      "Loving devotion (CARE)",
      "Comforting chair (SEAT)"
    ]
  },
  {
    "id": 8,
    "centerLetter": "O",
    "outerLetters": [
      "B",
      "A",
      "T",
      "R",
      "M",
      "S"
    ],
    "validWords": [
      "BOAT",
      "ROAM",
      "STAR",
      "MOAT",
      "SOAR",
      "MAST",
      "MOST",
      "ATOM",
      "STORM",
      "MORT"
    ],
    "targetCount": 3,
    "hints": [
      "Watercraft (BOAT)",
      "Wander freely (ROAM)",
      "Fly high (SOAR)"
    ]
  },
  {
    "id": 9,
    "centerLetter": "I",
    "outerLetters": [
      "L",
      "G",
      "H",
      "T",
      "R",
      "B"
    ],
    "validWords": [
      "LIGHT",
      "BRIGHT",
      "GIRL",
      "BIRD",
      "GRIT",
      "DIRT",
      "LIT",
      "BIT",
      "HIT",
      "RIG"
    ],
    "targetCount": 3,
    "hints": [
      "Radiant illumination (LIGHT)",
      "Full of sunshine (BRIGHT)",
      "Feathered singer (BIRD)"
    ]
  },
  {
    "id": 10,
    "centerLetter": "A",
    "outerLetters": [
      "W",
      "R",
      "M",
      "T",
      "H",
      "O"
    ],
    "validWords": [
      "WARM",
      "MATH",
      "MORT",
      "TRAM",
      "THAW",
      "ROAM",
      "ATOM",
      "WORM",
      "WORTH",
      "ROAM"
    ],
    "targetCount": 3,
    "hints": [
      "Cozy temperature (WARM)",
      "Winter ice melting (THAW)",
      "Value and dignity (WORTH)"
    ]
  },
  {
    "id": 11,
    "centerLetter": "E",
    "outerLetters": [
      "G",
      "R",
      "E",
      "N",
      "T",
      "S"
    ],
    "validWords": [
      "GREEN",
      "TREE",
      "SEEN",
      "NEST",
      "REST",
      "TENT",
      "PEST",
      "MEET",
      "SEEK",
      "TEEN"
    ],
    "targetCount": 3,
    "hints": [
      "Color of spring grass (GREEN)",
      "Cozy bird home (NEST)",
      "Shady garden plant (TREE)"
    ]
  },
  {
    "id": 12,
    "centerLetter": "O",
    "outerLetters": [
      "L",
      "V",
      "E",
      "R",
      "S",
      "T"
    ],
    "validWords": [
      "LOVE",
      "ROSE",
      "SOLE",
      "REST",
      "LOST",
      "VOTE",
      "SORT",
      "TORE",
      "OVER",
      "MORE"
    ],
    "targetCount": 3,
    "hints": [
      "Deep affection (LOVE)",
      "Queen of flowers (ROSE)",
      "Choose in election (VOTE)"
    ]
  },
  {
    "id": 13,
    "centerLetter": "A",
    "outerLetters": [
      "K",
      "I",
      "N",
      "D",
      "E",
      "S"
    ],
    "validWords": [
      "KIND",
      "SNAKE",
      "DAISY",
      "DEAN",
      "DINE",
      "SAID",
      "SAND",
      "SKIN",
      "IDEA",
      "NAME"
    ],
    "targetCount": 3,
    "hints": [
      "Gentle-hearted (KIND)",
      "Beach granules (SAND)",
      "Bright thought (IDEA)"
    ]
  },
  {
    "id": 14,
    "centerLetter": "E",
    "outerLetters": [
      "B",
      "L",
      "S",
      "S",
      "I",
      "N"
    ],
    "validWords": [
      "BLESS",
      "BELL",
      "LINE",
      "SINE",
      "SILL",
      "LESS",
      "SEEN",
      "NINE",
      "BILL",
      "LIME"
    ],
    "targetCount": 3,
    "hints": [
      "Bestow goodwill (BLESS)",
      "Ringing sanctuary chime (BELL)",
      "Number after eight (NINE)"
    ]
  },
  {
    "id": 15,
    "centerLetter": "O",
    "outerLetters": [
      "M",
      "O",
      "N",
      "S",
      "T",
      "R"
    ],
    "validWords": [
      "MOON",
      "ROOT",
      "SOON",
      "ROOM",
      "STAR",
      "MOST",
      "ROST",
      "TOON",
      "NOON",
      "TORN"
    ],
    "targetCount": 3,
    "hints": [
      "Silver night light (MOON)",
      "Plant anchor (ROOT)",
      "Midday hour (NOON)"
    ]
  },
  {
    "id": 16,
    "centerLetter": "A",
    "outerLetters": [
      "H",
      "P",
      "P",
      "Y",
      "R",
      "T"
    ],
    "validWords": [
      "HAPPY",
      "PART",
      "PRAY",
      "TRAP",
      "TART",
      "PATH",
      "HART",
      "RAPT",
      "TARP",
      "PLAY"
    ],
    "targetCount": 3,
    "hints": [
      "Joyful & content (HAPPY)",
      "Whisper sacred hope (PRAY)",
      "Garden walkway (PATH)"
    ]
  },
  {
    "id": 17,
    "centerLetter": "E",
    "outerLetters": [
      "F",
      "R",
      "I",
      "E",
      "N",
      "D"
    ],
    "validWords": [
      "FRIEND",
      "FIND",
      "RIDE",
      "FINE",
      "FIRE",
      "FEED",
      "FREE",
      "DEER",
      "REED",
      "MINE"
    ],
    "targetCount": 3,
    "hints": [
      "Loyal companion (FRIEND)",
      "Discover joy (FIND)",
      "Graceful forest animal (DEER)"
    ]
  },
  {
    "id": 18,
    "centerLetter": "I",
    "outerLetters": [
      "R",
      "A",
      "N",
      "B",
      "O",
      "W"
    ],
    "validWords": [
      "RAIN",
      "BORN",
      "IRON",
      "ROBIN",
      "BARN",
      "WARN",
      "BOAR",
      "ROAM",
      "BAWN",
      "WANI"
    ],
    "targetCount": 3,
    "hints": [
      "Nourishing shower (RAIN)",
      "Sturdy metal (IRON)",
      "Red-breasted bird (ROBIN)"
    ]
  },
  {
    "id": 19,
    "centerLetter": "A",
    "outerLetters": [
      "B",
      "R",
      "D",
      "G",
      "E",
      "S"
    ],
    "validWords": [
      "BRIDGE",
      "BREAD",
      "RAGE",
      "SAGE",
      "BEAD",
      "GEAR",
      "BARE",
      "DARE",
      "GRAB",
      "DRAG"
    ],
    "targetCount": 3,
    "hints": [
      "Crossing over river (BRIDGE)",
      "Wise thinker (SAGE)",
      "Jewelry bead (BEAD)"
    ]
  },
  {
    "id": 20,
    "centerLetter": "E",
    "outerLetters": [
      "S",
      "W",
      "E",
      "T",
      "R",
      "N"
    ],
    "validWords": [
      "SWEET",
      "NEWS",
      "WEST",
      "RENT",
      "REST",
      "SEEN",
      "TEEN",
      "TREE",
      "WENT",
      "WEEP"
    ],
    "targetCount": 3,
    "hints": [
      "Pleasant flavor (SWEET)",
      "Fresh information (NEWS)",
      "Direction of sunset (WEST)"
    ]
  },
  {
    "id": 21,
    "centerLetter": "O",
    "outerLetters": [
      "B",
      "L",
      "S",
      "M",
      "E",
      "R"
    ],
    "validWords": [
      "BLOOM",
      "ROSE",
      "MORE",
      "SOLE",
      "MOLE",
      "SORE",
      "LORE",
      "SLOB",
      "ROBE",
      "LOBE"
    ],
    "targetCount": 3,
    "hints": [
      "Flowers opening (BLOOM)",
      "Traditional knowledge (LORE)",
      "Cozy garment (ROBE)"
    ]
  },
  {
    "id": 22,
    "centerLetter": "A",
    "outerLetters": [
      "C",
      "N",
      "D",
      "L",
      "E",
      "S"
    ],
    "validWords": [
      "CANDLE",
      "SAND",
      "LAND",
      "CLAN",
      "LACE",
      "DANCE",
      "ACNE",
      "LEAD",
      "LANE",
      "CASE"
    ],
    "targetCount": 3,
    "hints": [
      "Soft glowing flame (CANDLE)",
      "Rhythmic movement (DANCE)",
      "Quiet country road (LANE)"
    ]
  },
  {
    "id": 23,
    "centerLetter": "I",
    "outerLetters": [
      "S",
      "L",
      "V",
      "E",
      "R",
      "T"
    ],
    "validWords": [
      "SILVER",
      "LIVE",
      "TILE",
      "SITE",
      "TIRE",
      "REST",
      "RILE",
      "VILE",
      "SIRE",
      "RIVE"
    ],
    "targetCount": 3,
    "hints": [
      "Cool shiny metal (SILVER)",
      "Dwelling alive (LIVE)",
      "Floor ceramic piece (TILE)"
    ]
  },
  {
    "id": 24,
    "centerLetter": "O",
    "outerLetters": [
      "G",
      "L",
      "D",
      "E",
      "N",
      "S"
    ],
    "validWords": [
      "GOLD",
      "LONG",
      "DONG",
      "LODE",
      "SOLE",
      "NODE",
      "LONE",
      "GONE",
      "DOGS",
      "LOGS"
    ],
    "targetCount": 3,
    "hints": [
      "Precious metal (GOLD)",
      "Great distance (LONG)",
      "Foliage tree trunk (LOGS)"
    ]
  },
  {
    "id": 25,
    "centerLetter": "E",
    "outerLetters": [
      "H",
      "A",
      "R",
      "T",
      "B",
      "S"
    ],
    "validWords": [
      "HEART",
      "BEAT",
      "BEAR",
      "HEAT",
      "BATH",
      "REST",
      "STAR",
      "EAST",
      "BASE",
      "BARE"
    ],
    "targetCount": 3,
    "hints": [
      "Organ of love (HEART)",
      "Rhythm of drum (BEAT)",
      "Gentle warmth (HEAT)"
    ]
  },
  {
    "id": 26,
    "centerLetter": "A",
    "outerLetters": [
      "M",
      "U",
      "S",
      "I",
      "C",
      "L"
    ],
    "validWords": [
      "MUSIC",
      "CALM",
      "MAIL",
      "SLAM",
      "CLAM",
      "SAIL",
      "LIMA",
      "SOUL",
      "SCUM",
      "SCAM"
    ],
    "targetCount": 3,
    "hints": [
      "Sweet harmony (MUSIC)",
      "Tranquil stillness (CALM)",
      "Gliding boat sheet (SAIL)"
    ]
  },
  {
    "id": 27,
    "centerLetter": "E",
    "outerLetters": [
      "G",
      "N",
      "T",
      "L",
      "E",
      "S"
    ],
    "validWords": [
      "GENTLE",
      "TEEN",
      "NEST",
      "SEEN",
      "LENT",
      "TENT",
      "LEGS",
      "SETS",
      "ELSE",
      "TEES"
    ],
    "targetCount": 3,
    "hints": [
      "Kind and soft (GENTLE)",
      "Bird home (NEST)",
      "Camp shelter (TENT)"
    ]
  },
  {
    "id": 28,
    "centerLetter": "I",
    "outerLetters": [
      "W",
      "S",
      "D",
      "O",
      "M",
      "R"
    ],
    "validWords": [
      "WISDOM",
      "WIND",
      "WORD",
      "MIND",
      "DORM",
      "WORM",
      "SOIL",
      "SWORD",
      "SLOW",
      "WOOD"
    ],
    "targetCount": 3,
    "hints": [
      "Insightful knowledge (WISDOM)",
      "Seat of thought (MIND)",
      "Moving air breeze (WIND)"
    ]
  },
  {
    "id": 29,
    "centerLetter": "O",
    "outerLetters": [
      "J",
      "Y",
      "F",
      "U",
      "L",
      "S"
    ],
    "validWords": [
      "JOYFUL",
      "SOUL",
      "FOUL",
      "LOUD",
      "FOYS",
      "JOYS",
      "SLOY",
      "SLOU",
      "YOUS",
      "LOYS"
    ],
    "targetCount": 3,
    "hints": [
      "Profound happiness (JOYFUL)",
      "Inner spirit (SOUL)",
      "Delights (JOYS)"
    ]
  },
  {
    "id": 30,
    "centerLetter": "A",
    "outerLetters": [
      "F",
      "L",
      "O",
      "W",
      "E",
      "R"
    ],
    "validWords": [
      "FLOWER",
      "LEAF",
      "WOLF",
      "FOAL",
      "FOWL",
      "ROAM",
      "WARM",
      "BLOW",
      "FROTH",
      "FLOAT"
    ],
    "targetCount": 3,
    "hints": [
      "Garden blossom (FLOWER)",
      "Green foliage (LEAF)",
      "Forest animal (WOLF)"
    ]
  },
  {
    "id": 31,
    "centerLetter": "E",
    "outerLetters": [
      "T",
      "E",
      "P",
      "O",
      "T",
      "S"
    ],
    "validWords": [
      "TEAPOT",
      "TOES",
      "SPOT",
      "PETS",
      "POST",
      "STEP",
      "POET",
      "TOPS",
      "TOOT",
      "STOP"
    ],
    "targetCount": 3,
    "hints": [
      "Tea brewing vessel (TEAPOT)",
      "Verses writer (POET)",
      "Pacing movement (STEP)"
    ]
  },
  {
    "id": 32,
    "centerLetter": "A",
    "outerLetters": [
      "S",
      "U",
      "N",
      "N",
      "Y",
      "L"
    ],
    "validWords": [
      "SUNNY",
      "LUNA",
      "ANNU",
      "SLAN",
      "ULNA",
      "NAYS",
      "LAYS",
      "RAYS",
      "PAYS",
      "SAYS"
    ],
    "targetCount": 3,
    "hints": [
      "Bright day (SUNNY)",
      "Moon poetical (LUNA)",
      "Beams of light (RAYS)"
    ]
  },
  {
    "id": 33,
    "centerLetter": "E",
    "outerLetters": [
      "B",
      "R",
      "Z",
      "E",
      "E",
      "S"
    ],
    "validWords": [
      "BREEZE",
      "BEES",
      "BEER",
      "SEER",
      "SERE",
      "REES",
      "EERS",
      "ZEES",
      "BEET",
      "BEEN"
    ],
    "targetCount": 3,
    "hints": [
      "Gentle wind (BREEZE)",
      "Honey makers (BEES)",
      "Red garden vegetable (BEET)"
    ]
  },
  {
    "id": 34,
    "centerLetter": "I",
    "outerLetters": [
      "T",
      "R",
      "A",
      "I",
      "N",
      "S"
    ],
    "validWords": [
      "TRAIN",
      "RAIN",
      "STIR",
      "STAR",
      "RANT",
      "TART",
      "SAIL",
      "TAIL",
      "MAIN",
      "PAIN"
    ],
    "targetCount": 3,
    "hints": [
      "Rail voyage vehicle (TRAIN)",
      "Nourishing shower (RAIN)",
      "Bird plumage end (TAIL)"
    ]
  },
  {
    "id": 35,
    "centerLetter": "O",
    "outerLetters": [
      "H",
      "A",
      "R",
      "B",
      "R",
      "S"
    ],
    "validWords": [
      "HARBOR",
      "BOAT",
      "ROAM",
      "SOAR",
      "BOAR",
      "BASH",
      "MARS",
      "RASH",
      "BASH",
      "BARS"
    ],
    "targetCount": 3,
    "hints": [
      "Sheltered boat port (HARBOR)",
      "Wander freely (ROAM)",
      "Red planet (MARS)"
    ]
  },
  {
    "id": 36,
    "centerLetter": "A",
    "outerLetters": [
      "L",
      "A",
      "D",
      "D",
      "O",
      "O"
    ],
    "validWords": [
      "LADDOO",
      "LOAD",
      "GOLD",
      "DOLL",
      "LOUD",
      "ROAD",
      "TOAD",
      "DOOR",
      "ROOF",
      "LOOK"
    ],
    "targetCount": 3,
    "hints": [
      "Festive round sweet (LADDOO)",
      "Pathway home (ROAD)",
      "Little toy companion (DOLL)"
    ]
  },
  {
    "id": 37,
    "centerLetter": "E",
    "outerLetters": [
      "P",
      "R",
      "V",
      "E",
      "R",
      "B"
    ],
    "validWords": [
      "PROVERB",
      "ROBE",
      "BORE",
      "PORE",
      "VEER",
      "PEER",
      "BEER",
      "BEEF",
      "VERB",
      "VERY"
    ],
    "targetCount": 3,
    "hints": [
      "Wise saying (PROVERB)",
      "Traditional garment (ROBE)",
      "Action word (VERB)"
    ]
  },
  {
    "id": 38,
    "centerLetter": "I",
    "outerLetters": [
      "D",
      "I",
      "Y",
      "A",
      "S",
      "L"
    ],
    "validWords": [
      "DIYA",
      "SAID",
      "DAIS",
      "LADY",
      "DAYS",
      "LAYS",
      "RAYS",
      "SLID",
      "ALIS",
      "ILYA"
    ],
    "targetCount": 3,
    "hints": [
      "Sacred clay lamp (DIYA)",
      "Gentle woman (LADY)",
      "Sunny daylight units (DAYS)"
    ]
  },
  {
    "id": 39,
    "centerLetter": "O",
    "outerLetters": [
      "C",
      "O",
      "N",
      "U",
      "T",
      "S"
    ],
    "validWords": [
      "COCONUT",
      "MOON",
      "SOON",
      "NOON",
      "TOON",
      "ROOT",
      "BOOT",
      "COOT",
      "SHOT",
      "SLOT"
    ],
    "targetCount": 3,
    "hints": [
      "Tropical palm fruit (COCONUT)",
      "Midday hour (NOON)",
      "Footwear pair (BOOT)"
    ]
  },
  {
    "id": 40,
    "centerLetter": "A",
    "outerLetters": [
      "B",
      "A",
      "N",
      "A",
      "N",
      "A"
    ],
    "validWords": [
      "BANANA",
      "BEAN",
      "BARN",
      "BAND",
      "BAWN",
      "ABBA",
      "BABA",
      "BANA",
      "NAAN",
      "MANA"
    ],
    "targetCount": 3,
    "hints": [
      "Sweet yellow fruit (BANANA)",
      "Musical ensemble (BAND)",
      "Warm oven flatbread (NAAN)"
    ]
  },
  {
    "id": 41,
    "centerLetter": "E",
    "outerLetters": [
      "S",
      "H",
      "A",
      "W",
      "L",
      "S"
    ],
    "validWords": [
      "SHAWL",
      "WASH",
      "WALL",
      "HALL",
      "HEAL",
      "HAWL",
      "LASH",
      "SLIP",
      "SOUL",
      "SALE"
    ],
    "targetCount": 3,
    "hints": [
      "Warm shoulder wrap (SHAWL)",
      "Cleanse with water (WASH)",
      "Bring gentle recovery (HEAL)"
    ]
  },
  {
    "id": 42,
    "centerLetter": "I",
    "outerLetters": [
      "V",
      "I",
      "O",
      "L",
      "I",
      "N"
    ],
    "validWords": [
      "VIOLIN",
      "LION",
      "LOIN",
      "COIN",
      "JOIN",
      "NOIL",
      "SOIL",
      "FOIL",
      "TOIL",
      "BOIL"
    ],
    "targetCount": 3,
    "hints": [
      "Classical string instrument (VIOLIN)",
      "Noble jungle king (LION)",
      "Metallic currency (COIN)"
    ]
  },
  {
    "id": 43,
    "centerLetter": "O",
    "outerLetters": [
      "P",
      "E",
      "A",
      "C",
      "O",
      "K"
    ],
    "validWords": [
      "PEACOCK",
      "CAPE",
      "COKE",
      "PECK",
      "PACK",
      "POKE",
      "COPE",
      "CAFE",
      "CAKE",
      "COOK"
    ],
    "targetCount": 3,
    "hints": [
      "Royal national bird (PEACOCK)",
      "Coffee shop (CAFE)",
      "Prepare warm meal (COOK)"
    ]
  },
  {
    "id": 44,
    "centerLetter": "A",
    "outerLetters": [
      "T",
      "U",
      "L",
      "S",
      "I",
      "M"
    ],
    "validWords": [
      "TULSI",
      "MINT",
      "SUIT",
      "SLAM",
      "SOIL",
      "TAIL",
      "MUST",
      "SALT",
      "SMIT",
      "SLIT"
    ],
    "targetCount": 3,
    "hints": [
      "Sacred holy basil (TULSI)",
      "Aromatic fresh herb (MINT)",
      "Savory food seasoning (SALT)"
    ]
  },
  {
    "id": 45,
    "centerLetter": "E",
    "outerLetters": [
      "G",
      "U",
      "I",
      "T",
      "A",
      "R"
    ],
    "validWords": [
      "GUITAR",
      "GATE",
      "GEAR",
      "TRUE",
      "TEAR",
      "RAGE",
      "RITE",
      "GRIT",
      "GREAT",
      "GIANT"
    ],
    "targetCount": 3,
    "hints": [
      "Melodious string instrument (GUITAR)",
      "Garden entrance (GATE)",
      "Noble & wonderful (GREAT)"
    ]
  },
  {
    "id": 46,
    "centerLetter": "I",
    "outerLetters": [
      "S",
      "U",
      "N",
      "F",
      "L",
      "W"
    ],
    "validWords": [
      "SUN",
      "FLOW",
      "WOLF",
      "WISH",
      "FISH",
      "WINS",
      "FOUL",
      "SILO",
      "FOIL",
      "SOIL"
    ],
    "targetCount": 3,
    "hints": [
      "Daytime golden star (SUN)",
      "Heartfelt desire (WISH)",
      "Aquatic creature (FISH)"
    ]
  },
  {
    "id": 47,
    "centerLetter": "O",
    "outerLetters": [
      "K",
      "A",
      "D",
      "H",
      "A",
      "S"
    ],
    "validWords": [
      "KADHA",
      "DASH",
      "SHAD",
      "HARK",
      "DARK",
      "BARK",
      "SHAK",
      "DHAK",
      "HAKA",
      "SAHA"
    ],
    "targetCount": 3,
    "hints": [
      "Herbal immunity brew (KADHA)",
      "Companionship support (SAHA)",
      "Tree outer protective layer (BARK)"
    ]
  },
  {
    "id": 48,
    "centerLetter": "A",
    "outerLetters": [
      "S",
      "A",
      "R",
      "E",
      "E",
      "S"
    ],
    "validWords": [
      "SAREE",
      "SEER",
      "EASE",
      "EARS",
      "SEAS",
      "RASE",
      "SARE",
      "RAES",
      "SEES",
      "EERS"
    ],
    "targetCount": 3,
    "hints": [
      "Graceful drape attire (SAREE)",
      "Comfort and relaxation (EASE)",
      "Organs of hearing (EARS)"
    ]
  },
  {
    "id": 49,
    "centerLetter": "E",
    "outerLetters": [
      "F",
      "O",
      "U",
      "N",
      "T",
      "N"
    ],
    "validWords": [
      "FOUNTAIN",
      "NOTE",
      "TONE",
      "TENT",
      "FONT",
      "FEET",
      "NINE",
      "NONE",
      "NEON",
      "ONTO"
    ],
    "targetCount": 3,
    "hints": [
      "Garden water feature (FOUNTAIN)",
      "Musical pitch (TONE)",
      "Camping shelter (TENT)"
    ]
  },
  {
    "id": 50,
    "centerLetter": "I",
    "outerLetters": [
      "C",
      "A",
      "M",
      "E",
      "R",
      "A"
    ],
    "validWords": [
      "CAMERA",
      "CARE",
      "RACE",
      "ACRE",
      "MACE",
      "CRAM",
      "MICA",
      "RICE",
      "MICE",
      "ACID"
    ],
    "targetCount": 3,
    "hints": [
      "Precious photo device (CAMERA)",
      "Loving attention (CARE)",
      "Staple kitchen grain (RICE)"
    ]
  }
];
export const LEVEL_5_WORD_WHEEL = LEVEL_5_WORD_WHEELS_POOL[0];

// Level 6: 50 Proverbs Pool
export const LEVEL_6_PROVERBS_POOL = [
  {
    "id": 1,
    "phrase": "Laughter is the best _______.",
    "options": [
      "Medicine",
      "Breakfast",
      "Book"
    ],
    "answer": "Medicine",
    "explanation": "Joy and laughter uplift our wellness and spirit."
  },
  {
    "id": 2,
    "phrase": "Home is where the _______ is.",
    "options": [
      "Heart",
      "Garden",
      "Clock"
    ],
    "answer": "Heart",
    "explanation": "Home is wherever we feel warmth and love."
  },
  {
    "id": 3,
    "phrase": "A friend in need is a friend _______.",
    "options": [
      "Indeed",
      "Tomorrow",
      "Always"
    ],
    "answer": "Indeed",
    "explanation": "True companions stand by us during moments of need."
  },
  {
    "id": 4,
    "phrase": "Actions speak louder than _______.",
    "options": [
      "Words",
      "Bells",
      "Whispers"
    ],
    "answer": "Words",
    "explanation": "What we do for others carries greater meaning than what we say."
  },
  {
    "id": 5,
    "phrase": "Every cloud has a silver _______.",
    "options": [
      "Lining",
      "Border",
      "Frame"
    ],
    "answer": "Lining",
    "explanation": "Even in difficult moments, there is hope and bright light."
  },
  {
    "id": 6,
    "phrase": "Practice makes a person _______.",
    "options": [
      "Perfect",
      "Busy",
      "Tired"
    ],
    "answer": "Perfect",
    "explanation": "Regular gentle engagement helps our memory thrive."
  },
  {
    "id": 7,
    "phrase": "Better late than _______.",
    "options": [
      "Never",
      "Always",
      "Soon"
    ],
    "answer": "Never",
    "explanation": "It is always worthwhile to begin a positive activity."
  },
  {
    "id": 8,
    "phrase": "Time and tide wait for _______.",
    "options": [
      "No one",
      "Friends",
      "Sun"
    ],
    "answer": "No one",
    "explanation": "Moments flow steadily; enjoy each gentle breath."
  },
  {
    "id": 9,
    "phrase": "A journey of a thousand miles begins with a single _______.",
    "options": [
      "Step",
      "Dream",
      "Song"
    ],
    "answer": "Step",
    "explanation": "Great achievements start with small, gentle actions."
  },
  {
    "id": 10,
    "phrase": "Honesty is the best _______.",
    "options": [
      "Policy",
      "Gift",
      "Lesson"
    ],
    "answer": "Policy",
    "explanation": "Truthfulness brings peace of mind and trust."
  },
  {
    "id": 11,
    "phrase": "Where there is a will, there is a _______.",
    "options": [
      "Way",
      "Door",
      "Path"
    ],
    "answer": "Way",
    "explanation": "Determination and courage always open new doors."
  },
  {
    "id": 12,
    "phrase": "All that glitters is not _______.",
    "options": [
      "Gold",
      "Silver",
      "Diamond"
    ],
    "answer": "Gold",
    "explanation": "True value lies deeper than outward appearance."
  },
  {
    "id": 13,
    "phrase": "Beauty is in the eye of the _______.",
    "options": [
      "Beholder",
      "Artist",
      "Viewer"
    ],
    "answer": "Beauty",
    "explanation": "Each person finds their own unique appreciation of grace."
  },
  {
    "id": 14,
    "phrase": "Birds of a feather flock _______.",
    "options": [
      "Together",
      "Far",
      "Fast"
    ],
    "answer": "Together",
    "explanation": "People who share kind hearts naturally support each other."
  },
  {
    "id": 15,
    "phrase": "Cleanliness is next to _______.",
    "options": [
      "Godliness",
      "Happiness",
      "Kindness"
    ],
    "answer": "Godliness",
    "explanation": "A serene and clean space nurtures inner peace."
  },
  {
    "id": 16,
    "phrase": "Early to bed and early to rise makes one _______.",
    "options": [
      "Healthy",
      "Wealthy",
      "Wise"
    ],
    "answer": "Healthy",
    "explanation": "Restful daily rhythms keep mind and body rejuvenated."
  },
  {
    "id": 17,
    "phrase": "Good things come to those who _______.",
    "options": [
      "Wait",
      "Rush",
      "Seek"
    ],
    "answer": "Wait",
    "explanation": "Patience allows beautiful moments to unfold naturally."
  },
  {
    "id": 18,
    "phrase": "Knowledge is _______.",
    "options": [
      "Power",
      "Gold",
      "Joy"
    ],
    "answer": "Power",
    "explanation": "Learning and sharing wisdom enriches our daily life."
  },
  {
    "id": 19,
    "phrase": "Look before you _______.",
    "options": [
      "Leap",
      "Run",
      "Walk"
    ],
    "answer": "Leap",
    "explanation": "Thoughtful care ensures safety in all our steps."
  },
  {
    "id": 20,
    "phrase": "Make hay while the sun _______.",
    "options": [
      "Shines",
      "Rises",
      "Sets"
    ],
    "answer": "Shines",
    "explanation": "Seize cheerful opportunities whenever they appear."
  },
  {
    "id": 21,
    "phrase": "Necessity is the mother of _______.",
    "options": [
      "Invention",
      "Courage",
      "Wisdom"
    ],
    "answer": "Invention",
    "explanation": "Our daily needs inspire creative and helpful solutions."
  },
  {
    "id": 22,
    "phrase": "No pain, no _______.",
    "options": [
      "Gain",
      "Rain",
      "Train"
    ],
    "answer": "Gain",
    "explanation": "Gentle persistence leads to meaningful progress."
  },
  {
    "id": 23,
    "phrase": "Rome was not built in a _______.",
    "options": [
      "Day",
      "Year",
      "Month"
    ],
    "answer": "Day",
    "explanation": "Meaningful accomplishments take patient time."
  },
  {
    "id": 24,
    "phrase": "The pen is mightier than the _______.",
    "options": [
      "Sword",
      "Shield",
      "Arrow"
    ],
    "answer": "Sword",
    "explanation": "Kind words and wisdom inspire hearts more than force."
  },
  {
    "id": 25,
    "phrase": "There is no place like _______.",
    "options": [
      "Home",
      "Garden",
      "City"
    ],
    "answer": "Home",
    "explanation": "Our own sanctuary brings the deepest comfort."
  },
  {
    "id": 26,
    "phrase": "Two heads are better than _______.",
    "options": [
      "One",
      "Three",
      "Four"
    ],
    "answer": "One",
    "explanation": "Sharing thoughts with a companion makes solving easy."
  },
  {
    "id": 27,
    "phrase": "You reap what you _______.",
    "options": [
      "Sow",
      "Buy",
      "Find"
    ],
    "answer": "Sow",
    "explanation": "Planting kindness brings back abundant warmth."
  },
  {
    "id": 28,
    "phrase": "An apple a day keeps the doctor _______.",
    "options": [
      "Away",
      "Near",
      "Happy"
    ],
    "answer": "Away",
    "explanation": "Wholesome fresh foods nourish health and longevity."
  },
  {
    "id": 29,
    "phrase": "A stitch in time saves _______.",
    "options": [
      "Nine",
      "Seven",
      "Five"
    ],
    "answer": "Nine",
    "explanation": "Timely gentle attention prevents bigger challenges."
  },
  {
    "id": 30,
    "phrase": "Slow and steady wins the _______.",
    "options": [
      "Race",
      "Game",
      "Prize"
    ],
    "answer": "Race",
    "explanation": "Consistent, calm pacing brings true success."
  },
  {
    "id": 31,
    "phrase": "As you sow, so shall you _______.",
    "options": [
      "Reap",
      "Sleep",
      "Keep"
    ],
    "answer": "Reap",
    "explanation": "Good deeds bring peaceful rewards to our lives."
  },
  {
    "id": 32,
    "phrase": "Don't count your chickens before they _______.",
    "options": [
      "Hatch",
      "Cluck",
      "Eat"
    ],
    "answer": "Hatch",
    "explanation": "Patience keeps our expectations grounded in peace."
  },
  {
    "id": 33,
    "phrase": "A picture is worth a thousand _______.",
    "options": [
      "Words",
      "Songs",
      "Letters"
    ],
    "answer": "Words",
    "explanation": "A single cherished photograph speaks straight to heart."
  },
  {
    "id": 34,
    "phrase": "Silence is _______.",
    "options": [
      "Golden",
      "Silver",
      "Quiet"
    ],
    "answer": "Golden",
    "explanation": "Peaceful quiet restores clarity and inner calm."
  },
  {
    "id": 35,
    "phrase": "Too many cooks spoil the _______.",
    "options": [
      "Broth",
      "Meal",
      "Bread"
    ],
    "answer": "Broth",
    "explanation": "Clear coordination brings harmony to home activities."
  },
  {
    "id": 36,
    "phrase": "When in Rome, do as the Romans _______.",
    "options": [
      "Do",
      "Say",
      "Think"
    ],
    "answer": "Do",
    "explanation": "Adapting respectfully brings harmony everywhere."
  },
  {
    "id": 37,
    "phrase": "Strike while the iron is _______.",
    "options": [
      "Hot",
      "Cold",
      "Warm"
    ],
    "answer": "Hot",
    "explanation": "Act with enthusiasm when inspiration arrives."
  },
  {
    "id": 38,
    "phrase": "The grass is always greener on the other _______.",
    "options": [
      "Side",
      "Field",
      "Park"
    ],
    "answer": "Side",
    "explanation": "Contentment helps us cherish our own garden."
  },
  {
    "id": 39,
    "phrase": "Out of sight, out of _______.",
    "options": [
      "Mind",
      "Reach",
      "Touch"
    ],
    "answer": "Mind",
    "explanation": "Staying connected keeps memories vivid and near."
  },
  {
    "id": 40,
    "phrase": "Still waters run _______.",
    "options": [
      "Deep",
      "Fast",
      "Cold"
    ],
    "answer": "Deep",
    "explanation": "Quiet calm people often possess deep wisdom."
  },
  {
    "id": 41,
    "phrase": "The early bird catches the _______.",
    "options": [
      "Worm",
      "Seed",
      "Berry"
    ],
    "answer": "Worm",
    "explanation": "Beginning the morning cheerfully brings great rewards."
  },
  {
    "id": 42,
    "phrase": "Fortune favors the _______.",
    "options": [
      "Brave",
      "Quiet",
      "Fast"
    ],
    "answer": "Brave",
    "explanation": "Gentle courage opens doors to wonderful blessings."
  },
  {
    "id": 43,
    "phrase": "Great minds think _______.",
    "options": [
      "Alike",
      "Fast",
      "Bright"
    ],
    "answer": "Alike",
    "explanation": "Companions often find harmony in similar values."
  },
  {
    "id": 44,
    "phrase": "Kind words cost _______.",
    "options": [
      "Nothing",
      "Pennies",
      "Little"
    ],
    "answer": "Nothing",
    "explanation": "A warm word is free to give and precious to receive."
  },
  {
    "id": 45,
    "phrase": "Patience is a _______.",
    "options": [
      "Virtue",
      "Habit",
      "Lesson"
    ],
    "answer": "Virtue",
    "explanation": "Gentle patience is a noble quality of mind."
  },
  {
    "id": 46,
    "phrase": "A good deed is its own _______.",
    "options": [
      "Reward",
      "Gift",
      "Prize"
    ],
    "answer": "Reward",
    "explanation": "Helping others fills our heart with joy."
  },
  {
    "id": 47,
    "phrase": "A little knowledge is a dangerous _______.",
    "options": [
      "Thing",
      "Word",
      "Tool"
    ],
    "answer": "Thing",
    "explanation": "Deep understanding brings clarity and peace."
  },
  {
    "id": 48,
    "phrase": "Better to be safe than _______.",
    "options": [
      "Sorry",
      "Late",
      "Quiet"
    ],
    "answer": "Sorry",
    "explanation": "Taking gentle care protects ourselves and loved ones."
  },
  {
    "id": 49,
    "phrase": "Blessings come in disguise and bring _______.",
    "options": [
      "Joy",
      "Pride",
      "Fame"
    ],
    "answer": "Joy",
    "explanation": "Unseen kindness often turns into beautiful grace."
  },
  {
    "id": 50,
    "phrase": "Love makes a house a _______.",
    "options": [
      "Home",
      "Palace",
      "Tower"
    ],
    "answer": "Home",
    "explanation": "Affection and care turn walls into a sanctuary."
  }
];
export const LEVEL_6_PROVERBS = LEVEL_6_PROVERBS_POOL.slice(0, 3);

// Level 7: 50 Rhymes Pool
export const LEVEL_7_RHYMES_POOL = [
  {
    "id": 1,
    "targetWord": "SUN",
    "options": [
      "FUN",
      "TREE",
      "CAT",
      "BOOK"
    ],
    "correct": "FUN",
    "rhymeSound": "un",
    "hint": "Bright star in sky"
  },
  {
    "id": 2,
    "targetWord": "BRIGHT",
    "options": [
      "NIGHT",
      "CHAIR",
      "WATER",
      "BIRD"
    ],
    "correct": "NIGHT",
    "rhymeSound": "ite",
    "hint": "Full of clear light"
  },
  {
    "id": 3,
    "targetWord": "CARE",
    "options": [
      "SHARE",
      "FLOWER",
      "APPLE",
      "MOON"
    ],
    "correct": "SHARE",
    "rhymeSound": "air",
    "hint": "Loving attention"
  },
  {
    "id": 4,
    "targetWord": "RING",
    "options": [
      "SING",
      "LEAF",
      "DOOR",
      "RIVER"
    ],
    "correct": "SING",
    "rhymeSound": "ing",
    "hint": "Circular jewelry"
  },
  {
    "id": 5,
    "targetWord": "BOAT",
    "options": [
      "FLOAT",
      "DESK",
      "GRASS",
      "CLOUD"
    ],
    "correct": "FLOAT",
    "rhymeSound": "oat",
    "hint": "Water vessel"
  },
  {
    "id": 6,
    "targetWord": "BELL",
    "options": [
      "WELL",
      "TABLE",
      "ROAD",
      "LAMP"
    ],
    "correct": "WELL",
    "rhymeSound": "ell",
    "hint": "Ringing chime"
  },
  {
    "id": 7,
    "targetWord": "BEE",
    "options": [
      "TREE",
      "CAR",
      "MILK",
      "PLATE"
    ],
    "correct": "TREE",
    "rhymeSound": "ee",
    "hint": "Honey maker"
  },
  {
    "id": 8,
    "targetWord": "CAKE",
    "options": [
      "BAKE",
      "FISH",
      "BED",
      "WINDOW"
    ],
    "correct": "BAKE",
    "rhymeSound": "ake",
    "hint": "Sweet treat"
  },
  {
    "id": 9,
    "targetWord": "RAIN",
    "options": [
      "TRAIN",
      "HOUSE",
      "FLUTE",
      "MOON"
    ],
    "correct": "TRAIN",
    "rhymeSound": "ain",
    "hint": "Falling water"
  },
  {
    "id": 10,
    "targetWord": "STAR",
    "options": [
      "CAR",
      "SOUP",
      "DOVE",
      "SHOES"
    ],
    "correct": "CAR",
    "rhymeSound": "ar",
    "hint": "Night sparkle"
  },
  {
    "id": 11,
    "targetWord": "HEART",
    "options": [
      "ART",
      "BOOK",
      "TREE",
      "CUP"
    ],
    "correct": "ART",
    "rhymeSound": "art",
    "hint": "Loving center"
  },
  {
    "id": 12,
    "targetWord": "LIGHT",
    "options": [
      "SIGHT",
      "BOWL",
      "ROAD",
      "CAT"
    ],
    "correct": "SIGHT",
    "rhymeSound": "ite",
    "hint": "Radiant lamp"
  },
  {
    "id": 13,
    "targetWord": "MOON",
    "options": [
      "SPOON",
      "CHAI",
      "GRASS",
      "LEAF"
    ],
    "correct": "SPOON",
    "rhymeSound": "oon",
    "hint": "Night sky orb"
  },
  {
    "id": 14,
    "targetWord": "BIRD",
    "options": [
      "WORD",
      "DOOR",
      "FORK",
      "WELL"
    ],
    "correct": "WORD",
    "rhymeSound": "urd",
    "hint": "Feathered singer"
  },
  {
    "id": 15,
    "targetWord": "DEAR",
    "options": [
      "CLEAR",
      "WATER",
      "BREAD",
      "SUN"
    ],
    "correct": "CLEAR",
    "rhymeSound": "eer",
    "hint": "Cherished person"
  },
  {
    "id": 16,
    "targetWord": "SWEET",
    "options": [
      "MEET",
      "BIRD",
      "FIRE",
      "LAMP"
    ],
    "correct": "MEET",
    "rhymeSound": "eet",
    "hint": "Pleasant flavor"
  },
  {
    "id": 17,
    "targetWord": "FLOW",
    "options": [
      "GLOW",
      "ROCK",
      "TREE",
      "FISH"
    ],
    "correct": "GLOW",
    "rhymeSound": "ow",
    "hint": "Moving stream"
  },
  {
    "id": 18,
    "targetWord": "KIND",
    "options": [
      "MIND",
      "SOUP",
      "DESK",
      "BOAT"
    ],
    "correct": "MIND",
    "rhymeSound": "ined",
    "hint": "Gentle-hearted"
  },
  {
    "id": 19,
    "targetWord": "PEACE",
    "options": [
      "LEASE",
      "CLOCK",
      "BREAD",
      "CHAIR"
    ],
    "correct": "LEASE",
    "rhymeSound": "ees",
    "hint": "Calm tranquility"
  },
  {
    "id": 20,
    "targetWord": "DEEP",
    "options": [
      "SLEEP",
      "RIVER",
      "WALL",
      "STAR"
    ],
    "correct": "SLEEP",
    "rhymeSound": "eep",
    "hint": "Vast depth"
  },
  {
    "id": 21,
    "targetWord": "SPRING",
    "options": [
      "WING",
      "CARROT",
      "BELL",
      "CUP"
    ],
    "correct": "WING",
    "rhymeSound": "ing",
    "hint": "Season of flowers"
  },
  {
    "id": 22,
    "targetWord": "LAKE",
    "options": [
      "MAKE",
      "ROSE",
      "DOOR",
      "MILK"
    ],
    "correct": "MAKE",
    "rhymeSound": "ake",
    "hint": "Still water body"
  },
  {
    "id": 23,
    "targetWord": "REST",
    "options": [
      "BEST",
      "APPLE",
      "KITE",
      "SUN"
    ],
    "correct": "BEST",
    "rhymeSound": "est",
    "hint": "Rejuvenating pause"
  },
  {
    "id": 24,
    "targetWord": "NICE",
    "options": [
      "RICE",
      "PLATE",
      "FLUTE",
      "TREE"
    ],
    "correct": "RICE",
    "rhymeSound": "ice",
    "hint": "Kind and lovely"
  },
  {
    "id": 25,
    "targetWord": "FAIR",
    "options": [
      "HAIR",
      "POTATO",
      "ROAD",
      "LAMP"
    ],
    "correct": "HAIR",
    "rhymeSound": "air",
    "hint": "Festive mela"
  },
  {
    "id": 26,
    "targetWord": "PLAY",
    "options": [
      "DAY",
      "BOOK",
      "WATER",
      "BIRD"
    ],
    "correct": "DAY",
    "rhymeSound": "ay",
    "hint": "Joyful activity"
  },
  {
    "id": 27,
    "targetWord": "WARM",
    "options": [
      "STORM",
      "DESK",
      "LEAF",
      "CHAI"
    ],
    "correct": "STORM",
    "rhymeSound": "orm",
    "hint": "Pleasant heat"
  },
  {
    "id": 28,
    "targetWord": "SEED",
    "options": [
      "FEED",
      "CAR",
      "MOON",
      "RIVER"
    ],
    "correct": "FEED",
    "rhymeSound": "eed",
    "hint": "Origin of plant"
  },
  {
    "id": 29,
    "targetWord": "COOL",
    "options": [
      "POOL",
      "BREAD",
      "BELL",
      "STAR"
    ],
    "correct": "POOL",
    "rhymeSound": "ool",
    "hint": "Refreshing chill"
  },
  {
    "id": 30,
    "targetWord": "SMILE",
    "options": [
      "WHILE",
      "FLOWER",
      "CUP",
      "DOOR"
    ],
    "correct": "WHILE",
    "rhymeSound": "ile",
    "hint": "Happy expression"
  },
  {
    "id": 31,
    "targetWord": "GOLD",
    "options": [
      "BOLD",
      "HOUSE",
      "TREE",
      "WATER"
    ],
    "correct": "BOLD",
    "rhymeSound": "old",
    "hint": "Precious metal"
  },
  {
    "id": 32,
    "targetWord": "LEAF",
    "options": [
      "BRIEF",
      "PLATE",
      "ROAD",
      "LAMP"
    ],
    "correct": "BRIEF",
    "rhymeSound": "eef",
    "hint": "Green foliage"
  },
  {
    "id": 33,
    "targetWord": "TRUE",
    "options": [
      "BLUE",
      "CARROT",
      "CLOCK",
      "DESK"
    ],
    "correct": "BLUE",
    "rhymeSound": "oo",
    "hint": "Honest and loyal"
  },
  {
    "id": 34,
    "targetWord": "GIFT",
    "options": [
      "LIFT",
      "CHAI",
      "DOVE",
      "BREAD"
    ],
    "correct": "LIFT",
    "rhymeSound": "ift",
    "hint": "Present of love"
  },
  {
    "id": 35,
    "targetWord": "SAND",
    "options": [
      "HAND",
      "FISH",
      "SUN",
      "RIVER"
    ],
    "correct": "HAND",
    "rhymeSound": "and",
    "hint": "Beach crystals"
  },
  {
    "id": 36,
    "targetWord": "HOPE",
    "options": [
      "ROPE",
      "APPLE",
      "TREE",
      "MOON"
    ],
    "correct": "ROPE",
    "rhymeSound": "ope",
    "hint": "Optimistic wish"
  },
  {
    "id": 37,
    "targetWord": "WALK",
    "options": [
      "TALK",
      "BOOK",
      "FLUTE",
      "CUP"
    ],
    "correct": "TALK",
    "rhymeSound": "awk",
    "hint": "Morning stroll"
  },
  {
    "id": 38,
    "targetWord": "PALE",
    "options": [
      "TALE",
      "DOOR",
      "WATER",
      "BELL"
    ],
    "correct": "TALE",
    "rhymeSound": "ale",
    "hint": "Soft light hue"
  },
  {
    "id": 39,
    "targetWord": "ROSE",
    "options": [
      "NOSE",
      "CHAIR",
      "BIRD",
      "RICE"
    ],
    "correct": "NOSE",
    "rhymeSound": "oze",
    "hint": "Fragrant flower"
  },
  {
    "id": 40,
    "targetWord": "CHAIR",
    "options": [
      "PAIR",
      "CARROT",
      "STAR",
      "ROAD"
    ],
    "correct": "PAIR",
    "rhymeSound": "air",
    "hint": "Seat for rest"
  },
  {
    "id": 41,
    "targetWord": "DAWN",
    "options": [
      "LAWN",
      "PLATE",
      "LAMP",
      "DESK"
    ],
    "correct": "LAWN",
    "rhymeSound": "awn",
    "hint": "First sunrise"
  },
  {
    "id": 42,
    "targetWord": "LANE",
    "options": [
      "PANE",
      "BREAD",
      "DOVE",
      "WATER"
    ],
    "correct": "PANE",
    "rhymeSound": "ane",
    "hint": "Country pathway"
  },
  {
    "id": 43,
    "targetWord": "MEND",
    "options": [
      "FRIEND",
      "TREE",
      "SUN",
      "MOON"
    ],
    "correct": "FRIEND",
    "rhymeSound": "end",
    "hint": "Repair gently"
  },
  {
    "id": 44,
    "targetWord": "KITE",
    "options": [
      "WHITE",
      "APPLE",
      "RIVER",
      "CUP"
    ],
    "correct": "WHITE",
    "rhymeSound": "ite",
    "hint": "Flying toy"
  },
  {
    "id": 45,
    "targetWord": "PRAY",
    "options": [
      "STAY",
      "BOOK",
      "BELL",
      "FLUTE"
    ],
    "correct": "STAY",
    "rhymeSound": "ay",
    "hint": "Sacred devotion"
  },
  {
    "id": 46,
    "targetWord": "FEEL",
    "options": [
      "HEAL",
      "ROAD",
      "DOOR",
      "STAR"
    ],
    "correct": "HEAL",
    "rhymeSound": "eel",
    "hint": "Tactile touch"
  },
  {
    "id": 47,
    "targetWord": "TIME",
    "options": [
      "CHIME",
      "CARROT",
      "CHAI",
      "LEAF"
    ],
    "correct": "CHIME",
    "rhymeSound": "ime",
    "hint": "Ticking rhythm"
  },
  {
    "id": 48,
    "targetWord": "LOOK",
    "options": [
      "BOOK",
      "WATER",
      "TREE",
      "LAMP"
    ],
    "correct": "BOOK",
    "rhymeSound": "ook",
    "hint": "Gaze upon"
  },
  {
    "id": 49,
    "targetWord": "FEAST",
    "options": [
      "EAST",
      "BREAD",
      "BIRD",
      "DESK"
    ],
    "correct": "EAST",
    "rhymeSound": "east",
    "hint": "Celebration meal"
  },
  {
    "id": 50,
    "targetWord": "BREEZE",
    "options": [
      "TREES",
      "PLATE",
      "SUN",
      "RIVER"
    ],
    "correct": "TREES",
    "rhymeSound": "eez",
    "hint": "Gentle wind"
  }
];
export const LEVEL_7_RHYMES = LEVEL_7_RHYMES_POOL.slice(0, 3);

// Level 8: 50 Categories Pool
export const LEVEL_8_CATEGORIES_POOL = [
  {
    "id": 1,
    "theme": "Fruits & Veggies",
    "categoryA": {
      "name": "Fresh Fruits \ud83c\udf4e",
      "key": "fruits",
      "icon": "nutrition"
    },
    "categoryB": {
      "name": "Garden Veggies \ud83e\udd55",
      "key": "veggies",
      "icon": "eco"
    },
    "items": [
      {
        "id": "item_1_1",
        "label": "Sweet Mango",
        "category": "fruits",
        "icon": "nutrition"
      },
      {
        "id": "item_1_2",
        "label": "Crunchy Carrot",
        "category": "veggies",
        "icon": "eco"
      },
      {
        "id": "item_1_3",
        "label": "Ripe Banana",
        "category": "fruits",
        "icon": "nutrition"
      },
      {
        "id": "item_1_4",
        "label": "Green Spinach",
        "category": "veggies",
        "icon": "eco"
      }
    ]
  },
  {
    "id": 2,
    "theme": "Hot & Cold",
    "categoryA": {
      "name": "Warm & Hot \u2615",
      "key": "hot",
      "icon": "local_fire_department"
    },
    "categoryB": {
      "name": "Cool & Refreshing \u2744\ufe0f",
      "key": "cold",
      "icon": "ac_unit"
    },
    "items": [
      {
        "id": "item_2_1",
        "label": "Steaming Chai",
        "category": "hot",
        "icon": "local_fire_department"
      },
      {
        "id": "item_2_2",
        "label": "Iced Lemonade",
        "category": "cold",
        "icon": "ac_unit"
      },
      {
        "id": "item_2_3",
        "label": "Fresh Hot Soup",
        "category": "hot",
        "icon": "local_fire_department"
      },
      {
        "id": "item_2_4",
        "label": "Vanilla Ice Cream",
        "category": "cold",
        "icon": "ac_unit"
      }
    ]
  },
  {
    "id": 3,
    "theme": "Morning & Night",
    "categoryA": {
      "name": "Morning Sunshine \u2600\ufe0f",
      "key": "morning",
      "icon": "wb_sunny"
    },
    "categoryB": {
      "name": "Peaceful Night \ud83c\udf19",
      "key": "night",
      "icon": "dark_mode"
    },
    "items": [
      {
        "id": "item_3_1",
        "label": "Golden Sunrise",
        "category": "morning",
        "icon": "wb_sunny"
      },
      {
        "id": "item_3_2",
        "label": "Twinkling Star",
        "category": "night",
        "icon": "dark_mode"
      },
      {
        "id": "item_3_3",
        "label": "Morning Breakfast",
        "category": "morning",
        "icon": "wb_sunny"
      },
      {
        "id": "item_3_4",
        "label": "Cozy Sleep Blanket",
        "category": "night",
        "icon": "dark_mode"
      }
    ]
  },
  {
    "id": 4,
    "theme": "Animals & Birds",
    "categoryA": {
      "name": "Gentle Animals \ud83d\udc04",
      "key": "animals",
      "icon": "pets"
    },
    "categoryB": {
      "name": "Singing Birds \ud83e\udd9a",
      "key": "birds",
      "icon": "flutter"
    },
    "items": [
      {
        "id": "item_4_1",
        "label": "Grazing Cow",
        "category": "animals",
        "icon": "pets"
      },
      {
        "id": "item_4_2",
        "label": "Royal Peacock",
        "category": "birds",
        "icon": "flutter"
      },
      {
        "id": "item_4_3",
        "label": "Playful Puppy",
        "category": "animals",
        "icon": "pets"
      },
      {
        "id": "item_4_4",
        "label": "Chirping Sparrow",
        "category": "birds",
        "icon": "flutter"
      }
    ]
  },
  {
    "id": 5,
    "theme": "Indoor & Outdoor",
    "categoryA": {
      "name": "Inside Home \ud83c\udfe0",
      "key": "indoor",
      "icon": "home"
    },
    "categoryB": {
      "name": "Open Nature \ud83c\udf33",
      "key": "outdoor",
      "icon": "park"
    },
    "items": [
      {
        "id": "item_5_1",
        "label": "Living Room Sofa",
        "category": "indoor",
        "icon": "home"
      },
      {
        "id": "item_5_2",
        "label": "Tall Shady Tree",
        "category": "outdoor",
        "icon": "park"
      },
      {
        "id": "item_5_3",
        "label": "Kitchen Dining Table",
        "category": "indoor",
        "icon": "home"
      },
      {
        "id": "item_5_4",
        "label": "Flowing River Pathway",
        "category": "outdoor",
        "icon": "park"
      }
    ]
  },
  {
    "id": 6,
    "theme": "Vehicles & Buildings",
    "categoryA": {
      "name": "Travel Vehicles \ud83d\ude97",
      "key": "vehicles",
      "icon": "directions_car"
    },
    "categoryB": {
      "name": "Sturdy Buildings \ud83c\udfdb\ufe0f",
      "key": "buildings",
      "icon": "apartment"
    },
    "items": [
      {
        "id": "item_6_1",
        "label": "Classic Car",
        "category": "vehicles",
        "icon": "directions_car"
      },
      {
        "id": "item_6_2",
        "label": "Peaceful Library",
        "category": "buildings",
        "icon": "apartment"
      },
      {
        "id": "item_6_3",
        "label": "Scenic Train",
        "category": "vehicles",
        "icon": "directions_car"
      },
      {
        "id": "item_6_4",
        "label": "Heritage Palace",
        "category": "buildings",
        "icon": "apartment"
      }
    ]
  },
  {
    "id": 7,
    "theme": "Music & Sports",
    "categoryA": {
      "name": "Musical Instruments \ud83c\udfb5",
      "key": "music",
      "icon": "music_note"
    },
    "categoryB": {
      "name": "Active Sports \u26bd",
      "key": "sports",
      "icon": "sports_soccer"
    },
    "items": [
      {
        "id": "item_7_1",
        "label": "Acoustic Guitar",
        "category": "music",
        "icon": "music_note"
      },
      {
        "id": "item_7_2",
        "label": "Football",
        "category": "sports",
        "icon": "sports_soccer"
      },
      {
        "id": "item_7_3",
        "label": "Bamboo Flute",
        "category": "music",
        "icon": "music_note"
      },
      {
        "id": "item_7_4",
        "label": "Tennis Racket",
        "category": "sports",
        "icon": "sports_soccer"
      }
    ]
  },
  {
    "id": 8,
    "theme": "Sweet & Savory",
    "categoryA": {
      "name": "Sweet Delights \ud83c\udf6f",
      "key": "sweet",
      "icon": "cake"
    },
    "categoryB": {
      "name": "Savory Dishes \ud83c\udf72",
      "key": "savory",
      "icon": "restaurant"
    },
    "items": [
      {
        "id": "item_8_1",
        "label": "Gulab Jamun",
        "category": "sweet",
        "icon": "cake"
      },
      {
        "id": "item_8_2",
        "label": "Spiced Samosa",
        "category": "savory",
        "icon": "restaurant"
      },
      {
        "id": "item_8_3",
        "label": "Honey Jalebi",
        "category": "sweet",
        "icon": "cake"
      },
      {
        "id": "item_8_4",
        "label": "Warm Dal Curry",
        "category": "savory",
        "icon": "restaurant"
      }
    ]
  },
  {
    "id": 9,
    "theme": "Flowers & Trees",
    "categoryA": {
      "name": "Fragrant Flowers \ud83c\udf38",
      "key": "flowers",
      "icon": "local_florist"
    },
    "categoryB": {
      "name": "Mighty Trees \ud83c\udf32",
      "key": "trees",
      "icon": "forest"
    },
    "items": [
      {
        "id": "item_9_1",
        "label": "Pink Rose",
        "category": "flowers",
        "icon": "local_florist"
      },
      {
        "id": "item_9_2",
        "label": "Sturdy Oak",
        "category": "trees",
        "icon": "forest"
      },
      {
        "id": "item_9_3",
        "label": "Sacred Lotus",
        "category": "flowers",
        "icon": "local_florist"
      },
      {
        "id": "item_9_4",
        "label": "Evergreen Pine",
        "category": "trees",
        "icon": "forest"
      }
    ]
  },
  {
    "id": 10,
    "theme": "Summer & Winter",
    "categoryA": {
      "name": "Warm Summer \ud83c\udfd6\ufe0f",
      "key": "summer",
      "icon": "sunny"
    },
    "categoryB": {
      "name": "Cozy Winter \u2744\ufe0f",
      "key": "winter",
      "icon": "severe_cold"
    },
    "items": [
      {
        "id": "item_10_1",
        "label": "Cotton Sunhat",
        "category": "summer",
        "icon": "sunny"
      },
      {
        "id": "item_10_2",
        "label": "Woolen Sweater",
        "category": "winter",
        "icon": "severe_cold"
      },
      {
        "id": "item_10_3",
        "label": "Cool Coconut Water",
        "category": "summer",
        "icon": "sunny"
      },
      {
        "id": "item_10_4",
        "label": "Fireside Blanket",
        "category": "winter",
        "icon": "severe_cold"
      }
    ]
  },
  {
    "id": 11,
    "theme": "Water & Land",
    "categoryA": {
      "name": "Water Bodies \ud83c\udf0a",
      "key": "water",
      "icon": "water"
    },
    "categoryB": {
      "name": "Land Formations \ud83c\udfd4\ufe0f",
      "key": "land",
      "icon": "landscape"
    },
    "items": [
      {
        "id": "item_11_1",
        "label": "Flowing River",
        "category": "water",
        "icon": "water"
      },
      {
        "id": "item_11_2",
        "label": "Towering Mountain",
        "category": "land",
        "icon": "landscape"
      },
      {
        "id": "item_11_3",
        "label": "Vast Ocean",
        "category": "water",
        "icon": "water"
      },
      {
        "id": "item_11_4",
        "label": "Lush Green Valley",
        "category": "land",
        "icon": "landscape"
      }
    ]
  },
  {
    "id": 12,
    "theme": "Kitchen & Garden Tools",
    "categoryA": {
      "name": "Kitchen Utensils \ud83c\udf73",
      "key": "kitchen",
      "icon": "kitchen"
    },
    "categoryB": {
      "name": "Garden Tools \ud83c\udf3b",
      "key": "garden",
      "icon": "yard"
    },
    "items": [
      {
        "id": "item_12_1",
        "label": "Cooking Spoon",
        "category": "kitchen",
        "icon": "kitchen"
      },
      {
        "id": "item_12_2",
        "label": "Planting Trowel",
        "category": "garden",
        "icon": "yard"
      },
      {
        "id": "item_12_3",
        "label": "Tea Kettle",
        "category": "kitchen",
        "icon": "kitchen"
      },
      {
        "id": "item_12_4",
        "label": "Watering Can",
        "category": "garden",
        "icon": "yard"
      }
    ]
  },
  {
    "id": 13,
    "theme": "Sky & Sea",
    "categoryA": {
      "name": "High in Sky \u2601\ufe0f",
      "key": "sky",
      "icon": "cloud"
    },
    "categoryB": {
      "name": "Deep in Sea \ud83d\udc1a",
      "key": "sea",
      "icon": "waves"
    },
    "items": [
      {
        "id": "item_13_1",
        "label": "Fluffy White Cloud",
        "category": "sky",
        "icon": "cloud"
      },
      {
        "id": "item_13_2",
        "label": "Spiral Seashell",
        "category": "sea",
        "icon": "waves"
      },
      {
        "id": "item_13_3",
        "label": "Flying Kite",
        "category": "sky",
        "icon": "cloud"
      },
      {
        "id": "item_13_4",
        "label": "Swimming Dolphin",
        "category": "sea",
        "icon": "waves"
      }
    ]
  },
  {
    "id": 14,
    "theme": "Spices & Sweeteners",
    "categoryA": {
      "name": "Healing Spices \ud83c\udf36\ufe0f",
      "key": "spices",
      "icon": "spa"
    },
    "categoryB": {
      "name": "Sweet Nectars \ud83c\udf6f",
      "key": "sweeteners",
      "icon": "emoji_food_beverage"
    },
    "items": [
      {
        "id": "item_14_1",
        "label": "Golden Turmeric",
        "category": "spices",
        "icon": "spa"
      },
      {
        "id": "item_14_2",
        "label": "Pure Honey",
        "category": "sweeteners",
        "icon": "emoji_food_beverage"
      },
      {
        "id": "item_14_3",
        "label": "Cinnamon Bark",
        "category": "spices",
        "icon": "spa"
      },
      {
        "id": "item_14_4",
        "label": "Cane Jaggery",
        "category": "sweeteners",
        "icon": "emoji_food_beverage"
      }
    ]
  },
  {
    "id": 15,
    "theme": "Grains & Dairy",
    "categoryA": {
      "name": "Wholesome Grains \ud83c\udf3e",
      "key": "grains",
      "icon": "grain"
    },
    "categoryB": {
      "name": "Fresh Dairy \ud83e\udd5b",
      "key": "dairy",
      "icon": "local_drink"
    },
    "items": [
      {
        "id": "item_15_1",
        "label": "Basmati Rice",
        "category": "grains",
        "icon": "grain"
      },
      {
        "id": "item_15_2",
        "label": "Creamy Milk",
        "category": "dairy",
        "icon": "local_drink"
      },
      {
        "id": "item_15_3",
        "label": "Whole Wheat Flour",
        "category": "grains",
        "icon": "grain"
      },
      {
        "id": "item_15_4",
        "label": "Fresh Curd Yogurt",
        "category": "dairy",
        "icon": "local_drink"
      }
    ]
  },
  {
    "id": 16,
    "theme": "Clothing & Footwear",
    "categoryA": {
      "name": "Comfort Clothing \ud83d\udc57",
      "key": "clothing",
      "icon": "checkroom"
    },
    "categoryB": {
      "name": "Footwear \ud83d\udc5e",
      "key": "footwear",
      "icon": "steps"
    },
    "items": [
      {
        "id": "item_16_1",
        "label": "Silk Saree",
        "category": "clothing",
        "icon": "checkroom"
      },
      {
        "id": "item_16_2",
        "label": "Soft House Slippers",
        "category": "footwear",
        "icon": "steps"
      },
      {
        "id": "item_16_3",
        "label": "Cotton Kurta",
        "category": "clothing",
        "icon": "checkroom"
      },
      {
        "id": "item_16_4",
        "label": "Sturdy Walking Shoes",
        "category": "footwear",
        "icon": "steps"
      }
    ]
  },
  {
    "id": 17,
    "theme": "Reading & Writing",
    "categoryA": {
      "name": "Reading Materials \ud83d\udcd6",
      "key": "reading",
      "icon": "menu_book"
    },
    "categoryB": {
      "name": "Writing Tools \u270d\ufe0f",
      "key": "writing",
      "icon": "edit"
    },
    "items": [
      {
        "id": "item_17_1",
        "label": "Illustrated Novel",
        "category": "reading",
        "icon": "menu_book"
      },
      {
        "id": "item_17_2",
        "label": "Fountain Pen",
        "category": "writing",
        "icon": "edit"
      },
      {
        "id": "item_17_3",
        "label": "Morning Newspaper",
        "category": "reading",
        "icon": "menu_book"
      },
      {
        "id": "item_17_4",
        "label": "Smooth Ink Pencil",
        "category": "writing",
        "icon": "edit"
      }
    ]
  },
  {
    "id": 18,
    "theme": "Day & Night Activities",
    "categoryA": {
      "name": "Daytime Energy \ud83d\udeb6",
      "key": "day",
      "icon": "directions_walk"
    },
    "categoryB": {
      "name": "Nighttime Rest \ud83d\udecf\ufe0f",
      "key": "night",
      "icon": "bedtime"
    },
    "items": [
      {
        "id": "item_18_1",
        "label": "Garden Morning Walk",
        "category": "day",
        "icon": "directions_walk"
      },
      {
        "id": "item_18_2",
        "label": "Deep Sleep Slumber",
        "category": "night",
        "icon": "bedtime"
      },
      {
        "id": "item_18_3",
        "label": "Gardening Blossoms",
        "category": "day",
        "icon": "directions_walk"
      },
      {
        "id": "item_18_4",
        "label": "Listening to Lullaby",
        "category": "night",
        "icon": "bedtime"
      }
    ]
  },
  {
    "id": 19,
    "theme": "Art & Science",
    "categoryA": {
      "name": "Creative Arts \ud83c\udfa8",
      "key": "art",
      "icon": "palette"
    },
    "categoryB": {
      "name": "Science & Nature \ud83d\udd2c",
      "key": "science",
      "icon": "science"
    },
    "items": [
      {
        "id": "item_19_1",
        "label": "Canvas Oil Painting",
        "category": "art",
        "icon": "palette"
      },
      {
        "id": "item_19_2",
        "label": "Magnifying Glass",
        "category": "science",
        "icon": "science"
      },
      {
        "id": "item_19_3",
        "label": "Clay Pottery Bowl",
        "category": "art",
        "icon": "palette"
      },
      {
        "id": "item_19_4",
        "label": "Brass Compass",
        "category": "science",
        "icon": "science"
      }
    ]
  },
  {
    "id": 20,
    "theme": "Colors & Shapes",
    "categoryA": {
      "name": "Bright Colors \ud83c\udf08",
      "key": "colors",
      "icon": "palette"
    },
    "categoryB": {
      "name": "Geometric Shapes \ud83d\udd37",
      "key": "shapes",
      "icon": "shapes"
    },
    "items": [
      {
        "id": "item_20_1",
        "label": "Golden Yellow",
        "category": "colors",
        "icon": "palette"
      },
      {
        "id": "item_20_2",
        "label": "Perfect Circle",
        "category": "shapes",
        "icon": "shapes"
      },
      {
        "id": "item_20_3",
        "label": "Emerald Green",
        "category": "colors",
        "icon": "palette"
      },
      {
        "id": "item_20_4",
        "label": "Sturdy Square",
        "category": "shapes",
        "icon": "shapes"
      }
    ]
  },
  {
    "id": 21,
    "theme": "Wild & Domestic Animals",
    "categoryA": {
      "name": "Gentle Pets \ud83d\udc31",
      "key": "domestic",
      "icon": "pets"
    },
    "categoryB": {
      "name": "Jungle Animals \ud83e\udd81",
      "key": "wild",
      "icon": "cruelty_free"
    },
    "items": [
      {
        "id": "item_21_1",
        "label": "Purring House Cat",
        "category": "domestic",
        "icon": "pets"
      },
      {
        "id": "item_21_2",
        "label": "Mighty Tiger",
        "category": "wild",
        "icon": "cruelty_free"
      },
      {
        "id": "item_21_3",
        "label": "Friendly Dog",
        "category": "domestic",
        "icon": "pets"
      },
      {
        "id": "item_21_4",
        "label": "Tall Giraffe",
        "category": "wild",
        "icon": "cruelty_free"
      }
    ]
  },
  {
    "id": 22,
    "theme": "Warm Brews & Cold Drinks",
    "categoryA": {
      "name": "Warm Brews \u2615",
      "key": "warm",
      "icon": "coffee"
    },
    "categoryB": {
      "name": "Cold Refreshers \ud83e\udd64",
      "key": "cold",
      "icon": "water_drop"
    },
    "items": [
      {
        "id": "item_22_1",
        "label": "Ginger Cardamom Tea",
        "category": "warm",
        "icon": "coffee"
      },
      {
        "id": "item_22_2",
        "label": "Chilled Rose Sherbet",
        "category": "cold",
        "icon": "water_drop"
      },
      {
        "id": "item_22_3",
        "label": "Hot Filter Coffee",
        "category": "warm",
        "icon": "coffee"
      },
      {
        "id": "item_22_4",
        "label": "Sweet Mango Lassi",
        "category": "cold",
        "icon": "water_drop"
      }
    ]
  },
  {
    "id": 23,
    "theme": "Festivals of Lights & Colors",
    "categoryA": {
      "name": "Lights Festivals \ud83e\ude94",
      "key": "lights",
      "icon": "light_mode"
    },
    "categoryB": {
      "name": "Spring Colors \ud83c\udfa8",
      "key": "colors",
      "icon": "palette"
    },
    "items": [
      {
        "id": "item_23_1",
        "label": "Deepavali Diya",
        "category": "lights",
        "icon": "light_mode"
      },
      {
        "id": "item_23_2",
        "label": "Holi Gulal Powder",
        "category": "colors",
        "icon": "palette"
      },
      {
        "id": "item_23_3",
        "label": "Karthigai Lamp",
        "category": "lights",
        "icon": "light_mode"
      },
      {
        "id": "item_23_4",
        "label": "Spring Flower Rangoli",
        "category": "colors",
        "icon": "palette"
      }
    ]
  },
  {
    "id": 24,
    "theme": "Fabrics & Metals",
    "categoryA": {
      "name": "Soft Fabrics \ud83e\udde3",
      "key": "fabrics",
      "icon": "texture"
    },
    "categoryB": {
      "name": "Precious Metals \ud83e\ude99",
      "key": "metals",
      "icon": "monetization_on"
    },
    "items": [
      {
        "id": "item_24_1",
        "label": "Pashmina Wool",
        "category": "fabrics",
        "icon": "texture"
      },
      {
        "id": "item_24_2",
        "label": "Pure Gold Coin",
        "category": "metals",
        "icon": "monetization_on"
      },
      {
        "id": "item_24_3",
        "label": "Mulberry Silk",
        "category": "fabrics",
        "icon": "texture"
      },
      {
        "id": "item_24_4",
        "label": "Silver Bell",
        "category": "metals",
        "icon": "monetization_on"
      }
    ]
  },
  {
    "id": 25,
    "theme": "Herbs & Fruits",
    "categoryA": {
      "name": "Healing Herbs \ud83c\udf3f",
      "key": "herbs",
      "icon": "eco"
    },
    "categoryB": {
      "name": "Juicy Fruits \ud83c\udf4e",
      "key": "fruits",
      "icon": "nutrition"
    },
    "items": [
      {
        "id": "item_25_1",
        "label": "Holy Basil Tulsi",
        "category": "herbs",
        "icon": "eco"
      },
      {
        "id": "item_25_2",
        "label": "Sweet Red Apple",
        "category": "fruits",
        "icon": "nutrition"
      },
      {
        "id": "item_25_3",
        "label": "Fresh Spearmint",
        "category": "herbs",
        "icon": "eco"
      },
      {
        "id": "item_25_4",
        "label": "Ripe Papaya",
        "category": "fruits",
        "icon": "nutrition"
      }
    ]
  },
  {
    "id": 26,
    "theme": "Sounds of Nature & City",
    "categoryA": {
      "name": "Nature Sounds \ud83c\udf43",
      "key": "nature",
      "icon": "forest"
    },
    "categoryB": {
      "name": "City Sounds \ud83c\udfd9\ufe0f",
      "key": "city",
      "icon": "location_city"
    },
    "items": [
      {
        "id": "item_26_1",
        "label": "Rustling Autumn Leaves",
        "category": "nature",
        "icon": "forest"
      },
      {
        "id": "item_26_2",
        "label": "Scenic Train Whistle",
        "category": "city",
        "icon": "location_city"
      },
      {
        "id": "item_26_3",
        "label": "Gurgling River Brook",
        "category": "nature",
        "icon": "forest"
      },
      {
        "id": "item_26_4",
        "label": "Bicycle Bell Ring",
        "category": "city",
        "icon": "location_city"
      }
    ]
  },
  {
    "id": 27,
    "theme": "Morning Meals & Evening Sweets",
    "categoryA": {
      "name": "Morning Breakfast \ud83e\udd5e",
      "key": "breakfast",
      "icon": "brunch_dining"
    },
    "categoryB": {
      "name": "Evening Sweets \ud83c\udf6e",
      "key": "dessert",
      "icon": "icecream"
    },
    "items": [
      {
        "id": "item_27_1",
        "label": "Steamed Soft Idli",
        "category": "breakfast",
        "icon": "brunch_dining"
      },
      {
        "id": "item_27_2",
        "label": "Sweet Kheer Pudding",
        "category": "dessert",
        "icon": "icecream"
      },
      {
        "id": "item_27_3",
        "label": "Crisp Dosa Flatbread",
        "category": "breakfast",
        "icon": "brunch_dining"
      },
      {
        "id": "item_27_4",
        "label": "Almond Barfi",
        "category": "dessert",
        "icon": "icecream"
      }
    ]
  },
  {
    "id": 28,
    "theme": "Water Vessels & Land Carts",
    "categoryA": {
      "name": "Boats & Vessels \u26f5",
      "key": "watercraft",
      "icon": "sailing"
    },
    "categoryB": {
      "name": "Land Carts & Cycles \ud83d\udeb2",
      "key": "landcraft",
      "icon": "pedal_bike"
    },
    "items": [
      {
        "id": "item_28_1",
        "label": "Wooden Sailboat",
        "category": "watercraft",
        "icon": "sailing"
      },
      {
        "id": "item_28_2",
        "label": "Heritage Bicycle",
        "category": "landcraft",
        "icon": "pedal_bike"
      },
      {
        "id": "item_28_3",
        "label": "Rowing Canoe",
        "category": "watercraft",
        "icon": "sailing"
      },
      {
        "id": "item_28_4",
        "label": "Bullock Cart",
        "category": "landcraft",
        "icon": "pedal_bike"
      }
    ]
  },
  {
    "id": 29,
    "theme": "Sky Objects & Ground Rocks",
    "categoryA": {
      "name": "Sky Wonders \u2601\ufe0f",
      "key": "sky",
      "icon": "wb_twilight"
    },
    "categoryB": {
      "name": "Earth Stones \ud83e\udea8",
      "key": "ground",
      "icon": "landscape"
    },
    "items": [
      {
        "id": "item_29_1",
        "label": "Glowing Rainbow",
        "category": "sky",
        "icon": "wb_twilight"
      },
      {
        "id": "item_29_2",
        "label": "Polished River Pebble",
        "category": "ground",
        "icon": "landscape"
      },
      {
        "id": "item_29_3",
        "label": "Shooting Star",
        "category": "sky",
        "icon": "wb_twilight"
      },
      {
        "id": "item_29_4",
        "label": "Granite Boulder",
        "category": "ground",
        "icon": "landscape"
      }
    ]
  },
  {
    "id": 30,
    "theme": "Indoor Furniture & Garden Flora",
    "categoryA": {
      "name": "Comfort Furniture \ud83d\udecb\ufe0f",
      "key": "furniture",
      "icon": "chair"
    },
    "categoryB": {
      "name": "Garden Plants \ud83c\udf31",
      "key": "garden",
      "icon": "local_florist"
    },
    "items": [
      {
        "id": "item_30_1",
        "label": "Rocking Recliner",
        "category": "furniture",
        "icon": "chair"
      },
      {
        "id": "item_30_2",
        "label": "Velvet Marigold",
        "category": "garden",
        "icon": "local_florist"
      },
      {
        "id": "item_30_3",
        "label": "Wooden Bookcase",
        "category": "furniture",
        "icon": "chair"
      },
      {
        "id": "item_30_4",
        "label": "Fragrant Jasmine",
        "category": "garden",
        "icon": "local_florist"
      }
    ]
  },
  {
    "id": 31,
    "theme": "Winter Wear & Summer Shades",
    "categoryA": {
      "name": "Winter Warmers \ud83e\udde4",
      "key": "winter",
      "icon": "dry_cleaning"
    },
    "categoryB": {
      "name": "Summer Gear \ud83d\udd76\ufe0f",
      "key": "summer",
      "icon": "wb_sunny"
    },
    "items": [
      {
        "id": "item_31_1",
        "label": "Woolen Hand Mittens",
        "category": "winter",
        "icon": "dry_cleaning"
      },
      {
        "id": "item_31_2",
        "label": "Cool Sunglasses",
        "category": "summer",
        "icon": "wb_sunny"
      },
      {
        "id": "item_31_3",
        "label": "Cozy Neck Muffler",
        "category": "winter",
        "icon": "dry_cleaning"
      },
      {
        "id": "item_31_4",
        "label": "Wide Straw Sunhat",
        "category": "summer",
        "icon": "wb_sunny"
      }
    ]
  },
  {
    "id": 32,
    "theme": "Traditional & Modern Lamps",
    "categoryA": {
      "name": "Traditional Lamps \ud83e\ude94",
      "key": "trad",
      "icon": "candle"
    },
    "categoryB": {
      "name": "Electric Lights \ud83d\udca1",
      "key": "elec",
      "icon": "lightbulb"
    },
    "items": [
      {
        "id": "item_32_1",
        "label": "Brass Temple Diya",
        "category": "trad",
        "icon": "candle"
      },
      {
        "id": "item_32_2",
        "label": "Soft Desk Reading Lamp",
        "category": "elec",
        "icon": "lightbulb"
      },
      {
        "id": "item_32_3",
        "label": "Clay Oil Candle",
        "category": "trad",
        "icon": "candle"
      },
      {
        "id": "item_32_4",
        "label": "Warm Fairy String Lights",
        "category": "elec",
        "icon": "lightbulb"
      }
    ]
  },
  {
    "id": 33,
    "theme": "Musical Strings & Drums",
    "categoryA": {
      "name": "String Instruments \ud83c\udfbb",
      "key": "strings",
      "icon": "music_note"
    },
    "categoryB": {
      "name": "Percussion Drums \ud83e\udd41",
      "key": "drums",
      "icon": "album"
    },
    "items": [
      {
        "id": "item_33_1",
        "label": "Classical Sitar",
        "category": "strings",
        "icon": "music_note"
      },
      {
        "id": "item_33_2",
        "label": "Rhythmic Tabla Pair",
        "category": "drums",
        "icon": "album"
      },
      {
        "id": "item_33_3",
        "label": "Wooden Acoustic Violin",
        "category": "strings",
        "icon": "music_note"
      },
      {
        "id": "item_33_4",
        "label": "Celebration Dhol",
        "category": "drums",
        "icon": "album"
      }
    ]
  },
  {
    "id": 34,
    "theme": "Citrus Fruits & Berries",
    "categoryA": {
      "name": "Citrus Fruits \ud83c\udf4a",
      "key": "citrus",
      "icon": "nutrition"
    },
    "categoryB": {
      "name": "Sweet Berries \ud83c\udf53",
      "key": "berries",
      "icon": "nutrition"
    },
    "items": [
      {
        "id": "item_34_1",
        "label": "Juicy Sweet Orange",
        "category": "citrus",
        "icon": "nutrition"
      },
      {
        "id": "item_34_2",
        "label": "Fresh Strawberry",
        "category": "berries",
        "icon": "nutrition"
      },
      {
        "id": "item_34_3",
        "label": "Yellow Lemon",
        "category": "citrus",
        "icon": "nutrition"
      },
      {
        "id": "item_34_4",
        "label": "Wild Blackberry",
        "category": "berries",
        "icon": "nutrition"
      }
    ]
  },
  {
    "id": 35,
    "theme": "Writing Papers & Digital Screens",
    "categoryA": {
      "name": "Paper & Books \ud83d\udcdc",
      "key": "paper",
      "icon": "description"
    },
    "categoryB": {
      "name": "Digital Screens \ud83d\udcf1",
      "key": "screen",
      "icon": "devices"
    },
    "items": [
      {
        "id": "item_35_1",
        "label": "Handwritten Postcard",
        "category": "paper",
        "icon": "description"
      },
      {
        "id": "item_35_2",
        "label": "Touchscreen Tablet",
        "category": "screen",
        "icon": "devices"
      },
      {
        "id": "item_35_3",
        "label": "Leather Diary",
        "category": "paper",
        "icon": "description"
      },
      {
        "id": "item_35_4",
        "label": "Elder Safe Radio",
        "category": "screen",
        "icon": "devices"
      }
    ]
  },
  {
    "id": 36,
    "theme": "Seaside & Mountain Items",
    "categoryA": {
      "name": "Seashore Treasures \ud83d\udc1a",
      "key": "sea",
      "icon": "beach_access"
    },
    "categoryB": {
      "name": "Mountain Peaks \ud83c\udfd4\ufe0f",
      "key": "mountain",
      "icon": "terrain"
    },
    "items": [
      {
        "id": "item_36_1",
        "label": "Spiral Seashell",
        "category": "sea",
        "icon": "beach_access"
      },
      {
        "id": "item_36_2",
        "label": "Pine Needle Cone",
        "category": "mountain",
        "icon": "terrain"
      },
      {
        "id": "item_36_3",
        "label": "Golden Beach Sand",
        "category": "sea",
        "icon": "beach_access"
      },
      {
        "id": "item_36_4",
        "label": "Alpine Glacier Snow",
        "category": "mountain",
        "icon": "terrain"
      }
    ]
  },
  {
    "id": 37,
    "theme": "Morning Chirps & Night Owls",
    "categoryA": {
      "name": "Morning Birds \ud83d\udc26",
      "key": "morning_birds",
      "icon": "wb_sunny"
    },
    "categoryB": {
      "name": "Night Birds \ud83e\udd89",
      "key": "night_birds",
      "icon": "dark_mode"
    },
    "items": [
      {
        "id": "item_37_1",
        "label": "Dawn Singing Sparrow",
        "category": "morning_birds",
        "icon": "wb_sunny"
      },
      {
        "id": "item_37_2",
        "label": "Wise Night Owl",
        "category": "night_birds",
        "icon": "dark_mode"
      },
      {
        "id": "item_37_3",
        "label": "Bright Yellow Myna",
        "category": "morning_birds",
        "icon": "wb_sunny"
      },
      {
        "id": "item_37_4",
        "label": "Evening Bat Flier",
        "category": "night_birds",
        "icon": "dark_mode"
      }
    ]
  },
  {
    "id": 38,
    "theme": "Warm Broths & Sweet Treats",
    "categoryA": {
      "name": "Nourishing Broths \ud83e\udd63",
      "key": "soup",
      "icon": "soup_kitchen"
    },
    "categoryB": {
      "name": "Sweet Puddings \ud83c\udf6e",
      "key": "pudding",
      "icon": "icecream"
    },
    "items": [
      {
        "id": "item_38_1",
        "label": "Lentil Tomato Soup",
        "category": "soup",
        "icon": "soup_kitchen"
      },
      {
        "id": "item_38_2",
        "label": "Saffron Rice Kheer",
        "category": "pudding",
        "icon": "icecream"
      },
      {
        "id": "item_38_3",
        "label": "Vegetable Ginger Broth",
        "category": "soup",
        "icon": "soup_kitchen"
      },
      {
        "id": "item_38_4",
        "label": "Sweet Carrot Halwa",
        "category": "pudding",
        "icon": "icecream"
      }
    ]
  },
  {
    "id": 39,
    "theme": "Kitchen Spices & Sweet Fruits",
    "categoryA": {
      "name": "Pungent Spices \ud83c\udf36\ufe0f",
      "key": "spice",
      "icon": "spa"
    },
    "categoryB": {
      "name": "Sweet Fruits \ud83c\udf47",
      "key": "fruit",
      "icon": "nutrition"
    },
    "items": [
      {
        "id": "item_39_1",
        "label": "Black Peppercorn",
        "category": "spice",
        "icon": "spa"
      },
      {
        "id": "item_39_2",
        "label": "Purple Sweet Grapes",
        "category": "fruit",
        "icon": "nutrition"
      },
      {
        "id": "item_39_3",
        "label": "Fragrant Cloves",
        "category": "spice",
        "icon": "spa"
      },
      {
        "id": "item_39_4",
        "label": "Crisp Red Apple",
        "category": "fruit",
        "icon": "nutrition"
      }
    ]
  },
  {
    "id": 40,
    "theme": "Footpaths & Waterways",
    "categoryA": {
      "name": "Land Footpaths \ud83d\udee4\ufe0f",
      "key": "landpath",
      "icon": "alt_route"
    },
    "categoryB": {
      "name": "River Waterways \ud83d\udef6",
      "key": "waterpath",
      "icon": "kayaking"
    },
    "items": [
      {
        "id": "item_40_1",
        "label": "Garden Cobblestone Path",
        "category": "landpath",
        "icon": "alt_route"
      },
      {
        "id": "item_40_2",
        "label": "Serene Canal Waterway",
        "category": "waterpath",
        "icon": "kayaking"
      },
      {
        "id": "item_40_3",
        "label": "Forest Trail Track",
        "category": "landpath",
        "icon": "alt_route"
      },
      {
        "id": "item_40_4",
        "label": "Gentle River Stream",
        "category": "waterpath",
        "icon": "kayaking"
      }
    ]
  },
  {
    "id": 41,
    "theme": "Sun & Moon Symbols",
    "categoryA": {
      "name": "Sun & Dawn \u2600\ufe0f",
      "key": "sun",
      "icon": "sunny"
    },
    "categoryB": {
      "name": "Moon & Stars \ud83c\udf19",
      "key": "moon",
      "icon": "nightlight"
    },
    "items": [
      {
        "id": "item_41_1",
        "label": "Golden Sunbeam",
        "category": "sun",
        "icon": "sunny"
      },
      {
        "id": "item_41_2",
        "label": "Crescent Silver Moon",
        "category": "moon",
        "icon": "nightlight"
      },
      {
        "id": "item_41_3",
        "label": "Morning Warmth",
        "category": "sun",
        "icon": "sunny"
      },
      {
        "id": "item_41_4",
        "label": "Twinkling Polaris Star",
        "category": "moon",
        "icon": "nightlight"
      }
    ]
  },
  {
    "id": 42,
    "theme": "Garden Flowers & Farm Crops",
    "categoryA": {
      "name": "Decorative Flowers \ud83c\udf3a",
      "key": "flowers",
      "icon": "local_florist"
    },
    "categoryB": {
      "name": "Farm Harvest Crops \ud83c\udf3e",
      "key": "crops",
      "icon": "agriculture"
    },
    "items": [
      {
        "id": "item_42_1",
        "label": "Velvet Hibiscus",
        "category": "flowers",
        "icon": "local_florist"
      },
      {
        "id": "item_42_2",
        "label": "Golden Wheat Grain",
        "category": "crops",
        "icon": "agriculture"
      },
      {
        "id": "item_42_3",
        "label": "Pink Rose Bud",
        "category": "flowers",
        "icon": "local_florist"
      },
      {
        "id": "item_42_4",
        "label": "Ears of Sweet Corn",
        "category": "crops",
        "icon": "agriculture"
      }
    ]
  },
  {
    "id": 43,
    "theme": "Traditional Games & Outdoor Sports",
    "categoryA": {
      "name": "Traditional Board Games \u265f\ufe0f",
      "key": "board",
      "icon": "casino"
    },
    "categoryB": {
      "name": "Active Outdoor Play \ud83c\udff8",
      "key": "play",
      "icon": "sports_tennis"
    },
    "items": [
      {
        "id": "item_43_1",
        "label": "Wooden Chess Set",
        "category": "board",
        "icon": "casino"
      },
      {
        "id": "item_43_2",
        "label": "Badminton Shuttlecock",
        "category": "play",
        "icon": "sports_tennis"
      },
      {
        "id": "item_43_3",
        "label": "Carrom Board & Striker",
        "category": "board",
        "icon": "casino"
      },
      {
        "id": "item_43_4",
        "label": "Flying Colorful Kite",
        "category": "play",
        "icon": "sports_tennis"
      }
    ]
  },
  {
    "id": 44,
    "theme": "Warm Fabrics & Natural Cane",
    "categoryA": {
      "name": "Woven Fabrics \ud83e\uddf6",
      "key": "fabrics",
      "icon": "texture"
    },
    "categoryB": {
      "name": "Natural Cane Crafts \ud83e\uddfa",
      "key": "cane",
      "icon": "inventory_2"
    },
    "items": [
      {
        "id": "item_44_1",
        "label": "Cashmere Woolen Shawl",
        "category": "fabrics",
        "icon": "texture"
      },
      {
        "id": "item_44_2",
        "label": "Woven Cane Basket",
        "category": "cane",
        "icon": "inventory_2"
      },
      {
        "id": "item_44_3",
        "label": "Pure Cotton Bedspread",
        "category": "fabrics",
        "icon": "texture"
      },
      {
        "id": "item_44_4",
        "label": "Bamboo Easy Chair",
        "category": "cane",
        "icon": "inventory_2"
      }
    ]
  },
  {
    "id": 45,
    "theme": "Sweet Nectars & Sour Pickles",
    "categoryA": {
      "name": "Sweet Preserves \ud83c\udf6f",
      "key": "sweet",
      "icon": "breakfast_dining"
    },
    "categoryB": {
      "name": "Tangy Pickles \ud83e\uded2",
      "key": "tangy",
      "icon": "dinner_dining"
    },
    "items": [
      {
        "id": "item_45_1",
        "label": "Golden Blossom Honey",
        "category": "sweet",
        "icon": "breakfast_dining"
      },
      {
        "id": "item_45_2",
        "label": "Spicy Mango Achar",
        "category": "tangy",
        "icon": "dinner_dining"
      },
      {
        "id": "item_45_3",
        "label": "Strawberry Fruit Jam",
        "category": "sweet",
        "icon": "breakfast_dining"
      },
      {
        "id": "item_45_4",
        "label": "Lemon Green Pickle",
        "category": "tangy",
        "icon": "dinner_dining"
      }
    ]
  },
  {
    "id": 46,
    "theme": "Kitchen Crockery & Cookware",
    "categoryA": {
      "name": "Serving Crockery \ud83c\udf7d\ufe0f",
      "key": "crockery",
      "icon": "flatware"
    },
    "categoryB": {
      "name": "Cooking Pots \ud83c\udf73",
      "key": "pots",
      "icon": "cooking"
    },
    "items": [
      {
        "id": "item_46_1",
        "label": "Porcelain Tea Cup",
        "category": "crockery",
        "icon": "flatware"
      },
      {
        "id": "item_46_2",
        "label": "Heavy Iron Kadai",
        "category": "pots",
        "icon": "cooking"
      },
      {
        "id": "item_46_3",
        "label": "Ceramic Dinner Plate",
        "category": "crockery",
        "icon": "flatware"
      },
      {
        "id": "item_46_4",
        "label": "Stainless Steel Saucepan",
        "category": "pots",
        "icon": "cooking"
      }
    ]
  },
  {
    "id": 47,
    "theme": "Healing Herbs & Daily Vegetables",
    "categoryA": {
      "name": "Medicinal Herbs \ud83c\udf3f",
      "key": "herb",
      "icon": "local_pharmacy"
    },
    "categoryB": {
      "name": "Everyday Veggies \ud83e\udd54",
      "key": "veggie",
      "icon": "eco"
    },
    "items": [
      {
        "id": "item_47_1",
        "label": "Neem Pure Leaf",
        "category": "herb",
        "icon": "local_pharmacy"
      },
      {
        "id": "item_47_2",
        "label": "Round Russet Potato",
        "category": "veggie",
        "icon": "eco"
      },
      {
        "id": "item_47_3",
        "label": "Aloe Vera Soothing Gel",
        "category": "herb",
        "icon": "local_pharmacy"
      },
      {
        "id": "item_47_4",
        "label": "Crunchy Green Cabbage",
        "category": "veggie",
        "icon": "eco"
      }
    ]
  },
  {
    "id": 48,
    "theme": "Handcrafts & Metal Crafts",
    "categoryA": {
      "name": "Clay Pottery \ud83c\udffa",
      "key": "clay",
      "icon": "draw"
    },
    "categoryB": {
      "name": "Brass Metalwork \ud83d\udd14",
      "key": "brass",
      "icon": "hardware"
    },
    "items": [
      {
        "id": "item_48_1",
        "label": "Terracotta Water Matka",
        "category": "clay",
        "icon": "draw"
      },
      {
        "id": "item_48_2",
        "label": "Polished Brass Temple Bell",
        "category": "brass",
        "icon": "hardware"
      },
      {
        "id": "item_48_3",
        "label": "Clay Decorative Diya",
        "category": "clay",
        "icon": "draw"
      },
      {
        "id": "item_48_4",
        "label": "Brass Aarti Lamp",
        "category": "brass",
        "icon": "hardware"
      }
    ]
  },
  {
    "id": 49,
    "theme": "Morning Senses & Evening Relaxation",
    "categoryA": {
      "name": "Morning Awakenings \ud83c\udf05",
      "key": "morning",
      "icon": "wb_sunny"
    },
    "categoryB": {
      "name": "Evening Calm \ud83c\udf06",
      "key": "evening",
      "icon": "nights_stay"
    },
    "items": [
      {
        "id": "item_49_1",
        "label": "Aroma of Fresh Coffee",
        "category": "morning",
        "icon": "wb_sunny"
      },
      {
        "id": "item_49_2",
        "label": "Soft Candle Glow",
        "category": "evening",
        "icon": "nights_stay"
      },
      {
        "id": "item_49_3",
        "label": "Gentle Morning Stretch",
        "category": "morning",
        "icon": "wb_sunny"
      },
      {
        "id": "item_49_4",
        "label": "Listening to Classical Ragas",
        "category": "evening",
        "icon": "nights_stay"
      }
    ]
  },
  {
    "id": 50,
    "theme": "Living Rooms & Courtyards",
    "categoryA": {
      "name": "Cozy Living Room \ud83d\udecb\ufe0f",
      "key": "living",
      "icon": "chair"
    },
    "categoryB": {
      "name": "Open Green Courtyard \ud83e\udeb4",
      "key": "courtyard",
      "icon": "yard"
    },
    "items": [
      {
        "id": "item_50_1",
        "label": "Cushioned Recliner Chair",
        "category": "living",
        "icon": "chair"
      },
      {
        "id": "item_50_2",
        "label": "Potted Tulsi Plant",
        "category": "courtyard",
        "icon": "yard"
      },
      {
        "id": "item_50_3",
        "label": "Wall Hanging Clock",
        "category": "living",
        "icon": "chair"
      },
      {
        "id": "item_50_4",
        "label": "Stone Garden Bird Bath",
        "category": "courtyard",
        "icon": "yard"
      }
    ]
  }
];
export const LEVEL_8_CATEGORIES = LEVEL_8_CATEGORIES_POOL[0];

// Level 9: 50 Hangman Words Pool
export const LEVEL_9_HANGMAN_POOL = [
  {
    "id": 1,
    "word": "HARMONY",
    "clue": "A peaceful state where everything blends together pleasantly.",
    "category": "Virtues",
    "maxAttempts": 7
  },
  {
    "id": 2,
    "word": "KINDNESS",
    "clue": "The quality of being friendly, generous, and considerate.",
    "category": "Virtues",
    "maxAttempts": 7
  },
  {
    "id": 3,
    "word": "SERENITY",
    "clue": "The state of being calm, peaceful, and untroubled.",
    "category": "Peace",
    "maxAttempts": 7
  },
  {
    "id": 4,
    "word": "BLOSSOM",
    "clue": "A flower or cluster of flowers opening in the garden.",
    "category": "Nature",
    "maxAttempts": 7
  },
  {
    "id": 5,
    "word": "SUNLIGHT",
    "clue": "The warm, bright golden light that comes from the sun.",
    "category": "Nature",
    "maxAttempts": 7
  },
  {
    "id": 6,
    "word": "GRATITUDE",
    "clue": "The feeling of being thankful and appreciative of blessings.",
    "category": "Virtues",
    "maxAttempts": 7
  },
  {
    "id": 7,
    "word": "MEMORIES",
    "clue": "Precious recollections of happy moments shared with loved ones.",
    "category": "Life",
    "maxAttempts": 7
  },
  {
    "id": 8,
    "word": "FRIEND",
    "clue": "A loyal companion who brings joy, comfort, and support.",
    "category": "Relationships",
    "maxAttempts": 7
  },
  {
    "id": 9,
    "word": "COMFORT",
    "clue": "A state of physical ease and freedom from pain or worry.",
    "category": "Wellness",
    "maxAttempts": 7
  },
  {
    "id": 10,
    "word": "PEACEFUL",
    "clue": "Free from disturbance; tranquil, serene, and calm.",
    "category": "Peace",
    "maxAttempts": 7
  },
  {
    "id": 11,
    "word": "MORNING",
    "clue": "The gentle, fresh beginning of the day after sunrise.",
    "category": "Time",
    "maxAttempts": 7
  },
  {
    "id": 12,
    "word": "HERITAGE",
    "clue": "Valued traditions, culture, and wisdom passed down through generations.",
    "category": "Culture",
    "maxAttempts": 7
  },
  {
    "id": 13,
    "word": "BHARAT",
    "clue": "The ancient, timeless, and culturally rich land of India.",
    "category": "Heritage",
    "maxAttempts": 7
  },
  {
    "id": 14,
    "word": "LANTERN",
    "clue": "A protective case for a light, casting a cozy warm glow.",
    "category": "Comfort",
    "maxAttempts": 7
  },
  {
    "id": 15,
    "word": "WHISPER",
    "clue": "To speak very softly using gentle, comforting breath.",
    "category": "Speech",
    "maxAttempts": 7
  },
  {
    "id": 16,
    "word": "DELIGHT",
    "clue": "Great pleasure and profound satisfaction in simple things.",
    "category": "Joy",
    "maxAttempts": 7
  },
  {
    "id": 17,
    "word": "RAINBOW",
    "clue": "A colorful curved arch of light appearing in the sky after rain.",
    "category": "Nature",
    "maxAttempts": 7
  },
  {
    "id": 18,
    "word": "SUNRISE",
    "clue": "The daily moment when the sun climbs above the horizon.",
    "category": "Time",
    "maxAttempts": 7
  },
  {
    "id": 19,
    "word": "PRAYER",
    "clue": "A solemn request or expression of thanks to the divine.",
    "category": "Spiritual",
    "maxAttempts": 7
  },
  {
    "id": 20,
    "word": "BLISS",
    "clue": "Supreme happiness and pure contented joy.",
    "category": "Joy",
    "maxAttempts": 7
  },
  {
    "id": 21,
    "word": "BLESSING",
    "clue": "A beneficial gift or favor that brings gratitude and happiness.",
    "category": "Spiritual",
    "maxAttempts": 7
  },
  {
    "id": 22,
    "word": "SANCTUARY",
    "clue": "A safe place that offers shelter, peace, and protection.",
    "category": "Home",
    "maxAttempts": 7
  },
  {
    "id": 23,
    "word": "COMPASSION",
    "clue": "Sympathetic pity and concern for the sufferings of others.",
    "category": "Virtues",
    "maxAttempts": 7
  },
  {
    "id": 24,
    "word": "HEALING",
    "clue": "The process of making or becoming sound, whole, and healthy.",
    "category": "Wellness",
    "maxAttempts": 7
  },
  {
    "id": 25,
    "word": "PATIENCE",
    "clue": "The capacity to accept delays or challenges calmly.",
    "category": "Virtues",
    "maxAttempts": 7
  },
  {
    "id": 26,
    "word": "GENEROSITY",
    "clue": "The quality of being kind and sharing with open hands.",
    "category": "Virtues",
    "maxAttempts": 7
  },
  {
    "id": 27,
    "word": "CHERISH",
    "clue": "To protect and care for someone or something lovingly.",
    "category": "Love",
    "maxAttempts": 7
  },
  {
    "id": 28,
    "word": "MELODY",
    "clue": "A pleasing sequence of musical notes that touches the heart.",
    "category": "Music",
    "maxAttempts": 7
  },
  {
    "id": 29,
    "word": "GARDEN",
    "clue": "A peaceful plot of ground where flowers and herbs grow.",
    "category": "Nature",
    "maxAttempts": 7
  },
  {
    "id": 30,
    "word": "FOREST",
    "clue": "A large area covered with tall trees and singing birds.",
    "category": "Nature",
    "maxAttempts": 7
  },
  {
    "id": 31,
    "word": "ORCHARD",
    "clue": "A piece of land planted with fruit-bearing trees.",
    "category": "Nature",
    "maxAttempts": 7
  },
  {
    "id": 32,
    "word": "RIVER",
    "clue": "A natural wide stream of water flowing towards the ocean.",
    "category": "Nature",
    "maxAttempts": 7
  },
  {
    "id": 33,
    "word": "MOUNTAIN",
    "clue": "A large natural elevation of the earth surface rising high.",
    "category": "Nature",
    "maxAttempts": 7
  },
  {
    "id": 34,
    "word": "FOUNTAIN",
    "clue": "An ornamental structure in a garden from which water flows.",
    "category": "Garden",
    "maxAttempts": 7
  },
  {
    "id": 35,
    "word": "BUTTERFLY",
    "clue": "A graceful flying insect with large colorful wings.",
    "category": "Creatures",
    "maxAttempts": 7
  },
  {
    "id": 36,
    "word": "PEACOCK",
    "clue": "A magnificent bird with iridescent green and blue tail feathers.",
    "category": "Creatures",
    "maxAttempts": 7
  },
  {
    "id": 37,
    "word": "DOLPHIN",
    "clue": "A friendly, intelligent marine mammal known for its playful spirit.",
    "category": "Creatures",
    "maxAttempts": 7
  },
  {
    "id": 38,
    "word": "ELEPHANT",
    "clue": "A gentle, wise, and majestic giant revered across India.",
    "category": "Creatures",
    "maxAttempts": 7
  },
  {
    "id": 39,
    "word": "SUGAR",
    "clue": "A sweet crystalline substance that sweetens daily tea.",
    "category": "Food",
    "maxAttempts": 7
  },
  {
    "id": 40,
    "word": "HONEY",
    "clue": "A sweet golden liquid made by bees from flower nectar.",
    "category": "Food",
    "maxAttempts": 7
  },
  {
    "id": 41,
    "word": "JASMINE",
    "clue": "An intensely fragrant white flower used in traditional garlands.",
    "category": "Flowers",
    "maxAttempts": 7
  },
  {
    "id": 42,
    "word": "SUNFLOWER",
    "clue": "A tall cheerful yellow bloom that always faces the sunlight.",
    "category": "Flowers",
    "maxAttempts": 7
  },
  {
    "id": 43,
    "word": "MARIGOLD",
    "clue": "A golden festive blossom celebrated in auspicious ceremonies.",
    "category": "Flowers",
    "maxAttempts": 7
  },
  {
    "id": 44,
    "word": "LAVENDER",
    "clue": "A calming purple flower celebrated for its soothing aroma.",
    "category": "Flowers",
    "maxAttempts": 7
  },
  {
    "id": 45,
    "word": "DIARY",
    "clue": "A personal book in which one keeps a daily record of thoughts.",
    "category": "Memories",
    "maxAttempts": 7
  },
  {
    "id": 46,
    "word": "CAMERA",
    "clue": "A device for capturing and preserving beautiful family moments.",
    "category": "Memories",
    "maxAttempts": 7
  },
  {
    "id": 47,
    "word": "VIOLIN",
    "clue": "A wooden stringed musical instrument played with a soft bow.",
    "category": "Music",
    "maxAttempts": 7
  },
  {
    "id": 48,
    "word": "GUITAR",
    "clue": "A six-stringed instrument that strums soothing melodies.",
    "category": "Music",
    "maxAttempts": 7
  },
  {
    "id": 49,
    "word": "CAROUSEL",
    "clue": "A cheerful merry-go-round bringing back childhood smiles.",
    "category": "Joy",
    "maxAttempts": 7
  },
  {
    "id": 50,
    "word": "FEATHER",
    "clue": "A light, soft, delicate structure covering the wings of birds.",
    "category": "Nature",
    "maxAttempts": 7
  }
];
export const LEVEL_9_HANGMAN = LEVEL_9_HANGMAN_POOL[0];

// Level 10: 50 Cognitive Master Challenges Pool
export const LEVEL_10_CHALLENGES_POOL = [
  {
    "id": 1,
    "type": "analogy",
    "question": "Morning is to Sunrise as Evening is to...",
    "options": [
      "Sunset",
      "Moonbeam",
      "Breakfast"
    ],
    "answer": "Sunset",
    "explanation": "Sunrise marks the morning, while sunset marks the evening."
  },
  {
    "id": 2,
    "type": "analogy",
    "question": "Bird is to Sky as Fish is to...",
    "options": [
      "Ocean",
      "Tree",
      "Nest"
    ],
    "answer": "Ocean",
    "explanation": "Birds fly in the sky, while fish swim in the ocean."
  },
  {
    "id": 3,
    "type": "analogy",
    "question": "Eye is to See as Ear is to...",
    "options": [
      "Hear",
      "Taste",
      "Touch"
    ],
    "answer": "Hear",
    "explanation": "The eye is the organ of sight, while the ear is the organ of hearing."
  },
  {
    "id": 4,
    "type": "analogy",
    "question": "Leaf is to Tree as Petal is to...",
    "options": [
      "Flower",
      "Root",
      "Seed"
    ],
    "answer": "Flower",
    "explanation": "Leaves belong to trees, just as petals belong to flowers."
  },
  {
    "id": 5,
    "type": "analogy",
    "question": "Book is to Reading as Music is to...",
    "options": [
      "Listening",
      "Writing",
      "Painting"
    ],
    "answer": "Listening",
    "explanation": "We read books and listen to music."
  },
  {
    "id": 6,
    "type": "analogy",
    "question": "Winter is to Cold as Summer is to...",
    "options": [
      "Warm",
      "Snow",
      "Rain"
    ],
    "answer": "Warm",
    "explanation": "Winter brings cold weather, while summer brings warmth."
  },
  {
    "id": 7,
    "type": "analogy",
    "question": "Shoe is to Foot as Glove is to...",
    "options": [
      "Hand",
      "Head",
      "Neck"
    ],
    "answer": "Hand",
    "explanation": "Shoes protect feet, and gloves protect hands."
  },
  {
    "id": 8,
    "type": "analogy",
    "question": "Doctor is to Hospital as Teacher is to...",
    "options": [
      "School",
      "Market",
      "Garden"
    ],
    "answer": "School",
    "explanation": "Doctors work in hospitals; teachers guide in schools."
  },
  {
    "id": 9,
    "type": "analogy",
    "question": "Clock is to Time as Thermometer is to...",
    "options": [
      "Temperature",
      "Distance",
      "Weight"
    ],
    "answer": "Temperature",
    "explanation": "Clocks measure time, while thermometers measure temperature."
  },
  {
    "id": 10,
    "type": "analogy",
    "question": "Pen is to Write as Brush is to...",
    "options": [
      "Paint",
      "Cut",
      "Fold"
    ],
    "answer": "Paint",
    "explanation": "Pens are used to write, while brushes are used to paint."
  },
  {
    "id": 11,
    "type": "analogy",
    "question": "Sun is to Day as Moon is to...",
    "options": [
      "Night",
      "Dawn",
      "Noon"
    ],
    "answer": "Night",
    "explanation": "The sun illuminates the day; the moon graces the night."
  },
  {
    "id": 12,
    "type": "analogy",
    "question": "Bee is to Honey as Cow is to...",
    "options": [
      "Milk",
      "Wool",
      "Egg"
    ],
    "answer": "Milk",
    "explanation": "Bees produce honey, while cows provide milk."
  },
  {
    "id": 13,
    "type": "analogy",
    "question": "Seed is to Plant as Egg is to...",
    "options": [
      "Bird",
      "Nest",
      "Feather"
    ],
    "answer": "Bird",
    "explanation": "Plants grow from seeds, and birds hatch from eggs."
  },
  {
    "id": 14,
    "type": "analogy",
    "question": "Wheel is to Bicycle as Oar is to...",
    "options": [
      "Boat",
      "Train",
      "Plane"
    ],
    "answer": "Boat",
    "explanation": "Wheels propel bicycles; oars propel boats."
  },
  {
    "id": 15,
    "type": "analogy",
    "question": "Sugar is to Sweet as Lemon is to...",
    "options": [
      "Sour",
      "Salty",
      "Bitter"
    ],
    "answer": "Sour",
    "explanation": "Sugar has a sweet taste, whereas lemon is sour."
  },
  {
    "id": 16,
    "type": "analogy",
    "question": "Hunger is to Food as Thirst is to...",
    "options": [
      "Water",
      "Sleep",
      "Rest"
    ],
    "answer": "Water",
    "explanation": "Food satisfies hunger, while water satisfies thirst."
  },
  {
    "id": 17,
    "type": "analogy",
    "question": "Candle is to Light as Stove is to...",
    "options": [
      "Heat",
      "Cold",
      "Sound"
    ],
    "answer": "Heat",
    "explanation": "Candles produce light, while stoves produce heat for cooking."
  },
  {
    "id": 18,
    "type": "sequence",
    "question": "Raindrop, Stream, River, ...",
    "options": [
      "Ocean",
      "Stone",
      "Leaf"
    ],
    "answer": "Ocean",
    "explanation": "Water flows in increasing progression towards the vast ocean."
  },
  {
    "id": 19,
    "type": "sequence",
    "question": "Seed, Sprout, Plant, ...",
    "options": [
      "Flower",
      "Rock",
      "Sand"
    ],
    "answer": "Flower",
    "explanation": "A plant blossoms into a beautiful flower as it grows."
  },
  {
    "id": 20,
    "type": "sequence",
    "question": "Monday, Tuesday, Wednesday, ...",
    "options": [
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "answer": "Thursday",
    "explanation": "Thursday directly follows Wednesday in the week."
  },
  {
    "id": 21,
    "type": "sequence",
    "question": "Second, Minute, Hour, ...",
    "options": [
      "Day",
      "Month",
      "Year"
    ],
    "answer": "Day",
    "explanation": "Hours progress naturally into full days."
  },
  {
    "id": 22,
    "type": "sequence",
    "question": "Spring, Summer, Autumn, ...",
    "options": [
      "Winter",
      "Rain",
      "Dawn"
    ],
    "answer": "Winter",
    "explanation": "Winter completes the natural four-season cycle."
  },
  {
    "id": 23,
    "type": "sequence",
    "question": "Morning, Afternoon, Evening, ...",
    "options": [
      "Night",
      "Dawn",
      "Noon"
    ],
    "answer": "Night",
    "explanation": "Night is the peaceful conclusion of the daily cycle."
  },
  {
    "id": 24,
    "type": "sequence",
    "question": "Infancy, Childhood, Youth, ...",
    "options": [
      "Adulthood",
      "School",
      "Play"
    ],
    "answer": "Adulthood",
    "explanation": "Adulthood is the next stage in life progression."
  },
  {
    "id": 25,
    "type": "sequence",
    "question": "Letter, Word, Sentence, ...",
    "options": [
      "Paragraph",
      "Pen",
      "Paper"
    ],
    "answer": "Paragraph",
    "explanation": "Sentences combine to form meaningful paragraphs."
  },
  {
    "id": 26,
    "type": "sequence",
    "question": "2, 4, 6, 8, ...",
    "options": [
      "10",
      "9",
      "12"
    ],
    "answer": "10",
    "explanation": "Counting upwards by even intervals of two gives 10."
  },
  {
    "id": 27,
    "type": "sequence",
    "question": "10, 20, 30, 40, ...",
    "options": [
      "50",
      "45",
      "60"
    ],
    "answer": "50",
    "explanation": "Counting in tens brings us to 50."
  },
  {
    "id": 28,
    "type": "sequence",
    "question": "Bud, Blossom, Fruit, ...",
    "options": [
      "Harvest",
      "Seed",
      "Root"
    ],
    "answer": "Harvest",
    "explanation": "Ripened fruit leads naturally to joyful harvest."
  },
  {
    "id": 29,
    "type": "sequence",
    "question": "January, February, March, ...",
    "options": [
      "April",
      "May",
      "June"
    ],
    "answer": "April",
    "explanation": "April is the fourth month of the calendar year."
  },
  {
    "id": 30,
    "type": "sequence",
    "question": "Dawn, Sunrise, Midday, ...",
    "options": [
      "Sunset",
      "Midnight",
      "Breakfast"
    ],
    "answer": "Sunset",
    "explanation": "Sunset follows midday as the afternoon closes."
  },
  {
    "id": 31,
    "type": "sequence",
    "question": "Single, Pair, Trio, ...",
    "options": [
      "Quartet",
      "Solo",
      "Duet"
    ],
    "answer": "Quartet",
    "explanation": "A group of four is called a quartet."
  },
  {
    "id": 32,
    "type": "sequence",
    "question": "Warm, Hot, Boiling, ...",
    "options": [
      "Steaming",
      "Freezing",
      "Chilly"
    ],
    "answer": "Steaming",
    "explanation": "Boiling water naturally releases gentle steam."
  },
  {
    "id": 33,
    "type": "sequence",
    "question": "Step, Stroll, Walk, ...",
    "options": [
      "Hike",
      "Sleep",
      "Sit"
    ],
    "answer": "Hike",
    "explanation": "Progressively greater outdoor walking distances."
  },
  {
    "id": 34,
    "type": "sequence",
    "question": "Note, Melody, Harmony, ...",
    "options": [
      "Symphony",
      "Whisper",
      "Silence"
    ],
    "answer": "Symphony",
    "explanation": "Musical parts join into a grand symphony."
  },
  {
    "id": 35,
    "type": "logic",
    "question": "If today is Tuesday, what day will it be in 2 days?",
    "options": [
      "Thursday",
      "Wednesday",
      "Friday"
    ],
    "answer": "Thursday",
    "explanation": "Counting 2 days forward from Tuesday gives Thursday."
  },
  {
    "id": 36,
    "type": "logic",
    "question": "If yesterday was Saturday, what day is today?",
    "options": [
      "Sunday",
      "Friday",
      "Monday"
    ],
    "answer": "Sunday",
    "explanation": "The day after Saturday is always Sunday."
  },
  {
    "id": 37,
    "type": "logic",
    "question": "Which item is naturally sweetest?",
    "options": [
      "Ripe Mango",
      "Green Cucumber",
      "Bitter Neem"
    ],
    "answer": "Ripe Mango",
    "explanation": "Mango is celebrated as the sweetest fruit."
  },
  {
    "id": 38,
    "type": "logic",
    "question": "Which item does NOT belong with the others?",
    "options": [
      "Elephant",
      "Tiger",
      "Rose"
    ],
    "answer": "Rose",
    "explanation": "Rose is a plant, while the others are animals."
  },
  {
    "id": 39,
    "type": "logic",
    "question": "If you have 4 apples and give 2 to your family, how many do you have?",
    "options": [
      "2",
      "3",
      "4"
    ],
    "answer": "2",
    "explanation": "Subtracting 2 from 4 leaves 2 apples."
  },
  {
    "id": 40,
    "type": "logic",
    "question": "Which object is used to tell time?",
    "options": [
      "Clock",
      "Mirror",
      "Scale"
    ],
    "answer": "Clock",
    "explanation": "A clock displays the current hour and minute."
  },
  {
    "id": 41,
    "type": "logic",
    "question": "Which animal is known for gentle purring and soft naps?",
    "options": [
      "Cat",
      "Horse",
      "Elephant"
    ],
    "answer": "Cat",
    "explanation": "Cats purr gently when feeling safe and happy."
  },
  {
    "id": 42,
    "type": "logic",
    "question": "If it is raining outside, which item will keep you dry?",
    "options": [
      "Umbrella",
      "Fan",
      "Lantern"
    ],
    "answer": "Umbrella",
    "explanation": "An umbrella shields from falling rain."
  },
  {
    "id": 43,
    "type": "logic",
    "question": "Which of these is a warm soothing beverage?",
    "options": [
      "Herbal Tea",
      "Cold Water",
      "Ice Cubes"
    ],
    "answer": "Herbal Tea",
    "explanation": "Herbal tea is served warm and soothing."
  },
  {
    "id": 44,
    "type": "logic",
    "question": "Which direction does the sun rise from every morning?",
    "options": [
      "East",
      "West",
      "North"
    ],
    "answer": "East",
    "explanation": "The sun consistently rises in the East."
  },
  {
    "id": 45,
    "type": "logic",
    "question": "How many days are in a regular week?",
    "options": [
      "7",
      "5",
      "10"
    ],
    "answer": "7",
    "explanation": "There are exactly 7 days in a complete week."
  },
  {
    "id": 46,
    "type": "logic",
    "question": "Which sense organ is used to enjoy the fragrance of a flower?",
    "options": [
      "Nose",
      "Eyes",
      "Ears"
    ],
    "answer": "Nose",
    "explanation": "The nose detects pleasant aromas and fragrances."
  },
  {
    "id": 47,
    "type": "logic",
    "question": "Which color is traditionally on the top band of the Indian National Flag?",
    "options": [
      "Saffron",
      "Green",
      "White"
    ],
    "answer": "Saffron",
    "explanation": "Saffron stands for courage and sacrifice at the top."
  },
  {
    "id": 48,
    "type": "logic",
    "question": "If you wake up at sunrise, which meal do you eat first?",
    "options": [
      "Breakfast",
      "Dinner",
      "Lunch"
    ],
    "answer": "Breakfast",
    "explanation": "Breakfast is the first meal of the day."
  },
  {
    "id": 49,
    "type": "logic",
    "question": "Which object reflects your clear reflection?",
    "options": [
      "Mirror",
      "Book",
      "Window"
    ],
    "answer": "Mirror",
    "explanation": "A mirror clearly reflects light and images."
  },
  {
    "id": 50,
    "type": "logic",
    "question": "Which season is known for falling golden leaves?",
    "options": [
      "Autumn",
      "Summer",
      "Spring"
    ],
    "answer": "Autumn",
    "explanation": "Autumn is the season when trees shed colorful leaves."
  }
];
export const LEVEL_10_CHALLENGES = LEVEL_10_CHALLENGES_POOL.slice(0, 3);
