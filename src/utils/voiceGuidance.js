// Sahara Multilingual Spoken Guidance Dictionary
// Authentic natural human-cadence guidance for portal layouts and all 10 cognitive game levels.
// Supported languages: English, हिंदी (Hindi), অসমীয়া (Assamese), বাংলা (Bengali), মৈতৈলোন্ (Manipuri)

export const VOICE_GUIDANCE = {
  English: {
    langCode: 'en-IN',
    portalName: 'Sahara Companion',
    assistantTitle: 'Saha Voice Guide',
    femaleVoiceLabel: 'Female Voice (Natural Cadence)',
    explainScreenBtn: 'Explain this Screen',
    howToPlayBtn: 'How to Play This Game',
    stopBtn: 'Stop Guidance',
    listeningPrompt: 'Tap to hear gentle guidance in your chosen language.',
    
    layouts: {
      home: "Welcome to Sahara. You can enter your mobile number to receive a secure code, or sign in directly with Google. You can also select your preferred language anytime at the top.",
      'elder-dashboard': "This is your daily Sanctuary. Here, you can check your morning medicines and tap 'Mark as Taken'. You can also play comforting memory games, or tap the green emergency button to call your loved ones.",
      'caregiver-dashboard': "Welcome to the Caregiver Monitoring Portal. You can review real-time wellness status, 7-day cognitive game analytics, manage medication schedules, and access emergency contacts.",
      'caregiver-login': "This is the Caregiver Sign-in portal. Please enter your registered caregiver email address and password to view patient monitoring and reports.",
      contacts: "Here are your family contacts and doctors. You can tap Call to connect instantly, or tap WhatsApp to send an automatic check-in message.",
      'memory-game-hub': "Welcome to the Mind & Memory Games Suite. Choose from ten progressive levels, starting from gentle visual pairs up to engaging cognitive challenges. Take all the time you need.",
    },

    games: {
      1: "Level 1: Memory Match. Tap any card to reveal the hidden picture. Try to find its matching twin. There is no rush; enjoy the gentle pictures and match all three pairs.",
      2: "Level 2: Word Search. Look at the letters in the grid. Touch and drag across the letters horizontally, vertically, or diagonally to trace the three comforting words listed below.",
      3: "Level 3: Quick Crossword. Read each simple everyday clue, then tap to select the comforting answer. Take a peaceful breath, every effort is a victory.",
      4: "Level 4: Word Unscramble. Tap the scrambled letter tiles in the correct order to spell out the comforting word. If you make a mistake, tap again to reset.",
      5: "Level 5: Word Wheel. Look at the circular letters. Build three valid words by combining the outer letters with the important letter in the center.",
      6: "Level 6: Fill-in-the-Blank. Read the classic uplifting proverb or saying. Tap on the word that best completes the phrase naturally.",
      7: "Level 7: Rhyming Pairs. Listen to the prompt word and choose the partner word that rhymes and sounds joyful with it.",
      8: "Level 8: Category Sorting. Look at the everyday items displayed and gently sort them into their natural category boxes.",
      9: "Level 9: Vocabulary Guess. Guess the comforting hidden word one letter at a time. You have generous chances, take your time.",
      10: "Level 10: Cognitive Master. A soothing multi-part logic and memory challenge. Solve each gentle step at your own peaceful pace.",
    }
  },

  'हिंदी': {
    langCode: 'hi-IN',
    portalName: 'सहारा साथी',
    assistantTitle: 'साहा वॉइस गाइड',
    femaleVoiceLabel: 'महिला स्वर (सहज विराम व उच्चारण)',
    explainScreenBtn: 'यह स्क्रीन समझाइए',
    howToPlayBtn: 'खेलने का नियम सुनें',
    stopBtn: 'आवाज़ रोकें',
    listeningPrompt: 'अपनी भाषा में स्नेहपूर्ण मार्गदर्शन सुनने के लिए टैप करें।',
    
    layouts: {
      home: "सहारा में आपका हार्दिक स्वागत है। अपना मोबाइल नंबर डालकर सुरक्षित ओटीपी प्राप्त करें, या Google से सीधे साइन इन करें। आप ऊपर से अपनी पसंदीदा भाषा भी चुन सकते हैं।",
      'elder-dashboard': "यह आपका दैनिक सदन है। यहाँ आप अपनी सुबह की दवा देखकर 'दवा ले ली है' पर टैप कर सकते हैं। आप स्मृति खेल खेल सकते हैं, या परिजनों को तुरंत कॉल कर सकते हैं।",
      'caregiver-dashboard': "केयरगिवर निगरानी पोर्टल में आपका स्वागत है। यहाँ आप मरीज़ की दैनिक स्थिति, खेल स्कोर विश्लेषण, दवा की समय-सारिणी और संपर्क देख सकते हैं।",
      'caregiver-login': "यह केयरगिवर लॉगिन पृष्ठ है। कृपया अपना पंजीकृत ईमेल और पासवर्ड दर्ज करें।",
      contacts: "यह आपके परिजनों और डॉक्टर की संपर्क सूची है। सीधे बात करने के लिए 'कॉल' पर टैप करें या व्हाट्सएप संदेश भेजें।",
      'memory-game-hub': "संज्ञानात्मक खेल में आपका स्वागत है। सरल से लेकर मनोरंजक स्तरों तक, बिना किसी जल्दबाज़ी के खेलें।",
    },

    games: {
      1: "स्तर 1: स्मृति खेल। किसी भी कार्ड पर टैप करके तस्वीर देखें, और उसकी मिलती-जुलती जोड़ी खोजें। आराम से तीनों जोड़े मिलाएँ।",
      2: "स्तर 2: शब्द खोज। ग्रिड में अक्षरों को देखें। उँगली से अक्षरों को ऊपर-नीचे या तिरछा खींचकर नीचे लिखे तीनों शब्द ढूँढें।",
      3: "स्तर 3: सरल क्रॉसवर्ड। दिए गए सरल संकेत पढ़ें और सही विकल्प चुनकर शब्द पूरा करें।",
      4: "स्तर 4: शब्द संयोजन। अक्षरों को सही क्रम में टैप करके सुंदर और अर्थपूर्ण शब्द बनाएँ।",
      5: "स्तर 5: शब्द चक्र। गोल घेरे के अक्षरों और बीच वाले मुख्य अक्षर को मिलाकर तीन शब्द बनाएँ।",
      6: "स्तर 6: रिक्त स्थान भरें। पुरानी और प्रसिद्ध कहावतों को पूरा करने के लिए सही शब्द चुनें।",
      7: "स्तर 7: तुकबंदी मिलाएँ। मिलती-जुलती आवाज़ और सुर वाले शब्दों की जोड़ी बनाएँ।",
      8: "स्तर 8: श्रेणी वर्गीकरण। दिखाई गई रोज़मर्रा की चीज़ों को उनके सही समूह में रखें।",
      9: "स्तर 9: शब्द पहेली। एक-एक अक्षर चुनकर छुपे हुए शब्द का अनुमान लगाएँ।",
      10: "स्तर 10: संज्ञानात्मक मास्टर। तर्क और स्मृति की यह विशेष चुनौती अपने सहज अंदाज़ में पूरी करें।",
    }
  },

  'অসমীয়া': {
    langCode: 'as-IN',
    portalName: 'সাহাৰা সংগী',
    assistantTitle: 'সাহা ভইচ গাইড',
    femaleVoiceLabel: 'মহিলা কণ্ঠ (প্ৰাকৃতিক বিৰতি)',
    explainScreenBtn: 'এই পৃষ্ঠাৰ বিষয়ে কওক',
    howToPlayBtn: 'খেলৰ নিয়ম শুনক',
    stopBtn: 'ভইচ বন্ধ কৰক',
    listeningPrompt: 'আপোনাৰ নিজৰ ভাষাত মৰমৰ নিৰ্দেশনা শুনিবলৈ স্পৰ্শ কৰক।',
    
    layouts: {
      home: "সাহাৰালৈ আপোনাক স্বাগতম। আপোনাৰ মোবাইল নম্বৰ দি সুৰক্ষিত OTP লওক, অথবা Google ৰে লগইন কৰক। ওপৰত ভাষা সলনি কৰিব পাৰিব।",
      'elder-dashboard': "এইখন আপোনাৰ দৈনন্দিন গৃহ। ইয়াত আপোনাৰ পুৱাৰ ঔষধ পৰীক্ষা কৰি 'ঔষধ খোৱা হ’ল' টিপক। স্মৃতি খেল খেলক আৰু আপোনজনক পোনপটীয়াকৈ ফোন কৰক।",
      'caregiver-dashboard': "কেয়াৰগিভাৰ প’ৰ্টেললৈ স্বাগতম। ইয়াত আপুনি স্বাস্থ্যৰ খবৰ, খেলৰ স্কোৰ, আৰু ঔষধৰ সময়সূচী চাব পাৰিব।",
      'caregiver-login': "এইটো কেয়াৰগিভাৰ লগইন পৃষ্ঠা। আপোনাৰ ইমেইল আৰু পাছৱৰ্ড দি প্ৰৱেশ কৰক।",
      contacts: "ইয়াত আপোনাৰ পৰিয়াল আৰু চিকিৎসকৰ নম্বৰ আছে। কথা পাতিবলৈ কল বা হোৱাটছএপ বাৰ্তা প্ৰেৰণ কৰক।",
      'memory-game-hub': "মনৰ খেললৈ স্বাগতম। শান্তভাৱে আৰু আৰামেৰে খেল উপভোগ কৰক।",
    },

    games: {
      1: "লেভেল ১: স্মৃতি খেল। কাৰ্ড ওলোটাই একেধৰণৰ ছবিৰ যোৰ মিলাওক। কোনো খৰখেদা নাই, আৰামেৰে খেলক।",
      2: "লেভেল ২: শব্দ সন্ধান। বৰ্ণমালাৰ বাকচত আঙুলিৰে টানি তলত থকা তিনিটা শব্দ বিচাৰি উলিয়াওক।",
      3: "লেভেল ৩: সহজ ক্ৰছৱৰ্ড। সহজ সংকেত পঢ়ি সঠিক উত্তৰ বাছি লওক।",
      4: "লেভেল ৪: শব্দ সজোৱা। ওলট-পালট হৈ থকা আখৰবোৰ সঠিক ক্ৰমত টিপি শব্দটো সাজক।",
      5: "লেভেল ৫: শব্দ চক্ৰ। ঘূৰণীয়া আখৰ আৰু মাজৰ মূল আখৰটো ব্যৱহাৰ কৰি তিনিটা শব্দ গঠন কৰক।",
      6: "লেভেল ৬: খালী ঠাই পূৰণ। আমাৰ চিনাকি প্ৰবচন আৰু নীতিবাক্য পূৰণ কৰিবলৈ সঠিক শব্দ বাছক।",
      7: "লেভেল ৭: ছন্দ মিলাওক। একে ছন্দ আৰু সুৰৰ শব্দবোৰ একেলগে মিলাওক।",
      8: "লেভেল ৮: শ্ৰেণী বিভাজন। দৈনন্দিন বস্তুবোৰ নিজৰ নিজৰ শ্ৰেণীত সঠিকভাৱে সজাওক।",
      9: "লেভেল ৯: শব্দ অনুমান। এটা এটাকৈ আখৰ বাছি লৈ গোপন শব্দটো অনুমান কৰক।",
      10: "লেভেল ১০: কগনিটিভ মাষ্টাৰ। যুক্তি আৰু স্মৃতিৰ এই সুন্দৰ পৰীক্ষা আৰামেৰে সম্পন্ন কৰক।",
    }
  },

  'বাংলা': {
    langCode: 'bn-IN',
    portalName: 'সাহারা সঙ্গী',
    assistantTitle: 'সাহা ভয়েস গাইড',
    femaleVoiceLabel: 'মহিলা কণ্ঠ (স্বাভাবিক উচ্চারণ ও বিরতি)',
    explainScreenBtn: 'এই পর্দাটি বুঝিয়ে দিন',
    howToPlayBtn: 'খেলার নিয়ম শুনুন',
    stopBtn: 'ভয়েস বন্ধ করুন',
    listeningPrompt: 'আপনার ভাষায় স্নেহময় নির্দেশনা শুনতে স্পর্শ করুন।',
    
    layouts: {
      home: "সাহারাতে আপনাকে স্বাগতম। আপনার মোবাইল নম্বর লিখে ওটিপি নিন, বা সরাসরি Google দিয়ে প্রবেশ করুন। উপরে ভাষা পরিবর্তন করতে পারেন।",
      'elder-dashboard': "এটি আপনার নিত্যদিনের আশ্রম। সকালের ওষুধ খেয়ে 'ওষুধ খেয়েছি' বোতামে চাপুন। স্মৃতি খেলা খেলুন ও প্রিয়জনকে ফোন করুন।",
      'caregiver-dashboard': "কেয়ারগিভার মনিটরিং পোর্টালে স্বাগতম। এখানে রোগীর অবস্থা, খেলার স্কোর ও ওষুধের রুটিন দেখতে পাবেন।",
      'caregiver-login': "কেয়ারগিভার লগইন পেজে স্বাগতম। আপনার ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।",
      contacts: "এখানে আপনার পরিবার ও ডাক্তারের তালিকা রয়েছে। সরাসরি কল করতে পারেন বা হোয়াটসঅ্যাপ করতে পারেন।",
      'memory-game-hub': "স্মৃতি খেলার জগতে স্বাগতম। শান্ত মনে আনন্দ নিয়ে খেলুন।",
    },

    games: {
      1: "লেভেল ১: স্মৃতি খেলা। কার্ড উল্টে একই রকম ছবিগুলো মিলিয়ে দিন। কোনো তাড়াহুড়ো নেই।",
      2: "লেভেল ২: শব্দ সন্ধান। গ্রিডে আঙুল টেনে নিচের তিনটি সুন্দর শব্দ খুঁজে বের করুন।",
      3: "লেভেল ৩: সহজ ক্রসওয়ার্ড। সহজ ক্লু পড়ে সঠিক শব্দটি বেছে নিন।",
      4: "লেভেল ৪: শব্দ সাজানো। এলোমেলো অক্ষরগুলো সঠিক ক্রমানুসারে সাজিয়ে শব্দ তৈরি করুন।",
      5: "লেভেল ৫: শব্দ চক্র। গোল অক্ষরের সাথে মাঝের প্রধান অক্ষরটি নিয়ে তিনটি শব্দ বানান।",
      6: "লেভেল ৬: শূন্যস্থান পূরণ। চেনা প্রবাদ বা বাণীটি সম্পূর্ণ করতে সঠিক শব্দটি নির্বাচন করুন।",
      7: "লেভেল ৭: ছন্দের মিল। একই রকম উচ্চারণের মিষ্টি শব্দের জোড়া লাগান।",
      8: "লেভেল ৮: শ্রেণি বিন্যাস। জিনিসগুলোকে তাদের সঠিক ভাগে সাজিয়ে রাখুন।",
      9: "লেভেল ৯: শব্দ অনুমান। একটি করে বর্ণ বেছে গোপন শব্দটি আবিষ্কার করুন।",
      10: "লেভেল ১০: কগনিটিভ মাস্টার। স্মৃতি ও বুদ্ধির এই সুন্দর খেলাটি নিশ্চিন্তে সম্পন্ন করুন।",
    }
  },

  'মৈতৈলোন্': {
    langCode: 'mni-IN',
    portalName: 'সাহারা মরূপ',
    assistantTitle: 'সাহা ভোইস গাইড',
    femaleVoiceLabel: 'নুপীগী খোঞ্জেল (মহৌশাগী লেপ্নবা)',
    explainScreenBtn: 'লমাই অসি শন্দোক্না তাকপীয়ু',
    howToPlayBtn: 'শান্নবগী নিয়ম তাবীয়ু',
    stopBtn: 'খোঞ্জেল লেপপীয়ু',
    listeningPrompt: 'ইশাগী লোনদা নীংথিনা তাকপীনবা নম্বীয়ু।',
    
    layouts: {
      home: "সাহারা দা তরাম্না ওকচরি। মোবাইল নম্বর থাদোক্তুনা OTP লৌবীয়ু নত্রগা Google না চংবীয়ু।",
      'elder-dashboard': "মসি অদোমগী য়ুমফমনি। অয়ুক্কী হিদাক চাবা লোইরে নম্বীয়ু, শান্নবীয়ু অমসুং ইমুংদা কোল তৌবীয়ু।",
      'caregiver-dashboard': "য়েংশিনবগী পোর্তেলদা তরাম্না ওকচরি। হিদাক মতম অমসুং শান্নবা মার্ক য়েংবীয়ু।",
      'caregiver-login': "য়েংশিনবগী লগইন লমাইনি। ইমেইল অমসুং পাসৱর্দ থাজিল্লু।",
      contacts: "ইমুং অমসুং ডাক্তরগী ফোন নম্বারশিংনি। কোল নত্রগা WhatsApp তৌবীয়ু।",
      'memory-game-hub': "ৱাখলগী শান্নবদা তরাম্না ওকচরি। তপ্না শান্নবীয়ু।",
    },

    games: {
      1: "লেভেল ১: নীংশিং শান্নবা। কার্দ হাংদোক্তুনা মান্নবা ফোতো অনী মীলোন থীবীয়ু।",
      2: "লেভেল ২: ৱাহৈ থীবা। অরিবা ময়েংশিং খন্দুনা মখাগী ৱাহৈ ৩ থীবীয়ু।",
      3: "লেভেল ৩: লাইবা ক্রোসৱর্দ। পাউতাক য়েংদুনা অচুম্বা ৱাহৈ খনগৎলু।",
      4: "লেভেল ৪: ৱাহৈ শেম্বা। ময়েংশিং তপ্না নম্বীদুনা অচুম্বা ৱাহৈ শেম্মু।",
      5: "লেভেল ৫: ৱাহৈ চক্ৰ। ময়েংশিং শিজিন্নদুনা অনৌবা ৱাহৈ ৩ শেম্মু।",
      6: "লেভেল ৬: হাংবা মফম মেনশিনবা। মমিং চৎলবা ৱাফম মপুং ফাহনবীয়ু।",
      7: "লেভেল ৭: খোনথোক মান্নবা। মান্নবা খোঞ্জেল থোকপা ৱাহৈ পুন্না শান্নবীয়ু।",
      8: "লেভেল ৮: মখল খাইদোকপা। পোৎলমশিং অচুম্বা কাংলুপ্তা থম্মী।",
      9: "লেভেল ৯: ৱাহৈ অনুমান তৌবা। ময়েং অমমম খনদুনা লোৎলিবা ৱাহৈ খঙদোকউ।",
      10: "লেভেল ১০: কোগনিটিভ মাস্তার। ৱাখল অমসুং নীংশিংবগী অখন্নবা শান্নবা মপুং ফাহনবীয়ু।",
    }
  }
};

export function getVoiceGuidance(lang = 'English') {
  return VOICE_GUIDANCE[lang] || VOICE_GUIDANCE['English'];
}
